import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkZennQiitaDirectives from "./src/lib/markdown/directives";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const site = process.env.PUBLIC_SITE_URL ?? "https://example.com";

// https://astro.build/config
export default defineConfig({
  site,
  output: "static",
  integrations: [react(), mdx()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  markdown: {
    remarkPlugins: [remarkGfm, remarkDirective, remarkZennQiitaDirectives],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            ariaHidden: "true",
            tabIndex: -1,
            className: "heading-anchor",
          },
        },
      ],
    ],
    shikiConfig: {
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
