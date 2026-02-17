---
marp: true
lang: en-US
title: "Demystifying the Nix Store"
description: "The Giant Immutable LEGO Set: Demystifying the Nix Store"
theme: uncover
transition: fade
footer: "Leonard Sheng Sheng Lee | Demystifying the Nix Store | PlanetNix 2026 • SCALE 23x"
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

/* Pagination "X / Y", from neobeam. */
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

## <!--fit--> Demystifying the Nix Store

<!-- markdownlint-disable MD026 -->

The Giant Immutable LEGO® Set

<!--
Ever looked inside /nix/store and felt immediate confusion? You aren't alone. For many, the "magic" of Nix is hidden behind cryptic hashes and the mysterious "derivation." This talk strips away the jargon to explain how Nix actually works using a simple metaphor: a giant, immutable LEGO set. We'll explore how Nix builds software in total isolation, why your system can't "break" like traditional distros, and how every package is just a recipe waiting to be snapped into place.

"LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this site/presentation."
-->

---

## Have You Ever Looked Inside `/nix/store`?

```bash
/nix/store/d9di9cna6c8k8szfcl3p4sgrkkscjc2s-nix-nss...
/nix/store/k7zgvzp2r31zkg9xqgjim7mbknryv6bs-glibc-2...
/nix/store/1gf2flfqnpqbr1b4p4qz2f72y42bs56r-gcc-11....
```

<!--
Start with something familiar but confusing. These cryptic paths are what many users see first and immediately feel lost. The hashes look random, the structure seems opaque.
-->

---

## The Immediate Reaction

- **What are these hashes?**
- **Why is everything immutable?**
- **Where's my `/usr/bin`?**
- **How does anything even work?**

<!--
These are the common questions newcomers have. Traditional package managers hide complexity behind familiar directories like /usr/bin. Nix does the opposite. It shows you everything, but at first glance it seems like chaos.
-->

---

## Today's Journey

1. Understanding the "Magic" of Nix.
2. The LEGO® Metaphor.
3. Inside a Derivation.
4. How Nix Builds in Isolation.
5. Why Your System Can't Break.
6. Practical Commands and Tools.

<!--
Set expectations for the talk. We'll go from confusion to clarity using a simple metaphor that makes Nix's complexity make sense.
-->

---

## <!--fit--> Part 1: The LEGO® Metaphor

<!--
Now we introduce the key metaphor that will help everything make sense.
-->

---

## Imagine a Giant LEGO® Set

Each package is:

- A **set of LEGO® bricks**, the binaries and libraries.
- An **instruction manual**, the derivation that builds it.
- A **unique set number**, the content-addressed hash.

<!--
This is the core metaphor. Each LEGO set is self-contained, has clear instructions, and has a unique identifier. Sound familiar?
-->

---

## LEGO® Rules = Nix Rules

- ✅ Bricks snap together perfectly.
- ✅ Instructions are reproducible.
- ✅ Sets never change once built.
- ✅ You can combine sets safely.
- ❌ You can't modify a built set.

<!--
The immutability of LEGO sets maps perfectly to Nix's immutable store. Once built, you don't change them; you build new ones.
-->

---

## Traditional Package Managers

Like a **shared toy box**:

- Everything mixed together.
- Upgrading one toy might break another.
- Hard to undo changes.
- "Dependency hell."

<!--
Traditional package managers are like throwing all your LEGO bricks into one big bin. Sure, you can find pieces, but things get messy, upgrades can break existing builds, and rolling back is painful.
-->

---

# <!--fit--> Part 2: Derivations

The Instruction Manual

<!--
Now let's dive into what derivations actually are.
-->

---

## What Is a Derivation?

A **recipe** that describes:

- **Inputs**: What you need, such as dependencies.
- **Build steps**: How to build it.
- **Outputs**: What you get, including binaries and libraries.

> The LEGO® instruction booklet that came with your set.

<!--
A derivation is just a recipe. It tells Nix exactly what inputs are needed, what steps to perform, and what the final output should look like.
-->

---

## The `.drv` Derivation File

