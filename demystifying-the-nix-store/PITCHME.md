---
marp: true
lang: en-US
title: "Demystifying the Nix Store"
description: "The Giant Immutable LEGO Set: Demystifying the Nix Store"
theme: uncover
transition: fade
footer: "Leonard Sheng Sheng Lee | Stø AS | Demystifying the Nix Store | PlanetNix 2026 • SCALE 23x"
paginate: true
_paginate: false
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

/* Two-column layout. */
.columns {
  display: flex;
  gap: 2rem;
}

.columns > div {
  flex: 1;
}

/* Fit the Uncover theme decorative quotation marks to the quoted text. */
blockquote {
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1em;
  /* padding: 1em; */
}

/*
blockquote::before,
blockquote::after {
  color: rgba(32, 34, 40, 0.35);
  font-size: 3em;
  line-height: 0.5;
  width: 1em;
}

blockquote::before {
  content: "\201C";
}

blockquote::after {
  content: "\201D";
}
*/
</style>

## <!--fit--> Demystifying the Nix Store

<!-- markdownlint-disable MD026 -->

The Giant Immutable LEGO® Set

<!--
Ever looked inside /nix/store and felt immediate confusion? You aren't alone.

For many, the "magic" of Nix is hidden behind cryptic hashes and the mysterious "derivation."

This talk strips away the jargon to explain how Nix actually works using a simple metaphor: a giant, immutable LEGO set.

We'll explore how Nix builds software in total isolation, why your system can't "break" like traditional distros, and how every package is just a recipe waiting to be snapped into place.

"LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this site/presentation."
-->

<br/>
<picture>
  <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f635_200d_1f4ab/512.webp" type="image/webp">
  <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f635_200d_1f4ab/512.gif" alt="🤔" width="128" height="128">
</picture>

---

## Have You Ever Looked Inside `/nix/store`?

```bash
├── 0a5jirwm929lxp126lhsaivlcjzj56dl-nixd-2.8.2
├── k7gnyhjpdngfjv77hlh28zhrpv7gkar9-glibc-2.42-47.drv
├── 7m2c9rgvk9hnd8ngvp4c1hhl43c97jxs-gcc-15.2.0
```

<!--
Start with something familiar but confusing.

These cryptic paths are what many users see first and immediately feel lost.

The hashes look random, the structure seems opaque.
-->

---

## The Immediate Reaction

**What are these hashes?**

**Why is everything immutable?**

**Where's my `/usr/bin`?**

**How does anything even work?**

<!--
These are the common questions newcomers have.

Traditional package managers hide complexity behind familiar directories like /usr/bin.

Nix does the opposite. It shows you everything, but at first glance it seems like chaos.
-->

---

## Today's Session

Explore the LEGO® Metaphor.

Look Inside Expressions & Derivations.

Put Nix into Practice.

<!--
We'll go from confusion to clarity using a simple metaphor that makes Nix's complexity make sense.
-->

---

## Explore the LEGO® Metaphor

<img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f9f1.svg" alt="🧱" width="256" height="256">

<!--
Now we introduce the key metaphor that will help everything make sense.
-->

---

## Conventional Package Managers

Everything mixed together.

Upgrading might break.

Hard to undo changes.

Dependency hell.

<!--
Conventional package managers are like throwing all your LEGO bricks into one big bin.

Everything mixed together: packages share directories like /usr/lib, so two versions of the same library compete for one path. Nix gives every package a unique hash-based path in /nix/store.

Upgrading might break: replacing a shared dependency can silently break other packages. Nix builds in isolation, so upgrading one package never touches another's files.

Hard to undo changes: upgrades overwrite files in place with no previous state to restore. Nix tracks generations, and every old package remains in the store for instant rollback.

Dependency hell: conflicting version requirements become unresolvable when only one global version is allowed. Nix lets each package depend on its own specific versions at distinct store paths.
-->

---

## Giant LEGO® Set

_For each Nix package:_

The binaries and libraries are like a set of bricks.

The derivation that builds it is like a instruction manual.

