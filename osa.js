/*

This code extracted from https://github.com/wtfaremyinitials/osa2
I needed to remove the child process stdout buffer limit.

See https://github.com/wtfaremyinitials/osa2 for original copyright info.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var exec = require('child_process').execFile
var transform = require('babel-core').transform

function osa(fn) {
    var code = transform(`
        ObjC.import('stdlib')
        var fn   = (${fn.toString()})
        var args = JSON.parse($.getenv('OSA_ARGS'))
        var out  = fn.apply(null, args)
        JSON.stringify(out)
    `, { presets: ['env'] }).code

    var osafn = function(...args) {
        return new Promise((res, rej) => {
            var child = exec(
                '/usr/bin/osascript',
                ['-l', 'JavaScript'],
                {
                    env: {
                        OSA_ARGS: JSON.stringify(args),
                    },
                    maxBuffer: Infinity
                },
                (err, stdout, stderr) => {
                    if (err) {
                        return rej(err)
                    }

                    if (stderr) {
                        console.log(stderr)
                    }

                    if (!stdout) {
                        res(undefined)
                    }

                    try {
                        res(JSON.parse(stdout.toString()))
                    } catch (e) {
                        rej(e)
                    }
                }
            )
            child.stdin.write(code)
            child.stdin.end()
        })
    }
    return osafn
}

module.exports = osa