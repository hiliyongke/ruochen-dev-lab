// 临时类型声明用于在未安装依赖时消除 TS 报错
declare module 'vitest/config' {
  export function defineConfig(config: any): any
}
declare module '@testing-library/react' {
  export const render: any
  export const screen: any
}
declare module 'react' {
  const React: any
  export default React
}
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}