The content-addressed hash is like a unique set number.

<!--
This is the core metaphor.

Each LEGO set is self-contained, has clear instructions, and has a unique identifier.

Sound familiar?

Manual: https://nix.dev/manual/nix/2.34/store/store-object/content-address
-->

---

## LEGO® Metaphor ≈ Nix Rules

Bricks snap together perfectly.

Instructions are reproducible.

Sets never change once built.

You can combine sets safely.

You can't modify a built set.

<!--
The immutability of LEGO sets maps perfectly to Nix's immutable store.

Once built, you don't change them; you build new ones.

The Kragle holds them together!
-->

---

## Look Inside Expressions & Derivations

<!--
Now let's understand the relationship between Nix expressions and derivations.
-->

---

## What Is a Nix Expression? (1/2)

The source code contained in a `.nix` file.

A **pure, functional language** for describing packages.

Every `.nix` file is a function that returns a value.

Expressions declare **what** to build, not **how** to run it.

<!--
A Nix expression is just declarative source code written in the Nix language.

You describe the inputs, the build steps, and the expected outputs.

Nix expressions are pure functions, meaning the same inputs always produce the same result.

This is the file you edit as a developer.

Glossary: https://nix.dev/manual/nix/2.34/glossary#gloss-nix-expression
-->

---

## What Is a Nix Expression? (2/2)

<img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f4dd.svg" alt="📝" width="256" height="256">

> **The LEGO® design sketch you draw on paper.**

---

## Expressions -> Derivations (1/2)

Nix _evaluates_ **the expression** to produce a **derivation**.

The derivation is a fully resolved build recipe with every dependency pinned to an exact store path.

<!--
This is the most important distinction in Nix.

You write expressions, which is human-friendly source code.

Then, Nix turns these expressions into full resolved, machine-readable build recipe, which is called derivations.
-->

---

## Expressions -> Derivations (2/2)

<img src="https://raw.githubusercontent.com/twitter/twemoji/gh-pages/svg/1f4da.svg" alt="📚" width="256" height="256">

> **Read the sketch, prints the instruction manual.**

---

## What Is a Derivation? (1/2)

A **recipe** that describes:

- **Inputs**: What you need, such as dependencies.
- **Build steps**: How to build it.
- **Outputs**: What you get, including binaries and libraries.

<!--
A derivation is just a recipe.

It tells Nix exactly what inputs are needed, what steps to perform, and what the final output should look like.

Glossary: https://nix.dev/manual/nix/2.34/glossary#gloss-derivation
-->

---

## What Is a Derivation? (2/2)

<img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f4d6.svg" alt="📖" width="256" height="256">

> **The LEGO® instruction booklet inside your set.**

<!--
Glossary: https://nix.dev/manual/nix/2.34/glossary#gloss-derivation
-->

---

## Example of Nix Expression

```nix
# show-utc-datetime.nix

{  pkgs ? import <nixpkgs> { }, }:
# ------------------------------------------------
pkgs.runCommand "show-utc-datetime"
  { nativeBuildInputs = [ pkgs.uutils-coreutils-noprefix ]; }
# ------------------------------------------------
  ''
    mkdir --parents $out/bin
    cat > $out/bin/show-utc-datetime <<'EOF'
    #!${pkgs.runtimeShell}
    exec ${pkgs.uutils-coreutils-noprefix}/bin/date --universal +"%Y%m%dT%H%M%SZ"
    EOF
    chmod +x $out/bin/show-utc-datetime
  ''
```

<!--
This is a real Nix expression you can build yourself.

Don't worry if it looks dense.

We will walk through it piece by piece over the next few slides.
-->

---

## Declaring Inputs (1/2)

```nix
{ pkgs ? import <nixpkgs> { }, }:
```

`pkgs` is the function argument.

`import ...` loads the entire Nix packages collection.

<!--
Every Nix file is a function.

This line says "give Nix a package set, or Nix will load nixpkgs itself."

This is how the expression knows where to find its dependencies.

It is the shopping list before you start building.
-->

---

