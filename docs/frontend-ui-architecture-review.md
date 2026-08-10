# Frontend UI Architecture Review

## Executive summary

The authenticated CRM currently has a coherent visual direction, but implements it page by page. The audit found 69 repeated white bordered card shells, 20 page-level background declarations, 13 repeated `max-w-[1540px]` containers, 20 hand-built tables, 29 native selects, 32 spinner states, and only two uses of the shared skeleton primitive. Repeated local components include `SummaryCard`, `SummaryTile`, `InfoTile`, `Info`, `EmptyState`, transaction tables, status badges, filters, and pagination blocks.

The refactor should preserve feature behavior while moving layout, color, typography, loading, empty, status, and responsive rules into a small dashboard component layer. Public home and authentication screens intentionally retain their separate brand treatment.

## Route and surface inventory

| Area                       | Routes and surfaces                                                                 | Main findings                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin reports              | `/admin/reports`                                                                    | Local statistic and empty cards; eight manually colored metrics; repeated section shells and progress bars.                                                   |
| Admin appointments         | `/admin/appointments`, detail dialogs                                               | Local filters, summary cards, table/loading/error shells, status mappings, and fixed desktop widths.                                                          |
| Customers                  | `/admin/customers`                                                                  | Repeated page header, four-card metric grid, filter panel, table, badges, and local formatting.                                                               |
| Services and categories    | `/admin/services`, `/admin/service-categories`                                      | Duplicate statistics, search/select toolbars, table shells, info tiles, statuses, and modal field styling.                                                    |
| Service histories          | admin/staff/customer history surfaces                                               | Three parallel filter/list/empty/summary implementations and repeated detail information tiles.                                                               |
| Loyalty and membership     | `/admin/loyalty`, customer detail, staff lookup, customer loyalty, membership tiers | Four summary-tile implementations, two transaction tables, repeated tier badges and progress displays; admin overview lacks global transactions and rankings. |
| Rewards and promotions     | `/admin/rewards`, `/admin/promotions`                                               | Large page-local CRUD implementations with duplicate cards, filters, statuses, confirmation states, tables, and form field wrappers.                          |
| Payments                   | `/admin/payments`, payment result routes                                            | Duplicate summary/filter/table patterns; result pages use separate status shells.                                                                             |
| Vehicles                   | `/customer/vehicles` and dialogs                                                    | Page shell and empty/loading states diverge from dashboards; repeated information tiles.                                                                      |
| Appointments               | admin/staff/customer appointment surfaces                                           | Parallel cards, lists, summaries, filters, timeline/status representations, and modal state reset patterns.                                                   |
| Profile and shared dialogs | profile/settings and cross-feature dialogs                                          | Form spacing, focus treatment, dialog information rows, and loading labels vary by feature.                                                                   |

Some route aliases currently render another feature page (`/admin/service-histories`, `/staff/service-histories`, and `/customer/service-histories`). This review does not change those routing semantics; it standardizes the components actually rendered and records the aliases as existing product behavior.

## Duplication and consistency findings

- Page shells repeat pale backgrounds, responsive padding, full-height rules, container widths, and vertical gaps with small variations.
- Statistic cards vary between `p-3`, `p-4`, and `p-5`; icon containers vary between 36 and 44 pixels; values vary in spacing, weight, and wrapping.
- Cards use a mixture of `rounded-lg`, `rounded-xl`, rings, borders, and shadows without semantic meaning.
- Neutral text is predominantly hard-coded slate classes, while success, warning, error, and decorative colors are selected independently by pages.
- Search fields, native selects, filter grids, table headers, empty rows, retry panels, and pagination controls are repeatedly authored.
- Loading treatment ranges from plain text to 32 local spinning icons, while content-shaped skeletons are rare.
- Table minimum widths prevent viewport overflow only when every caller remembers an overflow wrapper; mobile users otherwise receive dense desktop tables.
- Status colors and labels are domain-local, producing different shapes and contrast for equivalent states.
- Currency, date, number, percentage, points, and duration formatting exist in both shared and page-local helpers.

## Accessibility and responsive review

- Several selects rely on visible options without an explicit accessible name; icon-only controls are inconsistently labelled.
- Focus styling differs between native elements, shadcn primitives, and custom buttons. Error and loading messages are not consistently announced.
- Color is sometimes the only status cue. Several pale custom color combinations need a guaranteed contrast pair.
- Touch targets and icon buttons vary below the preferred 40-pixel CRM control size.
- Most tables are desktop-first. The target architecture provides semantic desktop tables and mobile record cards, keeping overflow inside a labelled region when tabular comparison is essential.
- Animations do not consistently honor reduced-motion preferences.

## Target architecture and migration rules

- Global CSS owns semantic tokens, page/container geometry, card and table utilities, focus, selection, scrollbar, and motion rules.
- Shared dashboard components own repeated structure; feature components supply data, labels, domain actions, and domain-specific content.
- A typed tone palette maps semantic and decorative variants to accessible foreground/background/border/icon combinations. Automatic assignment is deterministic by key.
- Pages use `PageShell` and `PageHeader`; grouped content uses `SectionCard`; statistics use `StatCard` in `StatsGrid`; filters use `FilterBar`, `SearchInput`, and the shared Select primitive.
- Loading states use skeletons shaped like the final content, errors provide retry actions, and empty states explain both genuinely empty datasets and filtered-zero results.
- Business logic, query invalidation, mutations, permissions, and routes remain feature-owned.

## Baseline quality gates

- Frontend tests: 13 passing across four files.
- Frontend production build: passing, with an existing main-chunk size warning.
- Frontend lint: blocked primarily by the configured LF-only Prettier rule on a CRLF worktree, plus ten substantive React/Fast Refresh findings and three warnings.
- Backend lint: passing at audit time; the backend has no existing automated test suite.

This report was created before source migration. Final implementation notes and intentional exceptions will be appended after verification.
