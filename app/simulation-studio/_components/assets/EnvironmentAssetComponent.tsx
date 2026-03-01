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
    const length = asset.parameters?.length || 5;
    const height = asset.parameters?.height || 3;
    const thickness = asset.parameters?.thickness || 0.2;

    return (
      <group>
        {/* Main slab (box, concrete gray #9ca3af) */}
        <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[length, height, thickness]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Slight texture variation: use 2-3 boxes with slightly different roughness values layered */}
        <mesh position={[0, height/2, thickness/2 + 0.005]} onClick={onClick}>
          <boxGeometry args={[length - 0.1, height - 0.1, 0.01]} />
          <meshStandardMaterial color="#a1a8b0" metalness={0.1} roughness={0.7} />
        </mesh>
        
        <mesh position={[0, height/2, thickness/2 + 0.01]} onClick={onClick}>
          <boxGeometry args={[length - 0.2, height - 0.2, 0.005]} />
          <meshStandardMaterial color="#8a939d" metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Base strip (thin darker box along bottom) */}
        <mesh position={[0, 0.05, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[length + 0.1, 0.1, thickness + 0.05]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Wall texture lines to simulate concrete blocks */}
        {Array.from({ length: Math.floor(height * 2) }, (_, i) => (
          <mesh key={`line-${i}`} position={[0, (i + 0.5) * 0.5, thickness/2 + 0.008]} onClick={onClick}>
            <boxGeometry args={[length, 0.005, 0.002]} />
            <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.9} />
          </mesh>
        ))}
        
        {/* Vertical joints */}
        {Array.from({ length: Math.floor(length / 2) }, (_, i) => (
          <mesh key={`vjoint-${i}`} position={[(i - Math.floor(length/4)) * 2, height/2, thickness/2 + 0.008]} onClick={onClick}>
            <boxGeometry args={[0.005, height, 0.002]} />
            <meshStandardMaterial color={colors.darkGray} metalness={0.2} roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  };

  const renderDoor = () => {
    const width = asset.parameters?.width || 2;
    const height = asset.parameters?.height || 2.5;
    const thickness = asset.parameters?.thickness || 0.1;
    const doorType = asset.parameters?.doorType || 'single'; // single/double

    return (
      <group>
        {/* Frame: 4 boxes forming doorframe (slightly darker than wall) */}
        <mesh position={[-width/2 - 0.05, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, height + 0.2, thickness + 0.1]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[width/2 + 0.05, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.1, height + 0.2, thickness + 0.1]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, height + 0.05, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 0.2, 0.1, thickness + 0.1]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.05, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 0.2, 0.1, thickness + 0.1]} />
          <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {doorType === 'single' ? (
          <group>
            {/* Panel: 1 panel for single (recessed box) */}
            <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[width, height, thickness]} />
              <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
            </mesh>
            
            {/* Panel inset */}
            <mesh position={[0, height/2, thickness/2 - 0.01]} onClick={onClick}>
              <boxGeometry args={[width - 0.3, height - 0.3, 0.02]} />
              <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.7} />
            </mesh>
            
            {/* Handle: small cylinder on panel */}
            <mesh position={[width/2 - 0.15, height/2, thickness/2 + 0.03]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.02, 0.02, 0.06]} />
              <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Hinges: 2-3 small dark cylinders on frame edge */}
            {[0.2, 0.5, 0.8].map((ratio, i) => (
              <mesh key={`hinge-${i}`} position={[-width/2, height * ratio, thickness/2 + 0.02]} onClick={onClick}>
                <cylinderGeometry args={[0.02, 0.02, 0.04]} />
                <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ) : (
          <group>
            {/* Panels: 2 panels for double (recessed boxes) */}
            <mesh position={[-width/4, height/2, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[width/2 - 0.05, height, thickness]} />
              <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
            </mesh>
            <mesh position={[width/4, height/2, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[width/2 - 0.05, height, thickness]} />
              <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
            </mesh>
            
            {/* Panel insets */}
            <mesh position={[-width/4, height/2, thickness/2 - 0.01]} onClick={onClick}>
              <boxGeometry args={[width/2 - 0.35, height - 0.3, 0.02]} />
              <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.7} />
            </mesh>
            <mesh position={[width/4, height/2, thickness/2 - 0.01]} onClick={onClick}>
              <boxGeometry args={[width/2 - 0.35, height - 0.3, 0.02]} />
              <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.7} />
            </mesh>
            
            {/* Handles: small cylinder on each panel */}
            <mesh position={[-0.1, height/2, thickness/2 + 0.03]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.02, 0.02, 0.06]} />
              <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.1, height/2, thickness/2 + 0.03]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.02, 0.02, 0.06]} />
              <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Center divider */}
            <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
              <boxGeometry args={[0.1, height + 0.1, thickness + 0.05]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* Hinges for double doors */}
            {[0.2, 0.5, 0.8].map((ratio, i) => (
              <group key={`hinge-group-${i}`}>
                <mesh position={[-width/2, height * ratio, thickness/2 + 0.02]} onClick={onClick}>
                  <cylinderGeometry args={[0.02, 0.02, 0.04]} />
                  <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[width/2, height * ratio, thickness/2 + 0.02]} onClick={onClick}>
                  <cylinderGeometry args={[0.02, 0.02, 0.04]} />
                  <meshStandardMaterial color={colors.darkGray} metalness={0.8} roughness={0.3} />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </group>
    );
  };

  const renderWindow = () => {
    const width = asset.parameters?.width || 2;
    const height = asset.parameters?.height || 1.5;
    const thickness = asset.parameters?.thickness || 0.1;

    return (
      <group>
        {/* Frame: 4 boxes */}
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
        
        {/* Glass: transparent plane (MeshPhysicalMaterial, transmission:0.9, roughness:0.05, ior:1.5) */}
        <mesh position={[0, height/2, 0]} onClick={onClick}>
          <boxGeometry args={[width, height, thickness]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transmission={0.9}
            roughness={0.05}
            ior={1.5}
            thickness={thickness}
            transparent
          />
        </mesh>
        
        {/* Sill: small box at bottom */}
        <mesh position={[0, -0.05, thickness/2 + 0.03]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 0.2, 0.1, 0.06]} />
          <meshStandardMaterial color={colors.steel} metalness={0.6} roughness={0.4} />
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
        {/* Loop to create individual steps (each = box, stacked up) */}
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
            
            {/* Anti-slip strips on each step (thin colored box) */}
            {[0, 1, 2].map(strip => (
              <mesh key={`strip-${strip}`} position={[(strip - 1) * width * 0.3, (i + 1) * stepHeight + 0.005, (i + 0.8) * stepDepth]} onClick={onClick}>
                <boxGeometry args={[0.05, 0.01, 0.15]} />
                <meshStandardMaterial color={colors.safetyYellow} metalness={0.3} roughness={0.7} />
              </mesh>
            ))}
          </group>
        ))}
        
        {/* 2 handrail systems: posts + top rail */}
        {[-width/2 - 0.1, width/2 + 0.1].map(x => (
          <group key={`handrail-${x}`}>
            {/* Handrail posts (thin cylinders every 2 steps) */}
            {Array.from({ length: Math.ceil(steps / 2) + 1 }, (_, i) => {
              const stepIndex = i * 2;
              const postHeight = 1;
              return (
                <mesh key={`post-${i}`} position={[x, stepIndex * stepHeight + postHeight/2, stepIndex * stepDepth]} castShadow onClick={onClick}>
                  <cylinderGeometry args={[0.02, 0.02, postHeight]} />
                  <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
                </mesh>
              );
            })}
            
            {/* Top rail (horizontal cylinder) */}
            <mesh position={[x, steps * stepHeight / 2 + 1, steps * stepDepth / 2]} rotation={[Math.atan2(steps * stepHeight, steps * stepDepth), 0, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, Math.sqrt((steps * stepDepth) ** 2 + (steps * stepHeight) ** 2)]} />
              <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
        
        {/* Landing platform at top */}
        <mesh position={[0, steps * stepHeight + 0.05, steps * stepDepth + 0.5]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 0.4, 0.1, 1]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Landing platform handrail */}
        {[-width/2 - 0.1, width/2 + 0.1].map(x => (
          <group key={`landing-rail-${x}`}>
            <mesh position={[x, steps * stepHeight + 0.6, steps * stepDepth + 0.5]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.02, 0.02, 1.1]} />
              <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[x, steps * stepHeight + 1.1, steps * stepDepth + 0.5]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, 1]} />
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
    const postSpacing = 1.5; // Posts spaced every 1.5m

    return (
      <group>
        {/* Posts: yellow #eab308 cylinders, spaced every 1.5m along length */}
        {Array.from({ length: Math.ceil(length / postSpacing) + 1 }, (_, i) => (
          <group key={`post-group-${i}`}>
            <mesh position={[(i * postSpacing) - length/2, height/2, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.03, 0.03, height]} />
              <meshStandardMaterial color="#eab308" metalness={0.4} roughness={0.6} />
            </mesh>
            
            {/* Base plates: small flat cylinders at each post */}
            <mesh position={[(i * postSpacing) - length/2, 0.02, 0]} castShadow onClick={onClick}>
              <cylinderGeometry args={[0.08, 0.08, 0.04]} />
              <meshStandardMaterial color={colors.darkGray} metalness={0.6} roughness={0.5} />
            </mesh>
          </group>
        ))}
        
        {/* Top rail: horizontal yellow cylinder */}
        <mesh position={[0, height - 0.05, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.025, 0.025, length]} />
          <meshStandardMaterial color="#eab308" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Mid rail: horizontal yellow cylinder at half height */}
        <mesh position={[0, height/2, 0]} castShadow onClick={onClick}>
          <cylinderGeometry args={[0.025, 0.025, length]} />
          <meshStandardMaterial color="#eab308" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Kick plate */}
        <mesh position={[0, 0.1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[length, 0.2, 0.02]} />
          <meshStandardMaterial color="#eab308" metalness={0.4} roughness={0.6} />
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

    // Color from params (yellow, white, red, blue)
    const markingColor = color === 'yellow' ? '#eab308' : 
                        color === 'red' ? '#ef4444' : 
                        color === 'blue' ? '#3b82f6' :
                        color === 'white' ? '#ffffff' : '#eab308';

    return (
      <group>
        {/* Very thin flat box (height: 0.005m) at y=0.003 */}
        <mesh position={[0, 0.003, 0]} onClick={onClick}>
          <boxGeometry args={[length, 0.005, width]} />
          <meshStandardMaterial color={markingColor} metalness={0.2} roughness={0.8} />
        </mesh>
        
        {/* Dashed pattern for white markings */}
        {color === 'white' && Array.from({ length: Math.floor(length / 0.5) }, (_, i) => {
          if (i % 2 === 0) return null; // Skip every other dash for dashed effect
          return (
            <mesh key={`dash-${i}`} position={[(i * 0.5) - length/2, 0.006, 0]} onClick={onClick}>
              <boxGeometry args={[0.2, 0.002, width]} />
              <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
            </mesh>
          );
        })}
        
        {/* Safety reflective elements for yellow markings */}
        {color === 'yellow' && Array.from({ length: Math.floor(length / 1) }, (_, i) => (
          <mesh key={`reflect-${i}`} position={[(i - Math.floor(length / 2)) * 1, 0.004, 0]} onClick={onClick}>
            <boxGeometry args={[0.1, 0.001, width - 0.02]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.9} 
              roughness={0.1}
              emissive="#ffffff"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
      </group>
    );
  };

  const renderPalletRack = () => {
    const levels = asset.parameters?.levels || 4;
    const bays = asset.parameters?.bays || 3;
    const width = bays * 2.5; // Each bay is ~2.5m wide
    const height = asset.parameters?.height || 4;
    const depth = asset.parameters?.depth || 1.2;

    return (
      <group>
        {/* For EACH bay - upright frames */}
        {Array.from({ length: bays + 1 }, (_, bayIndex) => {
          const x = (bayIndex - bays/2) * 2.5;
          return (
            <group key={`bay-${bayIndex}`}>
              {/* 2 upright frames per bay position */}
              {/* Front upright frame */}
              <group>
                {/* 2 vertical posts */}
                <mesh position={[x, height/2, depth/2]} castShadow onClick={onClick}>
                  <boxGeometry args={[0.08, height, 0.08]} />
                  <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.4} />
                </mesh>
                <mesh position={[x, height/2, -depth/2]} castShadow onClick={onClick}>
                  <boxGeometry args={[0.08, height, 0.08]} />
                  <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.4} />
                </mesh>
                
                {/* Diagonal X-bracing between posts */}
                <mesh position={[x, height/2, 0]} rotation={[0, 0, Math.PI/6]} castShadow onClick={onClick}>
                  <boxGeometry args={[depth * 1.1, 0.03, 0.03]} />
                  <meshStandardMaterial color="#2563eb" metalness={0.7} roughness={0.3} />
                </mesh>
                <mesh position={[x, height/2, 0]} rotation={[0, 0, -Math.PI/6]} castShadow onClick={onClick}>
                  <boxGeometry args={[depth * 1.1, 0.03, 0.03]} />
                  <meshStandardMaterial color="#2563eb" metalness={0.7} roughness={0.3} />
                </mesh>
                
                {/* Foot plates at bottom */}
                <mesh position={[x, 0.03, depth/2]} castShadow onClick={onClick}>
                  <boxGeometry args={[0.2, 0.06, 0.2]} />
                  <meshStandardMaterial color={colors.darkGray} metalness={0.4} roughness={0.7} />
                </mesh>
                <mesh position={[x, 0.03, -depth/2]} castShadow onClick={onClick}>
                  <boxGeometry args={[0.2, 0.06, 0.2]} />
                  <meshStandardMaterial color={colors.darkGray} metalness={0.4} roughness={0.7} />
                </mesh>
              </group>
            </group>
          );
        })}
        
        {/* For EACH level - horizontal beams and wire decks */}
        {Array.from({ length: levels + 1 }, (_, levelIndex) => {
          const y = (levelIndex * height / levels);
          return (
            <group key={`level-${levelIndex}`}>
              {/* For each bay, create horizontal beams */}
              {Array.from({ length: bays }, (_, bayIndex) => {
                const bayX = (bayIndex - (bays-1)/2) * 2.5;
                return (
                  <group key={`bay-beams-${bayIndex}`}>
                    {/* 2 horizontal beams per bay (front and back) */}
                    <mesh position={[bayX, y, depth/2]} castShadow onClick={onClick}>
                      <boxGeometry args={[2.4, 0.12, 0.08]} />
                      <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.5} />
                    </mesh>
                    <mesh position={[bayX, y, -depth/2]} castShadow onClick={onClick}>
                      <boxGeometry args={[2.4, 0.12, 0.08]} />
                      <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.5} />
                    </mesh>
                    
                    {/* Wire deck surface only if not ground level */}
                    {levelIndex > 0 && (
                      <group>
                        {/* Wire mesh pattern */}
                        {Array.from({ length: Math.floor(2.4 * 5) }, (_, j) => (
                          <mesh key={`wire-long-${j}`} position={[bayX + (j - 6) * 0.2, y + 0.06, 0]} onClick={onClick}>
                            <boxGeometry args={[0.01, 0.01, depth - 0.1]} />
                            <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
                          </mesh>
                        ))}
                        {Array.from({ length: Math.floor(depth * 8) }, (_, j) => (
                          <mesh key={`wire-cross-${j}`} position={[bayX, y + 0.06, (j - depth * 4) * 0.125]} onClick={onClick}>
                            <boxGeometry args={[2.3, 0.01, 0.01]} />
                            <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
                          </mesh>
                        ))}
                      </group>
                    )}
                  </group>
                );
              })}
            </group>
          );
        })}
        
        {/* Safety pins / load clips on beams */}
        {Array.from({ length: levels }, (_, i) => {
          const y = ((i + 1) * height / levels);
          return (
            <group key={`pins-${i}`}>
              {Array.from({ length: bays + 1 }, (_, bayIndex) => {
                const x = (bayIndex - bays/2) * 2.5;
                return (
                  <group key={`bay-pins-${bayIndex}`}>
                    <mesh position={[x, y - 0.02, depth/2 + 0.05]} onClick={onClick}>
                      <cylinderGeometry args={[0.01, 0.01, 0.04]} />
                      <meshStandardMaterial color={colors.warningRed} metalness={0.4} roughness={0.6} />
                    </mesh>
                    <mesh position={[x, y - 0.02, -depth/2 - 0.05]} onClick={onClick}>
                      <cylinderGeometry args={[0.01, 0.01, 0.04]} />
                      <meshStandardMaterial color={colors.warningRed} metalness={0.4} roughness={0.6} />
                    </mesh>
                  </group>
                );
              })}
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
        {/* Foundation slab - slightly raised from ground */}
        <mesh position={[0, 0.1, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[width + 1, 0.2, depth + 1]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* 4 walls - back, left, right, partial front with opening */}
        {/* Back wall */}
        <mesh position={[0, height/2, -depth/2]} castShadow onClick={onClick}>
          <boxGeometry args={[width, height, 0.3]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Left wall */}
        <mesh position={[-width/2, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, height, depth]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Right wall */}
        <mesh position={[width/2, height/2, 0]} castShadow onClick={onClick}>
          <boxGeometry args={[0.3, height, depth]} />
          <meshStandardMaterial color={colors.concrete} metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* Partial front wall with large opening (loading dock) */}
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
        
        {/* Roof: flat top with 3-4 triangular roof trusses visible inside */}
        <mesh position={[0, height + 0.1, 0]} onClick={onClick}>
          <boxGeometry args={[width + 0.5, 0.2, depth + 0.5]} />
          <meshStandardMaterial color={colors.mediumSteel} metalness={0.7} roughness={0.4} />
        </mesh>
        
        {/* 4 triangular roof trusses made of angled boxes */}
        {Array.from({ length: 4 }, (_, i) => {
          const z = (i - 1.5) * depth/3;
          return (
            <group key={`truss-${i}`}>
              {/* Main horizontal beam */}
              <mesh position={[0, height - 0.2, z]} castShadow onClick={onClick}>
                <boxGeometry args={[width - 1, 0.15, 0.15]} />
                <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
              </mesh>
              
              {/* Left diagonal */}
              <mesh position={[-width/4, height - 0.1, z]} rotation={[0, 0, Math.PI/6]} castShadow onClick={onClick}>
                <boxGeometry args={[width/2, 0.1, 0.1]} />
                <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
              </mesh>
              
              {/* Right diagonal */}
              <mesh position={[width/4, height - 0.1, z]} rotation={[0, 0, -Math.PI/6]} castShadow onClick={onClick}>
                <boxGeometry args={[width/2, 0.1, 0.1]} />
                <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
              </mesh>
              
              {/* Center vertical support */}
              <mesh position={[0, height + 0.3, z]} castShadow onClick={onClick}>
                <boxGeometry args={[0.1, 0.6, 0.1]} />
                <meshStandardMaterial color={colors.steel} metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          );
        })}
        
        {/* Columns along walls */}
        {Array.from({ length: Math.ceil(width / 5) }, (_, i) => {
          const x = (i - Math.floor(width/10)) * 5;
          return (
            <group key={`columns-${i}`}>
              {/* Back wall column */}
              <mesh position={[x, height/2, -depth/2 + 0.15]} castShadow onClick={onClick}>
                <boxGeometry args={[0.3, height, 0.3]} />
                <meshStandardMaterial color={colors.mediumSteel} metalness={0.6} roughness={0.4} />
              </mesh>
              
              {/* Front wall columns (where wall exists) */}
              {(Math.abs(x) > width/4) && (
                <mesh position={[x, height/2, depth/2 - 0.15]} castShadow onClick={onClick}>
                  <boxGeometry args={[0.3, height, 0.3]} />
                  <meshStandardMaterial color={colors.mediumSteel} metalness={0.6} roughness={0.4} />
                </mesh>
              )}
            </group>
          );
        })}
        
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
        
        {/* Exterior lights - small emissive boxes on front wall */}
        {Array.from({ length: 4 }, (_, i) => {
          const x = (i - 1.5) * width/4;
          return (
            <mesh key={`light-${i}`} position={[x, height - 0.5, depth/2 + 0.2]} castShadow onClick={onClick}>
              <boxGeometry args={[0.3, 0.2, 0.15]} />
              <meshStandardMaterial 
                color="#ffffff" 
                metalness={0.1} 
                roughness={0.8}
                emissive="#ffffff"
                emissiveIntensity={0.2}
              />
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