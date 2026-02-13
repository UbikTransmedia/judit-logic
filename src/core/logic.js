
/**
 * Core Logic Implementation for LogosCanvas
 */

// --- Formula Hierarchy ---

export class Formula {
    constructor(type) {
        this.type = type;
    }

    toString() {
        throw new Error("Method 'toString()' must be implemented.");
    }


    // Return a new formula with variable x replaced by term t
    substitute(x, t) {
        throw new Error("Method 'substitute()' must be implemented.");
    }

    // Gödel-McKinsey-Tarski translation to S4
    translateToS4() {
        throw new Error("Method 'translateToS4()' must be implemented.");
    }
}

export class Atom extends Formula {
    constructor(name) {
        super('atom');
        this.name = name;
    }

    toString() {
        return this.name;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        if (system === 'Int') {
            return this.translateToS4().evaluate(model, world, assignment, 'S4');
        }
        const val = world.valuation.get(this.name);
        if (system.startsWith('Fuzzy')) {
            return (typeof val === 'number') ? val : (val === true ? 1.0 : 0.0);
        }
        return val === true;
    }

    substitute(x, t) {
        if (this.name === x) return t;
        return this;
    }

    translateToS4() {
        // T(p) = □p
        return new Modal('□', this);
    }
}

export class Unary extends Formula {
    constructor(operator, operand) {
        super('unary');
        this.operator = operator;
        this.operand = operand;
    }

    toString() {
        return `${this.operator}${this.operand.toString()}`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        if (system === 'Int') {
            return this.translateToS4().evaluate(model, world, assignment, 'S4');
        }
        if (this.operator === '¬') {
            const val = this.operand.evaluate(model, world, assignment, system);
            if (system.startsWith('Fuzzy')) {
                return 1.0 - val;
            }
            return !val;
        }
        throw new Error(`Unknown unary operator: ${this.operator}`);
    }

    substitute(x, t) {
        return new Unary(this.operator, this.operand.substitute(x, t));
    }

    translateToS4() {
        // T(¬A) = □(¬T(A))
        if (this.operator === '¬') {
            return new Modal('□', new Unary('¬', this.operand.translateToS4()));
        }
        // Other unary? For now only ¬.
        return new Unary(this.operator, this.operand.translateToS4());
    }
}

export class Binary extends Formula {
    constructor(operator, left, right) {
        super('binary');
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    toString() {
        return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        if (system === 'Int') {
            return this.translateToS4().evaluate(model, world, assignment, 'S4');
        }
        const l = this.left.evaluate(model, world, assignment, system);
        const r = this.right.evaluate(model, world, assignment, system);

        if (system.startsWith('Fuzzy')) {
            switch (this.operator) {
                case '∧': return Math.min(l, r);
                case '∨': return Math.max(l, r);
                case '→': return l <= r ? 1.0 : r; // Gödel implication
                case '↔': return Math.min(l <= r ? 1.0 : r, r <= l ? 1.0 : l);
                default: throw new Error(`Unknown binary operator: ${this.operator}`);
            }
        }

        switch (this.operator) {
            case '∧': return l && r;
            case '∨': return l || r;
            case '→': return !l || r;
            case '↔': return l === r;
            default: throw new Error(`Unknown binary operator: ${this.operator}`);
        }
    }

    substitute(x, t) {
        return new Binary(this.operator, this.left.substitute(x, t), this.right.substitute(x, t));
    }

    translateToS4() {
        const l = this.left.translateToS4();
        const r = this.right.translateToS4();

        // T(A -> B) = □(T(A) -> T(B))
        if (this.operator === '→') {
            return new Modal('□', new Binary('→', l, r));
        }
        // T(A & B) = T(A) & T(B) -> Homomorphism
        // T(A v B) = T(A) v T(B) -> Homomorphism
        return new Binary(this.operator, l, r);
    }
}

export class Constant extends Formula {
    constructor(value) {
        super('constant');
        this.value = value; // true or false
    }

    toString() {
        return this.value ? '⊤' : '⊥';
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        return this.value;
    }

    substitute(x, t) {
        return this;
    }

    translateToS4() {
        // Constants usually map to themselves, or Boxed?
        // T(⊥) = ⊥, T(⊤) = ⊤. No need for Box usually as they are absolute?
        // Let's assume □⊥ <-> ⊥ in S4.
        return this;
    }
}

export class Modal extends Formula {
    constructor(operator, operand, agent = null) {
        super('modal');
        this.operator = operator;
        this.operand = operand;
        this.agent = agent;
    }

