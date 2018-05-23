const reg = require('./reg').styleTagReg
module.exports =
  function replace(str) {
    return str.replace(reg, ($, $1, $2) => {
      return `<${$1}style${$2}>`
    });
  }