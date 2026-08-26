# Frontend Data-Layer Architecture Review

Review baseline: 2026-06-29, before the data-layer refactor.

## Executive summary

The application already has one Axios instance and has begun adopting TanStack Query, but data ownership is inconsistent. Queries and mutations are split between feature hooks, pages, route guards, and modal components; query keys and error parsing are duplicated; the refresh interceptor can issue concurrent refreshes and replay a failed request four times; and six unused Zustand stores duplicate server state. The production build passes, while repository-wide lint is already blocked by widespread formatting/EOL failures. The production bundle also contains a roughly 1.07 MB JavaScript entry chunk.

## Findings

| Area               | Finding                                                                                                                          | Why it is problematic                                                                                        | Recommendation                                                                                           | Migration status |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------- |
| Axios              | A single instance exists, but transport, refresh orchestration, token state, and error behavior live in one module.              | The module is hard to test and refresh failure affects unrelated concerns.                                   | Split client, interceptors, request helpers, and normalized errors while retaining one instance.         | Planned          |
| Authentication     | Access token and user are persisted in localStorage although the backend already sets HTTP-only access and refresh cookies.      | A script injection can read the persisted bearer token; user data also has two owners.                       | Keep the token in memory, use cookies for reload continuity, and keep current-user server data in Query. | Planned          |
| Token refresh      | Every concurrent 401 starts its own refresh and a request can be replayed four times.                                            | This creates refresh storms, duplicated writes, race conditions, and potential loops.                        | Use one shared refresh promise, queue callers, and replay each request at most once.                     | Planned          |
| Refresh failure    | Refresh clears Zustand only; user-scoped Query caches survive.                                                                   | Data from a previous account may remain visible after session loss or account switching.                     | Clear the auth session and Query cache on refresh failure and logout.                                    | Planned          |
| Error handling     | Axios errors are parsed independently in approximately ten feature hooks; several pages use generic messages.                    | Validation, timeout, offline, cancellation, and authorization behavior is inconsistent.                      | Normalize all failures to a typed `ApiError` at the transport boundary.                                  | Planned          |
| API typing         | Several services cast `response.data.data`, define local envelope variants, or return inconsistent list shapes.                  | Contract drift is hidden from TypeScript and consumers need endpoint-specific knowledge.                     | Use shared envelopes, pagination types, typed unwrapping helpers, and domain results.                    | Planned          |
| Cancellation       | Query functions do not forward TanStack Query's AbortSignal to Axios.                                                            | Unmounted or superseded requests continue consuming network and can race newer views.                        | Accept a signal in all GET services and forward the query context signal.                                | Planned          |
| Headers/config     | `withCredentials` is repeated despite being global, and multipart content type is manually set.                                  | Configuration is duplicated and manually setting multipart can interfere with boundary generation.           | Keep credentials on the client and let Axios/browser set multipart boundaries.                           | Planned          |
| Query defaults     | Only retry=false and focus behavior are configured.                                                                              | Cache lifetime and reconnect/mount behavior vary implicitly.                                                 | Apply the agreed QueryClient defaults and retry only retryable failures once.                            | Planned          |
| Query keys         | Literal arrays and feature-exported constants are widespread. Similar resources use incompatible keys.                           | Invalidations miss related caches and duplicate requests cannot be deduplicated.                             | Introduce one typed hierarchical query-key factory.                                                      | Planned          |
| Query ownership    | Customers, staff workload, reports, promotions, payment callbacks, and appointment-form options declare queries in UI files.     | Components know transport details and logic cannot be reused or tested independently.                        | Give every GET operation a domain query hook.                                                            | Planned          |
| Mutation ownership | Customer and promotion mutations are declared in pages.                                                                          | Toasts, errors, invalidation, and optimistic behavior are duplicated.                                        | Move mutations into hooks with consistent cache policies.                                                | Planned          |
| Invalidation       | Mutations mix broad literal invalidation with narrow feature constants; reports and related domains are not always synchronized. | Some views remain stale while other mutations trigger unnecessary refetches.                                 | Centralize invalidation by domain roots and patch returned entities where safe.                          | Planned          |
| Optimistic updates | Existing mutations generally wait and invalidate; no rollback contexts exist.                                                    | Predictable toggles feel slower, but indiscriminate optimism would misrepresent server-calculated workflows. | Add rollback-capable optimism only to simple toggles/edits/deletes.                                      | Planned          |
| Duplicate requests | Appointment forms use alternate keys for vehicles, services, categories, promotions, loyalty, and rewards.                       | The same endpoint can be fetched more than once and invalidated inconsistently.                              | Reuse canonical hooks and keys with enabled options.                                                     | Planned          |
| Zustand            | Six root stores hold server collections plus loading/error state and have no consumers.                                          | They duplicate Query responsibilities, increase maintenance, and imply two sources of truth.                 | Delete them and their obsolete types; retain UI-only feature stores.                                     | Planned          |
| Auth loading       | Zustand stores request loading while mutations and queries already expose status.                                                | Loading state can become unsynchronized after overlapping work.                                              | Use Query/Mutation status and a minimal in-memory auth session store.                                    | Planned          |
| Performance        | Some services fetch all pages in parallel and the main bundle is over 1 MB.                                                      | Large datasets create fan-out requests and every route is paid for at startup.                               | Prefer server pagination and lazy-load major route pages.                                                | Planned          |
| Testing            | No frontend test runner or data-layer tests are configured.                                                                      | Refresh concurrency, rollback, and cache regressions are not protected.                                      | Add Vitest and focused transport/query tests.                                                            | Planned          |

