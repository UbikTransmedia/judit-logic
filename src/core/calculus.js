import { Formula, Atom, Constant, Binary, Unary } from './logic.js';

export class BooleanCalculus {

    /**
     * Calculates the Boolean Derivative of a formula with respect to a variable.
     * ∂f/∂x = f(x=1) XOR f(x=0)
     * In Logic: ~( f[x<-T] <-> f[x<-F] )
     * 
     * @param {Formula} formula 
     * @param {string} variable (atom name)
     * @returns {Formula} The derivative formula
     */
    static differentiate(formula, variable) {
        const top = new Constant(true);
        const bot = new Constant(false);

        const f_true = formula.substitute(variable, top);
        const f_false = formula.substitute(variable, bot);

        // XOR is equivalent to ~(A <-> B) or (A & ~B) | (~A & B)
        // Let's use ~(A <-> B) for compactness if we support <->
        // Or simplified: A <-> B is equality. We want inequality.

        return new Unary('¬', new Binary('↔', f_true, f_false));
    }

    /**
     * Checks if a formula is independent of a variable.
     * ∂f/∂x is Unsatisfiable (always false).
     */
    static isIndependent(formula, variable, prover) {
        const derivative = this.differentiate(formula, variable);
        // We need to check validity/satisfiability using the prover.
        // If derivative is UNSAT, then f is independent.
        // Prover checks validity usually. 
        // derived being False <-> ~derived is Valid.
        // Let's leave this for the UI/Prover integration.
        return derivative;
    }
}
