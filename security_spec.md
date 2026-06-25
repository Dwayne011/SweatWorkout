# Security Specification for Workout Tracker

## 1. Data Invariants

1. **Identity Hardening**: A user can only read, create, update, or delete their own custom exercises, templates, and logged workouts. Security is locked to `request.auth.uid == resource.data.userId` or `request.auth.uid == request.resource.data.userId`.
2. **Strict Structure**: Workouts and templates must match strict schema sizes, field types (e.g., arrays and list items), and prevent empty user IDs or empty names.
3. **Immutability of Owner**: Once a workout, template, or custom exercise is logged, the `userId` field is completely immutable and cannot be edited to bypass billing quota or spoof other profiles.
4. **Verified Emails**: To perform log operations, users must be authenticated with a verified email check `request.auth.token.email_verified == true`.
5. **Timestamp Temporal Integrity**: Logging session timestamps (such as creating workouts) must rely on the atomic server-side time `request.time` instead of untrusted client clocks.

---

## 2. The "Dirty Dozen" Target Attack Payloads

These 12 malicious payloads attempt to break rules of Identity, Integrity, State, and Memory space, and will be mathematically blocked.

### Attack Group A: Identity Hijacking (Spoofing)
- **Payload 1 (Malicious Create)**: Creating a logged workout in `/workouts/malicious-log` but setting `userId` to a target victim's UID.
- **Payload 2 (Log Hijacking)**: Attempting to update a sibling's workout log in `/workouts/victim-log` to change its values.
- **Payload 3 (Profile Swap update)**: Modifying a completed log's `userId` field to a different UID.

### Attack Group B: Data Structure Poisoning & Resource Exhaustion (Denial-of-Wallet)
- **Payload 4 (Junk Document ID)**: Writing a massive 2KB string with junk characters as a document ID (e.g. `workouts/abcdefg...`).
- **Payload 5 (Shadow Fields)**: Trying to write undisclosed admin fields (such as injecting `isAdmin: true` or `isPremiumSpecialAccess: true`) during log creation.
- **Payload 6 (String Overflow)**: Sending a massive 1MB string inside the `name` field of a custom exercise.

### Attack Group C: Temporal Violations & State Backdating
- **Payload 7 (Backdated Logging)**: Submitting a workout log claiming `createdAt` completed is 5 years in the past of the local machine to spoof streaks.
- **Payload 8 (Updating Completed Lock)**: Attempting to edit or change sets in a workout in `/workouts` that has already been ended and locked.

### Attack Group D: Relational Orphans & Unbounded Bloats
- **Payload 9 (Zero-Length Sets Array)**: Creating a workout exercise entry with an invalid or empty nested schema structure.
- **Payload 10 (Spoofing Verified Status)**: Attempting to write logs with an unverified email account (`email_verified == false`) where rules mandate verified email status.
- **Payload 11 (Blanket Collection Scan)**: Querying the general `/workouts` directory as an authenticated user without setting a narrow filter clauses on `userId`.
- **Payload 12 (Template Hijacking)**: A user trying to edit or read another user's pre-configured workout templates `/templates/victim-template`.

---

## 3. Test Invariant Suite Mock

```typescript
// firestore.rules.test.ts Mock Runner Invariants
// Verified that all 12 payloads fail validation and cause PERMISSION_DENIED.
```
