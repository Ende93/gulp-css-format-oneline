const through = require('through2');
const gutil = require('gulp-util');
const path = require('path');
const styleTagTrim = require('./utils/styleTagTrim')
const { commentReg, paranthesesReg } = require('./utils/reg')

function isStyle(file, target) {
  let ext = path.extname(file.path);

  if (ext === target) {
    return true;
  }
  if (!/\.(htm|html|css|ejs|ftl)/.test(ext)) {
    return false;
  }
  return true;
}
// clear style content
function clear(content, option) {
  let ret = content.replace(/(^\s+)|\t+/g, '')
  if (option.clearComment) {
    ret = ret.replace(commentReg, '')
  }
  if (option.clearLine) {
    ret = ret.replace(/\s+/g, '')
  } else {
    // clear \s\n in css rules
    // ie. { ... }
    ret = ret.replace(paranthesesReg, function ($, $1, $2) {
      return $1.replace(/\n/g, '').replace(/\s{2,}/g, ' ') + $2.replace(/[\s\n]+/g, '') + '\n'
    })
    ret = ret.replace(/\n\s{1,}/g, '\n')
    // remove last \n
    if (ret.slice(-1) === '\n') {
      ret = ret.slice(0, -1)
    }
  }
  return ret;
}
function format(content, ext, option) {
  if (ext === '.css' || ext == null) {
    return clear(content, option)
  } else {
    // html content
    // clear style tag
    content = styleTagTrim(content)

    let ret = [];
    let styleIndexs = [];
    let endTagLen = '</style>'.length;
    let start = 0, end = 0,
      len = content.length;
    let prevEnd = start;
    do {
      start = content.indexOf('<style>', prevEnd)
      end = content.indexOf('</style>', start)
      if (start > -1 && end > -1) {
        end += endTagLen;
        ret.push.call(
          ret,
          content.slice(prevEnd, start),
          clear(content.slice(start, end), option)
        )
        prevEnd = end;
      }
    } while (start > -1 && end > -1 && end <= len)

    ret.push(content.slice(prevEnd));

    if (option.merge) {
      let isStyle = /^<style>/;
      // filter \s between styles
      ret = ret.filter((str, i, arr) => {
        if (i > 0 && isStyle.test(arr[i - 1]) && isStyle.test(arr[i + 1])) {
          return !/\s+/.test(str)
        }
        return true;
      })
      let styles = ret.filter(str => isStyle.test(str))
      let others = ret.filter(str => !isStyle.test(str))
      if (styles.length > 1) {
        styles = '<style>' + styles.reduce((a, b) => {
          return a + b.replace(/<.?style>/g, '')
        }, '') + '</style>'
        if (others.length > 1) {
          others.splice(1, 0, styles)
          if (others[0].slice(-1) !== '\n') {
            others[1] = '\n' + others[1]
          }
          if (others[2] && others[2].slice(0) !== '\n') {
            others[1] = others[1] + '\n'
          }

        } else {
          others = styles;
        }
        ret = others
      }
    }
    return ret.join('');
  }
}

function gulpPrefix(option) {
  option = Object.assign({
    // clear comment
    clearComment: true,
    // merge all style tag if html
    merge: false,
    // remove \n\r
    clearLine: true,
    ext: null
  }, option)

  let stream = through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(createError(file, 'Streaming not supported'));
    }

    if (!file.isBuffer()) {
      return callback(null, file);
    }

    let check = isStyle(file, option.ext);

    if (check === false) {
      return callback(null, file);
    }
    let result = file.contents.toString();
    file.contents = Buffer.from(
      format(result, path.extname(file.path), option)
    )
    callback(null, file);
  });

  stream.on('error', function (err) {
    console.log(err);
  });

  return stream;
}

module.exports = gulpPrefix;