    toString() {
        if (this.agent && /^[0-9]+$/.test(this.agent)) {
            // Numerical agent: [n] or <n>
            const open = this.operator === '□' ? '[' : '<';
            const close = this.operator === '□' ? ']' : '>';
            return `${open}${this.agent}${close}${this.operand.toString()}`;
        }
        const ag = this.agent ? `_{${this.agent}}` : '';
        return `${this.operator}${ag}${this.operand.toString()}`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        if (system === 'Int') {
            return this.translateToS4().evaluate(model, world, assignment, 'S4');
        }

        // Logic System Specifics for Classical Modal Logic
        // In K, T, S4, S5, the evaluation of Box/Diamond is standard Kripke
        // BUT the model relation might need to be treated differently?
        // - K: Use relations as is
        // - T: Treat relations as Reflexive
        // - S4: Treat as Reflexive + Transitive
        // - S5: Treat as Equivalence

        if (this.operator === 'X') {
            // Next: True in all immediate successors (Standard Modal K Step)
            const accessibleWorlds = model.getAccessibleWorlds(world, this.agent);
            return accessibleWorlds.length > 0 && accessibleWorlds.every(w => this.operand.evaluate(model, w, assignment, system));
        }

        if (this.operator === 'G' || this.operator === 'F') {
            // Temporal: Always/Eventually in the future (Transitive closure)
            const reachable = model.getReachableWorlds(world, this.agent);
            if (this.operator === 'G') {
                return reachable.every(w => this.operand.evaluate(model, w, assignment, system));
            } else {
                return reachable.some(w => this.operand.evaluate(model, w, assignment, system));
            }
        }

        let accessibleWorlds = [];

        if (system === 'S5') {
            // S5: Equivalence Relation (Partition)
            // Accessible worlds are all worlds in the same connected component (undirected)
            accessibleWorlds = model.getComponentWorlds(world, this.agent);
        } else if (system === 'S4') {
            // S4: Reflexive + Transitive
            // Reachable worlds (Transitive closure)
            accessibleWorlds = model.getReachableWorlds(world, this.agent);
            // getReachableWorlds includes startWorld? logic says: reachable.push(startWorld) at line 440.
            // So it is Reflexive implicitly if implemented correctly.
        } else if (system === 'T') {
            // T: Reflexive
            accessibleWorlds = model.getAccessibleWorlds(world, this.agent);
            if (!accessibleWorlds.some(w => w.id === world.id)) {
                accessibleWorlds.push(world);
            }
        } else {
            // K (Default): Explicit relations only
            accessibleWorlds = model.getAccessibleWorlds(world, this.agent);
        }

        if (this.operator === '□') {
            const results = accessibleWorlds.map(w => {
                const inner = this.operand.evaluate(model, w, assignment, system);
                if (system.startsWith('Fuzzy')) {
                    const rel = model.relations.find(r => r.sourceId === world.id && r.targetId === w.id && (this.agent === null || r.agent === this.agent));
                    const weight = rel ? (rel.weight ?? 1.0) : 1.0;
                    // Fuzzy Box: inf (weight -> val)
                    return weight <= inner ? 1.0 : inner;
                }
                return inner;
            });
            if (system.startsWith('Fuzzy')) return results.length > 0 ? Math.min(...results) : 1.0;
            return results.every(v => v);
        } else if (this.operator === '◊') {
            const results = accessibleWorlds.map(w => {
                const inner = this.operand.evaluate(model, w, assignment, system);
                if (system.startsWith('Fuzzy')) {
                    const rel = model.relations.find(r => r.sourceId === world.id && r.targetId === w.id && (this.agent === null || r.agent === this.agent));
                    const weight = rel ? (rel.weight ?? 1.0) : 1.0;
                    // Fuzzy Diamond: sup (weight * val)
                    return Math.min(weight, inner);
                }
                return inner;
            });
            if (system.startsWith('Fuzzy')) return results.length > 0 ? Math.max(...results) : 0.0;
            return results.some(v => v);
        }

        throw new Error(`Unknown modal operator: ${this.operator}`);
    }

    substitute(x, t) {
        return new Modal(this.operator, this.operand.substitute(x, t), this.agent);
    }

