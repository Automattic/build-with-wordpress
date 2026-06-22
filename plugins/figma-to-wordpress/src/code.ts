import { generateStaticArtifact } from "./exporter";
import type { NormalizedAsset, NormalizedDocument, NormalizedSceneNode, PluginToUiMessage, UiToPluginMessage } from "./types";

figma.showUI(__html__, { width: 420, height: 420, themeColors: true });

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
        color: "color" in typedPaint ? typedPaint.color : undefined,
      };
    });
}

function normalizeTextStyle(node: TextNode) {
  return {
    fontFamily: typeof node.fontName === "object" ? node.fontName.family : undefined,
    fontSize: typeof node.fontSize === "number" ? node.fontSize : undefined,
    fontWeight: typeof node.fontName === "object" ? node.fontName.style : undefined,
    textAlignHorizontal: node.textAlignHorizontal,
  };
}

function normalizeNode(node: SceneNode | PageNode, fallbackType?: string): NormalizedSceneNode {
  const bounds = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
  const normalized: NormalizedSceneNode = {
    id: node.id,
    name: node.name,
    type: fallbackType || node.type,
    visible: "visible" in node ? node.visible : true,
    x: bounds?.x,
    y: bounds?.y,
    width: bounds?.width,
    height: bounds?.height,
    fills: "fills" in node ? normalizePaints(clonePaints(node, "fills")) : undefined,
    strokes: "strokes" in node ? normalizePaints(clonePaints(node, "strokes")) : undefined,
  };

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
    normalized.children = node.children.map((child) => normalizeNode(child));
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

  const pages = figma.root.children.map((page) => normalizeNode(page, "PAGE"));
  const root: NormalizedSceneNode = {
    id: figma.root.id,
    name: figma.root.name || "Figma document",
    type: "DOCUMENT",
    visible: true,
    children: pages,
  };

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

  if (message.type === "open-playground") {
    figma.openExternal(message.url);
    return;
  }

  if (message.type === "notify") {
    figma.notify(message.message);
  }
};

void refreshDocument();
