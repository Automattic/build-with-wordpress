import type { GeneratedArtifact, NormalizedSelection, PluginToUiMessage, UiToPluginMessage } from "./types";
import { toFigmaSourcePayload } from "./payload";

let currentArtifact: GeneratedArtifact | null = null;
let currentSelection: NormalizedSelection | null = null;

const statusElement = document.querySelector<HTMLParagraphElement>("#status");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");
const studioButton = document.querySelector<HTMLButtonElement>("#studio");
const studioHandoffEndpoint = "http://127.0.0.1:48732/figma-to-wordpress/import";

type StudioHandoffResponse = {
  success?: boolean;
  error?: string;
  requestId?: string;
  siteName?: string;
  siteUrl?: string;
  importSummary?: unknown;
};

function log(message: string, details?: unknown) {
  if (typeof details === "undefined") {
    console.info(`[Figma to WordPress Studio] ${message}`);
    return;
  }

  console.info(`[Figma to WordPress Studio] ${message}`, details);
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
  const bundle = artifact?.studioImportPayload as { entrypoint?: string; files?: unknown[] } | null;

  return {
    files: Array.isArray(bundle?.files) ? bundle.files.length : 0,
    entrypoint: typeof bundle?.entrypoint === "string" ? bundle.entrypoint : "",
  };
}

function updateActions() {
  const disabled = !currentSelection;

  if (studioButton) studioButton.disabled = disabled;
}

async function openInStudio() {
  if (!currentSelection) {
    log("Studio import requested before Figma source data was ready.");
    return;
  }

  const handoffId = `figma-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const sourcePayload = toFigmaSourcePayload(currentSelection, currentArtifact, handoffId);
  const summary = sourcePayload.debug.summary;

  if (studioButton) {
    studioButton.disabled = true;
  }
  setStatus(`Sending ${summary.nodeCount} nodes to WordPress Studio...`);

  try {
    const response = await fetch(studioHandoffEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: sourcePayload,
        siteName: currentSelection.name,
      }),
    });
    const data = await response.json().catch(() => null) as StudioHandoffResponse | null;

    if (!response.ok || !data?.success) {
      const requestRef = data?.requestId ? ` Ref ${data.requestId}.` : "";
      throw new Error(`${data?.error || `Studio handoff failed with HTTP ${response.status}.`}${requestRef}`);
    }

    setStatus(`Studio accepted ${data.siteName || currentSelection.name}${data.siteUrl ? ` at ${data.siteUrl}` : ""}.`);
    sendToPlugin({ type: "notify", message: "Sent to WordPress Studio." });
    log("Studio import handoff accepted.", {
      endpoint: studioHandoffEndpoint,
      handoffId,
      requestId: data.requestId,
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      importSummary: data.importSummary,
      schema: sourcePayload.schema,
      selectionScope: sourcePayload.intent.scope,
      pageId: sourcePayload.intent.pageId,
      selectedNodes: sourcePayload.intent.selectedNodeIds.length,
      sourceSummary: summary,
      debugArtifact: artifactBundleSummary(currentArtifact),
    });
  } catch (error) {
    console.error("[Figma to WordPress Studio] Studio handoff failed.", {
      handoffId,
      sourceSummary: summary,
      error,
    });
    setStatus(error instanceof Error ? error.message : "Could not reach WordPress Studio.");
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
    setStatus("Open this Figma file in WordPress Studio.");
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
studioButton?.addEventListener("click", () => void openInStudio());

log("UI loaded.");
sendToPlugin({ type: "refresh-document" });
