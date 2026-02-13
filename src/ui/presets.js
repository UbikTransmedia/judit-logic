
export const PRESETS = [
    {
        name: "Prisoner's Dilemma",
        desc: "Two prisoners (a, b) decide whether to Cooperate (p) or Defect (q). Unaware of each other's choice.",
        complexity: 2, worldsCount: 4, agentsCount: 2,
        tags: ["Game Theory", "Epistemic"],
        data: {
            worlds: [
                { id: "w1", x: 200, y: 100, name: "CC", description: "Both Cooperate", color: "#2c3e50", textColor: "#eee", valuation: [["p", true], ["q", true]] },
                { id: "w2", x: 400, y: 100, name: "CD", description: "A Coops, B Defects", color: "#2c3e50", textColor: "#eee", valuation: [["p", true]] },
                { id: "w3", x: 200, y: 300, name: "DC", description: "A Defects, B Coops", color: "#2c3e50", textColor: "#eee", valuation: [["q", true]] },
                { id: "w4", x: 400, y: 300, name: "DD", description: "Both Defect", color: "#2c3e50", textColor: "#eee", valuation: [] }
            ],
            relations: [
                { sourceId: "w1", targetId: "w2", agent: "a" }, { sourceId: "w2", targetId: "w1", agent: "a" },
                { sourceId: "w3", targetId: "w4", agent: "a" }, { sourceId: "w4", targetId: "w3", agent: "a" },
                { sourceId: "w1", targetId: "w3", agent: "b" }, { sourceId: "w3", targetId: "w1", agent: "b" },
                { sourceId: "w2", targetId: "w4", agent: "b" }, { sourceId: "w4", targetId: "w2", agent: "b" }
            ]
        }
    },
    {
        name: "Brain in a Vat",
        desc: "Skeptical scenario: You cannot distinguish between Reality (p) or a Simulation (q).",
        complexity: 1, worldsCount: 2, agentsCount: 1,
        tags: ["philosophy", "Epistemic"],
        data: {
            worlds: [
                { id: "real", x: 200, y: 200, name: "Reality", valuation: [["p", true]] },
                { id: "sim", x: 450, y: 200, name: "Simulation", valuation: [["q", true]] }
            ],
            relations: [
                { sourceId: "real", targetId: "sim", agent: "a" },
                { sourceId: "sim", targetId: "real", agent: "a" }
            ]
        }
    },
    {
        name: "Experience Machine (Nozick)",
        desc: "Choose between Reality (p) and a Machine (q) that grants perfect pleasure. Models the hedonistic trade-off.",
        complexity: 2, worldsCount: 2, agentsCount: 1,
        tags: ["philosophy", "Ethics"],
        data: {
            worlds: [
                { id: "real", x: 200, y: 200, name: "Actual Reality", valuation: [["p", true], ["suffering", true]] },
                { id: "machine", x: 450, y: 200, name: "Hedonist Machine", valuation: [["q", true], ["pleasure", true]] }
            ],
            relations: [
                { sourceId: "real", targetId: "machine", agent: "choice" }
            ]
        }
    },
    {
        name: "Pascal's Wager",
        desc: "Infinite Utility: Believing in God (p) has infinite payoff if He exists (q). Models decision under uncertainty.",
        complexity: 3, worldsCount: 4, agentsCount: 1,
        tags: ["philosophy", "Logic"],
        data: {
            worlds: [
                { id: "bE", x: 150, y: 150, name: "Believe_Exists", valuation: [["p", true], ["q", true], ["inf", true]] },
                { id: "bN", x: 450, y: 150, name: "Believe_NotExists", valuation: [["p", true]] },
                { id: "dE", x: 150, y: 350, name: "Disbelieve_Exists", valuation: [["q", true], ["negInf", true]] },
                { id: "dN", x: 450, y: 350, name: "Disbelieve_NotExists", valuation: [] }
            ],
            relations: [
                { sourceId: "bE", targetId: "bN", agent: "a" },
                { sourceId: "dE", targetId: "dN", agent: "a" }
            ]
        }
    },
    {
        name: "Veil of Ignorance (Rawls)",
        desc: "Design justice from the 'Original Position'. You don't know your social status (p, q, r).",
        complexity: 4, worldsCount: 3, agentsCount: 1,
        tags: ["philosophy", "Political"],
        data: {
            worlds: [
                { id: "rich", x: 150, y: 200, name: "High Class", valuation: [["p", true]] },
                { id: "mid", x: 300, y: 200, name: "Middle Class", valuation: [["q", true]] },
                { id: "poor", x: 450, y: 200, name: "Low Class", valuation: [["r", true]] }
            ],
            relations: [
                { sourceId: "rich", targetId: "mid", agent: "veil" },
                { sourceId: "mid", targetId: "poor", agent: "veil" },
                { sourceId: "rich", targetId: "poor", agent: "veil" },
                { sourceId: "mid", targetId: "rich", agent: "veil" },
                { sourceId: "poor", targetId: "mid", agent: "veil" },
                { sourceId: "poor", targetId: "rich", agent: "veil" }
            ]
        }
    },
    {
        name: "The Trolley Problem",
        desc: "Moral choice: To save 5 (p), you must sacrifice 1 (q). Classical Utilitarian dilemma.",
        complexity: 2, worldsCount: 2, agentsCount: 1,
        tags: ["philosophy", "Ethics"],
        data: {
            worlds: [
                { id: "straight", x: 150, y: 200, name: "Main Track", valuation: [["danger5", true]] },
                { id: "side", x: 450, y: 200, name: "Side Track", valuation: [["danger1", true]] }
            ],
            relations: [
                { sourceId: "straight", targetId: "side", agent: "moral" }
            ]
        }
    },
    {
        name: "Schrödinger's Cat",
        desc: "Superposition: The cat is observed (obs) or unobserved. If unobserved, it is both Alive (p) and Dead (q).",
        complexity: 4, worldsCount: 3, agentsCount: 1,
        tags: ["philosophy", "Physics"],
        data: {
            worlds: [
                { id: "alive", x: 150, y: 150, name: "Alive", valuation: [["p", true]] },
                { id: "dead", x: 450, y: 150, name: "Dead", valuation: [["q", true]] },
                { id: "box", x: 300, y: 350, name: "Inside Box", valuation: [["sealed", true]] }
            ],
            relations: [
                { sourceId: "box", targetId: "alive", agent: "a" },
                { sourceId: "box", targetId: "dead", agent: "a" }
            ]
        }
    },
    {
        name: "Ship of Theseus",
        desc: "Identity paradox over time. Is it the Same Ship (p) or a New Ship (q)?",
        complexity: 3, worldsCount: 3, agentsCount: 1,
        tags: ["philosophy", "Metaphysics"],
        data: {
            worlds: [
                { id: "original", x: 100, y: 200, name: "Original", valuation: [["id", true]] },
                { id: "replaced", x: 300, y: 200, name: "GradualChange", valuation: [["id", true], ["new", true]] },
                { id: "reassembled", x: 500, y: 200, name: "OldParts", valuation: [["p", true]] }
            ],
            relations: [
                { sourceId: "original", targetId: "replaced", agent: "t" },
                { sourceId: "replaced", targetId: "reassembled", agent: "t" }
            ]
        }
    },
    {
        name: "Plato's Cave",
        desc: "Perception vs Reality. Shadows (p) vs Outside World (q).",
        complexity: 4, worldsCount: 2, agentsCount: 2,
        tags: ["philosophy", "Epistemic"],
        data: {
            worlds: [
                { id: "cave", x: 200, y: 200, name: "The Cave", valuation: [["shadows", true]] },
                { id: "sun", x: 500, y: 200, name: "Outside", valuation: [["reality", true]] }
            ],
            relations: [
                { sourceId: "cave", targetId: "cave", agent: "p" },
                { sourceId: "cave", targetId: "sun", agent: "a" }
            ]
        }
    },
    {
        name: "Newcomb's Paradox",
        desc: "A predictor knows your choice. Affects a past prediction about a reward.",
        complexity: 5, worldsCount: 4, agentsCount: 2,
        tags: ["philosophy", "Decision Theory"],
        data: {
            worlds: [
                { id: "oP", x: 150, y: 150, name: "1Box_Correct", valuation: [["boxes1", true], ["pred1", true]] },
                { id: "oF", x: 450, y: 150, name: "1Box_Fail", valuation: [["boxes1", true]] },
                { id: "tP", x: 150, y: 350, name: "2Box_Correct", valuation: [["boxes2", true], ["pred2", true]] },
                { id: "tF", x: 450, y: 350, name: "2Box_Fail", valuation: [["boxes2", true]] }
            ],
            relations: [
                { sourceId: "oP", targetId: "oF", agent: "logic" },
                { sourceId: "tP", targetId: "tF", agent: "logic" }
            ]
        }
    },
    {
        name: "Complete Graph (K4)",
        desc: "Structural Template: 4 worlds where every world is connected to every other (Universal Access).",
        complexity: 3, worldsCount: 4, agentsCount: 1,
        tags: ["Structural", "Template"],
        data: {
            worlds: [
                { id: "w1", x: 300, y: 100, name: "World 1", valuation: [["p", true]] },
                { id: "w2", x: 500, y: 300, name: "World 2", valuation: [["q", true]] },
                { id: "w3", x: 300, y: 500, name: "World 3", valuation: [["r", true]] },
                { id: "w4", x: 100, y: 300, name: "World 4", valuation: [["s", true]] }
            ],
            relations: [
                { sourceId: "w1", targetId: "w2", agent: "u" }, { sourceId: "w1", targetId: "w3", agent: "u" }, { sourceId: "w1", targetId: "w4", agent: "u" },
                { sourceId: "w2", targetId: "w1", agent: "u" }, { sourceId: "w2", targetId: "w3", agent: "u" }, { sourceId: "w2", targetId: "w4", agent: "u" },
                { sourceId: "w3", targetId: "w1", agent: "u" }, { sourceId: "w3", targetId: "w2", agent: "u" }, { sourceId: "w3", targetId: "w4", agent: "u" },
                { sourceId: "w4", targetId: "w1", agent: "u" }, { sourceId: "w4", targetId: "w2", agent: "u" }, { sourceId: "w4", targetId: "w3", agent: "u" }
            ]
        }
    },
    {
        name: "Mary's Room (Jackson)",
        desc: "Epistemic/Qualia: Mary knows all physical facts (p) but discovers the experience of Red (q) when leaving.",
        complexity: 3, worldsCount: 2, agentsCount: 1,
        tags: ["philosophy", "Epistemic"],
        data: {
            worlds: [
                { id: "room", x: 200, y: 200, name: "Black & White Room", valuation: [["knowsAllPhysics", true]] },
                { id: "outside", x: 500, y: 200, name: "Outside World", valuation: [["knowsAllPhysics", true], ["knowsRed", true]] }
            ],
            relations: [
                { sourceId: "room", targetId: "outside", agent: "m" }
            ]
        }
    },
    {
        name: "Swampman (Davidson)",
        desc: "Identity/Causality: A lightning strike creates a molecule-for-molecule replica (p) of a man (q).",
        complexity: 4, worldsCount: 2, agentsCount: 1,
        tags: ["philosophy", "Metaphysics"],
        data: {
            worlds: [
                { id: "man", x: 250, y: 150, name: "Original Man", valuation: [["history", true], ["dna", true]] },
                { id: "swamp", x: 250, y: 350, name: "Swampman", valuation: [["dna", true]] }
            ],
            relations: [
                { sourceId: "man", targetId: "swamp", agent: "id" }
            ]
        }
    },
    {
        name: "Utility Monster (Nozick)",
        desc: "Ethics: A being (m) gains much more utility (u) from resources than others. Critique of Utilitarianism.",
        complexity: 3, worldsCount: 2, agentsCount: 2,
        tags: ["philosophy", "Ethics"],
        data: {
            worlds: [
                { id: "fair", x: 200, y: 200, name: "Equal Distribution", valuation: [["u_everyone", true]] },
                { id: "monster", x: 500, y: 200, name: "Monster Fed", valuation: [["u_monster_max", true], ["u_everyone_low", true]] }
            ],
            relations: [
                { sourceId: "fair", targetId: "monster", agent: "utility" }
            ]
        }
    },
    {
        name: "Existential Risk (The Precipice)",
        desc: "Probability: Models the 'precipice' (p) where human extinction (q) is possible from multiple paths.",
        complexity: 5, worldsCount: 5, agentsCount: 1,
        tags: ["philosophy", "Sociology"],
        data: {
            worlds: [
                { id: "now", x: 300, y: 100, name: "Present Day", valuation: [["stable", true]] },
                { id: "nuke", x: 100, y: 300, name: "Nuclear War", valuation: [["risk", true]] },
                { id: "bio", x: 250, y: 350, name: "Bio Pathogen", valuation: [["risk", true]] },
                { id: "ai", x: 400, y: 350, name: "AI Alignment", valuation: [["risk", true]] },
                { id: "extinct", x: 300, y: 500, name: "Extinction", valuation: [["dead", true]] }
            ],
            relations: [
                { sourceId: "now", targetId: "nuke", agent: "t" },
                { sourceId: "now", targetId: "bio", agent: "t" },
                { sourceId: "now", targetId: "ai", agent: "t" },
                { sourceId: "nuke", targetId: "extinct", agent: "t" },
                { sourceId: "bio", targetId: "extinct", agent: "t" },
                { sourceId: "ai", targetId: "extinct", agent: "t" }
            ]
        }
    },
    {
        name: "Infinite Monkey Theorem",
        desc: "Probability: Given infinite time (t), a monkey (m) hitting keys will eventually type Shakespeare (p).",
        complexity: 2, worldsCount: 3, agentsCount: 1,
        tags: ["philosophy", "Logic"],
        data: {
            worlds: [
                { id: "start", x: 100, y: 200, name: "Random Keys", valuation: [] },
                { id: "mid", x: 300, y: 200, name: "Finite Substrings", valuation: [["noise", true]] },
                { id: "target", x: 500, y: 200, name: "The Sonnets", valuation: [["shakespeare", true]] }
            ],
            relations: [
                { sourceId: "start", targetId: "mid", agent: "t" },
                { sourceId: "mid", targetId: "mid", agent: "t" },
                { sourceId: "mid", targetId: "target", agent: "t" }
            ]
        }
    },
    {
        name: "Moore's Paradox",
        desc: "Epistemic/Doxastic: 'p is true (p), but I don't believe p (not Bp)'. Models the absurdity of self-denial.",
        complexity: 4, worldsCount: 2, agentsCount: 1,
        tags: ["Logic", "Epistemic"],
        data: {
            worlds: [
                { id: "w1", x: 200, y: 200, name: "World_p", valuation: [["p", true]] },
                { id: "w2", x: 450, y: 200, name: "Belief_non_p", valuation: [] }
            ],
            relations: [
                { sourceId: "w1", targetId: "w2", agent: "a" }
            ]
        }
    },
    {
        name: "Condorcet's Paradox",
        desc: "Social Choice: Group preferences can be cyclic (A > B, B > C, C > A) even if individuals are rational.",
        complexity: 3, worldsCount: 3, agentsCount: 3,
        tags: ["Logic", "Decision Theory"],
        data: {
            worlds: [
                { id: "A", x: 300, y: 150, name: "A Wins", valuation: [["winA", true]] },
                { id: "B", x: 500, y: 400, name: "B Wins", valuation: [["winB", true]] },
                { id: "C", x: 100, y: 400, name: "C Wins", valuation: [["winC", true]] }
            ],
            relations: [
                { sourceId: "A", targetId: "B", agent: "majority" },
                { sourceId: "B", targetId: "C", agent: "majority" },
                { sourceId: "C", targetId: "A", agent: "majority" }
            ]
        }
    },
    {
        name: "Fitch's Knowability Paradox",
        desc: "If every truth (p) is knowable (Kp), it follows that every truth is ALREADY known.",
        complexity: 5, worldsCount: 3, agentsCount: 1,
        tags: ["Logic", "Paradox"],
        data: {
            worlds: [
                { id: "w1", x: 150, y: 200, name: "Truth_Unknown", valuation: [["p", true], ["unknown", true]] },
                { id: "w2", x: 350, y: 200, name: "Truth_Known", valuation: [["p", true], ["known", true]] },
                { id: "w3", x: 550, y: 200, name: "Other_State", valuation: [] }
            ],
            relations: [
                { sourceId: "w1", targetId: "w2", agent: "k" },
                { sourceId: "w2", targetId: "w2", agent: "k" }
            ]
        }
    },
    {
        name: "Achilles and Tortoise (Zeno)",
        desc: "Infinite tasks: Achilles (a) must reach the Tortoise's previous position, creating an infinite series.",
        complexity: 2, worldsCount: 4, agentsCount: 1,
        tags: ["Logic", "Physics"],
        data: {
            worlds: [
                { id: "d0", x: 100, y: 200, name: "Start", valuation: [["t0", true]] },
                { id: "d1", x: 250, y: 200, name: "Step 1", valuation: [["t1", true]] },
                { id: "d2", x: 400, y: 200, name: "Step 2", valuation: [["t2", true]] },
                { id: "d3", x: 550, y: 200, name: "Step 3...", valuation: [["inf", true]] }
            ],
            relations: [
                { sourceId: "d0", targetId: "d1", agent: "t" },
                { sourceId: "d1", targetId: "d2", agent: "t" },
                { sourceId: "d2", targetId: "d3", agent: "t" },
                { sourceId: "d3", targetId: "d3", agent: "t" }
            ]
        }
    },
    {
        name: "Existential Tension",
        desc: "Varying Domains: Object 'a' exists everywhere, but 'b' only exists in the right world. Affects 'all x' quantification.",
        complexity: 3, worldsCount: 2, agentsCount: 1,
        tags: ["FOL", "Metaphysics"],
        data: {
            domain: ["a", "b"],
            worlds: [
                { id: "w1", x: 200, y: 200, name: "The Small World", domain: ["a"], valuation: [["p", true], ["P(a)", true]] },
                { id: "w2", x: 500, y: 200, name: "The Large World", domain: ["a", "b"], valuation: [["p", true], ["P(a)", true]] }
            ],
            relations: [{ sourceId: "w1", targetId: "w2", agent: "t" }]
        }
    },
    {
        name: "The Knowledge of One",
        desc: "Epistemic FOL: Agent 'a' knows that someone has property P, but doesn't know WHO.",
        complexity: 4, worldsCount: 2, agentsCount: 1,
        tags: ["FOL", "Epistemic"],
        data: {
            domain: ["obj1", "obj2"],
            worlds: [
                { id: "w1", x: 200, y: 200, name: "Fact: Obj1", valuation: [["p", true], ["P(obj1)", true]] },
                { id: "w2", x: 500, y: 200, name: "Fact: Obj2", valuation: [["p", true], ["P(obj2)", true]] }
            ],
            relations: [
                { sourceId: "w1", targetId: "w2", agent: "a" },
                { sourceId: "w2", targetId: "w1", agent: "a" }
            ]
        }
    },
    {
        name: "Syllogism: Baroco",
        desc: "Visualizing a classic valid syllogism: 'All P are M, Some S are not M, therefore Some S are not P'.",
        complexity: 2, worldsCount: 1, agentsCount: 0,
        tags: ["FOL", "Classical"],
        data: {
            domain: ["s1", "s2", "p1", "m1"],
            worlds: [
                {
                    id: "w1", x: 350, y: 300, name: "Model",
                    valuation: [
                        ["p", true], ["q", true],
                        ["P(p1)", true], ["M(p1)", true],
                        ["P(m1)", true], ["M(m1)", true],
                        ["S(s1)", true], ["M(s1)", false],
                        ["S(s2)", true], ["M(s2)", true], ["P(s2)", true]
                    ]
                }
            ],
            relations: []
        }
    },
    {
        name: "Identity of Indiscernibles",
        desc: "Metaphysics: Two objects 'obj1' and 'obj2' that share all properties (P, Q). Are they really distinct?",
        complexity: 2, worldsCount: 1, agentsCount: 0,
        tags: ["FOL", "Metaphysics"],
        data: {
            domain: ["obj1", "obj2"],
            worlds: [{ id: "w1", x: 350, y: 300, name: "The Model", valuation: [["p", true], ["P(obj1)", true], ["P(obj2)", true], ["Q(obj1)", true], ["Q(obj2)", true]] }]
        }
    },
    {
        name: "The Solipsist",
        desc: "A world where only one object 'me' exists. Affects 'all' and 'exists' in unique ways.",
        complexity: 1, worldsCount: 1, agentsCount: 0,
        tags: ["FOL", "Philosophy"],
        data: {
            domain: ["me"],
            worlds: [{ id: "w1", x: 350, y: 300, name: "Ego", valuation: [["p", true], ["P(me)", true]] }]
        }
    },
    {
        name: "Expanding Universe",
        desc: "Growth: World A has only 1 object, World B has 2. Models how truth changes as objects are discovered.",
        complexity: 3, worldsCount: 2, agentsCount: 1,
        tags: ["FOL", "Metaphysics"],
        data: {
            domain: ["a", "b"],
            worlds: [
                { id: "w1", x: 200, y: 200, name: "Past", domain: ["a"], valuation: [["p", true], ["P(a)", true]] },
                { id: "w2", x: 500, y: 200, name: "Future", domain: ["a", "b"], valuation: [["p", true], ["P(a)", true], ["P(b)", true]] }
            ],
            relations: [{ sourceId: "w1", targetId: "w2", agent: "t" }]
        }
    },
    {
        name: "Social Network",
        desc: "Relations: Modeling 'Friend(x, y)'. Shows transitivity/symmetry in FOL properties.",
        complexity: 3, worldsCount: 1, agentsCount: 0,
        tags: ["FOL", "Sociology"],
        data: {
            domain: ["alice", "bob", "charlie"],
            worlds: [{
                id: "w1", x: 350, y: 300, name: "Network",
                valuation: [
                    ["p", true],
                    ["Friend(alice, bob)", true], ["Friend(bob, alice)", true],
                    ["Friend(bob, charlie)", true], ["Friend(charlie, bob)", true]
                ]
            }]
        }
    },
    {
        name: "The Secret (Epistemic FOL)",
        desc: "Agent 'a' knows that Neo (obj1) is the one (P), but Agent 'b' is uncertain.",
        complexity: 4, worldsCount: 2, agentsCount: 2,
        tags: ["FOL", "Epistemic"],
        data: {
            domain: ["obj1", "obj2"],
            worlds: [
                { id: "w1", x: 200, y: 200, name: "Fact", valuation: [["p", true], ["P(obj1)", true]] },
                { id: "w2", x: 500, y: 200, name: "Possibility", valuation: [["P(obj2)", true]] }
            ],
            relations: [
                { sourceId: "w1", targetId: "w1", agent: "a" }, // a knows
                { sourceId: "w1", targetId: "w2", agent: "b" }, // b is uncertain
                { sourceId: "w2", targetId: "w1", agent: "b" }
            ]
        }
    },
    {
        name: "Square of Opposition",
        desc: "Aristotle: A (All S are P) vs O (Some S are not P). Contradictories and contraries.",
        complexity: 4, worldsCount: 4, agentsCount: 1,
        tags: ["FOL", "Classical"],
        data: {
            domain: ["s1", "s2"],
            worlds: [
                { id: "A", x: 150, y: 150, name: "All S are P", valuation: [["p", true], ["S(s1)", true], ["P(s1)", true], ["S(s2)", true], ["P(s2)", true]] },
                { id: "E", x: 450, y: 150, name: "No S is P", valuation: [["p", true], ["S(s1)", true], ["P(s1)", false], ["S(s2)", true], ["P(s2)", false]] },
                { id: "I", x: 150, y: 350, name: "Some S is P", valuation: [["q", true], ["S(s1)", true], ["P(s1)", true], ["S(s2)", true], ["P(s2)", false]] },
                { id: "O", x: 450, y: 350, name: "Some S is not P", valuation: [["q", true], ["S(s1)", true], ["P(s1)", false], ["S(s2)", true], ["P(s2)", true]] }
            ],
            relations: []
        }
    },
    {
        name: "Empty World (Non-Empty Domain Rule)",
        desc: "Standard FOL requires one object. This 'Empty' world shows why 'exists x. top' is usually a tautology.",
        complexity: 2, worldsCount: 1, agentsCount: 0,
        tags: ["FOL", "Logic"],
        data: {
            domain: [], // Purely empty
            worlds: [{ id: "empty", x: 350, y: 300, name: "The Void", domain: [], valuation: [["v", true]] }]
        }
    }
];
