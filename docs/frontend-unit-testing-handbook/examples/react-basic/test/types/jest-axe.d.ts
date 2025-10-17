declare module 'jest-axe' {
  export const axe: any;
  export const toHaveNoViolations: any;
}

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
}