## Declaring Inputs (2/2)

<img src="https://raw.githubusercontent.com/twitter/twemoji/gh-pages/svg/1f4da.svg" alt="📚" width="256" height="256">

> **Find the bricks you need in a LEGO® catalog.**

---

## Choosing the Builder

```nix
pkgs.runCommand "show-utc-datetime"
  { nativeBuildInputs = [ pkgs.uutils-coreutils-noprefix ]; }
```

The `runCommand` creates a simple derivation without needing a full `stdenv.mkDerivation` function.

<!--
The runCommand is the simplest way to create a derivation.

You give it a name, declare what tools you need at build time, and provide a build script.

The name you choose here is what appears after the hash in the final store path.

The `"show-utc-datetime"` becomes the package name in the store path.

The `nativeBuildInputs` lists dependencies available during the build.

NOTE: An important note, is to notice that a nix-built bash-script, which contains e.g. the output of $(date) or `cat /dev/urandom` in the script-file, would never be possible to make reproducible.

Thus, nix is not a guarantee for reproducibility, but can be thought of as a good system of guardrails to build software as reproducible as possible. - Hat tip to Christian Chavez!
-->

---

## The Build Script

```bash
  ''
    mkdir --parents $out/bin
    cat > $out/bin/show-utc-datetime <<'EOF'
    #!${pkgs.runtimeShell}
    exec ${pkgs.uutils-coreutils-noprefix}/bin/date --universal +"%Y%m%dT%H%M%SZ"
    EOF
    chmod +x $out/bin/show-utc-datetime
  ''
```

The shell script that calls `date` from the package.

<!--
This is the actual build logic.

Notice how $out is a placeholder for the final store path that Nix will compute.

The script uses absolute paths to dependencies, pointing directly into the Nix store.

No reliance on PATH or system-wide binaries.

That is total isolation in action.
-->

---

## String Interpolation

```nix
#!${pkgs.runtimeShell}
exec ${pkgs.uutils-coreutils-noprefix}/bin/date \
--universal +"%Y%m%dT%H%M%SZ"
```

After Nix evaluates above expression, it becomes:

```bash
#!/nix/store/...8s9kxnp-bash-5.3p9/bin/bash
exec /nix/store/...093gp61-uutils-coreutils-0.6.0/bin/date \
  --universal +"%Y%m%dT%H%M%SZ"
```

Every dependency is pinned to an **exact store path**.

<!--
Nix replaces the string interpolation expressions with absolute paths into the store.

The resulting script does not depend on any system PATH.

It points directly at a specific version of bash and a specific version of uutils-coreutils-noprefix.

If either dependency changes, the hash changes, and you get a completely new store path.

Glossary: https://nix.dev/manual/nix/2.34/glossary#gloss-string-interpolation

Manual: https://nix.dev/manual/nix/2.34/language/string-interpolation
-->

---

## Build The Expression (\*.nix) File

```shell
nix build --file show-utc-datetime.nix ...
```

Evaluate the expression to produce a `.drv` file.

Compute a hash from inputs.

Run the build script in an isolated sandbox.

Store the output at the computed path.

<!--
First, evaluate the expression to get the derivation.

Next, we execute a derivation (building it in the sandbox) to produce its outputs. When we run "nix build", we are producing (or more precisely, realising) the derivation by ensure the store paths are valid.

The hash in the output path is deterministic.

If we build this on another machine with the same nixpkgs version, we get the exact same hash. That is reproducibility.

Glossary: https://nix.dev/manual/nix/2.34/glossary#gloss-realise

Ensure a store path is valid. This can be achieved by:
- Fetching a pre-built store object from a substituter.
- Building the corresponding store derivation.
- Delegating to a remote machine and retrieving the outputs.

Glossary: https://nix.dev/manual/nix/2.34/glossary#gloss-derivation

Derivations are implemented as operating system processes that run in a sandbox. This sandbox by default only allows reading from store objects specified as inputs, and only allows writing to designated outputs to be captured as store objects.
-->

---

### Derivation: Build Output

