'use client';

import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { ProcessNode } from '../../_store/editorStore';
import ConveyorComponent from './ConveyorComponent';

interface Props {
  node: ProcessNode;
  onClick: (event: any) => void;
  onContextMenu?: (event: any) => void;
  isSelected: boolean;
}

// Belt Conveyor GLB Model Component
function BeltConveyorModel({ onClick }: { onClick: (event: any) => void }) {
  try {
    const { scene } = useGLTF('/models/BELT%20CONVEYOR%20r.glb');
    const model = scene.clone();
    
    // Scale and position to fit (conveyors are typically 1-3m long, ~0.6m wide, ~0.8m tall)
    // Try different scales until model looks right for a ~2m long conveyor
    model.scale.set(0.01, 0.01, 0.01);
    
    // Center the model at origin
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y += 0.4; // Lift to ground level
    
    return <primitive object={model} onClick={onClick} />;
  } catch (error) {
    // Fallback to old model if new one fails
    try {
      const { scene } = useGLTF('/models/belt-conveyor/scene.gltf');
      const model = scene.clone();
      model.scale.set(0.01, 0.01, 0.01);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y += 0.4;
      return <primitive object={model} onClick={onClick} />;
    } catch {
      // Final fallback to procedural geometry
      return (
        <group>
          <mesh position={[0, 0.8 - 0.05, 2.5]} rotation={[0, 0, Math.PI/2]} castShadow onClick={onClick}>
            <cylinderGeometry args={[0.08, 0.08, 0.9]} />
            <meshStandardMaterial color="#8a8a9a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.8 - 0.05, -2.5]} rotation={[0, 0, Math.PI/2]} castShadow onClick={onClick}>
            <cylinderGeometry args={[0.08, 0.08, 0.9]} />
            <meshStandardMaterial color="#8a8a9a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.8 + 0.01, 0]} name="belt" castShadow onClick={onClick}>
            <boxGeometry args={[0.9, 0.02, 5]} />
            <meshStandardMaterial color="#1f2937" metalness={0.1} roughness={0.9} />
          </mesh>
        </group>
      );
    }
  }
}

// Roller Conveyor GLB Model Component
function RollerConveyorModel({ onClick }: { onClick: (event: any) => void }) {
  try {
    const { scene } = useGLTF('/models/ROLLER%20CONVEYOR.glb');
    const model = scene.clone();
    
    // Scale to fit a ~2m long conveyor
    model.scale.set(0.01, 0.01, 0.01);
    
    // Center the model at origin
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y += 0.4; // Lift to ground level
    
    return <primitive object={model} onClick={onClick} />;
  } catch (error) {
    // Fallback to procedural roller geometry
    const length = 5;
    const width = 1;
    const rollerCount = Math.floor(length * 3);
    const rollerSpacing = length / rollerCount;
    return (
      <group>
        {Array.from({ length: rollerCount }, (_, i) => {
          const z = (i - (rollerCount - 1) / 2) * rollerSpacing;
          return (
            <mesh 
              key={`roller-${i}`} 
              name="roller"
              position={[0, 0.8 - 0.05, z]} 
              rotation={[0, 0, Math.PI/2]} 
              castShadow 
              onClick={onClick}
            >
              <cylinderGeometry args={[0.025, 0.025, width - 0.2]} />
              <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
            </mesh>
          );
        })}
        <mesh position={[width/4, 0.8 - 0.2, 0]} onClick={onClick}>
          <boxGeometry args={[0.02, 0.02, length - 0.2]} />
          <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-width/4, 0.8 - 0.2, 0]} onClick={onClick}>
          <boxGeometry args={[0.02, 0.02, length - 0.2]} />
          <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    );
  }
}

