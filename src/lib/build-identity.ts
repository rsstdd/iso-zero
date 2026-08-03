export interface BuildIdentity {
  readonly copyrightYear: number;
  readonly buildSha: string;
  readonly contentVersion: string;
}

export interface ValidatedBuildIdentity extends BuildIdentity {
  readonly abbreviatedBuildSha: string;
}

const FULL_GIT_SHA = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i;
const CONTENT_VERSION = /^\S+$/;

export function validateBuildIdentity(identity: BuildIdentity): ValidatedBuildIdentity {
  const { copyrightYear } = identity;
  const buildSha = identity.buildSha.trim().toLowerCase();
  const contentVersion = identity.contentVersion.trim();

  if (!Number.isInteger(copyrightYear) || copyrightYear < 1000 || copyrightYear > 9999) {
    throw new TypeError("copyrightYear must be an explicit four-digit integer.");
  }

  if (!FULL_GIT_SHA.test(buildSha)) {
    throw new TypeError("buildSha must be a full 40- or 64-character hexadecimal Git SHA.");
  }

  if (!CONTENT_VERSION.test(contentVersion)) {
    throw new TypeError("contentVersion must be a non-empty identifier without whitespace.");
  }

  return Object.freeze({
    copyrightYear,
    buildSha,
    abbreviatedBuildSha: buildSha.slice(0, 7),
    contentVersion,
  });
}
