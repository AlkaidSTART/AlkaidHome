import { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Clock, Sliders } from 'lucide-react';

interface ConsolePanelProps {
  speed: number;
  setSpeed: (speed: number) => void;
  activePlanetName: string | null;
}

const SIMULATED_LOGS = [
  'SYSTEM: Core Orchestrator running on cluster us-west-2. Orbiting normal.',
  'VOICE_CANVAS: Calibrating silence threshold (VAD) // Noise floor -52dB.',
  'AUTONOMOUS_AGENT: Search tool returned 12 hits. Synthesizing solution...',
  'MULTI_AGENT: Critic agent rejected Draft v1.2, requesting Writer revision.',
  'RAG_MEMORY: Executing cosine similarity on 1.2M nodes. Retrieval time 14ms.',
  'SYSTEM: Health check complete. Memory consumption: 14%, CPU: 8.5%.',
  'VOICE_CANVAS: Streaming Opus packets (48kHz stereo, 120ms latency).',
  'AUTONOMOUS_AGENT: Code executor spinup complete. Sandbox initialized.',
  'MULTI_AGENT: Consensus reached. Aggregating output draft for User.',
  'RAG_MEMORY: Re-indexing long-term semantic storage. Vector embeddings updated.',
];

export default function ConsolePanel({ speed, setSpeed, activePlanetName }: ConsolePanelProps) {
  const [logMessage, setLogMessage] = useState(SIMULATED_LOGS[0]);
  const [timeString, setTimeString] = useState('');
  const logIndexRef = useRef(0);

  // System time updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  // Rolling simulated logs
  useEffect(() => {
    if (activePlanetName) {
      // Show customized contextual log when details overlay is open
      setLogMessage(`INTERACTION: Connected to ${activePlanetName}. Telemetry streaming...`);
      return;
    }

    const interval = setInterval(() => {
      logIndexRef.current = (logIndexRef.current + 1) % SIMULATED_LOGS.length;
      setLogMessage(SIMULATED_LOGS[logIndexRef.current]);
    }, 4500);

    return () => clearInterval(interval);
  }, [activePlanetName]);

  return (
    <div className="console-container">
      <div className="console-body glass-panel">
        {/* Left side: rolling terminal logs */}
        <div className="console-logs">
          <Terminal className="console-prefix" size={14} />
          <span className="console-time" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            [{timeString}]
          </span>
          <span className="console-message" key={logMessage}>
            {logMessage}
          </span>
        </div>

        {/* Right side: controls & latency HUD */}
        <div className="console-controls">
          <div className="speed-slider-container">
            <Sliders size={12} style={{ color: 'var(--text-muted)' }} />
            <label htmlFor="orbit-speed">Speed</label>
            <input
              id="orbit-speed"
              type="range"
              min="0"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="speed-slider"
              title="Adjust planet orbital velocity"
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', width: '25px', textAlign: 'right' }}>
              {speed.toFixed(1)}x
            </span>
          </div>

          <div style={{ height: '14px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem' }}>
            <Cpu size={12} style={{ color: 'var(--c-planet-2)' }} />
            <span>GPU: <strong style={{ color: '#fff' }}>14%</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem' }}>
            <Clock size={12} style={{ color: 'var(--c-planet-4)' }} />
            <span>PING: <strong style={{ color: '#fff' }}>12ms</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
