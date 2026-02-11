import { Binary, Atom, Unary, Modal } from './logic.js';

/**
 * Lambda Calculus and Type Inference (Curry-Howard Isomorphism)
 */

export class Type {
    constructor(type) {
        this.type = type;
    }
}

export class TypeVar extends Type {
    constructor(name) {
        super('var');
        this.name = name;
    }
}

export class FunctionType extends Type {
    constructor(from, to) {
        super('function');
        this.from = from;
        this.to = to;
    }
}

export class LambdaTerm {
    constructor(type) {
        this.type = type;
    }
}

export class Var extends LambdaTerm {
    constructor(name) {
        super('var');
        this.name = name;
    }
}

export class Abs extends LambdaTerm {
    constructor(param, body) {
        super('abs');
        this.param = param;
        this.body = body;
    }
}

export class App extends LambdaTerm {
    constructor(left, right) {
        super('app');
        this.left = left;
        this.right = right;
    }
}

export class LambdaEngine {
    constructor() {
        this.typeVarCount = 0;
    }

    getNextTypeVar() {
        return `T${++this.typeVarCount}`;
    }

    /**
     * Apply a substitution to a type.
     */
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
        return type;
    }

    /**
     * Apply a substitution to an environment.
     */
    applySubstToEnv(subst, env) {
        const newEnv = new Map();
        for (const [name, type] of env.entries()) {
            newEnv.set(name, this.applySubst(subst, type));
        }
        return newEnv;
    }

    /**
     * Compose two substitutions.
     */
    composeSubst(s1, s2) {
        const newSubst = new Map(s2);
        for (const [name, type] of s1.entries()) {
            newSubst.set(name, this.applySubst(s2, type));
        }
        return newSubst;
    }

    /**
     * Unification algorithm for two types. Returns a substitution.
     */
    unify(t1, t2) {
        if (t1 instanceof TypeVar) {
            if (t1.name === t2.name) return new Map();
            if (this.occursCheck(t1, t2)) throw new Error(`Occurs check failed: ${t1.name} in ${t2.toString()}`);
            return new Map([[t1.name, t2]]);
        }
        if (t2 instanceof TypeVar) {
            return this.unify(t2, t1); // Swap to handle TypeVar on left
        }
        if (t1 instanceof FunctionType && t2 instanceof FunctionType) {
            const s1 = this.unify(t1.from, t2.from);
            const s2 = this.unify(this.applySubst(s1, t1.to), this.applySubst(s1, t2.to));
            return this.composeSubst(s1, s2);
        }
        if (t1.toString() !== t2.toString()) { // Fallback for other types, e.g., atoms
            throw new Error(`Type mismatch: ${t1.toString()} vs ${t2.toString()}`);
        }
        return new Map();
    }

    /**
     * Checks if a type variable occurs in a type.
     */
    occursCheck(v, type) {
        if (type instanceof TypeVar) return v.name === type.name;
        if (type instanceof FunctionType) return this.occursCheck(v, type.from) || this.occursCheck(v, type.to);
        return false;
    }

    /**
     * Infer type of a lambda term and build a derivation tree.
     * @returns { type: Type, subst: Map, derivation: Object }
     */
    /**
     * Infer type of a lambda term and build a derivation tree.
     * @returns { type: Type, subst: Map, derivation: Object }
     */
    inferType(env, term) {
        if (term instanceof Var) {
            if (!env.has(term.name)) {
                throw new Error(`Variable ${term.name} is not in scope.`);
            }
            const type = env.get(term.name);
            return {
                type,
                subst: new Map(),
                derivation: {
                    rule: 'Ax',
                    context: new Map(env),
                    term: term.toString(),
                    type: type,
                    premises: []
                }
            };
        }

        if (term instanceof Abs) {
            const argType = new TypeVar(this.getNextTypeVar());
            const newEnv = new Map(env);
            newEnv.set(term.param, argType);
            const { type: bodyType, subst, derivation: dBody } = this.inferType(newEnv, term.body);
            const finalType = new FunctionType(argType, bodyType);

            return {
                type: finalType,
                subst,
                derivation: {
                    rule: '→I',
                    context: new Map(env),
                    term: term.toString(),
                    type: finalType,
                    premises: [dBody]
                }
            };
        }

        if (term instanceof App) {
            const { type: t1, subst: s1, derivation: dLeft } = this.inferType(env, term.left);
            const env2 = this.applySubstToEnv(s1, env);
            const { type: t2, subst: s2, derivation: dRight } = this.inferType(env2, term.right);

            const resType = new TypeVar(this.getNextTypeVar());
            const s3 = this.unify(this.applySubst(s2, t1), new FunctionType(t2, resType));

            const finalSubst = this.composeSubst(s3, this.composeSubst(s2, s1));
            const finalType = this.applySubst(finalSubst, resType);

            return {
                type: finalType,
                subst: finalSubst,
                derivation: {
                    rule: '→E',
                    context: new Map(env),
                    term: term.toString(),
                    type: finalType,
                    premises: [dLeft, dRight]
                }
            };
        }
        throw new Error("Unknown term type");
    }

    /**
     * Convert Type object to logical formula.
     */
    typeToFormula(type, subst) {
        const atomMapping = {
            'T1': 'p',
            'T2': 'q',
            'T3': 'r',
            'T4': 's'
        };

        const apply = (t) => {
            if (t instanceof TypeVar) {
                if (subst.has(t.name)) return apply(subst.get(t.name));
                const mappedName = atomMapping[t.name] || t.name.replace('T', 'p');
                return new Atom(mappedName);
            }
            if (t instanceof FunctionType) {
                return new Binary('→', apply(t.from), apply(t.to));
            }
            return t;
        };
        return apply(type);
    }

    /**
     * Simple parser for Lambda expressions.
     */
    parse(input) {
        const tokens = input
            .replace(/\\/g, ' \\ ')
            .replace(/λ/g, ' \\ ')
            .replace(/\./g, ' . ')
            .replace(/\(/g, ' ( ')
            .replace(/\)/g, ' ) ')
            .split(/\s+/)
            .filter(t => t.length > 0);

        let pos = 0;

        const parseTerm = () => {
            if (pos >= tokens.length) return null;
            let term = parseAtom();
            if (!term) return null;

            while (pos < tokens.length && tokens[pos] !== ')') {
                const next = parseAtom();
                if (next) {
                    term = new App(term, next);
                } else {
                    break;
                }
            }
            return term;
        };

        const parseAtom = () => {
            if (pos >= tokens.length) return null;
            const token = tokens[pos++];
            if (token === '\\') {
                const params = [];
                while (pos < tokens.length && tokens[pos] !== '.') {
                    params.push(tokens[pos++]);
                }
                if (pos < tokens.length && tokens[pos] === '.') {
                    pos++; // consume .
                }

                if (params.length === 0) throw new Error("Expected parameter after \\");

                let body = parseTerm();
                if (!body) throw new Error("Expected body after .");

                for (let i = params.length - 1; i >= 0; i--) {
                    body = new Abs(params[i], body);
                }
                return body;
            } else if (token === '(') {
                const term = parseTerm();
                if (pos < tokens.length && tokens[pos] === ')') {
                    pos++; // consume )
                    return term;
                }
                throw new Error("Unmatched '('");
            } else if (token === ')' || token === '.') {
                return null;
            } else {
                return new Var(token);
            }
        };

        return parseTerm();
    }

    /**
     * Main entry point: Witness to Proposition.
     */
    check(lambdaStr) {
        try {
            this.typeVarCount = 0;
            const term = this.parse(lambdaStr);
            const env = new Map();
            const { type, subst, derivation } = this.inferType(env, term);

            const finalType = this.applySubst(subst, type);
            const formula = this.typeToFormula(finalType, subst);

            // Post-process derivation to apply final substitutions and convert types to formulas
            const finalizeDerivation = (node) => {
                const nodeType = this.applySubst(subst, node.type);
                node.type = this.typeToFormula(nodeType, subst).toString();

                node.context_list = Array.from(node.context.entries()).map(([k, v]) => {
                    const v_s = this.applySubst(subst, v);
                    return `${k}:${this.typeToFormula(v_s, subst).toString()}`;
                });

                node.premises.forEach(finalizeDerivation);
                delete node.context; // Cleanup to keep object light
            };
            finalizeDerivation(derivation);

            return {
                valid: true,
                type: formula,
                derivation: derivation
            };
        } catch (err) {
            return { valid: false, error: err.message };
        }
    }
}
