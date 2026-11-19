import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const mongoUri = process.env.BETTER_AUTH_DB_URL ?? process.env.DB_URI;

if (!mongoUri) {
  throw new Error("Missing MongoDB connection string (BETTER_AUTH_DB_URL or DB_URI)");
}

const client = new MongoClient(mongoUri);
const db = client.db("BazarDor");

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,
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