    translateToS4() {
        // Intuitonistic Logic usually doesn't have Box/Diamond.
        // But if we mix them? Just homomorphic.
        return new Modal(this.operator, this.operand.translateToS4(), this.agent);
    }
}

// --- FOL Classes ---

export class Term {
    constructor(type) {
        this.type = type;
    }
    toString() { throw new Error("Not implemented"); }
    substitute(x, t) { throw new Error("Not implemented"); }
}

export class Variable extends Term {
    constructor(name) {
        super('variable');
        this.name = name;
    }
    toString() { return this.name; }
    substitute(x, t) {
        return this.name === x ? t : this;
    }
}

export class FunctionalTerm extends Term {
    constructor(name, args) {
        super('function');
        this.name = name;
        this.args = args; // Array of Terms
    }
    toString() {
        return `${this.name}(${this.args.map(a => a.toString()).join(',')})`;
    }
    substitute(x, t) {
        return new FunctionalTerm(this.name, this.args.map(a => a.substitute(x, t)));
    }
}

export class Quantifier extends Formula {
    constructor(operator, variable, operand) {
        super('quantifier');
        this.operator = operator;
        this.variable = variable;
        this.operand = operand;
    }

    toString() {
        return `${this.operator}${this.variable}.${this.operand.toString()}`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        if (system === 'Int') {
            return this.translateToS4().evaluate(model, world, assignment, 'S4');
        }

        // Use world-specific domain if not empty, otherwise fallback to global domain
        const domain = (world.domain && world.domain.size > 0) ? world.domain : model.getDomain();
        if (domain.size === 0) {
            // Standard FOL: Domain must be non-empty.
            return this.operator === '∀';
        }


        if (this.operator === '∀') {
            for (const obj of domain) {
                const newAssignment = { ...assignment, [this.variable]: obj };
                if (!this.operand.evaluate(model, world, newAssignment, system)) return false;
            }
            return true;
        }
        if (this.operator === '∃') {
            for (const obj of domain) {
                const newAssignment = { ...assignment, [this.variable]: obj };
                if (this.operand.evaluate(model, world, newAssignment, system)) return true;
            }
            return false;
        }
        throw new Error("Unknown quantifier");
    }

    substitute(x, t) {
        if (x === this.variable) return this;
        return new Quantifier(this.operator, this.variable, this.operand.substitute(x, t));
    }

    translateToS4() {
        const op = this.operand.translateToS4();
        if (this.operator === '∀') {
            return new Modal('□', new Quantifier('∀', this.variable, op));
        }
        return new Quantifier(this.operator, this.variable, op);
    }
}

export class Predicate extends Formula {
    constructor(name, args) {
        super('predicate');
        this.name = name;
        this.args = args;
    }

    toString() {
        return `${this.name}(${this.args.map(a => a.toString()).join(',')})`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        if (system === 'Int') {
            return this.translateToS4().evaluate(model, world, assignment, 'S4');
        }
        const resolvedArgs = this.args.map(arg => {
            if (arg instanceof Variable) return assignment[arg.name] || arg.name;
            return arg.toString();
        });
        const key = `${this.name}(${resolvedArgs.join(',')})`;
        const val = world.valuation.get(key);
        if (system.startsWith('Fuzzy')) return (typeof val === 'number') ? val : (val === true ? 1.0 : 0.0);
        return val === true;
    }

    substitute(x, t) {
        return new Predicate(this.name, this.args.map(a => a.substitute(x, t)));
    }

    translateToS4() {
        return new Modal('□', this);
    }
}

// --- CTL Classes ---

export class CTLUnary extends Formula {
    constructor(operator, operand) {
        super('ctl_unary');
        this.operator = operator; // AX, EX, AF, EF, AG, EG
        this.operand = operand;
    }

    toString() {
        return `${this.operator}(${this.operand.toString()})`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        switch (this.operator) {
            case 'EX': return model.getSuccessors(world.id).some(nextId => this.operand.evaluate(model, model.getWorld(nextId), assignment, system));
            case 'AX':
                const succs = model.getSuccessors(world.id);
                return succs.length === 0 || succs.every(nextId => this.operand.evaluate(model, model.getWorld(nextId), assignment, system));
            case 'EF': return this._checkReachability(model, world, assignment, system, (w) => this.operand.evaluate(model, w, assignment, system));
            case 'AF': return !new CTLUnary('EG', new Unary('¬', this.operand)).evaluate(model, world, assignment, system);
            case 'EG': return this._checkExistentialGlobal(model, world, assignment, system);
            case 'AG': return !new CTLUnary('EF', new Unary('¬', this.operand)).evaluate(model, world, assignment, system);
            default: throw new Error(`Unknown CTL operator: ${this.operator}`);
        }
    }

