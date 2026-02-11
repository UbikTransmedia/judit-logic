export const LESSONS = [
    {
        id: 1,
        title: "Welcome to JUDIT: The Logos Lab",
        content: `
            <div class="lesson-card">
                <h2>1. Welcome to JUDIT: The Logos Lab</h2>
                <div class="lesson-quote">
                    "Logic is the beginning of wisdom, not the end." — Spock
                </div>
                <p>Welcome to <strong>JUDIT</strong>, a specialized Formal Systems Laboratory. This environment is not just a tool; it is a bridge between the abstract realms of <strong>Mathematical Logic</strong>, <strong>Theoretical Computer Science</strong>, and <strong>Cybernetic Philosophy</strong>.</p>
                
                <p>In this course, we will explore the fundamental question that has haunted thinkers like Leibniz, Frege, and Turing: <em>Can the processes of human reason and the structure of reality itself be mapped into a formal, calculable system?</em></p>

                <h3>What You Will Learn</h3>
                <p>This is not a quick tutorial. It is a progressive, interdisciplinary journey organized into five major arcs:</p>
                <ol>
                    <li><strong>Arc I — Classical Logic (Lessons 1-4):</strong> The atoms, connectives, and truth tables that form the bedrock of all formal reasoning. You will learn how to express any statement in a precise symbolic language.</li>
                    <li><strong>Arc II — Modal & Epistemic Logic (Lessons 5-13):</strong> We leave the single-world view behind and enter the universe of <em>Possible Worlds</em>, where truth depends on perspective, knowledge flows between agents, and announcements reshape reality.</li>
                    <li><strong>Arc III — Computation (Lessons 14-19):</strong> From Turing's mechanical tape to Church's mathematical functions. Two radically different answers to the same question: "What can be computed?"</li>
                    <li><strong>Arc IV — The Curry-Howard Bridge (Lessons 20-24):</strong> The deepest lesson of all. We discover that <em>writing a program</em> and <em>constructing a proof</em> are the same activity, viewed from different angles. This is developed step-by-step across five progressive lessons.</li>
                    <li><strong>Arc V — Systems & Limits (Lessons 25-35):</strong> Cybernetics, ordinals, paradoxes, and the hard boundaries of what logic can achieve.</li>
                </ol>

                <div class="lesson-tip">
                    <strong>How to Use This Course:</strong> JUDIT is reactive. As you read each lesson, switch to the corresponding tab (Editor, Lambda, Turing) and try every example yourself. Each lesson ends with a "✎ Try It" exercise. Theory without practice is a map you never follow.
                </div>

                <h3>Historical Context: The Characteristica Universalis</h3>
                <p>In the 17th century, <strong>Gottfried Wilhelm Leibniz</strong> dreamed of a <em>Calculus Ratiocinator</em>—a symbolic language so powerful that any dispute could be settled by saying <em>"Calculemus!"</em> (Let us calculate!). Three centuries later, we have programming languages, proof assistants, and JUDIT. The dream is closer than ever.</p>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> Before proceeding, familiarize yourself with the JUDIT interface.
                    <ol>
                        <li>Click on the <strong>Editor</strong> tab (the default view).</li>
                        <li>Double-click on the canvas to create your first <em>World</em>.</li>
                        <li>In the Inspector panel (right side), add the atom <code>p</code> to that world.</li>
                        <li>Congratulations — you have just created your first formal model: a universe with one world where "p" is true.</li>
                    </ol>
                </div>
            </div>
        `
    },
    {
        id: 2,
        title: "Propositional Logic: Atomic Formulas",
        content: `
            <div class="lesson-card">
                <h2>2. Propositional Logic: Atomic Formulas</h2>
                <div class="lesson-quote">
                    "The investigation of the laws of thought commences with the consideration of the symbols." — George Boole, <em>The Laws of Thought</em> (1854)
                </div>

                <p>At the most basic level of formalization, we encounter the <strong>Atomic Proposition</strong>. George Boole revolutionized philosophy by treating propositions not as sentences in natural language, but as <strong>algebraic variables</strong> that could hold exactly one of two states: <strong>1 (True)</strong> or <strong>0 (False)</strong>.</p>

                <h3>Step 1: What Is an Atom?</h3>
                <p>An "atom" is a statement that is <strong>structurally simple</strong>. It cannot be decomposed into smaller logical parts. Think of it like this:</p>
                <ul>
                    <li><strong>Atomic:</strong> "It is raining." — This is a single, indivisible claim.</li>
                    <li><strong>Not atomic:</strong> "It is raining <em>and</em> it is cold." — This contains two claims joined by "and."</li>
                </ul>
                <p>In JUDIT, we represent atoms using lowercase letters: <code>p</code>, <code>q</code>, <code>r</code>, <code>s</code>. Each letter stands for a complete statement whose truth value we will track.</p>

                <h3>Step 2: Valuations — The World State</h3>
                <p>In Kripke semantics (which we'll explore fully in Lesson 5), truth is <strong>local</strong>. A proposition isn't just "true" or "false" — it is true or false <em>at a particular world</em>. The function that tells us which atoms hold at which worlds is called a <strong>Valuation (V)</strong>.</p>
                
                <div class="lesson-example">
                    <strong>Conceptual Example — The Weather Model:</strong>
                    <ul>
                        <li>Let <code>p</code> = "The sun is out."</li>
                        <li>Let <code>q</code> = "It is raining."</li>
                    </ul>
                    <p>Now imagine two possible states of the world:</p>
                    <ul>
                        <li><strong>World 1:</strong> V(w₁) = {p: ✓, q: ✗} — Sunny, no rain.</li>
                        <li><strong>World 2:</strong> V(w₂) = {p: ✓, q: ✓} — A sunshower! Both are true.</li>
                    </ul>
                    <p>Already, without any connectives or arrows, we can represent two different realities using only atoms and valuations.</p>
                </div>

                <h3>Step 3: The Boole-to-Silicon Pipeline</h3>
                <p>Why does this matter beyond philosophy? Because every transistor in your CPU is a physical implementation of Boole's algebra. A transistor is either <em>on</em> or <em>off</em>. By combining billions of them, your computer evaluates Boolean expressions at the speed of light. The atom <code>p</code> you type in JUDIT is, conceptually, the same unit of information.</p>

                <div class="lesson-warning">
                    <strong>Caution:</strong> JUDIT is case-sensitive. Always use lowercase for atoms (<code>p</code>, <code>q</code>, <code>r</code>). Uppercase letters like <code>K</code> are reserved for modal operators (knowledge, necessity).
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong>
                    <ol>
                        <li>Create two worlds on the canvas (double-click twice).</li>
                        <li>Select the first world. In the Inspector, add atoms <code>p</code>.</li>
                        <li>Select the second world. Add atoms <code>p</code> and <code>q</code>.</li>
                        <li>In the formula bar at the top, type <code>p</code> and press Enter.</li>
                        <li>Both worlds should glow <strong>green</strong> — p is true in both.</li>
                        <li>Now type <code>q</code>. Only the second world glows green.</li>
                    </ol>
                </div>
            </div>
        `
    },
    {
        id: 3,
        title: "Logical Connectives: AND, OR, NOT",
        content: `
            <div class="lesson-card">
                <h2>3. Logical Connectives: The Syntax of Truth</h2>
                <div class="lesson-quote">
                    "The limits of my language mean the limits of my world." — Ludwig Wittgenstein, <em>Tractatus Logico-Philosophicus</em> (1921)
                </div>
                <p>Single atoms are stagnant. To create <em>reasoning</em>, we must bind them together using <strong>Connectives</strong>. Wittgenstein argued that the meaning of a complex proposition is <strong>entirely determined</strong> by the truth-values of its component parts. This principle is called <strong>Truth-Functionality</strong>, and it is the engine that powers all of classical logic.</p>

                <h3>Step 1: The Three Fundamental Connectives</h3>
                <p>Every complex formula in propositional logic is built from just three operations:</p>

                <table>
                    <tr><th>Name</th><th>Symbol</th><th>JUDIT Syntax</th><th>Meaning</th></tr>
                    <tr><td>Negation</td><td>¬</td><td><code>~</code> or <code>!</code></td><td>Flips the truth value. <code>¬p</code> is true iff <code>p</code> is false.</td></tr>
                    <tr><td>Conjunction</td><td>∧</td><td><code>&</code> or <code>/\\</code></td><td>Both must be true. <code>p ∧ q</code> is true only when <em>both</em> p and q are true.</td></tr>
                    <tr><td>Disjunction</td><td>∨</td><td><code>|</code> or <code>\\/</code></td><td>At least one must be true. <code>p ∨ q</code> is false only when <em>both</em> are false.</td></tr>
                </table>

                <h3>Step 2: Truth Tables — The Complete Picture</h3>
                <p>A <strong>Truth Table</strong> exhaustively lists every possible combination of truth values for the atoms, and computes the result of the formula for each combination. For two atoms p and q, there are 2² = 4 rows:</p>
                <table>
                    <tr><th>p</th><th>q</th><th>p ∧ q</th><th>p ∨ q</th><th>¬p</th></tr>
                    <tr><td>T</td><td>T</td><td>T</td><td>T</td><td>F</td></tr>
                    <tr><td>T</td><td>F</td><td>F</td><td>T</td><td>F</td></tr>
                    <tr><td>F</td><td>T</td><td>F</td><td>T</td><td>T</td></tr>
                    <tr><td>F</td><td>F</td><td>F</td><td>F</td><td>T</td></tr>
                </table>
                <p>This table is <strong>complete</strong>. There are no surprises. Once you know the atoms, the connective determines everything. This is the beauty — and the limitation — of classical logic.</p>

                <h3>Step 3: Composing Complex Formulas</h3>
                <p>Connectives can be nested to arbitrary depth. The formula <code>!(p & q) | r</code> reads as: "Either it is NOT the case that both p and q hold, OR r holds." JUDIT evaluates these by recursion: it evaluates the innermost sub-formulas first, then works outward.</p>

                <h3>Interdisciplinary Insight: Digital Logic Gates</h3>
                <p>These three connectives are physically instantiated as <strong>Logic Gates</strong> in silicon. An AND-gate only outputs 1 if both inputs are 1. An OR-gate outputs 1 if either input is 1. A NOT-gate inverts its input. Your processor is a massive, high-speed engine for evaluating these three rules billions of times per second. Claude Shannon's 1937 master's thesis proved that Boolean algebra could be implemented with electrical switches — arguably the most consequential master's thesis in history.</p>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong>
                    <ol>
                        <li>Using your two worlds from Lesson 2 (World 1 has <code>p</code>, World 2 has <code>p</code> and <code>q</code>):</li>
                        <li>Evaluate <code>p & q</code> — only World 2 should glow green.</li>
                        <li>Evaluate <code>p | q</code> — both should glow green (p alone is enough).</li>
                        <li>Evaluate <code>!q</code> — only World 1 should glow green.</li>
                        <li>Evaluate <code>!(p & q) | q</code> — what happens? Can you predict before checking?</li>
                    </ol>
                </div>
            </div>
        `
    },
    {
        id: 4,
        title: "Implication & Equivalence",
        content: `
            <div class="lesson-card">
                <h2>4. Implication & Equivalence: The Logic of "If... Then..."</h2>
                <div class="lesson-quote">
                    "The conditional is the nerve of all deduction." — W.V.O. Quine
                </div>
                <p>One of the most debated operators in the entire history of logic is the <strong>Material Implication (→)</strong>. It is the formal version of "If... then..." and its behavior will surprise you.</p>

                <h3>Step 1: The Definition</h3>
                <p>In formal logic, <code>p → q</code> (If p then q) is defined as being false <strong>in only one case</strong>: when <code>p</code> is true but <code>q</code> is false. In all other cases, the implication is true.</p>
                <table>
                    <tr><th>p</th><th>q</th><th>p → q</th></tr>
                    <tr><td>T</td><td>T</td><td>T</td></tr>
                    <tr><td>T</td><td>F</td><td><strong>F</strong> ← The only failure</td></tr>
                    <tr><td>F</td><td>T</td><td>T</td></tr>
                    <tr><td>F</td><td>F</td><td>T</td></tr>
                </table>

                <h3>Step 2: The "Paradoxes" of Implication</h3>
                <p>The last two rows are deeply counterintuitive. They mean:</p>
                <ul>
                    <li>"If 2+2=5, then I am the King of France" is <strong>TRUE</strong>.</li>
                    <li>"If the moon is cheese, then elephants can fly" is <strong>TRUE</strong>.</li>
                </ul>
                <p>This is called <strong>Vacuous Truth</strong>. The implication only "promises" something when the antecedent (p) is actually fulfilled. If p is false, the promise is trivially kept. Think of it like a contract: "If you deliver the goods, I'll pay you." If you never deliver, I haven't broken my promise either way.</p>

                <h3>Step 3: The Key Identity</h3>
                <p>Material implication can be <strong>reduced</strong> to simpler connectives: <code>p → q</code> is logically equivalent to <code>¬p ∨ q</code>. This means "If p then q" is the same as "Either p is false, or q is true." In JUDIT syntax: <code>p -> q</code> is the same as <code>!p | q</code>.</p>

                <h3>Step 4: Biconditional (Equivalence)</h3>
                <p>The biconditional <code>p ↔ q</code> (in JUDIT: <code>p <-> q</code>) means "p if and only if q." It is true when both sides share the same truth value — both true or both false. It is the logical "=" sign.</p>

                <div class="lesson-tip">
                    <strong>Why This Matters Later:</strong> In Lessons 20-24, we'll discover that implication is not just a connective — it corresponds to the concept of a <em>function</em> in programming. The formula <code>p → q</code> is, in the Curry-Howard universe, the <em>type</em> of a function that transforms evidence-for-p into evidence-for-q. This connection is the deepest result in this entire course.
                </div>

                <h3>Historical Context: Philo vs. Diodorus</h3>
                <p>The debate over "If... then..." is among the oldest in logic. <strong>Philo of Megara</strong> (c. 300 BC) proposed the material definition we use today. His fellow Megarian, <strong>Diodorus Cronus</strong>, argued for a "strict" implication requiring a causal or temporal connection. This 2,300-year-old debate still echoes in modern discussions of <em>Relevance Logic</em> and <em>Strict Implication</em> (C.I. Lewis, 1918).</p>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong>
                    <ol>
                        <li>Keep your two-world model. World 1 has {p}, World 2 has {p, q}.</li>
                        <li>Evaluate <code>p -> q</code>. World 1 = Red (p is true, q absent → broken promise). World 2 = Green.</li>
                        <li>Now evaluate <code>!p -> q</code>. Both green! Why? Because p is true in both worlds, so ¬p is false, and a false antecedent makes the implication vacuously true.</li>
                        <li>Add a World 3 with no atoms. Evaluate <code>p -> q</code> there. Green! (Vacuous truth.)</li>
                    </ol>
                </div>
            </div>
        `
    },
    {
        id: 5,
        title: "Kripke Models: Possible Worlds",
        content: `
            <div class="lesson-card">
                <h2>5. Kripke Models: The Geometry of Meaning</h2>
                <div class="lesson-quote">
                    "Possible worlds are not something like far-away planets... They are stipulated, not discovered by powerful telescopes." — Saul Kripke, <em>Naming and Necessity</em> (1980)
                </div>
                <p>With Lessons 2-4, we built the vocabulary of classical logic. But classical logic has a fatal limitation: it lives in a single, flat universe. Every proposition is simply true or false, period. This is inadequate for reasoning about <strong>possibility</strong>, <strong>knowledge</strong>, <strong>obligation</strong>, or <strong>time</strong>.</p>

                <p>In the late 1950s, a teenage prodigy named <strong>Saul Kripke</strong> revolutionized the field by introducing <strong>Relational Semantics</strong> — the mathematical framework that JUDIT is built upon.</p>

                <h3>Step 1: The Three Components</h3>
                <p>A <strong>Kripke Model (M)</strong> is a triple <code>⟨W, R, V⟩</code>:</p>
                <ul>
                    <li><strong>W (Worlds):</strong> A non-empty set of "points" or "states." In JUDIT, these are the circles on the canvas. Each world represents a complete possible state of affairs.</li>
                    <li><strong>R (Accessibility Relation):</strong> A binary relation on W — the <em>arrows</em> connecting worlds. <code>wRv</code> means "from world w, world v is considered <em>accessible</em> (possible, visible, reachable)."</li>
                    <li><strong>V (Valuation):</strong> A function mapping each atom to the set of worlds where it is true. This is the atom-assignment you've already been doing in the Inspector.</li>
                </ul>

                <h3>Step 2: The Visual Metaphor — Bubbles and Bridges</h3>
                <p>Think of each world as a <strong>soap bubble</strong>. Inside each bubble, certain facts hold (the atoms). The arrows are <strong>bridges</strong> between bubbles. When you stand inside one bubble, you can "see" through the bridges into other bubbles. What you can see determines what you <em>know</em> — or what you consider <em>possible</em>.</p>

                <div class="lesson-example">
                    <strong>Scenario — The Crossroads:</strong>
                    <ul>
                        <li><strong>World 0 (You are here):</strong> You stand at a fork in the road. You don't know what lies ahead. Atoms: none (you have no information yet).</li>
                        <li><strong>World 1 (Left path):</strong> If you go left, you find treasure. Atoms: {<code>p</code>}.</li>
                        <li><strong>World 2 (Right path):</strong> If you go right, you find a dragon. Atoms: {<code>q</code>}.</li>
                    </ul>
                    <p>The arrows go from World 0 → World 1 and World 0 → World 2. From your current position (World 0), <em>both</em> futures are <strong>possible</strong>.</p>
                </div>

                <h3>Step 3: Why Possible Worlds Matter</h3>
                <p>This framework is not just an academic exercise. It is used today in:</p>
                <ul>
                    <li><strong>AI Planning:</strong> Each world is a possible state of the environment. The agent must choose actions (arrows) that lead to desired outcomes.</li>
                    <li><strong>Game Theory:</strong> Each player has their own set of worlds representing what they believe about the other players' strategies.</li>
                    <li><strong>Philosophy of Language:</strong> Kripke's <em>Naming and Necessity</em> used this framework to argue that names (like "Water") refer to the same substance in <em>all</em> possible worlds, even before we knew its chemical formula (H₂O).</li>
                </ul>

                <div class="lesson-tip">
                    <strong>Key Insight:</strong> In JUDIT, the canvas IS a Kripke Model. Every world you place, every arrow you draw, and every atom you assign defines a complete formal structure. The formula bar then lets you <em>query</em> this structure.
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It — Build the Crossroads:</strong>
                    <ol>
                        <li>Create three worlds on the canvas.</li>
                        <li>Give World 1 the atom <code>p</code> (treasure). Give World 2 the atom <code>q</code> (dragon). Leave World 0 empty.</li>
                        <li>Hold <strong>Shift</strong> and drag from World 0 to World 1 to create an arrow.</li>
                        <li>Hold <strong>Shift</strong> and drag from World 0 to World 2.</li>
                        <li>You now have a Kripke Model with W = {0, 1, 2}, R = {(0,1), (0,2)}, V(p) = {1}, V(q) = {2}.</li>
                    </ol>
                </div>
            </div>
        `
    },
    {
        id: 6,
        title: "Accessibility Relations",
        content: `
            <div class="lesson-card">
                <h2>6. Accessibility Relations: The Arrows of Logic</h2>
                <div class="lesson-quote">
                    "The relation R is the soul of the Kripke model. Without it, a model is just a bag of facts." — Johan van Benthem
                </div>
                <p>In Lesson 5, we introduced the triple ⟨W, R, V⟩. Now we focus on the most powerful component: the <strong>Accessibility Relation (R)</strong>. Written as <code>wRv</code>, it means "from world w, world v is considered <em>accessible</em>."</p>

                <h3>Step 1: What Does "Accessible" Mean?</h3>
                <p>The meaning of R changes depending on the <strong>Logic System</strong> you are modeling:</p>
                <table>
                    <tr><th>Logic</th><th>R means...</th><th>Example</th></tr>
                    <tr><td>Epistemic (Knowledge)</td><td>"v is a world the agent considers possible"</td><td>I think it might be raining OR sunny</td></tr>
                    <tr><td>Temporal (Time)</td><td>"v occurs in the future of w"</td><td>After today comes tomorrow</td></tr>
                    <tr><td>Deontic (Obligation)</td><td>"v is a world where all obligations are met"</td><td>In the ideal world, everyone pays taxes</td></tr>
                    <tr><td>Alethic (Necessity)</td><td>"v is a world that is metaphysically possible"</td><td>Water could have been discovered to be H₃O</td></tr>
                </table>

                <h3>Step 2: Structural Properties of R</h3>
                <p>The <em>shape</em> of R determines which <strong>Modal Axioms</strong> your model obeys. This is one of the deepest results in modal logic:</p>
                <ul>
                    <li><strong>Reflexive</strong> (every world points to itself, <code>wRw</code>): Enforces the T axiom (<code>□p → p</code>). Used for <em>Knowledge</em> — if I know something, it must actually be true.</li>
                    <li><strong>Transitive</strong> (if <code>wRv</code> and <code>vRu</code>, then <code>wRu</code>): Enforces the 4 axiom (<code>□p → □□p</code>). Used for <em>Positive Introspection</em> — if I know something, I know that I know it.</li>
                    <li><strong>Symmetric</strong> (if <code>wRv</code>, then <code>vRw</code>): Enforces the B axiom (<code>p → □◊p</code>). Used for <em>Negative Introspection</em>.</li>
                    <li><strong>Euclidean</strong> (if <code>wRv</code> and <code>wRu</code>, then <code>vRu</code>): Enforces the 5 axiom (<code>◊p → □◊p</code>).</li>
                </ul>

                <div class="lesson-tip">
                    <strong>The S5 System:</strong> When R is reflexive, transitive, AND symmetric (i.e., an <em>equivalence relation</em>), all worlds within a cluster "see" each other perfectly. This is the <strong>S5</strong> system, used for idealized knowledge where agents have perfect logical abilities. In S5, if something is <em>possible</em>, then it is <em>necessarily possible</em>.
                </div>

                <h3>Step 3: Graphs and Networks</h3>
                <p>Computationally, a Kripke model is a <strong>Labeled Directed Graph</strong>. The worlds are nodes, the arrows are edges, and the atoms are node labels. By adding logic to the graph, we turn it from a simple data structure into a <strong>State Machine</strong> capable of representing complex behavior.</p>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong>
                    <ol>
                        <li>Using your 3-world Crossroads model from Lesson 5:</li>
                        <li>Add a <strong>self-loop</strong> on World 0 (Shift-drag from World 0 back to itself).</li>
                        <li>Evaluate <code>[](p)</code> (Box p — "p is necessary"). World 0 = Red. Why? Because World 0 can see itself (where p is false), World 1 (p true), and World 2 (p false). Not all accessible worlds have p.</li>
                        <li>Now add <code>p</code> to World 0 and World 2. Re-evaluate. What changes?</li>
                    </ol>
                </div>
            </div>
        `
    },
    {
        id: 7,
        title: "Modal Operators: Box (□)",
        content: `
            <div class="lesson-card">
                <h2>7. Modal Operators: Box (□) — Necessity</h2>
                <div class="lesson-quote">
                    "Necessity is the mother of invention — but in logic, it is the universal quantifier over possible worlds." 
                </div>
                <p>The <strong>Box</strong> operator (<code>□</code>) is the hallmark of Modal Logic. It represents <strong>Necessity</strong>: "In all worlds I can reach, this is true."</p>

                <h3>Step 1: The Formal Definition</h3>
                <p>We say <code>□φ</code> is true at world <code>w</code> if and only if <code>φ</code> is true in <strong>EVERY</strong> world accessible from <code>w</code>:</p>
                <div class="lesson-example">
                    <code>(M, w) ⊩ □φ   iff   ∀v ∈ W : wRv ⇒ (M, v) ⊩ φ</code>
                    <p>Read this carefully: "For every world v, if w can see v, then φ must be true at v." The quantifier is <strong>universal</strong> — every single accessible world must agree.</p>
                </div>

                <h3>Step 2: Knowledge as Necessity</h3>
                <p>In Epistemic Logic, we replace <code>□</code> with <code>K</code>. To "<strong>Know</strong>" something means that in all the worlds you haven't ruled out, that thing is true. This is why knowledge requires reflexivity: you should never "know" something false (because you can always see the actual world).</p>

                <h3>Step 3: The Blind Spot Phenomenon</h3>
                <div class="lesson-example">
                    <strong>Example:</strong>
                    <p>World A points to World B and World C.</p>
                    <ul>
                        <li>If <code>p</code> is true in both B and C → <code>□p</code> is <strong>True</strong> at A.</li>
                        <li>If <code>p</code> is false in C → <code>□p</code> is <strong>False</strong> at A, even though p holds in B!</li>
                    </ul>
                    <p>One single counterexample destroys necessity. This is the "Blind Spot" — you can't claim to know something if even one accessible world disagrees.</p>
                </div>

                <div class="lesson-tip">
                    <strong>Historical Note:</strong> C.I. Lewis introduced modern modal symbols in 1918. He wanted a "Strict Implication" (<code>□(p → q)</code>) that avoided the paradoxes of material implication from Lesson 4. The Box gives us exactly that strength.
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> In JUDIT, type <code>[](p)</code> to evaluate "necessarily p." Observe which worlds glow green. Now add or remove arrows and watch how the truth of <code>□p</code> changes in real time.
                </div>
            </div>
        `
    },
    {
        id: 8,
        title: "Modal Operators: Diamond (◊)",
        content: `
            <div class="lesson-card">
                <h2>8. Modal Operators: Diamond (◊) — Possibility</h2>
                <div class="lesson-quote">
                    "Even if it is not necessary, it might still be possible." — Classic Modal Intuition
                </div>
                <p>The <strong>Diamond</strong> operator (<code>◊</code>) is the dual of Box. Where Box demands <em>every</em> accessible world agrees, Diamond only needs <em>one</em>.</p>

                <h3>Step 1: The Formal Definition</h3>
                <div class="lesson-example">
                    <code>(M, w) ⊩ ◊φ   iff   ∃v ∈ W : wRv ∧ (M, v) ⊩ φ</code>
                    <p>"There exists at least one world v that w can reach, and φ is true at v."</p>
                </div>

                <h3>Step 2: The Duality Principle</h3>
                <p>Box and Diamond are <strong>duality</strong> partners, exactly like the universal (∀) and existential (∃) quantifiers in predicate logic:</p>
                <ul>
                    <li><code>◊φ ≡ ¬□¬φ</code> — "It is possible that φ" = "It is NOT necessary that NOT φ"</li>
                    <li><code>□φ ≡ ¬◊¬φ</code> — "It is necessary that φ" = "It is NOT possible that NOT φ"</li>
                </ul>
                <p>This means you only <em>need</em> one of the two operators. The other can always be derived. However, using both makes formulas much more natural to read.</p>

                <h3>Step 3: Why Diamond Matters for Knowledge</h3>
                <p>In epistemic logic, <code>◊φ</code> becomes "the agent considers φ <em>possible</em>." If <code>¬K_a(p)</code> is true (Agent a does NOT know p), then from a's perspective, both p and ¬p are possible: <code>◊p ∧ ◊¬p</code>. This is the formal definition of <strong>uncertainty</strong>.</p>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong>
                    <ol>
                        <li>In JUDIT, type <code><>(p & q)</code> — this evaluates "is it <em>possible</em> that both p and q hold?"</li>
                        <li>If even one arrow from the current world leads to a world with both p and q, the source glows green.</li>
                        <li>Compare with <code>[](p & q)</code> — "is it <em>necessary</em> that both hold?" Much harder to satisfy!</li>
                    </ol>
                </div>
            </div>
        `
    },
    {
        id: 9,
        title: "Truth in a World (Forcing)",
        content: `
            <div class="lesson-card">
                <h2>9. Truth in a World: The Forcing Relation</h2>
                <div class="lesson-quote">
                    "Truth is perspectival. What is true for one observer may be false for another." — Multi-Agent Epistemic Philosophy
                </div>
                <p>In standard logic, a formula is simply True or False. In Kripke semantics, we use a more precise term: <strong>Forcing</strong> (symbol: <code>⊩</code>).</p>

                <h3>Step 1: Reading the Notation</h3>
                <p>We write <code>(M, w) ⊩ φ</code>, read as: "In Model M, at world w, the formula φ is forced (true)." Notice: truth has <em>two</em> parameters — the model AND the world.</p>

                <h3>Step 2: The Recursive Definition</h3>
                <p>This is the <strong>complete evaluation algorithm</strong> that JUDIT executes under the hood:</p>
                <ol>
                    <li><strong>Atoms:</strong> <code>(M, w) ⊩ p</code> iff <code>p ∈ V(w)</code> — "p is in the valuation of world w."</li>
                    <li><strong>Negation:</strong> <code>(M, w) ⊩ ¬φ</code> iff <code>(M, w) ⊮ φ</code> — "w does NOT force φ."</li>
                    <li><strong>Conjunction:</strong> <code>(M, w) ⊩ φ ∧ ψ</code> iff both are forced at w.</li>
                    <li><strong>Disjunction:</strong> <code>(M, w) ⊩ φ ∨ ψ</code> iff at least one is forced at w.</li>
                    <li><strong>Implication:</strong> <code>(M, w) ⊩ φ → ψ</code> iff either φ is not forced, or ψ is forced.</li>
                    <li><strong>Box:</strong> <code>(M, w) ⊩ □φ</code> iff all accessible worlds force φ.</li>
                    <li><strong>Diamond:</strong> <code>(M, w) ⊩ ◊φ</code> iff some accessible world forces φ.</li>
                </ol>

                <div class="lesson-tip">
                    <strong>JUDIT's Engine:</strong> Every time you move a world, change an arrow, or edit a valuation, JUDIT's recursive evaluator re-runs these seven rules across every world on the canvas. This is why you see the colors update in real time — it's a live semantic engine.
                </div>

                <h3>Step 3: Truth as Location</h3>
                <p>This implies that truth is <strong>local</strong>. Agent A standing in World 1 might see a completely different logical landscape than Agent B in World 2. This is the foundation of <strong>Multi-Agent Systems</strong>, which we'll explore starting in Lesson 11.</p>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> Build a 4-world model. Give each world different atoms. Draw various arrows. Then evaluate increasingly complex formulas: <code>p</code>, then <code>[]p</code>, then <code>[](p -> q)</code>, then <code>[]p -> []q</code>. Watch how the green/red pattern shifts.
                </div>
            </div>
        `
    },
    {
        id: 10,
        title: "Global Validation & Tautologies",
        content: `
            <div class="lesson-card">
                <h2>10. Global Validation & Modal Tautologies</h2>
                <p>With the forcing relation mastered, we can now ask a deeper question: is a formula true <em>everywhere</em>?</p>

                <h3>Step 1: Levels of Truth</h3>
                <ul>
                    <li><strong>Satisfied:</strong> φ is true at some world w. (Local truth.)</li>
                    <li><strong>Valid in a Model:</strong> φ is true at <em>every</em> world of a specific model M. (Your canvas.)</li>
                    <li><strong>Logically Valid:</strong> φ is true at every world in <em>every possible</em> Kripke model. These are the <strong>Laws of Logic</strong>.</li>
                </ul>

                <h3>Step 2: The Great Modal Axioms</h3>
                <p>Different combinations of relation properties yield different logical systems, each with its own axioms. Here is the hierarchy:</p>
                <table>
                    <tr><th>System</th><th>Axioms</th><th>R properties</th><th>Use case</th></tr>
                    <tr><td><strong>K</strong></td><td>□(p→q) → (□p→□q)</td><td>none</td><td>Minimal modal logic</td></tr>
                    <tr><td><strong>T</strong></td><td>K + □p → p</td><td>Reflexive</td><td>Knowledge (truth axiom)</td></tr>
                    <tr><td><strong>S4</strong></td><td>T + □p → □□p</td><td>Reflexive + Transitive</td><td>Positive introspection</td></tr>
                    <tr><td><strong>S5</strong></td><td>S4 + ◊p → □◊p</td><td>Equivalence relation</td><td>Idealized knowledge</td></tr>
                </table>

                <div class="lesson-example">
                    <strong>Example — Testing K:</strong>
                    <p>The K axiom <code>□(p → q) → (□p → □q)</code> says: "If it is necessary that p implies q, and p is necessary, then q is necessary." This holds in EVERY Kripke model, regardless of the shape of R. Try to build a counterexample — you won't be able to!</p>
                </div>

                <div class="lesson-warning">
                    <strong>The T Axiom Challenge:</strong>
                    <p>Try building a model where <code>□p → p</code> fails. You'll discover it only fails when a world does NOT point to itself. This is why knowledge logic requires reflexivity: you should never "know" something that isn't actually true at your own world.</p>
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> Click the <em>System Insights</em> button in the toolbar and check which axiom systems your current model satisfies. Try modifying the arrows to move from K to T to S4 to S5.
                </div>
            </div>
        `
    },
    {
        id: 11,
        title: "Multi-Agent Perspectives",
        content: `
            <div class="lesson-card">
                <h2>11. Multi-Agent Epistemic Logic</h2>
                <div class="lesson-quote">
                    "Common knowledge is the invisible glue that holds societies and communication protocols together." — David Lewis, <em>Convention</em> (1969)
                </div>
                <p>Real systems rarely involve just one observer. JUDIT supports <strong>Multi-Agent Logic</strong> with operators <code>K_a</code>, <code>K_b</code>, <code>K_c</code>, etc. — one for each agent.</p>

                <h3>Step 1: Agent-Labeled Arrows</h3>
                <p>Each agent has their OWN accessibility relation. Agent <em>a</em>'s arrows might be completely different from Agent <em>b</em>'s arrows. This means: the same pair of worlds might be indistinguishable for Agent a but clearly different for Agent b.</p>

                <div class="lesson-example">
                    <strong>The Spy Scenario:</strong>
                    <ul>
                        <li><strong>World 1:</strong> The safe contains diamonds. Atoms: {<code>p</code>}.</li>
                        <li><strong>World 2:</strong> The safe is empty. Atoms: none.</li>
                    </ul>
                    <p>Agent A (the owner) has NO arrow between World 1 and 2 — she <em>knows</em> exactly which world she's in. Agent B (the spy) has arrows between both — the two worlds are indistinguishable to him. So <code>K_a(p)</code> is true at World 1, but <code>K_b(p)</code> is false.</p>
                </div>

                <h3>Step 2: Higher-Order Knowledge</h3>
                <p>The real power emerges when we nest knowledge operators:</p>
                <ul>
                    <li><code>K_a(p)</code> — "Agent a knows p."</li>
                    <li><code>K_a(K_b(p))</code> — "Agent a knows that Agent b knows p."</li>
                    <li><code>K_a(¬K_b(p))</code> — "Agent a knows that Agent b does NOT know p."</li>
                </ul>
                <p>This nesting is crucial for game theory, protocol verification, and the puzzle we'll see in Lesson 13.</p>

                <h3>Step 3: Common Knowledge (C)</h3>
                <p><strong>Common Knowledge</strong> <code>C(φ)</code> means: Everyone knows φ, everyone knows that everyone knows φ, everyone knows that everyone knows that everyone knows φ... and so on, <em>to infinity</em>. It cannot be reduced to any finite nesting of K operators.</p>

                <div class="lesson-tip">
                    <strong>Why Common Knowledge Matters:</strong> Without common knowledge, coordination is impossible. Traffic lights work because it is <em>common knowledge</em> that red means stop. If I didn't know that YOU know that red means stop, I couldn't trust the system.
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong>
                    <ol>
                        <li>Create two worlds (1 and 2). Give World 1 the atom <code>p</code>.</li>
                        <li>Draw TWO arrows from 1 to 2. Label one <code>a</code> and the other <code>b</code>.</li>
                        <li>Evaluate <code>K_a(p) & ~K_b(p)</code> — can you create a scenario where this holds?</li>
                    </ol>
                </div>
            </div>
        `
    },
    {
        id: 12,
        title: "Dynamic Epistemic Logic (DEL)",
        content: `
            <div class="lesson-card">
                <h2>12. Dynamic Epistemic Logic: Announcements That Reshape Reality</h2>
                <div class="lesson-quote">
                    "After the announcement, the worlds where the announcement was false are simply gone." — Hans van Ditmarsch, <em>Dynamic Epistemic Logic</em>
                </div>
                <p>Standard Modal Logic is <strong>static</strong> — it describes what agents know at a frozen moment. But in the real world, information flows. <strong>Dynamic Epistemic Logic (DEL)</strong>, pioneered by Jan Plaza (1989) and refined by van Benthem and van Ditmarsch, provides the mathematics for <em>change</em>.</p>

                <h3>Step 1: The Public Announcement Operator [!φ]</h3>
                <p>A <strong>Public Announcement</strong> of <code>φ</code> is an event heard by all agents, assumed truthful. When <code>φ</code> is announced:</p>
                <ol>
                    <li>Every world where <code>φ</code> is <strong>false</strong> is <strong>deleted</strong> from the model.</li>
                    <li>All arrows leading to or from deleted worlds are also removed.</li>
                    <li>The remaining model represents the <em>new</em> epistemic state of all agents.</li>
                </ol>
                <p>This "shrinking" of the universe is how we model the <strong>reduction of uncertainty</strong>. After the announcement, there are fewer possible worlds, so agents <em>know more</em>.</p>

                <h3>Step 2: Worked Example — The Announcement Game</h3>
                <div class="lesson-example">
                    <strong>Before Announcement:</strong>
                    <ul>
                        <li>World w₁: {p=true, q=true}. Agent a's arrows: w₁↔w₂.</li>
                        <li>World w₂: {p=false, q=true}. Agent a can't tell them apart.</li>
                    </ul>
                    <p>Agent a does NOT know p (because from w₁, she sees w₂ where p is false).</p>

                    <strong>Public Announcement: p!</strong>
                    <ul>
                        <li>w₂ is deleted (p was false there).</li>
                        <li>Only w₁ remains. Agent a now has no uncertainty.</li>
                    </ul>
                    <p>After the announcement: <code>K_a(p)</code> is now TRUE. Knowledge was <em>created</em> by eliminating worlds.</p>
                </div>

                <h3>Step 3: The Moore Sentence Paradox</h3>
                <p>Consider the announcement: "p is true, but you don't know it" (<code>p ∧ ¬K_a(p)</code>). Before the announcement, this might be true. But AFTER you announce it, the agent now knows p, making the "you don't know" part false! The announcement <strong>destroys its own truth</strong>. This is the <em>Moore Sentence</em> — a truthful statement that cannot survive being announced.</p>

                <div class="lesson-tip">
                    <strong>Interdisciplinary Link:</strong> In cybersecurity, DEL is used to verify that cryptographic protocols don't accidentally "announce" private keys. A protocol is secure if no sequence of public messages allows an eavesdropper's knowledge to include the secret.
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> Build a 3-world model. Type a formula in the formula bar. Click the <strong>"Announce!"</strong> button. Watch worlds physically vanish from the canvas as the false worlds are eliminated.
                </div>
            </div>
        `
    },
    {
        id: 13,
        title: "The Muddy Children Puzzle",
        content: `
            <div class="lesson-card">
                <h2>13. The Muddy Children: A Complete DEL Walkthrough</h2>
                <div class="lesson-quote">
                    "Information is the resolution of uncertainty." — Claude Shannon
                </div>
                <p>The "Muddy Children" is the quintessential DEL puzzle. We will solve it completely, step by step, showing how <strong>silence itself</strong> can be an announcement.</p>

                <h3>Step 1: The Setup</h3>
                <p>Three children (a, b, c) are playing. After their game, children a and b have mud on their foreheads. Child c is clean. Each child can see the others' foreheads but NOT their own.</p>
                <p>Let <code>m_a</code> = "child a is muddy", <code>m_b</code> = "child b is muddy", <code>m_c</code> = "child c is muddy".</p>
                <p>The actual world is: {m_a = true, m_b = true, m_c = false}.</p>

                <h3>Step 2: The Initial Kripke Model</h3>
                <p>From each child's perspective, they don't know about their own forehead. So each child considers two worlds possible: one where they ARE muddy and one where they AREN'T. The full model has 2³ = 8 possible worlds (all combinations of 3 children being muddy or clean).</p>

                <h3>Step 3: The Father's Announcement</h3>
                <p>The father says: <strong>"At least one of you is muddy."</strong> This is a public announcement of <code>m_a ∨ m_b ∨ m_c</code>. The world where ALL children are clean ({m_a=F, m_b=F, m_c=F}) is <strong>deleted</strong>. 7 worlds remain.</p>

                <h3>Step 4: Round 1 — "Does anyone KNOW they are muddy?"</h3>
                <p>Nobody steps forward. Why?</p>
                <div class="lesson-example">
                    <strong>Child a's reasoning:</strong> "I can see that b is muddy. So the announcement doesn't surprise me — I already knew at least one was muddy. But I still don't know about MY OWN forehead."
                </div>
                <p>Nobody knows. But this silence is <em>itself</em> informative! The fact that nobody knew is equivalent to announcing: <code>¬K_a(m_a) ∧ ¬K_b(m_b) ∧ ¬K_c(m_c)</code>.</p>
                <p>This announcement eliminates more worlds — specifically, any world where EXACTLY ONE child is muddy (because in those worlds, that child WOULD have known).</p>

                <h3>Step 5: Round 2 — "Now does anyone know?"</h3>
                <p>Children a and b step forward!</p>
                <div class="lesson-example">
                    <strong>Child a's reasoning (Round 2):</strong> "After Round 1, I know that there can't be exactly one muddy child. I see that b is muddy and c is clean. If I were clean, then b would be the ONLY muddy child — but we just eliminated that possibility! Therefore, I MUST be muddy too."
                </div>
                <p>Child b follows identical reasoning. Child c, seeing two muddy children, already knew c wasn't the only one — but c still can't determine their own status from this alone. C remains uncertain.</p>

                <h3>The Deep Lesson</h3>
                <p>The key insight: <strong>No new facts were learned.</strong> The father's "at least one" announcement told children a and b nothing they couldn't already see. Yet combined with the <em>common knowledge</em> of the announcement and the <em>observation of others' silence</em>, it allowed them to deduce their own status. Information was created from <strong>shared reasoning about shared reasoning</strong>.</p>

                <div class="lesson-tip">
                    <strong>In JUDIT:</strong> Model this by creating 8 worlds (one for each combination of m_a, m_b, m_c). Draw agent arrows between worlds that differ only in that agent's mud status. Then use the "Announce!" button to step through each round.
                </div>
            </div>
        `
    },
    {
        id: 14,
        title: "Turing Machines: Computation as Step",
        content: `
            <div class="lesson-card">
                <h2>14. Turing Machines: Computation as Step</h2>
                <div class="lesson-quote">
                    "We can only see a short distance ahead, but we can see plenty there that needs to be done." — Alan Turing
                </div>
                <p>In 1936, <strong>Alan Turing</strong> published <em>"On Computable Numbers, with an Application to the Entscheidungsproblem,"</em> introducing the concept of the "Universal Machine." His goal was deceptively simple: to formally define what it means for a human — or a machine — to "calculate."</p>

                <h3>Step 1: The Formal Definition</h3>
                <p>A Turing Machine is a 7-tuple <code>(Q, Σ, Γ, δ, q₀, B, F)</code>:</p>
                <table>
                    <tr><th>Symbol</th><th>Meaning</th><th>In JUDIT</th></tr>
                    <tr><td><strong>Q</strong></td><td>All possible States</td><td>Worlds on the canvas</td></tr>
                    <tr><td><strong>Σ</strong></td><td>Input Alphabet</td><td>The atoms (p, q, r...)</td></tr>
                    <tr><td><strong>Γ</strong></td><td>Tape Alphabet (includes Blank)</td><td>Superset of atoms + special symbols</td></tr>
                    <tr><td><strong>δ</strong></td><td>Transition Function</td><td>Arrows between worlds</td></tr>
                    <tr><td><strong>q₀</strong></td><td>Start State</td><td>The highlighted "Start" world</td></tr>
                    <tr><td><strong>B</strong></td><td>Blank Symbol</td><td>A world with no atoms</td></tr>
                    <tr><td><strong>F</strong></td><td>Accept States</td><td>Worlds marked as "Accept"</td></tr>
                </table>

                <h3>Step 2: Why Turing Machines Matter</h3>
                <p>Before 1936, mathematicians treated "computation" informally. Turing's model was radical because it showed that <strong>any calculation a human could do with pencil and paper could be performed by this simple machine</strong>. The machine can only: read a symbol, write a symbol, and move one cell left or right. Yet this is enough to compute <em>anything computable</em>.</p>

                <h3>Step 3: Bletchley Park and the Enigma</h3>
                <p>During WWII, Turing's theoretical work became devastatingly practical. At Bletchley Park, his <em>Bombe</em> machine — a physical realization of a Turing Machine — systematically searched for Enigma key settings. Computation was not just math; it became the decisive weapon of the war.</p>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> In the JUDIT canvas, create 3 worlds. Label one "Start" and one "Accept." Connect them with arrows. You've just built the skeleton of a Turing Machine's state diagram.
                </div>
            </div>
        `
    },
    {
        id: 15,
        title: "The Tape & Universal Alphabet",
        content: `
            <div class="lesson-card">
                <h2>15. The Tape & Universal Alphabet</h2>
                <p>Turing's genius was in <strong>simplification</strong>. Any data — a photograph, a symphony, an entire library — can be represented as a sequence of symbols on a <strong>Tape</strong>.</p>

                <h3>Step 1: The Structure of the Tape</h3>
                <p>The tape is a one-dimensional sequence of cells, each containing a single symbol. The tape extends infinitely in both directions (or at least as far as needed). A <strong>read/write head</strong> sits on one cell at a time.</p>
                <ul>
                    <li><strong>Σ (Input Alphabet):</strong> The symbols allowed at the start. Typically {0, 1} for binary computation.</li>
                    <li><strong>Γ (Tape Alphabet):</strong> All symbols the machine may use, including a special <strong>Blank (B)</strong> marking unexplored tape.</li>
                </ul>

                <h3>Step 2: The Digital Revolution</h3>
                <p>Unlike an analog clock's smooth hands, the Turing Machine operates in <strong>discrete ticks</strong>. Each step is atomic: read, write, move. There is no "in between." This is the conceptual birth of the <strong>Digital Revolution</strong> — the idea that all of reality can be captured as a sequence of discrete symbols.</p>

                <div class="lesson-tip">
                    <strong>Did you know?</strong> Before "computer" meant a machine, it was a <em>job title</em>. Human "computers" — often women — performed rote calculations for months. Turing's 1936 paper was literally titled "On Computable Numbers" to replace those humans with logic.
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> Go to the <em>Turing Tab</em>. You'll see a visualization of the tape with editable cells. Write a binary string (e.g., <code>1 0 1 1</code>) and step through a simple machine to watch the head process each symbol.
                </div>
            </div>
        `
    },
    {
        id: 16,
        title: "Transition Mechanics & Rules",
        content: `
            <div class="lesson-card">
                <h2>16. Transition Mechanics & The Delta Function</h2>
                <p>The "engine" of the Turing Machine is its <strong>Transition Function (δ)</strong>. It takes the current state and the symbol being read, and produces a three-part instruction:</p>
                <div class="lesson-quote">
                    <code>(CurrentState, ReadSymbol) → (WriteSymbol, Move, NextState)</code>
                </div>

                <h3>Step 1: Reading a Transition Rule</h3>
                <p>Consider the rule: <code>(q₁, 1) → (0, R, q₂)</code></p>
                <ol>
                    <li>"If you are in state <strong>q₁</strong>..."</li>
                    <li>"...and you are reading a <strong>1</strong>..."</li>
                    <li>"...then write a <strong>0</strong>, move the head <strong>Right</strong>, and go to state <strong>q₂</strong>."</li>
                </ol>
                <p>This single rule is one step of the computation. A complete program is a <em>table</em> of such rules covering every possible (State, Symbol) combination.</p>

                <h3>Step 2: Determinism vs. Non-Determinism</h3>
                <p>In a <strong>Deterministic TM</strong>, for every (State, Symbol) pair, there is EXACTLY one rule. If there are multiple rules for the same pair, the machine becomes <strong>Non-Deterministic (NTM)</strong>. Surprisingly, NTMs are no more powerful than DTMs — they can compute the same things — but they may be <em>much faster</em>. This difference is at the heart of the <strong>P vs NP problem</strong>.</p>

                <div class="lesson-warning">
                    <strong>The Halting Problem:</strong> Turing proved that there is NO general algorithm to determine whether an arbitrary Turing Machine will eventually stop or loop forever. This was the first proof of an <strong>undecidable</strong> problem — and it shook mathematics to its core.
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> In the Turing tab, create a <em>Binary Inverter</em>: a machine that flips every 1 to 0 and every 0 to 1. You'll need two rules: <code>(q₀, 0) → (1, R, q₀)</code> and <code>(q₀, 1) → (0, R, q₀)</code>, with a halt when reading Blank.
                </div>
            </div>
        `
    },
    {
        id: 17,
        title: "The Entscheidungsproblem",
        content: `
            <div class="lesson-card">
                <h2>17. The Entscheidungsproblem: The Question That Changed Everything</h2>
                <div class="lesson-quote">
                    "Is there a mechanical procedure that can determine, for any given mathematical statement, whether it is provable?" — David Hilbert, 1928
                </div>
                <p>This is the <strong>bridge lesson</strong> — the historical pivot between Turing Machines and Lambda Calculus. In 1928, <strong>David Hilbert</strong> posed the <em>Entscheidungsproblem</em> (German for "Decision Problem"): is there an algorithm that can decide the truth of any mathematical statement?</p>

                <h3>Step 1: Hilbert's Dream</h3>
                <p>Hilbert believed mathematics was <strong>complete</strong> (every true statement is provable), <strong>consistent</strong> (no contradictions), and <strong>decidable</strong> (there exists a procedure to verify any proof). This was the dream of <em>formalism</em>: reduce all of mathematics to mechanical symbol manipulation.</p>

                <h3>Step 2: Gödel's Blow (1931)</h3>
                <p><strong>Kurt Gödel</strong> shattered the first two pillars. His <em>Incompleteness Theorems</em> proved that any sufficiently powerful system (containing arithmetic) must be either <strong>incomplete</strong> (some truths are unprovable) or <strong>inconsistent</strong>. But one pillar remained: decidability.</p>

                <h3>Step 3: The Double Kill — Turing & Church (1936)</h3>
                <p>In 1936, working independently on opposite sides of the Atlantic:</p>
                <ul>
                    <li><strong>Alan Turing</strong> (Cambridge) proved it using <em>Turing Machines</em> — by showing the Halting Problem is undecidable.</li>
                    <li><strong>Alonzo Church</strong> (Princeton) proved it using <em>Lambda Calculus</em> — by showing that no λ-term can solve the general equivalence problem.</li>
                </ul>
                <p>Both arrived at the same answer: <strong>No</strong>. There is no universal decision procedure. Hilbert's dream was dead. But from its ashes, two complementary theories of computation were born.</p>

                <div class="lesson-tip">
                    <strong>The Church-Turing Thesis:</strong> It was later shown that Turing Machines and Lambda Calculus compute <em>exactly the same</em> class of functions. This equivalence — the <strong>Church-Turing Thesis</strong> — defines the boundary of what is computable. Turing liked machines; Church liked algebra. JUDIT supports both.
                </div>

                <div class="lesson-example">
                    <strong>The Deep Connection:</strong> This lesson stands at the crossroads. Behind us lies the <em>mechanical</em> model of computation (Turing Machines, Lessons 14-16). Ahead lies the <em>algebraic</em> model (Lambda Calculus, Lessons 18-19). Both paths lead to the same destination: the <strong>Curry-Howard Isomorphism</strong> (Lessons 21-24).
                </div>
            </div>
        `
    },
    {
        id: 18,
        title: "Lambda Calculus: The Princeton Theory",
        content: `
            <div class="lesson-card">
                <h2>18. Lambda Calculus: The Princeton Theory of Pure Functions</h2>
                <div class="lesson-quote">
                    "The λ-calculus is the smallest universal programming language in the world." — Alonzo Church
                </div>
                <p>While Turing was building imaginary machines, <strong>Alonzo Church</strong> at Princeton was developing a purely mathematical system for computation: the <strong>Lambda Calculus (λ-calculus)</strong>. Where Turing used tapes and heads, Church used only three primitives.</p>

                <h3>Step 1: The Three Building Blocks</h3>
                <p>A <strong>Lambda Term (M)</strong> is defined by just three rules:</p>
                <ol>
                    <li><strong>Variable:</strong> <code>x</code> — a name, a placeholder, an argument.</li>
                    <li><strong>Abstraction:</strong> <code>λx. M</code> — defining a function. "Given x, compute M."</li>
                    <li><strong>Application:</strong> <code>M N</code> — running a function. "Apply M to N."</li>
                </ol>
                <p>That's it. Three rules. No numbers, no loops, no if-statements. Yet from these three rules, you can derive <em>all of computation</em>. Numbers? They're functions. Booleans? Functions. Loops? Recursive functions.</p>

                <h3>Step 2: Free vs. Bound Variables</h3>
                <p>In the term <code>λx. x y</code>:</p>
                <ul>
                    <li><code>x</code> is <strong>Bound</strong> — it's captured by the λ.</li>
                    <li><code>y</code> is <strong>Free</strong> — it refers to something outside.</li>
                </ul>
                <p>A term with NO free variables is called a <strong>Combinator</strong>. Combinators are self-contained programs that depend on nothing external.</p>

                <h3>Step 3: The Identity and the Constant</h3>
                <div class="lesson-example">
                    <strong>The Identity (I):</strong> <code>λx. x</code> — takes anything, returns it unchanged. The simplest possible program.
                </div>
                <div class="lesson-example">
                    <strong>The Constant (K):</strong> <code>λx. λy. x</code> — takes two arguments, always returns the first. It "ignores" its second input. In the <em>Calculus of Combinators</em>, K encodes the logical value <strong>TRUE</strong>.
                </div>

                <div class="lesson-tip">
                    <strong>In JUDIT:</strong> We use <code>\\</code> as a shortcut for the lambda symbol (λ). So <code>λx. λy. x</code> becomes <code>\\x. \\y. x</code>. Try it in the Lambda tab!
                </div>
            </div>
        `
    },
    {
        id: 19,
        title: "Application & Beta-Reduction",
        content: `
            <div class="lesson-card">
                <h2>19. Application & Beta-Reduction: Running Lambda Programs</h2>
                <p><strong>Application (M N)</strong> is the act of using a function. If Abstraction is "packaging" logic, Application is "plugging in" a value and watching the result unfold.</p>

                <h3>Step 1: The Execution Engine — Beta-Reduction (β)</h3>
                <p>When we apply <code>(λx. M) N</code>, we replace every occurrence of <code>x</code> in <code>M</code> with the term <code>N</code>. This process is called <strong>β-reduction</strong>:</p>
                <div class="lesson-example">
                    <strong>Reduction Steps:</strong>
                    <ol>
                        <li><code>(λx. x) y</code>  →  <code>y</code> — Identity applied to y.</li>
                        <li><code>(λx. x x) y</code>  →  <code>y y</code> — Self-application.</li>
                        <li><code>(λx. λy. x) a b</code>  →  <code>(λy. a) b</code>  →  <code>a</code> — Constant K ignores b.</li>
                    </ol>
                </div>

                <h3>Step 2: The Church-Rosser Theorem (Confluence)</h3>
                <p>Does the <em>order</em> of reduction matter? If a term has multiple reducible subexpressions, do we get different results depending on which we reduce first?</p>
                <p>The <strong>Church-Rosser Theorem</strong> answers: <strong>No.</strong> If a term can be reduced to a final "Normal Form," you will always reach the same answer regardless of reduction order. This is the property of <strong>confluence</strong> — all roads lead to Rome.</p>

                <h3>Step 3: The Omega Combinator — Infinite Loops</h3>
                <div class="lesson-warning">
                    <strong>Danger Zone:</strong> The term <code>(λx. x x) (λx. x x)</code>, known as <strong>Ω (Omega)</strong>, reduces to itself forever. Apply it: you get <code>(λx. x x) (λx. x x)</code> again. This is the simplest possible infinite loop — and proves that not all lambda terms have a normal form.
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> In the Lambda tab, type <code>(\\x. x x) (\\y. y)</code> and click "Reduce." Watch the step-by-step β-reduction unfold. Then try <code>\\x. \\y. x</code> applied to two arguments.
                </div>
            </div>
        `
    },
    {
        id: 20,
        title: "Natural Deduction: Gentzen's Proofs",
        content: `
            <div class="lesson-card">
                <h2>20. Natural Deduction: The Logic of Proof Trees</h2>
                <div class="lesson-quote">
                    "We seek to capture the actual practice of mathematical reasoning, not the ossified tradition of axioms and long deductions." — Gerhard Gentzen, 1934
                </div>
                <p>Until the 1930s, proofs were long, linear lists of formulas. <strong>Gerhard Gentzen</strong> revolutionized this with <strong>Natural Deduction</strong>, using a tree-like structure that mirrors how humans actually think.</p>

                <h3>Step 1: Introduction and Elimination Rules</h3>
                <p>For EVERY connective, Gentzen defined exactly two rules:</p>
                <table>
                    <tr><th>Connective</th><th>Introduction (I)</th><th>Elimination (E)</th></tr>
                    <tr><td><strong>∧ (AND)</strong></td><td>If you have A and B separately, conclude A∧B</td><td>From A∧B, extract A (or B)</td></tr>
                    <tr><td><strong>→ (IF)</strong></td><td>Assume A, derive B, conclude A→B</td><td>From A→B and A, derive B (Modus Ponens)</td></tr>
                    <tr><td><strong>∨ (OR)</strong></td><td>From A alone, conclude A∨B</td><td>Case analysis: prove C from A, and C from B</td></tr>
                    <tr><td><strong>¬ (NOT)</strong></td><td>Assume A, derive ⊥, conclude ¬A</td><td>From ¬A and A, derive ⊥</td></tr>
                </table>

                <h3>Step 2: The Symmetry Principle</h3>
                <p>Notice the beautiful symmetry: Introduction rules tell you how to <em>build</em> a connective; Elimination rules tell you how to <em>use</em> it. Gentzen proved that every valid proof can be transformed into one using only these rules — no axioms needed. This is the <strong>Hauptsatz</strong> (Main Theorem).</p>

                <h3>Step 3: Proof Trees as Programs</h3>
                <p>A proof tree is a <strong>directed acyclic graph</strong> where:</p>
                <ul>
                    <li>Leaves are assumptions (inputs)</li>
                    <li>Internal nodes are rule applications (computations)</li>
                    <li>The root is the conclusion (output)</li>
                </ul>
                <p>Does this structure remind you of something? A program is also a tree of operations with inputs at the leaves and output at the root. This "coincidence" is not a coincidence at all — it's the <strong>Curry-Howard Isomorphism</strong>, which we'll explore next.</p>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> In the Lambda tab, type <code>\\x. x</code> and expand the proof tree. You'll see a Natural Deduction derivation of <code>A → A</code> appear — because the identity function IS the proof that any proposition implies itself.
                </div>
            </div>
        `
    },
    {
        id: 21,
        title: "Curry-Howard: The Bridge",
        content: `
            <div class="lesson-card">
                <h2>21. The Curry-Howard Isomorphism: The Bridge Between Worlds</h2>
                <div class="lesson-quote">
                    "A proof is a program. A formula is a type. This is not a metaphor. It is a mathematical identity." — Philip Wadler
                </div>
                <p>This is perhaps the most beautiful realization in the history of logic and computer science. Discovered independently by <strong>Haskell Curry</strong> (1934) and <strong>William Howard</strong> (1969), the <em>Curry-Howard Isomorphism</em> reveals that two seemingly unrelated disciplines — <strong>Logic</strong> and <strong>Computation</strong> — are secretly the same thing.</p>

                <h3>Step 1: The Dictionary</h3>
                <p>The isomorphism provides a complete <strong>bidirectional translation</strong>:</p>
                <table>
                    <tr><th>Logic (Gentzen)</th><th>Computation (Church)</th><th>Example</th></tr>
                    <tr><td>Proposition</td><td>Type</td><td><code>p</code> ↔ <code>T</code></td></tr>
                    <tr><td>Proof of a proposition</td><td>Program of that type</td><td>A derivation ↔ A lambda term</td></tr>
                    <tr><td>Implication (A → B)</td><td>Function type (A → B)</td><td><code>p → q</code> ↔ <code>T → U</code></td></tr>
                    <tr><td>Conjunction (A ∧ B)</td><td>Product type (A × B)</td><td>Pair, Tuple, Struct</td></tr>
                    <tr><td>Disjunction (A ∨ B)</td><td>Sum type (A + B)</td><td>Union, Either, Variant</td></tr>
                    <tr><td>Proof simplification</td><td>Program execution (β-reduction)</td><td>Cut elimination ↔ Computation</td></tr>
                    <tr><td>Assumption</td><td>Variable</td><td>A free assumption ↔ A free variable</td></tr>
                </table>

                <h3>Step 2: Why "Isomorphism"?</h3>
                <p>An <strong>isomorphism</strong> is a structure-preserving bijection. It means:</p>
                <ul>
                    <li>Every valid proof corresponds to a well-typed program (and vice versa).</li>
                    <li>Every proof step corresponds to a computation step.</li>
                    <li>If the proof is invalid, the program is ill-typed (it has a type error).</li>
                </ul>
                <p>This is not a vague analogy. It is a <strong>mathematical theorem</strong> with a formal proof.</p>

                <div class="lesson-tip">
                    <strong>The Profound Consequence:</strong> If you write a program that compiles (type-checks), you have simultaneously constructed a valid proof. If a logic formula is provable, there exists a program that inhabits its type. <strong>Type checking IS proof verification.</strong>
                </div>

                <div class="lesson-example">
                    <strong>✎ Try It:</strong> In JUDIT's Lambda tab, type <code>\\x. x</code>. Check its type: <code>A → A</code>. This is the proof that "A implies A." Now try <code>\\x. \\y. x</code> — its type is <code>A → B → A</code>, the proof that "if A, then regardless of B, still A."
                </div>
            </div>
        `
    },
    {
        id: 22,
        title: "Propositions as Types",
        content: `
            <div class="lesson-card">
                <h2>22. Propositions as Types: The Left Side of the Bridge</h2>
                <div class="lesson-quote">
                    "Every logical connective is a type constructor. AND is a pair. OR is a choice. IF is a function." — Per Martin-Löf
                </div>
                <p>Let's cross the Curry-Howard bridge from the <strong>logic side</strong>. Each logical connective has a precise computational counterpart.</p>

                <h3>Step 1: Implication (→) = Function Type</h3>
                <p>The proposition <code>A → B</code> means "given evidence for A, I can produce evidence for B." A function of type <code>A → B</code> does exactly this: given an input of type A, it returns an output of type B.</p>
                <div class="lesson-example">
                    <strong>Logic:</strong> To prove <code>A → B</code>, assume A and derive B.<br>
                    <strong>Code:</strong> To write <code>(A → B)</code>, define <code>λa. ...</code> where the body has type B using the variable <code>a</code> of type A.
                </div>

                <h3>Step 2: Conjunction (∧) = Product Type (Pair)</h3>
                <p>The proposition <code>A ∧ B</code> means "I have evidence for A AND evidence for B." Computationally, this is a <strong>pair</strong> <code>(a, b)</code> — a data structure holding both values simultaneously.</p>
                <ul>
                    <li><strong>∧-Introduction:</strong> Given a proof of A and a proof of B → Construct the pair (a, b)</li>
                    <li><strong>∧-Elimination:</strong> From a proof of A∧B → Extract a (fst) or b (snd)</li>
                </ul>

                <h3>Step 3: Disjunction (∨) = Sum Type (Either)</h3>
                <p>The proposition <code>A ∨ B</code> means "I have evidence for A OR evidence for B (but I don't know which)." Computationally, this is a <strong>tagged union</strong>: either <code>Left(a)</code> or <code>Right(b)</code>.</p>
                <ul>
                    <li><strong>∨-Introduction:</strong> Given a proof of A → Wrap it as Left(a)</li>
                    <li><strong>∨-Elimination:</strong> Pattern match on the sum — handle both cases</li>
                </ul>

                <h3>Step 4: Falsity (⊥) = Empty Type</h3>
                <p><code>⊥</code> (bottom, falsity) is a proposition with <strong>no proof</strong>. Computationally, it corresponds to an <strong>empty type</strong> — a type with no values. If a function claims to return the empty type, it can never actually return (it must loop or crash). This is why <code>¬A</code> = <code>A → ⊥</code>: "if you give me evidence for A, I'll produce a contradiction."</p>

                <div class="lesson-tip">
                    <strong>Real-World Application:</strong> Languages like Haskell, Rust, and Idris use these correspondences directly. Rust's <code>enum</code> is a sum type. Haskell's <code>(a, b)</code> is a product type. TypeScript's <code>never</code> is the empty type. Curry-Howard isn't just theory — it's the foundation of modern type systems.
                </div>
            </div>
        `
    },
    {
        id: 23,
        title: "Proofs as Programs",
        content: `
            <div class="lesson-card">
                <h2>23. Proofs as Programs: The Right Side of the Bridge</h2>
                <div class="lesson-quote">
                    "If a proof is a program, then running the program is simplifying the proof." — Haskell Curry
                </div>
                <p>Now we cross the bridge from the <strong>computation side</strong>. Every well-typed lambda term is a proof — and executing the program is logically equivalent to simplifying the proof.</p>

                <h3>Step 1: The Identity Proof</h3>
                <div class="lesson-example">
                    <strong>The Program:</strong> <code>λx. x</code> (the identity function)<br>
                    <strong>The Type:</strong> <code>A → A</code><br>
                    <strong>The Proof:</strong>
                    <ol>
                        <li>Assume A (open an assumption box)</li>
                        <li>We have A (nothing to do — it's already there)</li>
                        <li>Conclude A → A by →-Introduction (close the assumption box)</li>
                    </ol>
                    <p>The program IS this proof. The function parameter <code>x</code> corresponds to the assumption of A. The function body <code>x</code> IS the derivation. The lambda wrapping IS the →-Introduction rule.</p>
                </div>

                <h3>Step 2: The Modus Ponens Proof</h3>
                <div class="lesson-example">
                    <strong>The Program:</strong> <code>λf. λx. f x</code> (function application)<br>
                    <strong>The Type:</strong> <code>(A → B) → A → B</code><br>
                    <strong>The Proof:</strong>
                    <ol>
                        <li>Assume (A → B) — call it f</li>
                        <li>Assume A — call it x</li>
                        <li>Apply →-Elimination: from (A → B) and A, derive B — this is <code>f x</code></li>
                        <li>Close both assumptions: <code>(A → B) → (A → B)</code></li>
                    </ol>
                    <p>The function application <code>f x</code> IS Modus Ponens. Calling a function IS using an implication.</p>
                </div>

                <h3>Step 3: β-Reduction = Cut Elimination</h3>
                <p>Gentzen's <strong>Hauptsatz</strong> (Cut Elimination Theorem) says: every proof with "detours" (where you prove something and immediately use it) can be simplified to a direct proof. In λ-calculus, this is exactly <strong>β-reduction</strong>:</p>
                <ul>
                    <li><strong>Proof detour:</strong> Prove A→B by →-Introduction, then immediately use it by →-Elimination.</li>
                    <li><strong>Program detour:</strong> Define <code>(λx. M)</code> then immediately apply it to N: <code>(λx. M) N</code>.</li>
                    <li><strong>Simplification:</strong> Just substitute N for x in M. Both logically and computationally.</li>
                </ul>

                <div class="lesson-warning">
                    <strong>The Deep Unity:</strong> Gentzen proved Cut Elimination in 1934. Church defined β-reduction in 1936. They didn't know they were proving the <em>same theorem</em> in two different languages. Curry and Howard recognized this decades later.
                </div>
            </div>
        `
    },
    {
        id: 24,
        title: "The Isomorphism in Action",
        content: `
            <div class="lesson-card">
                <h2>24. The Isomorphism in Action: A Complete Worked Example</h2>
                <p>Let's put it all together. We will prove a non-trivial logical theorem and simultaneously write the corresponding program, showing the Curry-Howard correspondence at every step.</p>

                <h3>The Theorem: <code>(A → B → C) → (A → B) → A → C</code></h3>
                <p>In English: "If I can get C from A and B, and I can get B from A, then I can get C from A alone." This is known as the <strong>S combinator</strong> in combinatory logic.</p>

                <h3>Step 1: The Proof (Logic Side)</h3>
                <ol>
                    <li>Assume <code>A → B → C</code> — call this hypothesis <strong>f</strong></li>
                    <li>Assume <code>A → B</code> — call this hypothesis <strong>g</strong></li>
                    <li>Assume <code>A</code> — call this hypothesis <strong>x</strong></li>
                    <li>Apply →-E to g and x: we get <code>B</code> — this is <code>g(x)</code></li>
                    <li>Apply →-E to f and x: we get <code>B → C</code> — this is <code>f(x)</code></li>
                    <li>Apply →-E to <code>f(x)</code> and <code>g(x)</code>: we get <code>C</code> — this is <code>f(x)(g(x))</code></li>
                    <li>Close all three assumptions by →-I three times.</li>
                </ol>

                <h3>Step 2: The Program (Computation Side)</h3>
                <div class="lesson-example">
                    <code>λf. λg. λx. f x (g x)</code>
                    <p>Type: <code>(A → B → C) → (A → B) → A → C</code></p>
                    <p>This is the <strong>S combinator</strong>. Every step of the proof corresponds to a syntactic element of the program. The assumptions are parameters. The →-Eliminations are function applications. The →-Introductions are lambda abstractions.</p>
                </div>

                <h3>Step 3: Execution = Proof Simplification</h3>
                <p>If we supply concrete arguments:</p>
                <div class="lesson-example">
                    <code>S add succ 3</code> = <code>(λf. λg. λx. f x (g x)) add succ 3</code><br>
                    → <code>add 3 (succ 3)</code> → <code>add 3 4</code> → <code>7</code>
                    <p>Each β-reduction step corresponds to a Cut Elimination step in the proof. The computation IS the proof simplification.</p>
                </div>

                <div class="lesson-tip">
                    <strong>✎ Try It:</strong> In JUDIT's Lambda tab, type <code>\\f. \\g. \\x. f x (g x)</code>. Check its type. Then expand the proof tree to see the full Natural Deduction derivation. You are looking at the same object from two perspectives — the program and the proof.
                </div>

                <div class="lesson-example">
                    <strong>The Big Picture:</strong> We began this journey with truth tables (Lesson 1). We passed through possible worlds (Lesson 5), knowledge and information (Lessons 11-13), computation (Lessons 14-19), and proof theory (Lesson 20). Now, with Curry-Howard, these threads converge: <strong>Logic, Computation, and Proof are three faces of the same Crystal.</strong>
                </div>
            </div>
        `
    },
    {
        id: 25,
        title: "Ordinals & The Hydra Game",
        content: `
    < div class="lesson-card" >
                <h2>25. Ordinals & The Hydra Game</h2>
                <div class="lesson-quote">
                    "The infinite can be tamed, but not easily."
                </div>
                <p>Beyond the finite integers (1, 2, 3...) lie the <strong>Ordinal Numbers</strong> (ω, ω+1, ω^ω...). These are used to measure the "Proof-Theoretic Strength" of a logical system. JUDIT uses the <strong>Worm/Ordinal notation</strong> to label the complexity of your derivation trees.</p>

                <h3>Goodstein's Theorem & The Hydra</h3>
                <p>Imagine a Hydra. Every time you cut off a head, it grows back multiple new heads on a different branch. It seems impossible to kill. However, <strong>Reuben Goodstein</strong> proved that if you follow a specific mathematical rule, the Hydra WILL eventually die.</p>

                <div class="lesson-warning">
                    <strong>The Catch:</strong> The proof that you win cannot be done within standard Arithmetic (Peano Axioms). It requires the strength of an ordinal called <strong>ε₀ (Epsilon Zero)</strong>. It is a win that is "true but unprovable" in simple systems.
                </div>

                <h3>The Ordinal Calculator</h3>
                <p>The sidebar in JUDIT features an experimental <em>Ordinal/Worm</em> explorer. Here, you can visualize how small changes in a recursive rule can lead to explosive growth towards transfinite infinities.</p>
            </div >
    `
    },
    {
        id: 26,
        title: "Type Theory & Russel's Paradox",
        content: `
    < div class="lesson-card" >
                <h2>26. Type Theory & Russel's Paradox</h2>
                <p>In 1901, <strong>Bertrand Russell</strong> discovered a fatal flaw in early set theory. He asked: <em>"Does the set of all sets that do not contain themselves contain itself?"</em></p>
                <ul>
                    <li>If it DOES, then it doesn't (by definition).</li>
                    <li>If it DOES NOT, then it must (by definition).</li>
                </ul>

                <h3>The Solution: Hierarchies and Types</h3>
                <p>To fix this, Russell (and later Church) developed <strong>Type Theory</strong>. You cannot have a set of sets without specifying its "Grade" or "Type." A term can only act on terms of a <strong>lower type</strong>.</p>

                <div class="lesson-example">
                    <strong>In the Lambda Tab:</strong>
                    <p>JUDIT uses <em>Simply Typed Lambda Calculus</em>. If you try to write <code>\\x. x x</code> (self-application), the type checker will throw an error. Why? Because <code>x</code> cannot simultaneously be a "Function" and the "Input to that function." Type theory enforces logical hygiene.</p>
                </div>

                <h3>Philosophical Context: Cantor's Paradise</h3>
                <p>Georg Cantor discovered that there are different "sizes" of infinity. Type theory is the way we organize these infinite layers to prevent the universe of logic from collapsing into contradiction.</p>
            </div >
    `
    },
    {
        id: 27,
        title: "Bisimulation: Twin Worlds",
        content: `
    < div class="lesson-card" >
                <h2>27. Bisimulation: Twin Worlds</h2>
                <p>Two worlds are <strong>Bisimilar</strong> if they behave identically from a modal perspective. Even if they have different names or are in different parts of the canvas, if they satisfy all the same modal formulas, they are <strong>Logically Equivalent</strong>.</p>

                <h3>Structural Equivalence</h3>
                <p>The concept was refined by <strong>David Park</strong> and <strong>Robin Milner</strong> in the study of <em>Process Calculi</em> (how computers communicate). If two programs "bisimulate," you can swap one for the other and no observer will ever know the difference.</p>

                <div class="lesson-example">
                    <strong>The Mirror Test:</strong>
                    <ol>
                        <li>World A has <code>p</code> and points to World B.</li>
                        <li>World C has <code>p</code> and points to World D.</li>
                        <li>If B and D are identical, then A and C are bisimilar.</li>
                    </ol>
                </div>

                <div class="lesson-tip">
                    <strong>Refinement:</strong> JUDIT's <em>System Redundancy</em> check uses a Co-Inductive algorithm to find these "Twin Worlds". Merging them (Model Minimization) is a key step in optimizing complex logical systems.
                </div>
            </div >
    `
    },
    {
        id: 28,
        title: "Epistemic Paradoxes: Surprise Exam",
        content: `
    < div class="lesson-card" >
                <h2>28. Paradoxes of Knowledge & Timing</h2>
                <p>Knowledge isn't just about facts; it's about <em>timing</em>. The <strong>Surprise Exam Paradox</strong> shows how logic can struggle with self-referential time.</p>

                <h3>The Paradox</h3>
                <p>A teacher says: "There will be a surprise exam next week, but you won't know which day until it happens."</p>
                <ul>
                    <li>Student: "It can't be Friday. If I'm still alive Thursday night, I'll know it's Friday, so it's not a surprise."</li>
                    <li>Student: "Since it's not Friday, it can't be Thursday..."</li>
                    <li>Result: The student "proves" the exam is impossible. On Wednesday, the exam happens. The student is surprised.</li>
                </ul>

                <h3>Modeling Meta-Knowledge</h3>
                <p>To resolve this, we must use <strong>Multi-Agent Epistemic Logic</strong>. The "Surprise" is a modal property: <code>¬K_student (Exam_on_day_i)</code>. JUDIT allows you to model these nested beliefs (I know that you don't know that I know...) to see where the logic breaks down.</p>
            </div >
    `
    },
    {
        id: 29,
        title: "The Busy Beaver (Radical Non-Computability)",
        content: `
    < div class="lesson-card" >
                <h2>29. The Busy Beaver Machine</h2>
                <div class="lesson-quote">
                    "There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy — or your computer."
                </div>
                <p>Some numbers are so large they are <strong>Non-Computable</strong>. Tibor Radó introduced the <strong>Busy Beaver</strong> to prove that some problems are impossible for any machine to solve.</p>

                <h3>The Challenge</h3>
                <p>How many '1's can an <em>n</em>-state Turing Machine write on an empty tape before halting? For 5 states, the number is already massive. For 6, it is unknown and likely larger than the number of atoms in the universe.</p>

                <div class="lesson-warning">
                    <strong>The Limit of JUDIT:</strong> If you build a Busy Beaver in the Turing Tab, JUDIT might run for millions of cycles. But because of the <strong>Halting Problem</strong>, no program can ever be written to tell you <em>offline</em> if the machine will ever stop.
                </div>

                <h3>The Bound of Thought</h3>
                <p>This proves that human logic and calculation have a hard, mathematical ceiling. There are truths that are "Too Busy" to ever be computed.</p>
            </div >
    `
    },
    {
        id: 30,
        title: "The Logos Canvas: Final Challenge",
        content: `
    < div class="lesson-card" >
                <h2>30. The Logos Canvas: Your New Universe</h2>
                <p>Congratulations. You have traveled from the atomic simplicity of George Boole to the transfinite ordinals of the Hydra, and through the cybernetic loops of Ashby and Wiener.</p>

                <h3>The Scripting API</h3>
                <p>You have the foundations. Now, it's time to build. JUDIT features a hidden <strong>Logos Console</strong> (the Scripting API). You can write custom JavaScript to:</p>
                <ul>
                    <li>Generate fractal Kripke models.</li>
                    <li>Automate complex Public Announcements.</li>
                    <li>Run probabilistic simulations of agent interactions.</li>
                </ul>

                <div class="lesson-example">
                    <strong>Final Challenge:</strong>
                    <ol>
                        <li>Open the <em>Help</em> tab.</li>
                        <li>Find a script snippet from Section 8.</li>
                        <li>Paste it into the Logos Console.</li>
                        <li>Watch as a hundred worlds bloom on your canvas at once.</li>
                    </ol>
                </div>

                <div class="lesson-quote">
                    "The universe is a formal system, and you are its scriptwriter."
                </div>

                <p style="text-align: center; font-style: italic; margin-top: 40px; color: #4a90e2;">This concludes the JUDIT Foundation Course. Go forth and calculate.</p>
            </div >
    `
    }
];
