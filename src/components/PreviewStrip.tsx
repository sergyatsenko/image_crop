import { getPreviewImageStyle } from "../utils/preview";
import type { BreakpointKey, ResponsiveCropValue } from "../types/crop";

const LABELS: Record<BreakpointKey, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

interface Props {
  value: ResponsiveCropValue;
  imageUrl?: string;
}

export function PreviewStrip({ value, imageUrl }: Props) {
  const breakpoints = value.breakpoints;

  return (
    <div className="preview-strip">
      {(Object.keys(breakpoints) as BreakpointKey[]).map((key) => {
        const bp = breakpoints[key];
        const aspectRatio = bp.aspectRatio;
        const [w, h] = aspectRatio.split(":").map((n) => Number(n));
        const paddingTop = h && w ? (h / w) * 100 : 100;
        const cropStyle = getPreviewImageStyle(bp.crop);

        return (
          <div className="preview-card" key={key}>
            <header>{LABELS[key]}</header>
            <div className="preview-frame" style={{ paddingTop: `${paddingTop}%` }}>
              {imageUrl ? (
                <img src={imageUrl} alt={`${LABELS[key]} preview`} style={cropStyle} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <span style={{ color: "#9ca3af" }}>Select an image</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
