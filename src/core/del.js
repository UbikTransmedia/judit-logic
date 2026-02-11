
import { World, Relation, Model } from './logic.js';

export class ActionEvent {
    constructor(id, precondition) {
        this.id = id;
        this.precondition = precondition; // Formula
    }
}

export class ActionModel {
    constructor() {
        this.events = []; // Array<ActionEvent>
        this.relations = []; // Array<{from: id, to: id, agent: agent}>
    }

    addEvent(event) {
        this.events.push(event);
    }

    addRelation(fromId, toId, agent) {
        this.relations.push({ from: fromId, to: toId, agent: agent });
    }
}

export function productUpdate(M, A) {
    const newModel = new Model();

    // 1. Generate New Worlds pairs (w, e)
    // where M, w |= pre(e)
    const newWorldsMap = new Map(); // "wId-eId" -> newWorldObject

    for (const w of M.worlds.values()) {
        for (const e of A.events) {
            // Check precondition
            // Note: precondition might need 'evaluate' method.
            // Assumption: e.precondition is a Formula object.

            // We use standard evaluation (system K usually for preconditions?)
            // Or inherit system? Let's assume K for now.
            try {
                if (e.precondition.evaluate(M, w)) {
                    // Create new world
                    const newId = `${w.id}_${e.id}`;
                    // Position: we might need to layout logically. 
                    // For now, simple offset or same pos? 
                    // Let's use same pos + slight random to avoid exact overlap if multiple events match.
                    const newW = new World(newId, w.x + (Math.random() * 20 - 10), w.y + (Math.random() * 20 - 10));

                    // Name: "w,e"
                    newW.name = `${w.name},${e.id}`;

                    // Inherit Valuation
                    newW.valuation = new Map(w.valuation);
                    newW.color = w.color; // Inherit color?

                    newModel.addWorld(newW);
                    newWorldsMap.set(newId, { w, e, newW });
                }
            } catch (err) {
                console.error(`Error evaluating precondition for ${e.id} at ${w.id}:`, err);
            }
        }
    }

    // 2. Generate Relations
    // R_ag((w,e), (w',e')) iff R_ag(w,w') AND R_ag(e,e')

    // We iterate over all pairs of NEW worlds
    const newWorldKeys = Array.from(newWorldsMap.keys());

    for (const id1 of newWorldKeys) {
        for (const id2 of newWorldKeys) {
            const { w: w1, e: e1 } = newWorldsMap.get(id1);
            const { w: w2, e: e2 } = newWorldsMap.get(id2);

            // Check agents?
            // We need to iterate over all possible agents? 
            // Or look at existing relations?
            // Optimization: Look at M's relations and A's relations.

            // M relations between w1 and w2
            const mRels = M.relations.filter(r => r.sourceId === w1.id && r.targetId === w2.id);

            // A relations between e1 and e2
            const aRels = A.relations.filter(r => r.from === e1.id && r.to === e2.id);

            // Intersection by Agent
            const agents = new Set([...mRels.map(r => r.agent), ...aRels.map(r => r.agent)]);

            agents.forEach(agent => {
                const hasM = mRels.some(r => r.agent === agent);
                const hasA = aRels.some(r => r.agent === agent);

                if (hasM && hasA) {
                    newModel.addRelation(id1, id2, agent);
                }
            });
        }
    }

    return newModel;
}
