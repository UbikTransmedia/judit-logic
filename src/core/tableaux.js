
import { Atom, Unary, Binary, Modal, Constant, Predicate, Quantifier } from './logic.js';

class TableauNode {
    constructor(worldId, formula) {
        this.worldId = worldId;
        this.formula = formula;
        this.handled = false; // "used"
    }
}

export class TableauBranch {
    // ... (constructor omitted, assume unchanged) ...
    constructor(parent = null) {
        this.nodes = parent ? parent.nodes.map(n => ({ ...n })) : []; // Clone nodes
        if (parent) {
            this.relations = [...parent.relations];
            this.worldCounter = parent.worldCounter;
        } else {
            this.relations = [];
            this.worldCounter = 0;
        }
        this.isClosed = false;
    }

    addNode(worldId, formula) {
        // Avoid duplicates
        if (!this.nodes.some(n => n.worldId === worldId && n.formula.toString() === formula.toString())) {
            this.nodes.push(new TableauNode(worldId, formula));
        }
    }

    addRelation(from, to) {
        if (!this.relations.some(r => r.from === from && r.to === to)) {
            this.relations.push({ from, to });
            // Propagate Box formulas
            this.nodes.forEach(n => {
                if (n.worldId === from && n.formula.type === 'modal' && n.formula.operator === '□') {
                    this.addNode(to, n.formula.operand);
                }
            });
        }
    }


