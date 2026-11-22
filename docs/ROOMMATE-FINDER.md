# Login transport correction — 23 November 2026

The first direct-login release used redirect:error in both login and profile fetches. Cloudflare Workers rejects that mode during Request construction, before network I/O. It surfaced as the generic Could not reach PESU Academy error. Production logs showed POST /api/auth/pesu returning 503 in 611 ms. A real-workerd regression reproduced the exact 503 with zero upstream requests.

Both calls now use redirect:manual. Existing non-OK status checks reject 3xx without following Location, so passwords and bearer tokens are not forwarded to another host. scripts/test-pesu-worker-runtime.mjs runs the actual production adapter in Miniflare/workerd at the deployed compatibility date, constructs real Worker Request objects around fixture responses, and checks success, rejection and redirect refusal. The earlier Node-only tests did not expose this runtime incompatibility.

An owner-only GET /api/roommate-admin?check=pesu sends an empty username/password to Academy to check transport without accessing or guessing any student account. It returns status only, never the upstream response body, cookies or credentials. A 401 on this probe means the server reached PESU and PESU rejected the deliberately empty credentials; it does not prove a successful student login.

Cloudflare reference: https://developers.cloudflare.com/workers/runtime-apis/request/ .

# Integrated Roommate Finder update — 23 November 2026

This update supersedes the earlier first-draft routing and OAuth requirements below.

## Current app structure
The original Campus Connect dashboard is served at / and /campus. Its navigation renders app/roommate-finder.tsx inside the existing app layout. /roommates redirects to /?section=roommates. The illustration and questionnaire-side copy are removed; cards are centred. The root-level demo forces Roommate Finder into its fictional preview too, so demo actions cannot accidentally write real roommate data.

## Current student login
/login is the PESU Login form with SRN and password. POST /api/auth/pesu validates input and origin, applies per-account and per-client attempt limits, and sends multipart credentials directly to https://www.pesuacademy.com/MAcademy/mobile/mobilelogin/auth . On SUCCESS with an accessToken, it retrieves the profile from the same Academy host’s /MAcademy/mobile/dispatcher endpoint. Known protocol constants and field names are adapted from MIT-licensed pesu-dev/auth, reviewed at commit fc491f9f1e1dd8655f3567f118e343bc3043104c. Copyright and licence are retained in PESU-AUTH-LICENSE.txt. No passwords are sent to the community-hosted service.

The response must contain the submitted SRN or PRN and a successful profile marker. An opaque local session cookie is issued only after verification. Passwords, raw identifiers, provider tokens and unrelated personal details are not persisted or logged. Safe error messages never expose upstream responses. Student identity is derived from the returned profile, not editable request fields. Direct-login sessions rotate an existing cookie and expire after seven days.

Campus and roommate APIs share the same PESU session. A basic campus profile is created or refreshed from verified academic details. Routine profile edits cannot overwrite those trusted fields. The old first-profile-becomes-admin path has been removed: the separate administrator is the verified platform owner only. Existing campus data is preserved. Old ChatGPT-owned student records are not automatically merged into a new PESU account.

Legacy community OAuth callback/linking code is preserved for existing flows but is no longer a prerequisite or the student-facing login path. /api/roommate-auth/start now redirects to /login?next=/roommates.

## Validation and honest limits
The matching/API tests now also cover direct login success and failure with simulated Academy responses, trusted upstream host, credential/identifier non-retention, failed identity checks, throttling, shared campus sessions, immutable academic fields and prevention of first-student admin escalation. The Academy login endpoint answered an unauthenticated HEAD request with 405, confirming reachability only. No successful real-student password login has been observed yet. Do not call that end-to-end verified until an authorised student tests the live form.

## Earlier first-draft record (historical)

# Roommate Finder first draft — 22 November 2026

Roommate Finder is now the home page, also served at /roommates. The previous campus dashboard is preserved at /campus; its renamed Roommate Finder navigation opens the new home page. Existing events and data are not migrated or deleted.

