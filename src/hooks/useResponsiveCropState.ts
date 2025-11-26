import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_FOCAL_POINT, createDefaultValue } from "../constants/defaults";
import type {
  BreakpointKey,
  CropRect,
  FocalPoint,
  MediaSelection,
  ResponsiveCropValue,
} from "../types/crop";
import { clampCrop, clampFocalPoint, normalizeValue } from "../utils/normalization";

export type SaveStatus = "idle" | "saving" | "success" | "error";

export function useResponsiveCropState(initialValue?: ResponsiveCropValue) {
  const [value, setValue] = useState<ResponsiveCropValue>(initialValue ?? createDefaultValue());
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey>("desktop");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (initialValue) {
      setValue(normalizeValue(initialValue));
    }
  }, [initialValue]);

  const setMediaSelection = useCallback((media: MediaSelection) => {
    setValue((prev) => ({
      ...prev,
      mediaItemId: media.id,
      mediaItemPath: media.path,
      mediaUrl: media.mediaUrl,
    }));
  }, []);

  const setManualUrl = useCallback((url: string) => {
    const trimmed = url.trim();
    setValue((prev) => ({
      ...prev,
      mediaItemId: undefined,
      mediaItemPath: undefined,
      mediaUrl: trimmed || undefined,
    }));
  }, []);

  const setFocalPoint = useCallback((fp: FocalPoint) => {
    setValue((prev) => ({ ...prev, focalPoint: clampFocalPoint(fp) }));
  }, []);

  const setCropForBreakpoint = useCallback((key: BreakpointKey, crop: CropRect) => {
    setValue((prev) => ({
      ...prev,
      breakpoints: {
        ...prev.breakpoints,
        [key]: { ...prev.breakpoints[key], crop: clampCrop(crop) },
      },
    }));
  }, []);

  const setAspectRatio = useCallback((key: BreakpointKey, aspectRatio: string) => {
    setValue((prev) => ({
      ...prev,
      breakpoints: {
        ...prev.breakpoints,
        [key]: { ...prev.breakpoints[key], aspectRatio },
      },
    }));
  }, []);

  const resetFocalPoint = useCallback(() => setFocalPoint(DEFAULT_FOCAL_POINT), [setFocalPoint]);

  const resetCrops = useCallback(
    () =>
      setValue((prev) => ({
        ...prev,
        breakpoints: createDefaultValue().breakpoints,
      })),
    []
  );

  const replaceValue = useCallback((next: ResponsiveCropValue) => {
    setValue(normalizeValue(next));
  }, []);

  const serializedValue = useMemo(() => JSON.stringify(value), [value]);

  return {
    value,
    activeBreakpoint,
    setActiveBreakpoint,
    setMediaSelection,
    setManualUrl,
    setFocalPoint,
    setCropForBreakpoint,
    setAspectRatio,
    resetFocalPoint,
    resetCrops,
    replaceValue,
    serializedValue,
    saveStatus,
    setSaveStatus,
  };
}