```bash
$ nix derivation show nixpkgs#hello
{
  "/nix/store/abc123...hello.drv": {
    "outputs": {
      "out": "/nix/store/xyz789...hello"
    },
    "inputSrcs": [...],
    "inputDrvs": {
      "/nix/store/def456...stdenv.drv": ["out"]
    }
  }
}
```

<!--
This is what a derivation looks like in practice. It's a JSON-like structure that describes all the metadata Nix needs to build the package.
-->

---

## The Store Path Structure

```
/nix/store/[hash]-[name]-[version]
           └─────┬─────┘
          Unique identifier
          (based on all inputs)
```

**Example**:

```
/nix/store/d9di9cna6c8k8szfcl3p4sgrkkscjc2s-nix-nss-cacert-2.3.18
```

<!--
The hash isn't random. It's deterministic! It's computed from all the inputs, the build recipe, and even the compiler version. Change anything, and you get a different hash.
-->

---

## Why Hashes Matter

- **Reproducibility**: Same inputs = same hash.
- **Caching**: Already built? Reuse it!
- **Isolation**: Different versions coexist peacefully.
- **Atomic upgrades**: New hash = new path.

<!--
Hashes are the secret sauce. They enable all of Nix's superpowers: reproducibility, caching, isolation, and safe upgrades.
-->

---

# <!--fit--> Part 3: Building in Isolation

The Sandbox

<!--
Now let's explore how Nix builds packages in complete isolation.
-->

---

## Total Isolation

During a build, Nix:

- ❌ No network access in most cases.
- ❌ No access to `/usr`, `/bin`, etc.
- ❌ No environment variables leak in.
- ✅ Only declared dependencies available.

**Result**: Reproducible builds!

<!--
This is crucial. Nix builds happen in a sandbox where the only things available are what you explicitly declared. No hidden dependencies, no accidental reliance on system packages.
-->

---

## The Build Sandbox

```bash
$ nix-build '<nixpkgs>' -A hello --check
building '/nix/store/...-hello.drv'...
unpacking sources...
patching sources...
configuring...
building...
installing...
```

<!--
Every build happens in a clean room. Nix sets up the environment from scratch every time, ensuring consistency.
-->

---

## How It Works

1. **Read the derivation**, the `.drv` file.
2. **Gather all inputs**, including dependencies.
3. **Create isolated environment.**
4. **Run build steps.**
5. **Store output** at the computed path.

<!--
This is the build process in a nutshell. Everything is deterministic and traceable.
-->

---

## <!--fit--> Part 4: Why Your System Can't Break

<!--
Let's talk about the killer feature: system stability.
-->

---

## Immutable Store

- Once built, **never changes**.
- Upgrades create **new paths**.
- Old versions remain until garbage collected.
- Rollbacks are just **switching symlinks**.

<!--
This is why Nix systems are so stable. You're never modifying existing working software. Instead, you're always creating new versions alongside the old ones.
-->

---

## Example: Upgrading Python

```bash
Before: /nix/store/aaa-python-3.10/bin/python
After:  /nix/store/bbb-python-3.11/bin/python
```

**Both exist simultaneously!**

Your programs use whatever version they need.

<!--
Multiple versions coexist peacefully. Program A can use Python 3.10 while Program B uses Python 3.11. No conflicts.
-->

---

## Atomic Operations

```console
$ nix-env --install firefox
...
$ nix-env --rollback  # Instant undo!
```

**What just happened?**

- Symlink updated: `/nix/var/nix/profiles/default`.
- Old generation still exists.
- Rollback = Point to previous generation.

<!--
Operations are atomic. Either they complete fully or they don't happen at all. And rolling back is just changing which generation your profile points to.
-->

---

## <!--fit--> Part 5: The SQLite Database

Tracking Everything

<!--
Let's look at how Nix tracks all of this internally.
-->

---

## Nix Database

Located at: `/nix/var/nix/db/db.sqlite`

**Tracks**:

- Every store path.
- Derivation metadata.
- Dependencies and references.
- Garbage collection roots.
- Validity of store paths.

<!--
Nix uses SQLite to track the lifecycle of every single package in your store. This is how it knows what depends on what, what can be safely deleted, etc.
-->

---

## Querying the Database

