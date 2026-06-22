import type { WebsiteArtifact } from "./index";
import type { NormalizedSelection } from "./types";

export type GeneratedWebsiteFileRole = "html" | "css" | "js" | "asset" | "metadata";

export interface GeneratedWebsiteFile {
  path: string;
  contents: string;
  role: GeneratedWebsiteFileRole;
  mimeType?: string;
}

export interface GeneratedWebsiteArtifact {
  schemaVersion: "figma-to-wordpress-artifact/v1";
  source: {
    tool: "figma";
    fileKey?: string;
    nodeIds?: string[];
    exportedAt: string;
  };
  site: {
    title: string;
    entrypoint: string;
  };
  files: GeneratedWebsiteFile[];
  notes?: string[];
}

export interface PlaygroundRunnerPayload {
  schemaVersion: "figma-to-wordpress-runner/v1";
  createdAt: string;
  artifact: GeneratedWebsiteArtifact;
  importPlan: {
    runner: "wordpress-playground";
    importer: "static-site-importer";
    blockCompiler: "blocks-engine";
    status: "playground-import";
    boundaries: string[];
  };
}

export interface RunnerUrlOptions {
  runnerBaseUrl: string;
  openMode?: "same-tab" | "new-tab" | "copy-url";
}

export function createSampleArtifact(now = new Date()): GeneratedWebsiteArtifact {
  return {
    schemaVersion: "figma-to-wordpress-artifact/v1",
    source: {
      tool: "figma",
      exportedAt: now.toISOString(),
    },
    site: {
      title: "Figma to WordPress",
      entrypoint: "index.html",
    },
    files: [
      {
        path: "index.html",
        role: "html",
        mimeType: "text/html",
        contents:
          "<!doctype html><html><head><meta charset=\"utf-8\"><title>Figma to WordPress</title><link rel=\"stylesheet\" href=\"styles.css\"></head><body><main><h1>Figma to WordPress</h1><p>This static artifact is ready for WordPress import in Playground.</p></main></body></html>",
      },
      {
        path: "styles.css",
        role: "css",
        mimeType: "text/css",
        contents:
          "body{font-family:Inter,system-ui,sans-serif;margin:0;background:#f6f2ea;color:#18130f}main{max-width:760px;margin:10vh auto;padding:48px;border:1px solid #d8cbb8;background:#fffaf1;border-radius:24px}h1{font-size:48px;line-height:1;margin:0 0 16px}",
      },
    ],
    notes: [
      "Artifact generated in the Figma plugin UI.",
      "Static Site Importer and Blocks Engine are expected to run inside WordPress Playground, not in the Figma plugin.",
    ],
  };
}

export function buildRunnerPayload(artifact: GeneratedWebsiteArtifact): PlaygroundRunnerPayload {
  return {
    schemaVersion: "figma-to-wordpress-runner/v1",
    createdAt: new Date().toISOString(),
    artifact,
    importPlan: {
      runner: "wordpress-playground",
      importer: "static-site-importer",
      blockCompiler: "blocks-engine",
      status: "playground-import",
      boundaries: [
        "The Figma plugin creates or receives a generated static website artifact.",
        "The runner boots WordPress in Playground so PHP plugins run in the correct runtime.",
        "Static Site Importer and Blocks Engine import execution runs inside WordPress Playground.",
      ],
    },
  };
}

export function toRunnerArtifact(artifact: WebsiteArtifact, selection: NormalizedSelection): GeneratedWebsiteArtifact {
  return {
    schemaVersion: "figma-to-wordpress-artifact/v1",
    source: {
      tool: "figma",
      nodeIds: [selection.id],
      exportedAt: selection.exportedAt,
    },
    site: {
      title: selection.name,
      entrypoint: "index.html",
    },
    files: Object.entries(artifact.files).map(([filePath, contents]) => ({
      path: filePath,
      contents,
      role: fileRole(filePath),
      mimeType: mimeType(filePath),
    })),
    notes: artifact.diagnostics.map((diagnostic) => `${diagnostic.level}: ${diagnostic.nodeName} (${diagnostic.nodeId}) - ${diagnostic.message}`),
  };
}

function fileRole(filePath: string): GeneratedWebsiteFileRole {
  if (/\.html?$/.test(filePath)) return "html";
  if (/\.css$/.test(filePath)) return "css";
  if (/\.js$/.test(filePath)) return "js";
  if (/\.json$/.test(filePath)) return "metadata";
  return "asset";
}

function mimeType(filePath: string): string | undefined {
  if (/\.html?$/.test(filePath)) return "text/html";
  if (/\.css$/.test(filePath)) return "text/css";
  if (/\.js$/.test(filePath)) return "text/javascript";
  if (/\.json$/.test(filePath)) return "application/json";
  if (/\.svg$/.test(filePath)) return "image/svg+xml";
  if (/\.png$/.test(filePath)) return "image/png";
  return undefined;
}

