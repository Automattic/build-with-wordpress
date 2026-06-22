import type { GeneratedArtifact, NormalizedSelection } from "./types";
import { buildPlaygroundPreviewUrl, buildRunnerPayload, toRunnerArtifact } from "./payload";
import { generateWebsiteArtifact } from "./index";

export function generateStaticArtifact(selection: NormalizedSelection): GeneratedArtifact {
  const websiteArtifact = generateWebsiteArtifact(selection.root, {
    title: selection.name,
    includeMetadata: true,
    generatedAt: selection.exportedAt,
  });
  const html = websiteArtifact.files["index.html"] || "";
  const css = websiteArtifact.files["assets/styles.css"] || "";
  const runnerPayload = buildRunnerPayload(toRunnerArtifact(websiteArtifact, selection));

  return {
    title: selection.name,
    html,
    css,
    playgroundUrl: buildPlaygroundPreviewUrl(runnerPayload),
    files: websiteArtifact.files,
    diagnostics: websiteArtifact.diagnostics,
    metadata: websiteArtifact.metadata,
  };
}
