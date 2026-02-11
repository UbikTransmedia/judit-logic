// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

import moo from "moo";

const lexer = moo.compile({
  ws:      /[ \s]+/,
  nl:      { match: /\n/, lineBreaks: true },
  lte:     /<=/,
  gte:     />=/,
  eq:      /==/,
  lparen:  ['(', '['],
  rparen:  [')', ']'],
  not:     ['¬', '~', '!'],
  and:     ['∧', '&', '&&'],
  or:      ['∨', '|', '||'],
  implies: ['→', '->', '=>'],
  iff:     ['↔', '<->', '<=>'],
  box:     ['□', '[]'],
  diamond: ['◊', '<>', '⋄'],
  top:     ['⊤', 'T', 'true'],
  bot:     ['⊥', 'F', 'false'],
  forall:  ['∀', 'Forall', 'A'],
  exists:  ['∃', 'Exists', 'E'],
  dot:     '.',
  comma:   ',',
  atom:    /[a-z][0-9]*/,
  agent:   /[a-d]/, 
});

// Helper to unwrap nested arrays from Nearley
// const id = d => d[0]; // Nearley adds this automatically now!
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": d => null},
    {"name": "main", "symbols": ["formula"], "postprocess": id},
    {"name": "formula", "symbols": ["_", "iff", "_"], "postprocess": d => d[1]},
    {"name": "formula", "symbols": ["iff"], "postprocess": id},
    {"name": "iff", "symbols": ["implies", "_", (lexer.has("iff") ? {type: "iff"} : iff), "_", "implies"], "postprocess": d => ({ type: 'binary', operator: '↔', left: d[0], right: d[4] })},
    {"name": "iff", "symbols": ["implies"], "postprocess": id},
    {"name": "implies", "symbols": ["or", "_", (lexer.has("implies") ? {type: "implies"} : implies), "_", "implies"], "postprocess": d => ({ type: 'binary', operator: '→', left: d[0], right: d[4] })},
    {"name": "implies", "symbols": ["or"], "postprocess": id},
    {"name": "or", "symbols": ["or", "_", (lexer.has("or") ? {type: "or"} : or), "_", "and"], "postprocess": d => ({ type: 'binary', operator: '∨', left: d[0], right: d[4] })},
    {"name": "or", "symbols": ["and"], "postprocess": id},
    {"name": "and", "symbols": ["and", "_", (lexer.has("and") ? {type: "and"} : and), "_", "unary"], "postprocess": d => ({ type: 'binary', operator: '∧', left: d[0], right: d[4] })},
    {"name": "and", "symbols": ["unary"], "postprocess": id},
    {"name": "unary", "symbols": [(lexer.has("not") ? {type: "not"} : not), "_", "unary"], "postprocess": d => ({ type: 'unary', operator: '¬', operand: d[2] })},
    {"name": "unary", "symbols": ["modal"], "postprocess": id},
    {"name": "modal", "symbols": [(lexer.has("box") ? {type: "box"} : box), "_", "modal"], "postprocess": d => ({ type: 'modal', operator: '□', operand: d[2] })},
    {"name": "modal", "symbols": [(lexer.has("diamond") ? {type: "diamond"} : diamond), "_", "modal"], "postprocess": d => ({ type: 'modal', operator: '◊', operand: d[2] })},
    {"name": "modal", "symbols": [(lexer.has("box") ? {type: "box"} : box), "_", {"literal":"_"}, "_", (lexer.has("agent") ? {type: "agent"} : agent), "_", "modal"], "postprocess": d => ({ type: 'modal', operator: '□', agent: d[4].value, operand: d[6] })},
    {"name": "modal", "symbols": [(lexer.has("diamond") ? {type: "diamond"} : diamond), "_", {"literal":"_"}, "_", (lexer.has("agent") ? {type: "agent"} : agent), "_", "modal"], "postprocess": d => ({ type: 'modal', operator: '◊', agent: d[4].value, operand: d[6] })},
    {"name": "modal", "symbols": ["quantifier"], "postprocess": id},
    {"name": "modal", "symbols": ["predicate"], "postprocess": id},
    {"name": "modal", "symbols": ["atom"], "postprocess": id},
    {"name": "quantifier", "symbols": [(lexer.has("forall") ? {type: "forall"} : forall), "_", (lexer.has("atom") ? {type: "atom"} : atom), "_", (lexer.has("dot") ? {type: "dot"} : dot), "_", "formula"], "postprocess": d => ({ type: 'quantifier', operator: '∀', variable: d[2].value, operand: d[6] })},
    {"name": "quantifier", "symbols": [(lexer.has("exists") ? {type: "exists"} : exists), "_", (lexer.has("atom") ? {type: "atom"} : atom), "_", (lexer.has("dot") ? {type: "dot"} : dot), "_", "formula"], "postprocess": d => ({ type: 'quantifier', operator: '∃', variable: d[2].value, operand: d[6] })},
    {"name": "quantifier", "symbols": [(lexer.has("forall") ? {type: "forall"} : forall), "_", (lexer.has("atom") ? {type: "atom"} : atom), "_", "modal"], "postprocess": d => ({ type: 'quantifier', operator: '∀', variable: d[2].value, operand: d[4] })},
    {"name": "quantifier", "symbols": [(lexer.has("exists") ? {type: "exists"} : exists), "_", (lexer.has("atom") ? {type: "atom"} : atom), "_", "modal"], "postprocess": d => ({ type: 'quantifier', operator: '∃', variable: d[2].value, operand: d[4] })},
    {"name": "predicate", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "args", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => ({ type: 'predicate', name: d[0].value, args: d[4] })},
    {"name": "args", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)], "postprocess": d => [d[0].value]},
    {"name": "args", "symbols": ["args", "_", {"literal":","}, "_", (lexer.has("atom") ? {type: "atom"} : atom)], "postprocess": d => [...d[0], d[4].value]},
    {"name": "atom", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)], "postprocess": d => ({ type: 'atom', name: d[0].value })},
    {"name": "atom", "symbols": [(lexer.has("top") ? {type: "top"} : top)], "postprocess": d => ({ type: 'constant', value: true })},
    {"name": "atom", "symbols": [(lexer.has("bot") ? {type: "bot"} : bot)], "postprocess": d => ({ type: 'constant', value: false })},
    {"name": "atom", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "formula", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => d[2]}
]
  , ParserStart: "_"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
