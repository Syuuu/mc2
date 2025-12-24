import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, OrnamentData, PALETTE } from '../types';
import { TREE_HEIGHT, TREE_RADIUS, CHAOS_RADIUS, ORNAMENT_COUNT } from '../constants';

interface OrnamentsProps {
  state: TreeState;
}

const tempObject = new THREE.Object3D();
const tempPos = new THREE.Vector3();

// Helper to generate ornament data
const generateOrnamentData = (count: number): OrnamentData[] => {
  const data: OrnamentData[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let type: 'box' | 'sphere' | 'light' = 'sphere';
    let speed = 1.0;
    let color = PALETTE.GOLD;
    let scale = 1.0;

    // Distribution: 20% Boxes (Heavy), 40% Spheres (Medium), 40% Lights (Light/Fast)
    if (r < 0.2) {
      type = 'box';
      speed = 0.5 + Math.random() * 0.3; // Slower
      color = Math.random() > 0.5 ? PALETTE.RICH_RED : PALETTE.GOLD;
      scale = 0.4 + Math.random() * 0.3;
    } else if (r < 0.6) {
      type = 'sphere';
      speed = 1.0 + Math.random() * 0.5; // Medium
      color = Math.random() > 0.7 ? PALETTE.CHAMPAGNE : PALETTE.GOLD;
      scale = 0.3 + Math.random() * 0.2;
    } else {
      type = 'light';
      speed = 2.0 + Math.random() * 1.0; // Fast
      color = PALETTE.WHITE_GLOW;
      scale = 0.15;
    }

    // Target Position (Surface of Cone + minor jitter)
    const h = Math.random();
    const coneR = (1 - h) * TREE_RADIUS * 0.9; // Slightly inside foliage or on surface
    const angle = Math.random() * Math.PI * 2;
    
    // Spiral distribution for aesthetic look
    const spiralAngle = h * Math.PI * 10 + angle; 
    
    const tx = Math.cos(spiralAngle) * coneR;
    const ty = (h * TREE_HEIGHT) - (TREE_HEIGHT / 2);
    const tz = Math.sin(spiralAngle) * coneR;

    // Chaos Position
    const chaosR = Math.random() * CHAOS_RADIUS;
    const cx = (Math.random() - 0.5) * 2 * chaosR;
    const cy = (Math.random() - 0.5) * 2 * chaosR;
    const cz = (Math.random() - 0.5) * 2 * chaosR;

    data.push({
      id: i,
      type,
      color,
      scale,
      speed,
      rotationSpeed: Math.random() * 2,
      initialRotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
      positionData: {
        target: new THREE.Vector3(tx, ty, tz),
        chaos: new THREE.Vector3(cx, cy, cz)
      }
    });
  }
  return data;
};

const Ornaments: React.FC<OrnamentsProps> = ({ state }) => {
  const meshSphereRef = useRef<THREE.InstancedMesh>(null);
  const meshBoxRef = useRef<THREE.InstancedMesh>(null);
  const meshLightRef = useRef<THREE.InstancedMesh>(null);

  // Store current animated progress for each instance individually to simulate weight
  const progressRefs = useRef<Float32Array>(new Float32Array(ORNAMENT_COUNT).fill(0));

  const data = useMemo(() => generateOrnamentData(ORNAMENT_COUNT), []);

  const { sphereData, boxData, lightData } = useMemo(() => {
    return {
      sphereData: data.filter(d => d.type === 'sphere'),
      boxData: data.filter(d => d.type === 'box'),
      lightData: data.filter(d => d.type === 'light'),
    };
  }, [data]);

  // Initial color setup
  useLayoutEffect(() => {
    const setupColor = (mesh: THREE.InstancedMesh | null, specificData: OrnamentData[]) => {
      if (!mesh) return;
      specificData.forEach((d, i) => {
        mesh.setColorAt(i, d.color);
      });
      mesh.instanceColor!.needsUpdate = true;
    };

    setupColor(meshSphereRef.current, sphereData);
    setupColor(meshBoxRef.current, boxData);
    setupColor(meshLightRef.current, lightData);
  }, [sphereData, boxData, lightData]);

  useFrame((stateThree, delta) => {
    const globalTarget = state === TreeState.FORMED ? 1 : 0;
    const time = stateThree.clock.elapsedTime;

    const updateMesh = (mesh: THREE.InstancedMesh | null, specificData: OrnamentData[]) => {
      if (!mesh) return;

      specificData.forEach((d, i) => {
        // Find the global index in the progress array (simple mapping logic not needed since we iterate types separately, 
        // but we need persistent state. Let's use specificData's original ID)
        
        const pid = d.id;
        let currentP = progressRefs.current[pid];

        // Animate towards globalTarget based on speed (weight)
        // Physics Logic: Heavy items (low speed) accelerate slower
        const diff = globalTarget - currentP;
        
        // Non-linear approach
        const move = diff * delta * d.speed; 
        currentP += move;
        
        // Clamp
        if (globalTarget === 1 && currentP > 1) currentP = 1;
        if (globalTarget === 0 && currentP < 0) currentP = 0;
        
        progressRefs.current[pid] = currentP;

        // Apply Position Interpolation
        tempPos.lerpVectors(d.positionData.chaos, d.positionData.target, currentP);

        // Add floaty animation when in chaos
        if (currentP < 0.9) {
            tempPos.y += Math.sin(time * d.speed + pid) * 0.02;
            tempPos.x += Math.cos(time * 0.5 + pid) * 0.02;
        }

        tempObject.position.copy(tempPos);

        // Rotation
        tempObject.rotation.copy(d.initialRotation);
        // Spin when floating, stabilize when formed
        tempObject.rotation.x += time * d.rotationSpeed * 0.1 * (1 - currentP);
        tempObject.rotation.y += time * d.rotationSpeed * 0.1 * (1 - currentP);

        // Scale popping effect on arrival
        // const pop = 1.0 + Math.sin(currentP * Math.PI) * 0.2; 
        tempObject.scale.setScalar(d.scale);

        tempObject.updateMatrix();
        mesh.setMatrixAt(i, tempObject.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };

    updateMesh(meshSphereRef.current, sphereData);
    updateMesh(meshBoxRef.current, boxData);
    updateMesh(meshLightRef.current, lightData);
  });

  return (
    <group>
      {/* Spheres */}
      <instancedMesh
        ref={meshSphereRef}
        args={[undefined, undefined, sphereData.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.1} 
            metalness={0.9} 
            envMapIntensity={1.5}
        />
      </instancedMesh>

      {/* Boxes (Gifts) */}
      <instancedMesh
        ref={meshBoxRef}
        args={[undefined, undefined, boxData.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.6}
            envMapIntensity={1}
        />
      </instancedMesh>

      {/* Lights (Glowing small spheres) */}
      <instancedMesh
        ref={meshLightRef}
        args={[undefined, undefined, lightData.length]}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;
