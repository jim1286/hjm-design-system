#!/usr/bin/env python3
"""Portable Storybook artifact: exact CI source, file closure and public bytes."""
import concurrent.futures
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.parse

ORIGIN = "https://storybook.jmstudioapps.com"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def files(root):
    if root.is_symlink() or not root.is_dir():
        raise ValueError("Artifact root must be a real directory")
    result = []
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"Symlink not allowed: {path.name}")
        if path.is_file():
            name = path.relative_to(root).as_posix()
            if any(part.startswith(".") and part != ".nojekyll" for part in pathlib.PurePosixPath(name).parts):
                raise ValueError(f"Hidden artifact file not allowed: {name}")
            result.append({"file": name, "bytes": path.stat().st_size, "sha256": digest(path)})
    return result


def verify(root, sha):
    manifest = json.loads((root / "manifest.json").read_text())
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ValueError("Exact source SHA required")
    if (manifest.get("schemaVersion"), manifest.get("origin"), manifest.get("sourceSha")) != (1, ORIGIN, sha):
        raise ValueError("Artifact identity mismatch")
    if not re.fullmatch(r"[0-9]+", str(manifest.get("ciRunId", ""))):
        raise ValueError("CI run ID required")
    if manifest["files"] != files(root / "public"):
        raise ValueError("Artifact file closure/hash mismatch")
    names = {f["file"] for f in manifest["files"]}
    if not {"index.html", "iframe.html", "index.json"} <= names:
        raise ValueError("Storybook manager, preview and index required")
    index = json.loads((root / "public/index.json").read_text())
    if not index.get("entries"):
        raise ValueError("Empty Storybook index")
    return manifest


def prepare(source, output, sha, run):
    if not source.is_absolute() or not output.is_absolute() or output.exists():
        raise ValueError("Absolute input and new output directory required")
    if not re.fullmatch(r"[0-9a-f]{40}", sha) or not run.isdecimal():
        raise ValueError("Exact source SHA and CI run ID required")
    if source == output or source in output.parents:
        raise ValueError("Output must be outside the source directory")
    # Never rebuild a shared dirty checkout here: consume the files CI already checked.
    inventory = files(source)
    output.mkdir(parents=True)
    shutil.copytree(source, output / "public")
    manifest = {"schemaVersion": 1, "origin": ORIGIN, "sourceSha": sha, "ciRunId": run, "files": inventory}
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    verify(output, sha)
    print(f"Prepared {len(inventory)} files; source={sha}; ciRunId={run}")


def cache(name):
    # Storybook manager/runtime filenames may be stable between releases. Only Vite
    # content-hashed assets get immutable caching; index and preview must revalidate.
    if name.endswith(".html") or name in {"index.json", "project.json"}:
        return "no-cache"
    if re.fullmatch(r"assets/.+-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+", name):
        return "public, max-age=31536000, immutable"
    return "public, max-age=300"


def caddy(root, preview=False):
    if not re.fullmatch(r"/srv/hjm-storybook/(?:current|releases/[0-9a-f]{40}-[0-9a-f]{12})/public", root):
        raise ValueError("Unexpected server root")
    start = "{\n admin off\n auto_https off\n}\nhttp://127.0.0.1:18086" if preview else ORIGIN.removeprefix("https://")
    print(start + " {\n root * " + root + "\n encode zstd gzip\n header X-Content-Type-Options nosniff")
    print(" @fresh {\n  path *.html / /index.json /project.json\n }\n header @fresh Cache-Control no-cache")
    print(" @hashed {\n  path_regexp hashed ^/assets/.+-[A-Za-z0-9_-]{8,}\\.[A-Za-z0-9]+$\n }\n header @hashed Cache-Control \"public, max-age=31536000, immutable\"")
    print(" @other {\n  not path *.html / /index.json /project.json\n  not path_regexp other ^/assets/.+-[A-Za-z0-9_-]{8,}\\.[A-Za-z0-9]+$\n }\n header @other Cache-Control \"public, max-age=300\"\n file_server\n}")


def check_http(root, origin):
    manifest = json.loads((root / "manifest.json").read_text())
    verify(root, manifest["sourceSha"])
    if origin not in {ORIGIN, "http://127.0.0.1:18086"}:
        raise ValueError("Unexpected verification origin")

    def fetch(path):
        # On the development Mac, Python's concurrent resolver returned transient
        # NXDOMAIN after DNS creation while curl and the browser resolved correctly.
        # Use curl's normal DNS/TLS validation, without --insecure or a pinned IP.
        with tempfile.TemporaryDirectory(prefix="storybook-http-") as folder:
            body = pathlib.Path(folder) / "body"
            result = subprocess.run(["curl", "--silent", "--show-error", "--max-time", "30", "--dump-header", "-", "--output", str(body), origin + path], capture_output=True, check=True)
            headers = result.stdout.decode("iso-8859-1")
            status = int(re.findall(r"^HTTP/\S+ (\d+)", headers, re.MULTILINE)[-1])
            values = dict((name.lower(), value.strip()) for name, value in re.findall(r"^([^:\r\n]+): ([^\r\n]*)", headers, re.MULTILINE))
            return status, body.read_bytes(), values

    def check(item):
        path = "/" if item["file"] == "index.html" else "/" + urllib.parse.quote(item["file"], safe="/")
        status, body, headers = fetch(path)
        assert status == 200, path
        assert hashlib.sha256(body).hexdigest() == item["sha256"], path
        assert headers.get("cache-control") == cache(item["file"]), path
        assert headers.get("x-content-type-options") == "nosniff", path

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(check, manifest["files"]))
    for path in ["/__missing__", "/.env", "/manifest.json", "/artifact.py"]:
        status, _, _ = fetch(path)
        assert status == 404, path
    print(f"Verified {len(manifest['files'])} public file hashes/cache headers and 4 negative routes: {origin}")


if __name__ == "__main__":
    command, *args = sys.argv[1:]
    if command == "prepare":
        prepare(pathlib.Path(args[0]), pathlib.Path(args[1]), args[2], args[3])
    elif command == "verify":
        m = verify(pathlib.Path(args[0]), args[1])
        print(f"Verified {len(m['files'])} files; source={m['sourceSha']}; ciRunId={m['ciRunId']}")
    elif command == "caddy":
        caddy(args[0], len(args) > 1 and args[1] == "--preview")
    elif command == "check-http":
        check_http(pathlib.Path(args[0]), args[1])
    else:
        raise ValueError("Use prepare, verify, caddy or check-http")
