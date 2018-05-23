const compressCss = require('../index.js');
const fs = require('fs');
const gulp = require('gulp');

function checkGulp(content, cb, option) {
  option = Object.assign({
    ext: 'html'
  }, option)
  fs.writeFile(`__test__/src.${option.ext}`, content, (err) => {
    expect(err).toBe(null)
    let stream = gulp.src(`__test__/src.${option.ext}`)
      .pipe(compressCss(option))
      .pipe(gulp.dest('__test__/dest'))

    stream.on('end', function () {
      fs.readFile(`__test__/dest/src.${option.ext}`, (err, content) => {

        expect(err).toBe(null)
        cb && cb(content.toString())
      })
    })
  })
}

describe('style tag replace', function () {
  const replace = require('../utils/styleTagTrim')
  test('simple tag', function () {
    expect(replace('<  style   >')).toBe('<style>')
    expect(replace('< style   >')).toBe('<style>')
    expect(replace('<  style>')).toBe('<style>')
    expect(replace('</   style   >')).toBe('</style>')
    expect(replace('<   /   style   >')).toBe('</style>')
    expect(replace('</\n\r\n   style   \n\r\n>')).toBe('</style>')
    expect(replace('<\n\r\n       style   \n\r\n/>')).toBe('<style/>')
  })
})
describe('compress .html file', function () {
  test('single style', function (done) {
    checkGulp(
      `333<style>
      .a {
        color: #333;
      }
      .b {
        color: #333
      }
      </style>222111`,
      function (str) {
        expect(str).toBe('333<style>.a{color:#333;}.b{color:#333}</style>222111')
        done();
      }
    )
  })
  test('single style_2', function (done) {
    checkGulp(
      `333\n<style>
      .a {
        color: #333;
      }
      .b {
        color: #333
      }
      </style>\n222111`,
      function (str) {
        expect(str).toBe('333\n<style>.a{color:#333;}.b{color:#333}</style>\n222111')
        done();
      }
    )
  })
  test('[meger]two style', function (done) {
    checkGulp(
      `333<style>
      .a {
        color: #333;
      }
      .b {
        color: #333
      }
      </style>
      <style>
      .c {
        font-size: 12px;
      }.d {
        font-size: 120px;
      }
      </style>222111`,
      function (str) {
        expect(str).toBe('333\n<style>.a{color:#333;}.b{color:#333}.c{font-size:12px;}.d{font-size:120px;}</style>\n222111')
        done();
      },
      { merge: true }
    )
  })
})
describe('compress .css file', function () {
  test('simple compress', function (done) {
    checkGulp(
      `
      .a {
        color: #333;
      }
      .b {
        color: #333
      }
      .c {
        font-size: 12px;
      }.d {
        font-size: 120px;
      }`,
      function (str) {
        expect(str).toBe('.a{color:#333;}.b{color:#333}.c{font-size:12px;}.d{font-size:120px;}')
        done();
      },
      { ext: 'css' }
    )
  })
  test('keep one rule one singe line', function (done) {
    checkGulp(
      `
      .a {
        color: #333;
      }
      .b {
        color: #333
      }
      .c {
        font-size: 12px;
      }.d {
        font-size: 120px;
      }`,
      function (str) {
        expect(str).toBe('.a {color:#333;}\n.b {color:#333}\n.c {font-size:12px;}\n.d {font-size:120px;}')
        done();
      },
      { ext: 'css', clearLine: false }
    )
  })
  test('compress @keyframe rules', function (done) {
    checkGulp(
      `
      @keyframe a {
        0% {
          left: 10px;
        }
        100% {
          left: 0;
        }
      }`,
      function (str) {
        expect(str).toBe('@keyframe a {\n0% {left:10px;}\n100% {left:0;}\n}')
        done();
      },
      { ext: 'css', clearLine: false }
    )
  })
  test('compress complex rules', function (done) {
    checkGulp(
      `
      .a + .b   
       {
        color: #333;
      }
      .b, .a + .v,
      .c + .c
       {
        color: #333
      }
      @media and    
       screen (max-width: 1200px) {
        font-size: 12px;
      }`,
      function (str) {
        expect(str).toBe('.a + .b {color:#333;}\n.b, .a + .v, .c + .c {color:#333}\n@media and screen (max-width: 1200px) {font-size:12px;}')
        done();
      },
      { ext: 'css', clearLine: false }
    )
  })
})