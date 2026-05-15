import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Decks",
        short_name: "Decks",
        description: "Turn ideas into beautiful slide decks instantly.",
        start_url: "/",
        display: "standalone",
        background_color: "#fde047",
        theme_color: "#fde047",
        icons: [
            { src: "/icon",       sizes: "512x512",    type: "image/png" },
            { src: "/apple-icon", sizes: "180x180",    type: "image/png" },
            { src: "/icon-192",   sizes: "192x192",    type: "image/png" },
            { src: "/icon-512",   sizes: "512x512",    type: "image/png", purpose: "maskable" },
        ],
    };
}
