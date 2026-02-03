const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const path = require("path");
const basicSsl = require("@vitejs/plugin-basic-ssl");

// =========================================================
// [기존 설정] - 배포 시 참고를 위해 주석 처리함 (삭제 금지)
// =========================================================
/*
module.exports = defineConfig({
  plugins: [react()],
  base: "/tudio/survey/",
  build: {
    outDir: path.resolve(__dirname, "../Tudio/src/main/resources/static/tudio/survey"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/tudio": "http://localhost:8060",
    },
  },
});
*/

// =========================================================
// [신규 설정] - React 마이그레이션 개발용 (현재 활성화됨)
// =========================================================
module.exports = defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  const useHttps = env.USE_HTTPS === 'true'; // 'true' 문자열인지 확인

  return {
    // plugins: [react()],

    plugins: [
      react(),
      // 조건부 플러그인: useHttps가 true일 때만 SSL 적용
      useHttps ? basicSsl() : null 
    ],
    
    // 개발 중에는 루트('/') 경로 사용 -> localhost:5173/admin 접속 가능해짐
    base: "/",

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      host: "0.0.0.0", // 외부 PC(모바일 등)에서 IP로 접속 허용
      port: 5173, // 포트 고정
      proxy: {
        "/api": {
          target: "http://localhost:8060",
          changeOrigin: true,
          secure: false // HTTPS에서 HTTP로 프록시 할 때 에러 방지
        },

        "/tudio": {
          target: "http://localhost:8060",
          changeOrigin: true,
          secure: false
        },

        "/images": {
          target: "http://localhost:8060",
          changeOrigin: true,
          secure: false
        },
      },
    },
  };
});