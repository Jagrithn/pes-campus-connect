# Phase two — implementation scope

Preserve first navy/coral/cream UI. Profile adds optional validated HTTPS GitHub and LinkedIn links. These are user-entered links, not scraped accounts or inferred endorsements.

Capstone: dedicated one-project-at-a-time browsing, search, domain/campus filters, saved cards on device, project title/idea/needed roles/total size/commitment, real creator social links, applications, leader approval, full-team capacity enforcement, close/reopen recruitment, accepted-member chat through existing Teams. Academic eligibility and official capstone rules are not assumed.

Hostel: separate opt-in profile with self-declared hostel residency/name, interests and optional sleep schedule. Server restricts candidate directory to opted-in same-campus hostel profiles. Shared interests are explicit, case-insensitive comma-separated intersections, not compatibility scores. Suggestions do not allocate housing. Connection requests require recipient acceptance before private messages. Opt-out hides discovery and pauses conversation access for both sides; blocking does likewise. Users can unblock and report. No room numbers, email or campus identifiers in hostel discovery payloads. Public social links are optional.

Architecture stays Vinext/React + Sites identity + D1. Existing JSON record storage can represent project teams, connections, blocks and OAuth state without changing tables. Alternate proposal of another independent social profile database was rejected as unnecessary duplication.

OAuth research and deployment requirements: see PESU-AUTH-RESEARCH.md. The platform's owner-private access remains unchanged. Only an account-linking adapter is prepared; a provider-issued registered client is still required and the live consent flow is untested.

## Availability revision

Hostel discovery now uses one explicit “Available for a roommate” switch. No listing or public roommate request is created. Profile only asks whether the student lives in a hostel; hostel name and sleep preferences have been removed from the workflow and recommendation payload. Existing opt-in choices are retained; normal profile edits preserve availability. Recommendations require both residents to be available, at the same campus, and to share at least one declared interest. Private conversation invitations still require mutual acceptance. Unavailable residents cannot view or appear in recommendations.

Club workspace has an admin-only “Club access requests” inbox with requester name, campus, request time and approve/decline. Pending counts appear in sidebar and notification dialog. Members see their own pending/declined status; approved members can publish. Platform site access remains owner-private during the pilot, so other organisers need appropriate site access before they can submit a real request.

### Event registration usability revision
Real team-event details expose Create a team and Find a team, plus each existing team's roster count, management and submission controls. Creation accepts existing teammates' app IDs; these are invitations, requiring acceptance. Creation opens the workspace, showing the roster and submission readiness. Team leaders submit the accepted roster from the workspace. Publishing defaults to native free registration and opens the published event immediately. Samples stay explicitly non-registerable, with an entry point to publish a real club event. Add to calendar exports an ICS file; it is not account sync. PESU linking still requires provider client setup.