```text
this derivation will be built:
  /nix/store/...gn1360z-show-utc-datetime.drv
```

Evaluate the `.nix` expression to produce a `.drv` file.

Compute the hash `...gn1360z` from all inputs.

Execute the `.drv` file as the actual build recipe.

<!--
The first thing Nix reports is which derivation it plans to build.

The .drv file is the real derivation.

Our .nix file was just the expression that produced it.

The content-addressed hash encodes every input: the build script, dependencies, system architecture, everything.

Glossary: https://nix.dev/manual/nix/2.34/glossary#gloss-content-address
-->

---

### Derivation: Build Output / Get Dependencies

```text
this path will be fetched (3.22 MiB download, 12.22 MiB unpacked):
  /nix/store/...093gp61-uutils-coreutils-0.6.0

copying path '...-uutils-coreutils-0.6.0' from 'https://cache.nixos.org'
```

The `uutils-coreutils-0.6.0` package is needed but not in the local store.

<!--
Nix checks the binary cache before building anything.

Since someone already built uutils-coreutils with the exact same hash, Nix downloads the pre-built result.

This saves enormous amounts of time.

Without the cache, it would need to compile the entire Rust codebase for uutils-coreutils from source.
-->

---

### Derivation: Build Output / Executing Build

```text
show-utc-datetime> building
  '/nix/store/...gn1360z-show-utc-datetime.drv'
```

Run the build script inside a sandbox.

Allow only declared dependencies.

Block network access and access to `/usr` or `/bin`.

Place the output at the computed store path.

<!--
Now Nix actually executes the derivation.

It runs our build script in total isolation.

The only tools available are what we declared in nativeBuildInputs variable.

This is why Nix builds are reproducible.

Nothing from the host system can leak in in the build process.
-->

---

### Derivation: Build Output / Dependency Graph

```text
┏━ Dependency Graph:
┃ ✔ show-utc-datetime
┣━━━ Builds
┗━ ∑ ⏵ 0 │ ✔ 1 │ ⏸ 0 │ Finished after 3s
```

Optional: `nix-output-monitor`

<!--
If we use nix-output-monitor tool, it gives us a clear picture of what happened.

nix build --rebuild --log-format internal-json --verbose --file show-utc-datetime.nix |& nix run nixpkgs#nix-output-monitor -- --json

The dependency graph shows that show-utc-datetime was built locally.

All dependencies including uutils-coreutils were already available in the store, so nothing needed to be downloaded.
-->

---

## The Derivation (\*.drv) File

```shell
nix derivation show --file show-utc-datetime.nix
```

```json
{
    "/nix/store/...gn1360z-show-utc-datetime.drv": {
        "outputs": {
            "out": {
                "path": "/nix/store/...v8h9rcs-show-utc-datetime"
            }
        }
    }
}
```

Map a derivation hash to a deterministic output path.

<!--
The .drv file is what Nix actually executes.

It contains the fully resolved build recipe with all store paths filled in.

The outputs section tells you exactly where the build result will land.

Both the derivation hash and the output hash are deterministic.
-->

---

### Inside the `.drv`: Builder and Arguments

```json
{
    "builder": "/nix/store/...8s9kxnp-bash-5.3p9/bin/bash",
    "args": [
        "-e",
        "/nix/store/...ic6ynpg-source-stdenv.sh",
        "/nix/store/...ny02r39-default-builder.sh"
    ]
}
```

Every path is absolute.

Nothing comes from the host system.

<!--
Even the shell that runs the build is a specific, immutable store path.

Nix does not use /bin/bash from the host. It uses its own bash, locked to a specific version.

The arguments point to stdenv setup scripts that configure the build environment before running our build command.
-->

---

### Inside the `.drv`: Input Derivations

```json
{
    "inputDrvs": {
        ".../bash-5.3p9.drv": { "outputs": ["out"] },
        ".../uutils-coreutils-0.6.0.drv": {
            "outputs": ["out"]
        },
        ".../stdenv-darwin.drv": { "outputs": ["out"] }
    }
}
```

