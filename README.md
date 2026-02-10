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
    --exclude='netlify.toml' \
    --exclude='LICENSE' \
    --exclude='README.md' \
    marp-cli-example/ new-slides/
```

```shell
# git clone git@github.com:yhatt/marp-cli-example.git
# rm --recursive --force marp-cli-example/.git/
```

## Attribution

[Noto Color Emoji](https://fonts.google.com/noto/specimen/Noto+Color+Emoji) by Google is licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

See the [Noto Emoji Animation documentation](https://googlefonts.github.io/noto-emoji-animation/documentation) for technical details on animated emoji.
