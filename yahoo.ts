import { URLSearchParams } from "node:url";

const API_BASE = process.env.YAHOO_API_BASE ?? "https://fantasysports.yahooapis.com/fantasy/v2";
const TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token";
const AUTH_URL = "https://api.login.yahoo.com/oauth2/request_auth";

export type YahooToken = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export function yahooAuthorizationUrl(args: {
  redirectUri: string;
  state: string;
}) {
  const p = new URLSearchParams({
    client_id: required("YAHOO_CLIENT_ID"),
    redirect_uri: args.redirectUri,
    response_type: "code",
    state: args.state
  });
  return `${AUTH_URL}?${p.toString()}`;
}

export async function exchangeYahooCode(code: string, redirectUri: string): Promise<YahooToken> {
  const body = new URLSearchParams({
    client_id: required("YAHOO_CLIENT_ID"),
    client_secret: required("YAHOO_CLIENT_SECRET"),
    redirect_uri: redirectUri,
    code,
    grant_type: "authorization_code"
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(`Yahoo token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return { ...data, expires_at: Date.now() + data.expires_in * 1000 };
}

export async function refreshYahooToken(refreshToken: string): Promise<YahooToken> {
  const body = new URLSearchParams({
    client_id: required("YAHOO_CLIENT_ID"),
    client_secret: required("YAHOO_CLIENT_SECRET"),
    redirect_uri: yahooCallbackUrl(),
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(`Yahoo token refresh failed: ${res.status} ${await res.text()}`);
  const data = await res.json() as { access_token: string; expires_in: number; refresh_token?: string };
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000
  };
}

export function yahooCallbackUrl() {
  return `${required("PUBLIC_BASE_URL")}/oauth/yahoo/callback`;
}

export async function yahooGet(path: string, token: string): Promise<unknown> {
  if (!path.startsWith("/")) path = `/${path}`;
  if (!path.startsWith("/users;") && !path.startsWith("/user/") && !path.startsWith("/league/") &&
      !path.startsWith("/team/") && !path.startsWith("/player/") && !path.startsWith("/game/")) {
    throw new Error("Path must be a Yahoo Fantasy API resource path.");
  }

  const url = new URL(API_BASE + path);
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
  });

  if (!res.ok) throw new Error(`Yahoo API GET failed: ${res.status} ${await res.text()}`);
  return await res.json();
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
