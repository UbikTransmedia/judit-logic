
import { World } from './logic.js';

export class TuringMachine {
    constructor(model) {
        this.model = model;
        this.tape = {}; // Infinite tape using object: { index: char }
        this.head = 0;
        this.currentStateId = null;
        this.isRunning = false;
        this.stepCount = 0;
        this.history = [];
    }

    reset() {
        this.tape = {};
        this.head = 0;
        this.currentStateId = null;
        this.isRunning = false;
        this.stepCount = 0;
        this.history = [];
    }

    loadTape(inputString) {
        this.tape = {};
        for (let i = 0; i < inputString.length; i++) {
            this.tape[i] = inputString[i];
        }
    }

    setStartWorld(worldId) {
        this.currentStateId = worldId;
    }

    getSymbol(index) {
        return this.tape[index] || 'B';
    }

    setSymbol(index, char) {
        this.tape[index] = char;
    }

    step() {
        if (!this.currentStateId) return false;

        const currentWorld = this.model.getWorld(this.currentStateId);
        if (!currentWorld) return false;

        const symbol = this.getSymbol(this.head);

        const relations = this.model.relations.filter(r => r.sourceId === this.currentStateId);
        let transition = relations.find(r => r.data && r.data.read === symbol);

        if (!transition) {
            this.isRunning = false;
            return false;
        }

        const write = transition.data.write || symbol;
        const move = transition.data.move || 'S';
        const nextState = transition.targetId;

        this.history.push({
            tape: { ...this.tape },
            head: this.head,
            state: this.currentStateId,
            read: symbol,
            write: write,
            move: move,
            nextState: nextState
        });

        this.setSymbol(this.head, write);

        if (move === 'L') this.head--;
        else if (move === 'R') this.head++;

        this.currentStateId = nextState;
        this.stepCount++;

        return true;
    }

    getTapeSegment(centerIndex, radius) {
        const result = [];
        for (let i = centerIndex - radius; i <= centerIndex + radius; i++) {
            result.push({ index: i, val: this.getSymbol(i) });
        }
        return result;
    }

    getTapeString() {
        const keys = Object.keys(this.tape).map(Number).sort((a, b) => a - b);
        if (keys.length === 0) return '';
        return keys.map(k => this.tape[k]).join('');
    }

    /** Get all transition rules from the model (relations with data) */
    getTransitionTable() {
        const rules = [];
        for (const r of this.model.relations) {
            if (r.data && (r.data.read !== undefined || r.data.write !== undefined || r.data.move !== undefined)) {
                const fromWorld = this.model.getWorld(r.sourceId);
                const toWorld = this.model.getWorld(r.targetId);
                rules.push({
                    fromId: r.sourceId,
                    fromName: fromWorld ? (fromWorld.name || r.sourceId) : r.sourceId,
                    read: r.data.read || '',
                    write: r.data.write || '',
                    move: r.data.move || 'S',
                    toId: r.targetId,
                    toName: toWorld ? (toWorld.name || r.targetId) : r.targetId,
                    _relation: r
                });
            }
        }
        return rules;
    }

    /** Export the entire config: worlds (as states), rules, and tape */
    exportConfig() {
        const states = [];
        this.model.worlds.forEach(w => {
            states.push({ id: w.id, name: w.name || w.id, x: w.x, y: w.y });
        });

        const rules = this.getTransitionTable().map(r => ({
            from: r.fromId,
            read: r.read,
            write: r.write,
            move: r.move,
            to: r.toId
        }));

        return {
            type: 'turing-machine-config',
            version: 1,
            states: states,
            rules: rules,
            tape: this.getTapeString(),
            startState: this.currentStateId || (states.length > 0 ? states[0].id : null)
        };
    }

    /** Import a config, rebuilding worlds and relations */
    importConfig(config) {
        if (!config || config.type !== 'turing-machine-config') {
            throw new Error('Invalid Turing Machine config file.');
        }

        // Clear existing model
        this.model.worlds.clear();
        this.model.relations = [];
        this.reset();

        // Rebuild states as worlds
        for (const s of (config.states || [])) {
            const w = new World(s.id, s.x || 0, s.y || 0);
            w.name = s.name || s.id;
            this.model.addWorld(w);
        }

        // Rebuild rules as relations
        for (const r of (config.rules || [])) {
            this.model.addRelation(r.from, r.to, 'a', {
                read: r.read,
                write: r.write,
                move: r.move
            });
        }

        // Load tape
        if (config.tape) {
            this.loadTape(config.tape);
        }

        // Set start state
        if (config.startState) {
            this.setStartWorld(config.startState);
        }
    }
}
