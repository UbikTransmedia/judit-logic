import { BDDManager } from './bdd.js';
import { Atom, Unary, Binary, CTLUnary, CTLBinary } from './logic.js';

/**
 * Symbolic Model Checker using BDDs.
 * Maps states to bit-vectors and evaluates CTL formulas symbolically.
 */
export class SymbolicModelChecker {
    constructor(model) {
        this.model = model;
        this.mgr = new BDDManager();
        this.worlds = Array.from(model.worlds.values());
        this.numBits = Math.ceil(Math.log2(Math.max(this.worlds.length, 1)));

        // Variable names for current state bits (s0, s1, ...) and next state bits (s'0, s'1, ...)
        this.sVars = Array.from({ length: this.numBits }, (_, i) => `s${i}`);
        this.spVars = Array.from({ length: this.numBits }, (_, i) => `sp${i}`);

        // Encoding: world index -> BDD
        this.worldToBdd = new Map();
        this.worlds.forEach((w, i) => {
            this.worldToBdd.set(w.id, this._encodeIndex(i, this.sVars));
        });

        // Transition Relation BDD: R(s, s')
        this.transitionBdd = this._computeTransitionRelation();
    }

    _encodeIndex(index, vars) {
        let res = this.mgr.TRUE;
        for (let i = 0; i < this.numBits; i++) {
            const bit = (index >> i) & 1;
            const v = this.mgr.var(vars[i]);
            res = this.mgr.and(res, bit ? v : this.mgr.not(v));
        }
        return res;
    }

    _computeTransitionRelation() {
        let r = this.mgr.FALSE;
        for (const rel of this.model.relations) {
            const srcIdx = this.worlds.findIndex(w => w.id === rel.sourceId);
            const dstIdx = this.worlds.findIndex(w => w.id === rel.targetId);
            if (srcIdx === -1 || dstIdx === -1) continue;

            const srcBdd = this._encodeIndex(srcIdx, this.sVars);
            const dstBdd = this._encodeIndex(dstIdx, this.spVars);
            r = this.mgr.or(r, this.mgr.and(srcBdd, dstBdd));
        }
        return r;
    }

    // Symbolic Set of worlds where atom is true
    _atomToBdd(atomName) {
        let res = this.mgr.FALSE;
        this.worlds.forEach((w, i) => {
            if (w.valuation.get(atomName) === true) {
                res = this.mgr.or(res, this.worldToBdd.get(w.id));
            }
        });
        return res;
    }

    compute(formula) {
        if (formula instanceof Atom) return this._atomToBdd(formula.name);
        if (formula instanceof Unary && formula.operator === '¬') return this.mgr.not(this.compute(formula.operand));
        if (formula instanceof Binary) {
            if (formula.operator === '∧') return this.mgr.and(this.compute(formula.left), this.compute(formula.right));
            if (formula.operator === '∨') return this.mgr.or(this.compute(formula.left), this.compute(formula.right));
            if (formula.operator === '→' || formula.operator === '->' || formula.operator === '=>') return this.mgr.imp(this.compute(formula.left), this.compute(formula.right));
            if (formula.operator === '↔' || formula.operator === '<->' || formula.operator === '<=>') {
                const l = this.compute(formula.left);
                const r = this.compute(formula.right);
                return this.mgr.and(this.mgr.imp(l, r), this.mgr.imp(r, l));
            }
        }

        if (formula instanceof CTLUnary) {
            const phi = this.compute(formula.operand);
            switch (formula.operator) {
                case 'EX': return this.EX(phi);
                case 'EF': return this.EF(phi);
                case 'EG': return this.EG(phi);
                case 'AX': return this.mgr.not(this.EX(this.mgr.not(phi)));
                case 'AF': return this.mgr.not(this.EG(this.mgr.not(phi)));
                case 'AG': return this.mgr.not(this.EF(this.mgr.not(phi)));
            }
        }

        if (formula instanceof CTLBinary) {
            const p = this.compute(formula.left);
            const q = this.compute(formula.right);
            if (formula.operator === 'EU') return this.EU(p, q);
            if (formula.operator === 'AU') {
                // AU(p, q) = !EU(!q, !p & !q) & !EG(!q)
                const notQ = this.mgr.not(q);
                const notPandNotQ = this.mgr.and(this.mgr.not(p), notQ);
                return this.mgr.and(this.mgr.not(this.EU(notQ, notPandNotQ)), this.mgr.not(this.EG(notQ)));
            }
        }

        return this.mgr.FALSE;
    }

    EX(phi) {
        // EX(phi) = exists s'. R(s, s') AND phi(s')
        // 1. Rename phi(s) to phi(s')
        let phiSp = phi;
        for (let i = 0; i < this.numBits; i++) {
            // Replace s_i with sp_i in phi
            // Simplified: compute exists s_i. (s_i <-> sp_i) AND phi
            // In a better BDD manager we'd have a 'swap' or 'rename' operation.
            // Here we use quantification and conjunction for renaming
            const swap = this.mgr.or(
                this.mgr.and(this.mgr.var(this.sVars[i]), this.mgr.var(this.spVars[i])),
                this.mgr.and(this.mgr.not(this.mgr.var(this.sVars[i])), this.mgr.not(this.mgr.var(this.spVars[i])))
            );
            phiSp = this.mgr.exists(this.sVars[i], this.mgr.and(phiSp, swap));
        }

        // 2. Compute exists s'. R(s, s') AND phi(s')
        let res = this.mgr.and(this.transitionBdd, phiSp);
        for (let i = 0; i < this.numBits; i++) {
            res = this.mgr.exists(this.spVars[i], res);
        }
        return res;
    }

    EF(phi) {
        // Least fixed point: Y = phi OR EX(Y)
        let oldY = this.mgr.FALSE;
        let newY = phi;
        while (oldY !== newY) {
            oldY = newY;
            newY = this.mgr.or(phi, this.EX(oldY));
        }
        return newY;
    }

    EG(phi) {
        // Greatest fixed point: Y = phi AND EX(Y)
        let oldY = this.mgr.FALSE;
        let newY = phi;
        while (oldY !== newY) {
            oldY = newY;
            newY = this.mgr.and(phi, this.EX(oldY));
        }
        return newY;
    }

    EU(p, q) {
        // Least fixed point: Y = q OR (p AND EX(Y))
        let oldY = this.mgr.FALSE;
        let newY = q;
        while (oldY !== newY) {
            oldY = newY;
            newY = this.mgr.or(q, this.mgr.and(p, this.EX(oldY)));
        }
        return newY;
    }
}
