import React, { useState, useEffect } from "react";
import { Users, Search, Code2, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  projectColor: string;
}

const AGENT_NAME_MAP: Record<string, string> = {
  Researcher: "projectDetails.multiAgent.agentResearcher",
  Writer: "projectDetails.multiAgent.agentWriter",
  Critic: "projectDetails.multiAgent.agentCritic",
};

export default function MultiAgentPanel({ projectColor }: Props) {
  const { t } = useTranslation();

  const getAgentDisplayName = (name: string) => {
    return AGENT_NAME_MAP[name] ? t(AGENT_NAME_MAP[name]) : name;
  };

  const [multiAgentLogs, setMultiAgentLogs] = useState<
    { sender: string; text: string; status: string; avatarBg: string }[]
  >([]);
  const [currentActiveAgent, setCurrentActiveAgent] = useState<string | null>(null);
  const [isCollabActive, setIsCollabActive] = useState(false);
  const [collabOutput, setCollabOutput] = useState("");

  useEffect(() => {
    setIsCollabActive(false);
    setCurrentActiveAgent(null);
    setCollabOutput("");
    setMultiAgentLogs([
      {
        sender: "System",
        text: t("projectDetails.multiAgent.systemIdle"),
        status: "IDLE",
        avatarBg: "rgba(255,255,255,0.1)",
      },
    ]);
  }, []);

  const triggerCollaborationDemo = () => {
    if (isCollabActive) return;
    setIsCollabActive(true);
    setCollabOutput("");
    setMultiAgentLogs([]);

    const collabSteps = [
      {
        sender: "System",
        text: 'Task initialized: "Write a short blog post on Hierarchical Agent Memory."',
        status: "BUSY",
        avatarBg: "rgba(255,255,255,0.1)",
      },
      {
        sender: "Researcher",
        text: "Searching internal databases for Hierarchical Memory, short-term vs long-term storage...",
        status: "WORKING",
        avatarBg: "var(--c-planet-1)",
      },
      {
        sender: "Researcher",
        text: "Fact list generated: 1) Memory divided into episodic & semantic; 2) Vector databases serve as long-term storage; 3) System prompt context acts as short-term RAM.",
        status: "DONE",
        avatarBg: "var(--c-planet-1)",
      },
      {
        sender: "Writer",
        text: "Drafting introduction and structure based on research facts...",
        status: "WORKING",
        avatarBg: "var(--c-planet-4)",
      },
      {
        sender: "Writer",
        text: 'Draft v1: "Hierarchical Agent Memory mimics human brain structure, separating fast-access context (short-term) from indexed embeddings (long-term database). This enables complex tool-use agents."',
        status: "DONE",
        avatarBg: "var(--c-planet-4)",
      },
      {
        sender: "Critic",
        text: "Analyzing Draft v1 content structure, grammar, and completeness...",
        status: "WORKING",
        avatarBg: "var(--c-planet-3)",
      },
      {
        sender: "Critic",
        text: "Feedback: Draft is good, but lacks concrete code examples of vector querying. Requesting revisions from Writer.",
        status: "REJECTED",
        avatarBg: "var(--c-planet-3)",
      },
      {
        sender: "Writer",
        text: "Injecting code examples into draft structure...",
        status: "WORKING",
        avatarBg: "var(--c-planet-4)",
      },
      {
        sender: "Writer",
        text: "Draft v2: Added Node.js embedding query code snippet. Resubmitting to Critic.",
        status: "DONE",
        avatarBg: "var(--c-planet-4)",
      },
      {
        sender: "Critic",
        text: "Analyzing Draft v2. Checking code correctness...",
        status: "WORKING",
        avatarBg: "var(--c-planet-3)",
      },
      {
        sender: "Critic",
        text: "Draft v2 approved! Score 9.5/10. Ready for delivery.",
        status: "APPROVED",
        avatarBg: "var(--c-planet-3)",
      },
      {
        sender: "System",
        text: "Collaboration successfully completed.",
        status: "SUCCESS",
        avatarBg: "rgba(255,255,255,0.1)",
      },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < collabSteps.length) {
        const step = collabSteps[stepIndex];
        setMultiAgentLogs((prev) => [...prev, step]);
        setCurrentActiveAgent(step.sender);

        if (step.sender === "Writer" && step.status === "DONE") {
          setCollabOutput(step.text);
        }

        stepIndex++;
      } else {
        clearInterval(interval);
        setCurrentActiveAgent(null);
        setIsCollabActive(false);
      }
    }, 1200);
  };

  const agents = [
    {
      name: "Researcher",
      nameKey: "projectDetails.multiAgent.agentResearcher",
      icon: <Search size={12} className="text-black" />,
      color: "var(--c-planet-1)",
      activeStatusKey: "projectDetails.multiAgent.statusWorking",
      activeTextKey: "projectDetails.multiAgent.researcherActiveText",
      idleTextKey: "projectDetails.multiAgent.researcherIdleText",
    },
    {
      name: "Writer",
      nameKey: "projectDetails.multiAgent.agentWriter",
      icon: <Code2 size={12} className="text-black" />,
      color: "var(--c-planet-4)",
      activeStatusKey: "projectDetails.multiAgent.statusComposing",
      activeTextKey: "projectDetails.multiAgent.writerActiveText",
      idleTextKey: "projectDetails.multiAgent.writerIdleText",
    },
    {
      name: "Critic",
      nameKey: "projectDetails.multiAgent.agentCritic",
      icon: <Activity size={12} className="text-black" />,
      color: "var(--c-planet-3)",
      activeStatusKey: "projectDetails.multiAgent.statusAuditing",
      activeTextKey: "projectDetails.multiAgent.criticActiveText",
      idleTextKey: "projectDetails.multiAgent.criticIdleText",
    },
  ];

  return (
    <div className="sub-panel glass-panel p-6" style={{ borderLeft: `3px solid ${projectColor}` }}>
      <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
        {t("projectDetails.multiAgent.collaborationTitle")}
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={triggerCollaborationDemo}
            disabled={isCollabActive}
            className="flex items-center gap-2 font-[Orbitron] text-[0.75rem] font-bold px-4 py-2.5 rounded-md cursor-pointer transition-all duration-300"
            style={{
              background: isCollabActive
                ? "rgba(236, 72, 153, 0.05)"
                : "rgba(236, 72, 153, 0.1)",
              border: `1px solid ${isCollabActive ? "rgba(236,72,153,0.1)" : "rgba(236,72,153,0.3)"}`,
              color: isCollabActive ? "var(--text-muted)" : "var(--c-planet-3)",
            }}
          >
            <Users size={14} />
            {isCollabActive
              ? t("projectDetails.multiAgent.collaborationInProgress")
              : t("projectDetails.multiAgent.startCollaboration")}
          </button>

          {isCollabActive && (
            <span className="text-[0.7rem] text-[#ec4899] font-[JetBrains_Mono]">
              {t("projectDetails.multiAgent.activeNode")}:{" "}
              {getAgentDisplayName(currentActiveAgent || "")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
          {agents.map((agent) => {
            const isActive = currentActiveAgent === agent.name;
            return (
              <div
                key={agent.name}
                className={`bg-white/[0.01] border border-white/[0.04] rounded-lg p-4 flex flex-col gap-2 relative transition-all duration-300 ${
                  isActive
                    ? "border-[#ec4899] bg-[rgba(236,72,153,0.03)] shadow-[0_0_15px_rgba(236,72,153,0.1)]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex justify-center items-center"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.icon}
                  </div>
                  <span className="font-[Orbitron] text-[0.75rem] font-bold text-white">
                    {t(agent.nameKey)}
                  </span>
                  <span
                    className="text-[0.6rem] uppercase px-1.5 py-0.5 rounded bg-white/[0.05]"
                    style={{ color: isActive ? agent.color : "" }}
                  >
                    {isActive
                      ? t(agent.activeStatusKey)
                      : t("projectDetails.multiAgent.statusIdle")}
                  </span>
                </div>
                <p className="text-[0.7rem] text-[#9ca3af] h-[60px] overflow-hidden leading-[1.4]">
                  {isActive
                    ? t(agent.activeTextKey)
                    : t(agent.idleTextKey)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="h-[140px] overflow-y-auto bg-black/30 border border-white/[0.03] p-3 rounded-md text-[0.75rem] font-[JetBrains_Mono] flex flex-col gap-1.5">
          {multiAgentLogs.map((log, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[#9ca3af]">&gt;</span>
              <span className="text-[#ec4899] font-semibold">
                {log.sender}:
              </span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>

        {collabOutput && (
          <div className="mt-4 bg-black/30 border border-white/[0.05] rounded-lg p-4">
            <span className="text-[0.7rem] uppercase text-[#9ca3af] font-[JetBrains_Mono] block mb-2">
              {t("projectDetails.multiAgent.finalOutputTitle")}
            </span>
            <div className="text-[0.75rem] leading-[1.5] text-[#f3f4f6] max-h-[150px] overflow-y-auto">
              {collabOutput}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
