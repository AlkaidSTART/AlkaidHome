import React, { useEffect, useRef } from "react";
import { X, BarChart3, Code2 } from "lucide-react";
import { gsap } from "gsap";
import { useTranslation } from "react-i18next";
import VoiceCanvasPanel from "./panels/voice-canvas-panel";
import AutonomousAgentPanel from "./panels/autonomous-agent-panel";
import MultiAgentPanel from "./panels/multi-agent-panel";
import AgenticRagPanel from "./panels/agentic-rag-panel";
 import { PROJECTS_DATA, getPipelineSteps, highlightCode } from "./data";

interface ProjectDetailsProps {
  planetId: number | null;
  onClose: () => void;
}

const PANEL_COMPONENTS: Record<number, React.FC<{ projectColor: string }>> = {
  1: VoiceCanvasPanel,
  2: AutonomousAgentPanel,
  3: MultiAgentPanel,
  4: AgenticRagPanel,
};

export default function ProjectDetails({ planetId, onClose }: ProjectDetailsProps) {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeProject = planetId ? PROJECTS_DATA[planetId] : null;

  useEffect(() => {
    if (planetId) {
      const el = overlayRef.current;
      if (!el) return;

      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
      );

      gsap.fromTo(
        el.querySelectorAll(".sub-panel"),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2,
        },
      );
    }
  }, [planetId]);

  if (!planetId || !activeProject) return null;

  const handleClose = () => {
    const el = overlayRef.current;
    if (!el) {
      onClose();
      return;
    }
    gsap.to(el, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: "power3.in",
      onComplete: onClose,
    });
  };

  const PanelComponent = PANEL_COMPONENTS[planetId];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto my-8 px-4">
        <div className="glass-panel p-8 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeProject.color }}
              />
              <span
                className="font-[Orbitron] text-[0.7rem] uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
                style={{
                  color: activeProject.color,
                  background: `color-mix(in srgb, ${activeProject.color} 15%, transparent)`,
                }}
              >
                {t(activeProject.badgeKey)}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-[#9ca3af] hover:text-white cursor-pointer transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6 flex-[3] min-w-0">
              <div className="sub-panel">
                <h2 className="font-[Orbitron] text-2xl font-bold tracking-[0.05em] text-white mb-2">
                  {t(activeProject.titleKey)}
                </h2>
                <h3
                  className="font-[Orbitron] text-[0.85rem] tracking-[0.08em] mb-3"
                  style={{ color: activeProject.color }}
                >
                  {t(activeProject.subtitleKey)}
                </h3>
                <p className="text-[0.85rem] text-[#9ca3af] leading-[1.6]">
                  {t(activeProject.descriptionKey)}
                </p>
              </div>

              {PanelComponent && (
                <PanelComponent projectColor={activeProject.color} />
              )}

              <div className="sub-panel glass-panel p-6">
                <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
                  {t("projectDetails.common.architecturePipeline")}
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {getPipelineSteps(planetId).map((step, i, arr) => (
                    <React.Fragment key={i}>
                      <div
                        className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                        style={
                          step.highlighted
                            ? { borderColor: activeProject.color }
                            : undefined
                        }
                      >
                        {t(step.labelKey)}
                      </div>
                      {i < arr.length - 1 && (
                        <span className="text-[#9ca3af]">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 flex-[2] min-w-0">
              <div className="sub-panel glass-panel p-6">
                <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
                  <BarChart3
                    size={14}
                    className="inline mr-1.5 align-middle"
                    style={{ color: activeProject.color }}
                  />
                  {t("projectDetails.common.telemetryMetrics")}
                </h3>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-4">
                  {activeProject.metrics.map((met, i) => (
                    <div
                      key={i}
                      className="border border-white/[0.04] bg-white/[0.01] p-4 rounded-lg flex flex-col gap-1"
                    >
                      <span className="text-[0.65rem] uppercase text-[#9ca3af] tracking-[0.05em]">
                        {t(met.labelKey)}
                      </span>
                      <span
                        className="font-[JetBrains_Mono] text-xl font-bold text-white"
                        style={{ color: activeProject.color }}
                      >
                        {met.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sub-panel glass-panel p-6 flex-grow">
                <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
                  <Code2
                    size={14}
                    className="inline mr-1.5 align-middle"
                    style={{ color: activeProject.color }}
                  />
                  {t("projectDetails.common.referenceImplementation")}
                </h3>
                <pre className="bg-black/40 border border-white/[0.05] rounded-lg p-4 overflow-x-auto text-xs leading-[1.6] font-[JetBrains_Mono] text-[#f3f4f6] max-h-[500px] overflow-y-auto">
                  <code>{highlightCode(activeProject.code)}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
