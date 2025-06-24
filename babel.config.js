module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./", // <- change ici
            "@components": "./components",
            "@screens": "./screens",
            "@contexts": "./contexts",
            "@utils": "./utils",
            "@types": "./types",
            "@assets": "./assets",
            "@services": "./services", // <- garde ce chemin direct
            "@hooks": "./hooks",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};




// module.exports = (api) => {
//   api.cache(true)
//   return {
//     presets: ["babel-preset-expo"],
//     plugins: [
//       [
//         "module-resolver",
//         {
//           root: ["./"],
//           alias: {
//             "@": "./src",
//             "@components": "./src/components",
//             "@screens": "./src/screens",
//             "@contexts": "./src/contexts",
//             "@utils": "./src/utils",
//             "@types": "./src/types",
//             "@assets": "./src/assets",
//             "@services": "./src/services",
//             "@hooks": "./src/hooks",
//           },
//         },
//       ],
//       "react-native-reanimated/plugin",
//     ],
//   }
// }