Three input derivations must be built first.

<!--
Input derivations form the dependency graph.

Each one must be available in the store before our build can start.

Notice that stdenv is also an input even though we did not declare it explicitly.

The runCommand helper added it for us.

This is how Nix ensures complete dependency tracking.
-->

---

### Inside the `.drv`: Build Command

```json
{
  "env": {
    "buildCommand": "mkdir --parents $out/bin\n
      cat > $out/bin/show-utc-datetime <<'EOF'\n
      #!/nix/store/...8s9kxnp-bash-5.3p9/bin/bash\n
      exec /nix/store/...093gp61-uutils-coreutils-0.6.0/bin/date
        --universal +\"%Y%m%dT%H%M%SZ\"\n
      EOF\nchmod +x $out/bin/show-utc-datetime\n",
    "name": "show-utc-datetime",
    "system": "aarch64-darwin"
  }
}
```

Resolve all interpolations in the build script.

<!--
This is the fully expanded version of our build script.

Compare this to the original Nix expression.

Every Nix interpolation has been replaced with a concrete store path.

This is the script that Nix actually executes inside the sandbox.

The system field tells Nix which platform this derivation targets.
-->

---

## Examining the Output

```console
$ tree /nix/store/...v8h9rcs-show-utc-datetime
/nix/store/...v8h9rcs-show-utc-datetime
└── bin
    └── show-utc-datetime

$ cat /nix/store/...v8h9rcs-show-utc-datetime/bin/show-utc-datetime
#!/nix/store/...8s9kxnp-bash-5.3p9/bin/bash
exec /nix/store/...093gp61-uutils-coreutils-0.6.0/bin/date \
  --universal +"%Y%m%dT%H%M%SZ"
```

<!--
The output is a clean directory with a single executable.

Looking inside the script, you can see that every path is an absolute store path.

There is no ambiguity about which bash or which date command runs.

This is what makes Nix packages self-contained.
-->

---

## Running the Result

```console
$ /nix/store/...v8h9rcs-show-utc-datetime/bin/show-utc-datetime
20260223T184340Z

$ ./result/bin/show-utc-datetime
20260223T184340Z
```

Create a `./result` symlink to the store path.

<!--
The result symlink is a convenience. It points at the immutable store path.

You can copy the entire closure to another machine, and it will produce the same output. No "works on my machine" surprises.

Output a UTC timestamp in ISO 8601 compact format.

Run the script on any machine with this Nix closure.
-->

---

## Build Process in a Nutshell

1. **Evaluate the expression**, the `.nix` file.
2. **Produce the derivation**, the `.drv` file.
3. **Gather all inputs**, including dependencies.
4. **Create isolated environment.**
5. **Run build steps.**
6. **Store output** at the computed path.

<!--
This is the build process in a nutshell.

The Nix expression is evaluated to produce a derivation.

The derivation is then executed in a sandbox to produce the output.

Everything is deterministic and traceable.
-->

---

## The Store Path Structure (1/2)

```text
[hash]-[name]-[version]
└─────────┬───────────┘
    Unique Identifier
```

Example：

`1xy62wrp3m91snd3cazxgg0yrplb6sav-git-2.52.0`

<!--
Think of a store path as an opaque, unique identifier: The only way to obtain store path is by adding or building store objects. A store path will always reference exactly one store object.

Store paths are pairs of:
- A 20-byte / 32 ASCII characters digest for identification.
- A symbolic name for people to read.

The hash isn't random. It's deterministic!

It's computed from all the inputs, the build recipe, and even the compiler version.

Change anything, and you get a different hash.

Manual: Store Path: https://nix.dev/manual/nix/2.34/store/store-path

Manual: Complete Store Path Calculation: https://nix.dev/manual/nix/2.34/protocols/store-path
-->

---

## The Store Path Structure (2/2)

$$f(\text{inputs}) = \text{/nix/store/ ...}$$

```text
  /nix/store/v4bvnkm0p5x41fhybskr0cf2zvkgyrvv-cargo-1.92.0
  |--------| |------------------------------| |----------|
Store Directory            Digest                 Name

```

