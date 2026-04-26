/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

interface ImportMetaEnv {
  readonly VITE_GEMINI_KEY: string;
  readonly VITE_MAPS_KEY: string;
  readonly VITE_CIVIC_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
