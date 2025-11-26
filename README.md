# Responsive Image Crop & Focal Point Editor

## Overview
- Page Builder **Custom Field** extension that lets editors pick an image, set a shared focal point, and define
  breakpoint-specific crops (desktop/tablet/mobile) using normalized coordinates.
- Built for the Marketplace Starter Kit (Next.js App Router) with `@sitecore-marketplace-sdk/client` for field IO
  and `@sitecore-marketplace-sdk/xmc` for XM Cloud media search.
- Outputs a JSON string matching the `ResponsiveCropValue` shape for easy consumption by rendering hosts (Sitecore
  media handler params, CSS object-position/object-fit, or headless loaders).

## Project structure
- `app/custom-field-extension/page.tsx` — main custom field UI (client init, load/save, canvas).
- `src/components/*` — crop canvas, breakpoint tabs, media search modal, previews.
- `src/hooks/useResponsiveCropState.ts` — state machine for focal/crop updates, serialization, resets.
- `src/hooks/useMarketplaceClient.ts` — bootstraps Marketplace client with XMC module.
- `src/utils/*` — normalization helpers, media search (Authoring/Preview GraphQL), preview transforms.
- `src/constants/defaults.ts` — default focal point, breakpoints, and initial JSON shape.

## References
- Marketplace starter kit (custom field pattern): https://github.com/Sitecore/marketplace-starter
- Marketplace SDK for JS: https://doc.sitecore.com/mp/en/developers/sdk/latest/sitecore-marketplace-sdk/sitecore-marketplace-sdk-for-javascript.html
- Custom field get/set value: https://doc.sitecore.com/mp/en/developers/sdk/latest/sitecore-marketplace-sdk/get-and-set-custom-field-values.html
- Application context: https://doc.sitecore.com/mp/en/developers/sdk/latest/sitecore-marketplace-sdk/query-the-application-context.html
- XMC package (Authoring/Preview GraphQL): https://doc.sitecore.com/mp/en/developers/sdk/latest/sitecore-marketplace-sdk/marketplace-sdk-packages.html
- Inspiration for normalized focal points: https://amplience.com/developers/docs/user-guides/assets/point-of-interest/


## Data model (field value)
```ts
type FocalPoint = { x: number; y: number }; // 0..1
type CropRect = { x: number; y: number; width: number; height: number }; // 0..1 each
type BreakpointKey = "desktop" | "tablet" | "mobile";

type BreakpointConfig = {
  aspectRatio: string; // "16:9" | "4:3" | "1:1"
  crop: CropRect;
};

type ResponsiveCropValue = {
  mediaItemId?: string;
  mediaItemPath?: string;
  mediaUrl?: string;
  focalPoint: FocalPoint;
  breakpoints: Record<BreakpointKey, BreakpointConfig>;
};
```
- Defaults: focal point `(0.5, 0.5)`; crops = full image for all breakpoints; aspect ratios desktop `16:9`, tablet
  `4:3`, mobile `1:1`.

## Quick start (local)
- `npm install`
- `npm run dev` → open `/custom-field-extension` locally (renders outside the iframe but useful for smoke checks).
- `npm run build` → production bundle for deployment.

## UX flow
1) Init custom field page with `useMarketplaceClient()`, fetch `application.context`, and call `client.getValue()` to
   hydrate state (fallback to defaults on parse errors).
2) Image selection:
   - Primary: inline media search modal (XMC Authoring/Preview GraphQL) under `/sitecore/media library`, filter by
     name, show thumbnail + path. Store `mediaItemId`, `mediaItemPath`, and preview `mediaUrl`.
   - Fallback: URL input box to paste any direct image URL; clears `mediaItemId`.
3) Canvas: render selected image with a draggable focal point overlay and a draggable/resizable crop rect for the
   active breakpoint (desktop/tablet/mobile tabs). Use normalized math based on natural image dimensions.
4) Preview panes: small preview per breakpoint using `overflow: hidden` and transform or a cropped `<img>` to reflect
   the saved rect + aspect ratio.
5) Controls: Reset focal point (center), reset all crops (full image), Save (serialize JSON → `client.setValue`),
   Cancel (reload value or close).
6) Persisted values reload on reopen and restore focal point + all crops.

## Architecture outline
- `app/custom-field-extension/page.tsx`: initialize Marketplace client, query context, load/set field value, render
  the editor shell, handle Save/Cancel.
- `components/MediaSearchModal.tsx`: lightweight search overlay; uses XMC client to call Authoring/Preview GraphQL
  and select a media item.
- `hooks/useResponsiveCropState.ts`: state machine for value parsing, updates to focal point and per-breakpoint crops,
  reset helpers, and JSON serialization.
- `components/CropCanvas.tsx`: image render + overlays; leverage `react-easy-crop` (or similar MIT library) for
  drag/resize, plus a custom draggable focal point handle with normalized conversions.
