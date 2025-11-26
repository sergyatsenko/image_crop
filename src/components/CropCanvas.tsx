"use client";

import Cropper, { Area } from "react-easy-crop";
import { useEffect, useMemo, useRef, useState } from "react";
import { aspectRatioToNumber, clampFocalPoint, clampCrop } from "../utils/normalization";
import type { CropRect, FocalPoint } from "../types/crop";

interface Props {
  imageUrl?: string;
  focalPoint: FocalPoint;
  crop: CropRect;
  aspectRatio: string;
  onFocalPointChange: (fp: FocalPoint) => void;
  onCropChange: (crop: CropRect) => void;
}

export function CropCanvas({ imageUrl, focalPoint, crop, aspectRatio, onFocalPointChange, onCropChange }: Props) {
  const [cropPosition, setCropPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const aspect = useMemo(() => aspectRatioToNumber(aspectRatio), [aspectRatio]);

  const initialArea = useMemo(
    () => ({
      x: crop.x * 100,
      y: crop.y * 100,
      width: crop.width * 100,
      height: crop.height * 100,
    }),
    [crop]
  );

  const updateFocalFromPointer = (event: { clientX: number; clientY: number }) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    onFocalPointChange(clampFocalPoint({ x, y }));
  };

  useEffect(() => {
    const handlePointerUp = () => setDragging(false);
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      updateFocalFromPointer(event);
    };
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [dragging]);

  const onCropComplete = (_: Area, croppedAreaPercentages: Area) => {
    const normalized: CropRect = clampCrop({
      x: croppedAreaPercentages.x / 100,
      y: croppedAreaPercentages.y / 100,
      width: croppedAreaPercentages.width / 100,
      height: croppedAreaPercentages.height / 100,
    });
    onCropChange(normalized);
  };

  return (
    <div
      className="canvas"
      ref={containerRef}
      onDoubleClick={(e) => updateFocalFromPointer(e.nativeEvent)}
      role="presentation"
    >
      {imageUrl ? (
        <>
          <Cropper
            image={imageUrl}
            crop={cropPosition}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCropPosition}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition={false}
            cropShape="rect"
            initialCroppedAreaPercentages={initialArea as any}
            objectFit="contain"
            style={{
              containerStyle: { borderRadius: 12, height: "100%" },
              cropAreaStyle: {
                border: "2px solid #2563eb",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                backdropFilter: "blur(2px)",
              },
            }}
          />
          <div
            className="focal-handle"
            style={{ left: `${focalPoint.x * 100}%`, top: `${focalPoint.y * 100}%` }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
            }}
            onPointerMove={(e) => dragging && updateFocalFromPointer(e.nativeEvent)}
          />
          <div
            className="overlay-label"
            onPointerDown={(e) => e.stopPropagation()}
            style={{ cursor: "default" }}
          >
            Drag crop • Drag orange dot to move focal point
          </div>
        </>
      ) : (
        <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#6b7280" }}>
          Select an image to start cropping.
        </div>
      )}
    </div>
  );
}