    _checkReachability(model, startWorld, assignment, system, predicate) {
        const visited = new Set([startWorld.id]);
        const queue = [startWorld];
        while (queue.length > 0) {
            const current = queue.shift();
            if (predicate(current)) return true;
            for (const nextId of model.getSuccessors(current.id)) {
                if (!visited.has(nextId)) {
                    visited.add(nextId);
                    queue.push(model.getWorld(nextId));
                }
            }
        }
        return false;
    }

    _checkExistentialGlobal(model, startWorld, assignment, system) {
        let candidates = new Set(Array.from(model.worlds.values()).filter(w => this.operand.evaluate(model, w, assignment, system)).map(w => w.id));
        let changed = true;
        while (changed) {
            changed = false;
            let nextCandidates = new Set();
            for (const id of candidates) {
                if (model.getSuccessors(id).some(sid => candidates.has(sid))) nextCandidates.add(id);
            }
            if (nextCandidates.size < candidates.size) {
                candidates = nextCandidates;
                changed = true;
            }
        }
        return candidates.has(startWorld.id);
    }
}

export class CTLBinary extends Formula {
    constructor(operator, left, right) {
        super('ctl_binary');
        this.operator = operator; // AU, EU, AW, EW
        this.left = left;
        this.right = right;
    }

    toString() {
        return `${this.operator}(${this.left.toString()}, ${this.right.toString()})`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        switch (this.operator) {
            case 'EU': // Existential Until
                let candidates = new Set(Array.from(model.worlds.values()).filter(w => this.right.evaluate(model, w, assignment, system)).map(w => w.id));
                let changed = true;
                while (changed) {
                    changed = false;
                    let size = candidates.size;
                    for (const w of model.worlds.values()) {
                        if (!candidates.has(w.id) && this.left.evaluate(model, w, assignment, system)) {
                            if (model.getSuccessors(w.id).some(sid => candidates.has(sid))) candidates.add(w.id);
                        }
                    }
                    if (candidates.size > size) changed = true;
                }
                return candidates.has(world.id);
            case 'AU': // Universal Until
                // AU(p, q) <=> !EU(!q, !p & !q) & !EG(!q)
                const notQ = new Unary('¬', this.right);
                const cond = new CTLBinary('EU', notQ, new Binary('∧', new Unary('¬', this.left), notQ));
                const eg = new CTLUnary('EG', notQ);
                return !cond.evaluate(model, world, assignment, system) && !eg.evaluate(model, world, assignment, system);
            case 'EW': // Existential Weak Until (Equivalent to EU(p,q) OR EG(p))
                return new CTLBinary('EU', this.left, this.right).evaluate(model, world, assignment, system) ||
                    new CTLUnary('EG', this.left).evaluate(model, world, assignment, system);
            case 'AW': // Universal Weak Until (Equivalent to AU(p,q) OR AG(p))
                return new CTLBinary('AU', this.left, this.right).evaluate(model, world, assignment, system) ||
                    new CTLUnary('AG', this.left).evaluate(model, world, assignment, system);
            default:
                throw new Error(`Unknown CTL operator: ${this.operator}`);
        }
    }
}

// --- World & Model (Updated) ---

export class World {
    constructor(id, x = 0, y = 0) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.name = id; // Default name is ID
        this.color = '#ffffff'; // Default white
        this.description = '';
        this.valuation = new Map(); // Map<string, boolean>
        this.domain = new Set(); // Local domain for varying domains
    }


    setAtom(atomName, value) {
        this.valuation.set(atomName, value);
    }

    addLocalObject(obj) {
        this.domain.add(obj);
    }

    removeLocalObject(obj) {
        this.domain.delete(obj);
    }

}

export class Relation {
    constructor(sourceId, targetId, agent = null, data = {}) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.agent = agent;
        this.data = data; // For storing transition rules (read/write/move)
        this.weight = (typeof data.weight === 'number') ? data.weight : 1.0;
    }
}

