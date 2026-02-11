/**
 * Ordinal Arithmetic for Lógicador
 * Implements Veblen Hierarchy for GLP Worm Analysis.
 *
 * Mapping:
 * o(T) = 0
 * o(A & B) = o(A) # o(B) (Natural Sum)
 * o(<n>A) = phi_n(o(A))
 *
 * phi_0(a) = omega^a
 * phi_1(a) = epsilon_a
 * phi_2(a) = zeta_a / Gamma_a
 */

export class Ordinal {
    constructor(type, value, sub = null) {
        this.type = type; // 'zero', 'phi', 'sum'
        this.value = value; // n for phi_n, or array for sum
        this.sub = sub; // beta for phi_n(beta)
    }

    toString() {
        if (this.type === 'zero') return '0';

        if (this.type === 'phi') {
            const n = this.value;
            const beta = this.sub;
            const betaStr = beta.toString(); // Recursive

            // Base: 0
            if (n === 0) {
                if (beta.type === 'zero') return '1'; // w^0 = 1
                if (betaStr === '1') return 'ω';      // w^1 = w
                return `ω^{${betaStr}}`;
            }
            // Epsilon
            if (n === 1) {
                if (beta.type === 'zero') return 'ε₀';
                return `ε_{${betaStr}}`;
            }
            // Zeta / Gamma
            if (n === 2) {
                if (beta.type === 'zero') return 'ζ₀';
                return `ζ_{${betaStr}}`;
            }
            // General
            if (beta.type === 'zero') return `φ(${n}, 0)`;
            return `φ(${n}, ${betaStr})`;
        }

        if (this.type === 'sum') {
            // Sort? Usually decreasing order for Cantor Normal Form.
            // But worms are often built up.
            // Let's just join.
            return this.value.map(o => o.toString()).join(' + ');
        }
        return '?';
    }
}

export class WormCalculator {
    static calculate(formula) {
        if (!formula) return new Ordinal('zero');

        // Handle string input (basic parsing if needed, but we assume AST from parser)
        // If passed a string, we might need to parse it? 
        // For now assume Formula Object.

        if (formula.type === 'constant') { // Top/Bot
            // Bot -> -1? undefined? or 0? 
            // In closed fragment, usually start from Top = 0.
            return new Ordinal('zero');
        }

        if (formula.type === 'binary' && formula.operator === '∧') {
            // Natural sum
            const o1 = this.calculate(formula.left);
            const o2 = this.calculate(formula.right);

            // Flatten sums
            let terms = [];
            if (o1.type === 'sum') terms.push(...o1.value); else if (o1.type !== 'zero') terms.push(o1);
            if (o2.type === 'sum') terms.push(...o2.value); else if (o2.type !== 'zero') terms.push(o2);

            if (terms.length === 0) return new Ordinal('zero');
            if (terms.length === 1) return terms[0];

            // Sort descending?
            // terms.sort((a,b) => ...); // Complex to compare ordinals.
            // Just return as is for now.
            return new Ordinal('sum', terms);
        }

        if (formula.type === 'modal' && formula.operator === '◊') {
            // <n>A
            const n = parseInt(formula.agent || '0');
            const inner = this.calculate(formula.operand);

            // phi_n(inner)
            return new Ordinal('phi', n, inner);
        }

        // Diamond is usually what we sum.
        // What about Negation? Atom?
        // Worms are purely positive <n>...T
        return new Ordinal('zero');
    }
}
