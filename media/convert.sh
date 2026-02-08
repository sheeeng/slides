#!/usr/bin/env bash

# https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html
set -o pipefail # If set, the return value of a pipeline is the value of the last (rightmost) command to exit with a non-zero status, or zero if all commands in the pipeline exit successfully. This option is disabled by default.
set -o errexit  # set -e # Exit immediately if a pipeline, which may consist of a single simple command, a list, or a compound command returns a non-zero status.
set -o nounset  # set -u # Treat unset variables and parameters other than the special parameters ‘@’ or ‘*’, or array variables subscripted with ‘@’ or ‘*’, as an error when performing parameter expansion. An error message will be written to the standard error, and a non-interactive shell will exit.
# set -o xtrace  # set -x # Print a trace of simple commands, for commands, case commands, select commands, and arithmetic for commands and their arguments or associated word lists after they are expanded and before they are executed. The value of the PS4 variable is expanded and the resultant value is printed before the command and its expanded arguments.

# https://www.gnu.org/software/bash/manual/html_node/The-Shopt-Builtin.html
shopt -s inherit_errexit # If set, command substitution inherits the value of the errexit option, instead of unsetting it in the subshell environment. This option is enabled when POSIX mode is enabled.

if [ -d ".git" ] || git rev-parse --git-dir > /dev/null 2>&1; then
  GIT_ROOT_DIRECTORY=$(git rev-parse --show-toplevel)
  echo "\${GIT_ROOT_DIRECTORY}: ${GIT_ROOT_DIRECTORY}"
fi
SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null 2>&1 && pwd)"
echo "\${SCRIPT_DIRECTORY}: ${SCRIPT_DIRECTORY}"

# ------------------------------------------------------------------------------

pushd "${SCRIPT_DIRECTORY}"
date --universal +"%Y%m%dT%H%M%SZ"

# See if the file even uses the alpha channel.
fd --extension png --exec magick identify -format "%f: %[channels]\n"
# If it returns srgba, it has an alpha channel.
# If it returns srgb, it is already opaque.

# PNGs often have transparent backgrounds.
# Since JPG doesn't support transparency, ImageMagick will usually fill the transparent area with black.
# To avoid this, set the background to white (opaque) before removing the alpha channel.
# Convert PNGs to JPG format with white opaque background.
magick mogrify -format jpg -background white -alpha remove -alpha off ./*.png

# Convert PNGs to WebP format.
magick mogrify -format webp ./*.png

popd || exit
