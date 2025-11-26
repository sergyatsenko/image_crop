export type FocalPoint = {
  x: number;
  y: number;
};

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BreakpointKey = "desktop" | "tablet" | "mobile";

export type BreakpointConfig = {
  aspectRatio: string;
  crop: CropRect;
};

export type ResponsiveCropValue = {
  mediaItemId?: string;
  mediaItemPath?: string;
  mediaUrl?: string;
  focalPoint: FocalPoint;
  breakpoints: Record<BreakpointKey, BreakpointConfig>;
};

export type MediaSelection = {
  id?: string;
  path?: string;
  name?: string;
  mediaUrl?: string;
};