```bash
$ nix-store --query --references /nix/store/...-hello
/nix/store/...-glibc-2.35
/nix/store/...-gcc-11.3.0-lib

$ nix-store --query --referrers /nix/store/...-glibc
/nix/store/...-hello
/nix/store/...-bash
/nix/store/...-coreutils
```

<!--
You can query the database directly to understand dependencies. What does this package need? What needs this package?
-->

---

## Garbage Collection

```bash
$ nix-collect-garbage --delete-older-than 30d
```

**What happens?**

1. Find all roots, such as active profiles.
2. Trace all references from roots.
3. Delete unreachable store paths.
4. Update SQLite database.

<!--
Garbage collection is safe because Nix knows exactly what's in use and what's not. It traces from roots like your active profiles and running programs, then only deletes what's unreachable.
-->

---

## <!--fit--> Part 6: Practical Commands

Getting Hands-On

<!--
Now let's look at practical commands you can use to explore the Nix store.
-->

---

## Show a Derivation

```console
$ nix derivation show nixpkgs#hello
...
$ nix show-derivation /nix/store/...-hello.drv
```

**See**:

- All inputs and dependencies.
- Environment variables.
- Build commands.
- Output paths.

<!--
These commands let you inspect the actual derivation files and understand exactly how a package is built.
-->

---

## Find Store Paths

```bash
$ nix-store --query --outputs $(nix-instantiate '<nixpkgs>' -A hello)
/nix/store/...-hello-2.12.1

$ nix eval nixpkgs#hello.outPath
"/nix/store/...-hello-2.12.1"
```

<!--
Multiple ways to find where a package lives in the store.
-->

---

## Dependency Analysis

```bash
$ nix why-depends nixpkgs#hello nixpkgs#glibc
/nix/store/...-hello
└───bin/hello: …→/nix/store/...-glibc/lib/ld-linux-x86-64.so.2
```

**Trace the dependency chain!**

<!--
This is incredibly powerful for understanding why a particular dependency exists. It shows you the exact reference chain.
-->

---

## Using `jq` for Analysis

```bash
$ nix derivation show nixpkgs#hello | jq '.[] | .inputDrvs'
{
  "/nix/store/...-stdenv.drv": ["out"],
  "/nix/store/...-bash.drv": ["out"]
}
```

Parse derivations programmatically.

<!--
Since derivations are JSON, you can use jq to parse and analyze them programmatically. Great for automation and scripting.
-->

---

## Exploring Runtime Dependencies

```bash
$ nix-store --query --tree /nix/store/...-hello
/nix/store/...-hello
├───/nix/store/...-glibc-2.35
│   └───/nix/store/...-linux-headers-5.19
└───/nix/store/...-gcc-11.3.0-lib

$ nix-store --query --graph /nix/store/...-hello | dot -Tpng > deps.png
```

<!--
Visualize the entire dependency tree. You can even generate graphs with Graphviz.
-->

---

## <!--fit--> Part 7: Flakes and Modern Nix

<!--
Let's briefly touch on modern Nix with flakes.
-->

---

## Flakes: Modern Nix

```nix
{
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";

  outputs = { self, nixpkgs }: {
    packages.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.hello;
  };
}
```

**Benefits**:

- Explicit inputs with locked versions.
- Better reproducibility.
- Easier to share and compose.

<!--
Flakes are the modern way to work with Nix. They make dependencies explicit, lock versions automatically, and make projects easier to share.
-->

---

## Flake Outputs and Derivations

```shell
nix build .#hello

nix flake show

nix flake metadata
```

**Everything is still derivations under the hood!**

<!--
Flakes are just a nicer interface. Under the hood, it's still the same derivation-based system we've been discussing.
-->

---

## Analyzing Flake Dependencies

```shell
nix why-depends .#myApp nixpkgs#openssl

nix path-info --recursive .#myApp

nix path-info --closure-size .#myApp
```

Understand your flake's dependency graph.

<!--
Same analysis tools work with flakes. You can trace dependencies, understand closure sizes, and optimize your builds.
-->

---

## <!--fit--> Part 8: Nested Paths and Closure

<!--
Let's explore closures - the complete set of dependencies.
-->

