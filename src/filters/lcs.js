/*

LCS implementation that supports arrays or strings

reference: http://en.wikipedia.org/wiki/Longest_common_subsequence_problem

*/

var prefix = '';
var indent = function() { prefix += '   '; };
var outdent = function() { prefix = prefix.slice(0, -3); };
var log = function(msg) {
    //console.log(prefix + JSON.stringify(msg));
    return msg;
};


var defaultMatch = function(array1, array2, index1, index2) {
  return array1[index1] === array2[index2];
};

var lengthMatrix = function(array1, array2, match, context) {
  var len1 = array1.length;
  var len2 = array2.length;
  var x, y;

  // initialize empty matrix of len1+1 x len2+1
  var matrix = [len1 + 1];
  for (x = 0; x < len1 + 1; x++) {
    matrix[x] = [len2 + 1];
    for (y = 0; y < len2 + 1; y++) {
      matrix[x][y] = 0;
    }
  }
  matrix.match = match;
  // save sequence lengths for each coordinate
  for (x = 1; x < len1 + 1; x++) {
    for (y = 1; y < len2 + 1; y++) {
      if (match(array1, array2, x - 1, y - 1, context)) {
        matrix[x][y] = matrix[x - 1][y - 1] + 1;
      } else {
        matrix[x][y] = Math.max(matrix[x - 1][y], matrix[x][y - 1]);
      }
    }
  }
  return matrix;
};

var backtrack = function(matrix, array1, array2, index1, index2, context) {
  if (index1 === 0 || index2 === 0) {
    return {
      sequence: [],
      indices1: [],
      indices2: []
    };
  }

  if (matrix.match(array1, array2, index1 - 1, index2 - 1, context)) {
    var subsequence = backtrack(matrix, array1, array2, index1 - 1, index2 - 1, context);
    subsequence.sequence.push(array1[index1 - 1]);
    subsequence.indices1.push(index1 - 1);
    subsequence.indices2.push(index2 - 1);
    return subsequence;
  }

  if (matrix[index1][index2 - 1] > matrix[index1 - 1][index2]) {
    return backtrack(matrix, array1, array2, index1, index2 - 1, context);
  } else {
    return backtrack(matrix, array1, array2, index1 - 1, index2, context);
  }
};

var get = function(array1, array2, match, context) {
  ////console.log('in lcs');
  ////console.log({'a1': array1, 'a2': array2, 'match': match, 'context': context});
  context = context || {};
  var matrix = lengthMatrix(array1, array2, match || defaultMatch, context);
  var result = backtrack(matrix, array1, array2, array1.length, array2.length, context);
  if (typeof array1 === 'string' && typeof array2 === 'string') {
    result.sequence = result.sequence.join('');
  }
  log({lcsResult:result});
  return result;
};

var lcsLength = function(xarray, yarray, match, context) {
  //log({trace:'lcsLength', x:xarray, y:yarray});
  //log({lengthMatrix: lengthMatrix(xarray, yarray, match, context)});
  var xlen = xarray.length;
  var ylen = yarray.length;
  indent();

  var curr = new Uint32Array(ylen+1);
  var prev = new Uint32Array(ylen+1);
  var tmp; // used for swapping curr/prev
  for (var i = 0; i < xlen; i++) {
    // switcharoo
    tmp = curr;
    curr = prev;
    prev = tmp;
    for (var j = 0; j < ylen; j++) {
      if (match(xarray, yarray, i, j, context)) {
        curr[j+1] = prev[j] + 1;
      } else {
        curr[j+1] = Math.max(curr[j], prev[j+1]);
      }
    }
    //log(Array.prototype.slice.call(curr));
  }
  outdent();
  return Array.prototype.slice.call(curr);
};

var argmaxSum = function(x, y) {
  log({trace: 'argmax', x:x, y:y});
  var len = Math.max(x.length, y.length);
  var max = 0;
  var argmax = 0;
  for (var i = 0; i < len; i++) {
    var s = (x[i] || 0) + (y[i] || 0);
    if (s >= max) {
      max = s;
      argmax = i;
    }
  }
  return argmax;
};

var hirschberg = function(array1, array2, match, context) {
  context = context || {};
  log({trace: 'hirschberg', x: array1, y: array2});
  var len1 = array1.length;
  var len2 = array2.length;
  if (len1 === 0 || len2 === 0) {
    log('returning empty');
    return { sequence: [], indices1: [], indices2: [] };
  } else if (len1 === 1) {
    for (var j = 0; j < len2; j++) {
      if (match(array1, array2, 0, j, context)) {
        log({ trace:'returning', sequence: array1, indices1: [0], indices2: [j] });
        return { sequence: array1, indices1: [0], indices2: [j] };
      }
    }
    log('returning empty');
    return { sequence: [], indices1: [], indices2: [] };
  } else {
    var xsplit = Math.floor(len1/2); // len1 >> 1;
    log({xsplit: xsplit});
    var llHead = lcsLength(array1.slice(0, xsplit), array2, match, context);
    var llTail = lcsLength(array1.slice(xsplit).reverse(), array2.slice(0).reverse(), match, context).reverse();
    var ysplit = argmaxSum(llHead, llTail);
    log({ysplit: ysplit});
    indent();
    var left = hirschberg(array1.slice(0, xsplit), array2.slice(0, ysplit), match, context);
    var right = hirschberg(array1.slice(xsplit), array2.slice(ysplit), match, context);
    outdent();
    var result = {
        sequence: left.sequence.concat(right.sequence),
        indices1: left.indices1.concat(right.indices1.map(function (i) { return i + xsplit;})),
        indices2: left.indices2.concat(right.indices2.map(function (i) { return i + ysplit;}))
    };
    get(array1, array2, match, context);
    log({hirschResult:result});
    return result;
  }
};

exports.get = hirschberg;
exports.oldget = get;

exports.lengthMatrix = lengthMatrix;
