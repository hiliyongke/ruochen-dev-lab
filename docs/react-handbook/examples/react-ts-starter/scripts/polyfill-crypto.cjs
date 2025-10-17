// keep: Node build-time crypto polyfill (CommonJS), safe for \"type\": \"module\"
const nodeCrypto = require('node:crypto');

if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
  const webcrypto = nodeCrypto.webcrypto;
  if (webcrypto && typeof webcrypto.getRandomValues === 'function') {
    globalThis.crypto = webcrypto;
  } else {
    globalThis.crypto = {
      getRandomValues(typedArray) {
        return nodeCrypto.randomFillSync(typedArray);
      },
    };
  }
}