<!--
The store directory defaults to /nix/store, but is in principle arbitrary.

A store path is rendered to a file system path as the concatenation of:

-Store directory (typically /nix/store)
-Path separator (/)
- Digest rendered in Nix32, a variant of base-32 (20 -hash bytes become 32 ASCII characters)
-Hyphen (-)
-Name

Manual: Store Path: https://nix.dev/manual/nix/2.34/store/store-path

Manual: Complete Store Path Calculation: https://nix.dev/manual/nix/2.34/protocols/store-path

Manual: Nix32 Encoding: https://nix.dev/manual/nix/2.34/protocols/nix32
-->

---

## Why Hashes Matter

**Reproducibility**: Same inputs = same hash.

**Caching**: Already built? Reuse it!

**Isolation**: Different versions coexist peacefully.

**Atomic upgrades**: New hash = new path.

<!--
Hashes are the secret sauce. They enable all of Nix's superpowers: reproducibility, caching, isolation, and safe upgrades.
-->

---

## Immutable Store

Once built, **never changes**.

Upgrades create **new paths**.

Old versions remain until garbage collected.

Rollbacks are just **switching symlinks**.

<!--
This is why Nix systems are so stable.

You're never modifying existing working software.

Instead, you're always creating new versions alongside the old ones.
-->

---

## Example: Upgrading Python

```text
/nix/store/iki3g1iyxydm65k7hm0r3ssm8l6mvlb6-python3-3.12.8
/nix/store/8bwmgvfcyys3kfia055ih7gask3fid7s-python3-3.14.2
```

**Both exist simultaneously!**

Your programs use whatever version they need.

<!--
Multiple versions coexist peacefully.

Program A can use Python 3.12 while Program B uses Python 3.14.

No conflicts.

tree -L 1 /nix/store/ | grep 'python3-3.12'
rg --files --follow --glob "**/bin/python" /nix/store
-->

---

## Atomic Operations

```console
$ nix-env --install firefox
...
$ nix-env --rollback  # Instant undo!
```

Update symbolic link at `/nix/var/nix/profiles/default` path.

<!--
Operations are atomic.

Either they complete fully or they don't happen at all.

And rolling back is just changing which generation your profile points to.

Glossary: https://nix.dev/manual/nix/2.34/glossary#gloss-profile

A symlink to the current user environment of a user, e.g., /nix/var/nix/profiles/default.
-->

---

## Total Isolation

During a Nix build:

Block network access in most cases.

Block access to `/usr`, `/bin`, etc.

Prevent environment variable leakage.

Allow only declared dependencies.

**Result**: Reproducible builds!

<!--
This is crucial.

Nix builds happen in a sandbox where the only things available are what you explicitly declared.

No hidden dependencies, no accidental reliance on system packages.

Every build happens in a clean room. Nix sets up the environment from scratch every time, ensuring consistency.

You can verify this yourself:

nix-build '<nixpkgs>' --attr hello --check --no-out-link --no-substitute
-->

---

## Exploring Dependencies

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
You can explore the dependency graph to understand what each package needs.

What does this package reference? What references this package?

# Run on macOS system.

nix-store --query --references "$(nix-build '<nixpkgs>' --attr hello --no-out-link)"

/nix/store/...5rjcqb2-libiconv-109.100.2

# TODO: Run on Linux system.
-->

---

## Closure (1/2)

A package with all its dependencies, resolved recursively.

```console
$ nix-store --query --requisites /nix/store/...-hello
/nix/store/...-hello
/nix/store/...-glibc-2.35
/nix/store/...-gcc-11.3.0-lib
/nix/store/...-linux-headers-5.19
```

This is everything needed to run the program.

<!--
The closure is the complete set of everything needed.

If you copy a closure to another machine, the program will work because all dependencies are included.
-->

---

## Closure (2/2)

<img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f3f0.svg" alt="🏰" width="256" height="256">

> The LEGO set that completely built.

---

## Closure Size

