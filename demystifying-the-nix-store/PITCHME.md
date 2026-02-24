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
</style>

## <!--fit--> Demystifying the Nix Store

<!-- markdownlint-disable MD026 -->

The Giant Immutable LEGO® Set

<!--
Ever looked inside /nix/store and felt immediate confusion? You aren't alone. For many, the "magic" of Nix is hidden behind cryptic hashes and the mysterious "derivation." This talk strips away the jargon to explain how Nix actually works using a simple metaphor: a giant, immutable LEGO set. We'll explore how Nix builds software in total isolation, why your system can't "break" like traditional distros, and how every package is just a recipe waiting to be snapped into place.

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
/nix/store/vm9dz55z4g5p8qixnnkgy2jy7rh0m80p-nixd-2...
/nix/store/3qk44frb7zpwpy0lkxp3xl97zhpjrcr7-glibc-...
/nix/store/gyl90xhl7hf8wpz31zmvgz0m7wy343ib-gcc-15...
```

<!--
Start with something familiar but confusing. These cryptic paths are what many users see first and immediately feel lost. The hashes look random, the structure seems opaque.
-->

---

## The Immediate Reaction

**What are these hashes?**

**Why is everything immutable?**

**Where's my `/usr/bin`?**

**How does anything even work?**

<!--
These are the common questions newcomers have. Traditional package managers hide complexity behind familiar directories like /usr/bin. Nix does the opposite. It shows you everything, but at first glance it seems like chaos.
-->

---

## Today's Session

Explore the LEGO® Metaphor.

Look Inside Expressions & Derivations.

Put Nix into Practice.

<!--
Set expectations for the talk. We'll go from confusion to clarity using a simple metaphor that makes Nix's complexity make sense.
-->

---

## Explore the LEGO® Metaphor

<!--
Now we introduce the key metaphor that will help everything make sense.
-->

---

## Traditional Package Managers

Everything mixed together.

Upgrading might break.

Hard to undo changes.

Dependency hell.

<!--
Traditional package managers are like throwing all your LEGO bricks into one big bin. Sure, you can find pieces, but things get messy, upgrades can break existing builds, and rolling back is painful.
-->

---

## Giant LEGO® Set

For each Nix package:

The binaries and libraries are like a set of bricks.

The derivation that builds it is like a instruction manual.

The content-addressed hash is like a unique set number.

<!--
This is the core metaphor. Each LEGO set is self-contained, has clear instructions, and has a unique identifier. Sound familiar?
-->

---

## LEGO® Metaphor ≈ Nix Rules

Bricks snap together perfectly.

Instructions are reproducible.

Sets never change once built.

You can combine sets safely.

You can't modify a built set.

<!--
The immutability of LEGO sets maps perfectly to Nix's immutable store. Once built, you don't change them; you build new ones.

The Kragle holds them together!
-->

---

## Look Inside Expressions & Derivations

<!--
Now let's understand the relationship between Nix expressions and derivations.
-->

---

## What Is a Nix Expression?

The source code contained in a `.nix` file.

A **pure, functional language** for describing packages.

Every `.nix` file is a function that returns a value.

Expressions declare **what** to build, not **how** to run it.

> **The LEGO® design sketch you draw on paper.**

<!--
A Nix expression is just source code written in the Nix language. It is declarative. You describe the inputs, the build steps, and the expected outputs. Nix expressions are pure functions, meaning the same inputs always produce the same result. This is the file you edit as a developer.
-->

---

## Expressions Produce Derivations

Nix **evaluates** the expression to produce a **derivation**.

Derivation: Fully resolved, machine-readable build recipe.

Every dependency is pinned to an exact store path.

> **Read the sketch, prints the instruction manual.**

<!--
This is the most important distinction in Nix. You write expressions. Nix turns them into derivations. The expression is human-friendly source code. The derivation is a fully resolved build recipe with every dependency pinned to an exact store path.
-->

---

## What Is a Derivation?

A **recipe** that describes:

- **Inputs**: What you need, such as dependencies.
- **Build steps**: How to build it.
- **Outputs**: What you get, including binaries and libraries.

> **The LEGO® instruction booklet inside your set.**

<!--
A derivation is just a recipe. It tells Nix exactly what inputs are needed, what steps to perform, and what the final output should look like.
-->

---

## Example of Nix Expression

```nix
# show-utc-datetime.nix

