import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const snowVertexShader = `
  uniform float uTime;
  uniform float uHeight;
  
  attribute float aSpeed;
  attribute float aRandom;
  attribute float aSize;
  
  void main() {
    vec3 pos = position;
    
    // Falling animation
    // The mod allows particles to wrap around from bottom to top
    float fallSpeed = aSpeed * 2.0;
    float yOffset = mod(pos.y - uTime * fallSpeed, uHeight);
    
    // Center the wrapping around the origin
    pos.y = yOffset - (uHeight / 2.0);
    
    // Gentle lateral drift based on time and random seed
    float drift = sin(uTime * 0.5 + aRandom * 10.0) * 0.5;
    pos.x += drift;
    pos.z += cos(uTime * 0.3 + aRandom * 5.0) * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation (particles get smaller when further away)
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
  }
`;

const snowFragmentShader = `
  void main() {
    // Soft circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Soft blur edge
    float alpha = smoothstep(0.5, 0.0, dist);
    
    // Pure white snow
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.8);
  }
`;

const Snow: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const count = 1500;
  const range = 40;
  const height = 40;

  const { positions, speeds, randoms, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const rnd = new Float32Array(count);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range;
      pos[i * 3 + 1] = (Math.random() - 0.5) * height; // Initial random Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * range;

      spd[i] = 1.0 + Math.random(); // Random fall speed
      rnd[i] = Math.random();
      sz[i] = 0.5 + Math.random() * 1.5; // Random snowflake size
    }

    return { positions: pos, speeds: spd, randoms: rnd, sizes: sz };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHeight: { value: height }
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
          attach="attributes-aSpeed"
          count={speeds.length}
          array={speeds}
          itemSize={1}
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
        ref={materialRef}
        vertexShader={snowVertexShader}
        fragmentShader={snowFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Snow;
