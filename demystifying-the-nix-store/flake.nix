{
  description = "Show UTC Date & Time";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";

  outputs =
    { self, nixpkgs }:
    let
      forAllSystems =
        f:
        nixpkgs.lib.genAttrs [
          "x86_64-linux"
          "aarch64-linux"
          "x86_64-darwin"
          "aarch64-darwin"
        ] (system: f nixpkgs.legacyPackages.${system});
    in
    {
      packages = forAllSystems (pkgs: {
        default =
          pkgs.runCommand "show-utc-datetime"
            {
              nativeBuildInputs = [ pkgs.uutils-coreutils-noprefix ];
            }
            ''
              mkdir --parents $out/bin
              cat > $out/bin/show-utc-datetime <<'EOF'
              #!${pkgs.runtimeShell}
              exec ${pkgs.uutils-coreutils-noprefix}/bin/date --universal +"%Y%m%dT%H%M%SZ"
              EOF
              chmod +x $out/bin/show-utc-datetime
            '';
      });
    };
}