{  pkgs ? import <nixpkgs> { }, }:
pkgs.runCommand "show-utc-datetime"
  { nativeBuildInputs = [ pkgs.uutils-coreutils-noprefix ]; }
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
This is a real Nix expression you can build yourself. Don't worry if it looks dense. We will walk through it piece by piece over the next few slides.
-->

---

## Declaring Inputs

```nix
{ pkgs ? import <nixpkgs> { }, }:
```

`pkgs` is the function argument.

`import ...` loads the entire Nix packages collection.

> **Find the bricks you need in a LEGO® catalog.**

<!--
Every Nix file is a function. This line says "give me a package set, or I will load nixpkgs myself." This is how the expression knows where to find its dependencies. It is the shopping list before you start building.
-->

---

## Choosing the Builder

```nix
pkgs.runCommand "show-utc-datetime"
  { nativeBuildInputs = [ pkgs.uutils-coreutils-noprefix ]; }
```

The `runCommand` creates a simple derivation without needing a full `stdenv.mkDerivation` function.

<!--
runCommand is the simplest way to create a derivation. You give it a name, declare what tools you need at build time, and provide a build script. The name you choose here is what appears after the hash in the final store path.

`"show-utc-datetime"` becomes the package name in the store path.

`nativeBuildInputs` lists dependencies available during the build.
-->

---

## The Build Script

```bash
cat > $out/bin/show-utc-datetime <<'EOF'
#!${pkgs.runtimeShell}
exec ${pkgs.uutils-coreutils-noprefix}/bin/date --universal +"%Y%m%dT%H%M%SZ"
EOF
chmod +x $out/bin/show-utc-datetime
```

The shell script that calls `date` from the package.

<!--
This is the actual build logic. Notice how $out is a placeholder for the final store path that Nix will compute. The script uses absolute paths to dependencies, pointing directly into the Nix store. No reliance on PATH or system-wide binaries. That is total isolation in action.
-->

---

## Nix Interpolation at Work

```nix
#!${pkgs.runtimeShell}
exec ${pkgs.uutils-coreutils-noprefix}/bin/date --universal +"%Y%m%dT%H%M%SZ"
```

After Nix evaluates the expression, this becomes:

```bash
#!/nix/store/vlfjhc9730i65q1xhzf51kzh58s9kxnp-bash-5.3p9/bin/bash
exec /nix/store/qx971axpac355l325832aghxx093gp61-uutils-coreutils-0.6.0/bin/date \
  --universal +"%Y%m%dT%H%M%SZ"
```

Every dependency is pinned to an **exact store path**.

<!--
This is the key insight. Nix replaces the interpolation expressions with absolute paths into the store. The resulting script does not depend on any system PATH. It points directly at a specific version of bash and a specific version of uutils-coreutils-noprefix. If either dependency changes, the hash changes, and you get a completely new store path.
-->

---

## Build The Expression (\*.nix) File

```shell
nix build --file show-utc-datetime.nix
```

Evaluate the expression to produce a `.drv` file.
Compute a hash from inputs.
Run the build script in an isolated sandbox.
Store the output at the computed path.

<!--
Building evaluates the Nix expression, produces a derivation, and then executes that derivation in a sandbox. The hash in the output path is deterministic. If you build this on another machine with the same nixpkgs version, you get the exact same hash. That is reproducibility. Input Addressability: Hashes from everything: dependencies, build script, name.
-->

---

### Derivation: Build Output

```text
this derivation will be built:
  /nix/store/86bwwvp5qn13fhzyjg82dag1pgn1360z-show-utc-datetime.drv
```

Evaluate the `.nix` expression to produce a `.drv` file.
Compute the hash `86bwwvp5...` from all inputs.
Execute the `.drv` file as the actual build recipe.

