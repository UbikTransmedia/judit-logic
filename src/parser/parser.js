import nearley from 'nearley';
import * as grammarModule from './grammar.js';
import { Atom, Unary, Binary, Modal, Constant, Quantifier, Predicate, Variable, FunctionalTerm, CTLUnary, CTLBinary } from '../core/logic.js'; // Import logic classes

const grammar = grammarModule.default || grammarModule;

export class FormulaParser {
    constructor() {
    }

    parse(input) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

        try {
            parser.feed(input);
        } catch (e) {
            throw new Error(`Parse error at character ${e.offset}: ${e.message}`);
        }

        if (parser.results.length === 0) {
            throw new Error("Unexpected end of input.");
        }
        if (parser.results.length > 1) {
            console.warn("Ambiguous grammar, multiple parse trees found. Using the first one.");
        }

        const ast = parser.results[0];
        return this.astToFormula(ast);
    }

    astToFormula(node) {
        if (!node) return null;

        switch (node.type) {
            case 'atom':
                return new Atom(node.name);
            case 'constant':
                return new Constant(node.value);
            case 'unary':
                return new Unary(node.operator, this.astToFormula(node.operand));
            case 'binary':
                return new Binary(node.operator, this.astToFormula(node.left), this.astToFormula(node.right));
            case 'modal':
                return new Modal(node.operator, this.astToFormula(node.operand), node.agent || null);
            case 'quantifier':
                return new Quantifier(node.operator, node.variable, this.astToFormula(node.operand));
            case 'predicate':
                return new Predicate(node.name, node.args.map(a => this.astToTerm(a)));
            case 'ctl_unary':
                return new CTLUnary(node.operator, this.astToFormula(node.operand));
            case 'ctl_binary':
                return new CTLBinary(node.operator, this.astToFormula(node.left), this.astToFormula(node.right));
            default:
                throw new Error(`Unknown AST node type: ${node.type}`);
        }
    }

    astToTerm(node) {
        if (!node) return null;
        switch (node.type) {
            case 'variable':
                return new Variable(node.name);
            case 'function':
                return new FunctionalTerm(node.name, node.args.map(a => this.astToTerm(a)));
            default:
                throw new Error(`Unknown term node type: ${node.type}`);
        }
    }
}
