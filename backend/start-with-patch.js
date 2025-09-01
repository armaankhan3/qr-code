// Patch path-to-regexp.parse before loading express/server
try {
  const ptr = require('path-to-regexp');
  if (ptr && ptr.parse) {
    const original = ptr.parse;
    ptr.parse = function(str, options) {
      try {
        return original.call(this, str, options);
      } catch (e) {
        console.error('--- path-to-regexp parse failed for input: ---');
        console.error(String(str));
        console.error('---------------------------------------------');
        throw e;
      }
    };
  }
} catch (e) {
  // ignore
}

require('./server.js');
