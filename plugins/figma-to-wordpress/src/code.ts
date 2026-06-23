import { generateStaticArtifact } from "./exporter";
import type { NormalizedAsset, NormalizedDocument, NormalizedSceneNode, PluginToUiMessage, UiToPluginMessage } from "./types";

figma.showUI(__html__, { width: 420, height: 420, themeColors: true });

const runnerEndpointStorageKey = "figma-to-wordpress-runner-endpoint";

function postToUi(message: PluginToUiMessage) {
  figma.ui.postMessage(message);
}

function clonePaints(node: SceneNode | PageNode, property: "fills" | "strokes") {
  if (property === "fills" && "fills" in node) {
    return node.fills === figma.mixed ? "mixed" : node.fills;
  }

  if (property === "strokes" && "strokes" in node) {
    return node.strokes;
  }

  return undefined;
}

function normalizePaints(paints: unknown) {
  if (!Array.isArray(paints)) {
    return undefined;
  }

  return paints
    .filter((paint) => paint && typeof paint === "object" && "type" in paint)
    .map((paint) => {
      const typedPaint = paint as SolidPaint;
      return {
        type: typedPaint.type,
        visible: typedPaint.visible,
        opacity: typedPaint.opacity,
        imageHash: "imageHash" in typedPaint && typeof typedPaint.imageHash === "string" ? typedPaint.imageHash : undefined,
        color: "color" in typedPaint ? typedPaint.color : undefined,
      };
    });
}

function hasImagePaint(paints: unknown): boolean {
  return Array.isArray(paints) && paints.some((paint) => {
    return !!paint && typeof paint === "object" && "type" in paint && paint.type === "IMAGE" && (!("visible" in paint) || paint.visible !== false);
  });
}

function normalizeTextStyle(node: TextNode) {
  return {
    fontFamily: typeof node.fontName === "object" ? node.fontName.family : undefined,
    fontSize: typeof node.fontSize === "number" ? node.fontSize : undefined,
    fontWeight: typeof node.fontName === "object" ? node.fontName.style : undefined,
    lineHeight: typeof node.lineHeight === "object" && node.lineHeight.unit === "PIXELS" ? node.lineHeight.value : undefined,
    textAlignHorizontal: node.textAlignHorizontal,
  };
}

function applyDerivedBounds(node: NormalizedSceneNode) {
  const children = (node.children || []).filter(
    (child) => child.x !== undefined && child.y !== undefined && child.width !== undefined && child.height !== undefined,
  );

  if (!children.length) {
    return;
  }

  const minX = Math.min(...children.map((child) => child.x || 0));
  const minY = Math.min(...children.map((child) => child.y || 0));
  const maxX = Math.max(...children.map((child) => (child.x || 0) + (child.width || 0)));
  const maxY = Math.max(...children.map((child) => (child.y || 0) + (child.height || 0)));

  if (node.x === undefined) normalizedNumberAssign(node, "x", minX);
  if (node.y === undefined) normalizedNumberAssign(node, "y", minY);
  if (node.width === undefined) normalizedNumberAssign(node, "width", maxX - minX);
  if (node.height === undefined) normalizedNumberAssign(node, "height", maxY - minY);
}

function normalizedNumberAssign(node: NormalizedSceneNode, key: "x" | "y" | "width" | "height", value: number) {
  if (Number.isFinite(value)) {
    node[key] = value;
  }
}

async function normalizeNode(node: SceneNode | PageNode, fallbackType?: string): Promise<NormalizedSceneNode> {
  const bounds = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
  const fills = "fills" in node ? clonePaints(node, "fills") : undefined;
  const hasImageFill = hasImagePaint(fills);
  const normalized: NormalizedSceneNode = {
    id: node.id,
    name: node.name,
    type: fallbackType || (hasImageFill ? "IMAGE" : node.type),
    visible: "visible" in node ? node.visible : true,
    x: bounds?.x,
    y: bounds?.y,
    width: bounds?.width,
    height: bounds?.height,
    fills: normalizePaints(fills),
    strokes: "strokes" in node ? normalizePaints(clonePaints(node, "strokes")) : undefined,
  };

  if (hasImageFill && "exportAsync" in node) {
    const asset = await exportAsset(node as SceneNode);
    if (asset) {
      normalized.image = {
        dataUri: asset.dataUrl,
        alt: node.name,
      };
    }
  }

  if (node.type === "TEXT") {
    normalized.characters = node.characters;
    normalized.style = normalizeTextStyle(node);
  }

  if ("opacity" in node) {
    normalized.opacity = node.opacity;
  }

  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    normalized.cornerRadius = node.cornerRadius;
  }

  if ("children" in node) {
    normalized.children = await Promise.all(node.children.map((child) => normalizeNode(child)));
    applyDerivedBounds(normalized);
  }

  return normalized;
}

function bytesToDataUrl(bytes: Uint8Array, mimeType: string) {
  return `data:${mimeType};base64,${figma.base64Encode(bytes)}`;
}

async function exportAsset(node: SceneNode): Promise<NormalizedAsset | null> {
  if (!("exportAsync" in node)) {
    return null;
  }

  try {
    const bytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 1 } });

    return {
      id: node.id,
      name: `${node.name}.png`,
      format: "PNG",
      dataUrl: bytesToDataUrl(bytes, "image/png"),
    };
  } catch (error) {
    console.warn("Unable to export selected node", error);
    return null;
  }
}

async function getDocument(): Promise<NormalizedDocument> {
  if ("loadAllPagesAsync" in figma) {
    await figma.loadAllPagesAsync();
  }

  const pages = await Promise.all(figma.root.children.map((page) => normalizeNode(page, "PAGE")));
  const root: NormalizedSceneNode = {
    id: figma.root.id,
    name: figma.root.name || "Figma document",
    type: "DOCUMENT",
    visible: true,
    children: pages,
  };
  applyDerivedBounds(root);

  return {
    id: figma.root.id,
    name: figma.root.name || "Figma document",
    type: "DOCUMENT",
    exportedAt: new Date().toISOString(),
    root,
    assets: [],
  };
}

async function refreshDocument() {
  try {
    const selection = await getDocument();
    postToUi({
      type: "selection",
      selection,
      artifact: generateStaticArtifact(selection),
    });
  } catch (error) {
    postToUi({ type: "error", message: error instanceof Error ? error.message : "Failed to read the Figma document." });
  }
}

figma.ui.onmessage = async (message: UiToPluginMessage) => {
  if (message.type === "refresh-document") {
    await refreshDocument();
    return;
  }

  if (message.type === "get-runner-endpoint") {
    const endpoint = await figma.clientStorage.getAsync(runnerEndpointStorageKey);
    postToUi({ type: "runner-endpoint", endpoint: typeof endpoint === "string" ? endpoint : null });
    return;
  }

  if (message.type === "set-runner-endpoint") {
    await figma.clientStorage.setAsync(runnerEndpointStorageKey, message.endpoint);
    return;
  }

  if (message.type === "open-wordpress") {
    figma.openExternal(message.url);
    return;
  }

  if (message.type === "notify") {
    figma.notify(message.message);
  }
};

void refreshDocument();
