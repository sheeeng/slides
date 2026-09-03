---
marp: true
lang: en-US
title: "Reproducible Environments: Why Docker Isn't Enough and Why Nix Might Be!"
description: "A tour of why Docker ships the artifact but not the build, and how Nix makes environments reproducible bit for bit."
theme: uncover
transition: fade
author: "Leonard Sheng Sheng Lee"
header: "[Reproducible Environments: Why Docker Isn't Enough and Why Nix Might Be!](https://sheeeng.github.io/slides/reproducible-environments-docker-vs-nix/) | [JavaZone 2026](https://2026.javazone.no/program/3db5bd92-6205-404b-8582-96cf0e7d88c6) | [Stø AS](https://stoe.no/)"
footer: "Made with [Marp](https://marp.app/) by [Leonard Sheng Sheng Lee](https://github.com/sheeeng)."
paginate: true
_paginate: false
backgroundImage: url('https://raw.githubusercontent.com/NixOS/nixos-artwork/refs/heads/master/wallpapers/nix-wallpaper-nineish.png')
keywords: nix,nixos,docker,reproducibility,flakes
math: mathjax
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

/* Fit the Uncover theme decorative quotation marks to the quoted text. */
blockquote {
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

section.comparison table {
  font-size: 1em;
  line-height: 1.2;
}
</style>

## <!--fit--> Reproducible Environments

<!-- markdownlint-disable MD026 -->

### Why Docker Isn't Enough and Why Nix Might Be!

<!--
[30 seconds]

Docker solved portability.

It did not solve reproducibility.

In this session, we look at why, and what does.
-->

<br/>
<picture>
  <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4e6/512.webp" type="image/webp">
  <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4e6/512.gif" alt="📦" width="128" height="128">
</picture>

---

## The "Works on My Machine" Contradiction

​🧑‍💻 It ran on production.

​🚚 Docker shipped the contents.

​🤔 So why does it _not_ work _now_?

<!--
[45 seconds]

We all know the line.

Docker answered it by shipping the runtime environment, so the running artifact travels with you.

That solved portability.

It did not, on its own, make the build itself reproducible.

Same recipe, different result, and that gap is the problem this talk addresses.
-->

---

## The Docker Myth

> "I have a Dockerfile, so my environment is replicable."

Portable? Potentially. (Timing, Architecture, etc.) 🤔

Reproducible? Not really. ❌

<!--
[45 seconds]

Here is the comfortable myth.

A Dockerfile feels like a reproducible specification.

But a Dockerfile is a script of imperative steps, and it runs against a changing environment: package mirrors, the network, and "latest" tags.

Portable means the image runs anywhere.

Deterministic means the same inputs always produce the same output.

Docker provides portability.

Reproducibility requires more work, and we will see how.
-->

---

## The Reality of Drift

```dockerfile
FROM node:24

RUN apt-get update && \
    apt-get install --assume-yes curl
```

​📅 `apt-get update` last month ≠ next month.

​🏷️ `node:24` is a moving target.

​🌐 An outside network dependency leaks in.

<!--
[45 seconds]

Look at three lines almost every image starts with.

"apt-get update" pulls whatever the mirror serves right now, so today's versions differ from yesterday's.

"node:24" is a tag, not a fingerprint, and it is republished upstream.

And the build layer cache quietly hides all of this.

Build this image in June and in December and you get two different machines from identical text.

That is drift.
-->

---

## <!--fit--> Docker: The Imperative Standard

<!--
[15 seconds]

So let us give Docker a fair hearing.

Docker is the imperative model, and it earned that position for good reasons.
-->

---

## How Docker Works

Each step depends on the results of the previous step.

`Layer 1` ⬅️ `Layer 2` ⬅️ `Layer 3`

Each instruction stacks a new layer.

<!--
[45 seconds]

Docker is imperative: do this, then this, then this.

Each instruction adds a layer on top of the last, and the layers cache.

That model is easy to read top to bottom and easy to teach.

It is also exactly why it drifts, because every step depends on both the previous step's output and whatever the outside world provides.
-->

---

## Docker: Strengths

​🌍 **Ubiquity.** A universal language of operations.

​🧱 **Kernel-level isolation.** Namespaces isolate processes; cgroups control resources.

​🚀 **Ubiquitous registries.** The registry is everywhere.

<!--
[60 seconds]

Docker's strengths are real.

Everyone knows it, so it is a shared language between developers and operations.

Internally, Linux namespaces give processes their own views of things such as the process tree, network interfaces, mounts, and hostnames.

Cgroups limit and account for resources such as CPU and memory.

Together, they create a practical runtime boundary without the overhead of a virtual machine.

It is strong isolation, but not an absolute security boundary: containers still share the host kernel.

And the registry ecosystem means an image can run on a laptop, in CI, and in production.

This is why Docker won, and none of that is going away.
-->

---

## Docker: Weaknesses

​🐘 **Opaque bloat.** Often a _whole OS_ to run _one_ program.

​🎲 **Mutable base.** _When_ `node:24` shifts upstream, your build _shifts_.

​🔁 **Recipe, not a fingerprint.** Dockerfile contains same steps often produce different outputs.

<!--
[45 seconds]

The weaknesses follow from the same model.

Without careful base image selection, even a simple app drags a full operating system along, which is bloat and, worse, attack surface.

The base image is mutable, so upstream changes silently rewrite your foundation.

And because the Dockerfile describes steps rather than a fingerprint of inputs, two builds of the same file can disagree.

Docker pins the artifact well.

It does not pin the build.
-->

---

## <!--fit--> Nix: The Functional Challenger

<!--
[15 seconds]

Now the challenger.

Nix comes at the same problem from the opposite direction: not "run these steps" but "compute this result."
-->

---

## The Core Idea

A package is the results of a deterministic set of inputs.

$$
\text{Output} = f(\text{Inputs})
$$

Inputs: source, dependencies, compiler, flags.

Change any input ➡️ the content hash changes.

<!--
[60 seconds]

Here is the whole idea on one slide.

Nix treats a build as a pure function.

The inputs are everything that matters: the source code, every dependency, the exact compiler, the build flags, the environment.

Nix hashes all of it into one identifier.

That hash is computed before the build runs, which is how the binary cache works: if the hash already exists upstream, Nix downloads the result instead of building it.

Same inputs, same hash, same output, every time.

Change one input by a single byte and the hash changes, so you can always see which input changed.

This is what the functional model gives you: builds you can reason about like math instead of like weather.
-->

---

## The Nix Store

All dependencies, inputs, and ouputs live at:

`/nix/store/<hash>-<name>`

​🔐 The hash is the fingerprint of every input.

​🤝 Mutually exclusive program versions available for any package.

<!--
[45 seconds]

Where do these outputs go?

Into the Nix store, each under a path stamped with that input hash.

Two consequences.

First, the path itself proves what produced it.

Second, because the hash disambiguates, many versions of the same library coexist without conflict.

No more "which OpenSSL is active."

Both versions coexist, each addressed by its own hash.
-->

---

## Nix Flakes

Offer lockfile for all external inputs:

```nix
# flake.nix

inputs.nixpkgs.url =
  "github:NixOS/nixpkgs/nixos-26.05";
```

​📌 `flake.lock` pins every input to an exact hash.

<!--
[45 seconds]

Flakes make this practical.

A flake declares your inputs, and the flake.lock pins each one to an exact Git commit hash.

Check that lockfile into the repository and your teammate, your CI runner, and you in six months all resolve the identical dependency graph.

It is the lockfile idea you know from application dependencies, raised to cover the whole toolchain.
-->

---

## <!--fit--> Head to Head

<!--
[10 seconds]

Let us put them next to each other.
-->

---

<!-- _class: comparison -->

## Docker vs. Nix

| Feature         | Docker                           | Nix                                        |
| --------------- | -------------------------------- | ------------------------------------------ |
| Model           | Imperative                       | Functional                                 |
| Primary Goal    | Build & Runtime Pseudo-Isolation | Deterministic Builds                       |
| Reproducibility | Opt-in Only: Rarely              | Absolute, Bit for Bit, per OS/Architecture |

<!--
[60 seconds]

Read this as complementary, not as a scoreboard.

Docker's model is imperative steps; Nix's is a declarative function.

Docker's primary goal is isolating a running process; Nix's is making the build itself deterministic.

Docker is reproducible only if you pin the image digest; rebuilding the same Dockerfile may produce a different result.

Nix is reproducible from the inputs, bit for bit.

The honest trade is the learning curve: Docker is approachable, Nix is steep.
-->

---

## <!--fit--> Synergistic Symbiosis

<!--
[10 seconds]

Here is the part I want you to remember.
-->

---

## Synergistic Symbiosis Strategy

​🏗️ **Build** the software with Nix.

​📦 **Package** it with Docker container images.

Nix computes the exact package. Ship it with Docker.

<!--
[45 seconds]

You do not have to choose sides.

Use Nix to build the software, because it computes the exact closure of dependencies and nothing more.

Then use Docker to package and distribute that result, because the registry and the runtime boundary are excellent.

Determinism on the way in, ubiquity on the way out.

For day-to-day use, `nix develop` gives every developer an identical shell with the same JDK, build tool, and linter. No installation instructions are needed.
-->

---

## Minimal Reproducible Docker Container Images for Free

`pkgs.dockerTools.buildImage`

Only the app and its exact dependencies.

The image will contain:

​🚫 No shell. 🚫 No package manager. 🚫 No stray CVEs.

<!--
[45 seconds]

The payoff is concrete.

Nix can emit a Docker image that contains only your application and the exact store paths it needs.

No shell, no package manager, no half of an operating system included.

That is a small, minimal image with far less attack surface, produced deterministically.
-->

---

## My Two Cents

Ship a black box to production? ➡️ **Docker.**

Guarantee dev and CI are identical? ➡️ **Nix.**

Want both? ➡️ **Build with Nix, ship with Docker.**

<!--
[45 seconds]

So the decision rule.

If your job is to hand a running black box to production, a Dockerfile is a fine and familiar answer.

If your job is to guarantee that your development machine and your CI pipeline are identical at every level, that is where Nix excels.

And on a serious project, the answer is usually both, in that order.
-->

---

## Summary

1. **Portable ≠ deterministic** ➡️ Docker ships the artifact.
2. **Output = f(Inputs)** ➡️ Nix pins the build inputs.
3. **Flakes** ➡️ Offer lockfile for the whole toolchain.
4. **Synergistic Symbiosis** ➡️ Build with Nix, ship with Docker.

<!--
[30 seconds]

Four things to remember.

Portable is not the same as deterministic; Docker gives you the first.

Nix models the build as a function of its inputs, so it gives you the second.

Flakes make that a lockfile for your whole toolchain.

And the two compose well: build with Nix, ship with Docker.
-->

---

## Thanks!

<!-- markdownlint-enable MD026 -->

<!-- markdownlint-disable MD036 -->

> "Docker packages the mess; Nix fixes the mess."

`sheeeng.github.io/slides`

![QR code for sheeeng.github.io/slides](assets/qr-slides.svg)

<!-- markdownlint-enable MD036 -->

<picture>
  <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/2744_fe0f/512.webp" type="image/webp">
  <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2744_fe0f/512.gif" alt="❄" width="128" height="128">
</picture>

<!--
[15 seconds]

Thank you!

Slides are on GitHub at that link.

Leave with the one line that sums it up: Docker packages the mess, Nix fixes the mess.

Questions?
-->
