# SEO And AI Discoverability - QA Validation

QA artifact for the SEO/AI discoverability work. Captures the
acceptance criteria, the verification evidence, and the regression
checks performed against the existing app behaviour.

---

## Scope

- Add discoverability surfaces (meta, structured data, robots/sitemap,
  AI content maps, favicons) without changing app functionality.
- Source procedural content from `app/content/oshkosh/*` only;
  do not duplicate FAA-Notice-derived facts in SEO copy.
- Preserve NOTAM freshness, loader behaviour, store, service worker,
  and UI interactions.

## Files added

| Path | Purpose |
|---|---|
| `app/utils/seo.ts` | Typed origin, copy, social tags, JSON-LD graph builder. |
| `app/routes/robots[.]txt.ts` | `/robots.txt` resource route, AI-crawler-friendly. |
| `app/routes/sitemap[.]xml.ts` | `/sitemap.xml` resource route. |
| `app/routes/llms[.]txt.ts` | `/llms.txt` AI content map. |
| `app/routes/llms-full[.]txt.ts` | `/llms-full.txt` extended AI content map. |
| `public/favicon.svg` | Hand-written vector favicon, OSH monogram on primary navy. |
| `public/apple-touch-icon.png` | 180x180 iOS touch icon. |
| `public/icons/icon-192.png` | 192x192 PNG icon (PWA). |
| `public/icons/icon-512.png` | 512x512 PNG icon (PWA + maskable). |
| `public/browserconfig.xml` | Windows tile configuration. |

## Files modified

| Path | Change |
|---|---|
| `app/root.tsx` | Added `LinksFunction` for manifest + favicon set; added msapplication and color-scheme meta. |
| `app/routes/_index.tsx` | Expanded `meta` with description, keywords, robots, OG/Twitter, canonical, JSON-LD. Loader and component unchanged. |
| `public/manifest.json` | Tightened name, short_name, description, scope, lang, dir, categories, icons (any + maskable). |
| `public/favicon.ico` | Replaced with multi-size (16/32/48) ICO containing the new OSH monogram artwork. |

## Acceptance criteria - verification

### 1. Search-engine SSR head completeness

Verified by `curl -A 'Googlebot/2.1' http://localhost:5189/` against a
fresh production build. The rendered `<head>` contains:

- `<title>` with full descriptive title
- `<meta name="description">` with multi-sentence summary
- `<meta name="keywords">` (advisory)
- `<meta name="robots" content="index,follow,max-image-preview:large">`
- `<meta name="googlebot" ...>`
- Open Graph: `og:type`, `og:site_name`, `og:title`, `og:description`,
  `og:url`, `og:locale`, `og:image*`
- Twitter card: `twitter:card`, `twitter:title`, `twitter:description`,
  `twitter:image`, `twitter:image:alt`
- `<link rel="canonical" href="https://www.oshkosh-approach.com/">`
- Single `<script type="application/ld+json">` with `@graph` of:
  WebSite, WebApplication, Airport, Event, CreativeWork (FAA Notice)
- App / mobile tags: `application-name`, `apple-mobile-web-app-*`,
  `mobile-web-app-capable`, `format-detection`, `category`, `rating`
- Document links: manifest, favicon.ico (32x32), favicon.svg,
  apple-touch-icon (180x180), icon-192, icon-512, mask-icon
- `theme-color`, `msapplication-TileColor`, `msapplication-config`,
  `color-scheme`

Bot path in `app/entry.server.tsx` already uses `onAllReady` which
guarantees the full SSR HTML is delivered to crawlers in a single
flush. Not modified by this work.

### 2. Resource-route content-types and bodies

| Endpoint | Status | Content-Type | Notes |
|---|---|---|---|
| `/robots.txt` | 200 | `text/plain; charset=utf-8` | `User-agent: *` allow-all; explicit allow lines for GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, Claude-Web, PerplexityBot, Perplexity-User, Google-Extended, GoogleOther, Applebot-Extended, CCBot, cohere-ai, Bytespider; absolute `Sitemap:` URL. |
| `/sitemap.xml` | 200 | `application/xml; charset=utf-8` | Three URLs (`/`, `/llms.txt`, `/llms-full.txt`) with absolute `loc`, `lastmod` from `notice.publishedAt`, `changefreq`, `priority`. XML escaping preserved. |
| `/llms.txt` | 200 | `text/plain; charset=utf-8` | Markdown content map, FAA Notice cited as authoritative, links to authoritative sources, no procedural data dumped. |
| `/llms-full.txt` | 200 | `text/plain; charset=utf-8` | Detailed map: notice metadata, event facts, phases (titles + summaries only), transitions, frequencies, sources. No primary actions, no warnings, no NOTAMs - ensures the FAA Notice remains the only procedural source. |

