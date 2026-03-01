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
  
  // Animation for selected objects
  useFrame(({ clock }) => {
    if (groupRef.current && isSelected) {
      // Pulsing animation for selected objects
      const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.02;
      groupRef.current.scale.setScalar(scale);
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }
  });

  // Industrial color palette
  const colors = {
    concrete: '#7a7a7a',
    steel: '#9ca3af',
    mediumSteel: '#6b7280',
    darkGray: '#4a5568',
    safetyYellow: '#eab308',
    safetyOrange: '#f97316',
    rackBlue: '#2563eb',
    rackOrange: '#f97316',
    glass: '#e0f2fe',
    woodBrown: '#8b4513',
    rubberBlack: '#1f2937',
    warningRed: '#ef4444',
    emergencyGreen: '#22c55e'
  };

  const renderWall = () => {
    const width = asset.parameters?.width || 5;
    const height = asset.parameters?.height || 3;
    const thickness = asset.parameters?.thickness || 0.2;

    return (
      <group>
        {/* Main wall structure */}
        <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width, height, thickness]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Wall texture lines to simulate concrete blocks */}
        {Array.from({ length: Math.floor(height * 2) }, (_, i) => (
          <mesh key={`line-${i}`} position={[0, (i + 0.5) * 0.5, thickness/2 + 0.005]} onClick={onClick}>
            <boxGeometry args={[width, 0.01, 0.005]} />
            <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.9} />
          </mesh>
        ))}
        
        {/* Vertical joints */}
        {Array.from({ length: Math.floor(width / 2) }, (_, i) => (
          <mesh key={`vjoint-${i}`} position={[(i - Math.floor(width/4)) * 2, height/2, thickness/2 + 0.005]} onClick={onClick}>
            <boxGeometry args={[0.01, height, 0.005]} />
            <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.9} />
          </mesh>
        ))}
        
        {/* Base foundation */}
        <mesh position={[0, 0.05, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 0.2, 0.1, thickness + 0.1]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.3} roughness={0.7} />
        </mesh>
      </group>
    );
  };

  const renderDoor = () => {
    const width = asset.parameters?.width || 2;
    const height = asset.parameters?.height || 2.5;
    const thickness = asset.parameters?.thickness || 0.1;

    return (
      <group>
        {/* Door frame */}
        <mesh position={[-width/2 - 0.05, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, height + 0.2, thickness + 0.1]} />
          <meshStandardMaterial color={colors.steel} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[width/2 + 0.05, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, height + 0.2, thickness + 0.1]} />
          <meshStandardMaterial color={colors.steel} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, height + 0.05, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 0.2, 0.1, thickness + 0.1]} />
          <meshStandardMaterial color={colors.steel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Door panel */}
        <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width, height, thickness]} />
          <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
        </mesh>
        
        {/* Door panel inset */}
        <mesh position={[0, height/2, thickness/2 - 0.01]} onClick={onClick}>
          <boxGeometry args={[width - 0.3, height - 0.3, 0.02]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.7} />
        </mesh>
        
        {/* Door handle */}
        <mesh position={[width/2 - 0.15, height/2 - 0.1, thickness/2 + 0.05]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.02, 0.02, 0.1]} />
          <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Door handle lever */}
        <mesh position={[width/2 - 0.1, height/2 - 0.1, thickness/2 + 0.05]} rotation={[0, 0, 0]} onClick={onClick}>
          <boxGeometry args={[0.1, 0.02, 0.03]} />
          <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Lock cylinder */}
        <mesh position={[width/2 - 0.15, height/2 - 0.3, thickness/2 + 0.01]} onClick={onClick}>
          <cylinderGeometry args={[0.015, 0.015, 0.02]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Hinges */}
        {[0.2, 0.8].map(ratio => (
          <mesh key={`hinge-${ratio}`} position={[-width/2, height * ratio, thickness/2 + 0.02]} onClick={onClick}>
            <cylinderGeometry args={[0.03, 0.03, 0.04]} />
            <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
    );
  };

  const renderWindow = () => {
    const width = asset.parameters?.width || 2;
    const height = asset.parameters?.height || 1.5;
    const thickness = asset.parameters?.thickness || 0.1;

    return (
      <group>
        {/* Window frame */}
        <mesh position={[-width/2 - 0.05, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, height + 0.1, thickness + 0.05]} />
          <meshStandardMaterial color={colors.steel} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[width/2 + 0.05, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, height + 0.1, thickness + 0.05]} />
          <meshStandardMaterial color={colors.steel} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, height + 0.025, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 0.1, 0.05, thickness + 0.05]} />
          <meshStandardMaterial color={colors.steel} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.025, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 0.1, 0.05, thickness + 0.05]} />
          <meshStandardMaterial color={colors.steel} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Glass panes */}
        <mesh position={[0, height/2, 0]} onClick={onClick}>
          <boxGeometry args={[width, height, thickness]} />
          <meshStandardMaterial 
            color={colors.glass} 
            metalness={0.9} 
            roughness={0.1} 
            transparent 
            opacity={0.3} 
          />
        </mesh>
        
        {/* Window mullions - cross pattern */}
        <mesh position={[0, height/2, 0]} onClick={onClick}>
          <boxGeometry args={[0.02, height, thickness + 0.01]} />
          <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, height/2, 0]} onClick={onClick}>
          <boxGeometry args={[width, 0.02, thickness + 0.01]} />
          <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  };

  const renderStairs = () => {
    const width = asset.parameters?.width || 2;
    const steps = asset.parameters?.steps || 10;
    const stepHeight = asset.parameters?.stepHeight || 0.2;
    const stepDepth = 0.3;

    return (
      <group>
        {/* Individual steps */}
        {Array.from({ length: steps }, (_, i) => (
          <group key={`step-${i}`}>
            {/* Step tread */}
            <mesh position={[0, (i + 0.5) * stepHeight, (i + 0.5) * stepDepth]} castShadow onClick={onClick}>
              <boxGeometry args={[width, stepHeight, stepDepth]} />
              <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
            </mesh>
            
            {/* Step riser */}
            <mesh position={[0, i * stepHeight + stepHeight/2, i * stepDepth + stepDepth]} onClick={onClick}>
              <boxGeometry args={[width, stepHeight, 0.02]} />
              <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
            </mesh>
            
            {/* Anti-slip strips */}
            {[0, 1, 2].map(strip => (
              <mesh key={`strip-${strip}`} position={[(strip - 1) * width * 0.3, (i + 1) * stepHeight + 0.005, (i + 0.8) * stepDepth]} onClick={onClick}>
                <boxGeometry args={[0.05, 0.01, 0.15]} />
                <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
              </mesh>
            ))}
          </group>
        ))}
        
        {/* Handrails - left and right */}
        {[-width/2 - 0.1, width/2 + 0.1].map(x => (
          <group key={`handrail-${x}`}>
            {/* Handrail posts */}
            {Array.from({ length: Math.ceil(steps / 3) }, (_, i) => {
              const stepIndex = i * 3;
              return (
                <mesh key={`post-${i}`} position={[x, stepIndex * stepHeight + 1, stepIndex * stepDepth]} castShadow onClick={onClick}>
                  <cylinderGeometry args={[0.02, 0.02, 1]} />
                  <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
                </mesh>
              );
            })}
            
            {/* Handrail top rail */}
            <mesh position={[x, steps * stepHeight / 2 + 1, steps * stepDepth / 2]} rotation={[Math.atan2(steps * stepHeight, steps * stepDepth), 0, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, Math.sqrt((steps * stepDepth) ** 2 + (steps * stepHeight) ** 2)]} />
              <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    );
  };

  const renderSafetyRail = () => {
    const length = asset.parameters?.length || 5;
    const height = asset.parameters?.height || 1.2;

    return (
      <group>
        {/* Vertical posts every 2 meters */}
        {Array.from({ length: Math.ceil(length / 2) + 1 }, (_, i) => (
          <mesh key={`post-${i}`} position={[(i * 2) - length/2, height/2, 0]} castShadow onClick={onClick}>
            <cylinderGeometry args={[0.03, 0.03, height]} />
            <meshStandardMaterial color={colors.safetyYellow} metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
        
        {/* Top rail */}
        <mesh position={[0, height - 0.15, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[length, 0.05, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Mid rail */}
        <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[length, 0.05, 0.05]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Kick plate */}
        <mesh position={[0, 0.1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[length, 0.2, 0.02]} />
          <meshStandardMaterial color={colors.safetyYellow} metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Warning signs on posts */}
        {Array.from({ length: Math.ceil(length / 4) }, (_, i) => (
          <mesh key={`sign-${i}`} position={[(i * 4) - length/2, height/2, 0.05]} onClick={onClick}>
            <boxGeometry args={[0.2, 0.15, 0.01]} />
            <meshStandardMaterial color={colors.warningRed} metalness={0.2} roughness={0.7} />
          </mesh>
        ))}
      </group>
    );
  };

  const renderFloorMarking = () => {
    const length = asset.parameters?.length || 5;
    const width = asset.parameters?.width || 0.2;
    const color = asset.parameters?.color || 'yellow';

    const markingColor = color === 'yellow' ? colors.safetyYellow : 
                        color === 'red' ? colors.warningRed : 
                        color === 'white' ? '#ffffff' : colors.safetyYellow;

    return (
      <group>
        {/* Main marking stripe */}
        <mesh position={[0, 0.01, 0]} onClick={onClick}>
          <boxGeometry args={[length, 0.02, width]} />
          <meshStandardMaterial color={markingColor} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Dashed pattern for certain markings */}
        {color === 'white' && Array.from({ length: Math.floor(length / 0.5) }, (_, i) => {
          if (i % 2 === 0) return null; // Skip every other dash for dashed effect
          return (
            <mesh key={`dash-${i}`} position={[(i * 0.5) - length/2, 0.015, 0]} onClick={onClick}>
              <boxGeometry args={[0.2, 0.005, width]} />
              <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
            </mesh>
          );
        })}
      </group>
    );
  };

  const renderPalletRack = () => {
    const width = asset.parameters?.width || 3;
    const height = asset.parameters?.height || 4;
    const depth = asset.parameters?.depth || 1.2;
    const levels = asset.parameters?.levels || 4;

    return (
      <group>
        {/* Upright frames - front uprights */}
        {[-width/2, width/2].map(x => (
          <group key={`front-upright-${x}`}>
            {/* Main vertical posts */}
            <mesh position={[x, height/2, depth/2]} castShadow onClick={onClick}>
              <boxGeometry args={[0.08, height, 0.08]} />
              <meshStandardMaterial color={colors.rackBlue} metalness={0.6} roughness={0.4} />
            </mesh>
            
            {/* Diagonal bracing */}
            {Array.from({ length: levels - 1 }, (_, i) => (
              <mesh key={`diag-${i}`} position={[x, (i + 1) * (height / levels) - 0.3, depth/2]} rotation={[0, 0, x > 0 ? Math.PI/6 : -Math.PI/6]} castShadow onClick={onClick}>
                <boxGeometry args={[0.6, 0.03, 0.03]} />
                <meshStandardMaterial color={colors.rackBlue} metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
        
        {/* Back uprights */}
        {[-width/2, width/2].map(x => (
          <mesh key={`back-upright-${x}`} position={[x, height/2, -depth/2]} castShadow onClick={onClick}>
            <boxGeometry args={[0.08, height, 0.08]} />
            <meshStandardMaterial color={colors.rackBlue} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        
        {/* Horizontal beams at each level */}
        {Array.from({ length: levels + 1 }, (_, i) => {
          const y = (i * height / levels);
          return (
            <group key={`level-${i}`}>
              {/* Front beam */}
              <mesh position={[0, y, depth/2]} castShadow onClick={onClick}>
                <boxGeometry args={[width - 0.08, 0.12, 0.08]} />
                <meshStandardMaterial color={colors.rackOrange} metalness={0.5} roughness={0.5} />
              </mesh>
              
              {/* Back beam */}
              <mesh position={[0, y, -depth/2]} castShadow onClick={onClick}>
                <boxGeometry args={[width - 0.08, 0.12, 0.08]} />
                <meshStandardMaterial color={colors.rackOrange} metalness={0.5} roughness={0.5} />
              </mesh>
              
              {/* Beam end connectors */}
              {[-width/2 + 0.04, width/2 - 0.04].map(x => (
                <group key={`connector-${x}`}>
                  <mesh position={[x, y, depth/2]} onClick={onClick}>
                    <boxGeometry args={[0.12, 0.16, 0.12]} />
                    <meshStandardMaterial color={colors.rackOrange} metalness={0.6} roughness={0.4} />
                  </mesh>
                  <mesh position={[x, y, -depth/2]} onClick={onClick}>
                    <boxGeometry args={[0.12, 0.16, 0.12]} />
                    <meshStandardMaterial color={colors.rackOrange} metalness={0.6} roughness={0.4} />
                  </mesh>
                </group>
              ))}
            </group>
          );
        })}
        
        {/* Wire deck shelving at each level except ground */}
        {Array.from({ length: levels }, (_, i) => {
          const y = ((i + 1) * height / levels) + 0.06;
          return (
            <group key={`deck-${i}`}>
              {/* Wire mesh pattern */}
              {Array.from({ length: Math.floor(width * 5) }, (_, j) => (
                <mesh key={`wire-long-${j}`} position={[(j - width * 2.5) * 0.2, y, 0]} onClick={onClick}>
                  <boxGeometry args={[0.01, 0.01, depth - 0.1]} />
                  <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
                </mesh>
              ))}
              {Array.from({ length: Math.floor(depth * 8) }, (_, j) => (
                <mesh key={`wire-cross-${j}`} position={[0, y, (j - depth * 4) * 0.125]} onClick={onClick}>
                  <boxGeometry args={[width - 0.1, 0.01, 0.01]} />
                  <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
                </mesh>
              ))}
            </group>
          );
        })}
        
        {/* Foot plates at base */}
        {[-width/2, width/2].map(x => 
          [-depth/2, depth/2].map(z => (
            <mesh key={`foot-${x}-${z}`} position={[x, 0.03, z]} castShadow onClick={onClick}>
              <boxGeometry args={[0.2, 0.06, 0.2]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.4} roughness={0.7} />
            </mesh>
          ))
        )}
        
        {/* Safety pins / load clips */}
        {Array.from({ length: levels }, (_, i) => {
          const y = ((i + 1) * height / levels);
          return (
            <group key={`pins-${i}`}>
              {[-width/2 + 0.04, width/2 - 0.04].map(x => (
                <mesh key={`pin-${x}`} position={[x, y - 0.02, depth/2 + 0.05]} onClick={onClick}>
                  <cylinderGeometry args={[0.01, 0.01, 0.04]} />
                  <meshStandardMaterial color={colors.warningRed} metalness={0.4} roughness={0.6} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
    );
  };

  const renderWarehouseShell = () => {
    const width = asset.parameters?.width || 20;
    const height = asset.parameters?.height || 8;
    const depth = asset.parameters?.depth || 15;

    return (
      <group>
        {/* Foundation slab */}
        <mesh position={[0, 0.1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 1, 0.2, depth + 1]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Side walls */}
        <mesh position={[-width/2, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, height, depth]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[width/2, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, height, depth]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Back wall */}
        <mesh position={[0, height/2, -depth/2]} castShadow onClick={onClick}>
          <boxGeometry args={[width, height, 0.3]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Front wall with large opening */}
        <mesh position={[0, height - 1, depth/2]} castShadow onClick={onClick}>
          <boxGeometry args={[width, 2, 0.3]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Front wall side sections */}
        <mesh position={[-width/2 + 1.5, height/2 - 1, depth/2]} castShadow onClick={onClick}>
          <boxGeometry args={[3, height - 2, 0.3]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[width/2 - 1.5, height/2 - 1, depth/2]} castShadow onClick={onClick}>
          <boxGeometry args={[3, height - 2, 0.3]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Roof structure - steel frame */}
        {Array.from({ length: Math.ceil(depth / 4) }, (_, i) => {
          const z = (i - Math.floor(depth / 8)) * 4;
          return (
            <group key={`truss-${i}`}>
              {/* Main roof beam */}
              <mesh position={[0, height + 0.3, z]} castShadow onClick={onClick}>
                <boxGeometry args={[width, 0.4, 0.2]} />
                <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
              </mesh>
              
              {/* Diagonal roof trusses */}
              {[-1, 1].map(side => (
                <mesh key={`truss-diag-${side}`} position={[side * width/4, height + 0.5, z]} rotation={[0, 0, side * Math.PI/12]} castShadow onClick={onClick}>
                  <boxGeometry args={[width/2, 0.15, 0.15]} />
                  <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
                </mesh>
              ))}
            </group>
          );
        })}
        
        {/* Roof panels */}
        <mesh position={[0, height + 0.7, 0]} onClick={onClick}>
          <boxGeometry args={[width + 0.5, 0.1, depth + 0.5]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.4} />
        </mesh>
        
        {/* Loading dock */}
        <mesh position={[0, 0.6, depth/2 + 0.5]} castShadow onClick={onClick}>
          <boxGeometry args={[8, 1.2, 1]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Dock bumpers */}
        {[-2, 0, 2].map(x => (
          <mesh key={`bumper-${x}`} position={[x, 0.3, depth/2 + 1.01]} castShadow onClick={onClick}>
            <boxGeometry args={[0.3, 0.6, 0.2]} />
            <meshStandardMaterial color={colors.rubberBlack} metalness={0.1} roughness={0.9} />
          </mesh>
        ))}
        
        {/* Exterior lighting */}
        {Array.from({ length: 4 }, (_, i) => {
          const x = (i - 1.5) * width/3;
          return (
            <mesh key={`light-${i}`} position={[x, height - 0.5, depth/2 + 0.2]} castShadow onClick={onClick}>
              <boxGeometry args={[0.6, 0.3, 0.2]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}
      </group>
    );
  };

  const renderGeometry = () => {
    switch (asset.type) {
      case 'wall':
        return renderWall();
      case 'door':
        return renderDoor();
      case 'window':
        return renderWindow();
      case 'stairs':
        return renderStairs();
      case 'safety-rail':
        return renderSafetyRail();
      case 'floor-marking':
        return renderFloorMarking();
      case 'pallet-rack':
        return renderPalletRack();
      case 'warehouse-shell':
        return renderWarehouseShell();
      default:
        // Default fallback - simple colored box
        return (
          <mesh position={[0, 0.5, 0]} castShadow onClick={onClick}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={colors.concrete} />
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
          <edgesGeometry args={[new THREE.BoxGeometry(3, 3, 3)]} />
          <lineBasicMaterial color="#06b6d4" linewidth={3} />
        </lineSegments>
      )}
    </group>
  );
}