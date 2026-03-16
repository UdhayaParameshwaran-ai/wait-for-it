/// <reference types="vite/client" />

/**
 * Vite environment variable type declarations.
 *
 * Why: Without these declarations, `import.meta.env.VITE_*` values
 * are typed as `string | undefined`, requiring null checks everywhere.
 * Declaring them here gives us autocompletion and type safety.
 */
interface ImportMetaEnv {
  readonly VITE_BACKEND_API_URL: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
