import { useState, useEffect } from 'react';
import { Orbit } from 'lucide-react';
import Starfield from './components/Starfield';
import SolarSystem from './components/SolarSystem';
import ConsolePanel from './components/ConsolePanel';
import ProjectDetails from './components/ProjectDetails';

export default function App() {
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1.0);
  const [activePlanetId, setActivePlanetId] = useState<number | null>(null);
  const [activePlanetName, setActivePlanetName] = useState<string | null>(null);
  const [time, setTime] = useState<string>('');

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleDateString() + ' ' + now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update current active planet name for console telemetries
  useEffect(() => {
    if (activePlanetId === 1) setActivePlanetName('VoiceCanvas');
    else if (activePlanetId === 2) setActivePlanetName('Autonomous Task Agent');
    else if (activePlanetId === 3) setActivePlanetName('Multi-Agent System');
    else if (activePlanetId === 4) setActivePlanetName('Agentic RAG & Memory Hub');
    else setActivePlanetName(null);
  }, [activePlanetId]);

  return (
    <>
      {/* 1. Stardust Twinkling Stars Background */}
      <Starfield />

      {/* 2. Cyber HUD Grid and Scanlines Overlay */}
      <div className="hud-grid"></div>
      <div className="hud-scanline"></div>

      {/* 3. Header Bar */}
      <header className="header-bar">
        <div className="brand">
          <Orbit size={20} className="spin" style={{ color: 'var(--c-planet-1)' }} />
          <span>COSMIC AGENTIC CANVAS</span>
          <div className="brand-dot"></div>
        </div>
        <div className="system-clock">
          SYS_TIME: {time}
        </div>
      </header>

      {/* 4. Central 3D Solar System Space Stage */}
      <main style={{ flexGrow: 1, display: 'flex', width: '100%' }}>
        <SolarSystem 
          speed={orbitSpeed} 
          onPlanetClick={(id) => setActivePlanetId(id)} 
        />
      </main>

      {/* 5. Details Fullscreen HUD Overlay */}
      <ProjectDetails 
        planetId={activePlanetId} 
        onClose={() => setActivePlanetId(null)} 
      />

      {/* 6. Bottom Console Status and Control Panel */}
      <ConsolePanel 
        speed={orbitSpeed} 
        setSpeed={setOrbitSpeed}
        activePlanetName={activePlanetName}
      />
    </>
  );
}
