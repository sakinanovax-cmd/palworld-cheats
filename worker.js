/**
 * Serve clean URLs by rewriting to .html without HTTP redirects.
 * Avoids Cloudflare assets html_handling redirect loops.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Already has a file extension, or is a directory-style path with trailing slash → pass through
    const last = path.split("/").pop() || "";
    if (path === "/" || last.includes(".")) {
      return env.ASSETS.fetch(request);
    }

    // /palworld-cheats → try /palworld-cheats.html
    const htmlUrl = new URL(request.url);
    htmlUrl.pathname = `${path}.html`;

    const htmlRequest = new Request(htmlUrl, request);
    const asset = await env.ASSETS.fetch(htmlRequest);

    if (asset.status !== 404) {
      return asset;
    }

    return env.ASSETS.fetch(request);
  },
};
