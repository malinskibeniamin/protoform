import { defineComponents } from "blume";

import { DocsEnhancements } from "./components/docs/docs-enhancements";

export default defineComponents({
  layout: {
    PageFooter: {
      client: "load",
      component: DocsEnhancements,
    },
  },
  mdx: {
    BookstoreWorkspace: "./components/docs/bookstore-workspace.astro",
  },
});