---

## The Closure

**Closure**: A package plus all its dependencies, resolved recursively.

```console
$ nix-store --query --requisites /nix/store/...-hello
/nix/store/...-hello
/nix/store/...-glibc-2.35
/nix/store/...-gcc-11.3.0-lib
/nix/store/...-linux-headers-5.19
```

This is everything needed to run the program.

<!--
The closure is the complete set of everything needed. If you copy a closure to another machine, the program will work because all dependencies are included.
-->

---

## Closure Size

```console
$ nix path-info --closure-size --human-readable nixpkgs#hello
/nix/store/...-hello  32.4M
```

**Why does "Hello World" need 32MB?**

- `glibc`: ~28MB.
- `hello`: ~4MB.

<!--
This often surprises people. Even a simple program has dependencies. But remember, glibc is shared across many programs in the store.
-->

---

## Optimizing Closures

**Techniques**:

- Remove unnecessary dependencies.
- Use `removeReferencesTo`.
- Split outputs into `bin`, `dev`, `doc`.
- Use static linking for small closures.

```nix
outputs = [ "out" "dev" "doc" ];
```

<!--
For production deployments, you can optimize closures by splitting outputs and removing unnecessary references. This reduces the deployment size.
-->

---

## <!--fit--> Part 9: Why This Matters

The Big Picture

<!--
Let's wrap up with why all of this matters in practice.
-->

---

## Benefits of the Nix Model

✅ **Reproducible**: Same inputs = Same output.
✅ **Reliable**: Rollbacks are trivial.
✅ **Isolated**: No dependency conflicts.
✅ **Declarative**: Configuration as code.
✅ **Cacheable**: Binary caches save time.

<!--
This architecture enables all of Nix's benefits. It's not magic. It's careful engineering.
-->

---

## Real-World Impact

- **Development**: Consistent environments.
- **CI/CD**: Reproducible builds.
- **Production**: Atomic deployments.
- **Multi-user**: Isolated user environments.

<!--
These benefits translate to real productivity gains in software development and operations.
-->

---

## The Trade-Offs

**Pros**:

- Extreme reliability.
- Perfect reproducibility.

**Cons**:

- Disk space from storing many versions.
- Steep learning curve.
- Different from traditional Linux.

<!--
Nothing is perfect. Nix trades disk space for reliability, and has a learning curve. But for many teams, the benefits far outweigh the costs.
-->

---

## Key Takeaways

1. **Nix Store = Giant LEGO® Set**
2. **Derivations = Instruction Manuals**
3. **Hashes = Unique Identifiers**
4. **Isolation = Reproducibility**
5. **Immutability = No Breakage**
6. **SQLite = Lifecycle Tracking**

<!--
These are the core concepts. Master these, and Nix will start to make sense.
-->

---

## Commands to Remember

```bash
# Explore
nix derivation show nixpkgs#hello
nix-store --query --tree /nix/store/...-hello
nix why-depends .#app nixpkgs#openssl

# Manage
nix-collect-garbage --delete-older-than 30d
nix-env --rollback

# Analyze
nix path-info --closure-size .#app
```

<!--
These are the practical commands you'll use day-to-day to understand and manage your Nix store.
-->

---

## Next Steps

1. **Explore your own `/nix/store`.**
2. **Read some `.drv` files.**
3. **Trace dependencies** with `why-depends`.
4. **Write your first derivation.**
5. **Join the Nix community.**

<!--
The best way to learn is by doing. Start exploring your own system and see how things connect.
-->

---

![bg opacity](../media/nix-wallpaper-nineish.webp)

## Thank You!

<!-- markdownlint-enable MD026 -->

<!-- markdownlint-disable MD036 -->

sheeeng.github.io/slides

<!-- markdownlint-enable MD036 -->

<picture>
  <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/2744_fe0f/512.webp" type="image/webp">
  <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2744_fe0f/512.gif" alt="❄" width="128" height="128">
</picture>

<!--
[15 seconds] Thanks! Slides are on GitHub. Questions? If you have any questions, feel free to find me after the talk or reach out online. Happy Nixing!
-->

<!--
LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this site/presentation.
-->
