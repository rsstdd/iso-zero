export type HeaderCurrentState = Readonly<{
  galleries: "location" | "page" | null;
  wordmark: "page" | null;
}>;

const CANONICAL_PATH = /^\/(?:[^/?#\\\s]+\/)*$/;

export function validateCurrentPath(value: unknown): string {
  if (typeof value !== "string" || !CANONICAL_PATH.test(value)) {
    throw new TypeError(
      "SiteHeader currentPath must be a canonical site-relative path with a trailing slash.",
    );
  }

  for (const encodedSegment of value.split("/").filter(Boolean)) {
    let segment: string;
    try {
      segment = decodeURIComponent(encodedSegment);
    } catch {
      throw new TypeError("SiteHeader currentPath contains an invalid percent-encoded segment.");
    }

    if (segment === "." || segment === ".." || segment.includes("/")) {
      throw new TypeError("SiteHeader currentPath contains a non-normalized path segment.");
    }
  }

  return value;
}

export function getHeaderCurrentState(value: unknown): HeaderCurrentState {
  const currentPath = validateCurrentPath(value);

  if (currentPath === "/") {
    return { galleries: null, wordmark: "page" };
  }

  if (currentPath === "/galleries/") {
    return { galleries: "page", wordmark: null };
  }

  if (/^\/galleries\/[^/]+\/$/.test(currentPath)) {
    return { galleries: "location", wordmark: null };
  }

  return { galleries: null, wordmark: null };
}