- `components/BreakpointTabs.tsx`: tab switcher + mini previews; enforces aspect ratios and passes active breakpoint to
  `CropCanvas`.
- `utils/mediaUrl.ts`: derive a preview URL from media item fields or media handler patterns; fallback to the stored
  `mediaUrl`.

## Media search (Authoring/Preview GraphQL)
Example query shape (adapt to your tenant schema):
```graphql
query FindMedia($rootPath: String!, $searchTerm: String!, $language: String!) {
  search(
    where: {
      AND: [
        { name: "_path", value: $rootPath, operator: UNDER }
        { name: "name", value: $searchTerm, operator: CONTAINS }
      ]
    }
    language: $language
    first: 20
  ) {
    results {
      item {
        id
        name
        path
        fields(ownFields: false) {
          name
          value
        }
      }
    }
  }
}
```
- Use XMC Authoring/Preview endpoint to include Media Library items; show first 20 results with thumbnail + path;
  debounce search input.

## Canvas math (normalized)
- Focal point: `x = clientX / naturalWidth`, `y = clientY / naturalHeight`.
- Crop rect: `x = left / width`, `y = top / height`, `width = rectWidth / width`, `height = rectHeight / height`.
- On load, compute pixel positions from normalized values for rendering and pass to the crop library; clamp values to `0..1`.

## Example rendering consumption
```ts
const value: ResponsiveCropValue = JSON.parse(fieldValueFromXM);
const key: BreakpointKey = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";
const crop = value.breakpoints[key].crop;
// Use crop + focal point to build media handler params or CSS object-position/object-fit.
```

## XM Cloud configuration steps
- Create a Marketplace app from the starter kit in XM Cloud Portal; allow the custom field extension route
  `/custom-field-extension`.
- Add the compiled app URL as an allowed origin for Pages/Page Builder.
- In Content Editor (or Serialization), add a `Marketplace Type → Plugin` field to the template you want to use and
  point it to this app’s custom field (the starter kit uses the route name to bind).
- In Pages/Page Builder, add the field to a component data source and open it from the right-hand panel; the app will
  load inside the iframe, initialize `application.context`, and read/write the field value via `client.getValue` /
  `client.setValue`.

## Deploy to XM Cloud (starter-kit style)
- Build: `npm run build` (produces `.next` output).
- Host: deploy the Next.js app to your preferred host (Vercel, Azure Static Web Apps, Netlify). Ensure HTTPS and the
  domain is whitelisted in XM Cloud.
- Environment: no secrets required for the core flow; GraphQL calls use the XMC module via the Marketplace SDK, which
  relies on the Page Builder iframe context. If you need to override the media root or language, expose env vars and
  pass them to `MediaSearchModal`.
- Verify in Portal: launch the custom field from Portal > Extensions, confirm `application.context` loads, and test
  save/reset.

## Publish on the Sitecore Marketplace
1) Prepare assets: logo (512×512), screenshots/GIF of the editor, short + long description, and this README.
2) Confirm licensing: MIT for this module and `react-easy-crop`.
3) Bundle app: host a production build (as above) with a stable URL; ensure CORS/allowed origins include Pages.
4) QA checklist to document in the listing:
   - Field opens and restores prior JSON.
   - Media search resolves items under `/sitecore/media library`.
   - Save writes normalized JSON; cancel leaves value untouched.
5) Submit listing:
   - In the Marketplace publisher portal, create a new listing, choose extension type “Custom Field”.
   - Provide the hosted URL for the custom field, categories (XM Cloud, Page Builder), and compatibility notes
     (Next.js App Router, Marketplace SDK 0.2.x).
   - Attach screenshots, changelog, and validation notes.
6) After approval: keep a versioned changelog; bump semver and update the listing when dependencies change.

## Setup and dev notes
- Uses `@sitecore-marketplace-sdk/client` with XMC module to call `application.context` and `xmc.graphql.authoring`
  for media search.
- UI dep: `react-easy-crop` (drag/resize crop).
- Respect iframe constraints in Page Builder; avoid global window access outside the hook that initializes the SDK.
- Handle loading/error states for client init and media search; disable Save while parsing or missing image.

## Testing and QA checklist
- Field open/close cycles restore saved values and focal/crop states.
- Media search returns expected items under `/sitecore/media library` and handles empty results.
- Normalized math holds across different image aspect ratios and device sizes.
- Breakpoint switching preserves each rect independently; reset buttons reset as expected.
- Save writes valid JSON; invalid JSON from older versions is safely replaced with defaults.
- Manual QA on Page Builder in XM Cloud (desktop/tablet/mobile preview).

## Open items
- Confirm tenant-specific GraphQL fields for media URLs or derive handler URLs per environment.
- Decide on toast/notification pattern post-save (inline text vs. lightweight toast).
