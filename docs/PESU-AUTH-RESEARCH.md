# PESU Academy integration findings — 20 November 2026

The live dashboard's public page script links to `https://github.com/Vision2822/pesu-dash` and the author `Vision2822`. Inspected source: Android repository, `PesuApiClient.kt` and `PesuApiService.kt`. It submits username/password to the university's MAcademy mobile endpoint, manages CSRF/cookies and session tokens. That is a credential-proxy/session technique, not an official university OAuth contract.

The same author provides `https://github.com/Vision2822/pesu-oauth2`. Its README and implementation document OAuth Authorization Code + PKCE, granular consent, `/oauth2/authorize`, `/api/oauth2/token`, and `/api/v1/user`. Client registration is admin-controlled. No code was copied from these repositories.

This version implements an account-linking adapter for that community OAuth provider, with PKCE, an HttpOnly SameSite state cookie, user-bound expiring one-use server-side state, and hashed campus identifier uniqueness. Requests only `profile:basic`. Tokens, passwords and raw campus identifiers are not retained. This is a community identity link, not university endorsement or hostel verification. It does not replace Sites' platform access gate or permit external visitors to bypass it.

To enable: obtain an OAuth client from the provider administrator with exact callback `https://pes-campus-connect.lushgibbon4.chatgpt.site/api/pesu/callback`, then set `PESU_OAUTH_CLIENT_ID` and (for confidential clients) `PESU_OAUTH_CLIENT_SECRET` via hosted runtime secrets and deploy. No client credentials are presently configured. Do not label the feature live or end-to-end verified until an authorised student completes the real consent flow. Do not paste a PESU password into this app or send it to an unreviewed third-party API.

Provider source is available, but absence of a concrete redistribution licence in the reviewed OAuth repository means no product source was copied. The separate pesu-dev/auth repository is MIT and uses another undocumented mobile API. It was reviewed as context, not integrated.
