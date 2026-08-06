/**
 * Serve static HTML with clean URLs, host canonicalization, and SEO headers.
 */
const CANONICAL_HOST = "palworldhack.com";

function redirectTo(url, status = 301) {
  return Response.redirect(url.toString(), status);
}

async function withSeoHeaders(response) {
  const headers = new Headers(response.headers);
  const ct = headers.get("Content-Type") || "";

  if (ct.includes("text/html") && !/charset=/i.test(ct)) {
    headers.set("Content-Type", "text/html; charset=utf-8");
  } else if (ct.includes("text/plain") && !/charset=/i.test(ct)) {
    headers.set("Content-Type", "text/plain; charset=utf-8");
  } else if (ct.includes("application/xml") && !/charset=/i.test(ct)) {
    headers.set("Content-Type", "application/xml; charset=utf-8");
  } else if (ct.includes("text/css") && !/charset=/i.test(ct)) {
    headers.set("Content-Type", "text/css; charset=utf-8");
  } else if (
    (ct.includes("application/javascript") || ct.includes("text/javascript")) &&
    !/charset=/i.test(ct)
  ) {
    headers.set("Content-Type", "application/javascript; charset=utf-8");
  }

  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Force HTTPS (covers Seobility HTTP checks)
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return redirectTo(url);
    }

    // Force non-www canonical host
    if (url.hostname === `www.${CANONICAL_HOST}` || url.hostname.startsWith("www.")) {
      url.hostname = CANONICAL_HOST;
      return redirectTo(url);
    }

    // Normalize /index.html → /
    if (url.pathname === "/index.html") {
      url.pathname = "/";
      return redirectTo(url);
    }

    let path = url.pathname;
    let assetRequest = request;

    if (path === "/" || path === "") {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = "/index.html";
      assetRequest = new Request(indexUrl, request);
    } else {
      if (path.length > 1 && path.endsWith("/")) {
        path = path.slice(0, -1);
        url.pathname = path;
        return redirectTo(url);
      }

      const last = path.split("/").pop() || "";
      if (!last.includes(".")) {
        const htmlUrl = new URL(request.url);
        htmlUrl.pathname = `${path}.html`;
        const htmlRequest = new Request(htmlUrl, request);
        const asset = await env.ASSETS.fetch(htmlRequest);
        if (asset.status !== 404) {
          return withSeoHeaders(asset);
        }
      }
    }

    const response = await env.ASSETS.fetch(assetRequest);
    return withSeoHeaders(response);
  },
};
