import type { WebsiteArtifact } from "./index";
import type { NormalizedSelection } from "./types";

export type WebsiteArtifactFileRole = "html" | "css" | "js" | "asset" | "metadata";

export interface WebsiteArtifactBundleFile {
  path: string;
  content: string;
  role?: WebsiteArtifactFileRole;
  mime_type?: string;
}

export interface WebsiteArtifactBundle {
  schema: "figma-to-wordpress/website-artifact-bundle/v1";
  root: "website/";
  entrypoint: "website/index.html";
  files: WebsiteArtifactBundleFile[];
  import_source: "figma-to-wordpress";
}

export interface WordPressRunnerRequest {
  schema: "figma-to-wordpress/runner-request/v1";
  source: {
    tool: "figma";
    fileKey?: string;
    nodeIds?: string[];
    exportedAt: string;
  };
  goal: string;
  artifact_bundle: WebsiteArtifactBundle;
}

export function toWebsiteArtifactBundle(artifact: WebsiteArtifact, selection: NormalizedSelection): WebsiteArtifactBundle {
  return {
    schema: "figma-to-wordpress/website-artifact-bundle/v1",
    root: "website/",
    entrypoint: "website/index.html",
    files: Object.entries(artifact.files).map(([filePath, content]) => ({
      path: filePath.startsWith("website/") ? filePath : `website/${filePath}`,
      content,
      role: fileRole(filePath),
      mime_type: mimeType(filePath),
    })),
    import_source: "figma-to-wordpress",
  };
}

export function buildWordPressRunnerRequest(bundle: WebsiteArtifactBundle, selection: NormalizedSelection): WordPressRunnerRequest {
  return {
    schema: "figma-to-wordpress/runner-request/v1",
    source: {
      tool: "figma",
      nodeIds: [selection.id],
      exportedAt: selection.exportedAt,
    },
    goal: `Import ${selection.name} into WordPress using Static Site Importer inside a browser Playground session.`,
    artifact_bundle: bundle,
  };
}

function fileRole(filePath: string): WebsiteArtifactFileRole {
  if (/\.html?$/.test(filePath)) return "html";
  if (/\.css$/.test(filePath)) return "css";
  if (/\.js$/.test(filePath)) return "js";
  if (/\.json$/.test(filePath)) return "metadata";
  return "asset";
}

function mimeType(filePath: string): string | undefined {
  if (/\.html?$/.test(filePath)) return "text/html";
  if (/\.css$/.test(filePath)) return "text/css";
  if (/\.js$/.test(filePath)) return "text/javascript";
  if (/\.json$/.test(filePath)) return "application/json";
  if (/\.svg$/.test(filePath)) return "image/svg+xml";
  if (/\.png$/.test(filePath)) return "image/png";
  return undefined;
}
