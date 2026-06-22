import type { GeneratedArtifact } from "./types";

export function getPlaygroundUrl(artifact: GeneratedArtifact) {
  return artifact.playgroundUrl;
}

export function getExportDocument(artifact: GeneratedArtifact) {
  const html = artifact.files["index.html"] || artifact.html;
  const css = artifact.files["assets/styles.css"] || artifact.css;

  if (html.includes('<link rel="stylesheet" href="assets/styles.css">')) {
    return html.replace('<link rel="stylesheet" href="assets/styles.css">', `<style>${css}</style>`);
  }

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${artifact.title}</title>
  <style>${artifact.css}</style>
</head>
<body>${artifact.html}</body>
</html>`;
}
