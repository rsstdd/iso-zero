import navigation from "../../config/footer-navigation.json";

export interface FooterLink {
  readonly label: string;
  readonly href: `/${string}/`;
}

export interface FooterNavigation {
  readonly project: readonly FooterLink[];
  readonly legal: readonly FooterLink[];
}

const SAME_ORIGIN_ROUTE = /^\/(?:[a-z0-9-]+\/)+$/;

function validateLinks(value: unknown): readonly FooterLink[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError("Every Footer navigation group must contain at least one link.");
  }

  return value.map((candidate) => {
    if (typeof candidate !== "object" || candidate === null) {
      throw new TypeError("Every Footer navigation item must be an object.");
    }

    const { href, label } = candidate as Record<string, unknown>;
    if (typeof label !== "string" || label.trim() !== label || label.length === 0) {
      throw new TypeError("Every Footer link label must be a non-empty trimmed string.");
    }
    if (typeof href !== "string" || !SAME_ORIGIN_ROUTE.test(href)) {
      throw new TypeError(`Footer route for \"${label}\" must be a same-origin route literal.`);
    }

    return Object.freeze({ label, href: href as `/${string}/` });
  });
}

const project = validateLinks(navigation.project);
const legal = validateLinks(navigation.legal);
const allLinks = [...project, ...legal];

if (new Set(allLinks.map(({ label }) => label)).size !== allLinks.length) {
  throw new TypeError("Footer navigation labels must be unique.");
}

if (new Set(allLinks.map(({ href }) => href)).size !== allLinks.length) {
  throw new TypeError("Footer navigation routes must be unique.");
}

export const FOOTER_NAVIGATION: FooterNavigation = Object.freeze({ project, legal });
