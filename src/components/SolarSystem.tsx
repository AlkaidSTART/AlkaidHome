import { useEffect, useRef, useState } from 'react';
import { Search, Code2, Mail, Terminal } from 'lucide-react';

interface SolarSystemProps {
  speed: number;
  onPlanetClick: (id: number) => void;
}

interface PlanetConfig {
  id: number;
  name: string;
  role: string;
  desc: string;
  color: string;
  rx: number;
  ry: number;
  speedCoeff: number;
  startAngle: number;
  stats: { label: string; value: string }[];
}

const PLANETS_CONFIG: PlanetConfig[] = [
  {
    id: 1,
    name: 'VoiceCanvas',
    role: 'Multimodal Stream',
    desc: 'Real-time duplex conversational audio system.',
    color: 'var(--c-planet-1)',
    rx: 200,
    ry: 80,
    speedCoeff: 1.0,
    startAngle: 0,
    stats: [
      { label: 'LATENCY', value: '120ms' },
      { label: 'CODEC', value: 'Opus 48kbps' },
      { label: 'MOS SCORE', value: '4.65' }
    ]
  },
  {
    id: 2,
    name: 'Autonomous Agent',
    role: 'Tool Use Specialist',
    desc: 'Autonomous loops executing sandboxed commands.',
    color: 'var(--c-planet-2)',
    rx: 290,
    ry: 116,
    speedCoeff: 0.7,
    startAngle: Math.PI / 2,
    stats: [
      { label: 'SUCCESS RATE', value: '94.2%' },
      { label: 'STEPS / TASK', value: '12 steps' },
      { label: 'RUNS', value: '48k / day' }
    ]
  },
  {
    id: 3,
    name: 'Multi-Agent System',
    role: 'Collaborative Ecosystem',
    desc: 'Distributed queue broker orchestrating team consensus.',
    color: 'var(--c-planet-3)',
    rx: 380,
    ry: 152,
    speedCoeff: 0.45,
    startAngle: Math.PI,
    stats: [
      { label: 'AGENT NODES', value: '3 Active' },
      { label: 'CONSENSUS', value: '98.5%' },
      { label: 'ITERATIONS', value: '4.2 cycles' }
    ]
  },
  {
    id: 4,
    name: 'Agentic RAG & Memory',
    role: 'Knowledge Hub',
    desc: 'Cosine vector retrieval & episodic graph memories.',
    color: 'var(--c-planet-4)',
    rx: 460,
    ry: 184,
    speedCoeff: 0.3,
    startAngle: (3 * Math.PI) / 2,
    stats: [
      { label: 'VECTORS', value: '1.2M docs' },
      { label: 'SEARCH LATENCY', value: '14ms' },
      { label: 'CACHE HIT', value: '88%' }
    ]
  }
];

