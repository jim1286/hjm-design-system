#!/usr/bin/env bash
set -euo pipefail
umask 077
# Explicit static hosting migration/delivery; no package version or npm release trigger.
test "$#" = 4 || { echo 'Usage: publish.sh ARTIFACT USER@HOST SSH_KEY_FILE SOURCE_SHA' >&2; exit 1; }
artifact=$1 target=$2 identity=$3 source_sha=$4
[[ "$artifact" = /* && "$target" =~ ^[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+$ && "$identity" = /* && "$source_sha" =~ ^[0-9a-f]{40}$ ]]
helper=$(cd -- "$(dirname -- "$0")" && pwd)/artifact.py
python3 "$helper" verify "$artifact" "$source_sha"
manifest_sha=$(shasum -a 256 "$artifact/manifest.json" | awk '{print $1}')
release_id="$source_sha-${manifest_sha:0:12}"
scratch=$(mktemp -d "${TMPDIR:-/tmp}/storybook-publish.XXXXXX")
trap 'rm -rf "$scratch"' EXIT
python3 "$helper" caddy /srv/hjm-storybook/current/public > "$scratch/production.caddy"
python3 "$helper" caddy "/srv/hjm-storybook/releases/$release_id/public" --preview > "$scratch/preview.caddy"
# Python's archive writer omits macOS provenance/xattr PAX records; bsdtar carried
# hundreds of irrelevant extended headers in the first migration transfer.
python3 - "$artifact" "$scratch/artifact.tgz" <<'ARCHIVE'
import pathlib,sys,tarfile
root=pathlib.Path(sys.argv[1])
with tarfile.open(sys.argv[2], 'w:gz') as archive:
    archive.add(root/'public', arcname='public')
    archive.add(root/'manifest.json', arcname='manifest.json')
ARCHIVE
archive_sha=$(shasum -a 256 "$scratch/artifact.tgz" | awk '{print $1}')
ssh_options=(-i "$identity" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10)
stage="/tmp/storybook-publish-$release_id"
ssh "${ssh_options[@]}" "$target" "mkdir -m 700 '$stage'"
scp "${ssh_options[@]}" "$scratch/artifact.tgz" "$scratch/production.caddy" "$scratch/preview.caddy" "$helper" "$target:$stage/"
ssh "${ssh_options[@]}" "$target" "sudo bash -s -- '$release_id' '$archive_sha' '$stage'" <<'REMOTE'
set -euo pipefail
release_id=$1 archive_sha=$2 stage=$3
[[ "$release_id" =~ ^[0-9a-f]{40}-[0-9a-f]{12}$ && "$archive_sha" =~ ^[0-9a-f]{64}$ && "$stage" = "/tmp/storybook-publish-$release_id" ]]
# Caddy is shared with portfolio, policies and BurnTok; use the established host lock.
exec 9>/opt/burntok/deploy.lock
flock -w 300 9
printf '%s  %s\n' "$archive_sha" "$stage/artifact.tgz" | sha256sum --check
grep -Fq 'import /etc/caddy/conf.d/*.caddy' /etc/caddy/Caddyfile
base=/srv/hjm-storybook
release="$base/releases/$release_id"
test ! -e "$release"
install -d -m 0755 "$base/releases" "$release" /etc/caddy/conf.d
# The archive was created from the verified file closure; extraction never accepts a remote input URL.
tar -xzf "$stage/artifact.tgz" -C "$release"
chown -R root:root "$release"
find "$release" -type d -exec chmod 0755 {} +
find "$release" -type f -exec chmod 0644 {} +
python3 "$stage/artifact.py" verify "$release" "${release_id:0:40}"
printf '%s\n' "${release_id:0:40}" > "$release/source.sha"
printf '%s\n' "$archive_sha" > "$release/archive.sha256"
date -u +%FT%TZ > "$release/deployed.at"
caddy validate --adapter caddyfile --config "$stage/preview.caddy"
caddy run --adapter caddyfile --config "$stage/preview.caddy" > "$stage/preview.log" 2>&1 &
preview_pid=$!
trap 'kill "$preview_pid" 2>/dev/null || true' EXIT
for attempt in $(seq 1 20); do
  if curl -fsS --max-time 1 http://127.0.0.1:18086/ >/dev/null 2>&1; then break; fi
  sleep 0.25
done
python3 "$stage/artifact.py" check-http "$release" http://127.0.0.1:18086
kill "$preview_pid"
wait "$preview_pid" || true
trap - EXIT
old_current=$(readlink "$base/current" || true)
snippet=/etc/caddy/conf.d/hjm-storybook.caddy
had_snippet=0
if test -f "$snippet"; then cp -p "$snippet" "$stage/previous.caddy"; had_snippet=1; fi
rollback() {
  if test -n "$old_current"; then ln -s "$old_current" "$base/current.rollback"; mv -Tf "$base/current.rollback" "$base/current"; else rm -f "$base/current"; fi
  if test "$had_snippet" = 1; then install -m 0644 "$stage/previous.caddy" "$snippet"; else rm -f "$snippet"; fi
  systemctl reload caddy
  echo 'Storybook edge promotion failed; previous state restored.' >&2
}
trap rollback ERR
ln -s "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
install -m 0644 -o root -g root "$stage/production.caddy" "$snippet"
caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile
systemctl reload caddy
systemctl is-active --quiet caddy
if test -n "$old_current"; then ln -sfn "$old_current" "$base/previous"; fi
cp -p "$stage/production.caddy" "$release/edge.caddy"
trap - ERR
printf 'source=%s\nrelease=%s\narchiveSha256=%s\n' "${release_id:0:40}" "$release" "$archive_sha"
rm -rf "$stage"
REMOTE
