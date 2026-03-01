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
        const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.02;
        groupRef.current.scale.setScalar(scale);
      } else {
        groupRef.current.scale.setScalar(1);
        
        // Special animations for different node types
        if (node.type === 'conveyor') {
          // Roller animation
          groupRef.current.traverse((child) => {
            if (child.name === 'roller') {
              child.rotation.x = clock.getElapsedTime() * 3;
            }
          });
        } else if (node.type === 'machine') {
          // Status light blinking
          const statusLight = groupRef.current.getObjectByName('statusLight');
          if (statusLight && 'material' in statusLight) {
            const intensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
            (statusLight.material as any).emissiveIntensity = intensity;
          }
        }
      }
    }
  });

  // Industrial color palette
  const colors = {
    machineBody: '#5a6577', // blue-gray
    darkGray: '#4a5568',
    lightSteel: '#9ca3af',
    mediumSteel: '#6b7280',
    safetyYellow: '#eab308',
    safetyRed: '#ef4444',
    safetyGreen: '#22c55e',
    darkRubber: '#1f2937',
    rackBlue: '#2563eb',
    rackOrange: '#f97316',
    forkliftYellow: '#eab308'
  };

  const renderConveyor = () => {
    const length = node.parameters?.length || 5;
    const width = node.parameters?.width || 1;
    const height = 0.8;

    return (
      <group>
        {/* Main frame - left side channel */}
        <mesh position={[-width/2 + 0.05, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, height, length]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Main frame - right side channel */}
        <mesh position={[width/2 - 0.05, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, height, length]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Cross supports underneath */}
        {Array.from({ length: Math.ceil(length / 1.5) }, (_, i) => {
          const z = (i - Math.floor((length / 1.5) / 2)) * 1.5;
          return (
            <mesh key={`cross-${i}`} position={[0, 0.15, z]} castShadow onClick={onClick}>
              <boxGeometry args={[width - 0.1, 0.05, 0.1]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.4} />
            </mesh>
          );
        })}
        
        {/* Roller cylinders - many along the length */}
        {Array.from({ length: Math.floor(length * 2) }, (_, i) => {
          const z = (i - Math.floor(length)) * 0.5;
          return (
            <mesh 
              key={`roller-${i}`} 
              name="roller"
              position={[0, height - 0.05, z]} 
              rotation={[0, 0, Math.PI/2]} 
              castShadow 
              onClick={onClick}
            >
              <cylinderGeometry args={[0.03, 0.03, width - 0.2]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.9} roughness={0.1} />
            </mesh>
          );
        })}
        
        {/* Belt surface (above rollers) */}
        <mesh position={[0, height + 0.02, 0]} onClick={onClick}>
          <boxGeometry args={[width - 0.15, 0.02, length - 0.1]} />
          <meshStandardMaterial color={colors.darkRubber} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Side guide rails */}
        <mesh position={[-width/2 + 0.01, height + 0.15, 0]} onClick={onClick}>
          <boxGeometry args={[0.02, 0.3, length]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[width/2 - 0.01, height + 0.15, 0]} onClick={onClick}>
          <boxGeometry args={[0.02, 0.3, length]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Adjustable legs with foot pads */}
        {[-1, 1].map(x => 
          [-length/2 + 0.5, length/2 - 0.5].map((z, zi) => (
            <group key={`leg-${x}-${zi}`}>
              {/* Leg cylinder */}
              <mesh position={[x * (width/2 - 0.1), 0.25, z]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.03, 0.04, 0.5]} />
                <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Foot pad */}
              <mesh position={[x * (width/2 - 0.1), 0.02, z]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.08, 0.08, 0.04]} />
                <meshStandardMaterial color={colors.darkGray} metalness={0.4} roughness={0.8} />
              </mesh>
            </group>
          ))
        )}
        
        {/* Drive motor housing at one end */}
        <mesh position={[0, height + 0.1, length/2 - 0.3]} castShadow onClick={onClick}>
          <boxGeometry args={[0.4, 0.3, 0.6]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Motor */}
        <mesh position={[0, height + 0.05, length/2 - 0.1]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.08, 0.2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  };

  const renderMachine = () => {
    return (
      <group>
        {/* Main cabinet body */}
        <mesh position={[0, 1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[2.2, 2, 1.6]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Top control section */}
        <mesh position={[0, 2.2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[2.2, 0.4, 1.6]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Front door panel */}
        <mesh position={[1.11, 1, 0]} onClick={onClick}>
          <boxGeometry args={[0.02, 1.5, 1.2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Door handle */}
        <mesh position={[1.12, 1.2, 0.4]} onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 0.15]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Operator panel - angled face */}
        <mesh position={[0.8, 2.1, 0.6]} rotation={[0, 0, -0.2]} castShadow onClick={onClick}>
          <boxGeometry args={[0.6, 0.3, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Control screen */}
        <mesh position={[0.82, 2.1, 0.6]} rotation={[0, 0, -0.2]} onClick={onClick}>
          <boxGeometry args={[0.3, 0.01, 0.2]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Status tower light pole */}
        <mesh position={[0, 2.7, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 0.4]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Status lights - red, yellow, green stack */}
        <mesh position={[0, 2.9, 0]} name="statusLight" onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.08]} />
          <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 3.0, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.08]} />
          <meshStandardMaterial color={colors.safetyYellow} />
        </mesh>
        <mesh position={[0, 3.1, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.08]} />
          <meshStandardMaterial color={colors.safetyRed} />
        </mesh>
        
        {/* Ventilation louvers on side - horizontal slats */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={`louver-${i}`} position={[1.11, 0.5 + i * 0.2, -0.4]} onClick={onClick}>
            <boxGeometry args={[0.01, 0.02, 0.6]} />
            <meshStandardMaterial color={colors.darkGray} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        
        {/* Cable tray on back */}
        <mesh position={[-1.11, 1.5, 0]} onClick={onClick}>
          <boxGeometry args={[0.05, 0.2, 1.4]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Base mounting feet */}
        {[-0.9, 0.9].map(x =>
          [-0.6, 0.6].map(z => (
            <mesh key={`foot-${x}-${z}`} position={[x, 0.05, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.08, 0.08, 0.1]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.4} roughness={0.8} />
            </mesh>
          ))
        )}
        
        {/* Safety interlock indicator */}
        <mesh position={[0.9, 1.8, 0.6]} onClick={onClick}>
          <cylinderGeometry args={[0.03, 0.03, 0.05]} />
          <meshStandardMaterial color={colors.safetyRed} emissive={colors.safetyRed} emissiveIntensity={0.1} />
        </mesh>
      </group>
    );
  };

  const renderPickAndPlace = () => {
    return (
      <group>
        {/* Heavy base plate */}
        <mesh position={[0, 0.08, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.8, 0.8, 0.16]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Base rotation joint */}
        <mesh position={[0, 0.25, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.15, 0.15, 0.3]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* J1 body (main vertical) */}
        <mesh position={[0, 0.7, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.12, 0.18, 0.9]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* J2 shoulder joint */}
        <mesh position={[0, 1.15, 0.1]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Upper arm */}
        <mesh position={[0.6, 1.15, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[1.2, 0.15, 0.15]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* J3 elbow joint */}
        <mesh position={[1.2, 1.15, 0.1]} castShadow onClick={onClick}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Forearm */}
        <mesh position={[1.2, 0.85, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* J4 wrist rotation */}
        <mesh position={[1.2, 0.55, 0.1]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.12]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* J5 wrist bend */}
        <mesh position={[1.2, 0.5, 0.1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.08]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* J6 flange */}
        <mesh position={[1.2, 0.45, 0.1]} onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.03]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* End effector / gripper */}
        <mesh position={[1.2, 0.4, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.6} />
        </mesh>
        
        {/* Gripper fingers */}
        <mesh position={[1.15, 0.36, 0.1]} onClick={onClick}>
          <boxGeometry args={[0.02, 0.08, 0.04]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[1.25, 0.36, 0.1]} onClick={onClick}>
          <boxGeometry args={[0.02, 0.08, 0.04]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Cable bundle on back of arm */}
        <mesh position={[0.6, 1.05, 0.0]} onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 1.2]} />
          <meshStandardMaterial color="#000000" metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Warning labels on base */}
        <mesh position={[0.6, 0.17, 0]} rotation={[-Math.PI/2, 0, 0]} onClick={onClick}>
          <circleGeometry args={[0.08]} />
          <meshStandardMaterial color={colors.safetyYellow} />
        </mesh>
        
        {/* Status indicator on J1 */}
        <mesh position={[0, 1.0, 0.15]} onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 0.02]} />
          <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.2} />
        </mesh>
      </group>
    );
  };

  const renderPalletizer = () => {
    return (
      <group>
        {/* Gantry frame - vertical posts (4 corners) */}
        {[-2, 2].map(x => 
          [-1.5, 1.5].map(z => (
            <mesh key={`post-${x}-${z}`} position={[x, 2.5, z]} castShadow onClick={onClick}>
              <boxGeometry args={[0.15, 5, 0.15]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Top frame beams */}
        <mesh position={[0, 5, 1.5]} onClick={onClick}>
          <boxGeometry args={[4, 0.15, 0.15]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 5, -1.5]} onClick={onClick}>
          <boxGeometry args={[4, 0.15, 0.15]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[2, 5, 0]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.15, 3]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-2, 5, 0]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.15, 3]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Moving X-axis beam */}
        <mesh position={[0, 4.8, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.2, 0.2, 3]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Y-axis carriage */}
        <mesh position={[0, 4.6, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.6, 0.15, 0.2]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Z-axis vertical actuator */}
        <mesh position={[0, 3.8, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 1.6]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Gripper/suction head */}
        <mesh position={[0, 3, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.8, 0.2, 0.8]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.6} />
        </mesh>
        
        {/* Suction cups */}
        {[-0.3, 0.3].map(x =>
          [-0.3, 0.3].map(z => (
            <mesh key={`suction-${x}-${z}`} position={[x, 2.88, z]} onClick={onClick}>
              <cylinderGeometry args={[0.04, 0.04, 0.02]} />
              <meshStandardMaterial color={colors.darkRubber} metalness={0.1} roughness={0.9} />
            </mesh>
          ))
        )}
        
        {/* Guide rails on posts */}
        {[-2, 2].map(x => (
          <mesh key={`rail-${x}`} position={[x, 2.5, 0]} onClick={onClick}>
            <boxGeometry args={[0.05, 5, 0.05]} />
            <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
        
        {/* Control cabinet at base */}
        <mesh position={[2.5, 1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.6, 2, 1]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Cable management */}
        <mesh position={[1.5, 4, 0]} onClick={onClick}>
          <boxGeometry args={[0.1, 0.1, 3]} />
          <meshStandardMaterial color="#000000" metalness={0.1} roughness={0.9} />
        </mesh>
      </group>
    );
  };

  const renderSource = () => {
    return (
      <group>
        {/* Main hopper body */}
        <mesh position={[0, 0.6, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color={colors.safetyGreen} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Tapered funnel top */}
        <mesh position={[0, 1.4, 0]} castShadow onClick={onClick}>
          <coneGeometry args={[0.8, 0.6, 8]} />
          <meshStandardMaterial color={colors.safetyGreen} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Support legs */}
        {[-0.5, 0.5].map(x =>
          [-0.5, 0.5].map(z => (
            <mesh key={`leg-${x}-${z}`} position={[x, 0.25, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.04, 0.04, 0.5]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Output chute */}
        <mesh position={[0, 0.3, 0.8]} castShadow onClick={onClick}>
          <boxGeometry args={[0.4, 0.3, 0.6]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Green indicator light */}
        <mesh position={[0, 1.8, 0]} onClick={onClick}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.3} />
        </mesh>
        
        {/* Vibration motor */}
        <mesh position={[0.7, 0.8, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  };

  const renderSink = () => {
    return (
      <group>
        {/* Collection bin - tapered */}
        <mesh position={[0, 0.5, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.8, 0.6, 1]} />
          <meshStandardMaterial color={colors.safetyRed} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Bin support frame */}
        {[-0.6, 0.6].map(x =>
          [-0.6, 0.6].map(z => (
            <mesh key={`support-${x}-${z}`} position={[x, 0.25, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, 0.5]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Counter display panel */}
        <mesh position={[0.6, 0.8, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, 0.2, 0.05]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* LED display screen */}
        <mesh position={[0.61, 0.8, 0]} onClick={onClick}>
          <boxGeometry args={[0.2, 0.1, 0.01]} />
          <meshStandardMaterial color="#000000" emissive="#00ff00" emissiveIntensity={0.1} />
        </mesh>
        
        {/* Red indicator light */}
        <mesh position={[0, 1.2, 0]} onClick={onClick}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color={colors.safetyRed} emissive={colors.safetyRed} emissiveIntensity={0.2} />
        </mesh>
      </group>
    );
  };

  const renderBuffer = () => {
    return (
      <group>
        {/* Table top */}
        <mesh position={[0, 0.8, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[2.5, 0.08, 1.8]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Table legs */}
        {[-1.1, 1.1].map(x => 
          [-0.8, 0.8].map(z => (
            <mesh key={`leg-${x}-${z}`} position={[x, 0.4, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.04, 0.04, 0.8]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Cross bracing between legs */}
        <mesh position={[0, 0.2, 0.8]} onClick={onClick}>
          <boxGeometry args={[2.2, 0.03, 0.03]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.2, -0.8]} onClick={onClick}>
          <boxGeometry args={[2.2, 0.03, 0.03]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Yellow safety guide rails */}
        <mesh position={[0, 0.95, 0.85]} onClick={onClick}>
          <boxGeometry args={[2.5, 0.3, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.95, -0.85]} onClick={onClick}>
          <boxGeometry args={[2.5, 0.3, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Lane dividers */}
        {[-0.5, 0.5].map(z => (
          <mesh key={`divider-${z}`} position={[0, 0.88, z]} onClick={onClick}>
            <boxGeometry args={[2.4, 0.16, 0.02]} />
            <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
      </group>
    );
  };

  const renderRouter = () => {
    return (
      <group>
        {/* Main input section */}
        <mesh position={[0, 0.15, -1]} castShadow onClick={onClick}>
          <boxGeometry args={[1, 0.3, 2]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Left output branch */}
        <mesh position={[-0.9, 0.15, 0.9]} rotation={[0, Math.PI/4, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1, 0.3, 1.8]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Right output branch */}
        <mesh position={[0.9, 0.15, 0.9]} rotation={[0, -Math.PI/4, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1, 0.3, 1.8]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Diverter mechanism at junction */}
        <mesh position={[0, 0.4, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, 0.2, 0.6]} />
          <meshStandardMaterial color={colors.machineBody} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Diverter blade */}
        <mesh position={[0, 0.35, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[0.8, 0.05, 0.1]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.6} />
        </mesh>
        
        {/* Pneumatic actuator */}
        <mesh position={[0, 0.6, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.3]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Support legs */}
        {[-0.4, 0.4].map(x =>
          [-0.9, 0.9].map(z => (
            <mesh key={`leg-${x}-${z}`} position={[x, 0.08, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, 0.16]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
      </group>
    );
  };

  const renderGeometry = () => {
    switch (node.type) {
      case 'conveyor':
        return renderConveyor();
      case 'machine':
        return renderMachine();
      case 'pick-and-place':
        return renderPickAndPlace();
      case 'palletizer':
        return renderPalletizer();
      case 'source':
        return renderSource();
      case 'sink':
        return renderSink();
      case 'buffer':
        return renderBuffer();
      case 'router':
        return renderRouter();
      default:
        // Default fallback - simple colored box
        return (
          <mesh position={[0, 0.5, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={colors.machineBody} />
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
          <edgesGeometry args={[new THREE.BoxGeometry(3, 3, 3)]} />
          <lineBasicMaterial color="#06b6d4" linewidth={3} />
        </lineSegments>
      )}
    </group>
  );
}