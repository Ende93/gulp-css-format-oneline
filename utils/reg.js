module.exports = {
  commentReg: /\/\*.*\*\//g,
  styleTagReg: /<[\s\n]{0,}(\/?)[\s\n]{0,}style[\s\n]{0,}(\/?)>/,
  paranthesesReg: /([.#+:\w-\s@(),]+)(\{[\w-:;\s#()+*./,]{0,};?\s{0,}\})/g
}