/**
 * Bundled Pretendard faces (SIL OFL 1.1, assets/fonts/LICENSE.txt). Register them with the host's font
 * loader, then pass `fonts="pretendard"` to HjmNativeProvider:
 *
 *   const [loaded] = useFonts(hjmPretendardFonts); // expo-font
 *   <HjmNativeProvider fonts={loaded ? "pretendard" : "system"}>
 *
 * Keys are the face names Text selects per weight (`pretendardNativeFaces`). Five weights cover every
 * typography token (400–800); the remaining four Pretendard weights are not shipped.
 */
export const hjmPretendardFonts = {
    Pretendard: require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.otf"),
};
//# sourceMappingURL=fonts.js.map