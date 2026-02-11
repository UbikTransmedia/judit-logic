import { World, Relation } from './logic.js';

export const SNIPPETS = {
    clear: `// Clear the Universe
model.worlds.clear();
model.relations = [];
model.domain.clear();
model.domain.add('d1');`,

    grid: `// Generate 5x5 Grid
model.worlds.clear();
model.relations = [];

for(let y=0; y<5; y++) {
    for(let x=0; x<5; x++) {
        const id = \`w_\${x}_\${y}\`;
        const w = new World(id, x*60, y*60);
        model.addWorld(w);
        
        // Horizontal Link
        if(x > 0) {
            const left = \`w_\${x-1}_\${y}\`;
            model.addRelation(left, id, 'a');
            model.addRelation(id, left, 'a'); // Bidirectional
        }
        // Vertical Link
        if(y > 0) {
            const up = \`w_\${x}_\${y-1}\`;
            model.addRelation(up, id, 'b');
            model.addRelation(id, up, 'b');
        }
    }
}`,

    tree: `// Generate Binary Tree
model.worlds.clear();
model.relations = [];

const addNode = (id, x, y, depth) => {
    if(depth > 4) return;
    const w = new World(id, x, y);
    model.addWorld(w);
    
    const leftId = id + 'L';
    const rightId = id + 'R';
    const offset = 120 / (depth + 1);
    
    addNode(leftId, x - offset*2, y + 80, depth+1);
    addNode(rightId, x + offset*2, y + 80, depth+1);
    
    if(depth <= 3) {
        model.addRelation(id, leftId, 'a');
        model.addRelation(id, rightId, 'a');
    }
};

addNode('root', 300, 50, 0);`,

    circle: `// Generate Circle
model.worlds.clear();
model.relations = [];

const N = 8;
const R = 150;
const CX = 300, CY = 250;

for(let i=0; i<N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const x = CX + Math.cos(angle) * R;
    const y = CY + Math.sin(angle) * R;
    
    const id = 'w' + i;
    model.addWorld(new World(id, x, y));
    
    const next = 'w' + ((i+1) % N);
    model.addRelation(id, next, 'a', { read: '0', write: '1', move: 'R' });
}
`,
    turing: `// Binary Increment Machine
model.worlds.clear();
model.relations = [];

// States
const s0 = new World('s0', 100, 100); s0.name = "Scan Right";
const s1 = new World('s1', 300, 100); s1.name = "Add One";
const sHalt = new World('halt', 500, 100); sHalt.name = "Halt";

model.addWorld(s0);
model.addWorld(s1);
model.addWorld(sHalt);

// Rules
// s0: Skip 0s and 1s moving Right to find end
model.addRelation('s0', 's0', 'a', { read: '0', write: '0', move: 'R' });
model.addRelation('s0', 's0', 'a', { read: '1', write: '1', move: 'R' });
model.addRelation('s0', 's1', 'a', { read: 'B', write: 'B', move: 'L' }); // Hit end, go back

// s1: Add one (Flip 1->0 move L, Flip 0->1 Halt)
model.addRelation('s1', 's1', 'a', { read: '1', write: '0', move: 'L' }); // Carry
model.addRelation('s1', 'halt', 'a', { read: '0', write: '1', move: 'S' }); // Done
model.addRelation('s1', 'halt', 'a', { read: 'B', write: '1', move: 'S' }); // New digit

turing.setStartWorld('s0');
turing.loadTape("1011");
`,

    random_walk: `// Generar Camino Aleatorio
const N = 6;
model.worlds.clear();
model.relations = [];

let prevId = null;
for(let i=0; i<N; i++) {
    const id = 'v' + i;
    const w = new World(id, 100 + i*80, 200 + (Math.random()-0.5)*150);
    model.addWorld(w);
    if(prevId) model.addRelation(prevId, id, 'a');
    prevId = id;
}
console.log("Camino generado con " + N + " mundos.");`,

    star: `// Topología de Estrella (Central Hub)
model.worlds.clear();
model.relations = [];

const Hub = new World('hub', 300, 250);
Hub.name = "CENTER";
model.addWorld(Hub);

for(let i=1; i<=6; i++) {
    const angle = (i/6) * Math.PI * 2;
    const w = new World('leaf'+i, 300 + Math.cos(angle)*150, 250 + Math.sin(angle)*150);
    model.addWorld(w);
    model.addRelation('hub', 'leaf'+i, 'a');
    model.addRelation('leaf'+i, 'hub', 'a');
}`,

    kripke_reflexive: `// Convertir todos los mundos en Reflexivos (S4/S5)
model.worlds.forEach(w => {
    // Solo añade si no existe
    const exists = model.relations.some(r => r.sourceId === w.id && r.targetId === w.id && r.agent === 'a');
    if(!exists) model.addRelation(w.id, w.id, 'a');
});
console.log("Relación reflexiva añadida a todos los mundos (Agente a).");`,

    kripke_symmetric: `// Convertir todas las relaciones en Simétricas (B/S5)
const mirrored = [];
model.relations.forEach(r => {
    const exists = model.relations.some(rev => rev.sourceId === r.targetId && rev.targetId === r.sourceId && rev.agent === r.agent);
    if(!exists) mirrored.push({s: r.targetId, t: r.sourceId, a: r.agent});
});
mirrored.forEach(m => model.addRelation(m.s, m.t, m.a));
console.log("Añadidas " + mirrored.length + " relaciones simétricas.");`,

    bipartite: `// Generate Bipartite Graph
model.worlds.clear();
model.relations = [];

// Set A (Left)
for(let i=0; i<3; i++) {
    model.addWorld(new World(\`A\${i}\`, 200, 100 + i*100));
}
// Set B (Right)
for(let i=0; i<3; i++) {
    model.addWorld(new World(\`B\${i}\`, 500, 100 + i*100));
}

// Connect every A to every B
for(let i=0; i<3; i++) {
    for(let j=0; j<3; j++) {
        model.addRelation(\`A\${i}\`, \`B\${j}\`, 'a');
    }
}
console.log("Bipartite K3,3 generated.");`,

    full_tree: `// Generate Full Binary Tree
model.worlds.clear();
model.relations = [];

function createNode(id, x, y, level) {
    if (level > 3) return;
    model.addWorld(new World(id, x, y));
    const leftId = \`\${id}L\`;
    const rightId = \`\${id}R\`;
    const offset = 160 / (level + 1);
    
    if (level < 3) {
        createNode(leftId, x - offset, y + 80, level + 1);
        createNode(rightId, x + offset, y + 80, level + 1);
        model.addRelation(id, leftId, 't');
        model.addRelation(id, rightId, 't');
    }
}

createNode('root', 350, 50, 0);`,

    ring: `// Generate Ring Topology
model.worlds.clear();
model.relations = [];

const N = 8;
for(let i=0; i<N; i++) {
    const angle = (i / N) * Math.PI * 2;
    model.addWorld(new World(\`v\${i}\`, 350 + Math.cos(angle)*150, 250 + Math.sin(angle)*150));
}

for(let i=0; i<N; i++) {
    const next = (i + 1) % N;
    model.addRelation(\`v\${i}\`, \`v\${next}\`, 'r');
}
console.log("Ring of " + N + " worlds generated.");`,

    self_loops: `// Add Self-Loops to all worlds
model.worlds.forEach(w => {
    const hasLoop = model.relations.some(r => r.sourceId === w.id && r.targetId === w.id);
    if (!hasLoop) model.addRelation(w.id, w.id, 's');
});
console.log("Self-loops added to all worlds.");`
};

export class ScriptEngine {
    constructor(model, turing, renderer) {
        this.model = model;
        this.turing = turing;
        this.renderer = renderer;
    }

    run(code, logger = null) {
        try {
            // Function closure to redirect console
            const customConsole = {
                log: (...args) => {
                    console.log(...args);
                    if (logger) logger(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
                },
                error: (...args) => {
                    console.error(...args);
                    if (logger) logger("ERROR: " + args.join(' '));
                },
                warn: (...args) => {
                    console.warn(...args);
                    if (logger) logger("WARN: " + args.join(' '));
                },
                clear: () => {
                    if (logger) logger(null); // Signal clear
                }
            };

            const func = new Function('model', 'turing', 'World', 'Relation', 'console', `
                "use strict";
                ${code}
            `);

            func(this.model, this.turing, World, Relation, customConsole);

            this.renderer.resize();
            this.renderer.draw();

            return { success: true };
        } catch (e) {
            console.error("Script Error:", e);
            if (logger) logger("CRASH: " + e.message);
            return { success: false, error: e.message };
        }
    }
}
