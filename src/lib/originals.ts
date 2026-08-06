import { createHash, createHmac } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, constants as fsConstants } from "node:fs/promises";
import { join } from "node:path";
import type { Readable } from "node:stream";

/**
 * The originals boundary.
 *
 * Per `02_ARCHITECTURE.md` §"The originals boundary": originals never enter
 * the repository or the build output. Every access goes through this module,
 * which resolves an opaque `originalKey` to a readable stream. Two adapters
 * implement the same interface; which one runs is chosen once, by
 * environment variable, at module load — an adapter that can change mid-run
 * is a source of tests that pass for the wrong reason.
 */
export interface OriginalsAdapter {
  read(key: string): Promise<Readable>;
  exists(key: string): Promise<boolean>;
}

/**
 * Selects the adapter. `filesystem` is the default because development and
 * tests must work without cloud credentials configured; production sets
 * `ISO_ZERO_ORIGINALS_ADAPTER=object-storage` explicitly.
 */
function resolveAdapterKind(): "filesystem" | "object-storage" {
  const raw = process.env.ISO_ZERO_ORIGINALS_ADAPTER?.trim();
  if (raw === "object-storage") return "object-storage";
  if (raw === "filesystem" || raw === undefined || raw === "") return "filesystem";
  throw new TypeError(
    `ISO_ZERO_ORIGINALS_ADAPTER must be "filesystem" or "object-storage", got "${raw}".`,
  );
}

/**
 * Development and test adapter. Reads from a local, git-ignored directory.
 * `originalKey` is treated as a relative path segment under that directory;
 * it is rejected if it could escape the directory, because an opaque handle
 * that turns out to be a path-traversal vector is not opaque.
 */
class FilesystemOriginalsAdapter implements OriginalsAdapter {
  readonly #root: string;

  constructor(root: string) {
    if (!root || root.trim().length === 0) {
      throw new TypeError(
        "ISO_ZERO_ORIGINALS_DIR must be set for the filesystem originals adapter.",
      );
    }
    this.#root = root;
  }

  #resolve(key: string): string {
    if (!key || key.trim().length === 0) {
      throw new TypeError("originalKey must be non-blank.");
    }
    if (key.includes("..") || key.startsWith("/") || key.startsWith("\\")) {
      throw new TypeError(`originalKey must not traverse outside the originals directory: ${key}`);
    }
    return join(this.#root, key);
  }

  async read(key: string): Promise<Readable> {
    const path = this.#resolve(key);
    if (!(await this.exists(key))) {
      throw new Error(`Original not found: ${key}`);
    }
    return createReadStream(path);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await access(this.#resolve(key), fsConstants.R_OK);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Production adapter. Reads from a private S3-compatible bucket over the
 * plain REST API, signed with AWS Signature Version 4, so it works against
 * AWS S3 and against S3-compatible providers alike without an SDK
 * dependency. Credentials are supplied by the environment and read once at
 * construction.
 */
class ObjectStorageOriginalsAdapter implements OriginalsAdapter {
  readonly #endpoint: string;
  readonly #bucket: string;
  readonly #region: string;
  readonly #accessKeyId: string;
  readonly #secretAccessKey: string;

  constructor(config: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  }) {
    for (const [name, value] of Object.entries(config)) {
      if (!value || value.trim().length === 0) {
        throw new TypeError(`Object storage originals adapter requires ${name}.`);
      }
    }
    this.#endpoint = config.endpoint.replace(/\/+$/, "");
    this.#bucket = config.bucket;
    this.#region = config.region;
    this.#accessKeyId = config.accessKeyId;
    this.#secretAccessKey = config.secretAccessKey;
  }

  #sign(method: "GET" | "HEAD", key: string): { url: URL; headers: Record<string, string> } {
    if (!key || key.trim().length === 0) {
      throw new TypeError("originalKey must be non-blank.");
    }

    const url = new URL(`${this.#endpoint}/${this.#bucket}/${key}`);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const host = url.host;
    const payloadHash = createHash("sha256").update("").digest("hex");

    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
    const canonicalRequest = [
      method,
      url.pathname,
      url.search.replace(/^\?/, ""),
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${this.#region}/s3/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      createHash("sha256").update(canonicalRequest).digest("hex"),
    ].join("\n");

    const kDate = createHmac("sha256", `AWS4${this.#secretAccessKey}`).update(dateStamp).digest();
    const kRegion = createHmac("sha256", kDate).update(this.#region).digest();
    const kService = createHmac("sha256", kRegion).update("s3").digest();
    const kSigning = createHmac("sha256", kService).update("aws4_request").digest();
    const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${this.#accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      url,
      headers: {
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        authorization,
      },
    };
  }

  async read(key: string): Promise<Readable> {
    const { url, headers } = this.#sign("GET", key);
    const response = await fetch(url, { headers });
    if (!response.ok || !response.body) {
      throw new Error(`Original not found or unreadable: ${key} (${response.status})`);
    }
    // The fetch body is a web ReadableStream; Node's Readable can wrap it.
    const { Readable: NodeReadable } = await import("node:stream");
    return NodeReadable.fromWeb(response.body as never);
  }

  async exists(key: string): Promise<boolean> {
    const { url, headers } = this.#sign("HEAD", key);
    const response = await fetch(url, { method: "HEAD", headers });
    return response.ok;
  }
}

function buildAdapter(): OriginalsAdapter {
  const kind = resolveAdapterKind();

  if (kind === "filesystem") {
    return new FilesystemOriginalsAdapter(
      process.env.ISO_ZERO_ORIGINALS_DIR ?? "originals",
    );
  }

  return new ObjectStorageOriginalsAdapter({
    endpoint: process.env.ISO_ZERO_ORIGINALS_ENDPOINT ?? "",
    bucket: process.env.ISO_ZERO_ORIGINALS_BUCKET ?? "",
    region: process.env.ISO_ZERO_ORIGINALS_REGION ?? "auto",
    accessKeyId: process.env.ISO_ZERO_ORIGINALS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.ISO_ZERO_ORIGINALS_SECRET_ACCESS_KEY ?? "",
  });
}

// Resolved once at module load. See the module doc comment above.
const adapter: OriginalsAdapter = buildAdapter();

export async function readOriginal(key: string): Promise<Readable> {
  return adapter.read(key);
}

export async function originalExists(key: string): Promise<boolean> {
  return adapter.exists(key);
}

// Exported for tests, which construct adapters directly against a fixture
// directory rather than relying on module-load-time environment resolution.
export { FilesystemOriginalsAdapter, ObjectStorageOriginalsAdapter };
