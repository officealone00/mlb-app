import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mlb-ranking", // 콘솔에 등록할 appName
  brand: {
    displayName: "MLB 순위",
    primaryColor: "#002D72", // MLB 공식 네이비
    icon: "", // 콘솔에서 업로드한 아이콘 URL
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  webViewProps: {
    navigationBar: {
      withBackButton: false,
    },
  },
  permissions: [],
  outdir: "dist",
});
