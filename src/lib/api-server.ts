import { headers as nextHeaders } from "next/headers";

import { auth } from "@/lib/auth";
import { BASE_API_URL } from "@/lib/base-url";

/**
 * Small wrapper around fetch for the Express API.
 *
 * Public reads (menu) can be called with no options. Anything that needs to
 * know who the user is passes `withAuth: true` — we ask Better Auth for a JWT
 * on the server and attach it. The Express API then verifies it and reads the
 * role/ownership from the database. The browser never supplies an id or role.
 */
type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  withAuth?: boolean;
};

export async function apiFetch(
  path: string,
  { method = "GET", body, withAuth = false }: ApiRequestOptions = {}
): Promise<Response> {
  if (!BASE_API_URL) {
    throw new Error("BASE_API_URL is not configured.");
  }

  const requestHeaders = new Headers();
  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const { token } = await auth.api.getToken({ headers: await nextHeaders() });
    if (!token) {
      throw new Error("Could not get a session token. Please sign in again.");
    }
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${BASE_API_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
