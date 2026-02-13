// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

import moo from "moo";

const baseLexer = moo.compile({
  ws:      /[ \t]+/,
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
  always:  ['G'],
  eventually: ['F'],
  next:    ['X', '○'],
  top:     ['⊤', 'T', 'true'],
  bot:     ['⊥', 'F', 'false'],
  ctl_ex:  'EX',
  ctl_ax:  'AX',
  ctl_ef:  'EF',
  ctl_af:  'AF',
  ctl_eg:  'EG',
  ctl_ag:  'AG',
  ctl_eu:  'EU',
  ctl_au:  'AU',
  forall:  ['∀', 'Forall', 'forall'],
  exists:  ['∃', 'Exists', 'exists'],
  dot:     ['.', ':'],
  comma:   ',',
  atom:    /[a-zA-Z][0-9]*/,
  agent:   /[a-d]/, 
  number:  /[0-9]+/,
});

// Lexer wrapper that skips whitespace
const lexer = {
  has: (type) => baseLexer.has(type),
  reset: (data, state) => baseLexer.reset(data, state),
  next: () => {
    let next;
    while ((next = baseLexer.next()) && next.type === 'ws') {}
    return next;
  },
  save: () => baseLexer.save(),
  formatError: (token, message) => baseLexer.formatError(token, message),
};
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["formula"], "postprocess": id},
    {"name": "formula", "symbols": ["iff"], "postprocess": id},
    {"name": "iff", "symbols": ["implies", (lexer.has("iff") ? {type: "iff"} : iff), "implies"], "postprocess": d => ({ type: 'binary', operator: '↔', left: d[0], right: d[2] })},
    {"name": "iff", "symbols": ["implies"], "postprocess": id},
    {"name": "implies", "symbols": ["or", (lexer.has("implies") ? {type: "implies"} : implies), "implies"], "postprocess": d => ({ type: 'binary', operator: '→', left: d[0], right: d[2] })},
    {"name": "implies", "symbols": ["or"], "postprocess": id},
    {"name": "or", "symbols": ["or", (lexer.has("or") ? {type: "or"} : or), "and"], "postprocess": d => ({ type: 'binary', operator: '∨', left: d[0], right: d[2] })},
    {"name": "or", "symbols": ["and"], "postprocess": id},
    {"name": "and", "symbols": ["and", (lexer.has("and") ? {type: "and"} : and), "unary"], "postprocess": d => ({ type: 'binary', operator: '∧', left: d[0], right: d[2] })},
    {"name": "and", "symbols": ["unary"], "postprocess": id},
    {"name": "unary", "symbols": [(lexer.has("not") ? {type: "not"} : not), "unary"], "postprocess": d => ({ type: 'unary', operator: '¬', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("always") ? {type: "always"} : always), "unary"], "postprocess": d => ({ type: 'modal', operator: 'G', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("eventually") ? {type: "eventually"} : eventually), "unary"], "postprocess": d => ({ type: 'modal', operator: 'F', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("next") ? {type: "next"} : next), "unary"], "postprocess": d => ({ type: 'modal', operator: 'X', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("box") ? {type: "box"} : box), "unary"], "postprocess": d => ({ type: 'modal', operator: '□', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("diamond") ? {type: "diamond"} : diamond), "unary"], "postprocess": d => ({ type: 'modal', operator: '◊', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("ctl_ex") ? {type: "ctl_ex"} : ctl_ex), "unary"], "postprocess": d => ({ type: 'ctl_unary', operator: 'EX', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("ctl_ax") ? {type: "ctl_ax"} : ctl_ax), "unary"], "postprocess": d => ({ type: 'ctl_unary', operator: 'AX', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("ctl_ef") ? {type: "ctl_ef"} : ctl_ef), "unary"], "postprocess": d => ({ type: 'ctl_unary', operator: 'EF', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("ctl_af") ? {type: "ctl_af"} : ctl_af), "unary"], "postprocess": d => ({ type: 'ctl_unary', operator: 'AF', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("ctl_eg") ? {type: "ctl_eg"} : ctl_eg), "unary"], "postprocess": d => ({ type: 'ctl_unary', operator: 'EG', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("ctl_ag") ? {type: "ctl_ag"} : ctl_ag), "unary"], "postprocess": d => ({ type: 'ctl_unary', operator: 'AG', operand: d[1] })},
    {"name": "unary", "symbols": [(lexer.has("ctl_eu") ? {type: "ctl_eu"} : ctl_eu), (lexer.has("lparen") ? {type: "lparen"} : lparen), "formula", (lexer.has("comma") ? {type: "comma"} : comma), "formula", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => ({ type: 'ctl_binary', operator: 'EU', left: d[2], right: d[4] })},
    {"name": "unary", "symbols": [(lexer.has("ctl_au") ? {type: "ctl_au"} : ctl_au), (lexer.has("lparen") ? {type: "lparen"} : lparen), "formula", (lexer.has("comma") ? {type: "comma"} : comma), "formula", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => ({ type: 'ctl_binary', operator: 'AU', left: d[2], right: d[4] })},
    {"name": "unary", "symbols": [(lexer.has("box") ? {type: "box"} : box), {"literal":"_"}, (lexer.has("agent") ? {type: "agent"} : agent), "unary"], "postprocess": d => ({ type: 'modal', operator: '□', agent: d[2].value, operand: d[3] })},
    {"name": "unary", "symbols": [(lexer.has("diamond") ? {type: "diamond"} : diamond), {"literal":"_"}, (lexer.has("agent") ? {type: "agent"} : agent), "unary"], "postprocess": d => ({ type: 'modal', operator: '◊', agent: d[2].value, operand: d[3] })},
    {"name": "unary", "symbols": [{"literal":"["}, (lexer.has("number") ? {type: "number"} : number), {"literal":"]"}, "unary"], "postprocess": d => ({ type: 'modal', operator: '□', agent: d[1].value, operand: d[3] })},
    {"name": "unary", "symbols": [{"literal":"<"}, (lexer.has("number") ? {type: "number"} : number), {"literal":">"}, "unary"], "postprocess": d => ({ type: 'modal', operator: '◊', agent: d[1].value, operand: d[3] })},
    {"name": "unary", "symbols": ["quantifier"], "postprocess": id},
    {"name": "unary", "symbols": ["predicate"], "postprocess": id},
    {"name": "unary", "symbols": ["atom"], "postprocess": id},
    {"name": "quantifier", "symbols": [(lexer.has("forall") ? {type: "forall"} : forall), (lexer.has("atom") ? {type: "atom"} : atom), (lexer.has("dot") ? {type: "dot"} : dot), "formula"], "postprocess": d => ({ type: 'quantifier', operator: '∀', variable: d[1].value, operand: d[3] })},
    {"name": "quantifier", "symbols": [(lexer.has("exists") ? {type: "exists"} : exists), (lexer.has("atom") ? {type: "atom"} : atom), (lexer.has("dot") ? {type: "dot"} : dot), "formula"], "postprocess": d => ({ type: 'quantifier', operator: '∃', variable: d[1].value, operand: d[3] })},
    {"name": "quantifier", "symbols": [(lexer.has("forall") ? {type: "forall"} : forall), (lexer.has("atom") ? {type: "atom"} : atom), "unary"], "postprocess": d => ({ type: 'quantifier', operator: '∀', variable: d[1].value, operand: d[2] })},
    {"name": "quantifier", "symbols": [(lexer.has("exists") ? {type: "exists"} : exists), (lexer.has("atom") ? {type: "atom"} : atom), "unary"], "postprocess": d => ({ type: 'quantifier', operator: '∃', variable: d[1].value, operand: d[2] })},
    {"name": "predicate", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom), (lexer.has("lparen") ? {type: "lparen"} : lparen), "term_list", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => ({ type: 'predicate', name: d[0].value, args: d[2] })},
    {"name": "term_list", "symbols": ["term"], "postprocess": d => [d[0]]},
    {"name": "term_list", "symbols": ["term_list", (lexer.has("comma") ? {type: "comma"} : comma), "term"], "postprocess": d => [...d[0], d[2]]},
    {"name": "term", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom), (lexer.has("lparen") ? {type: "lparen"} : lparen), "term_list", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => ({ type: 'function', name: d[0].value, args: d[2] })},
    {"name": "term", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)], "postprocess": d => ({ type: 'variable', name: d[0].value })},
    {"name": "atom", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)], "postprocess": d => ({ type: 'atom', name: d[0].value })},
    {"name": "atom", "symbols": [(lexer.has("top") ? {type: "top"} : top)], "postprocess": d => ({ type: 'constant', value: true })},
    {"name": "atom", "symbols": [(lexer.has("bot") ? {type: "bot"} : bot)], "postprocess": d => ({ type: 'constant', value: false })},
    {"name": "atom", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "formula", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => d[1]}
]
  , ParserStart: "main"
}
export default grammar;
