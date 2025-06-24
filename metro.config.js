const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)

// Configuration pour React Native SVG
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer")
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg")
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"]

// Configuration pour les alias
config.resolver.alias = {
  "@": "./src",
  "@components": "./src/components",
  "@screens": "./src/screens",
  "@contexts": "./src/contexts",
  "@utils": "./src/utils",
  "@types": "./src/types",
  "@assets": "./src/assets",
  "@services": "./src/services",
  "@hooks": "./src/hooks",
}

// Configuration pour les extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, "ts", "tsx", "js", "jsx", "json", "svg"]

module.exports = config
