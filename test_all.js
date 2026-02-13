import { FormulaParser } from './src/parser/parser.js';
import { Model, World, Variable, FunctionalTerm } from './src/core/logic.js';
import { LambdaEngine } from './src/core/lambda.js';

async function test() {
    console.log("--- Phase A: FOL Verification ---");
    const parser = new FormulaParser();
    const model = new Model();
    const w1 = new World('w1');
    w1.setAtom('P(a)', true);
    w1.setAtom('P(b)', false);
    model.addWorld(w1);
    model.addObject('a');
    model.addObject('b');

    const f1 = parser.parse('P(a)');
    console.log(`P(a) evaluate: ${f1.evaluate(model, w1)} (Expected: true)`);

    const f2 = parser.parse('∀x. P(x)');
    console.log(`∀x. P(x) evaluate: ${f2.evaluate(model, w1)} (Expected: false)`);

    const f3 = parser.parse('∃x. P(x)');
    console.log(`∃x. P(x) evaluate: ${f3.evaluate(model, w1)} (Expected: true)`);

    const f4 = parser.parse('∀x. ∃y. R(x,y)');
    w1.setAtom('R(a,a)', false);
    w1.setAtom('R(a,b)', true);
    w1.setAtom('R(b,a)', true);
    w1.setAtom('R(b,b)', false);
    console.log(`∀x. ∃y. R(x,y) evaluate: ${f4.evaluate(model, w1)} (Expected: true)`);

    console.log("\n--- Phase B: System F Verification ---");
    const engine = new LambdaEngine();

    const polyId = 'ΛX.\\x:X.x';
    const res1 = engine.check(polyId);
    if (!res1.valid) console.error("res1 check failed:", res1.error);
    else console.log(`${polyId} type: ${res1.type.toString()} (Expected: ∀X.(X → X))`);

    const polyApp = `(${polyId})[p]`;
    const res2 = engine.check(polyApp);
    if (!res2.valid) console.error("res2 check failed:", res2.error);
    else console.log(`${polyApp} type: ${res2.type.toString()} (Expected: (p → p))`);

    const nestedPoly = 'ΛX.ΛY.\\f:X->Y.\\x:X.f x';
    const res3 = engine.check(nestedPoly);
    if (!res3.valid) console.error("res3 check failed:", res3.error);
    else console.log(`${nestedPoly} type: ${res3.type.toString()}`);

    console.log("\n--- Phase C: CTL Symbolic Verification ---");
    const ctlModel = new Model();
    const s0 = new World('s0');
    const s1 = new World('s1');
    const s2 = new World('s2');
    s0.setAtom('p', true); s0.setAtom('q', false);
    s1.setAtom('p', true); s1.setAtom('q', false);
    s2.setAtom('p', false); s2.setAtom('q', true);

    ctlModel.addWorld(s0); ctlModel.addWorld(s1); ctlModel.addWorld(s2);
    ctlModel.addRelation('s0', 's1');
    ctlModel.addRelation('s1', 's2');
    ctlModel.addRelation('s2', 's0'); // Cycle s0 -> s1 -> s2 -> s0

    // Safety: AG p (p is always true)
    const fSafe = parser.parse('AG p');
    const resSafe = ctlModel.verifySymbolic(fSafe);
    console.log(`AG p at s0 (symbolic): ${resSafe.get('s0')} (Expected: false, since s2 has !p)`);

    // Liveness: AF q (q eventually holds)
    const fLive = parser.parse('AF q');
    const resLive = ctlModel.verifySymbolic(fLive);
    console.log(`AF q at s0 (symbolic): ${resLive.get('s0')} (Expected: true, cycle reaches s2)`);

    // Invariance: AG(p -> AF q)
    const fInv = parser.parse('AG (p → AF q)');
    const resInv = ctlModel.verifySymbolic(fInv);
    console.log(`AG(p -> AF q) at s0: ${resInv.get('s0')} (Expected: true)`);

    console.log("\nVerification Complete!");
}

test().catch(console.error);
