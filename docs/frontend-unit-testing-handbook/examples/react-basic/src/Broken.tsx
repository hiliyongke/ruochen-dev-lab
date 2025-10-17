import React from 'react';

export function Broken({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Boom');
  }
  return <div role="status">OK</div>;
}