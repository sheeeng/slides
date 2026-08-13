# slides

## Getting Started

Use a template from either git submodule or direct clone method.

```shell
# git submodule add git@github.com:yhatt/marp-cli-example.git
git submodule update --init --recursive
```

```shell
rsync --archive \
    --exclude='.git' \
    --exclude='.github' \
    --exclude='assets/netlify-deploy-button.svg' \
    --exclude='LICENSE' \
    --exclude='netlify.toml' \
    --exclude='README.md' \
    marp-cli-example/ new-slides/
```

```shell
# git clone git@github.com:yhatt/marp-cli-example.git
# rm --recursive --force marp-cli-example/.git/
```

## Local Development

### Prerequisites

- Git
- Node.js LTS
- Python 3 (for the landing page dev server)

### Landing page

The landing page (`index.html`) embeds a Google Maps map loaded from `talks.toml`. A dev server injects your API key at startup.

Set the key in whichever env file you prefer — `dev.sh` checks `.envrc` first, then `.env`:

```shell
# direnv (.envrc)
echo 'export GOOGLE_MAPS_API_KEY=your_key' >> .envrc

# or plain .env
cp .env.example .env
# Edit .env and set your Google Maps API key
```

> If your `.envrc` contains secrets, add it to `.gitignore`.

```shell
./dev.sh
# Serving at http://localhost:8080
```

Override the port if needed:

```shell
PORT=3000 ./dev.sh
```

Or pass the key inline without any env file:

```shell
GOOGLE_MAPS_API_KEY=your_key ./dev.sh
```

### Individual slides

Each slide project has its own dev server powered by Marp CLI.

```shell
cd slides/demystifying-the-nix-store
npm install
npm start
# Opens a preview in the browser with live reload
```

Replace `demystifying-the-nix-store` with any of the other slide directories:

- `governing-azure-resources-with-policy`
- `reproducible-environments-docker-vs-nix`
- `running-kernel-based-virtual-machine`
- `tracking-nixpkgs-merged-pull-requests`

## Attribution

[Noto Color Emoji](https://fonts.google.com/noto/specimen/Noto+Color+Emoji) by Google is licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

See the [Noto Emoji Animation documentation](https://googlefonts.github.io/noto-emoji-animation/documentation) for technical details on animated emoji.
