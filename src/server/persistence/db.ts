import mongoose from "mongoose";

// Caches the connection across hot-reloads/serverless invocations so Next.js dev
// mode and repeated API calls don't open a new connection every time.
let cached = (global as { _mongoose?: Promise<typeof mongoose> })._mongoose;

export async function connectDb(): Promise<typeof mongoose> {
  if (cached) return cached;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  cached = mongoose.connect(uri);
  (global as { _mongoose?: Promise<typeof mongoose> })._mongoose = cached;
  return cached;
}
