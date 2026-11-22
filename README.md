# Campus Connect — Roommate Finder

Find people you would actually enjoy sharing a hostel room with.

Roommate Finder helps PES University hostel students discover potential roommates through shared interests, everyday habits and personal preferences. Students decide what matters most, explore several suggestions, and choose whom to get to know.

[Open the website](https://pes-campus-connect.lushgibbon4.chatgpt.site)

## What works right now?

The first draft is published. Choose **Explore the draft** to try the questions and see suggestions featuring fictional students.

**Real PESU student sign-in is not active yet.** The connection needs registration details from the sign-in provider and a successful test with a real student. Until then, students cannot create real roommate profiles, send real connection requests or chat through this feature.

The sign-in connection is community-run; this project is not an official PES University service.

## Who is this for?

This version is for students who currently live in a PES hostel. It does not ask about rent, budgets or finding a flat outside college.

Students can choose their preferred blocks: **EB1, NBX, IT, EB2, EB3, MM, Mess Block, IH or Other**. They can consider rooms shared by **2 to 6 people**.

The app helps people find one another. It does not book rooms, confirm hostel eligibility or make official room allocations.

## How it works

1. **Sign in with PESU.** Once activated, the connection will provide the student details available with your permission, such as your name, campus, branch and semester.
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

- **PESU:** the basic student and academic details available through the sign-in connection, once activated. Missing details are not guessed. Hostel residency is currently stated by the student rather than confirmed by PESU.
- **Your answers:** the habits, interests and preferences you choose to share.
- **GitHub and LinkedIn:** optional profile links only. We do not read those profiles or use their content for matching.

The app does not keep your PESU password. Students can pause availability, block a person or report a concern. Pausing availability stops discovery and conversation access. Blocking prevents the two people from appearing to each other and stops their chat access.

The draft preview stays separate from real student records. The shortlist currently lasts for the open app session.

## Administrator access

[Open the admin page](https://pes-campus-connect.lushgibbon4.chatgpt.site/admin).

Jagrith has a separate sign-in for checking profile counts, reviewing reports and hiding or restoring profiles. Students use PESU sign-in; the administrator uses the existing owner account. Administrator access does not include reading private chats.

## What still needs finishing?

- Activate PESU sign-in and test it with an authorised student.
- Confirm which student details are returned in practice.
- Test the complete real-student journey before inviting hostel residents.
- Improve matching using feedback from students who actually become roommates.

Events, clubs and the wider campus features are paused while Roommate Finder is the priority. The earlier campus dashboard remains at [/campus](https://pes-campus-connect.lushgibbon4.chatgpt.site/campus).

## For someone working on the code

The website files are in this folder. The main Roommate Finder screens are in `app/roommates/`; the matching rules are in `lib/roommate-match.ts`.

[Setup and running instructions](docs/DEVELOPER-SETUP.md) explain the tools and commands needed to work on it. [Roommate Finder implementation notes](docs/ROOMMATE-FINDER.md) explain the current behaviour and sign-in setup.

## Keeping this project up to date

Whenever changes are made:

1. Update this README in plain English so someone new can understand what changed, what works and what is unfinished.
2. Check the affected behaviour before saving the change.
3. Save the changes in the project history and push them to its connected GitHub repository.
4. Never upload passwords, private student records, local database copies or generated working files.

**GitHub repository:** [Jagrithn/pes-campus-connect](https://github.com/Jagrithn/pes-campus-connect). This is a separate private repository for Campus Connect. It is independent of the JARVIS project. Future completed changes should be pushed here after checks.

Last updated: **23 November 2026**.
