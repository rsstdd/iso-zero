#!/usr/bin/env node

import { process } from "zod/v4/core";

/**
 * Placeholder for a decclared `pnp verify` stage. Unimplemented.
 *
 * Prints its own phase so the gap is visible in local and CI runs.
 *
 * VERIFY_STRICT=1 turns the warning into a failure.
 * - Release pipelines should set this to 1 to ensure that the gap is not missed.
 */

const [ stage, phase ] = process.argv.slice(2);
const message = `\n\n[${stage}] ${phase} is not implemented yet. This is a gap in the verification process.\n\n`;

if (process.env.VERIFY_STRICT === "1") {
  console.error(message);
  process.exit(1);
}

console.warn(message);
