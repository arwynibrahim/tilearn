/**
 * Normalizes a PEM key read from an environment variable.
 *
 * Locally, dotenv expands `\n` inside double-quoted values into real newlines.
 * PaaS providers (Railway, Render, Heroku…) inject env vars verbatim, so a
 * pasted key keeps its literal `\n` sequences — which makes Node's crypto reject
 * it. This converts literal `\n` back into real newlines so both formats work.
 */
export function normalizePemKey(key?: string): string | undefined {
  if (!key) return key;
  return key.replace(/\\n/g, '\n');
}
