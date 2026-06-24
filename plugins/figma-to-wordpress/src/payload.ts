import type { WebsiteArtifact } from "./index";
import type { NormalizedAsset, NormalizedSceneNode, NormalizedSelection } from "./types";

export type WebsiteArtifactFileRole = "html" | "css" | "js" | "asset" | "metadata";

export interface WebsiteArtifactBundleFile {
  path: string;
  content?: string;
  content_base64?: string;
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
  figma: FigmaScenegraphPayload;
}

export interface FigmaScenegraphPayload {
  schema: "figma-to-wordpress/scenegraph/v1";
  name: string;
  exportedAt: string;
  root: NormalizedSceneNode;
  nodes: NormalizedSceneNode[];
  assets: NormalizedAsset[];
}

export function toWebsiteArtifactBundle(artifact: WebsiteArtifact, selection: NormalizedSelection): WebsiteArtifactBundle {
  return {
    schema: "figma-to-wordpress/website-artifact-bundle/v1",
    root: "website/",
    entrypoint: "website/index.html",
    files: Object.entries(artifact.files).map(([filePath, content]) => toWebsiteArtifactBundleFile(filePath, content)),
    import_source: "figma-to-wordpress",
  };
}

function toWebsiteArtifactBundleFile(filePath: string, content: string): WebsiteArtifactBundleFile {
  const file: WebsiteArtifactBundleFile = {
    path: filePath.startsWith("website/") ? filePath : `website/${filePath}`,
    role: fileRole(filePath),
    mime_type: mimeType(filePath),
  };
  const dataUri = parseDataUri(content);
  if (dataUri) {
    file.content_base64 = dataUri.contentBase64;
    file.mime_type = dataUri.mimeType;
  } else {
    file.content = content;
  }

  return file;
}

function parseDataUri(content: string): { mimeType: string; contentBase64: string } | null {
  const match = content.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    contentBase64: match[2],
  };
}

export function buildWordPressRunnerRequest(_bundle: WebsiteArtifactBundle, selection: NormalizedSelection): WordPressRunnerRequest {
  return {
    schema: "figma-to-wordpress/runner-request/v1",
    source: {
      tool: "figma",
      nodeIds: [selection.id],
      exportedAt: selection.exportedAt,
    },
    goal: `Import ${selection.name} into WordPress using Static Site Importer inside a browser Playground session.`,
    figma: toFigmaScenegraphPayload(selection),
  };
}

function toFigmaScenegraphPayload(selection: NormalizedSelection): FigmaScenegraphPayload {
  return {
    schema: "figma-to-wordpress/scenegraph/v1",
    name: selection.name,
    exportedAt: selection.exportedAt,
    root: selection.root,
    nodes: selection.root.children?.length ? selection.root.children : [selection.root],
    assets: selection.assets,
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