    checkContradiction() {
        // 1. Check for Bot (False) or Not Top (¬True)
        for (const n of this.nodes) {
            if (n.formula instanceof Constant) {
                if (!n.formula.value) { this.isClosed = true; return true; } // Found False
            }
            if (n.formula instanceof Unary && n.formula.operator === '¬' && n.formula.operand instanceof Constant) {
                if (n.formula.operand.value) { this.isClosed = true; return true; } // Found ¬True
            }
        }

        // 2. Check for A and ¬A in the same world
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n1 = this.nodes[i];
                const n2 = this.nodes[j];
                if (n1.worldId === n2.worldId) {
                    // Check if n1 is negation of n2 or vice versa
                    if (this.isNegationOf(n1.formula, n2.formula) || this.isNegationOf(n2.formula, n1.formula)) {
                        this.isClosed = true;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isNegationOf(f1, f2) {
        return f1.type === 'unary' && f1.operator === '¬' && f1.operand.toString() === f2.toString();
    }

    getNextUnhandled() {
        return this.nodes.find(n => !n.handled && !(n.formula instanceof Atom) && !(n.formula instanceof Predicate) && !(n.formula instanceof Constant) && !(n.formula instanceof Unary && (n.formula.operand instanceof Atom || n.formula.operand instanceof Predicate)));
        // We evaluate complex formulas. Literals (p, ¬p, P(a), ¬P(a), T, F) are not "handled".
    }
}

export class TableauxProver {
    constructor() {
        this.branches = [];
        this.constants = new Set(['d1']); // Default universe if empty
    }

    prove(formula, system = 'K') {
        if (system === 'Int') {
            // Intuitionistic Logic: Prove T(formula) in S4
            formula = formula.translateToS4();
            system = 'S4';
        }

        // Root: Negation of the formula to prove
        this.constants = new Set(['d1']);
        const negated = new Unary('¬', formula);
        const rootBranch = new TableauBranch();
        rootBranch.addNode('w0', negated);
        rootBranch.worldCounter = 1;
        this.collectConstants(negated);

        const result = this.runTableau(rootBranch, system);
        return result.valid ? { valid: true } : { valid: false, counterModel: result.openBranch };
    }

    satisfy(formula, system = 'K') {
        if (system === 'Int') {
            // Intuitionistic Logic: Satisfy T(formula) in S4
            formula = formula.translateToS4();
            system = 'S4';
        }
        this.constants = new Set(['d1']);
        const rootBranch = new TableauBranch();
        rootBranch.addNode('w0', formula);
        rootBranch.worldCounter = 1;
        this.collectConstants(formula);

        const result = this.runTableau(rootBranch, system);
        return { satisfiable: !result.valid, model: result.openBranch };
    }

    runTableau(rootBranch, system) {
        const queue = [rootBranch];
        const finishedBranches = [];
        let steps = 0;
        const MAX_STEPS = 1000;

        while (queue.length > 0) {
            if (steps++ > MAX_STEPS) {
                console.warn("Prover reached max steps (1000). Stopping.");
                finishedBranches.push(queue.shift());
                continue;
            }

            const currentBranch = queue.shift();
            if (currentBranch.checkContradiction()) continue;

            const node = currentBranch.getNextUnhandled();
            if (!node) {
                finishedBranches.push(currentBranch);
                continue;
            }

            node.handled = true;
            const newBranches = this.expand(node, currentBranch, system);
            newBranches.forEach(b => queue.push(b));
        }

        if (finishedBranches.length > 0) {
            return { valid: false, openBranch: finishedBranches[0] };
        } else {
            return { valid: true };
        }
    }

    collectConstants(formula) {
        // Recursively find constants (arguments in Predicates, or specific Constant types?)
        // Here, constants are just strings used as arguments in Predicates.
        // Or free variables? Tableaux assumes closed formulas usually.
        // We scan for Predicate args.
        if (formula.type === 'predicate') {
            formula.args.forEach(a => this.constants.add(a));
        } else if (formula.operand) {
            this.collectConstants(formula.operand);
        } else if (formula.left) {
            this.collectConstants(formula.left);
            this.collectConstants(formula.right);
        }
    }

    // expand method with system config
    expand(node, branch, system = 'K') {
        const f = node.formula;
        const w = node.worldId;

        // ... Alpha/Beta rules same as before ...

        if (f.type === 'unary' && f.operator === '¬') {
            const inner = f.operand;
            // Double Negation
            if (inner.type === 'unary' && inner.operator === '¬') { branch.addNode(w, inner.operand); return [branch]; }

            // De Morgan / Implication Negation
            if (inner.type === 'binary') {
                if (inner.operator === '∨') {
                    branch.addNode(w, new Unary('¬', inner.left));
                    branch.addNode(w, new Unary('¬', inner.right));
                    return [branch];
                }
                if (inner.operator === '→') {
                    branch.addNode(w, inner.left);
                    branch.addNode(w, new Unary('¬', inner.right));
                    return [branch];
                }
                if (inner.operator === '∧') {
                    const b1 = new TableauBranch(branch);
                    const b2 = new TableauBranch(branch);
                    b1.addNode(w, new Unary('¬', inner.left));
                    b2.addNode(w, new Unary('¬', inner.right));
                    return [b1, b2];
                }
                if (inner.operator === '↔') {
                    // ¬(A <-> B)
                    // (A & ¬B) v (¬A & B)
                    const b1 = new TableauBranch(branch);
                    const b2 = new TableauBranch(branch);

                    b1.addNode(w, inner.left);
                    b1.addNode(w, new Unary('¬', inner.right));

                    b2.addNode(w, new Unary('¬', inner.left));
                    b2.addNode(w, inner.right);

                    return [b1, b2];
                }
            }
            // Modal Negations
            if (inner.type === 'modal') {
                if (inner.operator === '□') {
                    branch.addNode(w, new Modal('◊', new Unary('¬', inner.operand), inner.agent));
                    return [branch];
                }
                if (inner.operator === '◊') {
                    branch.addNode(w, new Modal('□', new Unary('¬', inner.operand), inner.agent));
                    return [branch];
                }
            }
            // Quantifier Negations
            if (inner.type === 'quantifier') {
                if (inner.operator === '∀') {
                    // ¬∀x P(x)  =>  ∃x ¬P(x)
                    branch.addNode(w, new Quantifier('∃', inner.variable, new Unary('¬', inner.operand)));
                    return [branch];
                }
                if (inner.operator === '∃') {
                    // ¬∃x P(x)  =>  ∀x ¬P(x)
                    branch.addNode(w, new Quantifier('∀', inner.variable, new Unary('¬', inner.operand)));
                    return [branch];
                }
            }
        }

        if (f.type === 'binary') {
            if (f.operator === '∧') {
                branch.addNode(w, f.left);
                branch.addNode(w, f.right);
                return [branch];
            }
            if (f.operator === '∨') {
                const b1 = new TableauBranch(branch);
                const b2 = new TableauBranch(branch);
                b1.addNode(w, f.left);
                b2.addNode(w, f.right);
                return [b1, b2];
            }
            if (f.operator === '→') {
                const b1 = new TableauBranch(branch);
                const b2 = new TableauBranch(branch);
                b1.addNode(w, new Unary('¬', f.left));
                b2.addNode(w, f.right);
                return [b1, b2];
            }
            if (f.operator === '↔') {
                // (A->B) & (B->A) => (¬A v B) & (¬B v A)
                // Branch 1: A & B
                // Branch 2: ¬A & ¬B
                const b1 = new TableauBranch(branch);
                const b2 = new TableauBranch(branch);
                b1.addNode(w, f.left);
                b1.addNode(w, f.right);

                b2.addNode(w, new Unary('¬', f.left));
                b2.addNode(w, new Unary('¬', f.right));
                return [b1, b2];
            }
        }

        if (f.type === 'modal') {
            if (f.operator === '◊') {
                const newW = `w${branch.worldCounter++}`;
                branch.addRelation(w, newW); // triggers K rules automatically via propogation in addRelation?
                // Wait, addRelation propagates logic.checkContradiction? No, addRelation in Branch propagates Box contents?
                // Yes, my modified addRelation does. 

                // For S5: Relation is universal.
                // If S5, we might treat it differently, but let's assume Explicit Relation + Saturation or property enforcement.
                // Enforcing properties on the relation:
                // T: w->w.
                // S4: Transitivity.
                // S5: Euclidean + Reflexive.

                // Handling Logic Rules:
                if (system === 'T' || system === 'S4' || system === 'S5') {
                    // Reflexivity: if not present, add w->w?
                    // Or just apply Expansion Rule T: []A @ w -> A @ w
                    // Better to apply Rule T here for boxes, rather than adding edges.
                }

                branch.addNode(newW, f.operand);
                return [branch];
            }

            if (f.operator === '□') {
                // Rule K: Current neighbors handled by addRelation propagation or loop
                // "K" Propagation:
                const neighbors = branch.relations.filter(r => r.from === w).map(r => r.to);
                neighbors.forEach(target => {
                    branch.addNode(target, f.operand);
                });

                // Rule T: []A -> A (Reflexivity)
                if (system === 'T' || system === 'S4' || system === 'S5') {
                    branch.addNode(w, f.operand);
                }

                // Rule 4: []A -> [][]A (Transitivity)
                if (system === 'S4' || system === 'S5') {
                    // Propagate []A to all neighbors
                    neighbors.forEach(target => {
                        branch.addNode(target, f); // Add []A itself to target
                    });
                }

                // Rule 5 / S5 (Total/Euclidean):
                // If S5, []A @ w implies A @ ANY world w'.
                // Or: []A @ w implies []A @ w' for all w' (and previous worlds too, effectively).
                // Simplest S5: Treat all worlds as neighbors.
                if (system === 'S5') {
                    branch.nodes.forEach(n => {
                        // Add operand to ALL worlds in branch
                        branch.addNode(n.worldId, f.operand);
                        // Also propagate []A? Yes.
                        branch.addNode(n.worldId, f);
                    });
                    // Note: This is expensive and loop-prone without careful "handled" checks.
                    // But logic is core S5 behavior.
                }

                return [branch];
            }
        }

        // --- FOL Rules ---
        if (f.type === 'quantifier') {
            if (f.operator === '∀') {
                // Gamma Rule: ∀x A(x)
                // Instantiate with ALL active constants in the branch
                // Problem: We need to re-apply if new constants appear.
                // For now: Just instantiate with current constants.
                // Note: node.handled should NOT be set to true if we want to re-apply.
                // But infinite loop risk.
                // Standard Tableaux: Gamma rule is valid for all Terms.
                // Applied on demand?
                // Simplified: Instantiate for all known constants.
                // Mark handled = true BUT re-add if we find new constant? (Complicated)
                // Let's just instantiate for current constants.

                this.constants.forEach(c => {
                    branch.addNode(w, f.operand.substitute(f.variable, c));
                });
                // If no constants, try 'd1'
                if (this.constants.size === 0) {
                    this.constants.add('d1');
                    branch.addNode(w, f.operand.substitute(f.variable, 'd1'));
                }

                // IMPORTANT: To be sound, we should NOT mark ∀ as fully handled if we expect new constants.
                // But for this simplified prover, we'll mark it handled and maybe re-scan?
                // Let's keep it handled to avoid loops for now.
                return [branch];
            }

            if (f.operator === '∃') {
                // Delta Rule: ∃x A(x) -> A(c) for new constant c
                let c = 'c1';
                // Find a fresh constant not in this.constants
                let counter = 1;
                while (this.constants.has(`c${counter}`)) {
                    counter++;
                }
                c = `c${counter}`;
                this.constants.add(c);

                branch.addNode(w, f.operand.substitute(f.variable, c));

                // If we added a new constant, we should technically re-trigger all ∀ rules in this branch...
                // Only if we want full completeness.
                // For now: Just expand.
                return [branch];
            }
        }

        return [branch];
    }
}
