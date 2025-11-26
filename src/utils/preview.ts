import type { CSSProperties } from "react";
import type { CropRect } from "../types/crop";

export function getPreviewImageStyle(crop: CropRect): CSSProperties {
  const widthPercent = crop.width > 0 ? 100 / crop.width : 100;
  const heightPercent = crop.height > 0 ? 100 / crop.height : 100;
  const leftPercent = crop.width > 0 ? -(crop.x * 100) / crop.width : 0;
  const topPercent = crop.height > 0 ? -(crop.y * 100) / crop.height : 0;

  return {
    position: "absolute",
    top: `${topPercent}%`,
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    height: `${heightPercent}%`,
    objectFit: "cover",
  };
}
