import type { BreakpointKey, BreakpointConfig } from "../types/crop";

interface Props {
  active: BreakpointKey;
  breakpoints: Record<BreakpointKey, BreakpointConfig>;
  onChange: (key: BreakpointKey) => void;
}

const LABELS: Record<BreakpointKey, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

export function BreakpointTabs({ active, breakpoints, onChange }: Props) {
  return (
    <div className="tabs" role="tablist">
      {(Object.keys(breakpoints) as BreakpointKey[]).map((key) => (
        <button
          key={key}
          role="tab"
          className={`tab ${active === key ? "active" : ""}`}
          aria-selected={active === key}
          onClick={() => onChange(key)}
        >
          {LABELS[key]}
          <span style={{ color: "#6b7280", marginLeft: 8, fontSize: 12 }}>{breakpoints[key].aspectRatio}</span>
        </button>
      ))}
    </div>
  );
}
