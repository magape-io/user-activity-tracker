// rollup.config.js
export default {
  input: "./index.js",
  output: {
    file: "dist/user-activity-monitor.js",
    format: "umd",
    name: "UserActivityMonitor",
  },
};
