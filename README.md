# CampaignKit

**A local-first workspace for consistent campaign links.** Built by [Diyar Yavuz](https://github.com/diyaryavuz) with React, TypeScript and Vite.

[Türkçe](README.tr.md) · [Live demo](https://diyaryavuz.github.io/campaignkit-utm/) · [Build status](https://github.com/diyaryavuz/campaignkit-utm/actions)

![CampaignKit link builder](docs/screenshot.png)

## Why this exists

One campaign can have links across stories, feeds and newsletters. Inconsistent UTM naming can split reports into multiple entries. CampaignKit organizes those variants in one small workspace with explicit validation and local backups. This is an early open-source project for people who prepare campaign links. It is not presented as a proven commercial product.

## Join the project

New contributors are welcome. Start with the [five-minute guide](docs/QUICK_START.md), read [CONTRIBUTING.md](CONTRIBUTING.md), and pick a [starter task](docs/STARTER_TASKS.md). For sample source/medium/campaign values, see [naming examples](docs/NAMING_EXAMPLES.md). Documentation, translations, accessibility feedback and tests are as welcome as code. Use [GitHub issues](https://github.com/diyaryavuz/campaignkit-utm/issues) for questions and proposals; comment before taking a task.

The first-release scope is **v0.1.0**: a local-first campaign link workspace. See the [roadmap](docs/ROADMAP.md), [release notes](CHANGELOG.md), [community rules](CODE_OF_CONDUCT.md) and [security/data-safety guide](SECURITY.md). No signup, cloud service or API key is required to contribute.

## Features

- Live UTM builder with required-field, URL and naming checks.
- Preserves existing query parameters and fragments. Warns before replacing supported UTMs and when auto-tagging IDs are present.
- Explicit normalization; never silently changes campaign names.
- Save and explicitly apply up to 20 reusable UTM naming templates; destination URLs are never stored in templates or replaced when applying them.
- Up to 50 source/medium/content variants per campaign.
- Local library with search, reuse and duplicate prevention (500 links).
- CSV export with spreadsheet-formula protection; JSON backup and validated, additive import.
- Corrupt storage is preserved until the user explicitly recovers/resets it. Failed writes do not show a success message.
- Turkish and English UI; responsive layout and keyboard-accessible controls.

## Run locally

Requires **Node.js 22.12+** and npm.

```sh
git clone https://github.com/diyaryavuz/campaignkit-utm.git
cd campaignkit-utm
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## Verification

47 automated tests cover URL validation, bulk workflows, backups, duplicate handling, CSV escaping, storage failures, stale-tab protection, templates, keyboard focus and language preferences. The build includes TypeScript checks. Browser checks cover template backup/import, filtered CSV contents, language reload and bulk validation focus. Both languages were checked at 375px with no horizontal document overflow.

GitHub Actions tests and builds pull requests. On `main`, successful checks also deploy the static demo to GitHub Pages. Build output is `dist/`; Vite uses a relative asset base for project-site hosting.

## Scope and privacy

See the bilingual [backup and recovery guide](docs/BACKUP_AND_RECOVERY.md) before moving browsers or clearing site data. Link JSON backups and template JSON backups are separate. The library's CSV button exports all links; the search-results CSV button exports only matches. Template imports add entries and reject conflicting names without overwriting existing conventions.

CampaignKit does **not** measure clicks, sales, conversions or ROAS. It does not connect to ad accounts or promise correct attribution. Analytics must already be configured on the destination site. Review the interaction of manual UTMs and automatic ad tagging in your own analytics setup.

The application has no backend, login, analytics scripts or API keys. It does not fetch destination URLs. Records stay in this browser's `localStorage`; clearing site data can erase them. Export JSON backups. Local development and the public demo have separate storage origins. Do not put personal data or secrets in campaign URLs. External documentation/GitHub links leave the application when clicked.

Import accepts only version-1 CampaignKit JSON, up to 5 MB and 500 records. Links are regenerated from validated fields; imports merge without replacing existing records. CSV exports use UTF-8 with BOM and quote fields; formula-like values receive a leading apostrophe for spreadsheet safety.

## Project structure

```text
src/App.tsx             Bilingual workspace and browser interactions
src/lib/campaign.ts     UTM validation and URL generation
src/lib/library.ts      Local records, import/export and persistence
src/*.test.tsx          User-facing workflow tests
src/lib/*.test.ts       URL and data-integrity tests
```

## Naming templates

In the single-link builder, enter at least one UTM field and a unique template name, then choose **Save template**. Select a saved template and choose **Apply template** to replace all five UTM fields, including empty values. The destination URL is preserved. Selecting a template alone does not change the form. Values are saved exactly as entered; normalization remains an explicit action.

Up to 20 templates are stored in this browser, separately from the link library. Template names are limited to 60 characters and UTM values to 200 characters. Deletion requires confirmation. Failed writes keep existing templates unchanged; unreadable data is preserved with download and explicit reset controls. Templates are **not included in library JSON backups** and can be lost when browser data is cleared.

## Next improvements

- Validation rules for custom naming conventions.
- Optional `utm_id` and `utm_source_platform` form fields (existing URL values are already preserved).
- More extensive browser automation and accessibility checks.

## License

CampaignKit source code is available under the [MIT License](LICENSE). Third-party dependencies retain their respective licenses.

## References

[Google Analytics campaign URL guidance](https://support.google.com/analytics/answer/10917952), [MDN URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
