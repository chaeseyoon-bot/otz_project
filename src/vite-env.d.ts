/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIGMA_ASSET_BASE?: string
  /** Used by `scripts/download-figma-assets.mjs` when syncing exports (optional in browser bundle). */
  readonly VITE_FIGMA_ACCESS_TOKEN?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
