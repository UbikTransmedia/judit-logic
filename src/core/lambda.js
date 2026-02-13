import { Binary, Atom, Unary, Modal, Quantifier } from './logic.js';

/**
 * Lambda Calculus and Type Inference (Curry-Howard Isomorphism)
 */

export class Type {
    constructor(type) {
        this.type = type;
    }

    toString() {
        return this.type;
    }
}

export class TypeVar extends Type {
    constructor(name) {
        super('var');
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

export class FunctionType extends Type {
    constructor(from, to) {
        super('function');
        this.from = from;
        this.to = to;
    }

    toString() {
        return `(${this.from.toString()} → ${this.to.toString()})`;
    }
}

export class ProductType extends Type {
    constructor(left, right) {
        super('product');
        this.left = left;
        this.right = right;
    }

    toString() {
        return `(${this.left.toString()} × ${this.right.toString()})`;
    }
}

export class SumType extends Type {
    constructor(left, right) {
        super('sum');
        this.left = left;
        this.right = right;
    }

    toString() {
        return `(${this.left.toString()} + ${this.right.toString()})`;
    }
}

export class PolyType extends Type {
    constructor(variable, body) {
        super('poly');
        this.variable = variable; // String
        this.body = body; // Type
    }
    toString() {
        return `∀${this.variable}.${this.body.toString()}`;
    }
}

export class PiType extends Type {
    constructor(variable, domain, range) {
        super('pi');
        this.variable = variable;
        this.domain = domain;
        this.range = range; // Type that may depend on variable
    }
    toString() {
        return `Π${this.variable}:${this.domain.toString()}.${this.range.toString()}`;
    }
}

export class SigmaType extends Type {
    constructor(variable, domain, range) {
        super('sigma');
        this.variable = variable;
        this.domain = domain;
        this.range = range;
    }
    toString() {
        return `Σ${this.variable}:${this.domain.toString()}.${this.range.toString()}`;
    }
}

export class BottomType extends Type {
    constructor() {
        super('bottom');
    }
    toString() {
        return '⊥';
    }
}

export class UnitType extends Type {
    constructor() {
        super('unit');
    }
    toString() {
        return '⊤';
    }
}

export class BoxType extends Type {
    constructor(inner, agent = null) {
        super('box');
        this.inner = inner;
        this.agent = agent;
        this.operator = 'box';
    }
    toString() {
        const ag = this.agent ? `_{${this.agent}}` : '';
        let op = this.operator;
        if (op === 'box') op = '□';
        if (op === 'diamond') op = '◊';
        return `${op}${ag}${this.inner.toString()}`;
    }
}

export class DiamondType extends Type {
    constructor(inner, agent = null) {
        super('diamond');
        this.inner = inner;
        this.agent = agent;
        this.operator = 'diamond';
    }
    toString() {
        const ag = this.agent ? `_{${this.agent}}` : '';
        let op = this.operator;
        if (op === 'box') op = '□';
        if (op === 'diamond') op = '◊';
        return `${op}${ag}${this.inner.toString()}`;
    }
}

export class LambdaTerm {
    constructor(type) {
        this.type = type;
    }

    toString() {
        return `[term:${this.type}]`;
    }
}

export class Var extends LambdaTerm {
    constructor(name) {
        super('var');
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

export class Abs extends LambdaTerm {
    constructor(param, body, paramType = null) {
        super('abs');
        this.param = param;
        this.body = body;
        this.paramType = paramType; // Type object
    }

    toString() {
        const typeStr = this.paramType ? `:${this.paramType.toString()}` : '';
        return `λ${this.param}${typeStr}.${this.body.toString()}`;
    }
}

export class App extends LambdaTerm {
    constructor(left, right) {
        super('app');
        this.left = left;
        this.right = right;
    }

    toString() {
        return `(${this.left.toString()} ${this.right.toString()})`;
    }
}

export class Pair extends LambdaTerm {
    constructor(left, right) {
        super('pair');
        this.left = left;
        this.right = right;
    }

    toString() {
        return `⟨${this.left.toString()}, ${this.right.toString()}⟩`;
    }
}

export class Fst extends LambdaTerm {
    constructor(term) {
        super('fst');
        this.term = term;
    }

    toString() {
        return `fst(${this.term.toString()})`;
    }
}

export class Snd extends LambdaTerm {
    constructor(term) {
        super('snd');
        this.term = term;
    }

    toString() {
        return `snd(${this.term.toString()})`;
    }
}

export class Inl extends LambdaTerm {
    constructor(term) {
        super('inl');
        this.term = term;
    }

    toString() {
        return `inl(${this.term.toString()})`;
    }
}

export class Inr extends LambdaTerm {
    constructor(term) {
        super('inr');
        this.term = term;
    }

    toString() {
        return `inr(${this.term.toString()})`;
    }
}

export class Case extends LambdaTerm {
    constructor(term, varL, bodyL, varR, bodyR) {
        super('case');
        this.term = term;
        this.varL = varL;
        this.bodyL = bodyL;
        this.varR = varR;
        this.bodyR = bodyR;
    }

    toString() {
        return `case ${this.term.toString()} of { ${this.varL}.${this.bodyL.toString()}; ${this.varR}.${this.bodyR.toString()} }`;
    }
}

export class TypeAbs extends LambdaTerm {
    constructor(param, body) {
        super('type-abs');
        this.param = param; // Type variable name
        this.body = body; // LambdaTerm
    }
    toString() {
        return `Λ${this.param}.${this.body.toString()}`;
    }
}

export class TypeApp extends LambdaTerm {
    constructor(term, typeArg) {
        super('type-app');
        this.term = term;
        this.typeArg = typeArg;
    }
    toString() {
        return `${this.term.toString()}[${this.typeArg.toString()}]`;
    }
}

export class DepPair extends LambdaTerm {
    constructor(left, right, sigmaType) {
        super('dep-pair');
        this.left = left;
        this.right = right;
        this.sigmaType = sigmaType;
    }
    toString() {
        return `( ${this.left.toString()}, ${this.right.toString()} )`;
    }
}

export class LambdaEngine {
    constructor() {
        this.typeVarCount = 0;
    }

    getNextTypeVar() {
        return `T${++this.typeVarCount}`;
    }

    applySubst(subst, type) {
        if (type instanceof TypeVar) {
            if (subst.has(type.name)) {
                return this.applySubst(subst, subst.get(type.name));
            }
            return type;
        }
        if (type instanceof FunctionType) {
            return new FunctionType(this.applySubst(subst, type.from), this.applySubst(subst, type.to));
        }
        if (type instanceof ProductType) {
            return new ProductType(this.applySubst(subst, type.left), this.applySubst(subst, type.right));
        }
        if (type instanceof SumType) {
            return new SumType(this.applySubst(subst, type.left), this.applySubst(subst, type.right));
        }
        if (type instanceof PolyType) {
            // Avoid capturing the bound variable
            const newSubst = new Map(subst);
            newSubst.delete(type.variable);
            return new PolyType(type.variable, this.applySubst(newSubst, type.body));
        }
        if (type instanceof PiType) {
            const newSubst = new Map(subst);
            newSubst.delete(type.variable);
            return new PiType(type.variable, this.applySubst(subst, type.domain), this.applySubst(newSubst, type.range));
        }
        if (type instanceof SigmaType) {
            const newSubst = new Map(subst);
            newSubst.delete(type.variable);
            return new SigmaType(type.variable, this.applySubst(subst, type.domain), this.applySubst(newSubst, type.range));
        }
        if (type instanceof BoxType) {
            return new BoxType(this.applySubst(subst, type.inner), type.agent);
        }
        if (type instanceof DiamondType) {
            return new DiamondType(this.applySubst(subst, type.inner), type.agent);
        }
        if (type instanceof BottomType || type instanceof UnitType) return type;
        return type;
    }

    applySubstToEnv(subst, env) {
        const newEnv = new Map();
        for (const [name, type] of env.entries()) {
            newEnv.set(name, this.applySubst(subst, type));
        }
        return newEnv;
    }

    composeSubst(s1, s2) {
        const newSubst = new Map(s2);
        for (const [name, type] of s1.entries()) {
            newSubst.set(name, this.applySubst(s2, type));
        }
        return newSubst;
    }

    occursCheck(v, type) {
        if (type instanceof TypeVar) return v.name === type.name;
        if (type instanceof FunctionType) return this.occursCheck(v, type.from) || this.occursCheck(v, type.to);
        if (type instanceof ProductType) return this.occursCheck(v, type.left) || this.occursCheck(v, type.right);
        if (type instanceof SumType) return this.occursCheck(v, type.left) || this.occursCheck(v, type.right);
        if (type instanceof PolyType) return this.occursCheck(v, type.body);
        return false;
    }

    unify(t1, t2, rigidVars = new Set()) {
        if (t1 instanceof TypeVar && t2 instanceof TypeVar && t1.name === t2.name) return new Map();

        if (t1 instanceof TypeVar && !rigidVars.has(t1.name)) {
            if (this.occursCheck(t1, t2)) throw new Error(`Occurs check failed: ${t1.name} in ${t2.toString()}`);
            return new Map([[t1.name, t2]]);
        }
        if (t2 instanceof TypeVar && !rigidVars.has(t2.name)) {
            return this.unify(t2, t1, rigidVars);
        }

        if (t1 instanceof TypeVar || t2 instanceof TypeVar) {
            if (t1.toString() === t2.toString()) return new Map();
            throw new Error(`Type mismatch involving rigid variable: ${t1.toString()} vs ${t2.toString()}`);
        }

        if (t1 instanceof FunctionType && t2 instanceof FunctionType) {
            const s1 = this.unify(t1.from, t2.from, rigidVars);
            const s2 = this.unify(this.applySubst(s1, t1.to), this.applySubst(s1, t2.to), rigidVars);
            return this.composeSubst(s1, s2);
        }
        if (t1 instanceof ProductType && t2 instanceof ProductType) {
            const s1 = this.unify(t1.left, t2.left, rigidVars);
            const s2 = this.unify(this.applySubst(s1, t1.right), this.applySubst(s1, t2.right), rigidVars);
            return this.composeSubst(s1, s2);
        }
        if (t1 instanceof SumType && t2 instanceof SumType) {
            const s1 = this.unify(t1.left, t2.left, rigidVars);
            const s2 = this.unify(this.applySubst(s1, t1.right), this.applySubst(s1, t2.right), rigidVars);
            return this.composeSubst(s1, s2);
        }
        if (t1.constructor === t2.constructor && t1.toString() === t2.toString()) return new Map();
        throw new Error(`Type mismatch: ${t1.toString()} vs ${t2.toString()}`);
    }

    substituteType(varName, typeArg, body) {
        if (body instanceof TypeVar) return body.name === varName ? typeArg : body;
        if (body instanceof FunctionType) return new FunctionType(this.substituteType(varName, typeArg, body.from), this.substituteType(varName, typeArg, body.to));
        if (body instanceof ProductType) return new ProductType(this.substituteType(varName, typeArg, body.left), this.substituteType(varName, typeArg, body.right));
        if (body instanceof SumType) return new SumType(this.substituteType(varName, typeArg, body.left), this.substituteType(varName, typeArg, body.right));
        if (body instanceof PolyType) {
            if (body.variable === varName) return body;
            return new PolyType(body.variable, this.substituteType(varName, typeArg, body.body));
        }
        return body;
    }

    inferType(env, term, rigidVars = new Set()) {
        if (term instanceof Var) {
            if (!env.has(term.name)) {
                throw new Error(`Variable ${term.name} is not in scope.`);
            }
            const type = env.get(term.name);
            return { type, subst: new Map(), derivation: { rule: 'Ax', context: new Map(env), term: term.toString(), type, premises: [] } };
        }

        if (term instanceof Abs) {
            const argType = term.paramType || new TypeVar(this.getNextTypeVar());
            const newEnv = new Map(env);
            newEnv.set(term.param, argType);
            const { type: bodyType, subst, derivation: dBody } = this.inferType(newEnv, term.body, rigidVars);
            const finalType = new FunctionType(argType, bodyType);
            return { type: finalType, subst, derivation: { rule: '→I', context: new Map(env), term: term.toString(), type: finalType, premises: [dBody] } };
        }

        if (term instanceof App) {
            const { type: t1, subst: s1, derivation: dLeft } = this.inferType(env, term.left, rigidVars);
            const { type: t2, subst: s2, derivation: dRight } = this.inferType(this.applySubstToEnv(s1, env), term.right, rigidVars);
            const resType = new TypeVar(this.getNextTypeVar());
            const s3 = this.unify(this.applySubst(s2, t1), new FunctionType(t2, resType), rigidVars);
            const finalSubst = this.composeSubst(s3, this.composeSubst(s2, s1));
            return { type: this.applySubst(finalSubst, resType), subst: finalSubst, derivation: { rule: '→E', context: new Map(env), term: term.toString(), type: resType, premises: [dLeft, dRight] } };
        }

        if (term instanceof TypeAbs) {
            const newRigid = new Set(rigidVars);
            newRigid.add(term.param);
            const { type: bodyT, subst, derivation: dBody } = this.inferType(env, term.body, newRigid);
            const finalType = new PolyType(term.param, bodyT);
            return { type: finalType, subst, derivation: { rule: '∀I', context: new Map(env), term: term.toString(), type: finalType, premises: [dBody] } };
        }

        if (term instanceof TypeApp) {
            const { type: poly, subst, derivation: dTerm } = this.inferType(env, term.term, rigidVars);
            if (!(poly instanceof PolyType)) throw new Error("Expected PolyType");
            const finalType = this.substituteType(poly.variable, term.typeArg, poly.body);
            return { type: finalType, subst, derivation: { rule: '∀E', context: new Map(env), term: term.toString(), type: finalType, premises: [dTerm] } };
        }

        if (term instanceof Pair) {
            const { type: t1, subst: s1, derivation: dLeft } = this.inferType(env, term.left, rigidVars);
            const { type: t2, subst: s2, derivation: dRight } = this.inferType(this.applySubstToEnv(s1, env), term.right, rigidVars);
            const finalType = new ProductType(this.applySubst(s2, t1), t2);
            return { type: finalType, subst: this.composeSubst(s2, s1), derivation: { rule: '∧I', context: new Map(env), term: term.toString(), type: finalType, premises: [dLeft, dRight] } };
        }

        if (term instanceof Fst) {
            const { type: t, subst: s, derivation: dTerm } = this.inferType(env, term.term, rigidVars);
            const p1 = new TypeVar(this.getNextTypeVar());
            const p2 = new TypeVar(this.getNextTypeVar());
            const s2 = this.unify(t, new ProductType(p1, p2), rigidVars);
            const finalSubst = this.composeSubst(s2, s);
            return { type: this.applySubst(finalSubst, p1), subst: finalSubst, derivation: { rule: '∧E1', context: new Map(env), term: term.toString(), type: p1, premises: [dTerm] } };
        }

        if (term instanceof Snd) {
            const { type: t, subst: s, derivation: dTerm } = this.inferType(env, term.term, rigidVars);
            const p1 = new TypeVar(this.getNextTypeVar());
            const p2 = new TypeVar(this.getNextTypeVar());
            const s2 = this.unify(t, new ProductType(p1, p2), rigidVars);
            const finalSubst = this.composeSubst(s2, s);
            return { type: this.applySubst(finalSubst, p2), subst: finalSubst, derivation: { rule: '∧E2', context: new Map(env), term: term.toString(), type: p2, premises: [dTerm] } };
        }

        if (term instanceof Inl) {
            const { type: t, subst: s, derivation: dTerm } = this.inferType(env, term.term, rigidVars);
            const rightType = new TypeVar(this.getNextTypeVar());
            const finalType = new SumType(t, rightType);
            return { type: finalType, subst: s, derivation: { rule: '∨I1', context: new Map(env), term: term.toString(), type: finalType, premises: [dTerm] } };
        }

        if (term instanceof Inr) {
            const { type: t, subst: s, derivation: dTerm } = this.inferType(env, term.term, rigidVars);
            const leftType = new TypeVar(this.getNextTypeVar());
            const finalType = new SumType(leftType, t);
            return { type: finalType, subst: s, derivation: { rule: '∨I2', context: new Map(env), term: term.toString(), type: finalType, premises: [dTerm] } };
        }

        if (term instanceof Case) {
            const { type: t, subst: s1, derivation: dTerm } = this.inferType(env, term.term, rigidVars);
            const sumType = new SumType(new TypeVar(this.getNextTypeVar()), new TypeVar(this.getNextTypeVar()));
            const s2 = this.unify(t, sumType, rigidVars);
            const newEnvL = this.applySubstToEnv(s2, env);
            newEnvL.set(term.varL, this.applySubst(s2, sumType.left));
            const { type: tL, subst: s3, derivation: dBodyL } = this.inferType(newEnvL, term.bodyL, rigidVars);
            const newEnvR = this.applySubstToEnv(this.composeSubst(s3, s1), env);
            newEnvR.set(term.varR, this.applySubst(this.composeSubst(s3, s1), sumType.right));
            const { type: tR, subst: s4, derivation: dBodyR } = this.inferType(newEnvR, term.bodyR, rigidVars);
            const resType = new TypeVar(this.getNextTypeVar());
            const s5 = this.unify(this.applySubst(s4, tL), resType, rigidVars);
            const s6 = this.unify(this.applySubst(s5, this.applySubst(s4, tR)), resType, rigidVars);
            const finalSubst = this.composeSubst(s6, this.composeSubst(s5, this.composeSubst(s4, this.composeSubst(s3, s2))));
            return { type: this.applySubst(finalSubst, resType), subst: finalSubst, derivation: { rule: '∨E', context: new Map(env), term: term.toString(), type: resType, premises: [dTerm, dBodyL, dBodyR] } };
        }

        throw new Error("Unknown term type");
    }

    typeToFormula(type, subst) {
        const atomMapping = { 'T1': 'p', 'T2': 'q', 'T3': 'r', 'T4': 's' };
        const apply = (t) => {
            if (t instanceof TypeVar) {
                if (subst.has(t.name)) return apply(subst.get(t.name));
                return new Atom(atomMapping[t.name] || t.name.replace('T', 'p'));
            }
            if (t instanceof FunctionType) {
                const from = apply(t.from);
                const to = apply(t.to);
                if (t.to instanceof BottomType) return new Unary('¬', from);
                return new Binary('→', from, to);
            }
            if (t instanceof ProductType) {
                const l = apply(t.left);
                const r = apply(t.right);
                // Heuristic for biconditional
                if (t.left instanceof FunctionType && t.right instanceof FunctionType &&
                    t.left.from.toString() === t.right.to.toString() &&
                    t.left.to.toString() === t.right.from.toString()) {
                    return new Binary('↔', apply(t.left.from), apply(t.left.to));
                }
                return new Binary('∧', l, r);
            }
            if (t instanceof SumType) return new Binary('∨', apply(t.left), apply(t.right));
            if (t instanceof PolyType) return new Quantifier('∀', t.variable, apply(t.body));
            if (t instanceof PiType) return new Quantifier('∀', t.variable, apply(t.range)); // Simplified
            if (t instanceof SigmaType) return new Quantifier('∃', t.variable, apply(t.range)); // Simplified
            if (t instanceof BoxType) return new Modal('□', apply(t.inner), t.agent);
            if (t instanceof DiamondType) return new Modal('◊', apply(t.inner), t.agent);
            if (t instanceof BottomType) return new Atom('⊥');
            if (t instanceof UnitType) return new Atom('⊤');
            return new Atom(t.toString());
        };
        return apply(type);
    }

    parse(input) {
        const tokens = input
            .replace(/\\/g, ' \\ ').replace(/λ/g, ' \\ ').replace(/Λ/g, ' Λ ')
            .replace(/\./g, ' . ').replace(/\(/g, ' ( ').replace(/\)/g, ' ) ')
            .replace(/\[/g, ' [ ').replace(/\]/g, ' ] ')
            .replace(/,/g, ' , ').replace(/⟨/g, ' ⟨ ').replace(/⟩/g, ' ⟩ ')
            .replace(/:/g, ' : ').replace(/->/g, ' -> ').replace(/→/g, ' -> ')
            .split(/\s+/).filter(t => t.length > 0);

        let pos = 0;
        const parseTerm = () => {
            let term = parseAtom();
            if (!term) return null;
            while (pos < tokens.length && ![')', '⟩', '}', ';', 'of', ',', ']', ':'].includes(tokens[pos])) {
                const next = parseAtom();
                if (next) term = new App(term, next);
                else break;
            }
            return term;
        };

        const parseAtom = () => {
            if (pos >= tokens.length) return null;
            const token = tokens[pos++];
            let term = null;

            if (token === '\\') {
                const params = [];
                while (pos < tokens.length && tokens[pos] !== '.') {
                    let p = tokens[pos++];
                    let pType = null;
                    if (tokens[pos] === ':') {
                        pos++; // consume :
                        pType = parseType();
                    }
                    params.push({ name: p, type: pType });
                }
                if (tokens[pos] === '.') pos++;
                let body = parseTerm();
                for (let i = params.length - 1; i >= 0; i--) {
                    body = new Abs(params[i].name, body, params[i].type);
                }
                term = body;
            } else if (token === 'Λ') {
                const param = tokens[pos++];
                if (tokens[pos] === '.') pos++;
                term = new TypeAbs(param, parseTerm());
            } else if (token === '(') {
                term = parseTerm();
                if (tokens[pos] === ')') pos++;
            } else if (token === '⟨') {
                const left = parseTerm();
                if (tokens[pos] === ',') pos++;
                const right = parseTerm();
                if (tokens[pos] === '⟩') pos++;
                term = new Pair(left, right);
            } else if (token === 'fst') term = new Fst(parseAtom());
            else if (token === 'snd') term = new Snd(parseAtom());
            else if (token === 'inl') term = new Inl(parseAtom());
            else if (token === 'inr') term = new Inr(parseAtom());
            else if (['case', 'of', '{', '}', ';', '.', ',', '(', ')', '[', ']', ':', '∀', 'Π', 'Σ'].includes(token)) {
                pos--;
                return null;
            } else {
                term = new Var(token);
            }

            // Correctly handle type application for any atom
            while (pos < tokens.length && tokens[pos] === '[') {
                pos++;
                const typeArg = parseType();
                if (tokens[pos] === ']') pos++;
                term = new TypeApp(term, typeArg);
            }
            return term;
        };
        const parseType = () => {
            let left = parseTypeAtom();
            if (tokens[pos] === '->') {
                pos++;
                return new FunctionType(left, parseType());
            }
            return left;
        };

        const parseTypeAtom = () => {
            const token = tokens[pos++];
            if (token === '(') {
                const t = parseType();
                if (tokens[pos] === ')') pos++;
                return t;
            }
            return new TypeVar(token);
        };

        return parseTerm();
    }

    check(lambdaStr) {
        try {
            this.typeVarCount = 0;
            const term = this.parse(lambdaStr);
            const { type, subst, derivation } = this.inferType(new Map(), term);
            const finalize = (node) => {
                const nodeType = this.applySubst(subst, node.type);
                node.type = this.typeToFormula(nodeType, subst).toString();
                node.context_list = Array.from(node.context.entries()).map(([k, v]) => `${k}:${this.typeToFormula(this.applySubst(subst, v), subst).toString()}`);
                node.premises.forEach(finalize);
                delete node.context;
            };
            finalize(derivation);
            return { valid: true, type: this.typeToFormula(this.applySubst(subst, type), subst), derivation };
        } catch (err) { return { valid: false, error: err.message }; }
    }

    synthesize(formula, maxDepth = 15) {
        const type = this.formulaToType(formula);
        const term = this.proofSearch([], type, new Set(), 0, maxDepth);
        if (!term) throw new Error("No constructive proof found.");
        return term;
    }


    formulaToType(f) {
        if (!f) throw new Error("Null formula");
        const type = f.type || 'unknown';

        if (type === 'atom') return new TypeVar(f.name);

        if (type === 'constant') {
            return f.value === false ? new BottomType() : new UnitType();
        }

        if (type === 'unary') {
            const op = (f.operator || '').trim();
            if (['¬', '!', '~'].includes(op)) {
                return new FunctionType(this.formulaToType(f.operand), new BottomType());
            }
            // Temporal logic aliases (sometimes parsed as unary)
            if (['G', '□', '[]'].includes(op)) return new BoxType(this.formulaToType(f.operand));
            if (['F', '◊', '<>', '⋄'].includes(op)) return new DiamondType(this.formulaToType(f.operand));
            if (['X', '○'].includes(op)) return new BoxType(this.formulaToType(f.operand));
        }

        if (type === 'binary') {
            const op = (f.operator || '').trim();
            if (['→', '->', '=>'].includes(op)) return new FunctionType(this.formulaToType(f.left), this.formulaToType(f.right));
            if (['∧', '&', '&&'].includes(op)) return new ProductType(this.formulaToType(f.left), this.formulaToType(f.right));
            if (['∨', '|', '||'].includes(op)) return new SumType(this.formulaToType(f.left), this.formulaToType(f.right));
            if (['↔', '<->', '<=>'].includes(op)) {
                const l = this.formulaToType(f.left);
                const r = this.formulaToType(f.right);
                return new ProductType(new FunctionType(l, r), new FunctionType(r, l));
            }
        }

        if (type === 'modal') {
            const op = (f.operator || '').trim();
            // Robust check for Box / Always / Next
            if (['□', '[]', 'G', 'L', 'box', 'Box', 'X', '○', 'next', 'Next'].includes(op)) {
                return new BoxType(this.formulaToType(f.operand), f.agent);
            }
            // Robust check for Diamond / Eventually
            if (['◊', '<>', '⋄', 'F', 'M', 'diamond', 'Diamond'].includes(op)) {
                return new DiamondType(this.formulaToType(f.operand), f.agent);
            }
        }

        if (type === 'quantifier') {
            const op = (f.operator || '').trim();
            if (op === '∀') return new PolyType(f.variable, this.formulaToType(f.operand));
            if (op === '∃') return new SigmaType(f.variable, new TypeVar('Domain'), this.formulaToType(f.operand));
        }

        const opCodes = f.operator ? Array.from(f.operator).map(c => c.charCodeAt(0)).join(',') : 'none';
        throw new Error(`Formula outside supported fragment: ${f.toString()} (Type: ${type}, Op: ${f.operator}, Codes: ${opCodes})`);
    }

    proofSearch(context, goal, usedNames, depth = 0, maxDepth = 25) {
        if (depth > maxDepth) return null; // Avoid infinite recursion


        if (goal instanceof FunctionType) {
            const name = this.getFreshName(usedNames);
            const body = this.proofSearch([...context, { name, type: goal.from }], goal.to, new Set([...usedNames, name]), depth + 1, maxDepth);
            return body ? new Abs(name, body) : null;
        }
        if (goal instanceof ProductType) {
            const l = this.proofSearch(context, goal.left, usedNames, depth + 1, maxDepth);
            const r = this.proofSearch(context, goal.right, usedNames, depth + 1, maxDepth);
            return (l && r) ? new Pair(l, r) : null;
        }
        if (goal instanceof SumType) {
            const l = this.proofSearch(context, goal.left, usedNames, depth + 1, maxDepth);
            if (l) return new Inl(l);
            const r = this.proofSearch(context, goal.right, usedNames, depth + 1, maxDepth);
            if (r) return new Inr(r);
        }
        if (goal instanceof PolyType) {
            const body = this.proofSearch(context, goal.body, usedNames, depth + 1, maxDepth);
            return body ? new TypeAbs(goal.variable, body) : null;
        }

        // Backchaining search through context
        for (const entry of context) {
            const res = this.backchain(context, new Var(entry.name), entry.type, goal, usedNames, depth, maxDepth);
            if (res) return res;
        }
        return null;
    }

    backchain(context, term, type, goal, usedNames, depth, maxDepth) {
        const goalStr = goal.toString();
        if (type.toString() === goalStr) return term;

        if (type instanceof ProductType) {
            return this.backchain(context, new Fst(term), type.left, goal, usedNames, depth, maxDepth) ||
                this.backchain(context, new Snd(term), type.right, goal, usedNames, depth, maxDepth);
        }


        if (type instanceof FunctionType) {
            // Only try to solve for arguments if the function's return type could eventually match the goal
            if (this.couldReachGoal(type.to, goalStr)) {
                // To avoid loops, we don't allow proofSearch of arguments to exceed a certain depth
                const argTerm = this.proofSearch(context, type.from, usedNames, depth + 1, maxDepth);
                if (argTerm) {
                    return this.backchain(context, new App(term, argTerm), type.to, goal, usedNames, depth, maxDepth);
                }

            }
        }
        return null;
    }

    couldReachGoal(type, goalStr) {
        if (type.toString() === goalStr) return true;
        if (type instanceof ProductType) return this.couldReachGoal(type.left, goalStr) || this.couldReachGoal(type.right, goalStr);
        if (type instanceof FunctionType) return this.couldReachGoal(type.to, goalStr);
        return false;
    }


    getFreshName(used) {
        const names = 'xyzpqrstuvw'.split('');
        for (const n of names) if (!used.has(n)) return n;
        let i = 1; while (used.has(`x${i}`)) i++; return `x${i}`;
    }
}
