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

![bg opacity](./assets/gradient.jpg)

# <!--fit--> Tracking Nixpkgs Pull Requests

When is the fix available?
A 5-Minute Guide to Tracking Nixpkgs PRs!

<!--
You saw that a PR with a fix being made available to Nixpkgs. It’s approved! It’s merged! But when you run nix flake update, your changes are nowhere to be found. Where did they go?

Using the real-world example of PR #451386 (Ruby patches for GCC 15), I’ll show you how to navigate the "Staging" labyrinth. We’ll decode the CONTRIBUTING.md guidelines, learn why some PRs take the "slow lane," and master the PR Tracker to see exactly when your code hits the notable branches.
-->

---

![Marp bg 60%](https://raw.githubusercontent.com/marp-team/marp/master/marp.png)

---

<!-- _backgroundColor: "#123" -->
<!-- _color: "#fff" -->

##### <!--fit--> [Marp CLI](https://github.com/marp-team/marp-cli) + [GitHub Pages](https://github.com/pages) | [Netlify](https://www.netlify.com/) | [Vercel](https://vercel.com/)

##### <!--fit--> 👉 The easiest way to host<br />your Marp deck on the web

---

![bg right 60%](https://icongr.am/octicons/mark-github.svg)

## **[GitHub Pages](https://github.com/pages)**

#### Ready to write & host your deck!

[![Use this as template h:1.5em](https://img.shields.io/badge/-Use%20this%20as%20template-brightgreen?style=for-the-badge&logo=github)](https://github.com/yhatt/marp-cli-example/generate)

---

![bg right 60%](https://icongr.am/simple/netlify.svg?colored)

## **[Netlify](https://www.netlify.com/)**

#### Ready to write & host your deck!

[![Deploy to Netlify h:1.5em](./assets/netlify-deploy-button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yhatt/marp-cli-example)

---

![bg right 60%](https://icongr.am/simple/zeit.svg)

## **[Vercel](https://vercel.com/)**

#### Ready to write & host your deck!

[![Deploy to Vercel h:1.5em](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/yhatt/marp-cli-example)

---

### <!--fit--> :ok_hand:

---

![bg 40% opacity blur](https://avatars1.githubusercontent.com/u/3993388?v=4)

### Created by Yuki Hattori ([@yhatt](https://github.com/yhatt))

https://github.com/yhatt/marp-cli-example
