# Yahoo Fantasy Read-Only MCP for ChatGPT

A Render-ready MCP server that connects ChatGPT to Yahoo Fantasy Sports using Yahoo OAuth 2.0.

## Security model

- Yahoo access is OAuth 2.0.
- The Yahoo API client only sends HTTP GET requests.
- No write endpoints, POST/PUT/PATCH/DELETE Yahoo calls, or write-capable MCP tools are included.
- ChatGPT authenticates to this MCP server with OAuth 2.0.
- Yahoo refresh tokens are encrypted inside the server-issued access token; no database is required.
- Do not commit `.env`.

## Repository layout

```text
yahoo-fantasy-readonly-mcp/
├── src/
│   ├── index.ts
│   └── yahoo.ts
├── package.json
├── tsconfig.json
├── render.yaml
├── .env.example
├── .gitignore
└── README.md
```

## Render

Root Directory: `.`

Build Command:
`npm install && npm run build`

Start Command:
`npm start`

Health check:
`/health`

## Environment variables

Set these in Render:

- `YAHOO_CLIENT_ID`
- `YAHOO_CLIENT_SECRET`
- `PUBLIC_BASE_URL` = your exact Render URL
- `MCP_JWT_SECRET` = long random secret

## Yahoo Developer Console

Create/configure a Yahoo Fantasy Sports application and use this callback URL:

`https://YOUR-RENDER-DOMAIN.onrender.com/oauth/yahoo/callback`

Yahoo may review Fantasy API applications. Request the minimum access needed; this server itself only performs reads.

## ChatGPT MCP URL

After deployment, the MCP endpoint is:

`https://YOUR-RENDER-DOMAIN.onrender.com/mcp`

The OAuth metadata endpoints are provided automatically by this server:

- `/.well-known/oauth-authorization-server`
- `/.well-known/oauth-protected-resource`

When ChatGPT asks for OAuth client settings, use dynamic client registration if offered. If it requires a client ID/secret, the server includes registration support at `/oauth/register`.

## Available read-only tools

- `yahoo_leagues`
- `yahoo_teams`
- `yahoo_roster`
- `yahoo_standings`
- `yahoo_matchups`
- `yahoo_players`
- `yahoo_player`
- `yahoo_transactions`
- `yahoo_draft_results`
- `yahoo_get`

`yahoo_get` accepts only a Yahoo Fantasy API path and always performs HTTP GET.

## Local verification

```bash
npm install
npm run build
npm start
```

Then open `/health`.

The project intentionally has `src/index.ts` and `src/yahoo.ts` at the repository root's `src/` directory so TypeScript's `include: ["src/**/*.ts"]` resolves correctly on Render.
