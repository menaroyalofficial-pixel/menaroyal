/**
 * Local development only: lets `pnpm dev` serve the /api routes the same way
 * Vercel does in production, so the site works on a laptop without extra tools.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

const ROUTES: Record<string, string> = {
  "/api/geo": "/api/geo.ts",
  "/api/orders": "/api/orders.ts",
  "/api/pay": "/api/pay.ts",
  "/api/verify": "/api/verify.ts",
  "/api/house": "/api/house.ts",
  "/api/pilot": "/api/pilot.ts",
  "/api/webhooks/helius": "/api/webhooks/helius.ts",
};

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function wrapResponse(res: ServerResponse) {
  const r = res as ServerResponse & Record<string, any>;
  r.status = (code: number) => ((res.statusCode = code), r);
  r.json = (body: unknown) => {
    if (!res.getHeader("content-type")) res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(body));
    return r;
  };
  r.send = (body: unknown) => (res.end(typeof body === "string" ? body : JSON.stringify(body)), r);
  return r;
}

export function devApi(env: Record<string, string>): Plugin {
  return {
    name: "menaroyal-dev-api",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      // Server code reads process.env, like on Vercel.
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v;
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const file = ROUTES[url.pathname];
        if (!file) return next();
        try {
          const mod = await server.ssrLoadModule(file);
          const vreq = req as IncomingMessage & Record<string, any>;
          vreq.query = Object.fromEntries(url.searchParams.entries());
          vreq.body = await readBody(req);
          await mod.default(vreq, wrapResponse(res));
        } catch (e) {
          console.error(e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Server error" }));
        }
      });
    },
  };
}
