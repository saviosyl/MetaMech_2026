'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProcessNode } from '../../_store/editorStore';

interface Props {
  node: ProcessNode;
  onClick: (event: any) => void;
  isSelected: boolean;
}

export default function ConveyorComponent({ node, onClick, isSelected }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Get parameters with defaults
  const length = node.parameters?.length || 5;
  const width = node.parameters?.width || 1;
  const conveyorType = node.parameters?.type || 'roller';
  const speed = node.parameters?.speed || 1.0;
  
  // Animation for selected objects and belt movement
  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (isSelected) {
        // Pulsing animation for selected objects
        const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.02;
        groupRef.current.scale.setScalar(scale);
      } else {
        groupRef.current.scale.setScalar(1);
        
        // Belt/roller animation based on type
        if (conveyorType === 'roller') {
          groupRef.current.traverse((child) => {
            if (child.name === 'roller') {
              child.rotation.x = clock.getElapsedTime() * speed * 2;
            }
          });
        } else if (conveyorType === 'belt' || conveyorType === 'modular-belt') {
          groupRef.current.traverse((child) => {
            if (child.name === 'belt' && 'material' in child) {
              const material = child.material as THREE.MeshStandardMaterial;
              if (material.map) {
                material.map.offset.x = (clock.getElapsedTime() * speed * 0.5) % 1;
              }
            }
          });
        } else if (conveyorType === 'chain') {
          groupRef.current.traverse((child) => {
            if (child.name === 'chain' && 'material' in child) {
              const material = child.material as THREE.MeshStandardMaterial;
              if (material.map) {
                material.map.offset.x = (clock.getElapsedTime() * speed * 0.3) % 1;
              }
            }
          });
        }
      }
    }
  });

  // Industrial color palette
  const colors = {
    frameSteel: '#8a8a9a',
    darkGray: '#3a3a3a',
    lightSteel: '#9ca3af',
    mediumSteel: '#6b7280',
    safetyYellow: '#eab308',
    darkRubber: '#1f2937',
    motorBlue: '#2d3a4a',
    chainMetal: '#5a5a6a'
  };

  // Create detailed conveyor based on type
  const conveyorGeometry = useMemo(() => {
    const frameHeight = 0.8;
    
    switch (conveyorType) {
      case 'belt':
        return createBeltConveyor(length, width, frameHeight, colors);
      case 'roller':
        return createRollerConveyor(length, width, frameHeight, colors);
      case 'chain':
        return createChainConveyor(length, width, frameHeight, colors);
      case 'modular-belt':
        return createModularBeltConveyor(length, width, frameHeight, colors);
      default:
        return createRollerConveyor(length, width, frameHeight, colors);
    }
  }, [length, width, conveyorType]);

  return (
    <group ref={groupRef} position={node.position} rotation={node.rotation}>
      {conveyorGeometry}
      
      {/* Connection ports for snapping */}
      {/* Input port (green sphere at rear) */}
      <mesh position={[0, 0.5, -length/2 - 0.1]} onClick={onClick}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color="#22c55e" 
          emissive="#22c55e" 
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Output port (blue sphere at front) */}
      <mesh position={[0, 0.5, length/2 + 0.1]} onClick={onClick}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#3b82f6" 
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Detailed belt conveyor
function createBeltConveyor(length: number, width: number, height: number, colors: any) {
  return (
    <group>
      {/* Frame structure */}
      {createConveyorFrame(length, width, height, colors)}
      
      {/* Drive and tail pulleys */}
      <mesh position={[0, height - 0.05, length/2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.08, 0.08, width - 0.1]} />
        <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, height - 0.05, -length/2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.08, 0.08, width - 0.1]} />
        <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Belt surface */}
      <mesh position={[0, height + 0.01, 0]} name="belt">
        <boxGeometry args={[width - 0.1, 0.02, length]} />
        <meshStandardMaterial 
          color={colors.darkRubber} 
          metalness={0.1} 
          roughness={0.9}
        />
      </mesh>
      
      {/* Drive motor */}
      {createDriveMotor(0, height + 0.1, length/2 - 0.3, colors)}
    </group>
  );
}

