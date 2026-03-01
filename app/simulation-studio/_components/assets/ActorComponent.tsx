'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Actor } from '../../_store/editorStore';

interface Props {
  actor: Actor;
  onClick: (event: any) => void;
  isSelected: boolean;
}

export default function ActorComponent({ actor, onClick, isSelected }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Pulsing animation for selected objects
  useFrame(({ clock }) => {
    if (isSelected && groupRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.05;
      groupRef.current.scale.setScalar(scale);
    } else if (groupRef.current && !isSelected) {
      groupRef.current.scale.setScalar(1);
    }
  });

  const renderGeometry = () => {
    const params = actor.parameters || {};

    switch (actor.type) {
      case 'operator':
        const operatorColor = params.color || '#4f46e5';
        return (
          <group>
            {/* Body */}
            <mesh position={[0, 0.9, 0]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.25, 1]} />
              <meshStandardMaterial color={operatorColor} />
            </mesh>
            
            {/* Head */}
            <mesh position={[0, 1.7, 0]} castShadow onClick={onClick}>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial color="#fdbcbc" />
            </mesh>
            
            {/* Arms */}
            <mesh position={[-0.35, 1.2, 0]} rotation={[0, 0, -0.3]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.08, 0.6]} />
              <meshStandardMaterial color="#fdbcbc" />
            </mesh>
            <mesh position={[0.35, 1.2, 0]} rotation={[0, 0, 0.3]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.08, 0.6]} />
              <meshStandardMaterial color="#fdbcbc" />
            </mesh>
            
            {/* Legs */}
            <mesh position={[-0.15, 0.4, 0]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.1, 0.8]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            <mesh position={[0.15, 0.4, 0]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.1, 0.8]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            
            {/* Hard hat */}
            <mesh position={[0, 1.8, 0]} onClick={onClick}>
              <sphereGeometry args={[0.18]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
            
            {/* Safety vest highlights */}
            <mesh position={[0, 1.1, 0.26]} onClick={onClick}>
              <boxGeometry args={[0.4, 0.1, 0.02]} />
              <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0, 0.9, 0.26]} onClick={onClick}>
              <boxGeometry args={[0.4, 0.1, 0.02]} />
              <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.2} />
            </mesh>
          </group>
        );

      case 'engineer':
        const engineerColor = params.color || '#059669';
        return (
          <group>
            {/* Body */}
            <mesh position={[0, 0.9, 0]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.25, 1]} />
              <meshStandardMaterial color={engineerColor} />
            </mesh>
            
            {/* Head */}
            <mesh position={[0, 1.7, 0]} castShadow onClick={onClick}>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial color="#fdbcbc" />
            </mesh>
            
            {/* Arms */}
            <mesh position={[-0.35, 1.2, 0]} rotation={[0, 0, -0.3]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.08, 0.6]} />
              <meshStandardMaterial color="#fdbcbc" />
            </mesh>
            <mesh position={[0.35, 1.2, 0]} rotation={[0, 0, 0.3]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.08, 0.6]} />
              <meshStandardMaterial color="#fdbcbc" />
            </mesh>
            
            {/* Legs */}
            <mesh position={[-0.15, 0.4, 0]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.1, 0.8]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            <mesh position={[0.15, 0.4, 0]} castShadow onClick={onClick}>
              <capsuleGeometry args={[0.1, 0.8]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            
            {/* Tablet/clipboard */}
            <mesh position={[0.4, 1.1, 0.1]} rotation={[-0.2, 0, 0]} onClick={onClick}>
              <boxGeometry args={[0.15, 0.2, 0.02]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            
            {/* Glasses */}
            <mesh position={[0, 1.72, 0.14]} onClick={onClick}>
              <boxGeometry args={[0.2, 0.08, 0.02]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
          </group>
        );

      case 'forklift':
        const speed = params.speed || 3.0;
        const liftHeight = params.liftHeight || 4;
        return (
          <group>
            {/* Main body */}
            <mesh position={[0, 0.6, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[1.2, 1.2, 2]} />
              <meshStandardMaterial color="#f97316" />
            </mesh>
            
            {/* Counterweight */}
            <mesh position={[0, 0.4, -1.2]} castShadow onClick={onClick}>
              <boxGeometry args={[1, 0.8, 0.8]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            
            {/* Wheels */}
            {[
              [-0.5, 0.2, 0.8],
              [0.5, 0.2, 0.8],
              [-0.5, 0.2, -0.8],
              [0.5, 0.2, -0.8]
            ].map(([x, y, z], i) => (
              <mesh key={i} position={[x, y, z]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.2, 0.2, 0.15]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
            ))}
            
            {/* Mast */}
            <mesh position={[0, liftHeight/2 + 0.6, 0.9]} castShadow onClick={onClick}>
              <boxGeometry args={[0.15, liftHeight, 0.15]} />
              <meshStandardMaterial color="#6b7280" />
            </mesh>
            
            {/* Fork carriage */}
            <mesh position={[0, 1.2, 1]} castShadow onClick={onClick}>
              <boxGeometry args={[1, 0.2, 0.2]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            
            {/* Forks */}
            <mesh position={[-0.25, 1.1, 1.4]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, 0.05, 0.8]} />
              <meshStandardMaterial color="#6b7280" />
            </mesh>
            <mesh position={[0.25, 1.1, 1.4]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, 0.05, 0.8]} />
              <meshStandardMaterial color="#6b7280" />
            </mesh>
            
            {/* Operator cabin frame */}
            <mesh position={[0, 1.8, 0]} onClick={onClick}>
              <boxGeometry args={[1.1, 0.05, 1.8]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            
            {/* Operator seat */}
            <mesh position={[0, 1.4, -0.2]} castShadow onClick={onClick}>
              <boxGeometry args={[0.4, 0.1, 0.4]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            <mesh position={[0, 1.6, -0.4]} castShadow onClick={onClick}>
              <boxGeometry args={[0.4, 0.4, 0.1]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </group>
        );

      case 'agv':
        const agvSpeed = params.speed || 2.0;
        const batteryLevel = params.batteryLevel || 100;
        const batteryColor = batteryLevel > 50 ? '#10b981' : batteryLevel > 20 ? '#f59e0b' : '#ef4444';
        
        return (
          <group>
            {/* Main body */}
            <mesh position={[0, 0.15, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[1, 0.3, 1.5]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            
            {/* Top platform */}
            <mesh position={[0, 0.35, 0]} onClick={onClick}>
              <boxGeometry args={[0.9, 0.05, 1.4]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            
            {/* Wheels */}
            {[
              [-0.4, 0.08, 0.6],
              [0.4, 0.08, 0.6],
              [-0.4, 0.08, -0.6],
              [0.4, 0.08, -0.6]
            ].map(([x, y, z], i) => (
              <mesh key={i} position={[x, y, z]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.08, 0.08, 0.1]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
            ))}
            
            {/* Sensors/LIDAR */}
            <mesh position={[0, 0.5, 0]} onClick={onClick}>
              <cylinderGeometry args={[0.1, 0.1, 0.2]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            
            {/* Navigation lights */}
            <mesh position={[0, 0.25, 0.75]} onClick={onClick}>
              <sphereGeometry args={[0.03]} />
              <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.25, -0.75]} onClick={onClick}>
              <sphereGeometry args={[0.03]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
            </mesh>
            
            {/* Battery indicator */}
            <mesh position={[0.4, 0.25, 0]} onClick={onClick}>
              <boxGeometry args={[0.1, 0.15, 0.05]} />
              <meshStandardMaterial color={batteryColor} emissive={batteryColor} emissiveIntensity={0.2} />
            </mesh>
            
            {/* Antenna */}
            <mesh position={[0, 0.7, 0]} onClick={onClick}>
              <cylinderGeometry args={[0.01, 0.01, 0.3]} />
              <meshStandardMaterial color="#6b7280" />
            </mesh>
            
            {/* Load platform safety rails */}
            {[
              [0.45, 0.45, 0],
              [-0.45, 0.45, 0],
              [0, 0.45, 0.7],
              [0, 0.45, -0.7]
            ].map(([x, y, z], i) => (
              <mesh key={i} position={[x, y, z]} onClick={onClick}>
                <cylinderGeometry args={[0.02, 0.02, 0.2]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            ))}
          </group>
        );

      default:
        // Default capsule for unknown types
        return (
          <mesh position={[0, 1, 0]} castShadow onClick={onClick}>
            <capsuleGeometry args={[0.3, 1.5]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={groupRef}
      position={actor.position}
      rotation={actor.rotation}
      scale={actor.scale}
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