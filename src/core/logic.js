
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
        return world.valuation.get(this.name) === true;
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
            return !this.operand.evaluate(model, world, assignment, system);
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

        let accessFunc = (w) => model.getAccessibleWorlds(w, this.agent);

        if (system === 'T') {
            // Reflexive closure on the fly?
            // Or we rely on the user having drawn it? 
            // Usually model checking checks the model AS IS.
            // But if we say "System T", maybe we should implicitily add self-loops?
            // Let's stick to "Model as is" but maybe add an "Implied" mode later.
            // For now, standard Kripke evaluation on the explicit graph.
        }
        // ... (Leaving standard evaluation for K/T/S4/S5 as explicit graph evaluation)

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

        const accessibleWorlds = model.getAccessibleWorlds(world, this.agent);

        if (this.operator === '□') {
            // Must be true in ALL accessible worlds
            return accessibleWorlds.every(w => this.operand.evaluate(model, w, assignment, system));
        } else if (this.operator === '◊') {
            // Must be true in AT LEAST ONE accessible world
            return accessibleWorlds.some(w => this.operand.evaluate(model, w, assignment, system));
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

export class Quantifier extends Formula {
    constructor(operator, variable, operand) {
        super('quantifier');
        this.operator = operator;
        this.variable = variable;
        this.operand = operand;
    }

    toString() {
        return `${this.operator}${this.variable}${this.operand.toString()}`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        if (system === 'Int') {
            return this.translateToS4().evaluate(model, world, assignment, 'S4');
        }

        // Universal: True if true for ALL objects in domain
        // Existential: True if true for AT LEAST ONE object in domain
        // Domain is implicit? We collect all constants from the model.
        // Or we use a fixed domain. Let's use "Active Domain" (all constants known in the model).

        const domain = model.getDomain(); // Set<string>
        if (domain.size === 0) return false; // Or true for empty domain forall?

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
        if (x === this.variable) return this; // Bound variable shadows x
        return new Quantifier(this.operator, this.variable, this.operand.substitute(x, t));
    }

    translateToS4() {
        const op = this.operand.translateToS4();
        // T(∀x A) = □(∀x T(A))
        if (this.operator === '∀') {
            return new Modal('□', new Quantifier('∀', this.variable, op));
        }
        // T(∃x A) = ∃x T(A) (Homomorphism usually? Or Boxed?)
        // Standard GMT: T(∃x A) = ∃x T(A).
        return new Quantifier(this.operator, this.variable, op);
    }
}

export class Predicate extends Formula {
    constructor(name, args) { // args is array of strings (vars or constants)
        super('predicate');
        this.name = name;
        this.args = args;
    }

    toString() {
        return `${this.name}(${this.args.join(',')})`;
    }

    evaluate(model, world, assignment = {}, system = 'K') {
        if (system === 'Int') {
            return this.translateToS4().evaluate(model, world, assignment, 'S4');
        }
        // Resolve arguments: If arg is in assignment, use that value. Else treat as constant.
        const resolvedArgs = this.args.map(arg => assignment[arg] || arg);
        const key = `${this.name}(${resolvedArgs.join(',')})`;
        return world.valuation.get(key) === true;
    }

    substitute(x, t) {
        const newArgs = this.args.map(a => a === x ? t : a);
        return new Predicate(this.name, newArgs);
    }

    translateToS4() {
        // Predicates are like Atoms. T(P(x)) = □P(x)
        return new Modal('□', this);
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
    }

    setAtom(atomName, value) {
        this.valuation.set(atomName, value);
    }
}

export class Relation {
    constructor(sourceId, targetId, agent = null, data = {}) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.agent = agent;
        this.data = data; // For storing transition rules (read/write/move)
    }
}

export class Model {
    constructor() {
        this.worlds = new Map(); // Map<string, World>
        this.relations = []; // Array<Relation>
        this.domain = new Set(); // Explicitly added objects
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
