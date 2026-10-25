# GemsOnChain

A Next.js 15 App Router application for transparent crypto discovery. TypeScript, Tailwind, shadcn-style accessible Button and Radix Dialog primitives, Supabase Auth/Postgres, and live DexScreener data. No wallet or trading execution.

## Run locally

Requires Node.js 22 or newer and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Live market discovery, search and detail pages work without Supabase. The curated collection and social posts are intentionally empty until configured; no fabricated data or posts are supplied.

## Supabase setup

1. Create a Supabase project. Copy its project URL and **anon** key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. A service-role key is not used or needed.
2. Run `supabase/migrations/001_initial.sql` once in the project's SQL editor (or apply it with the Supabase CLI).
3. In Supabase Authentication, create an email/password user for the administrator. Disable public signups if no other accounts are needed. Set the site URL to your deployed origin and configure Auth rate limits for your deployment.
4. Copy the administrator's UUID from Auth and run this in the SQL editor:

```sql
insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
```

5. Restart the local server and open `/admin`. Sign in, add coins using verified chain/address identities, and associate original posts with one or more coins. Publication dates in the editor are UTC. Featured cult coins appear first, then ascending priority. `research` records provide detail-page context but are not listed as cult picks. Inactive coins are hidden publicly.

The admin allowlist has no public policies. `is_admin()` reads it under a fixed empty search path. Each server action calls `getUser()` and checks membership before a mutation; RLS independently protects each table. Post and token-association edits use one transactional SQL function. Client components never receive privileged credentials. Text is escaped by React, URLs are HTTPS-only, and image optimization is restricted to DexScreener's CDN. Other logo hosts use a letter fallback.

### Verify authorization after connecting a database

Use a disposable test coin/post in your own Supabase project:

- As a signed-out visitor, confirm published records can be read; inserts, updates and deletes through the anon client must fail.
- Sign in as a non-admin Auth user. `/admin` must deny access and direct database writes must fail.
- Sign in as the allowlisted administrator. Create, edit, preview, deactivate and delete the disposable coin. Create a post linked to multiple coins and verify each detail page. An invalid association must roll back the entire post update.
- Remove the admin's allowlist entry and verify subsequent writes fail, even with an existing session.

These live Auth/RLS checks require your configured project and have not been run without credentials. Do not treat the unit tests as proof of deployed database policies.

## Data model and routes

- `curated_coins`: chain/address identity, editorial names and descriptions, category, priority, active/featured status; market data is fetched separately.
- `curated_posts`: author, handle, HTTPS source, summary, optional publication date.
- `post_tokens`: many-to-many associations, cascading when either record is removed.
- `admin_users`: server-provisioned Auth user allowlist.
- `/`: 2×2 discovery panels; responsive single-column mobile layout.
- `/coin/[chain]/[address]`: selected-pair metrics, transaction pressure and social context.
- `/api/search?q=...`: server-side search with shared cache.
- `/methodology`: ranking formula, universe, freshness and provider limitations.
- `/admin`: protected curation editor, or setup state without credentials.

## Market source and limitations

See https://docs.dexscreener.com/api/reference. Verified live responses from the public API include `volume.h24`, `liquidity.usd`, `txns.<period>.buys/sells`, `priceChange`, and optional market cap, FDV and pair creation time.

Endpoints: `/token-profiles/latest/v1` (60 requests/minute documented), `/tokens/v1/{chain}/{addresses}` (up to 30 addresses; 300/minute), `/token-pairs/v1/{chain}/{address}` (300/minute), and `/latest/dex/search` (300/minute). Network requests run server-side with 60-second caching, in-flight deduplication, 8-second timeout, one transient retry and a 429 cooldown. A bounded warm-instance cache retains previous data for at most 15 minutes. Cold/serverless instances do not share this fallback or cooldown. For high-traffic deployments, add shared request limiting/cache or a Vercel firewall rule; these in-process controls are not a global provider quota guarantee.

Discovery samples latest profiles, explicit chain/address anchors, and active curated coins. It is not an all-market census. Only Solana and Ethereum are enabled. The token address, not its symbol, is the identity. EVM identity is case-insensitive; Solana identity is case-sensitive. The highest-liquidity base-token pair is selected per token; volumes are not summed across duplicate pools. Search can return low-liquidity markets outside the discovery filters. Provider profiles can reflect paid promotion.

