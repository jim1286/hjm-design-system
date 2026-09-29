# Full iOS showcase menu compatibility

Expo 57.0.25/RN 0.86.2, existing iPhone 17 iOS 27 simulator. The complete host built
with all optional menu modules enabled (`/tmp/hjm-full-ios-build4.log`, exit 0).
The pinned same-major iOS overrides and patches are documented in LIBRARY_POLICY
and shipped under the Native package's docs/patches directory.

Long-press opened the OS menu (`ios-menu-open.png`); choosing save changed the
showcase result to `save` (`ios-menu-save.png`). This proves the full host's linked
menu action, not just an isolated Orb host or a JavaScript export. The upstream
adapter logged its menu-hide timeout before completing the callback under heavy
host load; no lost action or application crash was observed. Physical-device and
screen-reader certification is outside this evidence.
