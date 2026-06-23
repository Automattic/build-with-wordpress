import { createWordPressPreview } from "./wordpress-runner";
import type { GeneratedArtifact, NormalizedSelection, PluginToUiMessage, UiToPluginMessage } from "./types";

let currentArtifact: GeneratedArtifact | null = null;
let currentSelection: NormalizedSelection | null = null;

const statusElement = document.querySelector<HTMLParagraphElement>("#status");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");
const playgroundButton = document.querySelector<HTMLButtonElement>("#playground");

const defaultRunnerEndpoint = "http://localhost:8882/wp-json/static-site-importer/v1/import-figma";

function sendToPlugin(message: UiToPluginMessage) {
  parent.postMessage({ pluginMessage: message }, "*");
}

function setStatus(message: string) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function updateActions() {
  const disabled = !currentArtifact;

  if (playgroundButton) playgroundButton.disabled = disabled;
}

async function openPlayground() {
  if (!currentArtifact) {
    return;
  }

  if (playgroundButton) {
    playgroundButton.disabled = true;
  }

  setStatus("Creating a WordPress Playground session...");

  try {
    const response = await createWordPressPreview(defaultRunnerEndpoint, currentArtifact);
    sendToPlugin({ type: "open-wordpress", url: response.open_url || "" });
    setStatus("WordPress Playground session created.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not create the WordPress preview session.");
  } finally {
    updateActions();
  }
}

function countDesignScreens(selection: NormalizedSelection): number {
  let count = 0;

  for (const page of selection.root.children || []) {
    for (const node of page.children || []) {
      if (["FRAME", "COMPONENT", "INSTANCE", "SECTION"].indexOf(node.type) !== -1) {
        count += 1;
      }
    }
  }

  return count || selection.root.children?.length || 1;
}

function renderSelection(selection: NormalizedSelection | null, artifact: GeneratedArtifact | null) {
  currentSelection = selection;
  currentArtifact = artifact;

  if (!selection) {
    setStatus("Open this Figma file in WordPress Playground.");
  } else {
    const screenCount = countDesignScreens(selection);
    const diagnosticCount = artifact?.diagnostics.length || 0;
    setStatus(`Ready to import ${screenCount} design screen${screenCount === 1 ? "" : "s"} into WordPress${diagnosticCount ? ` (${diagnosticCount} note${diagnosticCount === 1 ? "" : "s"})` : ""}.`);
  }

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

refreshButton?.addEventListener("click", () => sendToPlugin({ type: "refresh-document" }));
playgroundButton?.addEventListener("click", () => void openPlayground());

sendToPlugin({ type: "refresh-document" });