import { SymbolicModelChecker } from './symbolic.js';

export class Model {
    constructor() {
        this.worlds = new Map(); // Map<string, World>
        this.relations = []; // Array<Relation>
        this.domain = new Set(); // Explicitly added objects
    }

    verifySymbolic(formula) {
        const smc = new SymbolicModelChecker(this);
        const resBdd = smc.compute(formula);
        const results = new Map();
        for (const w of this.worlds.values()) {
            const wBdd = smc.worldToBdd.get(w.id);
            // check if wBdd implies resBdd
            // imp(wBdd, resBdd) should be TRUE if w is in SAT(formula)
            const imp = smc.mgr.imp(wBdd, resBdd);
            results.set(w.id, imp === smc.mgr.TRUE);
        }
        return results;
    }

    addWorld(world) {
        this.worlds.set(world.id, world);
    }

    addObject(obj) {
        this.domain.add(obj);
    }

    removeObject(obj) {
        this.domain.delete(obj);
    }

    // Combine explicit domain with auto-discovered objects from predicates
    getDomain() {
        const domain = new Set(this.domain);

        // Auto-discovery from predicates P(a,b)
        for (const w of this.worlds.values()) {
            for (const key of w.valuation.keys()) {
                if (key.includes('(') && key.includes(')')) {
                    const content = key.substring(key.indexOf('(') + 1, key.length - 1);
                    const args = content.split(',');
                    args.forEach(arg => {
                        const trimmed = arg.trim();
                        // Heuristic: If it starts with lowercase, it's likely an object constant
                        if (trimmed && /^[a-z]/.test(trimmed)) {
                            domain.add(trimmed);
                        }
                    });
                }
            }
        }

        if (domain.size === 0) {
            domain.add('d1'); // Default if empty
        }
        return domain;
    }

    addRelation(sourceId, targetId, agent = null, data = {}) {
        // Prevent duplicates
        const exists = this.relations.some(r =>
            r.sourceId === sourceId &&
            r.targetId === targetId &&
            r.agent === agent
        );
        if (!exists) {
            this.relations.push(new Relation(sourceId, targetId, agent, data));
        }
    }

    removeRelation(relation) {
        const index = this.relations.indexOf(relation);
        if (index > -1) {
            this.relations.splice(index, 1);
        }
    }

    getAccessibleWorlds(world, agent = null) {
        return this.relations
            .filter(rel => rel.sourceId === world.id && (agent === null || rel.agent === agent))
            .map(rel => this.worlds.get(rel.targetId))
            .filter(w => w !== undefined);
    }

    getReachableWorlds(startWorld, agent = null) {
        const visited = new Set();
        const queue = [startWorld];
        visited.add(startWorld.id);

        const reachable = [];
        // include the world itself? standard LTL/Modal G usually includes current state.
        reachable.push(startWorld);

        while (queue.length > 0) {
            const current = queue.shift();
            const neighbors = this.getAccessibleWorlds(current, agent);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    reachable.push(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return reachable;
    }

    getComponentWorlds(startWorld, agent = null) {
        // BFS on UNDIRECTED graph
        const visited = new Set();
        const queue = [startWorld];
        visited.add(startWorld.id);
        const component = [startWorld];

        while (queue.length > 0) {
            const current = queue.shift();

            // Find neighbors (incoming AND outgoing)
            const neighbors = new Set();
            this.relations.forEach(r => {
                if (agent !== null && r.agent !== agent) return;

                if (r.sourceId === current.id) {
                    const w = this.worlds.get(r.targetId);
                    if (w) neighbors.add(w);
                }
                if (r.targetId === current.id) {
                    const w = this.worlds.get(r.sourceId);
                    if (w) neighbors.add(w);
                }
            });

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    component.push(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        return component;
    }

    getWorld(id) {
        return this.worlds.get(id);
    }

    // Public Announcement Logic: Remove worlds where formula is false
    filter(formula) {
        const toRemove = [];
        for (const world of this.worlds.values()) {
            if (!formula.evaluate(this, world)) {
                toRemove.push(world.id);
            }
        }

        toRemove.forEach(id => {
            this.worlds.delete(id);
        });

        this.relations = this.relations.filter(r =>
            !toRemove.includes(r.sourceId) && !toRemove.includes(r.targetId)
        );

        return toRemove.length; // Return number of removed worlds
    }
}