export default function SolarSystem({ speed, onPlanetClick }: SolarSystemProps) {
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<number | null>(null);
  const angleRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      // Increment base angle according to user-selected speed
      // If a planet is hovered, slow down the system to 15% speed for easier inspection
      const speedModifier = hoveredPlanetId !== null ? 0.15 : 1.0;
      angleRef.current += 0.006 * speed * speedModifier;

      PLANETS_CONFIG.forEach((planet, index) => {
        const el = planetRefs.current[index];
        if (!el) return;

        // Calculate specific planet orbital angle
        const planetAngle = angleRef.current * planet.speedCoeff + planet.startAngle;

        // Coordinate positioning on the 2D ellipse (matches the tilted 3D space projection)
        const x = planet.rx * Math.cos(planetAngle);
        const y = planet.ry * Math.sin(planetAngle);

        // Z-Depth Factor based on sin (ranges from -1 to 1)
        const depth = Math.sin(planetAngle);

        // Mapping depth to visual style parameters
        const scale = 0.85 + (depth + 1) * 0.15; // 0.85 to 1.15
        const opacity = 0.6 + (depth + 1) * 0.2; // 0.6 to 1.0
        const zIndex = Math.round(20 + depth * 10); // 10 to 30

        // Soft blur to simulate atmospheric depth in background (when depth is negative)
        const blurAmount = depth < 0 ? Math.abs(depth) * 1.5 : 0;

        // Apply styles directly to the DOM for max performance (avoiding React trigger renders)
        el.style.transform = `translate3d(${x}px, ${y}px, 0px) translate(-50%, -50%) rotateX(-60deg)`;
        el.style.zIndex = `${zIndex}`;
        el.style.opacity = `${opacity}`;
        el.style.filter = `blur(${blurAmount}px)`;
        el.style.scale = `${scale}`;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [speed, hoveredPlanetId]);

  return (
    <div className="solar-stage">
      <div className="viewport-3d">
        {/* Orbits Plane */}
        <div className="orbit-plane-3d">
          {/* Central Core Orchestrator */}
          <div className="core-node">
            <div className="core-label">
              ORCHESTRATOR
              <br />
              <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>CORE</span>
            </div>
          </div>

          {/* SVG Orbit Lines */}
          <svg className="orbit-path-svg">
            {PLANETS_CONFIG.map((planet) => (
              <ellipse
                key={planet.id}
                cx="50%"
                cy="50%"
                rx={planet.rx}
                ry={planet.ry}
                className={`orbit-ellipse ${hoveredPlanetId === planet.id ? 'active' : ''}`}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
            ))}
          </svg>

          {/* Planet Cards/Spheres */}
          {PLANETS_CONFIG.map((planet, index) => (
            <div
              key={planet.id}
              ref={(el) => {
                planetRefs.current[index] = el;
              }}
              className="planet-wrapper"
              onMouseEnter={() => setHoveredPlanetId(planet.id)}
              onMouseLeave={() => setHoveredPlanetId(null)}
              onClick={() => onPlanetClick(planet.id)}
            >
              <div className="planet-element">
                {/* Planet-specific visual items */}
                <div className={`planet-sphere planet-${planet.id === 1 ? 'voice' : planet.id === 2 ? 'auto' : planet.id === 3 ? 'multi' : 'rag'}`}>
                  {/* Planet 1 wave pulses */}
                  {planet.id === 1 && <div className="planet-voice-waves" />}

                  {/* Planet 2 tool satellites */}
                  {planet.id === 2 && (
                    <div className="satellite-ring">
                      {/* Search Tool Node */}
                      <div className="satellite-node" style={{ top: '0', left: '50%', transform: 'translate(-50%, -50%)' }} title="Search Tool">
                        <Search />
                      </div>
                      {/* Code Executor Node */}
                      <div className="satellite-node" style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }} title="Code Sandbox">
                        <Code2 />
                      </div>
                      {/* Email Node */}
                      <div className="satellite-node" style={{ top: '100%', left: '50%', transform: 'translate(-50%, -50%)' }} title="Mail Dispatch">
                        <Mail />
                      </div>
                      {/* Terminal Executor Node */}
                      <div className="satellite-node" style={{ top: '50%', left: '0', transform: 'translate(-50%, -50%)' }} title="Terminal Sandbox">
                        <Terminal />
                      </div>
                    </div>
                  )}

                  {/* Planet 3 micro agent bubbles */}
                  {planet.id === 3 && (
                    <>
                      <div className="sub-bubble sub-bubble-1" title="Researcher Agent" />
                      <div className="sub-bubble sub-bubble-2" title="Writer Agent" />
                      <div className="sub-bubble sub-bubble-3" title="Critic Agent" />
                    </>
                  )}

                  {/* Planet 4 network dot nodes */}
                  {planet.id === 4 && <div className="rag-network" />}
                </div>

                {/* Subtitle label under the planet */}
                <div className="planet-title-label">{planet.name}</div>

                {/* Cybernetic HUD Hover card */}
                <div 
                  className="planet-hud-card glass-panel"
                  style={{ 
                    borderLeftColor: planet.color,
                    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.8), 0 0 15px ${planet.color}15`
                  }}
                >
                  <div className="planet-hud-title" style={{ color: planet.color }}>
                    {planet.name}
                  </div>
                  <div className="planet-hud-desc">{planet.desc}</div>
                  <div className="planet-hud-divider"></div>
                  <div className="planet-hud-stats">
                    {planet.stats.map((stat, sIndex) => (
                      <div key={sIndex} className="planet-stat-row">
                        <span style={{ color: 'var(--text-muted)' }}>{stat.label}:</span>
                        <span className="planet-stat-val" style={{ color: planet.color }}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.55rem', color: planet.color, marginTop: '0.4rem', fontFamily: 'var(--font-mono)', textAlign: 'right', letterSpacing: '0.05em' }}>
                    &gt; CLICK TO DEPLOY &lt;
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
