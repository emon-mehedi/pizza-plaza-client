import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const mongoUri = process.env.BETTER_AUTH_DB_URL ?? process.env.DB_URI;
// Issuer/audience must match BETTER_AUTH_URL on the Express server exactly.
const authOrigin = (process.env.BETTER_AUTH_URL ?? "").replace(/\/+$/, "");

if (!mongoUri) {
  throw new Error("Missing MongoDB connection string (BETTER_AUTH_DB_URL or DB_URI)");
}

const client = new MongoClient(mongoUri);
const db = client.db("pizzaplaza");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  // Vercel terminates TLS and proxies requests to the function via
  // x-forwarded-host / x-forwarded-proto, so Better Auth must trust those headers.
  advanced: {
    trustedProxyHeaders: true,
  },
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  // The JWT is sent to the Express API as: Authorization: Bearer <token>.
  plugins: [
    jwt({
      jwt: {
        issuer: authOrigin || undefined,
        audience: authOrigin || undefined,
        expirationTime: "1h",
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "customer",
        input: true,
      },
      isBlocked: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      subscriptionPlan: {
        type: "string",
        required: true,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});