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

### Seasonal landing page

The seasonal landing page source is in `seasonal/`. The deployment publishes
its build at the site root. It keeps the landing page content and layout and
selects a background scene at build time from the seven day Oslo forecast
supplied by [MET Norway][met-norway]. It applies MET Norway's temperature
thresholds for meteorological seasons. Each page refresh requests current Oslo
weather after the initial content renders. The page shows a loading message
until the live request succeeds and shows an unavailable message if it fails.
Append
`?season=spring`, `?season=summer`, `?season=autumn`, or `?season=winter` to
inspect a specific scene.

```shell
npm --prefix seasonal install
npm --prefix seasonal run dev
```

The landing page uses the MET Norway Locationforecast Compact endpoint:

```text
https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.9139&lon=10.7522
```

Use Nushell to inspect the raw weather measurements:

```nu
http get 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.9139&lon=10.7522'
| get properties.timeseries
| first
| get data.instant.details
```

For Nushell debugging, inspect the update time and all forecast periods:

```nu
let u = "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.9139&lon=10.7522"
let d = (http get $u)

let ts0 = $d.properties.timeseries.0
{
  updated_at: $d.properties.meta.updated_at
  instant: $ts0.data.instant.details
  next_1_hours: $ts0.data.next_1_hours
  next_6_hours: $ts0.data.next_6_hours
  next_12_hours: $ts0.data.next_12_hours
}
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

[Noto Color Emoji][noto-color-emoji] by Google is licensed under the
[Creative Commons Attribution 4.0 International License][cc-by-4].

The seasonal landing page uses the Sylva Living World scene from
[Three UI][three-ui].

See the [Noto Emoji Animation documentation][noto-animation] for technical
details on animated emoji.

[cc-by-4]: https://creativecommons.org/licenses/by/4.0/
[noto-animation]: https://googlefonts.github.io/noto-emoji-animation/
[noto-color-emoji]: https://fonts.google.com/noto/specimen/Noto+Color+Emoji
[met-norway]: https://api.met.no/
[three-ui]: https://threeui.com/browse
