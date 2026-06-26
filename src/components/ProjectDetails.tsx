import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Mic, Send, Users, Database, Search, 
  Activity, Code2, BarChart3 
} from 'lucide-react';
import { gsap } from 'gsap';

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
    title: 'VoiceCanvas',
    badge: 'Multimodal Real-Time Interaction',
    subtitle: 'Real-time duplex voice interaction engine featuring low latency and expressive synthesis.',
    description: 'VoiceCanvas integrates Voice Activity Detection (VAD), Automatic Speech Recognition (ASR), Large Language Model orchestration, and Text-to-Speech (TTS) synthesis into a unified, high-performance streaming pipeline. Built to support conversational agents that feel natural, mimicking human turn-taking and emotional response inflections.',
    color: 'var(--c-planet-1)',
    metrics: [
      { label: 'Latency', value: '120ms' },
      { label: 'Audio Quality', value: 'Opus 48kHz' },
      { label: 'MOS Score', value: '4.65' },
      { label: 'GPU Concurrency', value: '1.2k streams' }
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
}`
  },
  2: {
    id: 2,
    title: 'Autonomous Task Agent',
    badge: 'ReAct Tool Use Specialist',
    subtitle: 'An autonomous agent that reasons, plans, and writes code to accomplish multi-step objectives.',
    description: 'Autonomous Task Agent utilizes advanced ReAct (Reasoning and Acting) prompt topologies to self-correct and execute complex code, terminal commands, web search queries, and email dispatches. Outfitted with safety sandboxes to prevent data loss while offering powerful execution capability.',
    color: 'var(--c-planet-2)',
    metrics: [
      { label: 'Task Success Rate', value: '94.2%' },
      { label: 'Avg Steps / Task', value: '12 steps' },
      { label: 'Tokens Saved', value: '68%' },
      { label: 'Sandboxed Runs', value: '48k / day' }
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
}`
  },
  3: {
    id: 3,
    title: 'Multi-Agent System',
    badge: 'Collaborative Ecosystem',
    subtitle: 'A distributed system where specialized agents negotiate and review work to achieve high-quality results.',
    description: 'Instead of relying on a single generalist model, the Multi-Agent System breaks tasks down and assigns them to specialized agents: Researcher, Writer, and Critic. They collaborate via an asynchronous message-passing queue, debating drafts and correcting errors automatically before final output generation.',
    color: 'var(--c-planet-3)',
    metrics: [
      { label: 'Agent Count', value: '3 Active' },
      { label: 'Consensus Rate', value: '98.5%' },
      { label: 'Avg Iterations', value: '4.2 cycles' },
      { label: 'Topic Diversity', value: '140 categories' }
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
}`
  },
  4: {
    id: 4,
    title: 'Agentic RAG & Memory Hub',
    badge: 'Knowledge Retainer',
    subtitle: 'High recall semantic search database coupled with episodic agent memory layers.',
    description: 'This module acts as the long-term memory for our AI system. It implements hybrid keyword/vector search (RAG) using cosine similarity on high-dimensional text embeddings, alongside a persistent graph database that models semantic relationships, ensuring agents remember previous user interactions and domain files.',
    color: 'var(--c-planet-4)',
    metrics: [
      { label: 'Vector Nodes', value: '1.2M docs' },
      { label: 'Query Latency', value: '14ms' },
      { label: 'Recall Rate', value: '99.2%' },
      { label: 'Memory hit rate', value: '88%' }
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
}`
  }
};

