import { Binary, Atom, Unary, Modal } from './logic.js';

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
    constructor(param, body) {
        super('abs');
        this.param = param;
        this.body = body;
    }

    toString() {
        return `λ${this.param}.${this.body.toString()}`;
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

        if (term instanceof Pair) {
            const { type: t1, subst: s1, derivation: dLeft } = this.inferType(env, term.left);
            const env2 = this.applySubstToEnv(s1, env);
            const { type: t2, subst: s2, derivation: dRight } = this.inferType(env2, term.right);

            const finalSubst = this.composeSubst(s2, s1);
            const finalType = new ProductType(this.applySubst(s2, t1), t2);

            return {
                type: finalType,
                subst: finalSubst,
                derivation: {
                    rule: '∧I',
                    context: new Map(env),
                    term: term.toString(),
                    type: finalType,
                    premises: [dLeft, dRight]
                }
            };
        }

        if (term instanceof Fst) {
            const { type: t, subst: s, derivation: dTerm } = this.inferType(env, term.term);
            const productType = new ProductType(new TypeVar(this.getNextTypeVar()), new TypeVar(this.getNextTypeVar()));
            const s2 = this.unify(t, productType);

            const finalSubst = this.composeSubst(s2, s);
            const finalType = this.applySubst(finalSubst, productType.left);

            return {
                type: finalType,
                subst: finalSubst,
                derivation: {
                    rule: '∧E_left',
                    context: new Map(env),
                    term: term.toString(),
                    type: finalType,
                    premises: [dTerm]
                }
            };
        }

        if (term instanceof Snd) {
            const { type: t, subst: s, derivation: dTerm } = this.inferType(env, term.term);
            const productType = new ProductType(new TypeVar(this.getNextTypeVar()), new TypeVar(this.getNextTypeVar()));
            const s2 = this.unify(t, productType);

            const finalSubst = this.composeSubst(s2, s);
            const finalType = this.applySubst(finalSubst, productType.right);

            return {
                type: finalType,
                subst: finalSubst,
                derivation: {
                    rule: '∧E_right',
                    context: new Map(env),
                    term: term.toString(),
                    type: finalType,
                    premises: [dTerm]
                }
            };
        }

        if (term instanceof Inl) {
            const { type: t, subst: s, derivation: dTerm } = this.inferType(env, term.term);
            const rightType = new TypeVar(this.getNextTypeVar());
            const finalType = new SumType(t, rightType);

            return {
                type: finalType,
                subst: s,
                derivation: {
                    rule: '∨I_left',
                    context: new Map(env),
                    term: term.toString(),
                    type: finalType,
                    premises: [dTerm]
                }
            };
        }

        if (term instanceof Inr) {
            const { type: t, subst: s, derivation: dTerm } = this.inferType(env, term.term);
            const leftType = new TypeVar(this.getNextTypeVar());
            const finalType = new SumType(leftType, t);

            return {
                type: finalType,
                subst: s,
                derivation: {
                    rule: '∨I_right',
                    context: new Map(env),
                    term: term.toString(),
                    type: finalType,
                    premises: [dTerm]
                }
            };
        }

        if (term instanceof Case) {
            const { type: t, subst: s1, derivation: dTerm } = this.inferType(env, term.term);
            const sumType = new SumType(new TypeVar(this.getNextTypeVar()), new TypeVar(this.getNextTypeVar()));
            const s2 = this.unify(t, sumType);

            const newEnvL = this.applySubstToEnv(s2, env);
            newEnvL.set(term.varL, this.applySubst(s2, sumType.left));
            const { type: tL, subst: s3, derivation: dBodyL } = this.inferType(newEnvL, term.bodyL);

            const newEnvR = this.applySubstToEnv(this.composeSubst(s3, s2), env);
            newEnvR.set(term.varR, this.applySubst(this.composeSubst(s3, s2), sumType.right));
            const { type: tR, subst: s4, derivation: dBodyR } = this.inferType(newEnvR, term.bodyR);

            const finalResultType = new TypeVar(this.getNextTypeVar());
            const s5 = this.unify(this.applySubst(s4, tL), finalResultType);
            const s6 = this.unify(this.applySubst(s5, this.applySubst(s4, tR)), finalResultType);

            const finalSubst = this.composeSubst(s6, this.composeSubst(s5, this.composeSubst(s4, this.composeSubst(s3, s2))));
            const finalType = this.applySubst(finalSubst, finalResultType);

            return {
                type: finalType,
                subst: finalSubst,
                derivation: {
                    rule: '∨E',
                    context: new Map(env),
                    term: term.toString(),
                    type: finalType,
                    premises: [dTerm, dBodyL, dBodyR]
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
            if (t instanceof ProductType) {
                return new Binary('∧', apply(t.left), apply(t.right));
            }
            if (t instanceof SumType) {
                return new Binary('∨', apply(t.left), apply(t.right));
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
            .replace(/,/g, ' , ') // For pairs
            .replace(/⟨/g, ' ⟨ ') // For pairs
            .replace(/⟩/g, ' ⟩ ') // For pairs
            .replace(/fst/g, ' fst ')
            .replace(/snd/g, ' snd ')
            .replace(/inl/g, ' inl ')
            .replace(/inr/g, ' inr ')
            .replace(/case/g, ' case ')
            .replace(/of/g, ' of ')
            .replace(/{/g, ' { ')
            .replace(/}/g, ' } ')
            .replace(/;/g, ' ; ')
            .split(/\s+/)
            .filter(t => t.length > 0);

        let pos = 0;

        const parseTerm = () => {
            if (pos >= tokens.length) return null;
            let term = parseAtom();
            if (!term) return null;

            while (pos < tokens.length && tokens[pos] !== ')' && tokens[pos] !== '⟩' && tokens[pos] !== '}' && tokens[pos] !== ';' && tokens[pos] !== 'of' && tokens[pos] !== ',') {
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
            } else if (token === '⟨') {
                const left = parseTerm();
                if (!left) throw new Error("Expected left term in pair after '⟨'");
                if (pos < tokens.length && tokens[pos] === ',') {
                    pos++; // consume ,
                } else {
                    throw new Error("Expected ',' in pair");
                }
                const right = parseTerm();
                if (!right) throw new Error("Expected right term in pair after ','");
                if (pos < tokens.length && tokens[pos] === '⟩') {
                    pos++; // consume ⟩
                    return new Pair(left, right);
                }
                throw new Error("Unmatched '⟨'");
            } else if (token === 'fst') {
                const term = parseAtom(); // fst expects an atom or parenthesized term
                if (!term) throw new Error("Expected term after 'fst'");
                return new Fst(term);
            } else if (token === 'snd') {
                const term = parseAtom(); // snd expects an atom or parenthesized term
                if (!term) throw new Error("Expected term after 'snd'");
                return new Snd(term);
            } else if (token === 'inl') {
                const term = parseAtom();
                if (!term) throw new Error("Expected term after 'inl'");
                return new Inl(term);
            } else if (token === 'inr') {
                const term = parseAtom();
                if (!term) throw new Error("Expected term after 'inr'");
                return new Inr(term);
            } else if (token === 'case') {
                const term = parseTerm();
                if (!term) throw new Error("Expected term after 'case'");
                if (pos < tokens.length && tokens[pos] === 'of') {
                    pos++; // consume 'of'
                } else {
                    throw new Error("Expected 'of' after case term");
                }
                if (pos < tokens.length && tokens[pos] === '{') {
                    pos++; // consume '{'
                } else {
                    throw new Error("Expected '{' after 'of'");
                }

                const varL = tokens[pos++];
                if (!varL) throw new Error("Expected variable for left branch");
                if (pos < tokens.length && tokens[pos] === '.') {
                    pos++; // consume '.'
                } else {
                    throw new Error("Expected '.' after left variable");
                }
                const bodyL = parseTerm();
                if (!bodyL) throw new Error("Expected body for left branch");
                if (pos < tokens.length && tokens[pos] === ';') {
                    pos++; // consume ';'
                } else {
                    throw new Error("Expected ';' between branches");
                }

                const varR = tokens[pos++];
                if (!varR) throw new Error("Expected variable for right branch");
                if (pos < tokens.length && tokens[pos] === '.') {
                    pos++; // consume '.'
                } else {
                    throw new Error("Expected '.' after right variable");
                }
                const bodyR = parseTerm();
                if (!bodyR) throw new Error("Expected body for right branch");
                if (pos < tokens.length && tokens[pos] === '}') {
                    pos++; // consume '}'
                    return new Case(term, varL, bodyL, varR, bodyR);
                }
                throw new Error("Unmatched '{'");
            }
            else if (token === ')' || token === '.' || token === '⟩' || token === '}' || token === ';' || token === 'of' || token === ',') {
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

    /**
     * Logic-to-Lambda Synthesis (Proof Search)
     * Given a goal formula, find a lambda term that has it as its type.
     */
    synthesize(formula) {
        const type = this.formulaToType(formula);
        const term = this.proofSearch([], type, new Set());
        if (!term) throw new Error("No constructive proof found for this formula in the intuitionistic fragment.");
        return term;
    }

    formulaToType(f) {
        if (f instanceof Atom) return new TypeVar(f.name);
        if (f instanceof Binary) {
            switch (f.operator) {
                case '→': return new FunctionType(this.formulaToType(f.left), this.formulaToType(f.right));
                case '∧': return new ProductType(this.formulaToType(f.left), this.formulaToType(f.right));
                case '∨': return new SumType(this.formulaToType(f.left), this.formulaToType(f.right));
                case '↔': return new ProductType(
                    new FunctionType(this.formulaToType(f.left), this.formulaToType(f.right)),
                    new FunctionType(this.formulaToType(f.right), this.formulaToType(f.left))
                );
            }
        }
        throw new Error(`Formula outside supported fragment: ${f.toString()}`);
    }

    /**
     * Simple depth-first proof search for intuitionistic implication.
     */
    proofSearch(context, goal, usedNames) {
        const goalStr = goal.toString();

        // 1. Goal: A -> B (→I)
        if (goal instanceof FunctionType) {
            const varName = this.getFreshName(usedNames);
            const newContext = [...context, { name: varName, type: goal.from }];
            const body = this.proofSearch(newContext, goal.to, new Set([...usedNames, varName]));
            if (body) return new Abs(varName, body);
        }

        // 2. Goal: A ∧ B (∧I)
        if (goal instanceof ProductType) {
            const left = this.proofSearch(context, goal.left, usedNames);
            if (left) {
                const right = this.proofSearch(context, goal.right, usedNames);
                if (right) return new Pair(left, right);
            }
        }

        // 3. Goal: A ∨ B (∨I)
        if (goal instanceof SumType) {
            const left = this.proofSearch(context, goal.left, usedNames);
            if (left) return new Inl(left);
            const right = this.proofSearch(context, goal.right, usedNames);
            if (right) return new Inr(right);
        }

        // 4. Base cases: Assumption (Ax) or Elimination of Conjunction (∧E)
        for (const entry of context) {
            const extracted = this.extractFromType(new Var(entry.name), entry.type, goalStr);
            if (extracted) return extracted;
        }

        // 5. Modus Ponens (→E) and Disjunction Elimination (∨E)
        for (const entry of context) {
            const type = entry.type;

            // Elimination of Function (A -> B)
            if (type instanceof FunctionType && type.to.toString() === goalStr) {
                const arg = this.proofSearch(context, type.from, usedNames);
                if (arg) return new App(new Var(entry.name), arg);
            }

            // Elimination of Sum (A ∨ B -> Goal)
            if (type instanceof SumType) {
                const varL = this.getFreshName(usedNames);
                const varR = this.getFreshName(new Set([...usedNames, varL]));
                const bodyL = this.proofSearch([...context, { name: varL, type: type.left }], goal, new Set([...usedNames, varL, varR]));
                if (bodyL) {
                    const bodyR = this.proofSearch([...context, { name: varR, type: type.right }], goal, new Set([...usedNames, varL, varR]));
                    if (bodyR) return new Case(new Var(entry.name), varL, bodyL, varR, bodyR);
                }
            }
        }

        return null;
    }

    /**
     * Recursively try to extract a goal type from a potentially nested Product type.
     */
    extractFromType(term, type, goalStr) {
        if (type.toString() === goalStr) return term;
        if (type instanceof ProductType) {
            return this.extractFromType(new Fst(term), type.left, goalStr) ||
                this.extractFromType(new Snd(term), type.right, goalStr);
        }
        return null;
    }

    getFreshName(used) {
        const names = 'xyzpqrstuvw'.split('');
        for (const n of names) {
            if (!used.has(n)) return n;
        }
        let i = 1;
        while (used.has(`x${i}`)) i++;
        return `x${i}`;
    }
}
