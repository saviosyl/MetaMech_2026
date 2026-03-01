'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvironmentAsset } from '../../_store/editorStore';

interface Props {
  asset: EnvironmentAsset;
  onClick: (event: any) => void;
  isSelected: boolean;
}

export default function EnvironmentAssetComponent({ asset, onClick, isSelected }: Props) {
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
    const params = asset.parameters || {};

    switch (asset.type) {
      case 'wall':
        const width = params.width || 5;
        const height = params.height || 3;
        const thickness = params.thickness || 0.2;
        return (
          <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[width, height, thickness]} />
            <meshStandardMaterial 
              color="#d1d5db" 
              roughness={0.9} 
              metalness={0.1}
            />
          </mesh>
        );

      case 'door':
        const doorWidth = params.width || 2;
        const doorHeight = params.height || 2.5;
        const doorThickness = params.thickness || 0.1;
        return (
          <group>
            {/* Door frame */}
            <mesh position={[0, doorHeight/2, 0]} onClick={onClick}>
              <boxGeometry args={[doorWidth + 0.2, doorHeight + 0.1, doorThickness + 0.05]} />
              <meshStandardMaterial color="#9ca3af" roughness={0.7} />
            </mesh>
            {/* Door panel */}
            <mesh position={[doorWidth/4, doorHeight/2, doorThickness/4]} castShadow onClick={onClick}>
              <boxGeometry args={[doorWidth - 0.1, doorHeight - 0.1, doorThickness]} />
              <meshStandardMaterial color="#6b7280" roughness={0.6} />
            </mesh>
            {/* Door handle */}
            <mesh position={[doorWidth/2 - 0.2, doorHeight/2, doorThickness/2 + 0.05]} onClick={onClick}>
              <sphereGeometry args={[0.05]} />
              <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );

      case 'window':
        const windowWidth = params.width || 2;
        const windowHeight = params.height || 1.5;
        const windowThickness = params.thickness || 0.1;
        return (
          <group>
            {/* Window frame */}
            <mesh position={[0, windowHeight/2 + 0.5, 0]} onClick={onClick}>
              <boxGeometry args={[windowWidth + 0.2, windowHeight + 0.2, windowThickness + 0.05]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            {/* Glass */}
            <mesh position={[0, windowHeight/2 + 0.5, 0]} onClick={onClick}>
              <boxGeometry args={[windowWidth, windowHeight, windowThickness/2]} />
              <meshStandardMaterial 
                color="#e0f7ff" 
                transparent 
                opacity={0.3} 
                roughness={0} 
                metalness={0.1} 
              />
            </mesh>
          </group>
        );

      case 'stairs':
        const stairWidth = params.width || 2;
        const steps = params.steps || 10;
        const stepHeight = params.stepHeight || 0.2;
        return (
          <group>
            {Array.from({ length: steps }, (_, i) => (
              <mesh 
                key={i} 
                position={[0, (i + 1) * stepHeight / 2, i * 0.3 - (steps * 0.3) / 2]} 
                castShadow 
                onClick={onClick}
              >
                <boxGeometry args={[stairWidth, stepHeight, 0.3]} />
                <meshStandardMaterial color="#9ca3af" />
              </mesh>
            ))}
            {/* Side rails */}
            <mesh position={[stairWidth/2 + 0.1, steps * stepHeight / 2, 0]} onClick={onClick}>
              <boxGeometry args={[0.1, steps * stepHeight, steps * 0.3]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            <mesh position={[-stairWidth/2 - 0.1, steps * stepHeight / 2, 0]} onClick={onClick}>
              <boxGeometry args={[0.1, steps * stepHeight, steps * 0.3]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
          </group>
        );

      case 'safety-rail':
        const railLength = params.length || 5;
        const railHeight = params.height || 1.2;
        return (
          <group>
            {/* Posts */}
            {Array.from({ length: Math.floor(railLength / 2) + 1 }, (_, i) => (
              <mesh 
                key={i} 
                position={[i * 2 - railLength/2, railHeight/2, 0]} 
                castShadow 
                onClick={onClick}
              >
                <cylinderGeometry args={[0.05, 0.05, railHeight]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            ))}
            {/* Top rail */}
            <mesh position={[0, railHeight - 0.1, 0]} onClick={onClick}>
              <boxGeometry args={[railLength, 0.05, 0.05]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
            {/* Middle rail */}
            <mesh position={[0, railHeight/2, 0]} onClick={onClick}>
              <boxGeometry args={[railLength, 0.05, 0.05]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
          </group>
        );

      case 'floor-marking':
        const markingLength = params.length || 5;
        const markingWidth = params.width || 0.2;
        const markingColor = params.color || '#eab308';
        return (
          <mesh position={[0, 0.01, 0]} onClick={onClick}>
            <boxGeometry args={[markingLength, 0.02, markingWidth]} />
            <meshStandardMaterial color={markingColor} emissive={markingColor} emissiveIntensity={0.1} />
          </mesh>
        );

      case 'pallet-rack':
        const rackWidth = params.width || 3;
        const rackHeight = params.height || 4;
        const rackDepth = params.depth || 1.2;
        const levels = params.levels || 4;
        return (
          <group>
            {/* Vertical frames */}
            {[0, rackWidth].map(x => 
              [0, rackDepth].map(z => (
                <mesh key={`${x}-${z}`} position={[x - rackWidth/2, rackHeight/2, z - rackDepth/2]} castShadow onClick={onClick}>
                  <boxGeometry args={[0.1, rackHeight, 0.1]} />
                  <meshStandardMaterial color="#4b5563" />
                </mesh>
              ))
            ).flat()}
            
            {/* Horizontal beams and shelves */}
            {Array.from({ length: levels }, (_, level) => {
              const y = (level + 1) * (rackHeight / levels);
              return [
                // Front beam
                <mesh key={`front-${level}`} position={[0, y, rackDepth/2]} onClick={onClick}>
                  <boxGeometry args={[rackWidth, 0.1, 0.1]} />
                  <meshStandardMaterial color="#4b5563" />
                </mesh>,
                // Back beam
                <mesh key={`back-${level}`} position={[0, y, -rackDepth/2]} onClick={onClick}>
                  <boxGeometry args={[rackWidth, 0.1, 0.1]} />
                  <meshStandardMaterial color="#4b5563" />
                </mesh>,
                // Shelf
                <mesh key={`shelf-${level}`} position={[0, y + 0.05, 0]} onClick={onClick}>
                  <boxGeometry args={[rackWidth - 0.1, 0.05, rackDepth - 0.1]} />
                  <meshStandardMaterial color="#d1d5db" />
                </mesh>
              ];
            }).flat()}
          </group>
        );

      case 'warehouse-shell':
        const shellWidth = params.width || 20;
        const shellHeight = params.height || 8;
        const shellDepth = params.depth || 15;
        return (
          <group>
            {/* Floor */}
            <mesh position={[0, -0.1, 0]} onClick={onClick} receiveShadow>
              <boxGeometry args={[shellWidth, 0.2, shellDepth]} />
              <meshStandardMaterial color="#f3f4f6" />
            </mesh>
            
            {/* Side walls */}
            <mesh position={[shellWidth/2, shellHeight/2, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[0.3, shellHeight, shellDepth]} />
              <meshStandardMaterial color="#d1d5db" />
            </mesh>
            <mesh position={[-shellWidth/2, shellHeight/2, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[0.3, shellHeight, shellDepth]} />
              <meshStandardMaterial color="#d1d5db" />
            </mesh>
            
            {/* Back wall */}
            <mesh position={[0, shellHeight/2, -shellDepth/2]} castShadow onClick={onClick}>
              <boxGeometry args={[shellWidth, shellHeight, 0.3]} />
              <meshStandardMaterial color="#d1d5db" />
            </mesh>
            
            {/* Roof */}
            <mesh position={[0, shellHeight, 0]} onClick={onClick}>
              <boxGeometry args={[shellWidth, 0.3, shellDepth]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            
            {/* Roof supports */}
            {Array.from({ length: 5 }, (_, i) => (
              <mesh 
                key={i} 
                position={[i * (shellWidth/4) - shellWidth/2, shellHeight - 1, 0]} 
                castShadow 
                onClick={onClick}
              >
                <boxGeometry args={[0.2, 2, 0.2]} />
                <meshStandardMaterial color="#6b7280" />
              </mesh>
            ))}
          </group>
        );

      case 'floor':
        const floorWidth = params.width || 50;
        const floorDepth = params.depth || 50;
        const floorColor = params.color || '#f0f0f0';
        return (
          <mesh position={[0, -0.05, 0]} onClick={onClick} receiveShadow>
            <boxGeometry args={[floorWidth, 0.1, floorDepth]} />
            <meshStandardMaterial color={floorColor} roughness={0.9} />
          </mesh>
        );

      default:
        // Default box for unknown types
        return (
          <mesh position={[0, 0.5, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={groupRef}
      position={asset.position}
      rotation={asset.rotation}
      scale={asset.scale}
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