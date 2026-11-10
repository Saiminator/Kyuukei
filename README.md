# Kyuukei no Hanashi

The official Kyuukei website, built with Jekyll for GitHub Pages. The selected design uses local fonts, Orby-pink buttons, a responsive navigation menu and the supplied Kyuu cursors. It has no application framework, database, tracker or custom newsletter backend.

## Content

- **Volumes:** `_volumes/volume-1.md`, etc. Each file holds the entire volume record in YAML front matter, including status, synopsis, artwork and its independent character summaries. Jekyll creates `/volumes/volume-1/` automatically; adding a volume does not require a new layout or a separate generated-data cache.
- **Visibility:** use `published: false` for a draft. Drafts have no published page and do not appear in the catalog or homepage. Public volumes have `published: true`.
- **Homepage feature:** the highest-numbered public `Upcoming` volume is featured. `Planned` and `Available` volumes are excluded. No upcoming volumes means no feature.
- **Publication:** Volume 1 is Upcoming for 2027. Volumes 2–4 are Planned, with no descriptions or character registries. Titles use “Volume 1”, “Volume 2”, etc.
- **Characters:** `_data/characters.json` contains shared names, artwork and introduction metadata. Descriptions belong to the corresponding volume, never the shared identity record. `order` overrides introduction order; zero is valid. `known_through` must be earlier than the promoted volume. Kyuu may be introduced on Volume 1.
- **Artwork:** volume `cover` and character `portrait` / `illustration` fields accept `src` and optional `srcset`. Supply approved assets under `assets/` or use their public URL. Current artwork slots retain their aspect ratios. No AI artwork was generated.
- **News:** the original `_news/` archive is rendered with the selected layout. Add a Markdown file with a title and date; category and description are optional. `published: false` hides a draft.
- **Merchandise:** edit `_data/products.json`. Only set product links when the actual Fourthwall product exists. Fourthwall handles purchases and checkout.
- **Brand and integrations:** `_data/site.json` contains contact and service URLs. `kit_form_url` is currently null, so the newsletter controls are disabled and clearly say “Newsletter opening soon”. Configure Kit's hosted form URL to enable the subscription link; no private API key belongs in the site.
- **Colors:** `_config.yml` selects palette 05, `palette: charcoal-blush` (Charcoal & Blush); the palette values are in `_data/palettes.json`. Jekyll renders the selected palette into the stylesheet during its normal build. There is no palette picker on the public site.
- **Shop CSS reference:** `fourthwall/custom.css` is a GitHub-only handoff for manual Fourthwall customization. It is excluded from Jekyll and not imported by either site. See `fourthwall/README.md` for the research, recommended workflow and remaining theme-verification step.
- **Social previews:** Open Graph and Twitter summary-card images use the same original favicon URL as the browser icon, including for Discord link previews. Existing messages may retain cached previews until the platform refreshes them.

The old chapter reader, character encyclopedia and Questions interface are retired. Their unused source, old data tables and music were removed; previous versions remain in Git history. Top-level bookmarks for About, Questions, Characters and Stories redirect to the current homepage or Story catalog. A custom 404 page handles other retired URLs. The original cursor attribution remains on Privacy Policy.

## Build

Use Ruby 3.3 and Bundler 2.6.9:

```bash
bundle install
python3 scripts/validate_content.py
JEKYLL_ENV=production bundle exec jekyll build --strict_front_matter
python3 scripts/check_site.py _site
```

The workflow in `.github/workflows/pages.yml` builds with the locked gems and runs content, generated-site and publication checks before deployment. It uses Ubuntu 24.04 and Node 24 actions rather than GitHub's automatic Pages Jekyll build. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions** once. Pushes to `main` then deploy automatically; pull requests run the build checks without deploying. The workflow can also be run manually from Actions. The existing `CNAME` remains `kyuukei.com`.

Action versions are pinned to commit SHAs. Dependabot checks for action updates monthly. Python is used for validation, not production rendering; browser checks remain optional local checks.

For local viewing:

```bash
python3 -m http.server 4120 --directory _site
```

## Verify

The publication tests build isolated copies to verify draft privacy, automatic volume pages, the Upcoming-only homepage feature, default cast order and manual overrides:

```bash
python3 tests/test_publication.py
```

Optional browser checks require Node, Chromium and the pinned development dependencies:

```bash
npm ci --ignore-scripts
SITE_URL=http://127.0.0.1:4120 CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

Browser artifacts default to `/tmp/kyuukei-release-checks`; set `TEST_ARTIFACTS` to choose another location. The checks cover 320–1920px layouts, the mobile menu without a current-tab dot, highlighted tab text, native cursor states, touch-device behavior, dialogs, the real news archive, unavailable newsletter controls, local assets and accessibility rules. The desktop cursor uses the original animated GIFs in a decorative top-layer element. Pointer events schedule a single position update per animation frame; there is no continuous JavaScript animation loop. Local PNG frames cover loading failures and reduced-motion preferences. Touch devices retain their usual behavior.


### Cursor and favicon

`_data/site.json` retains the original favicon (`comfavicon.gif`) and the original default, select and text cursor GIF URLs from the Kyuukei S3 bucket. The `.cur` and PNG files remain local fallbacks; they are not used as the favicon.

A small early bootstrap restores the last pointer position before the new page needs a mouse event. Only pointer coordinates, cursor state and a timestamp are kept in this tab's `sessionStorage`; nothing is sent to a server. Entries expire after five minutes and disappear with the tab. Click navigation, reloads and history restoration share this behavior. A manual popover keeps the cursor above character dialogs without intercepting clicks or taking focus.

```bash
SITE_URL=http://127.0.0.1:4120 CHROMIUM_PATH=/usr/bin/chromium npm run test:cursor
```

The focused tests check actual GIF frame changes, idle rendering, navigation with destination pointer events suppressed, reload/back restoration, dialog controls, reduced motion, touch, unavailable image URLs and restricted storage. The cloud environment blocks access to the original S3 bucket, so automated tests substitute an explicitly isolated two-frame GIF for those external image requests. The published site continues to request the original artwork URLs, not the test fixture.
