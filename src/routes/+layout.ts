// Static-site mode: every route is prerendered at build time and served
// from the CDN edge. There is no server load anywhere in this app — all
// dynamic state (file handles, IndexedDB, print) is browser-only — so we
// pay zero serverless invocations on Vercel.
export const prerender = true;
