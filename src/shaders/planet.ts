export const planetVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function getPlanetFragmentShader(baseColor: string, glowColor: string) {
  return `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);

      vec3 base = vec3(${baseColor});
      vec3 glow = vec3(${glowColor});

      vec3 lightDir = normalize(vec3(1.0, 0.8, 0.3));
      float diff = max(dot(vNormal, lightDir), 0.0);

      vec3 atmosphere = glow * fresnel * 0.4;

      float lit = smoothstep(-0.1, 0.4, diff);
      vec3 color = mix(base * 0.2, base * 0.85 + glow * 0.2, lit) + atmosphere;

      gl_FragColor = vec4(color, 1.0);
    }
  `;
}

export function getPlanetGlowFragmentShader(glowColor: string) {
  return `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);
      vec3 color = vec3(${glowColor}) * fresnel * 0.3;
      gl_FragColor = vec4(color, fresnel * 0.25);
    }
  `;
}
