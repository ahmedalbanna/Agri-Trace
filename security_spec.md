# Agri-Trace Security Specification

## Data Invariants
1. **Farmer Integrity**: A Farmer document must have a `name`, `location`, and be associated with a `createdBy` UID that matches the requester.
2. **Harvest Relational Safety**: Every Harvest Log must reference a valid Farmer ID.
3. **Traceability Guarantee**: An Export Batch status can only progress through defined stages: `collecting` -> `processing` -> `shipped` -> `delivered`.
4. **Immutable Origins**: The `farmerId` and `cropType` in a Harvest Log cannot be changed once the log is created.
5. **Verified Submissions**: Only verified staff (authenticated users) can create or modify records.

## Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to create a Farmer with a `createdBy` field that doesn't match the requester.
2. **Schema Poisoning**: Attempt to add a 1MB `notes` field to a Farmer document.
3. **Invalid ID Injection**: Attempt to use `.../farmers/$$invalid_id$$` as a path.
4. **Status Hijacking**: Attempt to create a Harvest Log already marked as `paid`.
5. **Orphaned Harvest**: Attempt to create a Harvest Log without a `farmerId`.
6. **Immutable Field Attack**: Attempt to update the `farmerId` of an existing Harvest Log.
7. **Privilege Escalation**: Attempt to read the entire `farmers` collection without being signed in.
8. **Shadow Field Injection**: Attempt to update a Farmer with an `isVerified: true` field not in schema.
9. **Timestamp Fraud**: Attempt to provide a client-side `createdAt` for a Farmer instead of using `request.time`.
10. **State Shortcut**: Attempt to change Export Batch status from `collecting` directly to `shipped`.
11. **Negative Quantity**: Attempt to log a harvest with `quantity: -50`.
12. **PII Leak**: Attempt to read sensitive farmer details (phone) as a non-authenticated user. (Standard in this app as staff-only).

## Test Runner (Conceptual)
All payloads above MUST return `PERMISSION_DENIED`.
