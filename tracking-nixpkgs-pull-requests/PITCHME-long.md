---
marp: true
lang: en-US
title: Tracking Nixpkgs Pull Requests
description: When is the fix available? A 5-Minute Guide to Tracking Nixpkgs PRs!
theme: uncover
transition: fade
paginate: true
_paginate: false
---

<!-- markdownlint-disable MD033 -->
<style>
/* Apply to every slide. */
section {
  background-image: url('assets/nix-wallpaper-nineish.webp');
  background-size: cover; /* contain; */
  background-position: center;
  background-repeat: no-repeat;
}
</style>

## <!--fit--> Tracking Nixpkgs Pull Requests

When is the fix available?
A 5-Minute Guide to Tracking Nixpkgs PRs!

<!--
You saw that a PR with a fix being made available to Nixpkgs. It's approved! It's merged! But when you run nix flake update, your changes are nowhere to be found. Where did they go?

Using the real-world example of PR #451386 (Ruby patches for GCC 15), I'll show you how to navigate the "Staging" labyrinth. We'll decode the CONTRIBUTING.md guidelines, learn why some PRs take the "slow lane," and master the PR Tracker to see exactly when your code hits the notable branches.
-->

---

## The Mystery

You found a PR with the fix you need.
✅ It's approved!
✅ It's merged!

But when you run `nix flake update`...

**Nothing happens.** 🤔

Where did your fix go?

---

## Real-World Example

PR #451386: Ruby Patches for GCC 15

- Critical fix for Ruby compatibility
- Merged weeks ago
- Still not in your system

Let's solve this mystery! 🕵️

---

## The Problem: Branch Flow

Nixpkgs has **multiple branches** and **multiple channels**.

Your PR doesn't magically appear everywhere at once.

It follows a **specific path** through the system.

---

## Key Nixpkgs Branches

| Branch           | Purpose                       |
| ---------------- | ----------------------------- |
| `master`         | Main development              |
| `staging`        | Mass-rebuild changes          |
| `staging-next`   | Staging → master transition   |
| `nixos-unstable` | What most users consume       |
| `release-YY.MM`  | Stable releases (e.g., 25.11) |

---

## The "Fast Lane" vs. "Slow Lane"

**Fast Lane** (< 500 rebuilds):

```text
master → nixos-unstable
```

**Available in:** ~1-2 days

**Slow Lane** (1000+ rebuilds):

```text
staging → staging-next → master → nixos-unstable
```

**Available in:** 1-3 weeks (or more)

---

## Why Two Lanes?

**Mass rebuilds** (changing core packages like Go, Python, GCC) can:

- Rebuild 5000+ packages
- Take days of build time on Hydra
- Cause unexpected breakages

Solution: **Batch them in `staging`**

---

## The Staging Labyrinth

```text
┌─────────────────────────────────────────────┐
│              UNSTABLE FLOW                   │
│                                              │
│  staging ──► staging-next ──► master         │
│                                    │         │
│                                    ▼         │
│                            nixos-unstable    │
└─────────────────────────────────────────────┘
```

Each arrow = manual merge + Hydra builds

---

## PR Labels Tell the Story

Look at the labels on your PR:

- `10.rebuild-linux: 5001+` → Must use staging
- `10.rebuild-linux: 1-10` → Can go to master
- `1.severity: security` → Should be backported
- `backport staging-25.11` → Goes to stable too

---

## Example: Go 1.25.6 Security Update

**PR #480465**: Go 1.25.5 → 1.25.6

Labels:

- `10.rebuild-linux: 5001+`
- `1.severity: security`
- `backport staging-25.11`

Path: `staging` → `staging-next` → `master` → channels

---

## CONTRIBUTING.md Guidelines

From the official docs:

> Changes causing **1000+ rebuilds** must target `staging`

> Security fixes should be **backported** to stable releases

> `staging` is merged to `staging-next` approximately **once per week**

---

## Tracking Your PR: The Manual Way

```bash
# Get the merge commit
gh pr view 451386 --repo NixOS/nixpkgs \
  --json mergeCommit

# Check if it's in a branch
gh api "repos/NixOS/nixpkgs/compare/\
  <commit>...nixos-unstable" \
  --jq '.status'
```

Status: `ahead` or `identical` = ✅ Present

---

## Tracking Your PR: The Easy Way

Use the **Nixpkgs PR Tracker** script:

```bash
./nixpkgs-branch-tracker.sh 451386
```

Output:

```text
✅ master               (commit present)
⚠️  staging              (not yet propagated)
✅ staging-next         (commit present)
⚠️  nixos-unstable       (not yet propagated)
```

