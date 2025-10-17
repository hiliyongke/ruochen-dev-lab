/**
 * Polyfill for environments where Vite/VitePress expects `crypto.getRandomValues`.
 * Bind getRandomValues to the correct `webcrypto` context to avoid `ERR_INVALID_THIS`.
 */
(function applyCryptoPolyfill() {
  try {
    const cryptoA = require('crypto');       // Common alias
    const cryptoB = require('node:crypto');  // Explicit node alias

    const webcrypto = (cryptoB && cryptoB.webcrypto) || (cryptoA && cryptoA.webcrypto);

    // Fallback using randomFillSync
    function getRandomValuesFallback(typedArray) {
      if (
        !typedArray ||
        typeof typedArray.length !== 'number' ||
        typeof typedArray.BYTES_PER_ELEMENT !== 'number'
      ) {
        throw new TypeError('Expected a TypedArray');
      }
      const rf = (cryptoB && cryptoB.randomFillSync) || (cryptoA && cryptoA.randomFillSync);
      if (typeof rf !== 'function') {
        throw new Error('randomFillSync not available');
      }
      rf(typedArray);
      return typedArray;
    }

    // Create a bound getRandomValues to preserve `this` context
    const boundGetRandomValues =
      (webcrypto && typeof webcrypto.getRandomValues === 'function')
        ? webcrypto.getRandomValues.bind(webcrypto)
        : getRandomValuesFallback;

    // 1) Ensure globalThis.crypto exists and has bound getRandomValues
    if (!globalThis.crypto || typeof globalThis.crypto !== 'object') {
      globalThis.crypto = webcrypto || {};
    }
    globalThis.crypto.getRandomValues = boundGetRandomValues;

    // 2) Patch require('crypto') and require('node:crypto') objects with bound function
    if (cryptoA && typeof cryptoA.getRandomValues !== 'function') {
      cryptoA.getRandomValues = boundGetRandomValues;
    }
    if (cryptoB && typeof cryptoB.getRandomValues !== 'function') {
      cryptoB.getRandomValues = boundGetRandomValues;
    }
  } catch (e) {
    // Ignore errors; if environment already supports getRandomValues, Vite will proceed
  }
})();