export default function ProjectDetails({ planetId, onClose }: ProjectDetailsProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeProject = planetId ? PROJECTS_DATA[planetId] : null;

  // State for interactive features
  const [voiceIsListening, setVoiceIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string[]>([
    'VoiceCanvas initialized.',
    'System: Please press the microphone button to speak.'
  ]);
  const [userSpeechInput, setUserSpeechInput] = useState('');

  const [terminalCommands, setTerminalCommands] = useState<string[]>([
    'Autonomous Task Agent Terminal v1.0.0',
    'Type "help" to see available tasks, or trigger a demo below.'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const terminalContentRef = useRef<HTMLDivElement>(null);

  const [multiAgentLogs, setMultiAgentLogs] = useState<{ sender: string; text: string; status: string; avatarBg: string }[]>([]);
  const [currentActiveAgent, setCurrentActiveAgent] = useState<string | null>(null);
  const [isCollabActive, setIsCollabActive] = useState(false);
  const [collabOutput, setCollabOutput] = useState('');

  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<{ title: string; score: number; text: string }[]>([]);

  // Reset interactive demos when project changes
  useEffect(() => {
    setVoiceIsListening(false);
    setUserSpeechInput('');
    setTerminalInput('');
    setIsTerminalRunning(false);
    setIsCollabActive(false);
    setCurrentActiveAgent(null);
    setCollabOutput('');
    setRagQuery('');
    setRagResults([]);

    if (planetId === 1) {
      setVoiceTranscript([
        'VoiceCanvas: Online.',
        'System: Click the microphone to start speaking with the Voice AI.'
      ]);
    } else if (planetId === 2) {
      setTerminalCommands([
        'Autonomous Task Agent Terminal v1.0.0',
        'Type "help" to list instructions, or click quick tasks below.'
      ]);
    } else if (planetId === 3) {
      setMultiAgentLogs([
        { sender: 'System', text: 'Multi-Agent Broker Idle. Awaiting collaboration trigger.', status: 'IDLE', avatarBg: 'rgba(255,255,255,0.1)' }
      ]);
    }
  }, [planetId]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  }, [terminalCommands]);

  // GSAP Entrance
  useEffect(() => {
    if (planetId) {
      // Set active details overlay open
      const el = overlayRef.current;
      if (!el) return;

      gsap.fromTo(el, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );

      // Slide in child panels
      gsap.fromTo(el.querySelectorAll('.sub-panel'),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [planetId]);

  if (!planetId || !activeProject) return null;

  // Close with GSAP Exit
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
      ease: 'power3.in',
      onComplete: onClose
    });
  };

  // 1. VoiceCanvas interactive functions
  const toggleVoiceListening = () => {
    if (voiceIsListening) {
      setVoiceIsListening(false);
      // Simulate speech processed
      const userPhrases = [
        'How do you reduce VAD latency?',
        'Can you summarize the architecture?',
        'Tell me a joke about robots.',
        'Optimize my TTS buffer size.'
      ];
      const randomUserText = userPhrases[Math.floor(Math.random() * userPhrases.length)];
      
      setVoiceTranscript(prev => [...prev, `You: ${randomUserText}`]);

      // Delay agent response
      setTimeout(() => {
        let response = '';
        if (randomUserText.includes('latency')) {
          response = 'VoiceCanvas Agent: We stream audio in 20ms chunks directly into GPU memory to perform VAD classification asynchronously, reducing total latency below 120ms.';
        } else if (randomUserText.includes('architecture')) {
          response = 'VoiceCanvas Agent: It is a duplex path: User Audio -> VAD (VADStream) -> ASR (Opus-decoded Whisper) -> LLM -> TTS -> Audio playback queue.';
        } else if (randomUserText.includes('joke')) {
          response = 'VoiceCanvas Agent: Why did the computer squeak? Because someone stepped on its mouse! Ha-ha. Let us get back to engineering.';
        } else {
          response = 'VoiceCanvas Agent: Excellent query. By minimizing the buffer window size to 1024 samples and using Opus packet-loss concealment, we maintain clear streaming audio quality.';
        }
        setVoiceTranscript(prev => [...prev, response]);
      }, 1000);
    } else {
      setVoiceIsListening(true);
      setVoiceTranscript(prev => [...prev, 'Listening... Speak now and press microphone again when done.']);
    }
  };

  const handleVoiceTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSpeechInput.trim()) return;

    const input = userSpeechInput;
    setVoiceTranscript(prev => [...prev, `You: ${input}`]);
    setUserSpeechInput('');

    setTimeout(() => {
      setVoiceTranscript(prev => [
        ...prev,
        `VoiceCanvas Agent: Received text input. Processing audio synthesis backend... Synthesized payload containing ${input.length * 3} samples of expressive voice.`
      ]);
    }, 8000 / 10);
  };

  // 2. Autonomous Task Agent interactive functions
  const runTerminalCommand = (cmd: string) => {
    const normalizedCmd = cmd.trim().toLowerCase();
    let responses: string[] = [];

    if (normalizedCmd === 'help') {
      responses = [
        `$ ${cmd}`,
        'Available terminal commands:',
        '  help       - Show this help dialogue',
        '  clear      - Clear the console logs',
        '  status     - Show agent diagnostics',
        '  run-test   - Run sandboxed test execution suite',
        '  research   - Launch automated web research scraper'
      ];
      setTerminalCommands(prev => [...prev, ...responses]);
    } else if (normalizedCmd === 'clear') {
      setTerminalCommands([]);
    } else if (normalizedCmd === 'status') {
      responses = [
        `$ ${cmd}`,
        'Agent Core Status: ONLINE',
        'Reasoning Model: Gemini 3.5 Flash',
        'Connected Tools: SearchAPI, TerminalSandbox, EmailSMTP, FileFS',
        'Task queue count: 0 pending, 1420 successfully executed'
      ];
      setTerminalCommands(prev => [...prev, ...responses]);
    } else if (normalizedCmd === 'run-test') {
      executeAgentTask('Run sandboxed test execution suite', [
        'Agent: Starting Sandbox SandboxInstance-8812...',
        'Agent: Initialized Alpine Linux container successfully.',
        'Agent: Creating temporary workspace directory /tmp/workspace...',
        'Agent: Writing file test_api.py (24 lines)...',
        'Agent: Running: pytest test_api.py',
        'Sandbox Output: =================== 3 passed in 0.45s ===================',
        'Agent: All test cases passed! Cleaning sandbox container...',
        'Agent Task: Completed with code 0.'
      ]);
    } else if (normalizedCmd === 'research') {
      executeAgentTask('Launch automated web research scraper', [
        'Agent: Formulating research queries for web lookup...',
        'Agent: Calling tool WebSearch({ query: "AI agent frameworks 2026" })...',
        'Tool Response: WebSearch returned 5 source paragraphs.',
        'Agent: Extracting references and checking consistency...',
        'Agent: Writing document report.md inside agent storage workspace...',
        'Agent: Dispatching summary email to stakeholder@example.com...',
        'Agent Task: Completed. Email sent successfully.'
      ]);
    } else if (normalizedCmd === '') {
      setTerminalCommands(prev => [...prev, '$']);
    } else {
      responses = [
        `$ ${cmd}`,
        `Command not found: "${cmd}". Type "help" for a list of valid commands.`
      ];
      setTerminalCommands(prev => [...prev, ...responses]);
    }
  };

  const executeAgentTask = (taskName: string, steps: string[]) => {
    if (isTerminalRunning) return;
    setIsTerminalRunning(true);
    setTerminalCommands(prev => [...prev, `$ executing_agent --task "${taskName}"`]);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setTerminalCommands(prev => [...prev, steps[stepIndex]]);
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
    setTerminalInput('');
  };

  // 3. Multi-Agent interactive functions
  const triggerCollaborationDemo = () => {
    if (isCollabActive) return;
    setIsCollabActive(true);
    setCollabOutput('');
    setMultiAgentLogs([]);

    const collabSteps = [
      { sender: 'System', text: 'Task initialized: "Write a short blog post on Hierarchical Agent Memory."', status: 'BUSY', avatarBg: 'rgba(255,255,255,0.1)' },
      { sender: 'Researcher', text: 'Searching internal databases for Hierarchical Memory, short-term vs long-term storage...', status: 'WORKING', avatarBg: 'var(--c-planet-1)' },
      { sender: 'Researcher', text: 'Fact list generated: 1) Memory divided into episodic & semantic; 2) Vector databases serve as long-term storage; 3) System prompt context acts as short-term RAM.', status: 'DONE', avatarBg: 'var(--c-planet-1)' },
      { sender: 'Writer', text: 'Drafting introduction and structure based on research facts...', status: 'WORKING', avatarBg: 'var(--c-planet-4)' },
      { sender: 'Writer', text: 'Draft v1: "Hierarchical Agent Memory mimics human brain structure, separating fast-access context (short-term) from indexed embeddings (long-term database). This enables complex tool-use agents."', status: 'DONE', avatarBg: 'var(--c-planet-4)' },
      { sender: 'Critic', text: 'Analyzing Draft v1 content structure, grammar, and completeness...', status: 'WORKING', avatarBg: 'var(--c-planet-3)' },
      { sender: 'Critic', text: 'Feedback: Draft is good, but lacks concrete code examples of vector querying. Requesting revisions from Writer.', status: 'REJECTED', avatarBg: 'var(--c-planet-3)' },
      { sender: 'Writer', text: 'Injecting code examples into draft structure...', status: 'WORKING', avatarBg: 'var(--c-planet-4)' },
      { sender: 'Writer', text: 'Draft v2: Added Node.js embedding query code snippet. Resubmitting to Critic.', status: 'DONE', avatarBg: 'var(--c-planet-4)' },
      { sender: 'Critic', text: 'Analyzing Draft v2. Checking code correctness...', status: 'WORKING', avatarBg: 'var(--c-planet-3)' },
      { sender: 'Critic', text: 'Draft v2 approved! Score 9.5/10. Ready for delivery.', status: 'APPROVED', avatarBg: 'var(--c-planet-3)' },
      { sender: 'System', text: 'Collaboration successfully completed.', status: 'SUCCESS', avatarBg: 'rgba(255,255,255,0.1)' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < collabSteps.length) {
        const step = collabSteps[stepIndex];
        setMultiAgentLogs(prev => [...prev, step]);
        setCurrentActiveAgent(step.sender);

        if (step.sender === 'Writer' && step.status === 'DONE') {
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

  // 4. RAG & Memory Hub interactive functions
  const handleRagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    const query = ragQuery.toLowerCase();
    let mockResults = [
      {
        title: 'episodic_memory_graph.db L45',
        score: 0.942,
        text: 'Episodic memory logs user-agent chat history sequentially, representing it as node chains to keep chat context and relationships.'
      },
      {
        title: 'vector_index_standard_embeddings.bin L110',
        score: 0.887,
        text: 'Vector search retrieves similar text blocks using cosine distance metrics: cos(A,B) = (A·B)/(||A|| ||B||) to find relevant chunks.'
      },
      {
        title: 'knowledge_base_nlp_basics.pdf L88',
        score: 0.725,
        text: 'Hierarchical databases utilize parent-child folder categories to structure information index files before embedding conversion.'
      }
    ];

    if (query.includes('cosine') || query.includes('math') || query.includes('formula')) {
      mockResults = [mockResults[1], mockResults[0], mockResults[2]];
    } else if (query.includes('graph') || query.includes('history') || query.includes('episode')) {
      mockResults = [mockResults[0], mockResults[1], mockResults[2]];
    }

    setRagResults(mockResults);
  };

  // Format code blocks helper
  const highlightCode = (rawCode: string) => {
    return rawCode.split('\n').map((line, i) => {
      let formatted = line;
      // Keywords
      formatted = formatted.replace(/\b(import|export|const|let|async|await|function|new|return|class|from|while|if|else)\b/g, '<span class="code-keyword">$1</span>');
      // Functions
      formatted = formatted.replace(/\b(startDuplexStream|runAgentLoop|coordinateResearchAndWriting|queryMemory|similaritySearch|query|exec|observe|plan|nextAction|interrupt|generateStream|synthesizeChunk|gatherData|composeDraft|analyzeDraft|refineDraft|playAudio|mergeAndRerank)\b/g, '<span class="code-function">$1</span>');
      // Strings
      formatted = formatted.replace(/(['"`])(.*?)\1/g, '<span class="code-string">\'$2\'</span>');
      // Numbers
      formatted = formatted.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');
      // Comments
      formatted = formatted.replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>');

      return (
        <div key={i} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />
      );
    });
  };

  return (
    <div ref={overlayRef} className="details-overlay active">
      {/* HUD scanlines */}
      <div className="hud-grid"></div>
      <div className="hud-scanline"></div>

      {/* Header bar */}
      <div className="details-header" style={{ position: 'relative', zIndex: 10 }}>
        <div className="details-title-area">
          <span className="details-badge" style={{ backgroundColor: `${activeProject.color}20`, border: `1px solid ${activeProject.color}50`, color: activeProject.color }}>
            {activeProject.badge}
          </span>
          <h2 className="details-title" style={{ textShadow: `0 0 15px ${activeProject.color}30` }}>
            {activeProject.title}
          </h2>
          <p className="details-subtitle">{activeProject.subtitle}</p>
        </div>
        <button onClick={handleClose} className="details-close-btn">
          <X size={16} /> CLOSE HUD
        </button>
      </div>

      {/* Grid Content */}
      <div className="details-grid" style={{ position: 'relative', zIndex: 10 }}>
        {/* Left side: descriptions & live demo */}
        <div className="details-panel-left">
          {/* Main Info */}
          <div className="sub-panel glass-panel">
            <h3 className="sub-panel-title">Overview</h3>
            <p style={{ lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {activeProject.description}
            </p>
          </div>

          {/* Interactive Demos */}
          {planetId === 1 && (
            <div className="sub-panel glass-panel" style={{ borderLeft: `3px solid ${activeProject.color}` }}>
              <h3 className="sub-panel-title">Interactive Voice Console</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <button 
                    onClick={toggleVoiceListening}
                    style={{
                      background: voiceIsListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.1)',
                      border: voiceIsListening ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(6, 182, 212, 0.3)',
                      color: voiceIsListening ? '#ef4444' : 'var(--c-planet-1)',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-orbitron)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: voiceIsListening ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Mic size={14} className={voiceIsListening ? 'blink' : ''} />
                    {voiceIsListening ? 'STOP RECORDING' : 'TAP TO SPEAK'}
                  </button>
                  
                  {/* Waveform visualizer simulation */}
                  <div className="voice-wave-canvas" style={{ flexGrow: 1 }}>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="voice-wave-bar" 
                        style={{ 
                          animationDelay: `${i * 0.05}s`,
                          animationPlayState: voiceIsListening ? 'running' : 'paused',
                          opacity: voiceIsListening ? 1 : 0.2
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="voice-chat-box">
                  {voiceTranscript.map((line, i) => (
                    <div 
                      key={i} 
                      className={`chat-bubble ${line.startsWith('You:') ? 'user' : 'agent'}`}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleVoiceTextSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={userSpeechInput}
                    onChange={(e) => setUserSpeechInput(e.target.value)}
                    placeholder="Type speech input here if microphone is not available..."
                    className="rag-input"
                    style={{ border: '1px solid rgba(6, 182, 212, 0.3)' }}
                  />
                  <button type="submit" className="rag-btn" style={{ backgroundColor: 'var(--c-planet-1)' }}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {planetId === 2 && (
            <div className="sub-panel glass-panel" style={{ borderLeft: `3px solid ${activeProject.color}` }}>
              <h3 className="sub-panel-title">Autonomous Action Sandbox</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="terminal-window">
                  <div className="terminal-header">
                    <div className="terminal-dot" style={{ backgroundColor: '#ef4444' }}></div>
                    <div className="terminal-dot" style={{ backgroundColor: '#eab308' }}></div>
                    <div className="terminal-dot" style={{ backgroundColor: '#22c55e' }}></div>
                    <span style={{ marginLeft: '1rem', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      agent_executor_sandbox
                    </span>
                  </div>
                  <div ref={terminalContentRef} className="terminal-content">
                    {terminalCommands.map((line, i) => (
                      <div key={i} style={{ marginBottom: '0.2rem' }}>{line}</div>
                    ))}
                    {isTerminalRunning && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
                        <span>&gt; Processing reasoning steps...</span>
                        <div className="brand-dot" style={{ width: '6px', height: '6px', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }}></div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleTerminalSubmit} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem 1rem' }}>
                    <div className="terminal-input-row">
                      <span>$</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder={isTerminalRunning ? 'Agent is busy working...' : 'Type "help" or your custom command...'}
                        disabled={isTerminalRunning}
                        className="terminal-input"
                      />
                    </div>
                  </form>
                </div>

                {/* Quick actions triggers */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => runTerminalCommand('run-test')}
                    disabled={isTerminalRunning}
                    className="details-close-btn"
                    style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    Quick Task: Run Code Tests
                  </button>
                  <button 
                    onClick={() => runTerminalCommand('research')}
                    disabled={isTerminalRunning}
                    className="details-close-btn"
                    style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    Quick Task: Scrape Web Research
                  </button>
                  <button 
                    onClick={() => runTerminalCommand('status')}
                    disabled={isTerminalRunning}
                    className="details-close-btn"
                    style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
                  >
                    Agent Status Diagnostics
                  </button>
                </div>
              </div>
            </div>
          )}

          {planetId === 3 && (
            <div className="sub-panel glass-panel" style={{ borderLeft: `3px solid ${activeProject.color}` }}>
              <h3 className="sub-panel-title">Collab Board (Research &rarr; Write &rarr; Critique)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={triggerCollaborationDemo}
                    disabled={isCollabActive}
                    style={{
                      background: isCollabActive ? 'rgba(236, 72, 153, 0.05)' : 'rgba(236, 72, 153, 0.1)',
                      border: `1px solid ${isCollabActive ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.3)'}`,
                      color: isCollabActive ? 'var(--text-muted)' : 'var(--c-planet-3)',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-orbitron)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Users size={14} />
                    {isCollabActive ? 'COLLABORATION IN PROGRESS...' : 'START COLLAB PROCESS'}
                  </button>

                  {isCollabActive && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--c-planet-3)', fontFamily: 'var(--font-mono)' }}>
                      Active Node: {currentActiveAgent}
                    </span>
                  )}
                </div>

                {/* 3 Agents nodes status */}
                <div className="multi-agent-board">
                  <div className={`agent-node-card ${currentActiveAgent === 'Researcher' ? 'active' : ''}`}>
                    <div className="agent-header">
                      <div className="agent-avatar" style={{ backgroundColor: 'var(--c-planet-1)' }}>
                        <Search size={12} style={{ color: '#000' }} />
                      </div>
                      <span className="agent-name">Researcher</span>
                      <span className="agent-status" style={{ color: currentActiveAgent === 'Researcher' ? 'var(--c-planet-1)' : '' }}>
                        {currentActiveAgent === 'Researcher' ? 'WORKING' : 'IDLE'}
                      </span>
                    </div>
                    <p className="agent-activity">
                      {currentActiveAgent === 'Researcher' 
                        ? 'Extracting references and compiling data nodes...' 
                        : 'Waiting for research topic query...'}
                    </p>
                  </div>

                  <div className={`agent-node-card ${currentActiveAgent === 'Writer' ? 'active' : ''}`}>
                    <div className="agent-header">
                      <div className="agent-avatar" style={{ backgroundColor: 'var(--c-planet-4)' }}>
                        <Code2 size={12} style={{ color: '#000' }} />
                      </div>
                      <span className="agent-name">Writer</span>
                      <span className="agent-status" style={{ color: currentActiveAgent === 'Writer' ? 'var(--c-planet-4)' : '' }}>
                        {currentActiveAgent === 'Writer' ? 'COMPOSING' : 'IDLE'}
                      </span>
                    </div>
                    <p className="agent-activity">
                      {currentActiveAgent === 'Writer' 
                        ? 'Drafting outline and content elements...' 
                        : 'Awaiting research facts list...'}
                    </p>
                  </div>

                  <div className={`agent-node-card ${currentActiveAgent === 'Critic' ? 'active' : ''}`}>
                    <div className="agent-header">
                      <div className="agent-avatar" style={{ backgroundColor: 'var(--c-planet-3)' }}>
                        <Activity size={12} style={{ color: '#000' }} />
                      </div>
                      <span className="agent-name">Critic</span>
                      <span className="agent-status" style={{ color: currentActiveAgent === 'Critic' ? 'var(--c-planet-3)' : '' }}>
                        {currentActiveAgent === 'Critic' ? 'AUDITING' : 'IDLE'}
                      </span>
                    </div>
                    <p className="agent-activity">
                      {currentActiveAgent === 'Critic' 
                        ? 'Performing quality checks and score validation...' 
                        : 'Awaiting writer draft submission...'}
                    </p>
                  </div>
                </div>

                {/* Queue log message */}
                <div style={{ height: '140px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {multiAgentLogs.map((log, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                      <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
                      <span style={{ color: 'var(--c-planet-3)', fontWeight: 600 }}>{log.sender}:</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>

                {collabOutput && (
                  <div className="agent-output-preview">
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>
                      Final Generated Output v2
                    </span>
                    <div className="agent-output-text">{collabOutput}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {planetId === 4 && (
            <div className="sub-panel glass-panel" style={{ borderLeft: `3px solid ${activeProject.color}` }}>
              <h3 className="sub-panel-title">Vector Query Simulator</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <form onSubmit={handleRagSearch} className="rag-search-bar">
                  <div style={{ position: 'relative', flexGrow: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="Ask RAG database (e.g. 'cosine similarity formula', 'episodic memory')..."
                      className="rag-input"
                      style={{ paddingLeft: '2.2rem' }}
                    />
                  </div>
                  <button type="submit" className="rag-btn">QUERY DB</button>
                </form>

                <div className="rag-results">
                  {ragResults.length > 0 ? (
                    ragResults.map((res, i) => (
                      <div key={i} className="rag-result-item">
                        <div className="rag-result-header">
                          <span className="rag-result-title">{res.title}</span>
                          <span className="rag-result-score">Sim: {res.score.toFixed(3)}</span>
                        </div>
                        <p className="rag-result-text">{res.text}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1.5px dashed rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <Database size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                      No active query. Type a keyword query above to simulate vector semantic lookup.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Architecture flow block diagram */}
          <div className="sub-panel glass-panel">
            <h3 className="sub-panel-title">Architecture Pipeline</h3>
            <div className="arch-diagram">
              <div className="arch-steps">
                {planetId === 1 && (
                  <>
                    <div className="arch-node" style={{ borderColor: 'var(--c-planet-1)' }}>PCM Audio</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">VADStream</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">ASR API</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">LLM Chain</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">TTS Core</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node" style={{ borderColor: 'var(--c-planet-1)' }}>Audio Queue</div>
                  </>
                )}
                {planetId === 2 && (
                  <>
                    <div className="arch-node" style={{ borderColor: 'var(--c-planet-2)' }}>User Goal</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">LLM Planner</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Tool Dispatcher</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Docker Sandbox</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Observer</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node" style={{ borderColor: 'var(--c-planet-2)' }}>Result Export</div>
                  </>
                )}
                {planetId === 3 && (
                  <>
                    <div className="arch-node" style={{ borderColor: 'var(--c-planet-3)' }}>Input Prompt</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Broker Queue</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Researcher</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Writer</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Critic Audit</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node" style={{ borderColor: 'var(--c-planet-3)' }}>Consensus Output</div>
                  </>
                )}
                {planetId === 4 && (
                  <>
                    <div className="arch-node" style={{ borderColor: 'var(--c-planet-4)' }}>Raw Query</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Text Embedder</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Annoy Vector Index</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Graph Episodic DB</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node">Reranker Model</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node" style={{ borderColor: 'var(--c-planet-4)' }}>Prompt Context</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side: engineering stats & source code */}
        <div className="details-panel-right">
          {/* Engineering Metrics */}
          <div className="sub-panel glass-panel">
            <h3 className="sub-panel-title">
              <BarChart3 size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle', color: activeProject.color }} />
              Telemetry Metrics
            </h3>
            <div className="metric-grid">
              {activeProject.metrics.map((met, i) => (
                <div key={i} className="metric-item">
                  <span className="metric-label">{met.label}</span>
                  <span className="metric-value" style={{ color: activeProject.color }}>{met.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Snippet */}
          <div className="sub-panel glass-panel" style={{ flexGrow: 1 }}>
            <h3 className="sub-panel-title">
              <Code2 size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle', color: activeProject.color }} />
              Reference Implementation
            </h3>
            <pre className="hud-code-block">
              <code>{highlightCode(activeProject.code)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
