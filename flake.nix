{
  description = "Static web slides site for conference talks.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.git
              pkgs.nodejs
            ];
          };
        }
      );

      apps = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          serve = pkgs.writeShellApplication {
            name = "serve-slides";
            runtimeInputs = [ pkgs.nodejs ];
            text = ''
              npx --yes serve .
            '';
          };
        in
        {
          default = {
            type = "app";
            program = "${serve}/bin/serve-slides";
          };
        }
      );
    };
}
