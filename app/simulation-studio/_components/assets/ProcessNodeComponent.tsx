'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProcessNode } from '../../_store/editorStore';

interface Props {
  node: ProcessNode;
  onClick: (event: any) => void;
  isSelected: boolean;
}

export default function ProcessNodeComponent({ node, onClick, isSelected }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Animation for selected objects and working machines
  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (isSelected) {
        // Pulsing animation for selected objects
        const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.05;
        groupRef.current.scale.setScalar(scale);
      } else {
        groupRef.current.scale.setScalar(1);
        
        // Special animations for different node types
        if (node.type === 'conveyor') {
          // Subtle conveyor belt movement animation
          const beltMesh = groupRef.current.getObjectByName('belt');
          if (beltMesh) {
            beltMesh.rotation.x = clock.getElapsedTime() * 2; // Rotating belt effect
          }
        } else if (node.type === 'machine') {
          // Gentle vibration for active machines
          groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 8) * 0.02;
        }
      }
    }
  });

  // Colors for different process types
  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      source: '#10b981', // Green
      sink: '#ef4444',   // Red
      conveyor: '#6b7280', // Gray
      buffer: '#f59e0b',   // Amber
      machine: '#8b5cf6',  // Purple
      router: '#06b6d4',   // Cyan
      'transfer-bridge': '#84cc16', // Lime
      'popup-transfer': '#f97316',  // Orange
      'pusher-transfer': '#ec4899', // Pink
      'spiral-conveyor': '#14b8a6', // Teal
      'vertical-lifter': '#3b82f6', // Blue
      'pick-and-place': '#a855f7',  // Purple
      palletizer: '#059669',        // Emerald
    };
    return colors[type] || '#6b7280';
  };

  const renderGeometry = () => {
    const color = getColor(node.type);
    const params = node.parameters || {};

    switch (node.type) {
      case 'source':
        return (
          <group>
            {/* Hopper shape */}
            <mesh position={[0, 0.5, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Tapered top */}
            <mesh position={[0, 1.2, 0]} castShadow onClick={onClick}>
              <coneGeometry args={[0.7, 0.4, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Emission light */}
            <pointLight position={[0, 1.5, 0]} color={color} intensity={0.3} />
          </group>
        );

      case 'sink':
        return (
          <group>
            {/* Bin shape */}
            <mesh position={[0, 0.3, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Indicator light */}
            <mesh position={[0, 0.8, 0]} onClick={onClick}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
            </mesh>
          </group>
        );

      case 'conveyor':
        const length = params.length || 5;
        const width = params.width || 1;
        return (
          <group>
            {/* Frame */}
            <mesh position={[0, 0.1, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[length, 0.2, width]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            {/* Belt */}
            <mesh name="belt" position={[0, 0.21, 0]} onClick={onClick}>
              <boxGeometry args={[length - 0.1, 0.02, width - 0.1]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            {/* Side rails */}
            <mesh position={[0, 0.4, width/2 + 0.05]} castShadow onClick={onClick}>
              <boxGeometry args={[length, 0.1, 0.1]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh position={[0, 0.4, -width/2 - 0.05]} castShadow onClick={onClick}>
              <boxGeometry args={[length, 0.1, 0.1]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
          </group>
        );

      case 'buffer':
        return (
          <group>
            {/* Table */}
            <mesh position={[0, 0.4, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[2, 0.1, 1.5]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Legs */}
            {[-0.9, 0.9].map(x => 
              [-0.6, 0.6].map(z => (
                <mesh key={`${x}-${z}`} position={[x, 0.2, z]} castShadow onClick={onClick}>
                  <cylinderGeometry args={[0.05, 0.05, 0.4]} />
                  <meshStandardMaterial color="#4b5563" />
                </mesh>
              ))
            ).flat()}
            {/* Guide rails */}
            <mesh position={[0, 0.5, 0.7]} onClick={onClick}>
              <boxGeometry args={[2, 0.1, 0.1]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh position={[0, 0.5, -0.7]} onClick={onClick}>
              <boxGeometry args={[2, 0.1, 0.1]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
          </group>
        );

      case 'machine':
        return (
          <group>
            {/* Main body */}
            <mesh position={[0, 1, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[2, 2, 1.5]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Status light */}
            <mesh position={[0, 2.2, 0]} onClick={onClick}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
            </mesh>
            {/* Door */}
            <mesh position={[1.01, 1, 0]} onClick={onClick}>
              <boxGeometry args={[0.02, 1.5, 1]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
          </group>
        );

      case 'router':
        return (
          <group>
            {/* Y-shaped junction */}
            <mesh position={[0, 0.1, -1]} castShadow onClick={onClick}>
              <boxGeometry args={[1, 0.2, 2]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[-0.7, 0.1, 0.7]} rotation={[0, Math.PI/4, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[1, 0.2, 1.4]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.7, 0.1, 0.7]} rotation={[0, -Math.PI/4, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[1, 0.2, 1.4]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );

      case 'spiral-conveyor':
        const radius = params.radius || 2;
        const height = params.height || 5;
        return (
          <group>
            {/* Central pillar */}
            <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.2, 0.2, height]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            {/* Spiral path (approximated with segments) */}
            {Array.from({ length: 20 }, (_, i) => {
              const angle = (i / 20) * Math.PI * 4;
              const y = (i / 20) * height;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              return (
                <mesh key={i} position={[x, y, z]} rotation={[0, angle, 0]} onClick={onClick}>
                  <boxGeometry args={[0.5, 0.1, 0.3]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              );
            })}
          </group>
        );

      case 'vertical-lifter':
        const liftHeight = params.height || 3;
        return (
          <group>
            {/* Frame posts */}
            {[-1, 1].map(x => 
              [-1, 1].map(z => (
                <mesh key={`${x}-${z}`} position={[x, liftHeight/2, z]} castShadow onClick={onClick}>
                  <boxGeometry args={[0.1, liftHeight, 0.1]} />
                  <meshStandardMaterial color="#4b5563" />
                </mesh>
              ))
            ).flat()}
            {/* Platform */}
            <mesh position={[0, 0.5, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[1.8, 0.1, 1.8]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Guide rails */}
            <mesh position={[0, liftHeight/2, 1.1]} onClick={onClick}>
              <boxGeometry args={[0.1, liftHeight, 0.1]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh position={[0, liftHeight/2, -1.1]} onClick={onClick}>
              <boxGeometry args={[0.1, liftHeight, 0.1]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
          </group>
        );

      case 'pick-and-place':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.2, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.5, 0.5, 0.4]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            {/* Vertical arm */}
            <mesh position={[0, 1, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.1, 0.1, 1.6]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Horizontal arm */}
            <mesh position={[1, 1.8, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[2, 0.1, 0.1]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* End effector */}
            <mesh position={[2, 1.8, 0]} onClick={onClick}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
        );

      case 'palletizer':
        return (
          <group>
            {/* Gantry frame - vertical posts */}
            {[-2, 2].map(x => 
              [-1.5, 1.5].map(z => (
                <mesh key={`${x}-${z}`} position={[x, 2, z]} castShadow onClick={onClick}>
                  <boxGeometry args={[0.1, 4, 0.1]} />
                  <meshStandardMaterial color="#4b5563" />
                </mesh>
              ))
            ).flat()}
            {/* Top beams */}
            <mesh position={[0, 4, 1.5]} onClick={onClick}>
              <boxGeometry args={[4, 0.1, 0.1]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            <mesh position={[0, 4, -1.5]} onClick={onClick}>
              <boxGeometry args={[4, 0.1, 0.1]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            <mesh position={[2, 4, 0]} onClick={onClick}>
              <boxGeometry args={[0.1, 0.1, 3]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            <mesh position={[-2, 4, 0]} onClick={onClick}>
              <boxGeometry args={[0.1, 0.1, 3]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            {/* Moving head */}
            <mesh position={[0, 3.5, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[0.8, 0.3, 0.8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );

      default:
        // Default box for unknown types
        return (
          <mesh position={[0, 0.5, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={groupRef}
      position={node.position}
      rotation={node.rotation}
      scale={node.scale}
    >
      {renderGeometry()}
      
      {/* Selection outline */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
          <lineBasicMaterial color="#06b6d4" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}