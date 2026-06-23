import { createWordPressPreview } from "./wordpress-runner";
import type { GeneratedArtifact, NormalizedSelection, PluginToUiMessage, UiToPluginMessage } from "./types";

let currentArtifact: GeneratedArtifact | null = null;
let currentSelection: NormalizedSelection | null = null;

const statusElement = document.querySelector<HTMLParagraphElement>("#status");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");
const playgroundButton = document.querySelector<HTMLButtonElement>("#playground");
const runnerEndpointInput = document.querySelector<HTMLInputElement>("#runner-endpoint");

const defaultRunnerEndpoint = "http://localhost:8882/wp-json/static-site-importer/v1/import-figma";
const runnerEndpointStorageKey = "figma-to-wordpress-runner-endpoint";

function log(message: string, details?: unknown) {
  if (typeof details === "undefined") {
    console.info(`[Figma to WordPress] ${message}`);
    return;
  }

  console.info(`[Figma to WordPress] ${message}`, details);
}

function sendToPlugin(message: UiToPluginMessage) {
  parent.postMessage({ pluginMessage: message }, "*");
}

function setStatus(message: string) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function artifactBundleSummary(artifact: GeneratedArtifact | null) {
  const runnerRequest = artifact?.runnerRequest as { artifact_bundle?: { entrypoint?: string; files?: unknown[] } } | null;
  const bundle = runnerRequest?.artifact_bundle;

  return {
    files: Array.isArray(bundle?.files) ? bundle.files.length : 0,
    entrypoint: typeof bundle?.entrypoint === "string" ? bundle.entrypoint : "",
  };
}

function updateActions() {
  const disabled = !currentArtifact;

  if (playgroundButton) playgroundButton.disabled = disabled;
}

function runnerEndpoint(): string {
  return runnerEndpointInput?.value.trim() || defaultRunnerEndpoint;
}

function persistRunnerEndpoint() {
  const endpoint = runnerEndpoint();

  localStorage.setItem(runnerEndpointStorageKey, endpoint);
}

async function openPlayground() {
  if (!currentArtifact) {
    log("Open requested before artifact was ready.");
    return;
  }

  if (playgroundButton) {
    playgroundButton.disabled = true;
  }

  setStatus("Creating a WordPress Playground session...");
  const endpoint = runnerEndpoint();
  persistRunnerEndpoint();
  log("Opening WordPress runner.", {
    endpoint,
    ...artifactBundleSummary(currentArtifact),
  });

  try {
    const response = await createWordPressPreview(endpoint, currentArtifact);
    log("WordPress runner response received.", response);
    sendToPlugin({ type: "open-wordpress", url: response.open_url || "" });
    setStatus("WordPress Playground session created.");
  } catch (error) {
    console.error("[Figma to WordPress] WordPress runner failed.", error);
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
    log("Document artifact ready.", {
      screens: screenCount,
      diagnostics: diagnosticCount,
      ...artifactBundleSummary(artifact),
    });
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
runnerEndpointInput?.addEventListener("change", persistRunnerEndpoint);

if (runnerEndpointInput) {
  runnerEndpointInput.value = localStorage.getItem(runnerEndpointStorageKey) || defaultRunnerEndpoint;
}

log("UI loaded.", { endpoint: runnerEndpoint() });
sendToPlugin({ type: "refresh-document" });