export function encodeRunnerPayload(payload: PlaygroundRunnerPayload): string {
  return encodeURIComponent(JSON.stringify(payload));
}

export function decodeRunnerPayload(encodedPayload: string): PlaygroundRunnerPayload {
  return JSON.parse(decodeURIComponent(encodedPayload)) as PlaygroundRunnerPayload;
}

export function buildRunnerUrl(payload: PlaygroundRunnerPayload, options: RunnerUrlOptions): string {
  const baseUrl = options.runnerBaseUrl.replace(/#.*$/, "");
  return `${baseUrl}#payload=${encodeRunnerPayload(payload)}`;
}

export function buildPlaygroundPreviewUrl(payload: PlaygroundRunnerPayload): string {
  const websiteArtifact = toStaticSiteImporterArtifact(payload.artifact);
  const siteSlug = slugify(payload.artifact.site.title || "figma-wordpress-export");
  const importPhp = buildStaticSiteImporterPhp(siteSlug);
  const blueprint = {
    $schema: "https://playground.wordpress.net/blueprint-schema.json",
    landingPage: "/wp-admin/",
    preferredVersions: {
      php: "8.3",
      wp: "latest",
    },
    features: {
      networking: true,
    },
    extraLibraries: ["wp-cli"],
    steps: [
      {
        step: "installPlugin",
        pluginData: {
          resource: "git:directory",
          url: "https://github.com/Automattic/static-site-importer",
          ref: "main",
          refType: "branch",
        },
        options: {
          activate: true,
          targetFolderName: "static-site-importer",
        },
      },
      {
        step: "login",
        username: "admin",
        password: "password",
      },
      {
        step: "writeFile",
        path: "/tmp/figma-to-wordpress-artifact.json",
        data: JSON.stringify(websiteArtifact),
      },
      {
        step: "runPHP",
        code: importPhp,
      },
    ],
  };

  return `https://playground.wordpress.net/#${encodeURIComponent(JSON.stringify(blueprint))}`;
}

function toStaticSiteImporterArtifact(artifact: GeneratedWebsiteArtifact) {
  return {
    schema: "block-artifact-compiler/website-artifact/v1",
    files: artifact.files.map((file) => ({
      path: file.path.startsWith("website/") ? file.path : `website/${file.path}`,
      content: file.contents,
    })),
    metadata: {
      source: "figma-to-wordpress",
      site: slugify(artifact.site.title || "figma-wordpress-export"),
      figma: artifact.source,
      notes: artifact.notes || [],
    },
  };
}

function buildStaticSiteImporterPhp(siteSlug: string): string {
  return `require_once '/wordpress/wp-load.php';
wp_set_current_user( 1 );
if ( ! function_exists( 'wp_get_ability' ) ) {
	throw new RuntimeException( 'WordPress Abilities API is not available.' );
}
$ability = wp_get_ability( 'static-site-importer/import-website-artifact' );
if ( ! $ability ) {
	throw new RuntimeException( 'Static Site Importer website artifact ability is not registered.' );
}
$artifact_path = '/tmp/figma-to-wordpress-artifact.json';
if ( ! file_exists( $artifact_path ) ) {
	throw new RuntimeException( 'Figma to WordPress artifact file is missing.' );
}
$artifact = json_decode( file_get_contents( $artifact_path ), true );
if ( ! is_array( $artifact ) ) {
	throw new RuntimeException( 'Static Site Importer website artifact payload is invalid.' );
}
$ability_result = $ability->execute( array(
	'artifact' => $artifact,
	'slug' => '${siteSlug}',
	'activate' => true,
	'overwrite' => true,
) );
if ( is_wp_error( $ability_result ) ) {
	throw new RuntimeException( $ability_result->get_error_message() );
}
if ( empty( $ability_result['success'] ) ) {
	$error = isset( $ability_result['error'] ) && is_array( $ability_result['error'] ) ? $ability_result['error'] : array();
	throw new RuntimeException( isset( $error['message'] ) ? (string) $error['message'] : 'Static site import failed.' );
}`;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "figma-wordpress-export";
}

export function buildStandaloneRunnerPage(payload: PlaygroundRunnerPayload): string {
  const escapedPayload = JSON.stringify(encodeRunnerPayload(payload));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Figma to WordPress Playground Runner</title>
</head>
<body>
  <h1>Figma to WordPress Playground Runner</h1>
  <p>This generated page carries a Figma to WordPress runner payload. Save or host it, then open it in a browser.</p>
  <script>
    location.hash = "payload=" + ${escapedPayload};
  </script>
</body>
</html>`;
}
