export type NormalizedAsset = {
  id: string;
  name: string;
  format: "PNG" | "SVG";
  dataUrl: string;
  mime_type?: string;
  content_base64?: string;
  path?: string;
  node_id?: string;
  imageHash?: string;
};

export type NormalizedSceneNode = {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: NormalizedPaint[];
  strokes?: NormalizedPaint[];
  characters?: string;
  opacity?: number;
  cornerRadius?: number;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    lineHeight?: number | string;
    textAlignHorizontal?: string;
  };
  image?: {
    asset_id?: string;
    imageHash?: string;
    src?: string;
    dataUri?: string;
    alt?: string;
  };
  asset_id?: string;
  href?: string;
  children?: NormalizedSceneNode[];
};

export type NormalizedPaint = {
  type?: string;
  visible?: boolean;
  opacity?: number;
  imageHash?: string;
  imageRef?: string;
  asset_id?: string;
  color?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
};

export type NormalizedSelection = {
  id: string;
  name: string;
  type: string;
  exportedAt: string;
  root: NormalizedSceneNode;
  source: FigmaSourceMetadata;
  selectionIntent: FigmaSelectionIntent;
  currentPage: NormalizedSceneNode;
  selectedNodes: NormalizedSceneNode[];
  assets: NormalizedAsset[];
};

export type NormalizedDocument = NormalizedSelection;

export type FigmaSourceMetadata = {
  provider: "figma";
  plugin: "figma-to-wordpress-studio";
  fileKey?: string;
  fileName: string;
  editorType: string;
  currentPage: {
    id: string;
    name: string;
  };
};

export type FigmaSelectionIntent = {
  scope: "selected-nodes" | "current-page";
  pageId: string;
  pageName: string;
  selectedNodeIds: string[];
  rootNodeIds: string[];
};

export type GeneratedArtifact = {
  title: string;
  html: string;
  css: string;
  studioImportPayload: unknown;
  files: Record<string, string>;
  diagnostics: Array<{
    level: "warning" | "error";
    nodeId: string;
    nodeName: string;
    message: string;
  }>;
  metadata?: unknown;
};

export type PluginToUiMessage =
  | {
      type: "selection";
      selection: NormalizedSelection | null;
      artifact: GeneratedArtifact | null;
    }
  | {
      type: "error";
      message: string;
    };

export type UiToPluginMessage =
  | {
      type: "refresh-document";
    }
  | {
      type: "notify";
      message: string;
    };
