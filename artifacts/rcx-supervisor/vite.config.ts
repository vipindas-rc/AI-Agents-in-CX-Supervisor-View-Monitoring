import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const protoDir = path.resolve(import.meta.dirname, "client", "src", "proto");

// Stub every AngularJS service/directive the vendored RingCX React components
// import from the monorepo's `common/` (and the Angular `app/`) trees, plus
// `@ringcentral/web-modules-core`. These are not part of standalone rendering —
// they get a catch-all proxy so named imports resolve to safe no-ops.
const STUB_RE = /(^|\/)common\/(services|directives)\//;
const WMC = "@ringcentral/web-modules-core";

// The vendored RingCX code uses generic JSX elements (e.g. `<GridList<Row, Sel>`).
// Neither esbuild nor Replit's cartographer metadata transform can handle that
// syntax, so strip the generic type-args (purely a TS-typing concern, no runtime
// effect) for proto .tsx files before any other transform runs. Anchored to
// line-start JSX open tags so ordinary type annotations are left untouched.
function stripProtoJsxGenerics(code: string): string {
  const re = /(^|\n)([ \t]*)<([A-Z][A-Za-z0-9_]*)</g;
  let result = "";
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const genericStart = m.index + m[0].length - 1; // the '<' opening the generic
    let depth = 0;
    let i = genericStart;
    for (; i < code.length; i++) {
      const ch = code[i];
      if (ch === "<") depth++;
      else if (ch === ">") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }
    result += code.slice(lastIndex, genericStart);
    lastIndex = i;
    re.lastIndex = i;
  }
  result += code.slice(lastIndex);
  return result;
}
const stubEagAngular = {
  name: "stub-eag-angular",
  enforce: "pre" as const,
  resolveId(source: string) {
    if (source === WMC) return "\0wmc-stub";
    if (STUB_RE.test(source) && !source.includes("node_modules")) {
      return "\0eag-stub:" + source;
    }
    return null;
  },
  load(id: string) {
    const clean = id.split("?")[0];
    if (
      clean.includes("/proto/") &&
      clean.endsWith(".tsx") &&
      fs.existsSync(clean)
    ) {
      // Strip generic JSX type-args at the load stage, before cartographer's
      // metadata transform can detach the generic from the component name.
      return stripProtoJsxGenerics(fs.readFileSync(clean, "utf8"));
    }
    if (id.startsWith("\0eag-stub:")) {
      const names = [
        "$theme","AIFeature","ActivityLog","AgentCprClient","AttributesItem","AttributesItemKind","CANCEL_DUPLICATED_REQUEST_FLAG","ChannelType","ContactsInfo","CreateContactProfileRequestData","DownChevronTransformIcon","ExternalData","ExternalDataAttributes","ExternalDataAttributesItem","FrameTypeMap","GetContactProfileRequestData","HistoryChannelClass","HistoryItemType","IScreenRecordingService","NQI","PlayerController","ScreenRecordingNotificationType","UIStateKey","UIStateService","checkBlock","createContactProfile","cxaoClient","getActivities","getAgentAssistMessageManagerFactory","getAllTags","getContactProfile","getExternalContactProfile","getQueueAvailability","initialize","refreshFrame","updateActivity","updateContactProfile",
      ];
      return (
        `
const subj = (val) => ({ getValue: () => val, subscribe: (cb) => { try { cb && cb(val); } catch (e) {} return { unsubscribe() {} }; }, next() {}, pipe: () => subj(val), asObservable: () => subj(val) });
const mk = () => {
  const cache = {};
  return new Proxy(function(){ return null; }, {
    get: (_t, k) => {
      if (typeof k === 'string' && k.charAt(0) === '$') {
        if (!(k in cache)) cache[k] = k.toLowerCase().indexOf('monitoredagent') !== -1 ? subj(new Set()) : subj(false);
        return cache[k];
      }
      return mk();
    },
    apply: () => null,
    construct: () => mk(),
  });
};
` +
        names.map((n) => `export const ${n} = mk();`).join("\n") +
        `\nexport default mk();`
      );
    }
    if (id === "\0wmc-stub") {
      return `const passThrough = (props) => (props && props.children != null ? props.children : null);
module.exports = new Proxy({ __esModule: true, default: passThrough }, { get: (t, k) => (k in t ? t[k] : passThrough) });`;
    }
    return null;
  },
};

export default defineConfig({
  plugins: [
    stubEagAngular,
    react({ exclude: [/[\\/]proto[\\/]/] }),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "@proto": path.resolve(protoDir, "AgentTablePanel.tsx"),
      "@ringcx/ui": path.resolve(protoDir, "vendor/ringcx-ui/index.ts"),
      "@ringcx/shared": path.resolve(protoDir, "stubs/ringcx-shared/index.ts"),
      "@ringcx/pii-interceptor": path.resolve(
        protoDir,
        "stubs/pii-interceptor/index.ts",
      ),
    },
    dedupe: ["react", "react-dom", "styled-components"],
  },
  // Keep function/class names so the inspector's hierarchy tree shows real
  // component names instead of minified ones.
  esbuild: { keepNames: true },
  define: {
    "process.env": {},
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "styled-components",
      "@mui/material",
      "@mui/system",
      "@mui/system/colorManipulator",
      "@mui/styled-engine",
      "@emotion/react",
      "@emotion/styled",
      "@material-ui/core",
      "@material-ui/core/styles",
      "@material-ui/icons",
    ],
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
    },
  },
});
