# Campus Connect — initial implementation

Approved direction: first navy/coral/cream visual concept; events dashboard, event-specific partial teams, join approvals, in-app team chat, temporary activities, club publishing. Friend discovery and capstone are V2. Roommate suggestions also deferred.

Architecture: Vinext/React on Sites Cloudflare Workers, D1 storage with schema migrations, hosted ChatGPT sign-in for the private pilot. Never collects PESU credentials. Community pesu-dev/auth validates through an undocumented university mobile API; no production integration is enabled. External identity support requires a separate deployment decision and verification.

All source authored for this project. No third-party product code copied. Starter dependencies retain their upstream licenses.

Alternatives considered: browser-only prototype lacks shared persistent state; Supabase requires separate account configuration and email setup; hosted Worker+D1 supplies persistence with existing sign-in and is used for the private pilot.

Capabilities: profile, admin-approved club requests, publisher-owned events, native basic free registration or external official link, partial team creation, requests and capacity-checked acceptances, accepted-member-only chat, capacity-checked activities, bookmarks local to device, registration listing for event owner, registration open/close, report intake and admin review, direct member invitations by app ID. Sample events are read-only and labelled; real club events persisted. Initial club access is bootstrapped by the owner-only pilot's first authenticated completed profile. Before sharing publicly, explicitly configure admin ownership and approved college identity. Profile data is not PESU-verified.

Known limits: no external university sign-in, custom forms, payments, QR check-in, live external-form counts, push notifications, block list, club multi-editor membership, or attendance integrations. Chat polls while open. On-platform team confirmation records a snapshot of accepted members; roster editing/withdrawal is not exposed yet. Hosted publication stays owner-private. Do not describe as ready for campus rollout until identity, moderation, recovery and organiser pilots are complete.
