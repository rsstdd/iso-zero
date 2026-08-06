import { describe, expect, it } from "vitest";
import { formatExif } from "./exif";

/**
 * `07_TESTING_SECURITY_AND_OPERATIONS.md` names this conversion by name as
 * the risky one: an off-by-one in reciprocal rounding produces a value that
 * looks entirely reasonable and is wrong. These cases include the real
 * measured values already extracted for Germany and Verona, so a rounding
 * regression here would be caught against data this project actually
 * shipped, not just a round-number fixture.
 */

function baseExif(overrides: Partial<Parameters<typeof formatExif>[0]> = {}) {
  return {
    camera: "FUJIFILM X-T4",
    lens: "XF35mmF1.4 R",
    focalLengthMm: 35,
    fNumber: 2.8,
    exposureTimeSec: 0.002,
    iso: 160,
    shotAt: new Date("2026-05-18T06:37:30.000Z"),
    ...overrides,
  };
}

describe("formatExif shutter speed", () => {
  it("formats a round fraction correctly (1/500)", () => {
    expect(formatExif(baseExif({ exposureTimeSec: 0.002 })).shutter).toBe("1/500 s");
  });

  it("formats Germany's real measured exposure (1/210, not 1/210.000000003)", () => {
    expect(
      formatExif(baseExif({ exposureTimeSec: 0.004761904761904762 })).shutter,
    ).toBe("1/210 s");
  });

  it("formats Verona's real measured exposure (1/125)", () => {
    expect(formatExif(baseExif({ exposureTimeSec: 0.008 })).shutter).toBe("1/125 s");
  });

  it("does not off-by-one a value close to a whole reciprocal", () => {
    // 1/249.6 would floor to 1/249 and ceil to 1/250; round() must land on
    // 250, the value a camera actually reports at this shutter increment.
    expect(formatExif(baseExif({ exposureTimeSec: 1 / 249.6 })).shutter).toBe("1/250 s");
  });

  it("formats exposures at or above one second as decimal seconds, not a reciprocal", () => {
    expect(formatExif(baseExif({ exposureTimeSec: 2 })).shutter).toBe("2 s");
    expect(formatExif(baseExif({ exposureTimeSec: 1 })).shutter).toBe("1 s");
  });

  it("throws rather than silently formatting a non-positive exposure", () => {
    expect(() => formatExif(baseExif({ exposureTimeSec: 0 }))).toThrow(RangeError);
    expect(() => formatExif(baseExif({ exposureTimeSec: -0.5 }))).toThrow(RangeError);
  });
});

describe("formatExif summary line", () => {
  it("matches the wireframe's data-plate shape when lens is present", () => {
    expect(formatExif(baseExif()).summary).toBe(
      "FUJIFILM X-T4 · XF35mmF1.4 R · 35 mm · f/2.8 · 1/500 s · ISO 160",
    );
  });

  it("omits the lens segment rather than leaving a dangling separator when lens is null", () => {
    const summary = formatExif(baseExif({ lens: null })).summary;
    expect(summary).toBe("FUJIFILM X-T4 · 35 mm · f/2.8 · 1/500 s · ISO 160");
    expect(summary).not.toContain("· ·");
  });
});
