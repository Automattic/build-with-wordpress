import type { GeneratedArtifact, NormalizedSelection } from "./types";
import { buildWordPressRunnerRequest, toWebsiteArtifactBundle } from "./payload";
import { generateWebsiteArtifact } from "./index";

export function generateStaticArtifact(selection: NormalizedSelection): GeneratedArtifact {
  const websiteArtifact = generateWebsiteArtifact(selection.root, {
    title: selection.name,
    includeMetadata: true,
    generatedAt: selection.exportedAt,
  });
  const html = websiteArtifact.files["index.html"] || "";
  const css = websiteArtifact.files["assets/styles.css"] || "";
  const runnerRequest = buildWordPressRunnerRequest(toWebsiteArtifactBundle(websiteArtifact, selection), selection);

  return {
    title: selection.name,
    html,
    css,
    runnerRequest,
    files: websiteArtifact.files,
    diagnostics: websiteArtifact.diagnostics,
    metadata: websiteArtifact.metadata,
  };
}
