@{%
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
  forall:  ['∀', 'Forall', 'forall', 'A'],
  exists:  ['∃', 'Exists', 'exists', 'E'],
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
%}

@lexer lexer

main -> formula {% id %}

formula -> 
    iff {% id %}

iff -> 
    implies %iff implies {% d => ({ type: 'binary', operator: '↔', left: d[0], right: d[2] }) %}
  | implies {% id %}

implies -> 
    or %implies implies {% d => ({ type: 'binary', operator: '→', left: d[0], right: d[2] }) %}
  | or {% id %}

or -> 
    or %or and {% d => ({ type: 'binary', operator: '∨', left: d[0], right: d[2] }) %}
  | and {% id %}

and -> 
    and %and unary {% d => ({ type: 'binary', operator: '∧', left: d[0], right: d[2] }) %}
  | unary {% id %}

unary ->
    %not unary {% d => ({ type: 'unary', operator: '¬', operand: d[1] }) %}
  | %always unary {% d => ({ type: 'modal', operator: 'G', operand: d[1] }) %}
  | %eventually unary {% d => ({ type: 'modal', operator: 'F', operand: d[1] }) %}
  | %next unary {% d => ({ type: 'modal', operator: 'X', operand: d[1] }) %}
  | %box unary {% d => ({ type: 'modal', operator: '□', operand: d[1] }) %}
  | %diamond unary {% d => ({ type: 'modal', operator: '◊', operand: d[1] }) %}
  | %box "_" %agent unary {% d => ({ type: 'modal', operator: '□', agent: d[2].value, operand: d[3] }) %}
  | %diamond "_" %agent unary {% d => ({ type: 'modal', operator: '◊', agent: d[2].value, operand: d[3] }) %}
  | "[" %number "]" unary {% d => ({ type: 'modal', operator: '□', agent: d[1].value, operand: d[3] }) %}
  | "<" %number ">" unary {% d => ({ type: 'modal', operator: '◊', agent: d[1].value, operand: d[3] }) %}
  | quantifier {% id %}
  | predicate {% id %}
  | atom {% id %}

quantifier ->
    %forall %atom %dot formula {% d => ({ type: 'quantifier', operator: '∀', variable: d[1].value, operand: d[3] }) %}
  | %exists %atom %dot formula {% d => ({ type: 'quantifier', operator: '∃', variable: d[1].value, operand: d[3] }) %}
  | %forall %atom unary {% d => ({ type: 'quantifier', operator: '∀', variable: d[1].value, operand: d[2] }) %}
  | %exists %atom unary {% d => ({ type: 'quantifier', operator: '∃', variable: d[1].value, operand: d[2] }) %}

predicate ->
    %atom %lparen args %rparen {% d => ({ type: 'predicate', name: d[0].value, args: d[2] }) %}

args ->
    %atom {% d => [d[0].value] %}
  | args "," %atom {% d => [...d[0], d[2].value] %}

atom ->
    %atom {% d => ({ type: 'atom', name: d[0].value }) %}
  | %top {% d => ({ type: 'constant', value: true }) %}
  | %bot {% d => ({ type: 'constant', value: false }) %}
  | %lparen formula %rparen {% d => d[1] %}