Configuration: `DISCOVERY_MIN_LIQUIDITY=25000`, `DISCOVERY_MIN_VOLUME=10000`, `DISCOVERY_MAX_AGE_DAYS=30`. Trending score is `0.45*log10(1+24hVolume) + 0.35*log10(1+24hTransactions) + 0.20*log10(1+liquidity)`. Potential gems must also have a known pair age within the configured range. Thresholds and reasons are visible in the UI. Missing metrics remain unavailable; zero is displayed as zero.

Buy/sell pressure means **transaction count**, not USD volume. Historical candles, holder concentration, contract audits and liquidity history are not supplied by this integration. Chart history is explicitly unavailable with an external chart link. Robinhood Chain coverage is unverified and disabled; it is not represented as a supported market. Provider data is not independently audited and basic liquidity checks are not safety assessments.

## Validation

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm audit
npm start
```

Tests cover token identity, representative-pair deduplication, eligibility and pair-age boundaries, invalid API metrics, tiny/missing/zero prices, and unsafe editorial inputs. Manual browser checks cover public navigation, live search, detail metrics and responsive rendering. No paid services are required. The dynamically loaded Three.js gem respects reduced-motion settings and pauses rendering offscreen. Tests also verify that its 96-facet geometry is closed and outward-facing.

Next.js is pinned to the latest available 15.x security release at implementation. PostCSS and selector-parser overrides resolve transitive audit advisories while retaining the requested framework and Tailwind 3 compatibility. Keep the lockfile and rerun build/tests/audit when updating.

## Deploy to Vercel

Import this directory into a Git repository and connect it to a Vercel project using the Next.js preset. Use Node.js 22+, build command `npm run build`, and the default output directory. Add the two Supabase variables and optional thresholds to Vercel's production environment. Apply the SQL migration to the production database, configure the administrator and Auth site URL, then deploy. No deployment has been created automatically; hosting and the Supabase project belong to you.

The Google Fonts stylesheet is optional: the interface falls back to local system fonts if it is blocked. Logo images are optimized through Next Image. Provider API requests never originate from individual token cards. The server-rendered page passes one shared market snapshot to the discovery UI.

## Observatory visual edition

The UI refinement adds an original faceted WebGL crystal with drag and keyboard rotation, a real-token spotlight, a sliding category indicator, pointer-following card illumination, a focused desktop category view with liquidity/volume columns, mobile navigation, search skeletons, explanatory tooltips and animated transaction balance bars. Data, ranking, token identity and admin mutations retain their original contracts.

- [Motion](https://github.com/motiondivision/motion): installed for spring motion, shared-layout category indicators and pressure-bar transitions.
- [Magic UI](https://github.com/magicuidesign/magicui) and its [Magic Card pattern](https://magicui.design/docs/components/magic-card): visual reference for the original card-lighting implementation; no Magic UI source was copied.
- [shadcn/ui](https://github.com/shadcn-ui/ui): accessible component composition; Button and Radix Dialog are retained and a Radix-backed tooltip is added.
- [Awwwards MCP](https://github.com/INSANE0777/Awwwards-mcp): repository reviewed for the reference-study workflow. No Awwwards connector was available in the session's plugin search, and no MCP server was installed or claimed as connected.

`src/app/experience.css` contains the visual-edition layer. The header pause button stores its preference locally; OS reduced-motion settings always take precedence. Crystal motion and ambient animations are disabled in reduced-motion mode. Content remains available without animation. The Three.js runtime loads separately on the homepage, with a static fallback if WebGL is unavailable. The crystal offers rose and ice finishes and a reset control. No video loop, fake market history or decorative market statistics were added.

The Supabase configuration requirements above still apply. Visual changes do not replace the required live Auth/RLS verification after connecting a database.

## Light and dark appearance

The navbar theme switch applies throughout discovery, token details, search dialogs, methodology and admin forms. It follows the OS preference until explicitly selected, then remembers the choice in local storage and synchronizes across tabs. An early bootstrap sets the theme before content renders. Theme palettes and responsive overrides live in src/app/themes.css. Keyboard focus, positive/negative indicators, native form controls and empty/loading states have dedicated dark styles.
