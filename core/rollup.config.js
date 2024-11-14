// rollup.config.js
import terser from '@rollup/plugin-terser';

export default {
  input: "./index.js",
  output: {
    file: "dist/user-activity-monitor.js",
    format: "umd",
    name: "UserActivityMonitor",
  },
  plugins: [
    terser({
      format: {
        comments: false, // 删除所有注释
      },
      compress: {
        drop_console: false, // 保留 console
      }
    })
  ]
};