## Student experience
PES-hostel-only onboarding uses 12 one-at-a-time cards: hostel residency, blocks and room occupancy (2–6), spare-time habits, conversation topics, interests, roommate bond, languages, routines, room atmosphere, academic circle/cycle, boundaries and priorities. No cleanliness or budget questions. Blocks: EB1, NBX, IT, EB2, EB3, MM, Mess Block, IH, Other. GitHub and LinkedIn are validated optional HTTPS links only, with no fetching or scoring.

Each student controls topic importance (0–3) and separate must-haves. Both parties’ must-haves must be fully known and met. Directional weighted preference fit is calculated over known answers; weighted coverage is shown separately. Mutual ranking uses the harmonic mean. Duplicate selections do not inflate scores. The score is declared-answer fit, not a calibrated probability of success. Matching requires both profiles available, same campus, hostel self-declaration and no block or moderation restriction. Academic class compares campus, branch, year and section; cycle is self-declared, since the provider does not expose a documented cycle field.

Students can review multiple candidates, locally shortlist, send multiple connection requests, accept/decline, and chat after acceptance. This is individual discovery for shared rooms, not group allocation or an official room booking system. Pausing availability, blocking or hiding a profile prevents discovery and conversation access. Reports go to the owner workspace. Shortlists are session-local; questionnaire drafts are stored on the device per identity until profile submission. The browser-local preview uses eight fictional profiles and never sends real connection/message writes.

## Authentication and data
New /api/roommate-auth routes implement independent PESU-backed student sessions on this already-public Site, without requiring ChatGPT login. Existing Sites identity integration and its reserved auth routes are preserved for the separate admin area. Opaque random session tokens are stored only as SHA-256 hashes in D1. Cookies are Secure, HttpOnly, SameSite=Lax; sessions expire after seven days. PKCE, state cookie, one-use expiring server state and same-origin writes are enforced. Student identity is derived from the provider response; profile submissions cannot override it. No student password, raw PRN/SRN, or provider token is retained. Name, campus, branch, semester, derived year and section are retained for the student profile; missing fields remain missing. Phone, grades, family records, hostel allocation and unrelated personal data are not fetched. Public candidate profiles do not include student identifiers or contact email.

Provider reference: https://github.com/Vision2822/pesu-oauth2 . The original community provider is used without copying its source. Required scopes: profile:basic profile:academic. A registered client must allow the exact callback:
https://pes-campus-connect.lushgibbon4.chatgpt.site/api/roommate-auth/callback
Runtime keys: PESU_OAUTH_CLIENT_ID and, if confidential, PESU_OAUTH_CLIENT_SECRET. They are not configured as of this draft. Real provider login and academic-field parsing remain unverified until an authorised student completes consent. No other app account is offered as a student-login substitute. Setup errors are explicit; preview is labelled fictional.

## Administrator
/admin uses the existing platform sign-in and server-side owner-email check against njagrith@gmail.com, confirmed from the Site owner metadata. It is not first-user-becomes-admin. Admin can inspect aggregate counts, report notes and hide/restore profiles; it does not read private messages. No shared/default admin password is introduced.

## Validation
node scripts/test-roommate-finder.mjs executes matching and API routes against in-memory SQLite via a test-only Cloudflare binding adapter, including simulated provider callback responses. Covers personal priorities, bidirectional must-haves, missing answers, duplicate-score bounds, trusted identity, origins, request acceptance, chat isolation, multiple connections, blocking, opt-out, owner moderation, PKCE/state replay and token/identifier minimisation. This is not a live provider test. TypeScript and production build are also required. Desktop and 390px-wide browser checks cover the questionnaire, match list, profile breakdown and availability.


Current onboarding: all student pages require a PESU session. First visits show an introduction and a saved yes/no search choice. Declining pauses an existing profile. Custom descriptive answers are retained (80 characters, up to five per multi-choice field) and compared using normalized text, explicit synonyms and conservative word overlap, with negation guarded. Generic Other earns no similarity. Preset eligibility and room sizes stay controlled. Club tools are separate at /clubs; approval is owner-only at /admin.
