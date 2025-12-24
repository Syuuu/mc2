import * as THREE from 'three';

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface DualPosition {
  chaos: THREE.Vector3;
  target: THREE.Vector3;
}

export interface OrnamentData {
  id: number;
  type: 'box' | 'sphere' | 'light';
  color: THREE.Color;
  positionData: DualPosition;
  scale: number;
  speed: number; // For physics weight simulation
  rotationSpeed: number;
  initialRotation: THREE.Euler;
}

export const PALETTE = {
  EMERALD: new THREE.Color('#004225'),
  DEEP_GREEN: new THREE.Color('#013220'),
  GOLD: new THREE.Color('#FFD700'),
  CHAMPAGNE: new THREE.Color('#F7E7CE'),
  RICH_RED: new THREE.Color('#800020'),
  WHITE_GLOW: new THREE.Color('#FFFFFF'),
};
