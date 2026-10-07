const FALLBACK_TARGET = "https://github.com/xxhhlk";

function normalize(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)
    ? raw
    : "https://" + raw.replace(/^\/+/, "");
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return "";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "";
  return url.href;
}

function resolveTarget(request, env) {
  const base = normalize(env.DEFAULT_TARGET) || FALLBACK_TARGET;
  const params = new URL(request.url).searchParams;
  const target = normalize(params.get("url") || params.get("u"));
  if (!target) return base;

  const allowed = String(env.ALLOWED_HOSTS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length && !allowed.includes(new URL(target).hostname.toLowerCase())) {
    return base;
  }
  return target;
}

export function onRequest(context) {
  const target = resolveTarget(context.request, context.env || {});
  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      "Cache-Control": "no-store",
    },
  });
}
