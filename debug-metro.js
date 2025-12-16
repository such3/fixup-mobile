try {
    const { getDefaultConfig } = require("expo/metro-config");
    console.log("expo/metro-config loaded");
    const { withNativeWind } = require("nativewind/metro");
    console.log("nativewind/metro loaded");
    const config = getDefaultConfig(__dirname);
    console.log("default config loaded");
    const output = withNativeWind(config, { input: "./global.css" });
    console.log("withNativeWind success");
} catch (e) {
    console.error("DEBUG ERROR:", e);
}
