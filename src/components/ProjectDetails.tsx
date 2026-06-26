import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  Send,
  Users,
  Database,
  Search,
  Activity,
  Code2,
  BarChart3,
} from "lucide-react";
import { gsap } from "gsap";

interface ProjectDetailsProps {
  planetId: number | null;
  onClose: () => void;
}

interface ProjectData {
  id: number;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  color: string;
  metrics: { label: string; value: string }[];
  code: string;
}

const PROJECTS_DATA: Record<number, ProjectData> = {
  1: {
    id: 1,
    title: "VoiceCanvas",
    badge: "Multimodal Real-Time Interaction",
    subtitle:
      "Real-time duplex voice interaction engine featuring low latency and expressive synthesis.",
    description:
      "VoiceCanvas integrates Voice Activity Detection (VAD), Automatic Speech Recognition (ASR), Large Language Model orchestration, and Text-to-Speech (TTS) synthesis into a unified, high-performance streaming pipeline. Built to support conversational agents that feel natural, mimicking human turn-taking and emotional response inflections.",
    color: "var(--c-planet-1)",
    metrics: [
      { label: "Latency", value: "120ms" },
      { label: "Audio Quality", value: "Opus 48kHz" },
      { label: "MOS Score", value: "4.65" },
      { label: "GPU Concurrency", value: "1.2k streams" },
    ],
    code: `// VoiceCanvas Real-Time Streaming Orchestration
import { VADStream, TTSClient, LLMChain } from '@voicecanvas/core';

export async function startDuplexStream(userStream: MediaStream) {
  const vad = new VADStream({ threshold: -45 }); // dB
  const tts = new TTSClient({ codec: 'opus', bitrate: 48000 });
  const llm = new LLMChain({ streaming: true });

  userStream.pipeTo(vad);

  vad.on('speech_start', () => tts.interrupt()); // Interrupt active TTS
  vad.on('speech_end', async (pcmBuffer) => {
    const textStream = await llm.generateStream(pcmBuffer);
    
    textStream.on('chunk', (token) => {
      const audioBuffer = tts.synthesizeChunk(token);
      playAudio(audioBuffer);
    });
  });
}`,
  },
  2: {
    id: 2,
    title: "Autonomous Task Agent",
    badge: "ReAct Tool Use Specialist",
    subtitle:
      "An autonomous agent that reasons, plans, and writes code to accomplish multi-step objectives.",
    description:
      "Autonomous Task Agent utilizes advanced ReAct (Reasoning and Acting) prompt topologies to self-correct and execute complex code, terminal commands, web search queries, and email dispatches. Outfitted with safety sandboxes to prevent data loss while offering powerful execution capability.",
    color: "var(--c-planet-2)",
    metrics: [
      { label: "Task Success Rate", value: "94.2%" },
      { label: "Avg Steps / Task", value: "12 steps" },
      { label: "Tokens Saved", value: "68%" },
      { label: "Sandboxed Runs", value: "48k / day" },
    ],
    code: `// ReAct Loop with Sandbox Execution
import { LLMModel, Sandbox, WebSearch } from '@taskagent/tools';

export async function runAgentLoop(taskDescription: string) {
  const agent = new Agent({
    brain: new LLMModel('gemini-3.5-pro'),
    tools: [new WebSearch(), new Sandbox({ os: 'alpine' })]
  });

  const plan = await agent.plan(taskDescription);
  let status = 'IN_PROGRESS';

  while (status === 'IN_PROGRESS') {
    const action = await agent.nextAction();
    if (action.type === 'execute_code') {
      const output = await agent.tools.sandbox.exec(action.code);
      agent.observe(output); // Feed result back to LLM context
    } else if (action.type === 'finish') {
      status = 'COMPLETED';
      return action.result;
    }
  }
}`,
  },
  3: {
    id: 3,
    title: "Multi-Agent System",
    badge: "Collaborative Ecosystem",
    subtitle:
      "A distributed system where specialized agents negotiate and review work to achieve high-quality results.",
    description:
      "Instead of relying on a single generalist model, the Multi-Agent System breaks tasks down and assigns them to specialized agents: Researcher, Writer, and Critic. They collaborate via an asynchronous message-passing queue, debating drafts and correcting errors automatically before final output generation.",
    color: "var(--c-planet-3)",
    metrics: [
      { label: "Agent Count", value: "3 Active" },
      { label: "Consensus Rate", value: "98.5%" },
      { label: "Avg Iterations", value: "4.2 cycles" },
      { label: "Topic Diversity", value: "140 categories" },
    ],
    code: `// Asynchronous Multi-Agent Collaboration Broker
import { Queue, ResearcherAgent, WriterAgent, CriticAgent } from '@multiagent/broker';

export async function coordinateResearchAndWriting(topic: string) {
  const queue = new Queue();
  const researcher = new ResearcherAgent(queue);
  const writer = new WriterAgent(queue);
  const critic = new CriticAgent(queue);

  await queue.publish('topic', topic);
  
  // Asynchronous feedback loop
  const rawFacts = await researcher.gatherData();
  let draft = await writer.composeDraft(rawFacts);
  let approval = false;

  while (!approval) {
    const critique = await critic.analyzeDraft(draft);
    if (critique.score >= 9.0) {
      approval = true;
    } else {
      draft = await writer.refineDraft(draft, critique.feedback);
    }
  }

  return draft;
}`,
  },
  4: {
    id: 4,
    title: "Agentic RAG & Memory Hub",
    badge: "Knowledge Retainer",
    subtitle:
      "High recall semantic search database coupled with episodic agent memory layers.",
    description:
      "This module acts as the long-term memory for our AI system. It implements hybrid keyword/vector search (RAG) using cosine similarity on high-dimensional text embeddings, alongside a persistent graph database that models semantic relationships, ensuring agents remember previous user interactions and domain files.",
    color: "var(--c-planet-4)",
    metrics: [
      { label: "Vector Nodes", value: "1.2M docs" },
      { label: "Query Latency", value: "14ms" },
      { label: "Recall Rate", value: "99.2%" },
      { label: "Memory hit rate", value: "88%" },
    ],
    code: `// Hybrid RAG Vector Retrieval & Memory Graph Query
import { VectorStore, GraphDB, EmbeddingModel } from '@memory/rag';

export async function queryMemory(queryString: string, agentId: string) {
  const embeddings = new EmbeddingModel('text-embedding-004');
  const vectorQuery = await embeddings.embed(queryString);
  
  // Concurrent vector lookup & episodic graph traversal
  const [vectorHits, episodicContext] = await Promise.all([
    VectorStore.similaritySearch(vectorQuery, { topK: 5 }),
    GraphDB.query(\`MATCH (a:Agent {id: "\${agentId}"})-[r:REMEMBERS]->(m:Memory)
                   WHERE m.topic CONTAINS "\${queryString}"
                   RETURN m.content LIMIT 3\`)
  ]);

  return mergeAndRerank(vectorHits, episodicContext);
}`,
  },
};

