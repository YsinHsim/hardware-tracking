# Branch-scope plan

Status: **planned, not implemented**. Tracking the gap discussed in PR #86.

## Problem

People and Verification scope by the signed-in user's `branch_id`, so a manager sees only their own branch's people and verification queue. Hardware routes do **not** scope yet:

| Route | Current behaviour |
|---|---|
| `GET /hardwares` | Lists every hardware in every branch. |
| `GET /hardwares/{id}` | Any hardware by id. |
| `GET /hardwares/{id}/edit` + `PUT` | Any hardware by id. |
| `DELETE /hardwares/{id}` | Any hardware by id. |
| `POST /hardwares` | Assign to any user in any branch (dropdown is unscoped). |
| `GET /branches` + create/edit | Any branch. |
| `GET /system-data/*` | Global. |

Effect: a manager with `hardware.edit` can edit hardware in another branch, and the create form's assigned-user dropdown lists users from every branch. Verification and People already do the right thing; hardware is the gap.

## Rule (proposed)

> Non-superadmin users are scoped to their own `users.branch_id`. Hardware is scoped via the assigned user's branch. Unassigned hardware is visible to superadmins only.

## Implementation sketch

1. Add `Hardware::scopeToBranch($query, User $user)`:
   - Superadmin → no filter.
   - Otherwise → `whereHas('assignedUser', fn ($q) => $q->where('branch_id', $user->branch_id))`.
2. Apply it in `HardwareController::index/show/edit/update/destroy`.
3. Filter the `assignedUsers` and `Branch` collections passed to `Hardwares/Create` and `Hardwares/Edit` the same way.
4. Decide a policy for **unassigned hardware** (`user_id IS NULL`):
   - Recommended: visible only to superadmins, since there's no branch to scope to.
5. Decide a policy for **Branches** and **System Data** routes. Likely:
   - Branches index: own branch only for non-superadmins (they can still see others via the dropdown if needed).
   - System data (lookup tables): keep global, they're reference data.
6. Tests per route: "manager cannot see / edit / delete other-branch hardware", "assigned-user dropdown is scoped", "unassigned hardware hidden from non-superadmins".

## Out of scope for this plan

- Multi-branch membership (a user belonging to several branches).
- Role-level scope flag (`global` vs `branch`). If we ever need a global non-superadmin role (e.g. a group auditor), add a `scope` column on `roles` then; for now branch-scoped for non-superadmins is enough.
- Row-level permissions on system data.

## When to do it

Before opening the app to non-superadmin users beyond a single branch. Until then, the gap is acceptable but should be documented in the role admin UI so the next person doesn't assume `hardware.view` means "own branch only."
