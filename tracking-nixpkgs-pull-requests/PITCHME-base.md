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
<!-- markdownlint-enable MD033 -->

![bg opacity](assets/nix-wallpaper-nineish.webp)

# <!--fit--> Tracking Nixpkgs Pull Requests

When is the fix available?
A 5-Minute Guide to Tracking Nixpkgs PRs!

<!--
You saw that a PR with a fix being made available to Nixpkgs. It’s approved! It’s merged! But when you run nix flake update, your changes are nowhere to be found. Where did they go?

Using the real-world example of PR #451386 (Ruby patches for GCC 15), I’ll show you how to navigate the "Staging" labyrinth. We’ll decode the CONTRIBUTING.md guidelines, learn why some PRs take the "slow lane," and master the PR Tracker to see exactly when your code hits the notable branches.
-->

---

---
