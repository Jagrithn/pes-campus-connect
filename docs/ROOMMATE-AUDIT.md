# Roommate Finder audit

Completed on 23 November 2026. Scope: the student finder, matching rules, profile persistence, request and message APIs, moderation boundaries, and mobile usability.

## Higher-impact fixes

| Finding | Cause | Result after the fix |
| --- | --- | --- |
| Unknown smoking answers could pass a must-have | The atmosphere score averaged only the known answers | Missing required information cannot pass a must-have |
| Sign-in could overwrite a newer hide action or profile edit | Sign-in read a full profile and wrote the old copy back | Only trusted academic identity fields are patched; newer answers and moderation remain |
| A stale browser tab could save into another signed-in account | Mutations used whichever session cookie was current | The page sends its expected account ID and the server rejects mismatches |
| Incomplete or non-hostel profiles could be submitted directly | Publishing checked only four fields and silently disabled non-hostel profiles | Complete answers and hostel eligibility are checked before publishing |
| Chat history had a global cap and unstable ordering | All messages were loaded and trimmed together | Selected conversations have stable pages of 50 messages; older messages remain accessible |
| Required fields could be skipped until the end | Continue checked only the first yes/no choice | Each card identifies its missing answers immediately |

## Matching fixes

- A subset of a person's interests no longer receives a complete directional score. Importance still controls topic weights; the mutual score still considers both people. Block and room-size choices remain alternatives, so one common acceptable option is enough.
- Same-class checks use branch, semester and section. Missing academic data stays unknown.
- Equivalent RR and EC campus labels no longer split otherwise eligible candidates.
- Generic Other answers are unknown rather than evidence of compatibility. Required hostel/language answers ask for specifics.
- Text normalisation preserves native-language vowel marks. Free text uses conservative word overlap and explicit synonyms, not a language model.

## Setup and screen fixes

- Added a visible edit button to the embedded finder.
- Saved drafts resume on the correct card and use current trusted identity details. Broken or unrelated drafts are ignored.
- Unfinished edits no longer replace the published dashboard profile; they can be resumed separately.
- A sixth choice no longer discards an earlier selection. Wildcard choices stay exclusive, and specific answers replace Other.
- Loading errors have a retry path; storage messages distinguish saved drafts from unavailable device storage.
- Shortlists persist per account on the current device. Only currently eligible recommendations count as visible shortlist results.
- Added accessible labels, smaller-screen wrapping, usable chat controls and reduced-motion support.

## Requests, privacy and chat fixes

- Repeated connection submissions return the existing request instead of a duplicate error.
- Accept/decline inputs must be booleans; decisions update only a still-pending request.
- Declined peers are not offered as fresh recommendations.
- Blocking has a review/unblock path. Only the blocker can remove their own block.
- Moderated users can opt out without undoing the administrator's hide action.
- Match cards omit internal database owner metadata.
- Message input must be text within the stated limit; it is not silently truncated. Empty reports are rejected.
- Unsent message drafts stay with their conversation. Incoming updates and older pages merge without duplicates or lost older messages.
- Message rate limits use an atomic counter, including concurrent sends.

## Verification

- `npm test`: 37 targeted audit checks plus the existing matching, PESU-session, private-chat, administrator, club approval, real team/activity workflow and Worker login-adapter checks.
- `tsc --noEmit`: type checks.
- Production build before publication.
- Browser checks with local synthetic accounts: all 12 cards, a custom topic, personal priorities, refresh/resume, publishing, multiple recommendations, connection acceptance, sending and receiving chat, draft preservation and editing. Mobile layout checked at 390 × 844 with no page-level horizontal overflow.
- Test fixtures and the local QA sign-in helper are not imported by or deployed as routes in the live app.

## Remaining limitations

- Real PESU credential verification was not repeated during this audit. The Academy service is external and can change; the login adapter is tested with fixture responses in the actual Worker runtime.
- Hostel residency and room eligibility are self-declared. This is a recommendation tool, not an official room allocation or booking service.
- Short free-text answers are compared conservatively. Different wording, sarcasm, multilingual transliteration and nuanced preferences can still need a conversation.
- College focus, borrowing boundaries and communication style are profile conversation starters; they do not independently add weight to the nine-topic score.
- Availability controls discovery and roommate chat access. Pausing hides connections and messages until both people are available again.
- Messages refresh periodically rather than using instant push delivery. Match calculation still scans stored roommate profiles; larger-scale performance testing remains future work.
- No audit can prove the absence of every possible bug. This report records the cases reproduced, fixed and checked.
