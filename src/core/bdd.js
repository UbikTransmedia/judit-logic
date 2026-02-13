/**
 * Symbolic Model Checking using Binary Decision Diagrams (BDDs).
 * This module provides an industrial-grade ROBDD (Reduced Ordered Binary Decision Diagram) engine.
 */

export class BDDNode {
    constructor(id, variable, low, high) {
        this.id = id;
        this.variable = variable; // Index in the variable ordering
        this.low = low; // ID of the low child (else)
        this.high = high; // ID of the high child (then)
    }
}

export class BDDManager {
    constructor() {
        this.nodes = new Map(); // (variable, low, high) -> id
        this.nodeTable = []; // id -> BDDNode
        this.varToIdx = new Map();
        this.idxToVar = [];

        // Terminal nodes
        this.FALSE = this._createNode(-1, null, null, 0);
        this.TRUE = this._createNode(-1, null, null, 1);

        this.cache = new Map(); // (op, arg1, arg2) -> resultId
    }

    _createNode(variable, low, high, id = null) {
        const nodeId = id !== null ? id : this.nodeTable.length;
        const node = new BDDNode(nodeId, variable, low, high);
        this.nodeTable[nodeId] = node;
        if (variable !== -1) {
            this.nodes.set(`${variable},${low},${high}`, nodeId);
        }
        return nodeId;
    }

    getVarIndex(name) {
        if (!this.varToIdx.has(name)) {
            const idx = this.idxToVar.length;
            this.varToIdx.set(name, idx);
            this.idxToVar.push(name);
            return idx;
        }
        return this.varToIdx.get(name);
    }

    mk(variable, low, high) {
        if (low === high) return low;
        const key = `${variable},${low},${high}`;
        if (this.nodes.has(key)) return this.nodes.get(key);
        return this._createNode(variable, low, high);
    }

    var(name) {
        const idx = this.getVarIndex(name);
        return this.mk(idx, this.FALSE, this.TRUE);
    }

    not(f) {
        if (f === this.TRUE) return this.FALSE;
        if (f === this.FALSE) return this.TRUE;

        const key = `NOT,${f}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const node = this.nodeTable[f];
        const res = this.mk(node.variable, this.not(node.low), this.not(node.high));
        this.cache.set(key, res);
        return res;
    }

    and(f, g) {
        if (f === g) return f;
        if (f === this.FALSE || g === this.FALSE) return this.FALSE;
        if (f === this.TRUE) return g;
        if (g === this.TRUE) return f;

        const key = `AND,${Math.min(f, g)},${Math.max(f, g)}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const nodeF = this.nodeTable[f];
        const nodeG = this.nodeTable[g];

        let res;
        if (nodeF.variable === nodeG.variable) {
            res = this.mk(nodeF.variable, this.and(nodeF.low, nodeG.low), this.and(nodeF.high, nodeG.high));
        } else if (nodeF.variable < nodeG.variable && nodeF.variable !== -1 || nodeG.variable === -1) {
            res = this.mk(nodeF.variable, this.and(nodeF.low, g), this.and(nodeF.high, g));
        } else {
            res = this.mk(nodeG.variable, this.and(f, nodeG.low), this.and(f, nodeG.high));
        }

        this.cache.set(key, res);
        return res;
    }

    or(f, g) {
        return this.not(this.and(this.not(f), this.not(g)));
    }

    imp(f, g) {
        return this.or(this.not(f), g);
    }

    // Existential quantification: exists x. f
    exists(varName, f) {
        const idx = this.getVarIndex(varName);
        return this._existsIdx(idx, f);
    }

    _existsIdx(idx, f) {
        if (f === this.TRUE || f === this.FALSE) return f;
        const node = this.nodeTable[f];
        if (node.variable > idx) return f;

        const key = `EXISTS,${idx},${f}`;
        if (this.cache.has(key)) return this.cache.get(key);

        let res;
        if (node.variable === idx) {
            res = this.or(node.low, node.high);
        } else {
            res = this.mk(node.variable, this._existsIdx(idx, node.low), this._existsIdx(idx, node.high));
        }

        this.cache.set(key, res);
        return res;
    }

    toString(f) {
        if (f === this.TRUE) return "1";
        if (f === this.FALSE) return "0";
        const node = this.nodeTable[f];
        return `(${this.idxToVar[node.variable]} ? ${this.toString(node.high)} : ${this.toString(node.low)})`;
    }
}