### 3. AI-facing content boundary

Both `/llms.txt` and `/llms-full.txt`:

- State that the FAA AirVenture Notice is authoritative.
- Embed the current notice URL and FAA index URL.
- Tell AI systems they MUST cite the FAA Notice and link to it.
- Do not include raw NOTAM text (NOTAMs are loader-fetched and not
  surfaced anywhere in static SEO output).
- Do not include geolocation data, aircraft identity, call signs, or
  analytics events.

### 4. Favicon and device icon coverage

| Surface | Asset | Verification |
|---|---|---|
| Browser tab (legacy) | `/favicon.ico` | 8.2 KB ICO containing 16x16, 32x32, 48x48 PNG-in-ICO entries; `file` reports `MS Windows icon resource - 3 icons`. Linked with `type: image/x-icon` and `sizes: 16x16 32x32 48x48`. |
| Modern browser SVG | `/favicon.svg` | 462-byte hand-written vector, navy `#1f4e8c` rounded square + white OSH monogram. Also referenced as `mask-icon` for Safari pinned tabs. |
| iOS home screen | `/apple-touch-icon.png` | 180x180 PNG. |
| Android home screen / PWA | `/icons/icon-192.png` (192x192), `/icons/icon-512.png` (512x512) | Manifest declares 192 as `purpose: "any"` and 512 as `purpose: "any maskable"` (single entry). |
| Windows tile | `/browserconfig.xml` | `square150x150logo` -> `/icons/icon-192.png`, `TileColor` matches theme. |
| Manifest install metadata | `/manifest.json` | `name`, `short_name`, `description`, `start_url`, `scope`, `display: standalone`, `background_color`, `theme_color`, `lang`, `dir`, `categories`, full icon set (5 entries). |

All five favicon sizes were derived from a single 768x768 master
image using `sips -z` so the visual identity is consistent across
devices. The custom multi-size ICO was assembled with a one-off Node
script (no permanent dependency added).

### 5. Functional regression checks

| Concern | Check | Result |
|---|---|---|
| NOTAM freshness | `curl -I /` shows `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`. | Preserved. |
| Route loader | `getKoshNotams()` still invoked, response shape and headers unchanged. | Preserved. |
| Component tree | `FiskApproachApp` rendered with the same props (`notamList`, `fetchedAt`, `source`, `fetchError`). | Preserved. |
| Service worker | `public/service-worker.js` not modified; cache version `v4` retained. | Preserved. |
| Zustand store | `useAppStore.ts` not modified; persisted shape unchanged. | Preserved. |
| UI interactions | SSR HTML inspected for `/`: onboarding wizard, AppBar (OSH badge), StatusBar, PhaseSpine (8 phases), PhaseHero, PhaseSections, sheets all rendered as before. | Preserved. |
| Procedural content | No edits in `app/content/oshkosh/*`. SEO module reads from existing exports only. | Preserved. |
| Analytics | `app/utils/analytics.ts` not modified; no new capture sites added. | Preserved. |
| Logging contract | No new client/server log call sites added. | Preserved. |
| Dependencies | `package.json` and `package-lock.json` not changed by this work. | Preserved. |

### 6. Tooling

- `npm run lint` - 0 errors (3 pre-existing warnings in
  `clientLogger.ts`, `provider.tsx`, `analytics.ts`, unrelated).
- `npm run typecheck` - clean.
- `npm run build` - clean. The 4 new resource routes build as empty
  client chunks (loader-only, expected for resource routes).

## Open follow-ups (out of scope for this change)

- Add an OG-specific 1200x630 social image; current `og:image` reuses
  the 512x512 app icon, which is acceptable but not optimal for
  social previews.
- After the 2026 FAA Notice publishes and `notice.status` flips to
  `released`, the JSON-LD `CreativeWork` `name`/`url` will need a
  refresh; this happens automatically because it reads from
  `~/content/oshkosh` exports.
