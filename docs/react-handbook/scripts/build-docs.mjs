#!/usr/bin/env node
// Ensure Web Crypto is available before VitePress initializes
try {
  const { webcrypto } = await import('node:crypto');
  if (webcrypto && !globalThis.crypto) {
    globalThis.crypto = webcrypto;
  }
} catch (e) {
  console.warn('[build-docs] WebCrypto injection skipped:', e?.message || e);
}

try {
  const { build } = await import('vitepress');
  await build('docs');
  console.log('[build-docs] Docs build completed.');
} catch (err) {
  console.error('[build-docs] Docs build failed:', err);
  process.exit(1);
}