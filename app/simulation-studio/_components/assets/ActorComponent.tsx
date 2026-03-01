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
  
  // Animation for selected objects and moving actors
  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (isSelected) {
        // Pulsing animation for selected objects
        const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.02;
        groupRef.current.scale.setScalar(scale);
      } else {
        groupRef.current.scale.setScalar(1);
        
        // Special animations for different actor types
        if (actor.type === 'forklift') {
          // Subtle idle vibration
          const vibration = Math.sin(clock.getElapsedTime() * 8) * 0.005;
          groupRef.current.position.y = actor.position[1] + vibration;
        } else if (actor.type === 'agv') {
          // LED strip animation
          const ledStrip = groupRef.current.getObjectByName('ledStrip');
          if (ledStrip) {
            const intensity = 0.2 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
            (ledStrip.material as any).emissiveIntensity = intensity;
          }
        }
      }
    }
  });

  // Industrial color palette
  const colors = {
    operatorBlue: '#3b82f6',
    engineerOrange: '#f97316', 
    safetyYellow: '#eab308',
    hardHatYellow: '#eab308',
    skinTone: '#d4a574',
    darkGray: '#4a5568',
    lightSteel: '#9ca3af',
    mediumSteel: '#6b7280',
    blackRubber: '#1f2937',
    forkliftYellow: '#eab308',
    agvBlue: '#2563eb',
    reflectiveVest: '#f59e0b',
    safetyRed: '#ef4444'
  };

  const renderOperator = () => {
    return (
      <group>
        {/* Body - capsule shape using cylinder + spheres */}
        <mesh position={[0, 1.4, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.18, 0.22, 0.8]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Chest/shoulders - upper body bulk */}
        <mesh position={[0, 1.65, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.45, 0.3, 0.2]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.95, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Hard hat */}
        <mesh position={[0, 2.08, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.14]} />
          <meshStandardMaterial color={colors.hardHatYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Hard hat brim */}
        <mesh position={[0, 2.02, 0.12]} onClick={onClick}>
          <cylinderGeometry args={[0.16, 0.16, 0.02]} />
          <meshStandardMaterial color={colors.hardHatYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.28, 1.5, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.6]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0.28, 1.5, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.6]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Hands */}
        <mesh position={[-0.28, 1.2, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.28, 1.2, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.12, 0.75, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.75, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Safety boots */}
        <mesh position={[-0.12, 0.32, 0.08]} castShadow onClick={onClick}>
          <boxGeometry args={[0.12, 0.12, 0.25]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.32, 0.08]} castShadow onClick={onClick}>
          <boxGeometry args={[0.12, 0.12, 0.25]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Tool belt */}
        <mesh position={[0, 1.1, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.24, 0.24, 0.06]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Safety vest reflective strips */}
        <mesh position={[0, 1.6, 0.21]} onClick={onClick}>
          <boxGeometry args={[0.4, 0.04, 0.01]} />
          <meshStandardMaterial color={colors.reflectiveVest} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.4, 0.21]} onClick={onClick}>
          <boxGeometry args={[0.4, 0.04, 0.01]} />
          <meshStandardMaterial color={colors.reflectiveVest} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* ID badge */}
        <mesh position={[-0.1, 1.65, 0.21]} onClick={onClick}>
          <boxGeometry args={[0.08, 0.12, 0.01]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
        </mesh>
      </group>
    );
  };

  const renderEngineer = () => {
    return (
      <group>
        {/* Body - similar to operator but different color scheme */}
        <mesh position={[0, 1.4, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.18, 0.22, 0.8]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Chest/shoulders */}
        <mesh position={[0, 1.65, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.45, 0.3, 0.2]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.95, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Hard hat */}
        <mesh position={[0, 2.08, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.14]} />
          <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Hard hat brim */}
        <mesh position={[0, 2.02, 0.12]} onClick={onClick}>
          <cylinderGeometry args={[0.16, 0.16, 0.02]} />
          <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.28, 1.5, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.6]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0.28, 1.5, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.6]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Hands */}
        <mesh position={[-0.28, 1.2, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.28, 1.2, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.12, 0.75, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.75, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Safety boots */}
        <mesh position={[-0.12, 0.32, 0.08]} castShadow onClick={onClick}>
          <boxGeometry args={[0.12, 0.12, 0.25]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.32, 0.08]} castShadow onClick={onClick}>
          <boxGeometry args={[0.12, 0.12, 0.25]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Clipboard in hand */}
        <mesh position={[-0.35, 1.3, 0.1]} rotation={[0, 0, -0.3]} castShadow onClick={onClick}>
          <boxGeometry args={[0.12, 0.18, 0.01]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Clipboard clip */}
        <mesh position={[-0.35, 1.39, 0.11]} rotation={[0, 0, -0.3]} onClick={onClick}>
          <boxGeometry args={[0.08, 0.02, 0.01]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Measuring tape on belt */}
        <mesh position={[0.2, 1.1, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.08]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Safety glasses on head */}
        <mesh position={[0, 1.92, 0.11]} onClick={onClick}>
          <boxGeometry args={[0.18, 0.03, 0.12]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  };

  const renderForklift = () => {
    return (
      <group>
        {/* Main chassis body */}
        <mesh position={[0, 0.4, -0.5]} castShadow onClick={onClick}>
          <boxGeometry args={[1.2, 0.6, 2]} />
          <meshStandardMaterial color={colors.forkliftYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Engine compartment hood */}
        <mesh position={[0, 0.5, -1.3]} castShadow onClick={onClick}>
          <boxGeometry args={[1.1, 0.4, 0.6]} />
          <meshStandardMaterial color={colors.forkliftYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Driver cabin frame */}
        <mesh position={[0, 1.3, 0.3]} castShadow onClick={onClick}>
          <boxGeometry args={[1.1, 0.05, 1.4]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Cabin roof */}
        <mesh position={[0, 1.8, 0.3]} onClick={onClick}>
          <boxGeometry args={[1.2, 0.03, 1.5]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Overhead guard - 4 posts */}
        {[-0.5, 0.5].map(x =>
          [-0.4, 1].map(z => (
            <mesh key={`guard-${x}-${z}`} position={[x, 1.55, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, 1]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Driver seat */}
        <mesh position={[0, 1.0, 0.2]} castShadow onClick={onClick}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Seat back */}
        <mesh position={[0, 1.3, -0.05]} castShadow onClick={onClick}>
          <boxGeometry args={[0.5, 0.5, 0.1]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Steering wheel */}
        <mesh position={[0, 1.4, 0.4]} rotation={[-0.3, 0, 0]} onClick={onClick}>
          <torusGeometry args={[0.15, 0.02]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Steering column */}
        <mesh position={[0, 1.2, 0.3]} rotation={[-0.3, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 0.3]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.4} />
        </mesh>
        
        {/* Mast structure - two vertical channels */}
        <mesh position={[-0.25, 2, 1.2]} castShadow onClick={onClick}>
          <boxGeometry args={[0.08, 3.5, 0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.25, 2, 1.2]} castShadow onClick={onClick}>
          <boxGeometry args={[0.08, 3.5, 0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Mast cross braces */}
        {[1, 2, 3].map(i => (
          <mesh key={`brace-${i}`} position={[0, 0.5 + i * 0.8, 1.2]} onClick={onClick}>
            <boxGeometry args={[0.5, 0.04, 0.04]} />
            <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        
        {/* Fork carriage plate */}
        <mesh position={[0, 1.5, 1.24]} castShadow onClick={onClick}>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Fork tines - L-shaped cross section */}
        {[-0.2, 0.2].map(x => (
          <group key={`fork-${x}`}>
            {/* Horizontal fork blade */}
            <mesh position={[x, 1.2, 1.8]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, 0.04, 1.2]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Vertical fork back */}
            <mesh position={[x, 1.35, 1.28]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, 0.3, 0.04]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
        
        {/* Hydraulic lift cylinders */}
        <mesh position={[-0.15, 2.5, 1.05]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 2]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 2.5, 1.05]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 2]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Four wheels - front smaller, rear larger */}
        {/* Front wheels (steerable, smaller) */}
        <mesh position={[-0.5, 0.25, 1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.25, 0.25, 0.2]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.25, 1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.25, 0.25, 0.2]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Front wheel hubs */}
        <mesh position={[-0.5, 0.25, 1]} rotation={[Math.PI/2, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.5, 0.25, 1]} rotation={[Math.PI/2, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Rear wheels (drive, larger) */}
        <mesh position={[-0.5, 0.35, -1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.35, 0.35, 0.25]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.35, -1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.35, 0.35, 0.25]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Rear wheel hubs */}
        <mesh position={[-0.5, 0.35, -1]} rotation={[Math.PI/2, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.5, 0.35, -1]} rotation={[Math.PI/2, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Counterweight at back */}
        <mesh position={[0, 0.5, -1.6]} castShadow onClick={onClick}>
          <boxGeometry args={[0.9, 0.8, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Warning beacon on top */}
        <mesh position={[0, 1.85, 0.8]} onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.08]} />
          <meshStandardMaterial color={colors.safetyRed} emissive={colors.safetyRed} emissiveIntensity={0.2} />
        </mesh>
        
        {/* Side mirrors */}
        <mesh position={[-0.7, 1.6, 0.8]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.1, 0.02]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.7, 1.6, 0.8]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.1, 0.02]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  };

  const renderAGV = () => {
    return (
      <group>
        {/* Main platform body - low and flat */}
        <mesh position={[0, 0.15, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1.2, 0.3, 2]} />
          <meshStandardMaterial color={colors.agvBlue} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Chassis frame underneath */}
        <mesh position={[0, 0.08, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1, 0.16, 1.8]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Battery compartment */}
        <mesh position={[0, 0.25, -0.6]} castShadow onClick={onClick}>
          <boxGeometry args={[0.8, 0.2, 0.6]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Control electronics box */}
        <mesh position={[0, 0.25, 0.6]} castShadow onClick={onClick}>
          <boxGeometry args={[0.6, 0.2, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Sensor dome (LIDAR) on top */}
        <mesh position={[0, 0.45, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.08, 0.12]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Sensor dome lens */}
        <mesh position={[0, 0.51, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Navigation cameras */}
        {[-0.3, 0.3].map(x => (
          <mesh key={`camera-${x}`} position={[x, 0.35, 0.9]} onClick={onClick}>
            <cylinderGeometry args={[0.03, 0.03, 0.06]} />
            <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        
        {/* Camera lenses */}
        {[-0.3, 0.3].map(x => (
          <mesh key={`lens-${x}`} position={[x, 0.35, 0.93]} onClick={onClick}>
            <cylinderGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        
        {/* LED status strip */}
        <mesh position={[0, 0.31, 1]} name="ledStrip" onClick={onClick}>
          <boxGeometry args={[0.8, 0.02, 0.02]} />
          <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.2} />
        </mesh>
        
        {/* Mecanum wheels (special omni-directional wheels) */}
        {[-0.5, 0.5].map(x =>
          [-0.8, 0.8].map(z => (
            <group key={`wheel-${x}-${z}`}>
              {/* Main wheel */}
              <mesh position={[x, 0.1, z]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.15, 0.15, 0.08]} />
                <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
              </mesh>
              {/* Mecanum rollers around the wheel */}
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const rollerX = x + Math.cos(angle) * 0.13;
                const rollerY = 0.1 + Math.sin(angle) * 0.13;
                return (
                  <mesh key={`roller-${i}`} position={[rollerX, rollerY, z]} rotation={[0, 0, angle]} onClick={onClick}>
                    <cylinderGeometry args={[0.02, 0.02, 0.06]} />
                    <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
                  </mesh>
                );
              })}
            </group>
          ))
        )}
        
        {/* Emergency stop button */}
        <mesh position={[0.4, 0.32, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.03]} />
          <meshStandardMaterial color={colors.safetyRed} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Antenna for communication */}
        <mesh position={[-0.4, 0.6, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.01, 0.01, 0.25]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Safety bumper sensors around perimeter */}
        {[-0.6, 0, 0.6].map(x => (
          <mesh key={`bumper-front-${x}`} position={[x, 0.12, 1.01]} onClick={onClick}>
            <boxGeometry args={[0.05, 0.04, 0.02]} />
            <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
        
        {/* Load indicators */}
        {[-0.2, 0.2].map(x => (
          <mesh key={`load-indicator-${x}`} position={[x, 0.32, -0.2]} onClick={onClick}>
            <cylinderGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.1} />
          </mesh>
        ))}
        
        {/* Charging contacts on side */}
        {[0, 1].map(i => (
          <mesh key={`contact-${i}`} position={[-0.61, 0.2, -0.2 + i * 0.1]} onClick={onClick}>
            <cylinderGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial color={colors.lightSteel} metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>
    );
  };

  const renderGeometry = () => {
    switch (actor.type) {
      case 'operator':
        return renderOperator();
      case 'engineer':
        return renderEngineer();
      case 'forklift':
        return renderForklift();
      case 'agv':
        return renderAGV();
      default:
        // Default fallback
        return (
          <mesh position={[0, 0.5, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshStandardMaterial color={colors.operatorBlue} />
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
          <edgesGeometry args={[new THREE.BoxGeometry(2, 2.5, 2)]} />
          <lineBasicMaterial color="#06b6d4" linewidth={3} />
        </lineSegments>
      )}
    </group>
  );
}