<!--
The first thing Nix reports is which derivation it plans to build. The .drv file is the real derivation. Our .nix file was just the expression that produced it. The hash encodes every input: the build script, dependencies, system architecture, everything.
-->

---

### Derivation: Build Output / Get Dependencies

```text
this path will be fetched (3.22 MiB download, 12.22 MiB unpacked):
  /nix/store/qx971axpac355l325832aghxx093gp61-uutils-coreutils-0.6.0

copying path '...-uutils-coreutils-0.6.0' from 'https://cache.nixos.org'
```

- `uutils-coreutils-0.6.0` is needed but not in the local store.

<!--
Nix checks the binary cache before building anything. Since someone already built uutils-coreutils with the exact same hash, Nix downloads the pre-built result. This saves enormous amounts of time. Without the cache, it would need to compile the entire Rust codebase for uutils-coreutils from source.
-->

---

### Derivation: Build Output / Executing Build

```text
show-utc-datetime> building
  '/nix/store/86bwwvp5qn13fhzyjg82dag1pgn1360z-show-utc-datetime.drv'
```

Run the build script inside a sandbox.
Allow only declared dependencies.
Block network access and access to `/usr` or `/bin`.
Place the output at the computed store path.

<!--
Now Nix actually executes the derivation. It runs our build script in total isolation. The only tools available are what we declared in nativeBuildInputs. This is why Nix builds are reproducible. Nothing from the host system can leak in.
-->

---

### Derivation: Build Output / Dependency Graph

```text
┏━ Dependency Graph:
┃ ✔ show-utc-datetime
┣━━━ Builds
┗━ ∑ ⏵ 0 │ ✔ 1 │ ⏸ 0 │ Finished after 3s
```

Visualize the build process with `nix-output-monitor`.

<!--
The nix-output-monitor tool gives us a clear picture of what happened. The dependency graph shows that show-utc-datetime was built locally. All dependencies including uutils-coreutils were already available in the store, so nothing needed to be downloaded. The build itself took only 3 seconds.
-->

---

## The Derivation (\*.drv) File

```shell
nix derivation show --file show-utc-datetime.nix
```

```json
{
    "/nix/store/86bwwvp5qn13fhzyjg82dag1pgn1360z-show-utc-datetime.drv": {
        "outputs": {
            "out": {
                "path": "/nix/store/42c3md0xxwbr0i3d5nrmscjcmv8h9rcs-show-utc-datetime"
            }
        }
    }
}
```

Map a derivation hash to a deterministic output path.

<!--
The .drv file is what Nix actually executes. It contains the fully resolved build recipe with all store paths filled in. The outputs section tells you exactly where the build result will land. Both the derivation hash and the output hash are deterministic.
-->

---

### Inside the `.drv`: Builder and Arguments

```json
{
    "builder": "/nix/store/vlfjhc9730i65q1xhzf51kzh58s9kxnp-bash-5.3p9/bin/bash",
    "args": [
        "-e",
        "/nix/store/l622p70vy8k5sh7y5wizi5f2mic6ynpg-source-stdenv.sh",
        "/nix/store/shkw4qm9qcw5sc5n1k5jznc83ny02r39-default-builder.sh"
    ]
}
```

Every path is absolute. Nothing comes from the host system.

<!--
Even the shell that runs the build is a specific, immutable store path. Nix does not use /bin/bash from the host. It uses its own bash, locked to a specific version. The arguments point to stdenv setup scripts that configure the build environment before running our build command.
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
Input derivations form the dependency graph. Each one must be available in the store before our build can start. Notice that stdenv is also an input even though we did not declare it explicitly. The runCommand helper added it for us. This is how Nix ensures complete dependency tracking.
-->

---

### Inside the `.drv`: Build Command

