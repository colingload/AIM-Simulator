// Vercel serverless function — proxies /api/anthropic/* to Anthropic API
// Keeps the API key server-side (set ANTHROPIC_API_KEY in Vercel env vars)

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(req.url);
  // Strip /api/anthropic prefix to get the real Anthropic path (e.g., /v1/messages)
  const anthropicPath = url.pathname.replace(/^\/api\/anthropic/, "");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();

    const res = await fetch(`https://api.anthropic.com${anthropicPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Proxy error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
