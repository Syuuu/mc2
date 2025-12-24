import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { TREE_HEIGHT, TREE_RADIUS, CHAOS_RADIUS, PARTICLE_COUNT } from '../constants';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 aChaosPosition;
  attribute vec3 aTargetPosition;
  attribute float aSize;
  attribute float aRandom;
  
  varying vec3 vColor;
  varying float vAlpha;

  // Rich Gold color
  const vec3 colorGold = vec3(1.0, 0.75, 0.1);
  // Deep Emerald Green (Darker, more realistic pine)
  const vec3 colorGreen = vec3(0.0, 0.18, 0.08);
  // Lighter Green for volume variation
  const vec3 colorGreenLight = vec3(0.02, 0.25, 0.12);

  void main() {
    // Cubic ease in-out approximation
    float t = uProgress;
    float smoothT = t * t * (3.0 - 2.0 * t);

    // Interpolate position
    vec3 newPos = mix(aChaosPosition, aTargetPosition, smoothT);

    // Add "breathing" and wind effect
    float wind = sin(uTime * 1.5 + newPos.y * 0.5 + aRandom * 10.0) * 0.08 * smoothT;
    newPos.x += wind;
    newPos.z += wind;

    // Chaos wobble
    float chaosWobble = sin(uTime * 0.5 + aRandom * 100.0) * 0.5 * (1.0 - smoothT);
    newPos += chaosWobble;

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = aSize * (40.0 / -mvPosition.z);

    // Color Logic:
    // Most particles are green (tree body). 
    // Small percentage (top 5%) are gold tips.
    // Some variation in the green particles.
    
    vec3 baseGreen = mix(colorGreen, colorGreenLight, aRandom * 0.5);
    float isGold = step(0.95, aRandom); // Only top 5% are gold
    
    vColor = mix(baseGreen, colorGold, isGold);
    
    // Sparkle intensity
    float sparkle = 0.8 + 0.3 * sin(uTime * 3.0 + aRandom * 50.0);
    if (isGold > 0.5) sparkle *= 1.5; // Gold sparkles more
    
    vColor *= sparkle;
    
    vAlpha = 1.0;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle with soft edge
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Soft edge
    float alpha = smoothstep(0.5, 0.2, dist);

    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;

interface FoliageProps {
  state: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ state }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const targetProgress = useRef(0);

  const { positions, chaosPositions, randoms, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const chaos = new Float32Array(PARTICLE_COUNT * 3);
    const rnd = new Float32Array(PARTICLE_COUNT);
    const sz = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 1. Target Position (Cone)
      const h = Math.random(); 
      // Power function to push more particles to the bottom for weight
      const hBiased = Math.pow(h, 0.8); 
      
      const rBase = (1 - hBiased) * TREE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      
      // Volume distribution (mostly surface but some depth)
      const rRandom = Math.sqrt(Math.random()) * rBase; 
      
      const x = Math.cos(angle) * rRandom;
      const y = (hBiased * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      const z = Math.sin(angle) * rRandom;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // 2. Chaos Position (Sphere)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const chaosR = Math.cbrt(Math.random()) * CHAOS_RADIUS; 

      chaos[i * 3] = chaosR * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = chaosR * Math.sin(phi) * Math.sin(theta);
      chaos[i * 3 + 2] = chaosR * Math.cos(phi);

      // 3. Attributes
      rnd[i] = Math.random();
      // Vary sizes for texture
      sz[i] = Math.random() * 4.0 + 1.5; 
    }

    return {
      positions: pos,
      chaosPositions: chaos,
      randoms: rnd,
      sizes: sz
    };
  }, []);

  useFrame((stateThree, delta) => {
    if (!shaderRef.current) return;

    shaderRef.current.uniforms.uTime.value = stateThree.clock.elapsedTime;

    const targetVal = state === TreeState.FORMED ? 1.0 : 0.0;
    
    // Lerp logic
    const step = delta * 0.8; 
    if (targetProgress.current < targetVal) {
      targetProgress.current = Math.min(targetProgress.current + step, targetVal);
    } else if (targetProgress.current > targetVal) {
      targetProgress.current = Math.max(targetProgress.current - step, targetVal);
    }

    shaderRef.current.uniforms.uProgress.value = targetProgress.current;
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
  }), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPosition"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPosition"
          count={chaosPositions.length / 3}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.NormalBlending} // Changed to Normal for more solid tree look, Additive is too ghost-like
      />
    </points>
  );
};

export default Foliage;