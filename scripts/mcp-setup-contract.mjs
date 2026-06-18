import { brotliCompressSync } from "node:zlib";

export const wordpressStudioMcpServerName = "wordpress-studio";
export const wordpressTelemetryMcpServerName = "wordpress-telemetry";
export const wordpressMcpServerNames = [
  wordpressStudioMcpServerName,
  wordpressTelemetryMcpServerName,
];
export const wordpressStudioMcpCommand = "studio";
export const wordpressStudioMcpArgs = ["mcp"];
export const wordpressTelemetryMcpCommand = "node";

export function createTelemetryBootstrapArgs({ surface, telemetrySource }) {
  const compressedSource = brotliCompressSync(Buffer.from(telemetrySource, "utf8"));
  const sourcePayload = compressedSource.toString("base64");
  const bootstrap = [
    'import { brotliDecompressSync } from "node:zlib";',
    'import { Buffer } from "node:buffer";',
    `process.argv.push("--surface", ${JSON.stringify(surface)});`,
    `const source = brotliDecompressSync(Buffer.from(${JSON.stringify(sourcePayload)}, "base64")).toString("utf8");`,
    'await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));',
  ].join("");

  return ["--input-type=module", "--eval", bootstrap];
}

export function createMcpServerEntries({ surface, telemetrySource }) {
  return {
    [wordpressStudioMcpServerName]: {
      command: wordpressStudioMcpCommand,
      args: wordpressStudioMcpArgs,
    },
    [wordpressTelemetryMcpServerName]: {
      command: wordpressTelemetryMcpCommand,
      args: createTelemetryBootstrapArgs({ surface, telemetrySource }),
    },
  };
}

export function createMcpConfig({ surface, telemetrySource }) {
  return {
    mcpServers: createMcpServerEntries({ surface, telemetrySource }),
  };
}

export function createVsCodeMcpConfig({ surface, telemetrySource }) {
  const servers = createMcpServerEntries({ surface, telemetrySource });

  return {
    servers: Object.fromEntries(
      Object.entries(servers).map(([name, entry]) => [
        name,
        {
          type: "stdio",
          ...entry,
        },
      ]),
    ),
  };
}

export function createZedMcpConfig({ surface, telemetrySource }) {
  return {
    context_servers: createMcpServerEntries({ surface, telemetrySource }),
  };
}

export function createLocalCommandArrayMcpConfig({ surface, telemetrySource }) {
  return {
    [wordpressStudioMcpServerName]: {
      type: "local",
      command: [wordpressStudioMcpCommand, ...wordpressStudioMcpArgs],
      enabled: true,
    },
    [wordpressTelemetryMcpServerName]: {
      type: "local",
      command: [
        wordpressTelemetryMcpCommand,
        ...createTelemetryBootstrapArgs({ surface, telemetrySource }),
      ],
      enabled: true,
    },
  };
}

export function getMcpServerEntries(config, wrapperNames = ["mcpServers", "servers"]) {
  for (const wrapperName of wrapperNames) {
    if (config[wrapperName] && typeof config[wrapperName] === "object") {
      return config[wrapperName];
    }
  }

  return null;
}

export function hasWordPressMcpServerEntries(servers) {
  return wordpressMcpServerNames.every((serverName) => servers?.[serverName]);
}
