/**
 * Serve clean URLs by rewriting to .html without HTTP redirects.
 * Avoids Cloudflare assets html_handling redirect loops.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;

    // Homepage: / must map to index.html when html_handling is none
    if (path === "/" || path === "") {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    // Strip trailing slash: /blog/ → /blog
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    const last = path.split("/").pop() || "";

    // Already has a file extension → serve as-is
    if (last.includes(".")) {
      return env.ASSETS.fetch(request);
    }

    // /palworld-cheats → /palworld-cheats.html
    const htmlUrl = new URL(request.url);
    htmlUrl.pathname = `${path}.html`;

    const asset = await env.ASSETS.fetch(new Request(htmlUrl, request));
    if (asset.status !== 404) {
      return asset;
    }

    return env.ASSETS.fetch(request);
  },
};
