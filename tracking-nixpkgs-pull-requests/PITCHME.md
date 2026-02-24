---
marp: true
lang: en-US
title: "Tracking Nixpkgs Pull Requests"
description: "When is the fix available? A 5-Minute Guide to Tracking Nixpkgs PRs!"
theme: uncover
transition: fade
footer: "Leonard Sheng Sheng Lee | Tracking Nixpkgs Pull Requests | PlanetNix 2026 • SCALE 23x"
paginate: true
_paginate: false
---

<!-- markdownlint-disable MD033 -->
<style>
@import url('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.1.0/css/all.min.css');

/* Use Noto Emoji font. */
/* https://github.com/orgs/marp-team/discussions/315#discussioncomment-2863387 */

@import url(https://fonts.googleapis.com/css2?family=Noto+Color+Emoji);

/* Override Uncover theme. */
section {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif, "Noto Color Emoji";
}

/* Apply to every slide. */
section {
  background-image: url('assets/nix-wallpaper-nineish.webp');
  background-size: cover; /* contain; */
  background-position: center;
  background-repeat: no-repeat;
}

footer {
  color: #000000;
  font-size: 0.5rem;
}

/* Pagination "X / Y" — from neobeam. */
section::after {
  font-size: 1rem;
  padding-right: 0.4em;
  padding-bottom: 0.4em;
  content: attr(data-marpit-pagination) ' / ' attr(data-marpit-pagination-total);
}

span[class^="nix-snowflake-"] {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  vertical-align: middle;
}

span.nix-snowflake-colours {
  background-image: url('assets/nix-snowflake-colours.svg');
}

span.nix-snowflake-rainbow {
  background-image: url('assets/nix-snowflake-rainbow.svg');
}

span.nix-snowflake-white {
  background-image: url('assets/nix-snowflake-white.svg');
}
</style>

## <!--fit--> Tracking Nixpkgs Pull Requests

<!-- markdownlint-disable MD026 -->

### When is the fix available? A 5-Minute Guide to Tracking Nixpkgs PRs!

<!--
[30 seconds] Welcome! Quick show of hands: Who has waited for a merged Nixpkgs PR that just wouldn't show up? This is a 5-minute guide to understanding why that happens and how to track it.
-->

<br/>
<picture>
  <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/512.webp" type="image/webp">
  <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/512.gif" alt="🤔" width="128" height="128">
</picture>

---

## The Problem

✅ Nixpkgs PR approved and merged.

​🔄 Run `nix flake update`.

​❌ **Updates not available yet.**

<!--
[30 seconds] This is the frustrating experience. You see the PR merged on GitHub, you're excited, but running nix flake update gives you nothing. The fix is lost somewhere in the Nixpkgs pipeline.
-->

---

## Typical Deployment Paths

**Fast Lane** (< 500 Rebuilds)

`master` ➡️ `<nix-channel>`

**Slow Lane** (1000+ Rebuilds)

`staging` 🔁 `staging-next` ↩️

↪️ `master` ➡️ `<nix-channel>`

<!--
[45 seconds] Think of Nixpkgs like a highway system. Small changes take the fast lane: straight from master to nixos-unstable. But large changes that rebuild thousands of packages? They take the slow lane through staging. Staging gets merged to staging-next about once per week according to CONTRIBUTING.md.

See [STANGING](https://github.com/NixOS/nixpkgs/blob/master/CONTRIBUTING.md#staging) documentation.
-->

---

## Why the Slow Lane?

Mass rebuilds (Go, Python, GCC)

5000+ packages affected.
Days of build time.
Risk of breakages.

**Solution:** Batch in `staging` branch.

<!--
[30 seconds] Why separate lanes? When you update Go or Python, suddenly 5000+ packages need rebuilding. That's days of compute time on Hydra. Plus higher risk of something breaking. So Nixpkgs batches these together in staging to test them as a group.
-->

---

## Labels Tell the Story

Check your PR labels:

- `10.rebuild-linux: 5001+` → **staging** (Slow Lane)
- `10.rebuild-linux: 1-10` → **master** (Fast Lane)
- `1.severity: security` → Backport to Stable

**🏷️ Labels = 📌 Pins routes on the 🗺️ Map.**

<!--
[30 seconds] Here's the secret: Just look at the PR labels! The rebuild count label tells you which lane. 5001+ rebuilds? Staging. Under 500? Master. Security label means it should also get backported to stable releases. Labels are your map.
-->

---

## Example: Go 1.25.6

**PR #[480465](https://github.com/NixOS/nixpkgs/pull/480465)** (Security Fix)

Labels:

`1.severity: security` `10.rebuild-linux: 5001+`

Path:

`staging` → (Slow Lane) → Your System

<!--
[20 seconds] Example: Go 1.25.6 security update. Labels show 5001+ rebuilds plus security severity. This went through staging, took the slow lane, and eventually reached users. The labels predicted this path perfectly.
-->

---

## Example: Ruby Backport

**PR #[451386](https://github.com/NixOS/nixpkgs/pull/451386)**

```bash
COMMIT_ID=$(gh pr view 451386 \
    --repo NixOS/nixpkgs \
    --json mergeCommit \
    | jq --raw-output '.mergeCommit.oid')

gh api \
    "repos/NixOS/nixpkgs/compare/${COMMIT_ID}...nixos-unstable" \
    --jq '.status'
```

If `ahead` or `identical`, then it's ✅ available.

<!--
[45 seconds] Don't guess, track! Use GitHub CLI to get the merge commit, then use the GitHub API to compare branches. If status returns 'ahead' or 'identical', your commit is in that branch.
-->

---

## Quick Reference

| Rebuilds | Target Branch | Speed          |
| -------- | ------------- | -------------- |
| < 500    | = `master`    | Fast           |
| 500-1000 | ⇒ `staging`   | Medium         |
| 1000+    | =`staging`    | Slow (~ Weeks) |

See status.nixos.org page.

<!--
[20 seconds] Quick reference card. Under 500 rebuilds? Fast lane. Over 1000? Definitely staging, so be patient. Always check status.nixos.org to see current channel status and any build failures.
-->

---

## Summary

1. **Merging ≠ Availability** - PRs follow different paths.
2. **Labels** - They predict timeline.
3. **Staging ≈ Patience** - Mass rebuilds take time.
4. **Track, Don't Guess** - Use Git{,Hub} commands.

<!--
[30 seconds] Four key points: One, merging doesn't mean availability. Two, labels tell you everything. Three, be patient with staging. Four, track with the commands instead of guessing. That's it!
-->

---

## Thanks!

<!-- markdownlint-enable MD026 -->

<!-- markdownlint-disable MD036 -->

sheeeng.github.io/slides

<!-- markdownlint-enable MD036 -->

<picture>
  <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/2744_fe0f/512.webp" type="image/webp">
  <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2744_fe0f/512.gif" alt="❄" width="128" height="128">
</picture>

<!--
[15 seconds] Thanks! Slides are on GitHub. Questions? Remember: check the labels, use the tracker, and be patient with staging. Happy Nixing!
-->
