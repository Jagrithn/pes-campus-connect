# Phase two — implementation scope

Preserve first navy/coral/cream UI. Profile adds optional validated HTTPS GitHub and LinkedIn links. These are user-entered links, not scraped accounts or inferred endorsements.

Capstone: dedicated one-project-at-a-time browsing, search, domain/campus filters, saved cards on device, project title/idea/needed roles/total size/commitment, real creator social links, applications, leader approval, full-team capacity enforcement, close/reopen recruitment, accepted-member chat through existing Teams. Academic eligibility and official capstone rules are not assumed.

Hostel: separate opt-in profile with self-declared hostel residency/name, interests and optional sleep schedule. Server restricts candidate directory to opted-in same-campus hostel profiles. Shared interests are explicit, case-insensitive comma-separated intersections, not compatibility scores. Suggestions do not allocate housing. Connection requests require recipient acceptance before private messages. Opt-out hides discovery and pauses conversation access for both sides; blocking does likewise. Users can unblock and report. No room numbers, email or campus identifiers in hostel discovery payloads. Public social links are optional.

Architecture stays Vinext/React + Sites identity + D1. Existing JSON record storage can represent project teams, connections, blocks and OAuth state without changing tables. Alternate proposal of another independent social profile database was rejected as unnecessary duplication.

OAuth research and deployment requirements: see PESU-AUTH-RESEARCH.md. The platform's owner-private access remains unchanged. Only an account-linking adapter is prepared; a provider-issued registered client is still required and the live consent flow is untested.
