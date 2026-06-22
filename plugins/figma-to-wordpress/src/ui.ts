import { getExportDocument, getPlaygroundUrl } from "./playground-runner";
import type { GeneratedArtifact, NormalizedSelection, PluginToUiMessage, UiToPluginMessage } from "./types";

let currentArtifact: GeneratedArtifact | null = null;
let currentSelection: NormalizedSelection | null = null;

const statusElement = document.querySelector<HTMLParagraphElement>("#status");
const sceneElement = document.querySelector<HTMLPreElement>("#scene");
const previewElement = document.querySelector<HTMLDivElement>("#preview");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");
const copyButton = document.querySelector<HTMLButtonElement>("#copy");
const exportButton = document.querySelector<HTMLButtonElement>("#export");
const playgroundButton = document.querySelector<HTMLButtonElement>("#playground");

function sendToPlugin(message: UiToPluginMessage) {
  parent.postMessage({ pluginMessage: message }, "*");
}

function setStatus(message: string) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function renderPreview() {
  if (!previewElement) {
    return;
  }

  previewElement.textContent = "";

  if (!currentArtifact) {
    previewElement.textContent = "Select a frame or node in Figma.";
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.title = `${currentArtifact.title} preview`;
  iframe.srcdoc = getExportDocument(currentArtifact);
  previewElement.append(iframe);
}

function updateActions() {
  const disabled = !currentArtifact;

  if (copyButton) copyButton.disabled = disabled;
  if (exportButton) exportButton.disabled = disabled;
  if (playgroundButton) playgroundButton.disabled = disabled;
}

async function copyHtml() {
  if (!currentArtifact) {
    return;
  }

  await navigator.clipboard.writeText(getExportDocument(currentArtifact));
  sendToPlugin({ type: "notify", message: "Copied generated HTML." });
}

function exportHtml() {
  if (!currentArtifact) {
    return;
  }

  const blob = new Blob([getExportDocument(currentArtifact)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentArtifact.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "figma-artifact"}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function openPlayground() {
  if (currentArtifact) {
    window.open(getPlaygroundUrl(currentArtifact), "_blank", "noopener,noreferrer");
  }
}

function renderSelection(selection: NormalizedSelection | null, artifact: GeneratedArtifact | null) {
  currentSelection = selection;
  currentArtifact = artifact;

  if (!selection) {
    setStatus("Select a frame or node to generate a preview.");
    if (sceneElement) sceneElement.textContent = "No selection loaded.";
  } else {
    setStatus(`${selection.name} (${selection.type}) exported with ${selection.assets.length} asset(s).`);
    if (sceneElement) sceneElement.textContent = JSON.stringify(currentSelection, null, 2);
  }

  renderPreview();
  updateActions();
}

window.onmessage = (event: MessageEvent<{ pluginMessage?: PluginToUiMessage }>) => {
  const message = event.data.pluginMessage;

  if (!message) {
    return;
  }

  if (message.type === "selection") {
    renderSelection(message.selection, message.artifact);
    return;
  }

  if (message.type === "error") {
    setStatus(message.message);
  }
};

refreshButton?.addEventListener("click", () => sendToPlugin({ type: "refresh-selection" }));
copyButton?.addEventListener("click", () => void copyHtml());
exportButton?.addEventListener("click", exportHtml);
playgroundButton?.addEventListener("click", openPlayground);

sendToPlugin({ type: "refresh-selection" });
