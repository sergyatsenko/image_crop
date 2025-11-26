"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ApplicationContext } from "@sitecore-marketplace-sdk/client";
import { useMarketplaceClient } from "../../src/hooks/useMarketplaceClient";
import { useResponsiveCropState } from "../../src/hooks/useResponsiveCropState";
import { BreakpointTabs } from "../../src/components/BreakpointTabs";
import { CropCanvas } from "../../src/components/CropCanvas";
import { MediaSearchModal } from "../../src/components/MediaSearchModal";
import { PreviewStrip } from "../../src/components/PreviewStrip";
import { parseSerializedValue } from "../../src/utils/normalization";
import type { BreakpointKey, ResponsiveCropValue } from "../../src/types/crop";

export default function CustomFieldPage() {
  const { client, isInitialized, error, isLoading } = useMarketplaceClient();
  const [appContext, setAppContext] = useState<ApplicationContext | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const [loadedValue, setLoadedValue] = useState<ResponsiveCropValue>();
  const [statusMessage, setStatusMessage] = useState<string>("Initializing...");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState("");
  const initialSerializedRef = useRef<string | null>(null);

  const {
    value,
    activeBreakpoint,
    setActiveBreakpoint,
    setMediaSelection,
    setManualUrl,
    setFocalPoint,
    setCropForBreakpoint,
    resetFocalPoint,
    resetCrops,
    replaceValue,
    serializedValue,
    saveStatus,
    setSaveStatus,
  } = useResponsiveCropState(loadedValue);

  useEffect(() => {
    if (value.mediaUrl) {
      setManualUrlInput(value.mediaUrl);
    }
  }, [value.mediaUrl]);

  useEffect(() => {
    const hydrate = async () => {
      if (!client || !isInitialized) return;
      setIsHydrating(true);
      try {
        setStatusMessage("Loading context...");
        const ctxResponse: any = await client.query("application.context");
        const ctx = ctxResponse?.data ?? ctxResponse;
        setAppContext(ctx ?? null);
        const lang =
          ctx?.language ??
          ctx?.languages?.current ??
          ctx?.selection?.language ??
          ctx?.site?.language ??
          ctx?.languageName;
        if (lang) setLanguage(lang);

        setStatusMessage("Loading stored value...");
        const currentValue: any = await client.getValue();
        const raw = typeof currentValue === "string" ? currentValue : currentValue?.data ?? currentValue?.value;
        if (raw) {
          initialSerializedRef.current = raw;
          const parsed = parseSerializedValue(raw);
          setLoadedValue(parsed);
        } else {
          setLoadedValue(undefined);
        }
        setStatusMessage("Ready");
      } catch (err) {
        console.error("Failed to hydrate custom field", err);
        setStatusMessage("Failed to load context/value");
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate().catch((err) => console.error(err));
  }, [client, isInitialized]);

  const handleSave = async () => {
    if (!client) return;
    setSaveStatus("saving");
    const trimmedUrl = manualUrlInput.trim();
    const payload: ResponsiveCropValue = trimmedUrl
      ? {
          ...value,
          mediaUrl: trimmedUrl,
          mediaItemId: undefined,
          mediaItemPath: undefined,
        }
      : value;
    try {
      await client.setValue(JSON.stringify(payload));
      replaceValue(payload);
      setSaveStatus("success");
      setStatusMessage("Saved");
      setTimeout(() => client?.closeApp?.(), 800);
    } catch (err) {
      console.error("Failed to save value", err);
      setSaveStatus("error");
      setStatusMessage("Save failed");
    }
  };

  const handleCancel = () => {
    if (initialSerializedRef.current) {
      replaceValue(parseSerializedValue(initialSerializedRef.current));
    }
    client?.closeApp?.();
  };

  const disableSave = (!value.mediaUrl && !manualUrlInput.trim()) || saveStatus === "saving";

  const activeAspect = value.breakpoints[activeBreakpoint].aspectRatio;
  const activeCrop = value.breakpoints[activeBreakpoint].crop;
  const imageUrl = value.mediaUrl;

  const saveLabel = saveStatus === "saving" ? "Saving..." : "Save";

  const badgeText = useMemo(() => {
    if (saveStatus === "success") return "Saved";
    if (saveStatus === "error") return "Error";
    if (isHydrating || isLoading) return "Loading";
    return "Ready";
  }, [saveStatus, isHydrating, isLoading]);

  return (
    <main className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Responsive Image Crop</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Focal point + per-breakpoint crops stored as normalized JSON for front-end rendering.
          </p>
        </div>
        <span className="badge">{badgeText}</span>
      </div>

      <div className="toolbar">
        <button className="btn" onClick={() => setShowMediaModal(true)} disabled={!client}>
          Select image
        </button>
        <button
          className="btn secondary"
          onClick={() => {
            setManualUrlInput("");
            setManualUrl("");
          }}
        >
          Clear selection
        </button>
        <input
          className="field"
          style={{ maxWidth: 360 }}
          placeholder="Or paste an image URL..."
          value={manualUrlInput}
          onChange={(e) => setManualUrlInput(e.target.value)}
          onBlur={() => setManualUrl(manualUrlInput.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setManualUrl(manualUrlInput.trim());
            }
          }}
        />
        {value.mediaItemPath && (
          <span style={{ color: "#6b7280" }}>Media item: {value.mediaItemPath ?? value.mediaItemId}</span>
        )}
      </div>

      <BreakpointTabs
        active={activeBreakpoint}
        breakpoints={value.breakpoints}
        onChange={(bp: BreakpointKey) => setActiveBreakpoint(bp)}
      />

      <CropCanvas
        imageUrl={imageUrl}
        focalPoint={value.focalPoint}
        crop={activeCrop}
        aspectRatio={activeAspect}
        onFocalPointChange={setFocalPoint}
        onCropChange={(next) => setCropForBreakpoint(activeBreakpoint, next)}
      />

      <div className="toolbar">
        <button className="btn secondary" onClick={resetFocalPoint}>
          Reset focal point
        </button>
        <button className="btn secondary" onClick={resetCrops}>
          Reset crops
        </button>
        <button className="btn danger" onClick={handleCancel}>
          Cancel
        </button>
        <button className="btn" onClick={handleSave} disabled={disableSave}>
          {saveLabel}
        </button>
      </div>

      <PreviewStrip value={value} imageUrl={imageUrl} />

      <div>
        <h3 style={{ marginBottom: 6 }}>Serialized value</h3>
        <pre
          style={{
            background: "#0f172a",
            color: "#e5e7eb",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            maxHeight: 220,
            fontSize: 12,
          }}
        >
          {serializedValue}
        </pre>
      </div>

      <div className="status" aria-live="polite">
        {statusMessage}
        {error && <span style={{ color: "#b91c1c" }}> • {String(error)}</span>}
      </div>

      <MediaSearchModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        client={client}
        language={language}
        onSelect={(media) => {
          setMediaSelection(media);
          setManualUrl(media.mediaUrl ?? "");
        }}
      />
    </main>
  );
}
