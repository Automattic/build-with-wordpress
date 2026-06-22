import { generateStaticArtifact } from "./exporter";
import type { NormalizedAsset, NormalizedSceneNode, NormalizedSelection, PluginToUiMessage, UiToPluginMessage } from "./types";

figma.showUI(__html__, { width: 420, height: 640, themeColors: true });

function postToUi(message: PluginToUiMessage) {
  figma.ui.postMessage(message);
}

function clonePaints(node: SceneNode, property: "fills" | "strokes") {
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

function normalizeNode(node: SceneNode): NormalizedSceneNode {
  const bounds = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
  const normalized: NormalizedSceneNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    x: bounds?.x,
    y: bounds?.y,
    width: bounds?.width,
    height: bounds?.height,
    fills: normalizePaints(clonePaints(node, "fills")),
    strokes: normalizePaints(clonePaints(node, "strokes")),
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

async function getSelection(): Promise<NormalizedSelection | null> {
  const [selectedNode] = figma.currentPage.selection;

  if (!selectedNode) {
    return null;
  }

  const asset = await exportAsset(selectedNode);
  const root = normalizeNode(selectedNode);

  return {
    id: selectedNode.id,
    name: selectedNode.name,
    type: selectedNode.type,
    exportedAt: new Date().toISOString(),
    root,
    assets: asset ? [asset] : [],
  };
}

async function refreshSelection() {
  try {
    const selection = await getSelection();
    postToUi({
      type: "selection",
      selection,
      artifact: selection ? generateStaticArtifact(selection) : null,
    });
  } catch (error) {
    postToUi({ type: "error", message: error instanceof Error ? error.message : "Failed to read selection." });
  }
}

figma.ui.onmessage = async (message: UiToPluginMessage) => {
  if (message.type === "refresh-selection") {
    await refreshSelection();
    return;
  }

  if (message.type === "notify") {
    figma.notify(message.message);
  }
};

figma.on("selectionchange", () => {
  void refreshSelection();
});

void refreshSelection();
