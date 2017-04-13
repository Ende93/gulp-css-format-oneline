var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

var line = '';
var styleStart = '<style>',
    styleEnd = '<\/style>',
    commentStart = '/*',
    commentEnd = '*/';

var BUFF_READ_LENGTH = 100;

function isStyle(file) {
    var dealing = 0,
        ext = path.extname(file.path);

    if (ext == '.css') {
        return true;
    } else if (ext == '.js' || ext == '.json') {
        return false;
    }

    return function (str) {
        var index = [
            str.indexOf(styleStart),
            str.indexOf(styleEnd)
        ];

        if (index[0] > -1) {
            // next line is true style
            // now is '<style>'
            return dealing++;
        } else if (index[1] > -1) {
            // not style anymore
            return --dealing;
        }

        return dealing;
    };
}

function readLine(data, cb, end, len) {
    for (var index = data.indexOf('\n');
      index > -1; index = data.indexOf('\n'), line = '') {
        line += data.slice(0, index + 1);

        cb(line);
        data = data.slice(index + 1);
    }

    if (data.length > 0) {
        line = data;
    }

    if(end >= len) {
        cb(line);
    }
}

function gulpPrefix() {
    var bracketStart = false,
        isComment = false;

    var stream = through.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(createError(file, 'Streaming not supported'));
        }

        if (!file.isBuffer()) {
            return callback(null, file);
        }

        var check = isStyle(file),
            data, start = 0,
            end = 0;
        var buffer = new Buffer(''),
            _rule = '',
            canwrite = false,
            len = file.contents.length;

        if (!check) {
            return callback(null, file);
        }

        while (start < len && end < len) {
            if (end + 100 > len) {
                end = len;
            } else {
                end += BUFF_READ_LENGTH;
            }

            readLine(file.contents.slice(start, end).toString(), function (str) {
                if (check == true ||
                    (typeof check == 'function' && check(str))
                ) {
                    if (str.indexOf(commentStart) > -1 || isComment) {
                        canwrite = true;
                        _rule = str;
                        if(str.indexOf(commentEnd) > -1) {
                            isComment = false;
                        } else {
                            isComment = true;
                        }
                    } else {
                        _rule += dealRuleLine(str);

                        var index = _rule.indexOf('}');
                        if (index > -1) {
                            _rule += '\n';
                            canwrite = true;
                        }
                    }
                } else {
                    canwrite = true;
                    _rule = str;
                }

                if (canwrite || check == false) {
                    // write one selector rules,
                    // eg. '.selector { display:...;font:...;}'
                    buffer = Buffer.concat([buffer, new Buffer(_rule)]);

                    _rule = '';
                    canwrite = false;
                }
            }, end, len);

            start = end;
        }

        file.contents = buffer;
        callback(null, file);
    });

    function dealRuleLine(str) {
        str = str.trim();

        if (str.indexOf('{') > -1) {
            bracketStart = true;
        } else if (str.indexOf('}') > -1) {
            bracketStart = false;
        }

        if (bracketStart) {
            str = str.replace(/\n/g, '');
        }

        return str;
    }

    stream.on('error', function (err) {
        console.log(err);
    });

    return stream;
}

module.exports = gulpPrefix;