```json
{
  "env": {
    "buildCommand": "mkdir --parents $out/bin\n
      cat > $out/bin/show-utc-datetime <<'EOF'\n
      #!/nix/store/vlfjhc9730i65q1xhzf51kzh58s9kxnp-bash-5.3p9/bin/bash\n
      exec /nix/store/qx971axpac355l325832aghxx093gp61-uutils-coreutils-0.6.0/bin/date
        --universal +\"%Y%m%dT%H%M%SZ\"\n
      EOF\nchmod +x $out/bin/show-utc-datetime\n",
    "name": "show-utc-datetime",
    "system": "aarch64-darwin"
  }
}
```

Resolve all interpolations in the build script.

<!--
This is the fully expanded version of our build script. Compare this to the original Nix expression. Every Nix interpolation has been replaced with a concrete store path. This is the script that Nix actually executes inside the sandbox. The system field tells Nix which platform this derivation targets.
-->

---

## Examining the Output

```console
$ tree /nix/store/42c3md0xxwbr0i3d5nrmscjcmv8h9rcs-show-utc-datetime
/nix/store/42c3md0xxwbr0i3d5nrmscjcmv8h9rcs-show-utc-datetime
└── bin
    └── show-utc-datetime

$ cat /nix/store/42c3md0xxwbr0i3d5nrmscjcmv8h9rcs-show-utc-datetime/bin/show-utc-datetime
#!/nix/store/vlfjhc9730i65q1xhzf51kzh58s9kxnp-bash-5.3p9/bin/bash
exec /nix/store/qx971axpac355l325832aghxx093gp61-uutils-coreutils-0.6.0/bin/date \
  --universal +"%Y%m%dT%H%M%SZ"
```

<!--
The output is a clean directory with a single executable. Looking inside the script, you can see that every path is an absolute store path. There is no ambiguity about which bash or which date command runs. This is what makes Nix packages self-contained.
-->

---

## Running the Result

```console
$ /nix/store/42c3md0xxwbr0i3d5nrmscjcmv8h9rcs-show-utc-datetime/bin/show-utc-datetime
20260223T184340Z

$ ./result/bin/show-utc-datetime
20260223T184340Z
```

Create a `./result` symlink to the store path.

<!--
The result symlink is a convenience. It points at the immutable store path. You can copy the entire closure to another machine, and it will produce the same output. No "works on my machine" surprises.

Output a UTC timestamp in ISO 8601 compact format.
Run the script on any machine with this Nix closure.
-->

---

## The Store Path Structure

```text
/nix/store/[hash]-[name]-[version]
           └─────┬─────┘
          Unique Identifier
```

$$f(\text{inputs}) = \text{/nix/store/...}$$

**Example**:

```text
/nix/store/42c3md0xxwbr0i3d5nrmscjcmv8h9rcs-show-utc-datetime
```

<!--
The hash isn't random. It's deterministic! It's computed from all the inputs, the build recipe, and even the compiler version. Change anything, and you get a different hash.
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

## Total Isolation

During a Nix build:

Block network access in most cases.

Block access to `/usr`, `/bin`, etc.

Prevent environment variable leakage.

Allow only declared dependencies.

**Result**: Reproducible builds!

<!--
This is crucial. Nix builds happen in a sandbox where the only things available are what you explicitly declared. No hidden dependencies, no accidental reliance on system packages.
-->

---

## The Build Sandbox

```bash
$ nix-build '<nixpkgs>' --attr hello --check
checking outputs of '/nix/store/msnhw2b4...-hello-2.12.2.drv'...
Using versionCheckHook
Running phase: unpackPhase
unpacking source archive /nix/store/dw402azx...-hello-2.12.2.tar.gz
source root is hello-2.12.2
...
/nix/store/c12lxpyk...-hello-2.12.2
```

<!--
Every build happens in a clean room. Nix sets up the environment from scratch every time, ensuring consistency.

nix-build '<nixpkgs>' --attr hello --check --no-out-link --no-substitute
-->

---

## How It Works

1. **Evaluate the expression**, the `.nix` file.
2. **Produce the derivation**, the `.drv` file.
3. **Gather all inputs**, including dependencies.
4. **Create isolated environment.**
5. **Run build steps.**
6. **Store output** at the computed path.

<!--
This is the build process in a nutshell. The Nix expression is evaluated to produce a derivation. The derivation is then executed in a sandbox to produce the output. Everything is deterministic and traceable.
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