```console
$ nix path-info --closure-size --human-readable nixpkgs#hello
/nix/store/...-hello-2.12.2  31.8 MiB
```

**Why does "Hello World" need 31.8 MiB?**

`glibc-2.42-47`: 29.0 MiB

`...`

`hello-2.12.2`: 268.2 KiB

<!--
This often surprises people.

Even a simple program has dependencies.

But remember, glibc is shared across many programs in the store.

Get total closure size, the sum of the package and all its transitive dependencies:

$ nix path-info --closure-size --human-readable nixpkgs#hello
/nix/store/...rnzdv4a-hello-2.12.2    31.8 MiB

Get cumulative closure size per package, each entry includes the sizes of its own dependencies:

$ nix path-info --recursive --closure-size --human-readable nixpkgs#hello
/nix/store/...miph269-libunistring-1.4.1     2.0 MiB
/nix/store/...h5q82z8-libidn2-2.3.8          2.3 MiB
/nix/store/...zzmwkxj-xgcc-15.2.0-libgcc   193.1 KiB
/nix/store/...4bayxw4-glibc-2.42-47         31.5 MiB
/nix/store/...rnzdv4a-hello-2.12.2          31.8 MiB

Get individual Nix ARchive (NAR) size per package, how much disk space each single store path occupies:

$ nix path-info --recursive --size --human-readable nixpkgs#hello
/nix/store/...miph269-libunistring-1.4.1     2.0 MiB
/nix/store/...h5q82z8-libidn2-2.3.8        359.6 KiB
/nix/store/...zzmwkxj-xgcc-15.2.0-libgcc   193.1 KiB
/nix/store/...4bayxw4-glibc-2.42-47         29.0 MiB
/nix/store/...rnzdv4a-hello-2.12.2         268.2 KiB
-->

---

## Garbage Collection

```shell
nix-collect-garbage --delete-older-than 30d
```

<!--
Garbage collection is safe because Nix knows exactly what's in use and what's not.

It traces from roots like your active profiles and running programs, then only deletes what's unreachable.

1. Find all roots, such as active profiles.
2. Trace all references from roots.
3. Delete unreachable store paths.
4. Reclaim disk space.
-->

---

## Put Nix into Practice

<!--
Let's look at modern Nix with flakes and wrap up with why all of this matters.
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

Explicit inputs with locked versions.
Better reproducibility.
Easier to share and compose.

<!--
Flakes are the modern way to work with Nix. They make dependencies explicit, lock versions automatically, and make projects easier to share.
-->

---

## Our Flake: Full Expression

```nix
{
  description = "Show UTC Date & Time";
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  outputs = { self, nixpkgs }:
    let
      forAllSystems = f:
        nixpkgs.lib.genAttrs
          [ "x86_64-linux" ... "aarch64-darwin" ]
          (system: f nixpkgs.legacyPackages.${system});
    in
    { packages = forAllSystems (pkgs: {
        default = pkgs.runCommand "show-utc-datetime" { ... } ''...'';
      });
    };
}
```

<!--
This is the complete flake version of our show-utc-datetime example.

We will walk through it piece by piece.
-->

---

## Flake: Metadata and Inputs (1/2)

```nix
  description = "Show UTC Date & Time";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
```

Declare external dependencies with exact sources.

Create a `flake.lock` to pin the exact revision.

<!--
Unlike the standalone expression that used import <nixpkgs>, a flake pins its inputs to a specific Git revision.

The lock file ensures everyone building this flake uses the exact same nixpkgs commit.

No more "it works on my machine" because of different channels.
-->

---

## Flake: Metadata and Inputs (2/2)

<img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f4d3.svg" alt="📜" width="256" height="256">

> **Order from which LEGO® catalog edition.**

---

## Flake: Multi-Platform Support

```nix
  outputs = { self, nixpkgs }:
    let
      forAllSystems = f:
        nixpkgs.lib.genAttrs
          [ "x86_64-linux" "aarch64-linux"
            "x86_64-darwin" "aarch64-darwin" ]
          (system: f nixpkgs.legacyPackages.${system});
    in
```

