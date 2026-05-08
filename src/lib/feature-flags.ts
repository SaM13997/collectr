function bool(v: string | undefined): boolean {
  return v === "true" || v === "1";
}

export const flags = {
  enableRedditImport: bool(import.meta.env.VITE_ENABLE_REDDIT_IMPORT),
  enableInstagramImport: bool(import.meta.env.VITE_ENABLE_INSTAGRAM_IMPORT),
  enablePaidScrapers: bool(import.meta.env.VITE_ENABLE_PAID_SCRAPERS),
  enableRedditOAuthSync: bool(import.meta.env.VITE_ENABLE_REDDIT_OAUTH_SYNC),
  enableInstagramMetadata: bool(import.meta.env.VITE_ENABLE_INSTAGRAM_METADATA),
  enableAiEnrichment: bool(import.meta.env.VITE_ENABLE_AI_ENRICHMENT),
};

export function isMetadataFetchEnabled(source: string): boolean {
  if (source === "x") return true;
  if (source === "reddit") return flags.enableRedditImport;
  if (source === "instagram") return flags.enableInstagramImport || flags.enableInstagramMetadata;
  return false;
}