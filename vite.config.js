// vite.config.js or vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        proxy: {
            "/api": {
                target: "https://ssd-api.jpl.nasa.gov",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
            "/model": {
                target: "https://3d-asteroids.space",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/model/, ""),
            },
        },
        cors: {
            origin: "*", // Allows any origin
            methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
        },
    },
});
