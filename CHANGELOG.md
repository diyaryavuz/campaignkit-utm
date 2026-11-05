# Changelog

## Unreleased

- Load the tab icon from the project path instead of requesting a missing root favicon on GitHub Pages.

- Keep keyboard focus on the destination field when reusing a saved link or starting a link from an empty library.

- Save, apply and delete up to 20 browser-local UTM naming templates in English or Turkish. Applying preserves the destination URL; failed writes and unreadable template storage preserve existing data. Templates are separate from library JSON backups.

- Community contribution guide, issue/PR templates, starter tasks and a documented v0.1 scope.

## 0.1.0 â€” first release candidate

Prepared release notes; a heading here does not mean a Git tag or GitHub Release has been published.

- Build campaign URLs with explicit validation and optional normalization.
- Preserve unrelated query parameters and fragments; warn on existing UTMs and ad identifiers.
- Prepare up to 50 variants, store up to 500 links, and search/reuse the local library.
- Export spreadsheet-safe CSV and version-1 JSON; import validated backups additively.
- Keep corrupt data until explicit recovery and report failed storage writes.
- English/Turkish interface and responsive layout.

### Known limits

Browser-local records have no cloud backup. Clearing site data may erase them. Export JSON regularly. No click tracking, attribution measurement, shared workspace or audited security claim. See README for input and record limits.
