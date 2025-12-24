import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, PALETTE } from '../types';
import { TREE_HEIGHT, CHAOS_RADIUS } from '../constants';

interface StarProps {
  state: TreeState;
}

const Star: React.FC<StarProps> = ({ state }) => {
  const groupRef = useRef<THREE.Group>(null);
  const starMeshRef = useRef<THREE.Mesh>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Define Dual Positions for the Star
  const positions = useMemo(() => {
    // Target: Top of the tree
    const target = new THREE.Vector3(0, TREE_HEIGHT / 2 + 0.5, 0);

    // Chaos: Random point on sphere surface far away
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = CHAOS_RADIUS * 0.8;
    const chaos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    return { target, chaos };
  }, []);

  useFrame((stateThree, delta) => {
    if (!groupRef.current) return;

    const targetVal = state === TreeState.FORMED ? 1 : 0;
    
    // Physics simulation: The Star is heavy, moves majestically
    const speed = 0.8;
    let nextProgress = currentProgress;
    
    if (nextProgress < targetVal) {
        nextProgress = Math.min(nextProgress + delta * speed, targetVal);
    } else {
        nextProgress = Math.max(nextProgress - delta * speed, targetVal);
    }
    
    setCurrentProgress(nextProgress);

    // Position Interpolation
    const currentPos = new THREE.Vector3().lerpVectors(
        positions.chaos, 
        positions.target, 
        nextProgress
    );
    
    // Add a bit of floating motion when in chaos or transition
    if (nextProgress < 1.0) {
       currentPos.y += Math.sin(stateThree.clock.elapsedTime) * 0.5 * (1 - nextProgress);
       currentPos.x += Math.cos(stateThree.clock.elapsedTime) * 0.5 * (1 - nextProgress);
    }

    groupRef.current.position.copy(currentPos);
    
    // Rotation Animation
    if (starMeshRef.current) {
        // Spin fast in chaos, slow majestic spin when formed
        const spinSpeed = 2.0 * (1 - nextProgress) + 0.5 * nextProgress;
        starMeshRef.current.rotation.y += delta * spinSpeed;
        
        // Tilt slightly
        starMeshRef.current.rotation.z = Math.sin(stateThree.clock.elapsedTime * 0.5) * 0.1;
    }

    // Scale Animation (pop in)
    const scale = 1.0 + Math.sin(nextProgress * Math.PI) * 0.2;
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      <mesh ref={starMeshRef} castShadow>
        {/* Create a star shape using icosahedron for sparkle geometry */}
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
            color={PALETTE.GOLD} 
            emissive={PALETTE.GOLD}
            emissiveIntensity={2.0}
            roughness={0.2}
            metalness={1.0}
        />
      </mesh>
      
      {/* Glow Halo */}
      <mesh>
         <sphereGeometry args={[1.2, 16, 16]} />
         <meshBasicMaterial color={PALETTE.GOLD} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      
      {/* Light Source */}
      <pointLight color="#FFD700" intensity={50} distance={10} decay={2} />
    </group>
  );
};

export default Star;