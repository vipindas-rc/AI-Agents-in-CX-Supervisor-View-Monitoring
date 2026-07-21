import {
  DesignCanvas,
  DCSection,
  DCArtboard,
} from "./devtools/inspector-canvas/DesignCanvas";
import { SupervisorAgents } from "@/pages/SupervisorAgents";

// Figma-like review canvas (opened via ?canvas). Two desktop frames show the
// supervisor dashboard pinned to each of its tabs so the states can be
// inspected and commented on side by side.
//
// Artboard/canvas ids are permanent comment anchors — never change them.
export function CanvasView() {
  return (
    <DesignCanvas
      inspector
      comments={{ canvasId: "rc:rcx-supervisor:main-7kq" }}
    >
      <DCSection
        title="Supervisor dashboard"
        subtitle="Agents and Interactions tabs, frozen for review"
      >
        <DCArtboard id="agents" label="Agents" width={1440} height={900}>
          <SupervisorAgents fixedTab="Agents" />
        </DCArtboard>
        <DCArtboard
          id="interactions"
          label="Interactions"
          width={1440}
          height={900}
        >
          <SupervisorAgents fixedTab="Interactions" />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}
