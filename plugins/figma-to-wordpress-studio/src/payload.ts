import type { WebsiteArtifact } from "./index";
import type { GeneratedArtifact, NormalizedSceneNode, NormalizedSelection } from "./types";

export type WebsiteArtifactFileRole = "html" | "css" | "js" | "asset" | "metadata";

export interface WebsiteArtifactBundleFile {
  path: string;
  content?: string;
  content_base64?: string;
  role?: WebsiteArtifactFileRole;
  mime_type?: string;
}

export interface WebsiteArtifactBundle {
  schema: "blocks-engine/php-transformer/site-artifact/v1";
  root: "website/";
  entrypoint: "website/index.html";
  files: WebsiteArtifactBundleFile[];
  import_source: "figma-to-wordpress-studio";
}

export interface FigmaSourceDebugSummary {
  scope: NormalizedSelection["selectionIntent"]["scope"];
  pageId: string;
  selectedNodeCount: number;
  nodeCount: number;
  assetCount: number;
  diagnosticCount: number;
  warningCount: number;
  errorCount: number;
}

export interface FigmaSourcePayload {
  schema: "wordpress-studio/figma-source/v1";
  source: {
    type: "figma";
    metadata: NormalizedSelection["source"];
    exportedAt: string;
  };
  intent: NormalizedSelection["selectionIntent"];
  scenegraph: {
    currentPage: NormalizedSelection["currentPage"];
    selectedNodes: NormalizedSelection["selectedNodes"];
  };
  assets: NormalizedSelection["assets"];
  transform: {
    target: "wordpress";
    route: "static-site-importer/figma";
    options: {
      selectionScope: NormalizedSelection["selectionIntent"]["scope"];
      pageId: string;
      selectedNodeIds: string[];
      preserveSourceScenegraph: true;
      importAssets: true;
    };
  };
  debug: {
    handoffId?: string;
    summary: FigmaSourceDebugSummary;
    diagnostics: GeneratedArtifact["diagnostics"];
    metadata?: GeneratedArtifact["metadata"];
  };
}

export function toFigmaSourcePayload(
  selection: NormalizedSelection,
  artifact?: GeneratedArtifact | null,
  handoffId?: string,
): FigmaSourcePayload {
  return {
    schema: "wordpress-studio/figma-source/v1",
    source: {
      type: "figma",
      metadata: selection.source,
      exportedAt: selection.exportedAt,
    },
    intent: selection.selectionIntent,
    scenegraph: {
      currentPage: selection.currentPage,
      selectedNodes: selection.selectedNodes,
    },
    assets: selection.assets,
    transform: {
      target: "wordpress",
      route: "static-site-importer/figma",
      options: {
        selectionScope: selection.selectionIntent.scope,
        pageId: selection.selectionIntent.pageId,
        selectedNodeIds: selection.selectionIntent.selectedNodeIds,
        preserveSourceScenegraph: true,
        importAssets: true,
      },
    },
    debug: {
      handoffId,
      summary: sourceDebugSummary(selection, artifact),
      diagnostics: artifact?.diagnostics || [],
      metadata: artifact?.metadata,
    },
  };
}

export function sourceDebugSummary(
  selection: NormalizedSelection,
  artifact?: GeneratedArtifact | null,
): FigmaSourceDebugSummary {
  const selectedRootNodes = selection.selectedNodes.length ? selection.selectedNodes : [selection.currentPage];

  return {
    scope: selection.selectionIntent.scope,
    pageId: selection.selectionIntent.pageId,
    selectedNodeCount: selection.selectionIntent.selectedNodeIds.length,
    nodeCount: selectedRootNodes.reduce((count, node) => count + countSceneNodes(node), 0),
    assetCount: selection.assets.length,
    diagnosticCount: artifact?.diagnostics.length || 0,
    warningCount: artifact?.diagnostics.filter((diagnostic) => diagnostic.level === "warning").length || 0,
    errorCount: artifact?.diagnostics.filter((diagnostic) => diagnostic.level === "error").length || 0,
  };
}

export function toWebsiteArtifactBundle(artifact: WebsiteArtifact, _selection: NormalizedSelection): WebsiteArtifactBundle {
  return {
    schema: "blocks-engine/php-transformer/site-artifact/v1",
    root: "website/",
    entrypoint: "website/index.html",
    files: Object.entries(artifact.files).map(([filePath, content]) => toWebsiteArtifactBundleFile(filePath, content)),
    import_source: "figma-to-wordpress-studio",
  };
}

function countSceneNodes(node: NormalizedSceneNode): number {
  return 1 + (node.children || []).reduce((count, child) => count + countSceneNodes(child), 0);
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
