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
@import url('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.1.0/css/all.min.css');

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

<!--
[30 seconds] Welcome! Quick show of hands: Who has waited for a merged Nixpkgs PR that just wouldn't show up? This is a 5-minute guide to understanding why that happens and how to track it.
-->

---

## The Problem

✅ Nixpkgs PR approved and merged.
🔄 You run `nix flake update`.
❌ **Updates not available yet.**

Where did the fix go? 🤔

<!--
[30 seconds] This is the frustrating experience. You see the PR merged on GitHub, you're excited, but running nix flake update gives you nothing. The fix disappeared somewhere in the Nixpkgs pipeline.
-->

---

## Two Lanes to Production

**Fast Lane** (< 500 rebuilds):

```text
master → nixos-unstable
```

**Slow Lane** (1000+ rebuilds):

```text
staging → staging-next → master → nixos-unstable
```

<!--
[45 seconds] Think of Nixpkgs like a highway system. Small changes take the fast lane: straight from master to nixos-unstable. But large changes that rebuild thousands of packages? They take the slow lane through staging. Staging gets merged to staging-next about once per week according to CONTRIBUTING.md.
-->

---

## Why the Slow Lane?

Mass rebuilds (Go, Python, GCC):

- 5000+ packages affected.
- Days of build time.
- Risk of breakages.

**Solution:** Batch in `staging`

<!--
[30 seconds] Why separate lanes? When you update Go or Python, suddenly 5000+ packages need rebuilding. That's days of compute time on Hydra. Plus higher risk of something breaking. So Nixpkgs batches these together in staging to test them as a group.
-->

---

## PR Labels Tell the Story

Check your PR labels:

- `10.rebuild-linux: 5001+` → **staging** (slow lane)
- `10.rebuild-linux: 1-10` → **master** (fast lane)
- `1.severity: security` → backport to stable

**Labels = Your delivery route** 🏷️

<!--
[30 seconds] Here's the secret: Just look at the PR labels! The rebuild count label tells you which lane. 5001+ rebuilds? Staging. Under 500? Master. Security label means it should also get backported to stable releases. Labels are your roadmap.
-->

---

## Real Example: Go 1.25.6

**PR #480465** (Security fix)

Labels: `5001+ rebuilds` + `security`

Path: `staging` → slow lane → your system

<!--
[20 seconds] Real example: Go 1.25.6 security update. Labels show 5001+ rebuilds plus security severity. This went through staging, took the slow lane, and eventually reached users. The labels predicted this path perfectly.
-->

---

## Track Your PR

```bash
COMMIT_ID=$(gh pr view 451386 \
    --repo NixOS/nixpkgs \
    --json mergeCommit \
    | jq --raw-output '.mergeCommit.oid')

gh api \
    "repos/NixOS/nixpkgs/compare/${COMMIT_ID}...nixos-unstable" \
    --jq '.status'
```

`ahead` or `identical` = ✅ Available

<!--
[45 seconds] Don't guess, track! Use GitHub CLI to get the merge commit, then use the GitHub API to compare branches. If status returns 'ahead' or 'identical', your commit is in that branch. The docs folder has a complete tracker script you can use. Much better than randomly running nix flake update.
-->

---

## Quick Reference

| Rebuilds | Target Branch | Speed         |
| -------- | ------------- | ------------- |
| < 500    | `master`      | Fast          |
| 500-1000 | Maybe staging | Medium        |
| 1000+    | `staging`     | Slow (~weeks) |

Check: **status.nixos.org**

<!--
[20 seconds] Quick reference card. Under 500 rebuilds? Fast lane. Over 1000? Definitely staging, so be patient. Always check status.nixos.org to see current channel status and any build failures.
-->

---

## Summary

1. **Merging ≠ Availability** - PRs follow different paths.
2. **Labels** - They predict timeline.
3. **Staging ≈ Patience** - Mass rebuilds take time.
4. **Track, Don't Guess** - Use GitHub API.

<!--
[30 seconds] Four key points: One, merging doesn't mean availability. Two, labels tell you everything. Three, be patient with staging. Four, track with the API instead of guessing. That's it!
-->

---

<!-- markdownlint-disable MD026 -->

## Thank You!

<!-- markdownlint-enable MD026 -->

<!-- markdownlint-disable MD036 -->

**github.com/sheeeng/slides**

<!-- markdownlint-enable MD036 -->

Happy Nixing! ❄️

<!--
[15 seconds] Thanks! Slides and the tracker script are on GitHub. Questions? Remember: check the labels, use the tracker, and be patient with staging. Happy Nixing!
-->
