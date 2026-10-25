# Firestore Zero-Trust Security Specification (`OctaNet Multi-Sport Predictor`)

## 1. Data Invariants & Master Source of Truth

1. **Master Gate (`/workspaces/{userId}`)**:
   - A workspace document ID `{userId}` MUST strictly equal `request.auth.uid`, match `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), and require `request.auth.token.email_verified == true`.
   - Zero PII (`email`, `phone`, `address`) is stored in any Firestore document.
   - `ownerId` and `createdAt` are immutable across all updates; `createdAt` and `updatedAt` must strictly equal `request.time`.
2. **Relational Subcollection Gate (`/workspaces/{userId}/settledMatches/{matchId}` & `/workspaces/{userId}/auditPicks/{pickId}`)**:
   - Subcollection writes and single-doc reads require parent `/workspaces/{userId}` to exist and have `get(.../workspaces/$(userId)).data.ownerId == request.auth.uid`.
   - `allow list` enforces `resource.data.ownerId == request.auth.uid && userId == request.auth.uid` without `get()`/`exists()` inside `list` (preventing O(n) read amplification while blocking cross-tenant scraping).
3. **Immutable Append-Only Training Records (`settledMatches`)**:
   - `settledMatches` documents are immutable once created (`allow update: if false`), preserving historical audit integrity.
4. **Action-Based Updates & Terminal State Locking (`auditPicks`)**:
   - `auditPicks` supports two explicit update actions (`SettlePickAction` and `MarkAdaptedAction`), each strictly gated by `affectedKeys().hasOnly(...)` and wrapped inside `isValidDailyAuditPickDoc(incoming())`.
   - **Terminal State Lock**: Once `existing().settlementStatus == 'adapted'`, ALL subsequent updates are rejected (`existing().settlementStatus != 'adapted'`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **DD-01 (Shadow Field Injection)**: `WorkspaceProfile` create payload with extra key `"isAdmin": true` -> **DENIED** (`hasOnly` check fails).
2. **DD-02 (Unverified Email Spoof)**: Authenticated user with `email_verified: false` attempting workspace creation -> **DENIED** (`isVerifiedUser()` fails).
3. **DD-03 (Cross-Tenant Identity Spoofing)**: User `uid_attacker` creating `/workspaces/uid_victim` or setting `ownerId: "uid_victim"` -> **DENIED** (`userId == request.auth.uid && data.ownerId == request.auth.uid` fails).
4. **DD-04 (Orphaned Subcollection Write)**: Writing `/workspaces/uid_1/auditPicks/pick_1` before `/workspaces/uid_1` exists -> **DENIED** (`hasValidParentWorkspace(userId)` fails).
5. **DD-05 (Path ID Poisoning)**: Creating `auditPicks` with 300-character or special-char ID `pick/../evil$id` -> **DENIED** (`isValidId(pickId)` fails).
6. **DD-06 (Denial-of-Wallet Oversized String)**: `scoreSummary` with 5,000 characters (`maxLength: 160`) -> **DENIED** (`data.scoreSummary.size() <= 160` fails).
7. **DD-07 (Rule Score Value Poisoning)**: Updating/creating `r1_motivation_stakes: 999` or string `"ten"` -> **DENIED** (`isValidRuleScore` `0..10` check fails).
8. **DD-08 (Update-Gap Partial Key Injection)**: Updating `auditPicks` `decimalOdds` alongside `settlementStatus` during settlement -> **DENIED** (`affectedKeys().hasOnly(['settlementStatus', 'actualOutcome', 'scoreSummary', 'updatedAt'])` fails).
9. **DD-09 (Terminal State Re-Opening)**: Attempting to modify an `auditPick` whose `existing().settlementStatus == 'adapted'` -> **DENIED** (`existing().settlementStatus != 'adapted'` fails).
10. **DD-10 (Timestamp Forgery)**: Supplying past/future client timestamp (`createdAt != request.time` or `updatedAt != request.time`) -> **DENIED**.
11. **DD-11 (Immutable History Tampering)**: Attempting `update` on `/workspaces/{userId}/settledMatches/{matchId}` to flip `outcomeWon` from `0` to `1` -> **DENIED** (`allow update: if false`).
12. **DD-12 (Unauthorized Cross-User List Scrape)**: Authenticated `uid_attacker` listing `/workspaces/uid_victim/auditPicks` -> **DENIED** (`userId == request.auth.uid && resource.data.ownerId == request.auth.uid` fails).

---

## 3. Phase 5 Red Team Conflict Report

| Collection | Identity Spoofing | State Shortcutting / Terminal Lock | Resource / Value Poisoning | `isValid[Entity]` Wrapper on Update | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/workspaces/{userId}` | Blocked (`userId == auth.uid && ownerId == auth.uid`, immutable `ownerId`) | Bounded (`neuralBlendAlpha` `0..1`, `activeCorpusCount` `0..50000`) | All strings regex + `.size()` bounded | Present (`isValidWorkspaceProfile(incoming())` wraps update) | **PASS** |
| `/workspaces/{userId}/settledMatches/{matchId}` | Blocked (`ownerId == auth.uid`, parent workspace `get()` verified) | Append-only (`allow update: if false`) | All 8 rules `0..10`, strings `<= 120`, valid sport enum | N/A (`update` forbidden) | **PASS** |
| `/workspaces/{userId}/auditPicks/{pickId}` | Blocked (`ownerId == auth.uid`, parent workspace `get()` verified) | Terminal lock on `existing().settlementStatus != 'adapted'`; `MarkAdaptedAction` requires settled outcome `0` or `1` | All probabilities `0..1`, rules `0..10`, `scoreSummary <= 160` | Present (`isValidDailyAuditPickDoc(incoming())` wraps update) | **PASS** |
