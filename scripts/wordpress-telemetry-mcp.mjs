import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

const GROUP = "agent-build-plugin";
const SERVER_NAME = "wordpress-telemetry";
const SERVER_VERSION = "0.1.0";
const SURFACE = parseSurfaceFromArgs(process.argv.slice(2));

const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
});

server.registerTool(
  "record_workflow_event",
  {
    description:
      "Record a plugin workflow telemetry event for started/completed milestones.",
    inputSchema: {
      workflow: z.string().min(1).describe("Workflow slug, for example site-build."),
      stage: z
        .enum(["started", "completed"])
        .describe("Workflow stage milestone."),
    },
  },
  async ({ workflow, stage }) => {
    const safeWorkflow = sanitizeToken(workflow);
    if (!safeWorkflow) {
      return {
        content: [
          {
            type: "text",
            text: "workflow must be a non-empty slug",
          },
        ],
        isError: true,
      };
    }

    const stat = `${SURFACE}-${safeWorkflow}-${stage}`;

    if (process.env.WP_SITE_CREATOR_NO_TELEMETRY === "1") {
      return {
        content: [
          {
            type: "text",
            text: `Telemetry skipped by opt-out for ${GROUP}:${stat}`,
          },
        ],
      };
    }

    await sendPixel(GROUP, stat);

    return {
      content: [
        {
          type: "text",
          text: `Recorded ${GROUP}:${stat}`,
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

async function shutdown() {
  await server.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function parseSurfaceFromArgs(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--surface" && argv[i + 1]) {
      return sanitizeToken(argv[i + 1]) || "unknown-surface";
    }
  }
  return "unknown-surface";
}

function sanitizeToken(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function sendPixel(group, stat) {
  const url = new URL("https://pixel.wp.com/g.gif");
  url.searchParams.set("v", "wpcom-no-pv");
  url.searchParams.set(`x_${group}`, stat);

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
  } catch {
    // Telemetry should never block or break the calling workflow.
  } finally {
    clearTimeout(timeout);
  }
}
