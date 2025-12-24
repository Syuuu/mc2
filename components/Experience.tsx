import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Star from './Star';
import Snow from './Snow';

interface ExperienceProps {
  treeState: TreeState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation of the entire tree assembly for grandeur
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={40} 
        maxPolarAngle={Math.PI / 2 + 0.1} // Don't go below ground
        autoRotate={false}
      />

      {/* High-End Lighting */}
      <ambientLight intensity={0.2} color="#001a0f" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={200} 
        color="#ffeeb1" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={50} color="#ff0000" />
      
      {/* City environment for gold reflections */}
      <Environment preset="city" environmentIntensity={0.8} />

      {/* Falling Snow - placed outside the rotating group so it falls straight */}
      <Snow />

      <group ref={groupRef}>
        <Star state={treeState} />
        <Foliage state={treeState} />
        <Ornaments state={treeState} />
        
        {/* Extra Ambient Dust/Magic (Gold sparkles near tree) */}
        <Sparkles 
          count={300} 
          scale={20} 
          size={5} 
          speed={0.4} 
          opacity={0.5} 
          color="#FFD700"
        />
      </group>

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;