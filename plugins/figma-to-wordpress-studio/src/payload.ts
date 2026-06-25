import type { WebsiteArtifact } from "./index";
import type { GeneratedArtifact, NormalizedSelection } from "./types";

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
  debug?: {
    generatedArtifact?: GeneratedArtifact["studioImportPayload"];
    diagnostics: GeneratedArtifact["diagnostics"];
    metadata?: GeneratedArtifact["metadata"];
  };
}

export function toFigmaSourcePayload(selection: NormalizedSelection, artifact?: GeneratedArtifact | null): FigmaSourcePayload {
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
    debug: artifact ? {
      generatedArtifact: artifact.studioImportPayload,
      diagnostics: artifact.diagnostics,
      metadata: artifact.metadata,
    } : undefined,
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
