# PES Campus Connect

Your campus events, teams, conversations and roommate search in one place.

Roommate Finder helps PES University hostel students discover potential roommates through shared interests, everyday habits and personal preferences. Students decide what matters most, explore several suggestions, and choose whom to get to know.

[Open the website](https://pes-campus-connect.lushgibbon4.chatgpt.site)

## What works right now?

The original Campus Connect dashboard is the homepage again. **Events, Teams, Messages, Activities, Capstone and Club workspace are preserved.** Roommate Finder is part of the same app: select it in the navigation.

The new **[PESU Login page](https://pes-campus-connect.lushgibbon4.chatgpt.site/login)** asks for an SRN and password. Our server checks them directly with PESU Academy, then uses one student sign-in across the app. It does not need registration details from a separate sign-in provider. Passwords are not stored. Jagrith still has a separate administrator sign-in.

**Login connection fix:** the first published form used an option unsupported by the hosting service. That stopped requests before they reached PESU. The option has been corrected, and a regression check now runs the login code in the actual server runtime.

**A successful sign-in with a real student account still needs to be tested.** The connection follows PESU Academy’s mobile service, which can change without notice. Checks using simulated PESU responses pass, and the Academy endpoint is reachable; that does not prove a real student login has succeeded.

Sign-in is required before any campus page opens, including demo links. After signing in, **Try demo** uses fictional people and events, separate from real student records.

The right-side illustration has been removed. Roommate questions now appear in a centred card inside the Campus Connect layout.

This project is independent and is not an official PES University service.

## Who is this for?

This version is for students who currently live in a PES hostel. It does not ask about rent, budgets or finding a flat outside college.

Students can choose their preferred blocks: **EB1, NBX, IT, EB2, EB3, MM, Mess Block, IH or Other**. They can consider rooms shared by **2 to 6 people**.

The app helps people find one another. It does not book rooms, confirm hostel eligibility or make official room allocations.

## How it works

1. **Use PESU Login.** Enter your SRN and Academy password. After successful verification, the app reads available student details such as your name, campus, branch and semester.
2. **Answer 12 short cards.** Share your interests, favourite conversations, free-time activities, languages, routine and expectations of a roommate.
3. **Choose your priorities.** Tell us what matters a little, what matters a lot and what you absolutely need.
4. **Explore several suggestions.** Read profiles, compare preferences and keep a shortlist while you browse.
5. **Send a hello.** If the other person accepts, chat privately inside the app. You can get to know several people before deciding.

Your questionnaire progress is saved on the device as you answer. You can return to edit your answers and turn your availability off.

## What are the questions like?

- What would you do with a free evening and no deadlines?
- What topic could you talk about for hours?
- What do you enjoy doing outside class?
- Do you want independent living, a friendly balance or a close friendship?
- Which languages do you speak comfortably?
- What routines and room atmosphere are you comfortable with?
- Would you prefer someone from the same class, branch, year or academic cycle?
- What boundaries would make sharing a room easier?

There is no cleanliness question. Questions about visitors, borrowing and discussing problems help students understand each other before making a decision.

## How are people matched?

**Your priorities control your suggestions.** If shared interests matter more to you than similar sleeping times, they contribute more to your score.

The app checks both directions: how well someone fits your preferences, and how well you fit theirs. A requirement marked as a must-have must be met for both people. If an essential answer is missing, the app does not assume it is a match.

Profiles show reasons for a suggestion, possible differences to discuss and how much information was available. A score describes the fit between declared answers; **it is not a promise that living together will work**.

Students must both be available and on the same campus to appear as suggestions. Choosing a room for six does not automatically create a six-person group; you can explore and connect with several candidates yourself.

## What information is used?

- **PESU:** the basic student and academic details returned after a successful sign-in. Missing details are not guessed. Hostel residency is currently stated by the student rather than confirmed by PESU.
- **Your answers:** the habits, interests and preferences you choose to share.
- **GitHub and LinkedIn:** optional profile links only. We do not read those profiles or use their content for matching.

The app does not keep your PESU password. Students can pause availability, block a person or report a concern. Pausing availability stops discovery and conversation access. Blocking prevents the two people from appearing to each other and stops their chat access.

The draft preview stays separate from real student records. The shortlist currently lasts for the open app session.

## Administrator access

[Open the admin page](https://pes-campus-connect.lushgibbon4.chatgpt.site/admin).

Jagrith has a separate sign-in for checking profile counts, reviewing reports and hiding or restoring profiles. Students use PESU sign-in; the administrator uses the existing owner account. Administrator access does not include reading private chats.

## What still needs finishing?

- Test the new login with an authorised student’s real account.
- Confirm which academic details PESU returns in practice.
- Test the full real-student journey before inviting hostel residents.
- Improve matching using feedback from students who actually become roommates.

Events and clubs remain available. New development is focused on Roommate Finder. The earlier `/campus` address also opens the campus dashboard. [/roommates](https://pes-campus-connect.lushgibbon4.chatgpt.site/roommates) opens Roommate Finder inside the main app.

## For someone working on the code

The website files are in this folder. The shared campus interface is in `app/campus-ui.tsx`. Roommate Finder is in `app/roommate-finder.tsx`, and the matching rules are in `lib/roommate-match.ts`. The PESU Login screen is in `app/login/`, with server-side verification in `lib/pesu-direct.ts`.

[Setup and running instructions](docs/DEVELOPER-SETUP.md) explain the tools and commands needed to work on it. [Roommate Finder implementation notes](docs/ROOMMATE-FINDER.md) explain the current behaviour and sign-in setup.

## Keeping this project up to date

Whenever changes are made:

1. Update this README in plain English so someone new can understand what changed, what works and what is unfinished.
2. Check the affected behaviour before saving the change.
3. Save the changes in the project history and push them to its connected GitHub repository.
4. Never upload passwords, private student records, local database copies or generated working files.

**GitHub repository:** [Jagrithn/pes-campus-connect](https://github.com/Jagrithn/pes-campus-connect). This is a separate private repository for Campus Connect. It is independent of the JARVIS project. Future completed changes should be pushed here after checks.

Last updated: **23 November 2026**.


## Latest update: sign in, then find your people

- Every student app page requires PESU sign-in. Opening a direct campus, roommate or club link first takes signed-out visitors to the matching login page.
- The login now uses the same navy, coral and cream design as Campus Connect. A small **Club login** link opens a separate organiser entrance. The administrator keeps separate owner sign-in.
- On your first visit, Roommate Finder explains how it works and asks whether you want a roommate. **Not right now** skips setup and keeps your profile out of recommendations. You can start later from the sidebar.
- The 12 centred question cards accept short custom answers as well as the suggested choices. Your selected priorities determine each topic’s weight. Shared words and a small list of known synonyms help compare custom answers; this is not a promise that every phrase has been understood. Contradictory phrases are not treated as shared interests. General “Other” answers do not earn a match.
- View several recommendations, read profiles and send a hello. Chat starts after the other person accepts. **Other recommendations** takes you straight back to browsing.
- Club management has moved out of the student sidebar into **/clubs**. Club members request approval; the owner reviews requests in **/admin**. Approved organisers can publish events, open or close registrations and view participant details. Club login uses each organiser’s own PESU credentials, not a shared club password.

The automated checks cover page access, custom-answer comparisons, saved roommate choices, owner-only club approval and private chat. A real student still needs to verify PESU sign-in; simulated login checks and endpoint connectivity alone cannot confirm it.