export default function ProjectDetails({
  planetId,
  onClose,
}: ProjectDetailsProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeProject = planetId ? PROJECTS_DATA[planetId] : null;

  const [voiceIsListening, setVoiceIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string[]>([
    "VoiceCanvas initialized.",
    "System: Please press the microphone button to speak.",
  ]);
  const [userSpeechInput, setUserSpeechInput] = useState("");

  const [terminalCommands, setTerminalCommands] = useState<string[]>([
    "Autonomous Task Agent Terminal v1.0.0",
    'Type "help" to see available tasks, or trigger a demo below.',
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const terminalContentRef = useRef<HTMLDivElement>(null);

  const [multiAgentLogs, setMultiAgentLogs] = useState<
    { sender: string; text: string; status: string; avatarBg: string }[]
  >([]);
  const [currentActiveAgent, setCurrentActiveAgent] = useState<string | null>(
    null,
  );
  const [isCollabActive, setIsCollabActive] = useState(false);
  const [collabOutput, setCollabOutput] = useState("");

  const [ragQuery, setRagQuery] = useState("");
  const [ragResults, setRagResults] = useState<
    { title: string; score: number; text: string }[]
  >([]);

  useEffect(() => {
    setVoiceIsListening(false);
    setUserSpeechInput("");
    setTerminalInput("");
    setIsTerminalRunning(false);
    setIsCollabActive(false);
    setCurrentActiveAgent(null);
    setCollabOutput("");
    setRagQuery("");
    setRagResults([]);

    if (planetId === 1) {
      setVoiceTranscript([
        "VoiceCanvas: Online.",
        "System: Click the microphone to start speaking with the Voice AI.",
      ]);
    } else if (planetId === 2) {
      setTerminalCommands([
        "Autonomous Task Agent Terminal v1.0.0",
        'Type "help" to list instructions, or click quick tasks below.',
      ]);
    } else if (planetId === 3) {
      setMultiAgentLogs([
        {
          sender: "System",
          text: "Multi-Agent Broker Idle. Awaiting collaboration trigger.",
          status: "IDLE",
          avatarBg: "rgba(255,255,255,0.1)",
        },
      ]);
    }
  }, [planetId]);

  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop =
        terminalContentRef.current.scrollHeight;
    }
  }, [terminalCommands]);

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

  const toggleVoiceListening = () => {
    if (voiceIsListening) {
      setVoiceIsListening(false);
      const userPhrases = [
        "How do you reduce VAD latency?",
        "Can you summarize the architecture?",
        "Tell me a joke about robots.",
        "Optimize my TTS buffer size.",
      ];
      const randomUserText =
        userPhrases[Math.floor(Math.random() * userPhrases.length)];

      setVoiceTranscript((prev) => [...prev, `You: ${randomUserText}`]);

      setTimeout(() => {
        let response = "";
        if (randomUserText.includes("latency")) {
          response =
            "VoiceCanvas Agent: We stream audio in 20ms chunks directly into GPU memory to perform VAD classification asynchronously, reducing total latency below 120ms.";
        } else if (randomUserText.includes("architecture")) {
          response =
            "VoiceCanvas Agent: It is a duplex path: User Audio -> VAD (VADStream) -> ASR (Opus-decoded Whisper) -> LLM -> TTS -> Audio playback queue.";
        } else if (randomUserText.includes("joke")) {
          response =
            "VoiceCanvas Agent: Why did the computer squeak? Because someone stepped on its mouse! Ha-ha. Let us get back to engineering.";
        } else {
          response =
            "VoiceCanvas Agent: Excellent query. By minimizing the buffer window size to 1024 samples and using Opus packet-loss concealment, we maintain clear streaming audio quality.";
        }
        setVoiceTranscript((prev) => [...prev, response]);
      }, 1000);
    } else {
      setVoiceIsListening(true);
      setVoiceTranscript((prev) => [
        ...prev,
        "Listening... Speak now and press microphone again when done.",
      ]);
    }
  };

  const handleVoiceTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSpeechInput.trim()) return;

    const input = userSpeechInput;
    setVoiceTranscript((prev) => [...prev, `You: ${input}`]);
    setUserSpeechInput("");

    setTimeout(() => {
      setVoiceTranscript((prev) => [
        ...prev,
        `VoiceCanvas Agent: Received text input. Processing audio synthesis backend... Synthesized payload containing ${input.length * 3} samples of expressive voice.`,
      ]);
    }, 8000 / 10);
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

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || isTerminalRunning) return;
    runTerminalCommand(terminalInput);
    setTerminalInput("");
  };

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

  const handleRagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    const query = ragQuery.toLowerCase();
    let mockResults = [
      {
        title: "episodic_memory_graph.db L45",
        score: 0.942,
        text: "Episodic memory logs user-agent chat history sequentially, representing it as node chains to keep chat context and relationships.",
      },
      {
        title: "vector_index_standard_embeddings.bin L110",
        score: 0.887,
        text: "Vector search retrieves similar text blocks using cosine distance metrics: cos(A,B) = (A·B)/(||A|| ||B||) to find relevant chunks.",
      },
      {
        title: "knowledge_base_nlp_basics.pdf L88",
        score: 0.725,
        text: "Hierarchical databases utilize parent-child folder categories to structure information index files before embedding conversion.",
      },
    ];

    if (
      query.includes("cosine") ||
      query.includes("math") ||
      query.includes("formula")
    ) {
      mockResults = [mockResults[1], mockResults[0], mockResults[2]];
    } else if (
      query.includes("graph") ||
      query.includes("history") ||
      query.includes("episode")
    ) {
      mockResults = [mockResults[0], mockResults[1], mockResults[2]];
    }

    setRagResults(mockResults);
  };

  const highlightCode = (rawCode: string) => {
    return rawCode.split("\n").map((line, i) => {
      let formatted = line;
      formatted = formatted.replace(
        /\b(import|export|const|let|async|await|function|new|return|class|from|while|if|else)\b/g,
        '<span class="text-[#f472b6]">$1</span>',
      );
      formatted = formatted.replace(
        /\b(startDuplexStream|runAgentLoop|coordinateResearchAndWriting|queryMemory|similaritySearch|query|exec|observe|plan|nextAction|interrupt|generateStream|synthesizeChunk|gatherData|composeDraft|analyzeDraft|refineDraft|playAudio|mergeAndRerank)\b/g,
        '<span class="text-[#60a5fa]">$1</span>',
      );
      formatted = formatted.replace(
        /(['"`])(.*?)\1/g,
        "<span class=\"text-[#86efac]\">'$2'</span>",
      );
      formatted = formatted.replace(
        /\b(\d+)\b/g,
        '<span class="text-[#fbbf24]">$1</span>',
      );
      formatted = formatted.replace(
        /(\/\/.*)/g,
        '<span class="text-[#6b7280]">$1</span>',
      );

      return (
        <div
          key={i}
          dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }}
        />
      );
    });
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 flex flex-col p-8 overflow-y-auto opacity-100 pointer-events-auto"
      style={{
        background:
          "radial-gradient(circle at center, #050512 0%, #000000 100%)",
      }}
    >
      <div className="hud-grid"></div>
      <div className="hud-scanline"></div>

      <div className="relative z-10 flex justify-between items-start border-b border-white/[0.08] pb-6 mb-8">
        <div className="flex flex-col gap-1.5">
          <span
            className="inline-block self-start font-[JetBrains_Mono] text-[0.65rem] font-semibold uppercase px-2.5 py-1 rounded tracking-[0.05em]"
            style={{
              backgroundColor: `${activeProject.color}20`,
              border: `1px solid ${activeProject.color}50`,
              color: activeProject.color,
            }}
          >
            {activeProject.badge}
          </span>
          <h2
            className="font-[Orbitron] text-3xl font-extrabold text-white tracking-[0.05em]"
            style={{ textShadow: `0 0 15px ${activeProject.color}30` }}
          >
            {activeProject.title}
          </h2>
          <p className="text-sm text-[#9ca3af]">{activeProject.subtitle}</p>
        </div>
        <button
          onClick={handleClose}
          className="bg-white/[0.03] border border-white/[0.08] text-white font-[Orbitron] text-[0.8rem] font-semibold tracking-[0.05em] px-5 py-2.5 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-white/[0.1] hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:-translate-y-0.5"
        >
          <X size={16} /> CLOSE HUD
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-[2fr_1fr] gap-8 flex-grow items-start max-lg:grid-cols-1">
        <div className="flex flex-col gap-8">
          <div className="sub-panel glass-panel p-6">
            <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
              Overview
            </h3>
            <p className="leading-relaxed text-sm text-[#9ca3af]">
              {activeProject.description}
            </p>
          </div>

          {planetId === 1 && (
            <div
              className="sub-panel glass-panel p-6"
              style={{ borderLeft: `3px solid ${activeProject.color}` }}
            >
              <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
                Interactive Voice Console
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={toggleVoiceListening}
                    className="px-6 py-3 rounded-lg font-[Orbitron] text-[0.8rem] font-bold cursor-pointer flex items-center gap-2 transition-all duration-300"
                    style={{
                      background: voiceIsListening
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(6, 182, 212, 0.1)",
                      border: voiceIsListening
                        ? "1px solid rgba(239, 68, 68, 0.5)"
                        : "1px solid rgba(6, 182, 212, 0.3)",
                      color: voiceIsListening ? "#ef4444" : "var(--c-planet-1)",
                      boxShadow: voiceIsListening
                        ? "0 0 15px rgba(239, 68, 68, 0.3)"
                        : "none",
                    }}
                  >
                    <Mic
                      size={14}
                      className={
                        voiceIsListening ? "animate-[blink_1s_infinite]" : ""
                      }
                    />
                    {voiceIsListening ? "STOP RECORDING" : "TAP TO SPEAK"}
                  </button>

                  <div className="flex-grow h-[120px] bg-black/40 rounded-lg border border-white/[0.05] flex items-center justify-center gap-[3px] px-4 overflow-hidden">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-5 bg-[#06b6d4] rounded-sm animate-[voice-wave-pulse_1.2s_ease-in-out_infinite_alternate]"
                        style={{
                          animationDelay: `${i * 0.05}s`,
                          animationPlayState: voiceIsListening
                            ? "running"
                            : "paused",
                          opacity: voiceIsListening ? 1 : 0.2,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto p-2 rounded-lg bg-black/20 border border-white/[0.03]">
                  {voiceTranscript.map((line, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2.5 rounded-lg text-[0.8rem] max-w-[80%] leading-[1.4] ${
                        line.startsWith("You:")
                          ? "self-end bg-white/[0.05] border border-white/[0.1] text-white"
                          : "self-start bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] text-[#e0f7fa]"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleVoiceTextSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={userSpeechInput}
                    onChange={(e) => setUserSpeechInput(e.target.value)}
                    placeholder="Type speech input here if microphone is not available..."
                    className="bg-black/40 border border-[rgba(6,182,212,0.3)] px-4 py-2.5 rounded-md text-white font-[JetBrains_Mono] text-[0.8rem] flex-grow outline-none focus:border-[#3b82f6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300"
                  />
                  <button
                    type="submit"
                    className="bg-[#06b6d4] text-white border-none font-[Orbitron] text-[0.8rem] font-bold px-5 py-2.5 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-[#0891b2]"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {planetId === 2 && (
            <div
              className="sub-panel glass-panel p-6"
              style={{ borderLeft: `3px solid ${activeProject.color}` }}
            >
              <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
                Autonomous Action Sandbox
              </h3>
              <div className="flex flex-col gap-4">
                <div className="font-[JetBrains_Mono] bg-[#020204] border border-[rgba(16,185,129,0.2)] rounded-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                  <div className="bg-[#0a0a0f] px-4 py-2 flex items-center gap-2 border-b border-white/[0.05]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
                    <span className="ml-4 text-[0.65rem] font-[JetBrains_Mono] text-[#9ca3af]">
                      agent_executor_sandbox
                    </span>
                  </div>
                  <div
                    ref={terminalContentRef}
                    className="p-4 h-[280px] overflow-y-auto text-xs leading-[1.5] text-[#10b981]"
                  >
                    {terminalCommands.map((line, i) => (
                      <div key={i} className="mb-0.5">
                        {line}
                      </div>
                    ))}
                    {isTerminalRunning && (
                      <div className="flex items-center gap-1.5 text-[#10b981]">
                        <span>&gt; Processing reasoning steps...</span>
                        <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full shadow-[0_0_6px_#10b981] animate-[blink_2s_infinite_ease-in-out]"></div>
                      </div>
                    )}
                  </div>
                  <form
                    onSubmit={handleTerminalSubmit}
                    className="border-t border-white/[0.05] px-4 py-2"
                  >
                    <div className="flex items-center gap-2 mt-0.5 text-white">
                      <span>$</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder={
                          isTerminalRunning
                            ? "Agent is busy working..."
                            : 'Type "help" or your custom command...'
                        }
                        disabled={isTerminalRunning}
                        className="bg-transparent border-none outline-none text-[#10b981] font-[JetBrains_Mono] text-xs flex-grow"
                      />
                    </div>
                  </form>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => runTerminalCommand("run-test")}
                    disabled={isTerminalRunning}
                    className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] text-white font-[Orbitron] text-[0.7rem] font-semibold tracking-[0.05em] px-3.5 py-1.5 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-white/[0.1] hover:border-white/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Quick Task: Run Code Tests
                  </button>
                  <button
                    onClick={() => runTerminalCommand("research")}
                    disabled={isTerminalRunning}
                    className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] text-white font-[Orbitron] text-[0.7rem] font-semibold tracking-[0.05em] px-3.5 py-1.5 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-white/[0.1] hover:border-white/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Quick Task: Scrape Web Research
                  </button>
                  <button
                    onClick={() => runTerminalCommand("status")}
                    disabled={isTerminalRunning}
                    className="bg-white/[0.03] border border-white/[0.08] text-white font-[Orbitron] text-[0.7rem] font-semibold tracking-[0.05em] px-3.5 py-1.5 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-white/[0.1] hover:border-white/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Agent Status Diagnostics
                  </button>
                </div>
              </div>
            </div>
          )}

          {planetId === 3 && (
            <div
              className="sub-panel glass-panel p-6"
              style={{ borderLeft: `3px solid ${activeProject.color}` }}
            >
              <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
                Collab Board (Research &rarr; Write &rarr; Critique)
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={triggerCollaborationDemo}
                    disabled={isCollabActive}
                    className="px-5 py-2.5 rounded-md font-[Orbitron] text-[0.75rem] font-bold cursor-pointer flex items-center gap-2 transition-all duration-300"
                    style={{
                      background: isCollabActive
                        ? "rgba(236, 72, 153, 0.05)"
                        : "rgba(236, 72, 153, 0.1)",
                      border: `1px solid ${isCollabActive ? "rgba(236,72,153,0.1)" : "rgba(236,72,153,0.3)"}`,
                      color: isCollabActive
                        ? "var(--text-muted)"
                        : "var(--c-planet-3)",
                    }}
                  >
                    <Users size={14} />
                    {isCollabActive
                      ? "COLLABORATION IN PROGRESS..."
                      : "START COLLAB PROCESS"}
                  </button>

                  {isCollabActive && (
                    <span className="text-[0.7rem] text-[#ec4899] font-[JetBrains_Mono]">
                      Active Node: {currentActiveAgent}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                  {[
                    {
                      name: "Researcher",
                      icon: <Search size={12} className="text-black" />,
                      color: "var(--c-planet-1)",
                    },
                    {
                      name: "Writer",
                      icon: <Code2 size={12} className="text-black" />,
                      color: "var(--c-planet-4)",
                    },
                    {
                      name: "Critic",
                      icon: <Activity size={12} className="text-black" />,
                      color: "var(--c-planet-3)",
                    },
                  ].map((agent) => {
                    const isActive = currentActiveAgent === agent.name;
                    return (
                      <div
                        key={agent.name}
                        className={`bg-white/[0.01] border border-white/[0.04] rounded-lg p-4 flex flex-col gap-2 relative transition-all duration-300 ${isActive ? "border-[#ec4899] bg-[rgba(236,72,153,0.03)] shadow-[0_0_15px_rgba(236,72,153,0.1)]" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex justify-center items-center"
                            style={{ backgroundColor: agent.color }}
                          >
                            {agent.icon}
                          </div>
                          <span className="font-[Orbitron] text-[0.75rem] font-bold text-white">
                            {agent.name}
                          </span>
                          <span
                            className="text-[0.6rem] uppercase px-1.5 py-0.5 rounded bg-white/[0.05]"
                            style={{ color: isActive ? agent.color : "" }}
                          >
                            {isActive
                              ? agent.name === "Researcher"
                                ? "WORKING"
                                : agent.name === "Writer"
                                  ? "COMPOSING"
                                  : "AUDITING"
                              : "IDLE"}
                          </span>
                        </div>
                        <p className="text-[0.7rem] text-[#9ca3af] h-[60px] overflow-hidden leading-[1.4]">
                          {isActive
                            ? agent.name === "Researcher"
                              ? "Extracting references and compiling data nodes..."
                              : agent.name === "Writer"
                                ? "Drafting outline and content elements..."
                                : "Performing quality checks and score validation..."
                            : agent.name === "Researcher"
                              ? "Waiting for research topic query..."
                              : agent.name === "Writer"
                                ? "Awaiting research facts list..."
                                : "Awaiting writer draft submission..."}
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
                      Final Generated Output v2
                    </span>
                    <div className="text-[0.75rem] leading-[1.5] text-[#f3f4f6] max-h-[150px] overflow-y-auto">
                      {collabOutput}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {planetId === 4 && (
            <div
              className="sub-panel glass-panel p-6"
              style={{ borderLeft: `3px solid ${activeProject.color}` }}
            >
              <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
                Vector Query Simulator
              </h3>
              <div className="flex flex-col gap-4">
                <form onSubmit={handleRagSearch} className="flex gap-2 mb-4">
                  <div className="relative flex-grow">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                    />
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="Ask RAG database (e.g. 'cosine similarity formula', 'episodic memory')..."
                      className="bg-black/40 border border-[rgba(59,130,246,0.3)] pl-9 pr-4 py-2.5 rounded-md text-white font-[JetBrains_Mono] text-[0.8rem] flex-grow outline-none focus:border-[#3b82f6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#3b82f6] text-white border-none font-[Orbitron] text-[0.8rem] font-bold px-5 py-2.5 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-[#2563eb]"
                  >
                    QUERY DB
                  </button>
                </form>

                <div className="flex flex-col gap-2">
                  {ragResults.length > 0 ? (
                    ragResults.map((res, i) => (
                      <div
                        key={i}
                        className="bg-white/[0.01] border border-white/[0.04] rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-[JetBrains_Mono] text-[0.75rem] text-[#3b82f6]">
                            {res.title}
                          </span>
                          <span className="font-[JetBrains_Mono] text-[0.65rem] text-[#fbbf24]">
                            Sim: {res.score.toFixed(3)}
                          </span>
                        </div>
                        <p className="text-[0.75rem] text-[#9ca3af] leading-[1.4]">
                          {res.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 border-[1.5px] border-dashed border-white/[0.05] rounded-lg text-[#9ca3af] text-[0.8rem]">
                      <Database size={24} className="mx-auto mb-2 opacity-30" />
                      No active query. Type a keyword query above to simulate
                      vector semantic lookup.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="sub-panel glass-panel p-6">
            <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
              Architecture Pipeline
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              {planetId === 1 && (
                <>
                  <div
                    className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                    style={{ borderColor: "var(--c-planet-1)" }}
                  >
                    PCM Audio
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    VADStream
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    ASR API
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    LLM Chain
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    TTS Core
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div
                    className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                    style={{ borderColor: "var(--c-planet-1)" }}
                  >
                    Audio Queue
                  </div>
                </>
              )}
              {planetId === 2 && (
                <>
                  <div
                    className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                    style={{ borderColor: "var(--c-planet-2)" }}
                  >
                    User Goal
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    LLM Planner
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Tool Dispatcher
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Docker Sandbox
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Observer
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div
                    className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                    style={{ borderColor: "var(--c-planet-2)" }}
                  >
                    Result Export
                  </div>
                </>
              )}
              {planetId === 3 && (
                <>
                  <div
                    className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                    style={{ borderColor: "var(--c-planet-3)" }}
                  >
                    Input Prompt
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Broker Queue
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Researcher
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Writer
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Critic Audit
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div
                    className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                    style={{ borderColor: "var(--c-planet-3)" }}
                  >
                    Consensus Output
                  </div>
                </>
              )}
              {planetId === 4 && (
                <>
                  <div
                    className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                    style={{ borderColor: "var(--c-planet-4)" }}
                  >
                    Raw Query
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Text Embedder
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Annoy Vector Index
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Graph Episodic DB
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]">
                    Reranker Model
                  </div>
                  <span className="text-[#9ca3af]">→</span>
                  <div
                    className="px-3 py-1.5 rounded text-[0.75rem] font-[JetBrains_Mono] bg-white/[0.02] border border-white/[0.05]"
                    style={{ borderColor: "var(--c-planet-4)" }}
                  >
                    Prompt Context
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="sub-panel glass-panel p-6">
            <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
              <BarChart3
                size={14}
                className="inline mr-1.5 align-middle"
                style={{ color: activeProject.color }}
              />
              Telemetry Metrics
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-4">
              {activeProject.metrics.map((met, i) => (
                <div
                  key={i}
                  className="border border-white/[0.04] bg-white/[0.01] p-4 rounded-lg flex flex-col gap-1"
                >
                  <span className="text-[0.65rem] uppercase text-[#9ca3af] tracking-[0.05em]">
                    {met.label}
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
              Reference Implementation
            </h3>
            <pre className="bg-black/40 border border-white/[0.05] rounded-lg p-4 overflow-x-auto text-xs leading-[1.6] font-[JetBrains_Mono] text-[#f3f4f6] max-h-[500px] overflow-y-auto">
              <code>{highlightCode(activeProject.code)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
