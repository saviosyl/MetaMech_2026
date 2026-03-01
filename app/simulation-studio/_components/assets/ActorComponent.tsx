'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Actor } from '../../_store/editorStore';

interface Props {
  actor: Actor;
  onClick: (event: any) => void;
  onContextMenu?: (event: any) => void;
  isSelected: boolean;
}

export default function ActorComponent({ actor, onClick, onContextMenu, isSelected }: Props) {
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
          if (ledStrip && 'material' in ledStrip) {
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
    safetyGreen: '#22c55e',
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
        {/* Torso - proper box body */}
        <mesh position={[0, 1.4, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.36, 0.7, 0.2]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Head with slight face indication */}
        <mesh position={[0, 1.95, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Nose bump for face indication */}
        <mesh position={[0, 1.95, 0.1]} onClick={onClick}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Yellow hard hat - flattened hemisphere */}
        <mesh position={[0, 2.05, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.14, 16, 8, 0, Math.PI * 2, 0, Math.PI/2]} />
          <meshStandardMaterial color={colors.hardHatYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Hard hat brim */}
        <mesh position={[0, 1.98, 0.12]} onClick={onClick}>
          <cylinderGeometry args={[0.17, 0.17, 0.02]} />
          <meshStandardMaterial color={colors.hardHatYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Neck */}
        <mesh position={[0, 1.82, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.08]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Upper arms - separated from body for natural pose */}
        <mesh position={[-0.25, 1.55, 0]} rotation={[0, 0, -0.2]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.32]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0.25, 1.55, 0]} rotation={[0, 0, 0.2]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.32]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Lower arms/forearms */}
        <mesh position={[-0.35, 1.25, 0]} rotation={[0, 0, -0.1]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.28]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0.35, 1.25, 0]} rotation={[0, 0, 0.1]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.28]} />
          <meshStandardMaterial color={colors.operatorBlue} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Hands */}
        <mesh position={[-0.42, 1.1, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.045]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.42, 1.1, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.045]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Upper legs - thighs */}
        <mesh position={[-0.12, 0.85, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.06, 0.5]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.85, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.06, 0.5]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Lower legs - shins */}
        <mesh position={[-0.12, 0.45, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.07, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.45, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.07, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Safety boots - larger, more detailed */}
        <mesh position={[-0.12, 0.25, 0.06]} castShadow onClick={onClick}>
          <boxGeometry args={[0.14, 0.14, 0.28]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.25, 0.06]} castShadow onClick={onClick}>
          <boxGeometry args={[0.14, 0.14, 0.28]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Boot soles */}
        <mesh position={[-0.12, 0.18, 0.06]} onClick={onClick}>
          <boxGeometry args={[0.16, 0.04, 0.32]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.18, 0.06]} onClick={onClick}>
          <boxGeometry args={[0.16, 0.04, 0.32]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Safety vest - high-vis yellow-green band */}
        <mesh position={[0, 1.45, 0.105]} onClick={onClick}>
          <boxGeometry args={[0.38, 0.5, 0.01]} />
          <meshStandardMaterial color="#d4ff00" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Reflective strips */}
        <mesh position={[0, 1.6, 0.112]} onClick={onClick}>
          <boxGeometry args={[0.35, 0.03, 0.005]} />
          <meshStandardMaterial color={colors.reflectiveVest} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.3, 0.112]} onClick={onClick}>
          <boxGeometry args={[0.35, 0.03, 0.005]} />
          <meshStandardMaterial color={colors.reflectiveVest} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Tool belt */}
        <mesh position={[0, 1.1, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.22, 0.22, 0.08]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Tools on belt */}
        <mesh position={[0.18, 1.1, 0]} onClick={onClick}>
          <boxGeometry args={[0.03, 0.08, 0.15]} />
          <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* ID badge */}
        <mesh position={[-0.12, 1.65, 0.112]} onClick={onClick}>
          <boxGeometry args={[0.08, 0.12, 0.005]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
        </mesh>
      </group>
    );
  };

  const renderEngineer = () => {
    return (
      <group>
        {/* Torso - proper box body */}
        <mesh position={[0, 1.4, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.36, 0.7, 0.2]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Head with slight face indication */}
        <mesh position={[0, 1.95, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Nose bump for face indication */}
        <mesh position={[0, 1.95, 0.1]} onClick={onClick}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* White hard hat - flattened hemisphere */}
        <mesh position={[0, 2.05, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.14, 16, 8, 0, Math.PI * 2, 0, Math.PI/2]} />
          <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Hard hat brim */}
        <mesh position={[0, 1.98, 0.12]} onClick={onClick}>
          <cylinderGeometry args={[0.17, 0.17, 0.02]} />
          <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Neck */}
        <mesh position={[0, 1.82, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.08]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Upper arms - left arm holding clipboard */}
        <mesh position={[-0.25, 1.55, 0.1]} rotation={[0.3, 0, -0.3]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.32]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0.25, 1.55, 0]} rotation={[0, 0, 0.2]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.32]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Lower arms/forearms */}
        <mesh position={[-0.32, 1.25, 0.2]} rotation={[0.5, 0, -0.2]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.28]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0.35, 1.25, 0]} rotation={[0, 0, 0.1]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.28]} />
          <meshStandardMaterial color={colors.engineerOrange} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Hands */}
        <mesh position={[-0.35, 1.1, 0.3]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.045]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.42, 1.1, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.045]} />
          <meshStandardMaterial color={colors.skinTone} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Clipboard - held in left hand area */}
        <mesh position={[-0.38, 1.15, 0.35]} rotation={[0.3, -0.3, 0]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.005, 0.2]} />
          <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Paper on clipboard */}
        <mesh position={[-0.38, 1.15, 0.36]} rotation={[0.3, -0.3, 0]} onClick={onClick}>
          <boxGeometry args={[0.13, 0.002, 0.18]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Upper legs - thighs */}
        <mesh position={[-0.12, 0.85, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.06, 0.5]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.85, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.06, 0.5]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Lower legs - shins */}
        <mesh position={[-0.12, 0.45, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.07, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.45, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.07, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Safety boots - larger, more detailed */}
        <mesh position={[-0.12, 0.25, 0.06]} castShadow onClick={onClick}>
          <boxGeometry args={[0.14, 0.14, 0.28]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.25, 0.06]} castShadow onClick={onClick}>
          <boxGeometry args={[0.14, 0.14, 0.28]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Boot soles */}
        <mesh position={[-0.12, 0.18, 0.06]} onClick={onClick}>
          <boxGeometry args={[0.16, 0.04, 0.32]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.18, 0.06]} onClick={onClick}>
          <boxGeometry args={[0.16, 0.04, 0.32]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Orange/blue safety vest */}
        <mesh position={[0, 1.45, 0.105]} onClick={onClick}>
          <boxGeometry args={[0.38, 0.5, 0.01]} />
          <meshStandardMaterial color="#ff6600" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Blue accents on vest */}
        <mesh position={[0, 1.55, 0.107]} onClick={onClick}>
          <boxGeometry args={[0.35, 0.08, 0.005]} />
          <meshStandardMaterial color="#0066cc" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Reflective strips */}
        <mesh position={[0, 1.6, 0.112]} onClick={onClick}>
          <boxGeometry args={[0.35, 0.03, 0.005]} />
          <meshStandardMaterial color={colors.reflectiveVest} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.3, 0.112]} onClick={onClick}>
          <boxGeometry args={[0.35, 0.03, 0.005]} />
          <meshStandardMaterial color={colors.reflectiveVest} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* ID badge */}
        <mesh position={[-0.12, 1.65, 0.112]} onClick={onClick}>
          <boxGeometry args={[0.08, 0.12, 0.005]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Engineering tools in pocket */}
        <mesh position={[0.1, 1.35, 0.11]} onClick={onClick}>
          <cylinderGeometry args={[0.005, 0.005, 0.12]} />
          <meshStandardMaterial color="#ffcc00" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.13, 1.35, 0.11]} onClick={onClick}>
          <cylinderGeometry args={[0.005, 0.005, 0.1]} />
          <meshStandardMaterial color="#cc0000" metalness={0.6} roughness={0.3} />
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
        {/* Chassis body: box, yellow #eab308 */}
        <mesh position={[0, 0.4, -0.5]} castShadow onClick={onClick}>
          <boxGeometry args={[1.2, 0.6, 2]} />
          <meshStandardMaterial color="#eab308" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Counterweight: heavy dark box at rear, slightly wider */}
        <mesh position={[0, 0.5, -1.6]} castShadow onClick={onClick}>
          <boxGeometry args={[1.3, 0.8, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Driver compartment: frame (4 posts + roof) */}
        {[-0.5, 0.5].map(x =>
          [-0.4, 1].map(z => (
            <mesh key={`frame-post-${x}-${z}`} position={[x, 1.55, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, 1]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Compartment roof */}
        <mesh position={[0, 1.8, 0.3]} onClick={onClick}>
          <boxGeometry args={[1.2, 0.03, 1.5]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Seat: small box inside compartment */}
        <mesh position={[0, 1.0, 0.2]} castShadow onClick={onClick}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Seat back */}
        <mesh position={[0, 1.3, -0.05]} castShadow onClick={onClick}>
          <boxGeometry args={[0.5, 0.5, 0.1]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Steering column: thin cylinder + small torus (wheel) */}
        <mesh position={[0, 1.2, 0.3]} rotation={[-0.3, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 0.3]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.4} />
        </mesh>
        
        <mesh position={[0, 1.4, 0.4]} rotation={[-0.3, 0, 0]} onClick={onClick}>
          <torusGeometry args={[0.15, 0.02]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Mast: 2 vertical C-channel posts (each = 3 thin boxes) */}
        {[-0.25, 0.25].map(x => (
          <group key={`mast-${x}`}>
            {/* Main vertical post */}
            <mesh position={[x, 2, 1.2]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, 3.5, 0.08]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
            </mesh>
            {/* C-channel flanges */}
            <mesh position={[x + (x > 0 ? -0.04 : 0.04), 2, 1.16]} onClick={onClick}>
              <boxGeometry args={[0.04, 3.5, 0.02]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[x + (x > 0 ? -0.04 : 0.04), 2, 1.24]} onClick={onClick}>
              <boxGeometry args={[0.04, 3.5, 0.02]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
        
        {/* Fork carriage: flat plate between masts */}
        <mesh position={[0, 1.5, 1.24]} castShadow onClick={onClick}>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* 2 Forks: L-shaped (horizontal prong + vertical back plate each) */}
        {[-0.2, 0.2].map(x => (
          <group key={`fork-${x}`}>
            {/* Horizontal prong */}
            <mesh position={[x, 1.2, 1.8]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, 0.04, 1.2]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Vertical back plate */}
            <mesh position={[x, 1.35, 1.28]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, 0.3, 0.04]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
        
        {/* Hydraulic cylinders: 2 thin shiny cylinders along masts */}
        <mesh position={[-0.15, 2.5, 1.05]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 2]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 2.5, 1.05]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 2]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* 4 Wheels: each = dark cylinder (tire, roughness:0.9) + lighter cylinder (hub, metalness:0.8) */}
        {/* Front wheels */}
        <mesh position={[-0.5, 0.25, 1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.25, 0.25, 0.2]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[-0.5, 0.25, 1]} rotation={[Math.PI/2, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        <mesh position={[0.5, 0.25, 1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.25, 0.25, 0.2]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.25, 1]} rotation={[Math.PI/2, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Rear wheels */}
        <mesh position={[-0.5, 0.35, -1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.35, 0.35, 0.25]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[-0.5, 0.35, -1]} rotation={[Math.PI/2, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        <mesh position={[0.5, 0.35, -1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.35, 0.35, 0.25]} />
          <meshStandardMaterial color={colors.blackRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.35, -1]} rotation={[Math.PI/2, 0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Overhead guard: 4 posts + flat frame on top */}
        {[-0.5, 0.5].map(x =>
          [-0.4, 1].map(z => (
            <mesh key={`guard-${x}-${z}`} position={[x, 1.55, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, 1]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
        
        <mesh position={[0, 1.8, 0.3]} onClick={onClick}>
          <boxGeometry args={[1.2, 0.03, 1.5]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Warning beacon: small orange emissive sphere on roof */}
        <mesh position={[0, 1.85, 0.8]} onClick={onClick}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
        </mesh>
        
        {/* Headlights: 2 small white rectangles on front */}
        <mesh position={[-0.3, 0.6, 1.1]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.08, 0.05]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0.3, 0.6, 1.1]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.08, 0.05]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Rear lights: 2 small red rectangles on back */}
        <mesh position={[-0.3, 0.6, -1.7]} onClick={onClick}>
          <boxGeometry args={[0.12, 0.06, 0.03]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0.3, 0.6, -1.7]} onClick={onClick}>
          <boxGeometry args={[0.12, 0.06, 0.03]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Step plate: small box on side for driver step */}
        <mesh position={[-0.7, 0.3, 0.2]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, 0.08, 0.4]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.4} />
        </mesh>
      </group>
    );
  };

  const renderAGV = () => {
    return (
      <group>
        {/* Low flat platform body (box, dark gray with blue accent stripe) */}
        <mesh position={[0, 0.15, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1.2, 0.3, 2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Blue accent stripe */}
        <mesh position={[0, 0.31, 0]} onClick={onClick}>
          <boxGeometry args={[1.15, 0.02, 1.95]} />
          <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.6} />
        </mesh>
        
        {/* 4 mecanum wheels (cylinders at corners, visible underneath) */}
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
        
        {/* LIDAR dome: hemisphere on top center */}
        <mesh position={[0, 0.45, 0]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI/2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* LIDAR dome lens */}
        <mesh position={[0, 0.51, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* 2 navigation cameras: small boxes on front corners */}
        {[-0.3, 0.3].map(x => (
          <mesh key={`camera-${x}`} position={[x, 0.35, 0.9]} castShadow onClick={onClick}>
            <boxGeometry args={[0.06, 0.04, 0.08]} />
            <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        
        {/* Camera lenses */}
        {[-0.3, 0.3].map(x => (
          <mesh key={`lens-${x}`} position={[x, 0.35, 0.94]} onClick={onClick}>
            <cylinderGeometry args={[0.015, 0.015, 0.01]} />
            <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        
        {/* LED strip: thin emissive teal bar running around platform edge */}
        <mesh position={[0, 0.31, 1]} name="ledStrip" onClick={onClick}>
          <boxGeometry args={[1.1, 0.01, 0.01]} />
          <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.31, -1]} onClick={onClick}>
          <boxGeometry args={[1.1, 0.01, 0.01]} />
          <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.6, 0.31, 0]} onClick={onClick}>
          <boxGeometry args={[0.01, 0.01, 1.8]} />
          <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.6, 0.31, 0]} onClick={onClick}>
          <boxGeometry args={[0.01, 0.01, 1.8]} />
          <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.3} />
        </mesh>
        
        {/* Sensor bumper: thin curved box on front edge */}
        <mesh position={[0, 0.12, 1.01]} castShadow onClick={onClick}>
          <boxGeometry args={[1, 0.04, 0.02]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Battery indicator: small rectangles on side (green blocks) */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`battery-${i}`} position={[-0.61, 0.25, -0.4 + i * 0.2]} onClick={onClick}>
            <boxGeometry args={[0.02, 0.06, 0.15]} />
            <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.1} />
          </mesh>
        ))}
        
        {/* Logo plate: small rectangle on top */}
        <mesh position={[0, 0.31, -0.5]} onClick={onClick}>
          <boxGeometry args={[0.3, 0.005, 0.2]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Emergency stop: small red circle on top */}
        <mesh position={[0.4, 0.32, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color={colors.safetyRed} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Antenna for communication */}
        <mesh position={[-0.4, 0.6, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.01, 0.01, 0.25]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Charging contacts on side */}
        {[0, 1].map(i => (
          <mesh key={`contact-${i}`} position={[-0.61, 0.15, -0.1 + i * 0.2]} onClick={onClick}>
            <cylinderGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial color={colors.lightSteel} metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        
        {/* Status lights */}
        <mesh position={[0.2, 0.32, -0.3]} onClick={onClick}>
          <cylinderGeometry args={[0.015, 0.015, 0.01]} />
          <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.35, 0.32, -0.3]} onClick={onClick}>
          <cylinderGeometry args={[0.015, 0.015, 0.01]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
        </mesh>
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
      onClick={onClick}
      onContextMenu={onContextMenu}
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