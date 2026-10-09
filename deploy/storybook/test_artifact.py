import contextlib
import importlib.util
import io
import pathlib
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("artifact", pathlib.Path(__file__).with_name("artifact.py"))
artifact = importlib.util.module_from_spec(spec)
spec.loader.exec_module(artifact)


class ArtifactIntegrity(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        self.source = self.root / "build"
        self.source.mkdir()
        for name, body in {"index.html": "manager", "iframe.html": "preview", "index.json": '{"entries":{"button--default":{"id":"button--default"}}}'}.items():
            (self.source / name).write_text(body)
        self.output = self.root / "artifact"
        self.sha = "a" * 40

    def prepare(self):
        with contextlib.redirect_stdout(io.StringIO()):
            artifact.prepare(self.source, self.output, self.sha, "123")

    def test_file_tampering_and_extra_file_are_rejected(self):
        self.prepare()
        path = self.output / "public/iframe.html"
        original = path.read_bytes()
        path.write_text("replacement")
        with self.assertRaises(ValueError):
            artifact.verify(self.output, self.sha)
        path.write_bytes(original)
        (self.output / "public/extra.js").write_text("unverified")
        with self.assertRaises(ValueError):
            artifact.verify(self.output, self.sha)

    def test_wrong_source_and_empty_index_are_rejected(self):
        self.prepare()
        with self.assertRaises(ValueError):
            artifact.verify(self.output, "b" * 40)
        (self.source / "index.json").write_text('{"entries":{}}')
        with self.assertRaises(ValueError):
            with contextlib.redirect_stdout(io.StringIO()):
                artifact.prepare(self.source, self.root / "empty", self.sha, "123")

    def test_hidden_env_and_symlinks_cannot_be_published(self):
        env = self.source / ".env"
        env.write_text("private")
        with self.assertRaises(ValueError):
            self.prepare()
        env.unlink()
        (self.source / "linked.html").symlink_to(self.source / "index.html")
        with self.assertRaises(ValueError):
            self.prepare()

    def test_nested_output_and_overwrite_are_rejected(self):
        with self.assertRaises(ValueError):
            artifact.prepare(self.source, self.source / "nested", self.sha, "123")
        self.prepare()
        with self.assertRaises(ValueError):
            self.prepare()


if __name__ == "__main__":
    unittest.main()
