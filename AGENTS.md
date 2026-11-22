# Working on Campus Connect / Roommate Finder

## Standing owner instructions

- Whenever making changes to this project, update README.md in plain English. Explain what a new reader needs to know: what the app does, how to use it, what changed, what works and what remains unfinished. Avoid unexplained technical terms. Put developer-specific detail in docs/DEVELOPER-SETUP.md or other docs and link to it.
- After appropriate checks pass, commit and push each completed change to this project's connected GitHub repository. This is standing user authorisation; do not repeatedly ask whether to push routine completed changes.
- The user explicitly requested a separate repository named pes-campus-connect. Its GitHub destination is https://github.com/Jagrithn/pes-campus-connect.git (private). Use the origin remote in this checkout; verify it still targets this exact repository before pushing. Never push this project into the parent JARVIS repository. Sites' source repository is separate from GitHub; do not call a Sites push a GitHub push.
- Keep the Sites source publishing workflow intact. Follow the relevant Sites instructions when changing or publishing the hosted app. Do not confuse publishing with a GitHub backup.
- Never commit secrets, raw student credentials, private student records, local databases, build output or local tool state. Check the proposed files before committing.
- Prioritise hostel-only Roommate Finder over events. GitHub and LinkedIn are profile links only, with no extraction or scoring. Student login must be PESU-only; the administrator has separate owner access.
- Students now use the direct SRN/password form at /login, verified by the server against PESU Academy. It does not require a third-party OAuth client. Do not claim successful real-student login until an authorised account test has succeeded. Preserve clear distinctions between the fictional draft preview and real student features.

- Campus Connect is the homepage. Keep Roommate Finder integrated into its navigation and layout. Do not replace the whole app with the roommate feature. The roommate illustration is removed; questionnaire cards must remain centred.

- Require a valid PESU session on every student app page before rendering content. Keep /login and /clubs/login public. Club publishing belongs at /clubs with owner-approved access; remove Club workspace from student navigation. Roommate setup starts with an introduction and explicit search choice, allows short custom answers, and preserves mutual consent before chat.
