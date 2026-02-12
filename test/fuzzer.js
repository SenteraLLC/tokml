// The following code is from https://github.com/mapbox/fuzzer/blob/master/index.js

// ISC License

// Copyright (c) 2017, Mapbox

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.


xtend = require('xtend'),
traverse = require('traverse');


const { Random, MersenneTwister19937 } = require('random-js');

var engine = MersenneTwister19937.seed(0);
var random = new Random(engine);

/**
 * @param _ {number}
 * @returns {null}
 */
module.exports.seed = function(_) {
    engine = MersenneTwister19937.seed(_)
    random = new Random(engine);
};

module.exports.mutate = {
    object: mutateObject,
    string: mutateString
};

function mutateObject(obj) {
    return function generate() {
        // copy the object so that modifications
        // are not additive
        var copy = xtend({}, obj);
        traverse(copy).forEach(transformObjectValue);
        return copy;
    };
}

function transformObjectValue(val) {
    if (random.bool(0.1)) {
        mutateVal.call(this, val);
    } else if (random.bool(0.05)) {
        if (this.level) {
            this.remove();
        }
    }
}

function mutateVal(val) {
    switch(typeof val) {
        case 'boolean':
            this.update(!val);
            break;
        case 'number':
            this.update(val + random.real(-1000, 1000));
            break;
        case 'string':
            this.update(mutateString(val));
            break;
        default:
            if (Array.isArray(val)) this.update(mutateArray(val));
            break;
    }
}

/**
 * @param val {string} a string value
 * @returns {string}
 */
function mutateString(val) {
    var arr = val.split('');
    if (random.bool(0.05)) {
        arr = arr.reverse();
    }
    if (random.bool(0.25)) {
        arr.splice(
            random.integer(1, arr.length),
            random.integer(1, arr.length));
    }
    if (random.bool(0.25)) {
        var args = [random.integer(1, arr.length), 0]
            .concat(random.string(random.integer(1, arr.length)).split(''));
        arr.splice.apply(arr, args);
    }
    val = arr.join('');
    return val;
}

/**
 * @param val {array} an array
 * @returns {array}
 */
function mutateArray(val) {
    if (random.bool(0.1)) {
        val = val.reverse();
    }
    if (random.bool(0.05)) {
        val = val.slice(random.integer(0, val.length));
    }
    if (random.bool(0.05)) {
        val = val.slice(0, random.integer(0, val.length));
    }
    return val;
}