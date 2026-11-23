# PES Campus Connect

A place for PES students to find campus events, build teams, make plans and meet potential roommates.

[Open Campus Connect](https://pes-campus-connect.lushgibbon4.chatgpt.site) · [Club portal](https://pes-campus-connect.lushgibbon4.chatgpt.site/clubs) · [Admin login](https://pes-campus-connect.lushgibbon4.chatgpt.site/admin)

## Getting started

Sign in with your PESU SRN and password. Sign-in is required before the student app opens. The server checks your credentials with PESU Academy and does not store your password. Basic academic details come from your verified student profile.

On your first visit, Roommate Finder explains how it works and asks whether you are looking for a roommate. Choose **Not right now** to skip setup and keep your profile out of recommendations. You can start later from the sidebar.

## Roommate Finder

This first version is for hostel residents. Answer 12 short question cards about your hostel block, room size, interests, languages, routines and the roommate you want. Add your own short answer when the suggested choices do not fit.

You decide which topics matter most. More important topics carry more weight. Shared words and common synonyms help compare custom answers; the app cannot understand every possible phrase. Match percentages describe preference fit, not a guarantee of friendship.

Browse multiple recommendations for rooms of 2–6 people. Read profiles, keep a shortlist and send a hello. Chat opens after both people agree to connect. You can return to other recommendations, pause your availability, block someone or report a concern. GitHub and LinkedIn are optional links only; their content is not collected or scored.

## Events, teams and activities

Approved club organisers publish events, set registration questions, open or close registration, and view participant details from the separate club portal. Club members use their own PESU accounts and request approval from the administrator.

Students can create teams, invite teammates, request to join teams or activities, review requests, register for events and chat. **These workflows remain available.** Only the fictional examples have been removed.

## Administrator access

The separate **/admin** page now asks for a private administrator key. The previous named account and automatic account-based access have been removed. Student sign-in does not grant administrator access.

The administrator can approve club requests, review reports, hide or restore roommate profiles, and archive or restore event and team listings. Archiving an event also removes its teams from student browsing until the event is restored. Private chats are not shown in the admin dashboard. Admin sessions last up to six hours; signing out ends the session. Changing the configured key invalidates existing admin sessions.

The key is provided privately to the owner and is never placed in this repository, browser code or README. See [developer setup](docs/DEVELOPER-SETUP.md) for configuration and rotation.

## Latest changes

- Removed the demo switcher, fictional events, sample people, teams, requests and registrations from the live app.
- Old demo links and saved demo choices no longer activate sample data.
- Empty sections now wait for real student and organiser activity.
- Kept real team, activity, request, approval, registration and chat workflows.
- Replaced the named administrator sign-in with a separate private-key login.

## Checks and remaining work

Checks cover matching priorities, custom answers, page access, private chat, key-based admin login, session expiry, logout, key rotation and request permissions. Fictional test records live only under `scripts/fixtures`; the website does not import them.

**A successful sign-in with a real PESU student account still needs verification.** Simulated login checks and endpoint connectivity do not prove a real account has signed in. Hostel residency is self-declared. Shortlists and unfinished questionnaire answers are saved on the current device, separately for each signed-in account. Drafts resume at the saved question and do not replace your published profile.

Campus Connect is an independent student project, not an official PES University service.

Code is backed up in the separate private [pes-campus-connect repository](https://github.com/Jagrithn/pes-campus-connect). Completed changes are checked, published and pushed there. The JARVIS project is separate.

Stored test listings can now be removed through the admin dashboard, including entries created manually while testing. This keeps real student sign-ins and the team/event workflows intact.

## Roommate Finder audit fixes

The finder now has an **Edit roommate profile** button, a way to resume unfinished changes, validation on each question, and a clear recovery path when loading fails. Choosing a sixth answer no longer silently removes an earlier choice.

Matching no longer treats one shared interest out of several as a complete match. Same-class preferences check the semester as well as branch and section, equivalent campus names are recognised, and unknown smoking answers cannot pass a required non-smoking preference. Native-language characters keep their meaningful vowel marks.

Repeated hellos reuse the existing request. Declined requests are not offered again as fresh matches. Blocked profiles can be reviewed and unblocked. Messages stay private to accepted, available connections, older messages can be loaded, and drafts stay in their own conversation. Pausing availability also pauses roommate chat.

The audit added **37 targeted regression checks** alongside the existing account, matching, registration and permission checks. Run them with `npm test`. Browser checks covered all 12 question cards, custom answers, refresh recovery, profile publishing, recommendations, request acceptance, message delivery and mobile layouts. Only local fictional accounts were used for the browser checks; no demo data was added to the live app.

See [the audit findings](docs/ROOMMATE-AUDIT.md) for fixes, verification and remaining limitations.
