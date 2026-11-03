# Scope and roadmap

## v0.1.0: campaign links, stored locally

This first release is for a solo marketer or small team member who needs consistent links, not a shared multi-user database. It includes the single-link builder, up to 50 variants, a 500-link browser library, CSV export, version-1 JSON backup/import, and English/Turkish UI.

The app has no login, backend, analytics, click tracking, link shortener or ad-platform integration. It does not measure conversion or attribution. Teammates can exchange exported files, but there is no real-time collaboration or automatic sync.

## Next small releases

Prioritize based on reproduced user needs and review capacity:

1. Accessibility and browser workflow coverage, especially import failures and keyboard use.
2. Discoverability, clearer examples and translation consistency.
3. Optional `utm_id` / `utm_source_platform` support after agreeing on backup compatibility.
4. Validation rules for custom naming conventions. Reusable UTM value templates now support explicit application, exact-value preservation and separate browser storage.

These are proposals, not promised delivery dates. Larger changes start with an issue and a design sketch. Do not add accounts, tracking, cloud sync or AI API dependencies to the first release.

## Maintenance

Diyar Yavuz is the initial maintainer. Community contributors propose and implement focused changes; merge access is not automatically granted with a contribution. Accepted work is credited through GitHub commit/PR history and release notes. There is no bounty, paid role or free subscription promise.
