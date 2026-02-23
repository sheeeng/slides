{
  pkgs ? import <nixpkgs> { },
}:

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
  ''
