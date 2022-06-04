module.exports = {
  assets: ["./assets/fonts"],
  project: {
    android: {
      sourceDir: "./client",
    },
  },
  dependencies: {
    "react-native-vector-icons": {
      platforms: {
        ios: null,
      },
    },
  },
};