Symlink updated at `/nix/var/nix/profiles/default` path.

<!--
Operations are atomic. Either they complete fully or they don't happen at all. And rolling back is just changing which generation your profile points to.
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
You can explore the dependency graph to understand what each package needs. What does this package reference? What references this package?

# Run on macOS system.

nix-store --query --references "$(nix-build '<nixpkgs>' --attr hello --no-out-link)"

/nix/store/7h6icyvqv6lqd0bcx41c8h3615rjcqb2-libiconv-109.100.2

# TODO: Run on Linux system.
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

- Explicit inputs with locked versions.
- Better reproducibility.
- Easier to share and compose.

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
          [ "x86_64-linux" "aarch64-linux"
            "x86_64-darwin" "aarch64-darwin" ]
          (system: f nixpkgs.legacyPackages.${system});
    in
    { packages = forAllSystems (pkgs: {
        default = pkgs.runCommand "show-utc-datetime" { ... } ''...'';
      });
    };
}
```

<!--
This is the complete flake version of our show-utc-datetime example. We will walk through it piece by piece.
-->

---

## Flake: Metadata and Inputs

```nix
{
  description = "Show UTC Date & Time";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
```

- `inputs` declares external dependencies with exact sources.
- Nix creates a `flake.lock` to pin the exact revision.

> **Order from which LEGO® catalog edition.**

<!--
Unlike the standalone expression that used import <nixpkgs>, a flake pins its inputs to a specific Git revision. The lock file ensures everyone building this flake uses the exact same nixpkgs commit. No more "it works on my machine" because of different channels.
-->

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

- `outputs` is a function receiving resolved inputs.

<!--
The outputs function receives the resolved inputs. The forAllSystems helper generates packages for all four common platforms: x86 Linux, ARM Linux, x86 macOS, and ARM macOS. This means the same flake works everywhere without modification.
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
The package definition inside the flake is the same runCommand we used before. The only difference is that it is wrapped in the flake structure. The default attribute means you can build it with just nix build without specifying a package name.
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
Flakes are just a nicer interface. Under the hood, it's still the same derivation-based system we've been discussing. nix build evaluates the default package from our flake.nix and produces a derivation.

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
Same analysis tools work with flakes. Using .#default references the default package from your flake.nix directly. You can trace dependencies, understand closure sizes, and optimize your builds.
-->

---

## The Closure

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

# TODO: Run on Linux system.
-->

---

## Garbage Collection

```shell
nix-collect-garbage --delete-older-than 30d
```

<!--
Garbage collection is safe because Nix knows exactly what's in use and what's not. It traces from roots like your active profiles and running programs, then only deletes what's unreachable.

1. Find all roots, such as active profiles.
2. Trace all references from roots.
3. Delete unreachable store paths.
4. Reclaim disk space.
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
- **Production**: Atomic deployments. SBOM.
- **Multi-user**: Isolated user environments.

<!--
These benefits translate to real productivity gains in software development and operations.
-->

---

## The Trade-Offs

**Benefits**:

- Extreme reliability.
- Perfect reproducibility.

**Drawbacks**:

- Disk space from storing many versions.
- Steep learning curve.

<!--
Nothing is perfect. Nix trades disk space for reliability, and has a learning curve. But for many teams, the benefits far outweigh the costs.
-->

---

## Key Takeaways

1. **Nix Store ≈ Giant LEGO® Set**
2. **Expressions ≈ Design Sketches**
3. **Derivations ≈ Instruction Manuals**
4. **Hashes ≈ Unique Identifiers**
5. **Isolation ≈ Reproducibility**
6. **Immutability ≈ No Breakage**
7. **Closures ≈ Complete Dependencies**

<!--
These are the core concepts. Master these, and Nix will start to make sense.
-->

---

## Next Steps

1. **Explore your own `/nix/store`.**
2. **Read some `.drv` files.**
3. **Trace dependencies** with `why-depends`.
4. **Write your first Nix expression.**
5. **Join the Nix community.**

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
