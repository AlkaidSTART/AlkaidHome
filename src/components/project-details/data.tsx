export { highlightCode } from "@lib/codeHighlight";

export interface ProjectData {
  id: number;
  titleKey: string;
  badgeKey: string;
  subtitleKey: string;
  descriptionKey: string;
  color: string;
  metrics: { labelKey: string; value: string }[];
  code: string;
}

export const PROJECTS_DATA: Record<number, ProjectData> = {
  1: {
    id: 1,
    titleKey: "projectDetails.voiceCanvas.title",
    badgeKey: "projectDetails.voiceCanvas.badge",
    subtitleKey: "projectDetails.voiceCanvas.subtitle",
    descriptionKey: "projectDetails.voiceCanvas.description",
    color: "var(--c-planet-1)",
    metrics: [
      { labelKey: "projectDetails.voiceCanvas.metrics.latency", value: "120ms" },
      { labelKey: "projectDetails.voiceCanvas.metrics.audioQuality", value: "Opus 48kHz" },
      { labelKey: "projectDetails.voiceCanvas.metrics.mosScore", value: "4.65" },
      { labelKey: "projectDetails.voiceCanvas.metrics.gpuConcurrency", value: "1.2k streams" },
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
    titleKey: "projectDetails.autonomousAgent.title",
    badgeKey: "projectDetails.autonomousAgent.badge",
    subtitleKey: "projectDetails.autonomousAgent.subtitle",
    descriptionKey: "projectDetails.autonomousAgent.description",
    color: "var(--c-planet-2)",
    metrics: [
      { labelKey: "projectDetails.autonomousAgent.metrics.taskSuccessRate", value: "94.2%" },
      { labelKey: "projectDetails.autonomousAgent.metrics.avgSteps", value: "12 steps" },
      { labelKey: "projectDetails.autonomousAgent.metrics.tokensSaved", value: "68%" },
      { labelKey: "projectDetails.autonomousAgent.metrics.sandboxedRuns", value: "48k / day" },
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
    titleKey: "projectDetails.multiAgent.title",
    badgeKey: "projectDetails.multiAgent.badge",
    subtitleKey: "projectDetails.multiAgent.subtitle",
    descriptionKey: "projectDetails.multiAgent.description",
    color: "var(--c-planet-3)",
    metrics: [
      { labelKey: "projectDetails.multiAgent.metrics.agentCount", value: "3 Active" },
      { labelKey: "projectDetails.multiAgent.metrics.consensusRate", value: "98.5%" },
      { labelKey: "projectDetails.multiAgent.metrics.avgIterations", value: "4.2 cycles" },
      { labelKey: "projectDetails.multiAgent.metrics.topicDiversity", value: "140 categories" },
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
    titleKey: "projectDetails.agenticRag.title",
    badgeKey: "projectDetails.agenticRag.badge",
    subtitleKey: "projectDetails.agenticRag.subtitle",
    descriptionKey: "projectDetails.agenticRag.description",
    color: "var(--c-planet-4)",
    metrics: [
      { labelKey: "projectDetails.agenticRag.metrics.vectorNodes", value: "1.2M docs" },
      { labelKey: "projectDetails.agenticRag.metrics.queryLatency", value: "14ms" },
      { labelKey: "projectDetails.agenticRag.metrics.recallRate", value: "99.2%" },
      { labelKey: "projectDetails.agenticRag.metrics.memoryHitRate", value: "88%" },
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

interface PipelineStep {
  labelKey: string;
  highlighted: boolean;
}

const PIPELINE_STEPS: Record<number, PipelineStep[]> = {
  1: [
    { labelKey: "projectDetails.voiceCanvas.pipeline.pcmAudio", highlighted: true },
    { labelKey: "projectDetails.voiceCanvas.pipeline.vadStream", highlighted: false },
    { labelKey: "projectDetails.voiceCanvas.pipeline.asrApi", highlighted: false },
    { labelKey: "projectDetails.voiceCanvas.pipeline.llmChain", highlighted: false },
    { labelKey: "projectDetails.voiceCanvas.pipeline.ttsCore", highlighted: false },
    { labelKey: "projectDetails.voiceCanvas.pipeline.audioQueue", highlighted: true },
  ],
  2: [
    { labelKey: "projectDetails.autonomousAgent.pipeline.userGoal", highlighted: true },
    { labelKey: "projectDetails.autonomousAgent.pipeline.llmPlanner", highlighted: false },
    { labelKey: "projectDetails.autonomousAgent.pipeline.toolDispatcher", highlighted: false },
    { labelKey: "projectDetails.autonomousAgent.pipeline.dockerSandbox", highlighted: false },
    { labelKey: "projectDetails.autonomousAgent.pipeline.observer", highlighted: false },
    { labelKey: "projectDetails.autonomousAgent.pipeline.resultExport", highlighted: true },
  ],
  3: [
    { labelKey: "projectDetails.multiAgent.pipeline.inputPrompt", highlighted: true },
    { labelKey: "projectDetails.multiAgent.pipeline.brokerQueue", highlighted: false },
    { labelKey: "projectDetails.multiAgent.pipeline.researcher", highlighted: false },
    { labelKey: "projectDetails.multiAgent.pipeline.writer", highlighted: false },
    { labelKey: "projectDetails.multiAgent.pipeline.criticAudit", highlighted: false },
    { labelKey: "projectDetails.multiAgent.pipeline.consensusOutput", highlighted: true },
  ],
  4: [
    { labelKey: "projectDetails.agenticRag.pipeline.rawQuery", highlighted: true },
    { labelKey: "projectDetails.agenticRag.pipeline.textEmbedder", highlighted: false },
    { labelKey: "projectDetails.agenticRag.pipeline.annoyVectorIndex", highlighted: false },
    { labelKey: "projectDetails.agenticRag.pipeline.graphEpisodicDb", highlighted: false },
    { labelKey: "projectDetails.agenticRag.pipeline.rerankerModel", highlighted: false },
    { labelKey: "projectDetails.agenticRag.pipeline.promptContext", highlighted: true },
  ],
};

export function getPipelineSteps(planetId: number): PipelineStep[] {
  return PIPELINE_STEPS[planetId] ?? [];
}
