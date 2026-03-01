'use client';

import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimulationItem as SimulationItemType } from '../_store/editorStore';

interface Props {
  item: SimulationItemType;
}

function SimulationItem({ item }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Subtle movement animation while flowing
  useFrame(({ clock }) => {
    if (groupRef.current && item.progress < 1) {
      // Gentle bobbing while moving
      const bobbing = Math.sin(clock.getElapsedTime() * 4 + item.id.length) * 0.02;
      groupRef.current.position.y = item.position[1] + bobbing;
      
      // Slight random rotation
      const rotationSpeed = 0.2;
      groupRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed + item.id.length * 0.1;
    } else if (groupRef.current) {
      groupRef.current.position.y = item.position[1];
    }
  });

  // Industrial product colors
  const getProductColor = (productId: string) => {
    const colors: Record<string, string> = {
      default: '#4a5568', // Dark gray - generic part
      box: '#8b5a2b', // Cardboard brown
      pallet: '#d4a574', // Wood color
      cylinder: '#6b7280', // Steel gray
      part: '#3b82f6', // Blue - machined part
      package: '#f59e0b', // Orange - shipping box
    };
    return colors[productId] || colors.default;
  };

  const renderProductGeometry = (productId: string) => {
    const color = getProductColor(productId);
    const metalness = productId === 'cylinder' || productId === 'part' ? 0.7 : 0.1;
    const roughness = productId === 'cylinder' || productId === 'part' ? 0.3 : 0.8;
    
    switch (productId) {
      case 'box':
        return (
          <group>
            {/* Main cardboard box */}
            <mesh castShadow>
              <boxGeometry args={[0.15, 0.15, 0.15]} />
              <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
            </mesh>
            {/* Box seam tape */}
            <mesh position={[0, 0.076, 0]}>
              <boxGeometry args={[0.16, 0.01, 0.16]} />
              <meshStandardMaterial color="#8b4513" metalness={0.2} roughness={0.9} />
            </mesh>
            {/* Side tape */}
            <mesh position={[0, 0, 0.076]}>
              <boxGeometry args={[0.16, 0.16, 0.01]} />
              <meshStandardMaterial color="#8b4513" metalness={0.2} roughness={0.9} />
            </mesh>
          </group>
        );
        
      case 'cylinder':
        return (
          <group>
            {/* Main cylinder - machined part */}
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.15]} />
              <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
            </mesh>
            {/* End caps with slight different shade */}
            <mesh position={[0, 0.075, 0]}>
              <cylinderGeometry args={[0.082, 0.082, 0.01]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.075, 0]}>
              <cylinderGeometry args={[0.082, 0.082, 0.01]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
        
      case 'pallet':
        return (
          <group>
            {/* Pallet deck */}
            <mesh position={[0, 0.02, 0]} castShadow>
              <boxGeometry args={[0.25, 0.04, 0.2]} />
              <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
            </mesh>
            {/* Pallet stringers (support beams) */}
            {[-0.08, 0, 0.08].map(z => (
              <mesh key={z} position={[0, -0.02, z]} castShadow>
                <boxGeometry args={[0.25, 0.04, 0.03]} />
                <meshStandardMaterial color="#8b4513" metalness={0.1} roughness={0.9} />
              </mesh>
            ))}
            {/* Pallet blocks (feet) */}
            {[-0.1, 0, 0.1].map(x => 
              [-0.08, 0.08].map(z => (
                <mesh key={`${x}-${z}`} position={[x, -0.04, z]} castShadow>
                  <boxGeometry args={[0.03, 0.04, 0.03]} />
                  <meshStandardMaterial color="#8b4513" metalness={0.1} roughness={0.9} />
                </mesh>
              ))
            ).flat()}
          </group>
        );
        
      case 'part':
        return (
          <group>
            {/* Machined spherical part */}
            <mesh castShadow>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
            </mesh>
            {/* Machining marks - subtle rings */}
            {Array.from({ length: 3 }, (_, i) => (
              <mesh key={i} position={[0, -0.04 + i * 0.04, 0]}>
                <torusGeometry args={[0.06 + i * 0.01, 0.002]} />
                <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.1} />
              </mesh>
            ))}
          </group>
        );

      case 'package':
        return (
          <group>
            {/* Shipping box */}
            <mesh castShadow>
              <boxGeometry args={[0.18, 0.12, 0.15]} />
              <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
            </mesh>
            {/* Shipping label */}
            <mesh position={[0.091, 0, 0]}>
              <boxGeometry args={[0.001, 0.08, 0.06]} />
              <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
            </mesh>
            {/* Barcode on label */}
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i} position={[0.092, -0.02 + (i % 2) * 0.04, -0.02 + i * 0.005]}>
                <boxGeometry args={[0.001, 0.02, 0.002]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
            ))}
            {/* Fragile sticker */}
            <mesh position={[0, 0.061, 0.05]}>
              <cylinderGeometry args={[0.02, 0.02, 0.001]} />
              <meshStandardMaterial color="#ef4444" metalness={0.1} roughness={0.8} />
            </mesh>
          </group>
        );
        
      default:
        // Generic part
        return (
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        );
    }
  };

  return (
    <group 
      ref={groupRef}
      position={item.position}
    >
      {renderProductGeometry(item.productId)}
    </group>
  );
}

export default memo(SimulationItem);