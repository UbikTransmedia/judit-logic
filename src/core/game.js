
import { Atom, Unary, Binary, Modal } from './logic.js';

export class SemanticGame {
    constructor(model, formula, worldId) {
        this.model = model;
        this.currentFormula = formula;
        this.currentWorldId = worldId;
        this.history = [];
        this.winner = null;
    }

    // Returns the current player: 'Verifier' (trying to make it true) or 'Falsifier' (trying to make it false)
    // In standard game semantics:
    // V moves on disjunctions (OR) and diamonds (EXIST)
    // F moves on conjunctions (AND) and boxes (FORALL)
    // Negation swaps roles.

    // We'll track "Verifier's Goal": TRUE or FALSE.
    // Initially, Verifier wants formula to be TRUE.

    getCurrentState() {
        return {
            formula: this.currentFormula,
            world: this.currentWorldId,
            verifierGoal: this.history.length % 2 === 0 ? true : '?' // Actually depends on negations
        };
        // Simplified:
        // We need to track who's turn it is based on the top-level operator.
    }

    // Simplification: We assume formula is in Negation Normal Form? 
    // Or we handle negation by swapping roles.
    // Let's implement a 'step' function.

    getOptions() {
        const f = this.currentFormula;
        const w = this.model.getWorld(this.currentWorldId);

        if (f instanceof Atom) {
            const val = w.valuation.get(f.name) === true;
            // If val is TRUE, Verifier wins. If FALSE, Falsifier wins.
            return { type: 'end', result: val };
        }

        if (f.type === 'unary' && f.operator === '¬') {
            // Swap roles logic is tricky in simple UI.
            // Better: Evaluate inner, and flip result.
            // Game Semantics usually requires NNF.
            // Let's do a simple "Push Negation" step automatically?
            // Or act as a 'Swap Role' step.
            return { type: 'auto', next: f.operand, action: 'swap_roles' };
        }

        if (f.type === 'binary') {
            if (f.operator === '∨') {
                return { type: 'choice', player: 'Verifier', options: [f.left, f.right] };
            }
            if (f.operator === '∧') {
                return { type: 'choice', player: 'Falsifier', options: [f.left, f.right] };
            }
            if (f.operator === '→') {
                // A -> B  === ¬A v B. Verifier chooses.
                // Choice: Negate A (swap roles) OR B.
                return { type: 'choice', player: 'Verifier', options: [new Unary('¬', f.left), f.right] };
            }
            if (f.operator === '↔') {
                // A <-> B === (A & B) v (¬A & ¬B)
                // Verifier chooses which case holds.
                const case1 = new Binary('∧', f.left, f.right);
                const case2 = new Binary('∧', new Unary('¬', f.left), new Unary('¬', f.right));
                return { type: 'choice', player: 'Verifier', options: [case1, case2] };
            }
        }

        if (f.type === 'modal') {
            if (f.operator === '◊') {
                // Verifier chooses a successor world
                const successors = this.model.getAccessibleWorlds(w, f.agent);
                return { type: 'world_choice', player: 'Verifier', worlds: successors, nextFormula: f.operand };
            }
            if (f.operator === '□') {
                // Falsifier chooses a successor world
                const successors = this.model.getAccessibleWorlds(w, f.agent);
                return { type: 'world_choice', player: 'Falsifier', worlds: successors, nextFormula: f.operand };
            }
        }

        return { type: 'error', message: "Unknown operator" };
    }
}
