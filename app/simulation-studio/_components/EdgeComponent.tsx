'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { ProcessEdge } from '../_store/editorStore';

interface Props {
  edge: ProcessEdge;
  fromPosition: [number, number, number];
  toPosition: [number, number, number];
  onClick?: (event: any) => void;
  isSelected?: boolean;
}

export default function EdgeComponent({ 
  edge, 
  fromPosition, 
  toPosition, 
  onClick, 
  isSelected 
}: Props) {
  const lineRef = useRef<THREE.Group>(null);
  
  // Pulsing animation for selected edges
  useFrame(({ clock }) => {
    if (isSelected && lineRef.current) {
      const intensity = 0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.3;
      // Could animate line opacity or add glow effect here
    }
  });

  // Calculate arrow position (midpoint of line)
  const midPoint: [number, number, number] = [
    (fromPosition[0] + toPosition[0]) / 2,
    (fromPosition[1] + toPosition[1]) / 2 + 0.5, // Slightly elevated
    (fromPosition[2] + toPosition[2]) / 2,
  ];

  // Calculate arrow rotation to point along line direction
  const direction = new THREE.Vector3(
    toPosition[0] - fromPosition[0],
    toPosition[1] - fromPosition[1],
    toPosition[2] - fromPosition[2]
  ).normalize();

  const arrowRotation: [number, number, number] = [
    0,
    Math.atan2(direction.x, direction.z),
    0
  ];

  // Elevated line points for visibility
  const elevatedFrom: [number, number, number] = [
    fromPosition[0], 
    fromPosition[1] + 0.5, 
    fromPosition[2]
  ];
  const elevatedTo: [number, number, number] = [
    toPosition[0], 
    toPosition[1] + 0.5, 
    toPosition[2]
  ];

  return (
    <group ref={lineRef}>
      {/* Connection Line */}
      <Line
        points={[elevatedFrom, elevatedTo]}
        color={isSelected ? '#06b6d4' : '#10b981'}
        lineWidth={isSelected ? 4 : 2}
        onClick={onClick}
      />
      
      {/* Arrow indicator at midpoint */}
      <mesh 
        position={midPoint} 
        rotation={arrowRotation}
        onClick={onClick}
        scale={isSelected ? [1.2, 1.2, 1.2] : [1, 1, 1]}
      >
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial 
          color={isSelected ? '#06b6d4' : '#10b981'}
          emissive={isSelected ? '#06b6d4' : '#10b981'}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Flow animation particles */}
      <FlowParticles 
        from={elevatedFrom} 
        to={elevatedTo} 
        color={isSelected ? '#06b6d4' : '#10b981'}
      />
    </group>
  );
}

// Component for animated flow particles along edges
function FlowParticles({ 
  from, 
  to, 
  color 
}: { 
  from: [number, number, number]; 
  to: [number, number, number]; 
  color: string; 
}) {
  const particleCount = 3;
  
  return (
    <>
      {Array.from({ length: particleCount }, (_, i) => (
        <FlowParticle 
          key={i}
          from={from}
          to={to}
          delay={i * 0.5}
          color={color}
        />
      ))}
    </>
  );
}

function FlowParticle({
  from,
  to,
  delay,
  color
}: {
  from: [number, number, number];
  to: [number, number, number];
  delay: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() + delay;
      const progress = (Math.sin(time * 0.5) + 1) / 2; // 0 to 1, cycling
      
      // Linear interpolation along the path
      meshRef.current.position.set(
        from[0] * (1 - progress) + to[0] * progress,
        from[1] * (1 - progress) + to[1] * progress,
        from[2] * (1 - progress) + to[2] * progress
      );
      
      // Fade in/out based on position
      const opacity = Math.sin(progress * Math.PI) * 0.8;
      if (meshRef.current.material && 'opacity' in meshRef.current.material) {
        (meshRef.current.material as THREE.MeshStandardMaterial).opacity = opacity;
      }
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.03]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}