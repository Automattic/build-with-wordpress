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
  assets: NormalizedAsset[];
};

export type NormalizedDocument = NormalizedSelection;

export type GeneratedArtifact = {
  title: string;
  html: string;
  css: string;
  runnerRequest: unknown;
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
      type: "runner-endpoint";
      endpoint: string | null;
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
      type: "get-runner-endpoint";
    }
  | {
      type: "set-runner-endpoint";
      endpoint: string;
    }
  | {
      type: "open-wordpress";
      url: string;
    }
  | {
      type: "notify";
      message: string;
    };
