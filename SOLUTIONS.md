# Evaluator Answer Key & Teacher's Guide (Full Edition)

This document is the absolute "Truth Source" for the **DebugQuest: Digital Escape Room** challenge. It contains every intentional flaw, its location, the pedagogical reasoning, and the exact fix.

> [!CAUTION]
> **CONFIDENTIAL:** Do not share this file with students. This is for evaluation and grading only.

---

## 📊 Phase 1: The Gateway (Login & Loading)

### 1. The Broken OTP Endpoint (7 points)
* **The Flaw:** `LoginPage.jsx` makes a POST request to `/api/users/send-otpp` (extra 'p').
* **The Fix:** Remove the extra 'p' to match the actual backend route `/api/users/send-otp`.

### 2. The Waiting Game & Puzzle (20 + 3 points)
* **The Setup:** A 4-minute artificial delay in `LoadingPage.jsx`.
* **The Puzzle:** Fibonacci sequence terms 7(13), 8(21), 9(34) -> `13-21-34`.
* **The Secret Shortcut:** Pressing 'S' twice within 500ms bypasses the timer entirely.

---

## 🖥️ Phase 2: The Command Center (Dashboard)

### 3. The Vanishing Stats (Case-Sensitivity) (New Feature 1)
* **The Flaw:** `DashboardPage.jsx` fetches data as `UserProgress` (PascalCase), but the component tries to render `statsData.user_progress` (lowercase). 
* **The Fix:** Change the mapping variable to `statsData.UserProgress`.

### 4. The Broken Theme Toggle (5 points)
* **The Flaw:** `breakMonochromeMode` toggles the `light-mode` class twice in a single call, neutralizing the effect.
* **The Fix:** Remove the redundant `document.body.classList.toggle('light-mode')` line.

### 5. The Hardcoded Chatbot (10 points)
* **The Flaw:** `handleChatSubmit` uses a local dictionary. A functional API already exists at `/api/chat`.
* **The Fix:** Replace the local dictionary logic with an `async fetch('/api/chat', ...)` call.

### 6. The Muted Read Aloud (5 points)
* **The Flaw:** The `utterance` is created, but `window.speechSynthesis.speak(utterance)` is commented out.
* **The Fix:** Uncomment the `.speak()` command.

### 7. The Evasive Button & Hidden Link (5 points)
* **The Flaw:** The "Continue" button jumps using `moveButton`. A hidden `<div>` exists at `top: -9999px`.
* **The Fix:** Either stop the `moveButton` logic or find the hidden `<div>` in DevTools and move it over the button (or click it directly).

---

## 📝 Phase 3: The Profile Breach (Feedback Form)

### 8. The Mirror World (Bidi Reversal) (New Feature 2)
* **The Flaw:** 
    1. CSS `unicode-bidi: bidi-override; direction: rtl;` reverses visual characters.
    2. JS `teamName.split().reverse()` reverses state.
    3. JS `handleSubmit` checks `if (name !== name.reverse())` (Must be a palindrome).
* **The Fix:** Remove the CSS style, remove the state reversal in `updateField`, AND delete the validation check in `handleSubmit`.

### 9. The Silk Board Progress Bar (New Feature 3)
* **The Flaw:** In `startSilkBoardUpload`, a hardcoded condition `if (next >= 99) return 99;` prevents completion.
* **The Fix:** Change the ceiling to `100` and ensure the `interval` clears at full completion.

### 10. The Admin Toggle Bubbling (New Feature 4)
* **The Flaw:** The toggle is wrapped in a `div` with an `onClick` that sets `isAdmin` to `false`. Clicking the toggle triggers `true`, but bubbling immediately triggers `false`.
* **The Fix:** Add `e.stopPropagation()` to the toggle's `onClick` or remove the parent `onClick`.

---

## 🚪 Phase 4: The Final Loop (404 & Completion)

### 11. The Konami Code Bypass (New Feature 5)
* **The Setup:** Successful submission redirects to a fake `/not-found` page instead of `/complete`.
* **The Clue:** A comment in the HTML or a console trace hint: `0x3812`.
* **The Fix:** Type `3-8-1-2` on the keyboard while on the 404 page to trigger the final redirect to the winner's podium.

---

## 📥 Evaluation Checklist for Teachers
- [ ] **Code Cleanliness:** Did they remove the "student challenge" comments?
- [ ] **Efficiency:** Did they find the 'S' shortcut or wait the full 4 minutes?
- [ ] **Depth:** Did they fix individual bugs or just "delete and rewrite"? (Deletion is valid, but fixing shows logic understanding).
- [ ] **Leaderboard:** Did they successfully implement the optional email dispatch for the final stats?
