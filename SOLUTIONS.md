# DebugQuest Solutions Guide

This document contains a full solve path for all levels in the current event build.

## Level 1: OTP Login
1. Enter a valid email in the username field.
2. Click Send OTP.
3. Enter OTP received by email.
4. Click Verify & Login.

## Level 2: Loading Challenge
You can clear this level by either waiting for completion or using shortcuts:
1. Shortcut path: press S twice quickly to jump ahead.
2. Puzzle path: answer the sequence puzzle using Fibonacci terms 7, 8, 9 as `13-21-34`.

## Level 3: Dashboard Chaos
1. Explore terminal and controls.
2. The monochrome toggle appears interactive but does not persist visual mode.
3. Continue button now leads to final level directly.
4. Click Continue to Final Feedback.

## Level 4: Final Feedback Level
Goal: submit feedback successfully and trigger completion.

### Known challenge mechanics
1. Phone counter increments/decrements by 2 by default.
2. Double-click the Phone Number label to toggle precision mode (step 1).
3. Email with uppercase letters is blocked unless email parser mode is unlocked.
4. Right-click the Email label to unlock parser mode.
5. DOB uses future-date picker behavior by default.
6. Double-click the DOB label to switch date control mode if needed.
7. Message accepts binary only (`0`, `1`, spaces/newlines).

### Successful submission checklist
1. Team Name filled.
2. Phone value adjusted to pass internal rule (avoid blocked endings).
3. Email valid; use lowercase unless parser mode unlocked.
4. DOB selected.
5. Message includes only binary characters.
6. Submit Final Feedback.

## Completion
1. After successful final feedback submit, leaderboard completion is recorded.
2. Completion page shows rank, time, hints remaining, and bugs discovered.
3. Use leaderboard button to view standings.

## Notes for Organizers
1. OTP email sender is configured via `MAIL_USER` and `GMAIL_PASSWORD`.
2. Feedback emails are sent to `FEEDBACK_TO` (or default configured address).
3. Feedback email includes attached team stats file with performance metrics.