// Detailed roller conveyor  
function createRollerConveyor(length: number, width: number, height: number, colors: any) {
  const rollerCount = Math.floor(length * 3); // 3 rollers per meter
  const rollerSpacing = length / rollerCount;
  
  return (
    <group>
      {/* Frame structure */}
      {createConveyorFrame(length, width, height, colors)}
      
      {/* Individual rollers */}
      {Array.from({ length: rollerCount }, (_, i) => {
        const z = (i - (rollerCount - 1) / 2) * rollerSpacing;
        return (
          <mesh 
            key={`roller-${i}`} 
            name="roller"
            position={[0, height - 0.05, z]} 
            rotation={[0, 0, Math.PI/2]}
          >
            <cylinderGeometry args={[0.025, 0.025, width - 0.2]} />
            <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}
      
      {/* Drive motor and gearbox */}
      {createDriveMotor(0, height + 0.1, length/2 - 0.3, colors)}
      
      {/* Drive chain under rollers */}
      <mesh position={[width/4, height - 0.2, 0]}>
        <boxGeometry args={[0.02, 0.02, length - 0.2]} />
        <meshStandardMaterial color={colors.chainMetal} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-width/4, height - 0.2, 0]}>
        <boxGeometry args={[0.02, 0.02, length - 0.2]} />
        <meshStandardMaterial color={colors.chainMetal} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Chain conveyor with slats
function createChainConveyor(length: number, width: number, height: number, colors: any) {
  const slatCount = Math.floor(length * 2); // 2 slats per meter
  const slatSpacing = length / slatCount;
  
  return (
    <group>
      {/* Frame structure */}
      {createConveyorFrame(length, width, height, colors)}
      
      {/* Drive sprockets */}
      <mesh position={[width/4, height - 0.05, length/2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04]} />
        <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-width/4, height - 0.05, length/2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04]} />
        <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Chains */}
      <mesh position={[width/4, height - 0.02, 0]} name="chain">
        <boxGeometry args={[0.03, 0.02, length]} />
        <meshStandardMaterial color={colors.chainMetal} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-width/4, height - 0.02, 0]} name="chain">
        <boxGeometry args={[0.03, 0.02, length]} />
        <meshStandardMaterial color={colors.chainMetal} metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Slats across chains */}
      {Array.from({ length: slatCount }, (_, i) => {
        const z = (i - (slatCount - 1) / 2) * slatSpacing;
        return (
          <mesh key={`slat-${i}`} position={[0, height + 0.01, z]}>
            <boxGeometry args={[width - 0.15, 0.02, 0.1]} />
            <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
      
      {/* Drive motor */}
      {createDriveMotor(0, height + 0.1, length/2 - 0.3, colors)}
    </group>
  );
}

// Modular belt with visible segments
function createModularBeltConveyor(length: number, width: number, height: number, colors: any) {
  const segmentCount = Math.floor(length * 4); // 4 segments per meter
  const segmentLength = length / segmentCount;
  
  return (
    <group>
      {/* Frame structure */}
      {createConveyorFrame(length, width, height, colors)}
      
      {/* Drive and tail pulleys */}
      <mesh position={[0, height - 0.05, length/2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.08, 0.08, width - 0.1]} />
        <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, height - 0.05, -length/2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.08, 0.08, width - 0.1]} />
        <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Modular belt segments */}
      {Array.from({ length: segmentCount }, (_, i) => {
        const z = (i - (segmentCount - 1) / 2) * segmentLength;
        return (
          <group key={`segment-${i}`}>
            <mesh position={[0, height + 0.01, z]} name="belt">
              <boxGeometry args={[width - 0.1, 0.02, segmentLength - 0.01]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? colors.darkRubber : '#2a2a3a'} 
                metalness={0.1} 
                roughness={0.9}
              />
            </mesh>
          </group>
        );
      })}
      
      {/* Drive motor */}
      {createDriveMotor(0, height + 0.1, length/2 - 0.3, colors)}
    </group>
  );
}

