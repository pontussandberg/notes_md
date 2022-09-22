
declare module '*.scss' {
  export const content: {[className: string]: string};
}

declare module "*.json" {
  const value: any;
  export default value;
}