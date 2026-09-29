import "react-native-gesture-handler";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerRootComponent } from "expo";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

import { view } from "./storybook.requires";

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

function ShowcaseRoot() {
  // Full-screen modal examples need window insets. A provider inside the already
  // inset Storybook canvas measures zero and puts dismiss controls under system bars.
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><StorybookUIRoot /></SafeAreaProvider>;
}

registerRootComponent(ShowcaseRoot);

export default ShowcaseRoot;
