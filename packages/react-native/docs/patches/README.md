# RN 0.86 optional menu compatibility

Only hosts importing `@hjmds/react-native/context-menu-native` need these patches.
HJM's npm installation does not automatically apply them. Copy the three patch
files into your repository and configure your package manager. For pnpm, use:

```yaml
overrides:
  react-native-ios-context-menu: 3.2.1
  react-native-ios-utilities: 5.2.0
patchedDependencies:
  '@react-native-menu/menu@1.2.2': patches/@react-native-menu__menu.patch
  react-native-ios-context-menu@3.2.1: patches/react-native-ios-context-menu.patch
  react-native-ios-utilities@5.2.0: patches/react-native-ios-utilities.patch
```

Install Zeego 3.0.6 and these exact native peers. Reinstall dependencies and iOS
Pods, then rebuild the native client; Fast Refresh cannot update native binaries.
The iOS overrides remain in the same major lane. The older pins force obsolete
Folly dependencies on RN's prebuilt framework. The Android patch adapts hitSlop to
the Kotlin property API while preserving TouchDelegate. The iOS patches correct
subtitle availability and exclude a removed legacy root-content class in Fabric.
Remove each patch when the pinned upstream package incorporates its fix.

The full showcase was built on iOS and its native menu save action was observed.
Android compilation passed with the Kotlin patch. These are specific host results,
not a guarantee for every Expo/RN version or an accessibility certification.
