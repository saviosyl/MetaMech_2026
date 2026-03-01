'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  type: 'input' | 'output';
  nodeType: string;
  onConnect?: () => void;
}

export default function ConnectionHelper({ position, type, nodeType, onConnect }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Pulsing animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 0.8 + Math.sin(clock.getElapsedTime() * 4) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      // Rotate the connection point
      meshRef.current.rotation.z = clock.getElapsedTime() * 2;
    }
  });

  const color = type === 'input' ? '#ef4444' : '#10b981'; // Red for input, Green for output
  const elevatedPosition: [number, number, number] = [
    position[0],
    position[1] + 1.5,
    position[2]
  ];

  return (
    <group position={elevatedPosition}>
      {/* Connection indicator */}
      <mesh 
        ref={meshRef}
        onClick={onConnect}
      >
        <ringGeometry args={[0.15, 0.25, 8]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Center dot */}
      <mesh onClick={onConnect}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Label */}
      <Html
        position={[0, 0.5, 0]}
        center
        className="pointer-events-none"
      >
        <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {type === 'input' ? '⬇ Input' : '⬆ Output'}
        </div>
      </Html>
    </group>
  );
}