The `outputs` is a function receiving resolved inputs.

<!--
The outputs function receives the resolved inputs.

The forAllSystems helper generates packages for all four common platforms: x86 Linux, ARM Linux, x86 macOS, and ARM macOS.

This means the same flake works everywhere without modification, provided the binary are supported on those platforms.
-->

---

## Flake: Package Definition

```nix
    {
      packages = forAllSystems (pkgs: {
        default =
          pkgs.runCommand "show-utc-datetime"
            # ...
      });
    };
```

The build logic is identical to our regular expression.

<!--
The package definition inside the flake is the same runCommand we used before.

The only difference is that it is wrapped in the flake structure.

The default attribute means you can build it with just nix build without specifying a package name.
-->

---

## Flake Outputs and Derivations

```shell
nix build

nix flake show

nix flake metadata

nix run
```

> **Everything is still derivations under the hood!**

<!--
Flakes are just a nicer interface.

Under the hood, it's still the same derivation-based system we've been discussing.

The `nix build` evaluates the default package from our flake.nix and produces a derivation.

The implicit defaults expanded:
nix build = nix build .#default
nix flake show = nix flake show .
nix flake metadata = nix flake metadata .
nix run = nix run .#default
-->

---

## Analyzing Flake Dependencies

```shell
nix why-depends .#default \
  "$(nix path-info --recursive .#default | grep bash)"

# /nix/store/42c3md0x...-show-utc-datetime
# └───/nix/store/vlfjhc97...-bash-5.3p9

nix path-info --recursive .#default

nix path-info --closure-size .#default
```

Explore your dependency graph.

<!--
Same analysis tools work with flakes.

Using .#default references the default package from your flake.nix directly.

You can trace dependencies, understand closure sizes, and optimize your builds.
-->

---

## Real-World Impact

**Development**: Consistent, reproducible environments.

**CI/CD**: Hermetic, cacheable builds.

**Production**: Atomic deployments. Declarative configuration. SBOM.

**Multi-user**: Isolated user environments. No dependency conflicts.

<!--
This architecture enables all of Nix's benefits. It's not magic. It's careful engineering.

These benefits translate to real productivity gains in software development and operations.

Development: Nix dev shells activate instantly and share dependencies across projects via the Nix store. No extra files to maintain and no caching surprises.

CI/CD: Nix builds are hermetic at the package level, meaning they are insensitive to the libraries and other software installed on the build machine. Every dependency is pinned by hash. Binary caches save time by reusing previously built outputs.

Production: Nix can produce minimal container images containing only the exact closure needed. Nix also complements container workflows by generating optimized images from precise dependency graphs. Rollbacks are trivial because old versions remain in the store.

SBOM: Because Nix tracks the full dependency graph, generating a complete software bill of materials is trivial.

Multi-user: Nix allows multiple users on a single machine to have isolated package sets. Just symlinks to immutable store paths, with no additional overhead.
-->

---

## The Trade-Offs

**Benefits**:

Extreme reliability.
Perfect reproducibility.

**Drawbacks**:

Disk space from storing many versions.
Steep learning curve.

<!--
Nothing is perfect.

Nix trades disk space for reliability, and has a learning curve.

But for some, the benefits far outweigh the costs.
-->

---

## Key Takeaways

Expressions ≈ Design Sketches

Derivations ≈ Instruction Manuals

Hashes ≈ Set Numbers

<!--
These are the core concepts. Master these, and Nix will start to make sense.
-->

---

## Next Steps

**Explore your own `/nix/store`.**

**Read some `.drv` files.**

**Trace dependencies** with `why-depends`.

**Write your first Nix expression.**

**Join the Nix community.**

<!--
The best way to learn is by doing. Start exploring your own system and see how things connect.
-->

---

![bg opacity](../media/nix-wallpaper-nineish.webp)

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
[15 seconds] Thanks! Slides are on GitHub. Questions? If you have any questions, feel free to find me after the talk or reach out online. Happy Nixing!
-->

<!--
LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this site/presentation.
-->
