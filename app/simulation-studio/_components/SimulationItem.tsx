'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimulationItem as SimulationItemType } from '../_store/editorStore';

interface Props {
  item: SimulationItemType;
}

export default function SimulationItem({ item }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Gentle rotation animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  // Color based on product type
  const getProductColor = (productId: string) => {
    const colors: Record<string, string> = {
      default: '#3b82f6',
      box: '#8b5cf6',
      pallet: '#f59e0b',
      cylinder: '#10b981',
      part: '#ef4444',
    };
    return colors[productId] || colors.default;
  };

  const renderProductGeometry = (productId: string) => {
    const color = getProductColor(productId);
    
    switch (productId) {
      case 'box':
        return (
          <boxGeometry args={[0.15, 0.15, 0.15]} />
        );
        
      case 'cylinder':
        return (
          <cylinderGeometry args={[0.08, 0.08, 0.15]} />
        );
        
      case 'pallet':
        return (
          <boxGeometry args={[0.2, 0.05, 0.25]} />
        );
        
      case 'part':
        return (
          <sphereGeometry args={[0.08]} />
        );
        
      default:
        return (
          <boxGeometry args={[0.12, 0.12, 0.12]} />
        );
    }
  };

  return (
    <mesh 
      ref={meshRef}
      position={item.position} 
      castShadow
    >
      {renderProductGeometry(item.productId)}
      <meshStandardMaterial 
        color={getProductColor(item.productId)}
        metalness={0.1}
        roughness={0.7}
      />
    </mesh>
  );
}