/**
 * Measured values in, display strings out.
 *
 * `src/content.config.ts` stores EXIF as measured — `fNumber: 2.8`, not
 * `"f/2.8"` — because a pre-rendered string means the data plate and any
 * future sort or filter disagree about what the value is. This module is
 * the one place that measured-to-display conversion happens, per
 * `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"EXIF".
 *
 * `07_TESTING_SECURITY_AND_OPERATIONS.md` §"Test strategy" names the
 * shutter-speed conversion specifically as worth a unit test: "`formatExif`
 * converting 0.004 seconds to `1/250` is exactly that, because an
 * off-by-one in the reciprocal rounding produces a value that looks
 * entirely reasonable and is wrong." See `exif.test.ts`.
 */

export interface MeasuredExif {
  readonly camera: string;
  readonly lens: string | null;
  readonly focalLengthMm: number;
  readonly fNumber: number;
  readonly exposureTimeSec: number;
  readonly iso: number;
  readonly shotAt: Date;
}

export interface FormattedExif {
  readonly camera: string;
  readonly lens: string | null;
  readonly focalLength: string;
  readonly aperture: string;
  readonly shutter: string;
  readonly iso: string;
  /**
   * The dot-joined line matching the wireframe's data-plate example
   * verbatim in shape: "FUJIFILM X-T4 · XF35mmF1.4 R · 35 mm · f/2.8 ·
   * 1/500 s · ISO 160". Omits `lens` from the join when null, rather than
   * leaving a dangling separator — an adapted or manual lens reporting
   * nothing is expected, not an error, per
   * `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Nullability follows the
   * equipment".
   */
  readonly summary: string;
}

/**
 * Formats exposure time as a shutter speed.
 *
 * At or above one second, shown as a decimal ("2 s"). Below one second,
 * shown as a reciprocal ("1/250 s"), rounded to the nearest whole
 * denominator — camera-reported exposure times are themselves already
 * rounded to the camera's shutter increments, so a reciprocal that comes out
 * to, say, 249.6 is measurement noise, not a fraction a photographer would
 * ever read off a shutter speed dial.
 */
function formatShutter(exposureTimeSec: number): string {
  if (exposureTimeSec <= 0 || !Number.isFinite(exposureTimeSec)) {
    throw new RangeError(`exposureTimeSec must be a positive, finite number: ${exposureTimeSec}`);
  }

  if (exposureTimeSec >= 1) {
    const rounded = Math.round(exposureTimeSec * 10) / 10;
    return `${rounded} s`;
  }

  const denominator = Math.round(1 / exposureTimeSec);
  return `1/${denominator} s`;
}

function formatFocalLength(focalLengthMm: number): string {
  return `${focalLengthMm} mm`;
}

function formatAperture(fNumber: number): string {
  return `f/${fNumber}`;
}

function formatIso(iso: number): string {
  return `ISO ${iso}`;
}

export function formatExif(exif: MeasuredExif): FormattedExif {
  const focalLength = formatFocalLength(exif.focalLengthMm);
  const aperture = formatAperture(exif.fNumber);
  const shutter = formatShutter(exif.exposureTimeSec);
  const iso = formatIso(exif.iso);

  const summary = [exif.camera, exif.lens, focalLength, aperture, shutter, iso]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" · ");

  return {
    camera: exif.camera,
    lens: exif.lens,
    focalLength,
    aperture,
    shutter,
    iso,
    summary,
  };
}
