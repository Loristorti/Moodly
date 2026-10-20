/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base URL, e.g. http://192.168.1.20:3000/api (the PC's local IP on a phone, never localhost) */
  readonly VITE_API_URL: string
  /** "true" to use fake responses (src/api/mock.ts) instead of the real back */
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