export default function ProcessNodeComponent({ node, onClick, onContextMenu, isSelected }: Props) {
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
    const conveyorType = node.parameters?.type || 'roller';
    const height = 0.8;

    // Common frame structure
    const frameElements = (
      <group>
        {/* Left side C-channel frame */}
        <group position={[-width/2 + 0.05, height/2, 0]}>
          <mesh position={[0, -height/4, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[0.1, height/2, length]} />
            <meshStandardMaterial color="#8a8a9a" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.025, height/4 - 0.025, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[0.05, 0.05, length]} />
            <meshStandardMaterial color="#8a8a9a" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
        
        {/* Right side C-channel frame */}
        <group position={[width/2 - 0.05, height/2, 0]}>
          <mesh position={[0, -height/4, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[0.1, height/2, length]} />
            <meshStandardMaterial color="#8a8a9a" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[-0.025, height/4 - 0.025, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[0.05, 0.05, length]} />
            <meshStandardMaterial color="#8a8a9a" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
        
        {/* Cross braces */}
        {Array.from({ length: Math.ceil(length / 1.5) }, (_, i) => {
          const z = (i - Math.floor((length / 1.5) / 2)) * 1.5;
          return (
            <mesh key={`cross-${i}`} position={[0, 0.15, z]} castShadow onClick={onClick}>
              <boxGeometry args={[width - 0.1, 0.05, 0.1]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.4} />
            </mesh>
          );
        })}
        
        {/* Adjustable legs with adjustment rings and foot pads */}
        {[-1, 1].map(x => 
          [-length/2 + 0.5, length/2 - 0.5].map((z, zi) => (
            <group key={`leg-${x}-${zi}`}>
              <mesh position={[x * (width/2 - 0.1), 0.3, z]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.03, 0.04, 0.6]} />
                <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[x * (width/2 - 0.1), 0.15, z]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.045, 0.045, 0.05]} />
                <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.5} />
              </mesh>
              <mesh position={[x * (width/2 - 0.1), 0.02, z]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.08, 0.08, 0.04]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.9} />
              </mesh>
            </group>
          ))
        )}
        
        {/* Side guide rails */}
        <mesh position={[-width/2 + 0.01, height + 0.15, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.02, 0.3, length]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[width/2 - 0.01, height + 0.15, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.02, 0.3, length]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
      </group>
    );

    // Drive motor assembly
    const driveMotor = (
      <group position={[0, height + 0.1, length/2 - 0.3]}>
        <mesh castShadow onClick={onClick}>
          <boxGeometry args={[0.4, 0.3, 0.6]} />
          <meshStandardMaterial color="#2d3a4a" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.05, 0.1]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.08, 0.2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.05, -0.2]} castShadow onClick={onClick}>
          <boxGeometry args={[0.25, 0.2, 0.25]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.21, 0, 0]} onClick={onClick}>
          <boxGeometry args={[0.01, 0.1, 0.15]} />
          <meshStandardMaterial color="#e5e5e5" metalness={0.1} roughness={0.7} />
        </mesh>
      </group>
    );



    // Type-specific conveying surfaces
    let conveyingSurface;
    switch (conveyorType) {
      case 'belt':
        // Use new GLB model first, with fallbacks
        conveyingSurface = (
          <Suspense fallback={
            <group>
              <mesh position={[0, height - 0.05, length/2]} rotation={[0, 0, Math.PI/2]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.08, 0.08, width - 0.1]} />
                <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, height - 0.05, -length/2]} rotation={[0, 0, Math.PI/2]} castShadow onClick={onClick}>
                <cylinderGeometry args={[0.08, 0.08, width - 0.1]} />
                <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, height + 0.01, 0]} name="belt" castShadow onClick={onClick}>
                <boxGeometry args={[width - 0.1, 0.02, length]} />
                <meshStandardMaterial color={colors.darkRubber} metalness={0.1} roughness={0.9} />
              </mesh>
            </group>
          }>
            <BeltConveyorModel onClick={onClick} />
          </Suspense>
        );
        break;
        
      case 'roller':
        // Use new GLB model for roller conveyor
        conveyingSurface = (
          <Suspense fallback={
            <group>
              {Array.from({ length: Math.floor(length * 3) }, (_, i) => {
                const z = (i - (Math.floor(length * 3) - 1) / 2) * (length / Math.floor(length * 3));
                return (
                  <mesh 
                    key={`roller-${i}`} 
                    name="roller"
                    position={[0, height - 0.05, z]} 
                    rotation={[0, 0, Math.PI/2]} 
                    castShadow 
                    onClick={onClick}
                  >
                    <cylinderGeometry args={[0.025, 0.025, width - 0.2]} />
                    <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
                  </mesh>
                );
              })}
              <mesh position={[width/4, height - 0.2, 0]} onClick={onClick}>
                <boxGeometry args={[0.02, 0.02, length - 0.2]} />
                <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[-width/4, height - 0.2, 0]} onClick={onClick}>
                <boxGeometry args={[0.02, 0.02, length - 0.2]} />
                <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          }>
            <RollerConveyorModel onClick={onClick} />
          </Suspense>
        );
        break;
        
      case 'chain':
        const slatCount = Math.floor(length * 2);
        const slatSpacing = length / slatCount;
        conveyingSurface = (
          <group>
            <mesh position={[width/4, height - 0.05, length/2]} rotation={[0, 0, Math.PI/2]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.06, 0.06, 0.04]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-width/4, height - 0.05, length/2]} rotation={[0, 0, Math.PI/2]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.06, 0.06, 0.04]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[width/4, height - 0.02, 0]} name="chain" onClick={onClick}>
              <boxGeometry args={[0.03, 0.02, length]} />
              <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[-width/4, height - 0.02, 0]} name="chain" onClick={onClick}>
              <boxGeometry args={[0.03, 0.02, length]} />
              <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.3} />
            </mesh>
            {Array.from({ length: slatCount }, (_, i) => {
              const z = (i - (slatCount - 1) / 2) * slatSpacing;
              return (
                <mesh key={`slat-${i}`} position={[0, height + 0.01, z]} castShadow onClick={onClick}>
                  <boxGeometry args={[width - 0.15, 0.02, 0.1]} />
                  <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
                </mesh>
              );
            })}
          </group>
        );
        break;
        
      case 'modular-belt':
        const segmentCount = Math.floor(length * 4);
        const segmentLength = length / segmentCount;
        conveyingSurface = (
          <group>
            <mesh position={[0, height - 0.05, length/2]} rotation={[0, 0, Math.PI/2]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.08, 0.08, width - 0.1]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, height - 0.05, -length/2]} rotation={[0, 0, Math.PI/2]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.08, 0.08, width - 0.1]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
            </mesh>
            {Array.from({ length: segmentCount }, (_, i) => {
              const z = (i - (segmentCount - 1) / 2) * segmentLength;
              return (
                <mesh key={`segment-${i}`} position={[0, height + 0.01, z]} name="belt" castShadow onClick={onClick}>
                  <boxGeometry args={[width - 0.1, 0.02, segmentLength - 0.01]} />
                  <meshStandardMaterial 
                    color={i % 2 === 0 ? colors.darkRubber : '#2a2a3a'} 
                    metalness={0.1} 
                    roughness={0.9}
                  />
                </mesh>
              );
            })}
          </group>
        );
        break;
    }

    return (
      <group>
        {frameElements}
        {conveyingSurface}
        {driveMotor}
        
        {/* Connection ports for snapping */}
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
  };

  const renderMachine = () => {
    const machineType = node.parameters?.type || 'cnc';
    
    // Common machine base structure
    const baseMachine = (
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
        <mesh position={[1.11, 1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.02, 1.5, 1.2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Door frame */}
        <mesh position={[1.11, 1, 0.61]} onClick={onClick}>
          <boxGeometry args={[0.03, 1.52, 0.02]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[1.11, 1, -0.61]} onClick={onClick}>
          <boxGeometry args={[0.03, 1.52, 0.02]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[1.11, 1.76, 0]} onClick={onClick}>
          <boxGeometry args={[0.03, 0.02, 1.22]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
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
        
        {/* Screen bezel */}
        <mesh position={[0.815, 2.1, 0.6]} rotation={[0, 0, -0.2]} onClick={onClick}>
          <boxGeometry args={[0.32, 0.015, 0.22]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Status tower light pole */}
        <mesh position={[0, 2.7, 0]} castShadow onClick={onClick}>
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
        <mesh position={[-1.11, 1.5, 0]} castShadow onClick={onClick}>
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
        
        {/* Emergency stop button */}
        <mesh position={[0.6, 2.05, 0.81]} onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color={colors.safetyRed} emissive={colors.safetyRed} emissiveIntensity={0.2} />
        </mesh>
        
        {/* Nameplate */}
        <mesh position={[1.11, 0.8, 0]} onClick={onClick}>
          <boxGeometry args={[0.005, 0.15, 0.3]} />
          <meshStandardMaterial color="#e5e5e5" metalness={0.1} roughness={0.7} />
        </mesh>
      </group>
    );

    // Machine-specific additions
    let specificFeatures;
    switch (machineType) {
      case 'cnc':
        specificFeatures = (
          <group>
            {/* Spindle housing on top */}
            <mesh position={[0, 2.6, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.15, 0.15, 0.3]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Tool changer */}
            <mesh position={[-0.8, 2.5, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.12, 0.12, 0.4]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* Coolant lines */}
            <mesh position={[0.4, 2.4, 0.4]} onClick={onClick}>
              <cylinderGeometry args={[0.01, 0.01, 0.6]} />
              <meshStandardMaterial color="#0066cc" metalness={0.6} roughness={0.3} />
            </mesh>
            
            {/* Chip conveyor */}
            <mesh position={[0, 0.1, -1]} onClick={onClick}>
              <boxGeometry args={[1.5, 0.1, 0.3]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.5} roughness={0.6} />
            </mesh>
          </group>
        );
        break;
        
      case 'assembly':
        specificFeatures = (
          <group>
            {/* Assembly fixtures */}
            <mesh position={[-0.5, 2.5, 0.3]} castShadow onClick={onClick}>
              <boxGeometry args={[0.3, 0.2, 0.3]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0.5, 2.5, 0.3]} castShadow onClick={onClick}>
              <boxGeometry args={[0.3, 0.2, 0.3]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
            </mesh>
            
            {/* Pneumatic actuators */}
            <mesh position={[0, 2.6, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.06, 0.06, 0.4]} />
              <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Air lines */}
            <mesh position={[-0.7, 2.3, 0]} onClick={onClick}>
              <cylinderGeometry args={[0.008, 0.008, 0.8]} />
              <meshStandardMaterial color="#ffff00" metalness={0.3} roughness={0.7} />
            </mesh>
            
            {/* Parts feeder */}
            <mesh position={[-1, 2.1, 0.5]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.2, 0.15, 0.3]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        );
        break;
        
      case 'inspection':
        specificFeatures = (
          <group>
            {/* Camera/vision system */}
            <mesh position={[0, 2.7, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.08, 0.08, 0.15]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.1} />
            </mesh>
            
            {/* Lens */}
            <mesh position={[0, 2.7, 0.08]} onClick={onClick}>
              <cylinderGeometry args={[0.04, 0.04, 0.02]} />
              <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.05} />
            </mesh>
            
            {/* LED ring lights */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const x = Math.cos(angle) * 0.1;
              const z = Math.sin(angle) * 0.1;
              return (
                <mesh key={`led-${i}`} position={[x, 2.65, z]} onClick={onClick}>
                  <cylinderGeometry args={[0.01, 0.01, 0.02]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
                </mesh>
              );
            })}
            
            {/* Measurement probe */}
            <mesh position={[0.3, 2.4, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.02, 0.02, 0.3]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Inspection table */}
            <mesh position={[0, 2.15, 0]} onClick={onClick}>
              <cylinderGeometry args={[0.4, 0.4, 0.05]} />
              <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
            </mesh>
          </group>
        );
        break;
        
      case 'packaging':
        specificFeatures = (
          <group>
            {/* Sealing bars */}
            <mesh position={[0, 2.6, 0.4]} castShadow onClick={onClick}>
              <boxGeometry args={[0.6, 0.05, 0.05]} />
              <meshStandardMaterial color="#cc6600" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.6, -0.4]} castShadow onClick={onClick}>
              <boxGeometry args={[0.6, 0.05, 0.05]} />
              <meshStandardMaterial color="#cc6600" metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* Film roller */}
            <mesh position={[-0.8, 2.8, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.1, 0.1, 0.8]} />
              <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.6} />
            </mesh>
            
            {/* Cutting blade */}
            <mesh position={[0.6, 2.5, 0]} onClick={onClick}>
              <boxGeometry args={[0.02, 0.3, 0.6]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* Label dispenser */}
            <mesh position={[0, 2.8, 0.6]} castShadow onClick={onClick}>
              <boxGeometry args={[0.3, 0.15, 0.2]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
            </mesh>
            
            {/* Conveyor integration */}
            <mesh position={[0, 2.2, -0.8]} castShadow onClick={onClick}>
              <boxGeometry args={[1.8, 0.1, 0.3]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        );
        break;
    }

    return (
      <group>
        {baseMachine}
        {specificFeatures}
        
        {/* Connection ports for snapping */}
        <mesh position={[0, 0.5, -1]} onClick={onClick}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial 
            color="#22c55e" 
            emissive="#22c55e" 
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        <mesh position={[0, 0.5, 1]} onClick={onClick}>
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
  };

  const renderPickAndPlace = () => {
    return (
      <group>
        {/* Heavy base plate */}
        <mesh position={[0, 0.08, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.8, 0.8, 0.16]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Base rotation joint - J1 housing */}
        <mesh position={[0, 0.25, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.15, 0.15, 0.3]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* J1-J2 shoulder housing */}
        <mesh position={[0, 0.7, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.25, 0.3, 0.2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Upper arm - long tapered box, orange */}
        <mesh position={[0.6, 1.15, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[1.2, 0.15, 0.15]} />
          <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* J2-J3 elbow joint */}
        <mesh position={[1.2, 1.15, 0.1]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.08, 0.08, 0.12]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Forearm - thinner box, orange */}
        <mesh position={[1.2, 0.85, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* J4-J5 wrist assembly - small cylinders */}
        <mesh position={[1.2, 0.55, 0.1]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.12]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
        </mesh>
        
        <mesh position={[1.2, 0.5, 0.1]} rotation={[Math.PI/2, 0, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.08]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* J6 flange - thin disk */}
        <mesh position={[1.2, 0.45, 0.1]} onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, 0.03]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Gripper mounting plate */}
        <mesh position={[1.2, 0.4, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[0.12, 0.04, 0.12]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Gripper fingers - 2 parallel finger bars */}
        <mesh position={[1.15, 0.36, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[0.02, 0.08, 0.04]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[1.25, 0.36, 0.1]} castShadow onClick={onClick}>
          <boxGeometry args={[0.02, 0.08, 0.04]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Cable harness along back of arm - series of dark cylinders */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={`cable-${i}`} position={[0.15 + i * 0.13, 1.05 - i * 0.05, -0.05]} onClick={onClick}>
            <cylinderGeometry args={[0.015, 0.015, 0.1]} />
            <meshStandardMaterial color="#000000" metalness={0.1} roughness={0.9} />
          </mesh>
        ))}
        
        {/* Controller cabinet next to base - separate box, dark gray */}
        <mesh position={[1.5, 1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.6, 2, 0.8]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Cabinet door */}
        <mesh position={[1.81, 1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.02, 1.8, 0.7]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Safety fence - 4 yellow posts at corners */}
        {[-2, 2].map(x =>
          [-2, 2].map(z => (
            <mesh key={`fence-post-${x}-${z}`} position={[x, 0.75, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.04, 0.04, 1.5]} />
              <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
            </mesh>
          ))
        )}
        
        {/* Yellow horizontal bars connecting fence posts */}
        <mesh position={[0, 1.2, 2]} onClick={onClick}>
          <boxGeometry args={[4, 0.05, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.2, -2]} onClick={onClick}>
          <boxGeometry args={[4, 0.05, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[2, 1.2, 0]} onClick={onClick}>
          <boxGeometry args={[0.05, 0.05, 4]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[-2, 1.2, 0]} onClick={onClick}>
          <boxGeometry args={[0.05, 0.05, 4]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Mid-level fence bars */}
        <mesh position={[0, 0.6, 2]} onClick={onClick}>
          <boxGeometry args={[4, 0.05, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.6, -2]} onClick={onClick}>
          <boxGeometry args={[4, 0.05, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[2, 0.6, 0]} onClick={onClick}>
          <boxGeometry args={[0.05, 0.05, 4]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[-2, 0.6, 0]} onClick={onClick}>
          <boxGeometry args={[0.05, 0.05, 4]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
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
    const itemType = node.parameters?.itemType || 'box';
    
    // Item-specific preview in hopper area
    let itemPreview;
    switch (itemType) {
      case 'box':
        itemPreview = (
          <mesh position={[0, 1.6, 0]} onClick={onClick}>
            <boxGeometry args={[0.25, 0.25, 0.25]} />
            <meshStandardMaterial color="#D2691E" metalness={0.1} roughness={0.8} />
          </mesh>
        );
        break;
      case 'tote':
        itemPreview = (
          <mesh position={[0, 1.6, 0]} onClick={onClick}>
            <boxGeometry args={[0.35, 0.2, 0.3]} />
            <meshStandardMaterial color="#4169E1" metalness={0.3} roughness={0.6} />
          </mesh>
        );
        break;
      case 'pallet':
        itemPreview = (
          <group position={[0, 1.5, 0]}>
            <mesh onClick={onClick}>
              <boxGeometry args={[0.4, 0.06, 0.32]} />
              <meshStandardMaterial color="#8B4513" metalness={0.1} roughness={0.9} />
            </mesh>
          </group>
        );
        break;
      case 'bottle':
        itemPreview = (
          <mesh position={[0, 1.6, 0]} onClick={onClick}>
            <cylinderGeometry args={[0.04, 0.04, 0.2]} />
            <meshStandardMaterial color="#228B22" metalness={0.8} roughness={0.1} transparent opacity={0.8} />
          </mesh>
        );
        break;
      case 'bag':
        itemPreview = (
          <mesh position={[0, 1.6, 0]} onClick={onClick}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#FF6347" metalness={0.1} roughness={0.7} />
          </mesh>
        );
        break;
      case 'drum':
        itemPreview = (
          <mesh position={[0, 1.6, 0]} onClick={onClick}>
            <cylinderGeometry args={[0.15, 0.15, 0.28]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
          </mesh>
        );
        break;
      default:
        itemPreview = (
          <mesh position={[0, 1.6, 0]} onClick={onClick}>
            <boxGeometry args={[0.25, 0.25, 0.25]} />
            <meshStandardMaterial color="#D2691E" metalness={0.1} roughness={0.8} />
          </mesh>
        );
    }

    return (
      <group>
        {/* Base cabinet - industrial steel */}
        <mesh position={[0, 0.6, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1.4, 1.2, 1.0]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Top hopper section - trapezoidal funnel */}
        <mesh position={[0, 1.4, 0]} castShadow onClick={onClick}>
          <coneGeometry args={[0.6, 0.6, 8]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Output chute - small conveyor section */}
        <mesh position={[0, 0.35, 0.7]} castShadow onClick={onClick}>
          <boxGeometry args={[0.6, 0.3, 0.4]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Control panel - angled face */}
        <mesh position={[0.5, 1.1, 0.3]} rotation={[0, -0.3, -0.15]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, 0.25, 0.08]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Screen area */}
        <mesh position={[0.51, 1.1, 0.3]} rotation={[0, -0.3, -0.15]} onClick={onClick}>
          <boxGeometry args={[0.18, 0.01, 0.12]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Status light tower */}
        <mesh position={[0, 1.9, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.015, 0.015, 0.25]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Status lights */}
        <mesh position={[0, 2.02, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.05]} />
          <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 2.08, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} />
        </mesh>
        <mesh position={[0, 2.14, 0]} onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.05]} />
          <meshStandardMaterial color={colors.safetyRed} />
        </mesh>
        
        {/* Item counter display */}
        <mesh position={[-0.4, 1.2, 0.51]} castShadow onClick={onClick}>
          <boxGeometry args={[0.2, 0.12, 0.04]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Display screen */}
        <mesh position={[-0.4, 1.2, 0.53]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.01, 0.08]} />
          <meshStandardMaterial color="#003300" emissive="#00ff00" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Support legs */}
        {[-0.5, 0.5].map(x =>
          [-0.3, 0.3].map(z => (
            <mesh key={`leg-${x}-${z}`} position={[x, 0.3, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.025, 0.025, 0.6]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.7} />
            </mesh>
          ))
        )}
        
        {/* Vibration motor */}
        <mesh position={[0.6, 0.8, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.05, 0.05, 0.15]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Motor mounting bracket */}
        <mesh position={[0.55, 0.8, 0]} onClick={onClick}>
          <boxGeometry args={[0.08, 0.08, 0.05]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {itemPreview}
        
        {/* Connection port - output only */}
        <mesh position={[0, 0.5, 1.1]} onClick={onClick}>
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
  };

  const renderSink = () => {
    return (
      <group>
        {/* Large collection bin - 5 faces (open top) with slight outward taper */}
        <mesh position={[0, 0.5, -0.4]} castShadow onClick={onClick}>
          <boxGeometry args={[1.4, 0.8, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.5, 0.4]} castShadow onClick={onClick}>
          <boxGeometry args={[1.4, 0.8, 0.05]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[-0.65, 0.5, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.05, 0.8, 0.8]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.65, 0.5, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.05, 0.8, 0.8]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1.4, 0.05, 0.8]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Bin liner edge - thin lip around top */}
        <mesh position={[0, 0.91, 0]} onClick={onClick}>
          <boxGeometry args={[1.44, 0.02, 0.84]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Support frame - 4 angled legs */}
        {[-0.6, 0.6].map(x =>
          [-0.35, 0.35].map(z => (
            <mesh key={`leg-${x}-${z}`} position={[x, 0.35, z]} rotation={[0, 0, x > 0 ? -0.1 : 0.1]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.025, 0.025, 0.7]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.7} />
            </mesh>
          ))
        )}
        
        {/* Sensor arch - two posts + top bar over input area */}
        <mesh position={[-0.4, 1.2, -0.6]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 0.6]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.4, 1.2, -0.6]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 0.6]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.5, -0.6]} castShadow onClick={onClick}>
          <boxGeometry args={[0.8, 0.04, 0.04]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Sensor beams */}
        <mesh position={[-0.2, 1.4, -0.6]} onClick={onClick}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
          <meshStandardMaterial color={colors.safetyRed} emissive={colors.safetyRed} emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.2, 1.4, -0.6]} onClick={onClick}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
          <meshStandardMaterial color={colors.safetyRed} emissive={colors.safetyRed} emissiveIntensity={0.4} />
        </mesh>
        
        {/* Counter display panel */}
        <mesh position={[0.8, 1.0, 0]} rotation={[0, -0.3, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, 0.2, 0.05]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Digital display screen */}
        <mesh position={[0.81, 1.0, 0]} rotation={[0, -0.3, 0]} onClick={onClick}>
          <boxGeometry args={[0.2, 0.01, 0.12]} />
          <meshStandardMaterial color="#000000" emissive="#00ff00" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Status light */}
        <mesh position={[0, 1.6, -0.6]} onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.05]} />
          <meshStandardMaterial color={colors.safetyGreen} emissive={colors.safetyGreen} emissiveIntensity={0.3} />
        </mesh>
        
        {/* Safety warning signs */}
        <mesh position={[0.65, 0.7, 0]} rotation={[0, -Math.PI/2, 0]} onClick={onClick}>
          <boxGeometry args={[0.15, 0.15, 0.005]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Connection port - input only */}
        <mesh position={[0, 0.5, -0.8]} onClick={onClick}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial 
            color="#22c55e" 
            emissive="#22c55e" 
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
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

  const renderSpiralConveyor = () => {
    const height = node.parameters?.height || 5;
    const diameter = node.parameters?.diameter || 4;
    const direction = node.parameters?.direction || 'up';
    const spiralTurns = height / 2;
    const beltSegments = 30;

    return (
      <group>
        {/* Central column */}
        <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.15, 0.15, height]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Base support structure - ring with legs */}
        <mesh position={[0, 0.1, 0]} castShadow onClick={onClick}>
          <torusGeometry args={[diameter/3, 0.1]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Support legs */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * diameter/3;
          const z = Math.sin(angle) * diameter/3;
          return (
            <mesh key={`leg-${i}`} position={[x, 0.3, z]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.04, 0.04, 0.6]} />
              <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          );
        })}
        
        {/* Helical belt surface - spiral of belt segments */}
        {Array.from({ length: beltSegments }, (_, i) => {
          const t = i / (beltSegments - 1);
          const spiralHeight = direction === 'up' ? t * height : (1 - t) * height;
          const angle = t * spiralTurns * Math.PI * 2;
          const radius = diameter / 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const nextAngle = ((i + 1) / (beltSegments - 1)) * spiralTurns * Math.PI * 2;
          const rotY = nextAngle - angle;
          const tiltAngle = Math.atan2(height / beltSegments, 2 * Math.PI * radius / beltSegments);
          
          return (
            <mesh 
              key={`belt-${i}`} 
              position={[x, spiralHeight, z]} 
              rotation={[0, angle, direction === 'up' ? tiltAngle : -tiltAngle]} 
              castShadow 
              onClick={onClick}
            >
              <boxGeometry args={[0.6, 0.02, 0.4]} />
              <meshStandardMaterial color={colors.darkRubber} metalness={0.1} roughness={0.9} />
            </mesh>
          );
        })}
        
        {/* Guard rails following the spiral */}
        {Array.from({ length: beltSegments }, (_, i) => {
          const t = i / (beltSegments - 1);
          const spiralHeight = direction === 'up' ? t * height : (1 - t) * height;
          const angle = t * spiralTurns * Math.PI * 2;
          const radius = diameter / 2 + 0.4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <mesh 
              key={`guard-${i}`} 
              position={[x, spiralHeight + 0.15, z]} 
              rotation={[0, angle, 0]} 
              onClick={onClick}
            >
              <cylinderGeometry args={[0.015, 0.015, 0.3]} />
              <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
            </mesh>
          );
        })}
        
        {/* Drive motor at base */}
        <mesh position={[0, 0.3, diameter/2 + 0.3]} castShadow onClick={onClick}>
          <boxGeometry args={[0.4, 0.3, 0.6]} />
          <meshStandardMaterial color="#2d3a4a" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Connection ports */}
        <mesh position={[0, 0.2, diameter/2 + 0.8]} onClick={onClick}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial 
            color="#22c55e" 
            emissive="#22c55e" 
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        <mesh position={[0, height - 0.2, diameter/2 + 0.8]} onClick={onClick}>
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
  };

  const renderVerticalLifter = () => {
    const height = node.parameters?.height || 3;
    
    return (
      <group>
        {/* 4 corner posts forming frame */}
        {[-0.8, 0.8].map(x =>
          [-0.8, 0.8].map(z => (
            <mesh key={`post-${x}-${z}`} position={[x, height/2, z]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, height, 0.08]} />
              <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Top cross beams */}
        <mesh position={[0, height - 0.05, 0.8]} onClick={onClick}>
          <boxGeometry args={[1.6, 0.08, 0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, height - 0.05, -0.8]} onClick={onClick}>
          <boxGeometry args={[1.6, 0.08, 0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.8, height - 0.05, 0]} onClick={onClick}>
          <boxGeometry args={[0.08, 0.08, 1.6]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.8, height - 0.05, 0]} onClick={onClick}>
          <boxGeometry args={[0.08, 0.08, 1.6]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Bottom cross beams */}
        <mesh position={[0, 0.05, 0.8]} onClick={onClick}>
          <boxGeometry args={[1.6, 0.08, 0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.05, -0.8]} onClick={onClick}>
          <boxGeometry args={[1.6, 0.08, 0.08]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Vertical guide rails */}
        <mesh position={[-0.75, height/2, 0]} onClick={onClick}>
          <boxGeometry args={[0.04, height - 0.2, 0.04]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.75, height/2, 0]} onClick={onClick}>
          <boxGeometry args={[0.04, height - 0.2, 0.04]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Platform at mid-height */}
        <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1.4, 0.08, 1.4]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Safety edges on platform */}
        <mesh position={[0, height/2 + 0.05, 0.71]} onClick={onClick}>
          <boxGeometry args={[1.4, 0.02, 0.02]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0, height/2 + 0.05, -0.71]} onClick={onClick}>
          <boxGeometry args={[1.4, 0.02, 0.02]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0.71, height/2 + 0.05, 0]} onClick={onClick}>
          <boxGeometry args={[0.02, 0.02, 1.4]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[-0.71, height/2 + 0.05, 0]} onClick={onClick}>
          <boxGeometry args={[0.02, 0.02, 1.4]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Hydraulic cylinder */}
        <mesh position={[0.9, height/2 - 0.2, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.06, 0.06, height - 0.4]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Control panel box on post */}
        <mesh position={[-0.9, 1.4, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, 0.4, 0.2]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Safety gates at each level */}
        {Array.from({ length: 3 }, (_, i) => {
          const y = i * (height / 3) + 0.5;
          return (
            <group key={`gate-${i}`}>
              {Array.from({ length: 6 }, (_, j) => (
                <mesh key={`bar-${j}`} position={[0, y + j * 0.15, 0.85]} onClick={onClick}>
                  <boxGeometry args={[1.4, 0.02, 0.02]} />
                  <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
    );
  };

  const renderTransferBridge = () => {
    const length = node.parameters?.length || 2;
    
    return (
      <group>
        {/* Two short conveyor sections */}
        <mesh position={[-length/2 - 0.5, 0.15, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1, 0.3, 1]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[length/2 + 0.5, 0.15, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[1, 0.3, 1]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Bridge plate that fills the gap */}
        <mesh position={[0, 0.35, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[length, 0.05, 0.8]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Pneumatic actuator underneath */}
        <mesh position={[0, 0.2, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.04, 0.04, 0.3]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Support frame */}
        <mesh position={[0, 0.05, 0]} onClick={onClick}>
          <boxGeometry args={[length + 1, 0.08, 0.8]} />
          <meshStandardMaterial color={colors.lightSteel} metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Support legs */}
        {[-length/2 - 0.4, length/2 + 0.4].map(x =>
          [-0.3, 0.3].map(z => (
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
      case 'spiral-conveyor':
        return renderSpiralConveyor();
      case 'vertical-lifter':
        return renderVerticalLifter();
      case 'transfer-bridge':
        return renderTransferBridge();
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
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {renderGeometry()}
      
      {/* Selection outline with glow effect */}
      {isSelected && (
        <group>
          {/* Outer glow */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(3.2, 3.2, 3.2)]} />
            <lineBasicMaterial color="#06b6d4" linewidth={6} transparent opacity={0.3} />
          </lineSegments>
          {/* Main outline */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(3, 3, 3)]} />
            <lineBasicMaterial color="#06b6d4" linewidth={4} />
          </lineSegments>
          {/* Inner bright line */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(2.8, 2.8, 2.8)]} />
            <lineBasicMaterial color="#ffffff" linewidth={2} transparent opacity={0.8} />
          </lineSegments>
        </group>
      )}
    </group>
  );
}

// Preload the GLB models
useGLTF.preload('/models/BELT%20CONVEYOR%20r.glb');
useGLTF.preload('/models/ROLLER%20CONVEYOR.glb');
// Keep old model as backup
useGLTF.preload('/models/belt-conveyor/scene.gltf');