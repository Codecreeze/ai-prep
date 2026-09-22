import mongoose from "mongoose";

// NOTE: MONGODB_URI is the standard (non-SRV) mongodb:// form, not mongodb+srv://.
// Some Windows/VPN network setups can't resolve the SRV DNS record mongodb+srv://
// needs (the MongoDB driver uses its own internal DNS resolver instance, which
// doesn't pick up a global dns.setServers() override) — the non-SRV form lists the
// shard hosts directly and needs no SRV lookup at all. See devlog/10 for how this
// was diagnosed. If MONGODB_URI ever needs to move to a different Atlas cluster,
// regenerate this form from Atlas's "standard connection string" option, or read the
// _mongodb._tcp TXT record for the replicaSet name if only the srv:// string is given.

// Caches the connection across hot-reloads/serverless invocations so Next.js dev
// mode and repeated API calls don't open a new connection every time.
let cached = (global as { _mongoose?: Promise<typeof mongoose> })._mongoose;

export async function connectDb(): Promise<typeof mongoose> {
  if (cached) return cached;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  const connectPromise = mongoose.connect(uri);
  cached = connectPromise;
  (global as { _mongoose?: Promise<typeof mongoose> })._mongoose = connectPromise;
  try {
    return await connectPromise;
  } catch (err) {
    // Don't cache a failed attempt — a transient DNS/network hiccup shouldn't
    // permanently wedge every future request behind the same rejected promise.
    cached = undefined;
    (global as { _mongoose?: Promise<typeof mongoose> })._mongoose = undefined;
    throw err;
  }
}
