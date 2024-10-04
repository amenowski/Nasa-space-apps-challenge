// vite.config.js or vite.config.ts
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

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

    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: "src/assets/data/*.json",
                    dest: "data",
                },
                {
                    src: "src/assets/textures/*.png",
                    dest: "textures",
                },
                {
                    src: "src/assets/textures/*.jpg",
                    dest: "textures",
                },
                {
                    src: "src/assets/textures/*.webp",
                    dest: "textures",
                },
                {
                    src: "src/assets/textures/skybox/*.png",
                    dest: "textures/skybox",
                },
            ],
        }),
    ],
});
