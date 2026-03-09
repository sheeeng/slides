// Injects the Google Analytics gtag.js snippet into a built HTML file.
// Usage: node scripts/inject-ga.mjs <file>

import { readFileSync, writeFileSync } from "fs";

const GA_ID = "G-J5M1ZFQ070";
const file = process.argv[2];

if (!file) {
  console.error("Usage: node scripts/inject-ga.mjs <file>");
  process.exit(1);
}

const snippet = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_ID}');
</script>`;

const html = readFileSync(file, "utf8");
writeFileSync(file, html.replace("</head>", snippet + "\n</head>"));