// Common conveyor frame structure
function createConveyorFrame(length: number, width: number, height: number, colors: any) {
  return (
    <group>
      {/* Left side C-channel frame */}
      <group position={[-width/2 + 0.05, height/2, 0]}>
        {/* Bottom plate */}
        <mesh position={[0, -height/4, 0]}>
          <boxGeometry args={[0.1, height/2, length]} />
          <meshStandardMaterial color={colors.frameSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Top lip */}
        <mesh position={[0.025, height/4 - 0.025, 0]}>
          <boxGeometry args={[0.05, 0.05, length]} />
          <meshStandardMaterial color={colors.frameSteel} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Right side C-channel frame */}
      <group position={[width/2 - 0.05, height/2, 0]}>
        {/* Bottom plate */}
        <mesh position={[0, -height/4, 0]}>
          <boxGeometry args={[0.1, height/2, length]} />
          <meshStandardMaterial color={colors.frameSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Top lip */}
        <mesh position={[-0.025, height/4 - 0.025, 0]}>
          <boxGeometry args={[0.05, 0.05, length]} />
          <meshStandardMaterial color={colors.frameSteel} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Cross braces */}
      {Array.from({ length: Math.ceil(length / 1.5) }, (_, i) => {
        const z = (i - Math.floor((length / 1.5) / 2)) * 1.5;
        return (
          <mesh key={`cross-${i}`} position={[0, 0.15, z]}>
            <boxGeometry args={[width - 0.1, 0.05, 0.1]} />
            <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.4} />
          </mesh>
        );
      })}
      
      {/* Adjustable legs with foot pads */}
      {[-1, 1].map(x => 
        [-length/2 + 0.5, length/2 - 0.5].map((z, zi) => (
          <group key={`leg-${x}-${zi}`}>
            {/* Main leg */}
            <mesh position={[x * (width/2 - 0.1), 0.3, z]}>
              <cylinderGeometry args={[0.03, 0.04, 0.6]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Adjustment ring */}
            <mesh position={[x * (width/2 - 0.1), 0.15, z]}>
              <cylinderGeometry args={[0.045, 0.045, 0.05]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.5} />
            </mesh>
            {/* Foot pad */}
            <mesh position={[x * (width/2 - 0.1), 0.02, z]}>
              <cylinderGeometry args={[0.08, 0.08, 0.04]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.9} />
            </mesh>
          </group>
        ))
      )}
      
      {/* Side guide rails */}
      <mesh position={[-width/2 + 0.01, height + 0.15, 0]}>
        <boxGeometry args={[0.02, 0.3, length]} />
        <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[width/2 - 0.01, height + 0.15, 0]}>
        <boxGeometry args={[0.02, 0.3, length]} />
        <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
}

// Drive motor assembly
function createDriveMotor(x: number, y: number, z: number, colors: any) {
  return (
    <group position={[x, y, z]}>
      {/* Motor housing */}
      <mesh>
        <boxGeometry args={[0.4, 0.3, 0.6]} />
        <meshStandardMaterial color={colors.motorBlue} metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Motor body */}
      <mesh position={[0, -0.05, 0.1]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2]} />
        <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Gearbox */}
      <mesh position={[0, 0.05, -0.2]}>
        <boxGeometry args={[0.25, 0.2, 0.25]} />
        <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Motor nameplate */}
      <mesh position={[0.21, 0, 0]}>
        <boxGeometry args={[0.01, 0.1, 0.15]} />
        <meshStandardMaterial color="#e5e5e5" metalness={0.1} roughness={0.7} />
      </mesh>
    </group>
  );
}