import type {
  BreakpointConfig,
  BreakpointKey,
  CropRect,
  FocalPoint,
  ResponsiveCropValue,
} from "../types/crop";

export const DEFAULT_FOCAL_POINT: FocalPoint = { x: 0.5, y: 0.5 };

export const FULL_IMAGE_CROP: CropRect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

export const DEFAULT_BREAKPOINTS: Record<BreakpointKey, BreakpointConfig> = {
  desktop: { aspectRatio: "16:9", crop: { ...FULL_IMAGE_CROP } },
  tablet: { aspectRatio: "4:3", crop: { ...FULL_IMAGE_CROP } },
  mobile: { aspectRatio: "1:1", crop: { ...FULL_IMAGE_CROP } },
};

export function createDefaultValue(): ResponsiveCropValue {
  return {
    focalPoint: { ...DEFAULT_FOCAL_POINT },
    breakpoints: {
      desktop: { ...DEFAULT_BREAKPOINTS.desktop, crop: { ...DEFAULT_BREAKPOINTS.desktop.crop } },
      tablet: { ...DEFAULT_BREAKPOINTS.tablet, crop: { ...DEFAULT_BREAKPOINTS.tablet.crop } },
      mobile: { ...DEFAULT_BREAKPOINTS.mobile, crop: { ...DEFAULT_BREAKPOINTS.mobile.crop } },
    },
  };
}

export const EMPTY_VALUE: ResponsiveCropValue = createDefaultValue();
