import type { BreakpointKey, CropRect, FocalPoint, ResponsiveCropValue } from "../types/crop";
import { DEFAULT_BREAKPOINTS, DEFAULT_FOCAL_POINT, createDefaultValue } from "../constants/defaults";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function clampFocalPoint(fp: FocalPoint): FocalPoint {
  return { x: clamp01(fp.x), y: clamp01(fp.y) };
}

export function clampCrop(crop: CropRect): CropRect {
  return {
    x: clamp01(crop.x),
    y: clamp01(crop.y),
    width: clamp01(crop.width),
    height: clamp01(crop.height),
  };
}

export function normalizeValue(raw: Partial<ResponsiveCropValue> | null | undefined): ResponsiveCropValue {
  if (!raw || typeof raw !== "object") {
    return createDefaultValue();
  }

  const focalPoint = clampFocalPoint(raw.focalPoint ?? DEFAULT_FOCAL_POINT);

  const breakpoints: Record<BreakpointKey, any> = {
    desktop: { ...DEFAULT_BREAKPOINTS.desktop, crop: { ...DEFAULT_BREAKPOINTS.desktop.crop } },
    tablet: { ...DEFAULT_BREAKPOINTS.tablet, crop: { ...DEFAULT_BREAKPOINTS.tablet.crop } },
    mobile: { ...DEFAULT_BREAKPOINTS.mobile, crop: { ...DEFAULT_BREAKPOINTS.mobile.crop } },
  };
  (["desktop", "tablet", "mobile"] as BreakpointKey[]).forEach((key) => {
    const bp = raw.breakpoints?.[key];
    breakpoints[key] = {
      aspectRatio: bp?.aspectRatio ?? DEFAULT_BREAKPOINTS[key].aspectRatio,
      crop: bp?.crop ? clampCrop(bp.crop) : { ...DEFAULT_BREAKPOINTS[key].crop },
    };
  });

  return {
    mediaItemId: raw.mediaItemId,
    mediaItemPath: raw.mediaItemPath,
    mediaUrl: raw.mediaUrl,
    focalPoint,
    breakpoints,
  };
}

export function parseSerializedValue(serialized: string | null | undefined): ResponsiveCropValue {
  if (!serialized || typeof serialized !== "string") {
    return createDefaultValue();
  }

  try {
    const parsed = JSON.parse(serialized) as Partial<ResponsiveCropValue>;
    return normalizeValue(parsed);
  } catch (err) {
    console.warn("Failed to parse stored crop value, using defaults", err);
    return createDefaultValue();
  }
}

export function aspectRatioToNumber(ratio: string): number {
  const [w, h] = ratio.split(":").map((n) => Number(n));
  if (!w || !h) return 1;
  return w / h;
}
