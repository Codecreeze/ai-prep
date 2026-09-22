import dns from "node:dns/promises";
import net from "node:net";

const PRIVATE_V4_RANGES: [string, number][] = [
  ["10.0.0.0", 8],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["0.0.0.0", 8],
];

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => (acc << 8) + parseInt(part, 10), 0) >>> 0;
}

function isPrivateV4(ip: string): boolean {
  if (!net.isIPv4(ip)) return false;
  const ipInt = ipToInt(ip);
  return PRIVATE_V4_RANGES.some(([base, bits]) => {
    const baseInt = ipToInt(base);
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipInt & mask) === (baseInt & mask);
  });
}

function isPrivateV6(ip: string): boolean {
  return ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80");
}

/**
 * SSRF guard. Rejects private/loopback/link-local targets in production.
 * `ALLOW_LOCAL_URLS=true` is required for batch/dev mode, since the assessment's own
 * test harness serves company sites from `http://localhost:PORT/...` (see Appendix B) —
 * so this is a documented, explicit opt-in rather than a blanket block.
 */
export async function assertUrlIsSafe(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`INVALID_URL: could not parse "${rawUrl}"`);
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`INVALID_URL: unsupported protocol "${url.protocol}"`);
  }

  const allowLocal = process.env.ALLOW_LOCAL_URLS === "true";
  if (allowLocal) return url;

  const hostname = url.hostname;
  if (hostname === "localhost") throw new Error("SSRF_BLOCKED: localhost not allowed");

  let addresses: string[];
  try {
    const result = await dns.lookup(hostname, { all: true });
    addresses = result.map((r) => r.address);
  } catch {
    throw new Error(`UNRESOLVABLE_HOST: could not resolve "${hostname}"`);
  }

  for (const addr of addresses) {
    if (isPrivateV4(addr) || isPrivateV6(addr)) {
      throw new Error(`SSRF_BLOCKED: "${hostname}" resolves to a private/loopback address`);
    }
  }
  return url;
}
