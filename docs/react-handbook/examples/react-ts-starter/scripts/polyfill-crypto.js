// keep: simple polyfill for Node build-time crypto in case webcrypto is unavailable
// Only affects Node build process; no impact on browser runtime
const nodeCrypto = require('node:crypto');

if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
  const webcrypto = nodeCrypto.webcrypto;
  if (webcrypto && typeof webcrypto.getRandomValues === 'function') {
    globalThis.crypto = webcrypto;
  } else {
    globalThis.crypto = {
      getRandomValues(typedArray) {
        // Fallback using randomFillSync; supports Uint8Array and friends
        return nodeCrypto.randomFillSync(typedArray);
      },
    };
  }
}