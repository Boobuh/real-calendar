# Security

This extension runs **inside GNOME Shell** with the same privileges as the session. Treat it like shell code, not like a sandboxed app.

- Do not open issues that include secrets (tokens, `.env`, private calendars).
- Report a vulnerability privately: GitHub **Security → Report a vulnerability** on [Boobuh/real-calendar](https://github.com/Boobuh/real-calendar), or open a security advisory.
- There is no network access in the extension by design. Do not add telemetry or remote fetches without an explicit, documented setting.
