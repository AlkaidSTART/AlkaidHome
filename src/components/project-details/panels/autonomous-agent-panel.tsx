import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Play, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  projectColor: string;
}

export default function AutonomousAgentPanel({ projectColor }: Props) {
  const { t } = useTranslation();
  const [terminalCommands, setTerminalCommands] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState("");
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const terminalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTerminalInput("");
    setIsTerminalRunning(false);
    setTerminalCommands([
      t("projectDetails.autonomousAgent.terminalPrompt"),
      t("projectDetails.autonomousAgent.helpPrompt"),
    ]);
  }, []);

  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop =
        terminalContentRef.current.scrollHeight;
    }
  }, [terminalCommands]);

  const executeAgentTask = (taskName: string, steps: string[]) => {
    if (isTerminalRunning) return;
    setIsTerminalRunning(true);
    setTerminalCommands((prev) => [
      ...prev,
      `$ executing_agent --task "${taskName}"`,
    ]);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setTerminalCommands((prev) => [...prev, steps[stepIndex]]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsTerminalRunning(false);
      }
    }, 800);
  };

  const runTerminalCommand = (cmd: string) => {
    const normalizedCmd = cmd.trim().toLowerCase();
    let responses: string[] = [];

    if (normalizedCmd === "help") {
      responses = [
        `$ ${cmd}`,
        "Available terminal commands:",
        "  help       - Show this help dialogue",
        "  clear      - Clear the console logs",
        "  status     - Show agent diagnostics",
        "  run-test   - Run sandboxed test execution suite",
        "  research   - Launch automated web research scraper",
      ];
      setTerminalCommands((prev) => [...prev, ...responses]);
    } else if (normalizedCmd === "clear") {
      setTerminalCommands([]);
    } else if (normalizedCmd === "status") {
      responses = [
        `$ ${cmd}`,
        "Agent Core Status: ONLINE",
        "Reasoning Model: Gemini 3.5 Flash",
        "Connected Tools: SearchAPI, TerminalSandbox, EmailSMTP, FileFS",
        "Task queue count: 0 pending, 1420 successfully executed",
      ];
      setTerminalCommands((prev) => [...prev, ...responses]);
    } else if (normalizedCmd === "run-test") {
      executeAgentTask("Run sandboxed test execution suite", [
        "Agent: Starting Sandbox SandboxInstance-8812...",
        "Agent: Initialized Alpine Linux container successfully.",
        "Agent: Creating temporary workspace directory /tmp/workspace...",
        "Agent: Writing file test_api.py (24 lines)...",
        "Agent: Running: pytest test_api.py",
        "Sandbox Output: =================== 3 passed in 0.45s ===================",
        "Agent: All test cases passed! Cleaning sandbox container...",
        "Agent Task: Completed with code 0.",
      ]);
    } else if (normalizedCmd === "research") {
      executeAgentTask("Launch automated web research scraper", [
        "Agent: Formulating research queries for web lookup...",
        'Agent: Calling tool WebSearch({ query: "AI agent frameworks 2026" })...',
        "Tool Response: WebSearch returned 5 source paragraphs.",
        "Agent: Extracting references and checking consistency...",
        "Agent: Writing document report.md inside agent storage workspace...",
        "Agent: Dispatching summary email to stakeholder@example.com...",
        "Agent Task: Completed. Email sent successfully.",
      ]);
    } else if (normalizedCmd === "") {
      setTerminalCommands((prev) => [...prev, "$"]);
    } else {
      responses = [
        `$ ${cmd}`,
        `Command not found: "${cmd}". Type "help" for a list of valid commands.`,
      ];
      setTerminalCommands((prev) => [...prev, ...responses]);
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || isTerminalRunning) return;
    runTerminalCommand(terminalInput);
    setTerminalInput("");
  };

  return (
    <div className="sub-panel glass-panel p-6" style={{ borderLeft: `3px solid ${projectColor}` }}>
      <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
        {t("projectDetails.autonomousAgent.terminalTitle")}
      </h3>

      <div
        ref={terminalContentRef}
        className="h-[180px] overflow-y-auto bg-black/40 border border-white/[0.05] p-3 rounded-md text-[0.75rem] font-[JetBrains_Mono] flex flex-col gap-0.5 mb-3"
      >
        {terminalCommands.map((cmd, i) => (
          <div key={i} className={`leading-[1.4] ${cmd.startsWith("$ ") ? "text-[#10b981]" : "text-[#9ca3af]"}`}>
            {cmd}
          </div>
        ))}
        {isTerminalRunning && (
          <span className="text-[#10b981] animate-pulse">▌</span>
        )}
      </div>

      <form onSubmit={handleTerminalSubmit} className="flex gap-2 mb-3">
        <span className="text-[#10b981] font-[JetBrains_Mono] text-[0.8rem] self-center">$</span>
        <input
          type="text"
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          placeholder={t("projectDetails.autonomousAgent.terminalPlaceholder")}
          disabled={isTerminalRunning}
          className="bg-black/40 border border-white/[0.08] px-3 py-2 rounded-md text-white font-[JetBrains_Mono] text-[0.75rem] flex-grow outline-none focus:border-[#10b981] transition-colors disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={isTerminalRunning}
          className="bg-[#10b981] text-white border-none px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 font-[Orbitron] text-[0.7rem] font-bold transition-all duration-300 hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play size={12} />
          {t("projectDetails.autonomousAgent.run")}
        </button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {["run-test", "research", "status"].map((cmd) => (
          <button
            key={cmd}
            onClick={() => runTerminalCommand(cmd)}
            disabled={isTerminalRunning}
            className="flex items-center gap-1.5 font-[JetBrains_Mono] text-[0.65rem] text-[#9ca3af] border border-white/[0.08] px-3 py-1.5 rounded-md bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] hover:text-white transition-colors disabled:opacity-40"
          >
            <RotateCcw size={10} />
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