## Existing strengths to preserve

- One configured API base URL and one Axios instance already exist.
- Most HTTP calls are already isolated in service modules; no component imports the Axios client directly.
- Most feature screens already render query loading, error, empty, and mutation-pending states.
- Feature-local Zustand stores are appropriately limited to dialog and selection state.
- TypeScript production compilation currently succeeds without explicit `any` usage in the data layer.

## Verification baseline

- `npm run build`: passes.
- `npm run lint`: fails before this refactor, predominantly on Prettier CRLF/LF differences across the repository.
- Automated frontend tests: not configured.

This report will be updated with completed migration status and final verification results after implementation.

## Final migration status

Completed:

- Introduced `src/api/client.ts`, typed request helpers, centralized `ApiError` mapping, and a single-flight refresh interceptor with one replay per request.
- Removed persisted authentication data. The backend's HTTP-only cookies now preserve reload sessions; only an optional access token is held in memory for automatic header injection.
- Made the current-user query the canonical user source and reduced Zustand authentication state to the in-memory token. Removed all six unused server-data Zustand stores and their obsolete shared store types.
- Applied the global QueryClient cache/reconnect/mount/network defaults and retryability-aware one-retry cap.
- Added a centralized hierarchical query-key factory and removed literal query keys from query and invalidation operations.
- Moved customers, staff workload, reports, promotions, payment polling, and appointment-form requests out of UI components into reusable hooks.
- Forwarded AbortSignal through query hooks and GET services, removed repeated credential/multipart headers, and centralized feature error messages.
- Added pessimistic synchronization for server-authoritative workflows plus rollback-capable optimistic updates for customer and promotion status changes.
- Added route-level lazy loading. The main production JavaScript chunk decreased from approximately 1.07 MB to approximately 551 KB; a remaining Vite warning indicates that vendor-level splitting can still be improved separately.
- Added Vitest, Testing Library hook support, Axios mocking, and 13 data-layer tests covering errors, keys, refresh concurrency, replay limits, token behavior, session cleanup, and optimistic rollback.

Final verification:

- `npm test`: 4 files and 13 tests pass.
- `npm run build`: passes.
- Targeted ESLint over the refactored API, service, store, query, hook, and routing files: passes.
- Static audit: no UI component imports the Axios client, no UI component declares `useQuery`/`useMutation`, and no query operation uses a literal query-key array.
- Repository-wide lint remains outside this migration's clean baseline because unrelated files still contain the pre-existing Prettier/EOL failures documented above.
- Installing the agreed test tooling reported five dependency audit findings (one low, one moderate, three high); no automatic audit fix was applied because dependency upgrades require separate compatibility review.
