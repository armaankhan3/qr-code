// Tracer: intercept Module._load and patch or log when path-to-regexp is loaded
const Module = require('module');
const origLoad = Module._load;
Module._load = function(request, parent, isMain) {
  try {
    if (String(request).includes('path-to-regexp')) {
      console.error('TRACE: require request for', request, 'from', parent && parent.filename);
      const stack = new Error().stack.split('\n').slice(2,10).join('\n');
      console.error('TRACE stack:\n' + stack);
      const exported = origLoad.apply(this, arguments);
      if (exported && exported.parse) {
        const originalParse = exported.parse;
        exported.parse = function(str, options) {
          try {
            return originalParse.call(this, str, options);
          } catch (e) {
            console.error('--- path-to-regexp parse failed for input: ---');
            console.error(String(str));
            console.error('---------------------------------------------');
            throw e;
          }
        };
        console.error('TRACE: patched parse on module', request);
      }
      return exported;
    }
  } catch (e) {
    // continue
  }
  return origLoad.apply(this, arguments);
};

require('./server.js');
