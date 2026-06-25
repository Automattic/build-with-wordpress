import type { GeneratedArtifact, NormalizedSelection, PluginToUiMessage, UiToPluginMessage } from "./types";

let currentArtifact: GeneratedArtifact | null = null;
let currentSelection: NormalizedSelection | null = null;

const statusElement = document.querySelector<HTMLParagraphElement>("#status");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");
const studioButton = document.querySelector<HTMLButtonElement>("#studio");
const studioHandoffEndpoint = "http://127.0.0.1:48732/figma-to-wordpress/import";

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
  const disabled = !currentArtifact;

  if (studioButton) studioButton.disabled = disabled;
}

function artifactFileName(artifact: GeneratedArtifact): string {
  const slug = artifact.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "figma-wordpress-import";

  return `${slug}.studio-import.json`;
}

function studioCreateCommand(artifact: GeneratedArtifact): string {
  return `studio create --from ./${artifactFileName(artifact)}`;
}

async function copyStudioCommand() {
  if (!currentArtifact) {
    return;
  }

  const command = studioCreateCommand(currentArtifact);

  try {
    await navigator.clipboard.writeText(command);
    setStatus("Studio command copied. Save the import payload beside the path in the command, then run it in a terminal.");
    sendToPlugin({ type: "notify", message: "Studio command copied." });
  } catch (error) {
    console.error("[Figma to WordPress Studio] Could not copy Studio command.", error);
    setStatus("Copy failed. Select the command text and copy it manually.");
  }
}

function downloadStudioPayload() {
  if (!currentArtifact) {
    log("Studio import payload requested before artifact was ready.");
    return;
  }

  const fileName = artifactFileName(currentArtifact);
  const blob = new Blob([JSON.stringify(currentArtifact.studioImportPayload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  setStatus(`Saved ${fileName}. Run the Studio command with the file path to create the WordPress site.`);
  log("Studio import payload prepared.", {
    fileName,
    command: studioCreateCommand(currentArtifact),
    ...artifactBundleSummary(currentArtifact),
  });
  void copyStudioCommand();
}

async function openInStudio() {
  if (!currentArtifact) {
    log("Studio import requested before artifact was ready.");
    return;
  }

  if (studioButton) {
    studioButton.disabled = true;
  }
  setStatus("Sending this Figma file to WordPress Studio...");

  try {
    const response = await fetch(studioHandoffEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artifact: currentArtifact.studioImportPayload,
        siteName: currentArtifact.title,
      }),
    });
    const data = await response.json().catch(() => null) as { success?: boolean; error?: string } | null;

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || `Studio handoff failed with HTTP ${response.status}.`);
    }

    setStatus("Studio created the WordPress site and is opening it in your browser.");
    sendToPlugin({ type: "notify", message: "Sent to WordPress Studio." });
    log("Studio import handoff accepted.", {
      endpoint: studioHandoffEndpoint,
      ...artifactBundleSummary(currentArtifact),
    });
  } catch (error) {
    console.error("[Figma to WordPress Studio] Studio handoff failed.", error);
    setStatus("Could not reach WordPress Studio. Saved the import payload and copied the CLI fallback command.");
    downloadStudioPayload();
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