---

## The Complete Script

```bash
#!/usr/bin/env bash
# nixpkgs-branch-tracker.sh
# Usage: ./nixpkgs-branch-tracker.sh <PR_NUMBER>

MERGE_COMMIT=$(gh pr view "$1" \
  --repo NixOS/nixpkgs \
  --json mergeCommit --jq '.mergeCommit.oid')

for BRANCH in master staging nixos-unstable; do
  STATUS=$(gh api \
    "repos/NixOS/nixpkgs/compare/\
    ${MERGE_COMMIT}...${BRANCH}" \
    --jq '.status')

  [[ "$STATUS" == "ahead" ]] && echo "✅ $BRANCH"
done
```

---

## Stable Releases: The Backport Flow

For **stable releases** (e.g., NixOS 25.11):

```text
┌─────────────────────────────────────────────┐
│         STABLE FLOW (25.11)                  │
│                                              │
│  staging-25.11 ──► staging-next-25.11        │
│                           │                  │
│                           ▼                  │
│                    release-25.11             │
│                           │                  │
│                           ▼                  │
│                    nixos-25.11               │
└─────────────────────────────────────────────┘
```

---

## Automatic Backporting

GitHub Actions can auto-backport with labels:

`backport release-25.11` or `backport staging-25.11`

Creates a new PR automatically! 🤖

Example: PR #480465 → auto-created PR #480621

---

## When Will My Fix Arrive?

**Small changes** (< 500 rebuilds):

- Merged to master → 1-2 days to nixos-unstable

**Medium changes** (500-1000 rebuilds):

- May need staging → 1-2 weeks

**Large changes** (1000+ rebuilds):

- Requires staging → 2-4 weeks

**During freeze** (before release):

- Can take longer!

---

## Channel Status

Check build status: **status.nixos.org**

Shows:

- Last channel update time
- Which commit the channel is at
- Build failures blocking updates

---

## Pro Tips

1. **Check labels first** - They tell you the expected path
2. **Use the tracker script** - Don't guess, check!
3. **Watch Hydra** - Builds block channel updates
4. **Consider backports** - Stable users need fixes too
5. **Be patient** - Large rebuilds take time

---

## The Ruby GCC 15 Case

**PR #451386**: Ruby patches for GCC 15

- Rebuilds: Moderate (Ruby ecosystem)
- Path: Likely `staging` due to core toolchain
- Timeline: 2-3 weeks to nixos-unstable
- Backport: Should target current stable

---

## Key Branches Summary

| Branch           | Built by Hydra? | Purpose               |
| ---------------- | --------------- | --------------------- |
| `staging`        | ❌ No           | Collect mass rebuilds |
| `staging-next`   | ✅ Yes          | Test before master    |
| `master`         | ✅ Yes          | Main development      |
| `nixos-unstable` | ✅ Yes          | User-facing unstable  |
| `release-25.11`  | ✅ Yes          | Stable release        |

---

## Decision Tree

**Does your PR rebuild 1000+ packages?**

- Yes → Target `staging`
- No → Target `master`

**Is it a security fix?**

- Yes → Add backport label for stable

**Is it critical and small?**

- Consider `nixos-unstable-small`

---

## Common Pitfalls

❌ Expecting instant availability after merge
❌ Not checking branch labels
❌ Forgetting about Hydra build times
❌ Ignoring stable backports for security fixes
❌ Not using the PR tracker

---

## Hands-On Exercise

Try tracking a real PR:

```bash
# Install prerequisites
nix-shell -p gh jq curl

# Track a PR
./nixpkgs-branch-tracker.sh 484788

# Check commit in branch
git merge-base --is-ancestor \
  <commit> origin/nixos-unstable
```

---

## Resources

- **Nixpkgs CONTRIBUTING.md** - Official staging docs
- **status.nixos.org** - Channel build status
- **github.com/NixOS/nixpkgs** - Compare branches
- **Hydra** - hydra.nixos.org
- **NixOS Release Wiki** - Release schedules

---

## Key Takeaways

1. **PRs follow paths** - Not instant availability
2. **Labels matter** - They determine the path
3. **Staging = slow lane** - For mass rebuilds
4. **Track, don't guess** - Use automation
5. **Backports exist** - For stable releases

---

## Questions?

**Remember:**

- Mass rebuilds take time
- Use the tracker script
- Check status.nixos.org
- Read the labels
- Be patient with the process

---

## Thank You!

**Track your PRs wisely!** 🎯

Slides: github.com/sheeeng/slides
Tracker script: See docs folder

Happy Nixing! ❄️
