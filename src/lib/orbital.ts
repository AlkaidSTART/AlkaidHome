import * as THREE from "three";

export interface OrbitParams {
  a: number;
  e: number;
  i: number;
  omega: number;
  M0: number;
  period: number;
}

export function solveKepler(M: number, e: number, maxIter = 10): number {
  let E = M;
  for (let i = 0; i < maxIter; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }
  return E;
}

export function getOrbitalPosition(
  orbit: OrbitParams,
  M: number,
): { x: number; y: number; z: number; speed: number } {
  const E = solveKepler(M, orbit.e);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const sqrt1me2 = Math.sqrt(1 - orbit.e * orbit.e);

  const xOrbital = orbit.a * (cosE - orbit.e);
  const zOrbital = orbit.a * sqrt1me2 * sinE;
  const speed = Math.sqrt((1 + orbit.e * Math.cos(E)) / (1 - orbit.e * cosE));

  const cosO = Math.cos(orbit.omega);
  const sinO = Math.sin(orbit.omega);
  const xRot = xOrbital * cosO - zOrbital * sinO;
  const zRot = xOrbital * sinO + zOrbital * cosO;

  const cosI = Math.cos(orbit.i);
  const sinI = Math.sin(orbit.i);
  const y = xRot * sinI;
  const x = xRot * cosI;
  const z = zRot;

  return { x, y, z, speed };
}

export function generateOrbitGeometry(orbit: OrbitParams): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  const segments = 256;

  for (let i = 0; i <= segments; i++) {
    const M = (i / segments) * Math.PI * 2;
    const pos = getOrbitalPosition(orbit, M);
    points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
}
