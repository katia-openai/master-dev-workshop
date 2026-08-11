const HTML_ACCEPT = "text/html";

function isPageNavigation(request) {
  return (
    request.method === "GET" &&
    (request.headers.get("accept") ?? "").includes(HTML_ACCEPT)
  );
}

async function serveAsset(request, env) {
  const response = await env.ASSETS.fetch(request);

  if (response.status !== 404 || !isPageNavigation(request)) {
    return response;
  }

  const fallbackUrl = new URL("/index.html", request.url);
  return env.ASSETS.fetch(new Request(fallbackUrl, request));
}

async function injectSiteOrigin(response, request) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = (await response.text()).replaceAll(
    "__SITE_ORIGIN__",
    new URL(request.url).origin,
  );
  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const response = await serveAsset(request, env);
    return injectSiteOrigin(response, request);
  },
};
