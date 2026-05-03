// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

declare module "mammoth/mammoth.browser.js" {
  interface ConvertResult {
    value: string;
    messages: { message: string; type: string }[];
  }
  interface ConvertOptions {
    arrayBuffer: ArrayBuffer;
  }
  const _default: {
    convertToHtml(opts: ConvertOptions): Promise<ConvertResult>;
  };
  export default _default;
}

declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const url: string;
  export default url;
}

export {};
