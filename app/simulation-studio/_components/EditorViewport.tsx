'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  TransformControls, 
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '../_store/editorStore';

// Asset components
import ProcessNodeComponent from './assets/ProcessNodeComponent';
import EnvironmentAssetComponent from './assets/EnvironmentAssetComponent';
import ActorComponent from './assets/ActorComponent';
import SimulationItem from './SimulationItem';
import EdgeComponent from './EdgeComponent';
import ConnectionManager from './ConnectionManager';

// Placement preview component
function PlacementPreview({ type, category, position }: { type: string, category: string, position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 3) * 0.1;
      // Gentle rotation
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Preview wireframe */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial 
          color="#06b6d4" 
          wireframe 
          transparent 
          opacity={0.6} 
        />
      </mesh>
      {/* Preview label */}
      <Html position={[0, 1.5, 0]} center>
        <div className="bg-[#06b6d4] text-white px-2 py-1 rounded text-sm font-medium pointer-events-none">
          {type.replace('-', ' ')}
        </div>
      </Html>
    </group>
  );
}

// Scene Component
function Scene() {
  const { 
    processNodes,
    environmentAssets, 
    actors,
    edges,
    simulationItems,
    selectedObjectId,
    selectedObjectType,
    transformMode,
    sceneSettings,
    isPlaying,
    setSelectedObject,
    updateObject,
    updateSimulation,
    addProcessNode,
    addEnvironmentAsset,
    addActor,
    removeObject,
  } = useEditorStore();

  const { camera, gl, scene, raycaster, pointer } = useThree();
  const transformControlsRef = useRef<any>();
  const orbitControlsRef = useRef<any>();
  const lastTime = useRef(0);
  
  // Placement state
  const [placementMode, setPlacementMode] = useState<{
    active: boolean;
    type: string;
    category: 'process' | 'environment' | 'actor';
  } | null>(null);
  const [previewPosition, setPreviewPosition] = useState<[number, number, number]>([0, 0, 0]);

  // Handle mouse/pointer move for placement preview
  useEffect(() => {
    if (!placementMode?.active) return;

    const handlePointerMove = (event: PointerEvent) => {
      // Convert screen coordinates to world position
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      
      // Raycast against ground plane
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersection);
      
      if (intersection) {
        // Snap to grid
        const gridSize = 0.5;
        intersection.x = Math.round(intersection.x / gridSize) * gridSize;
        intersection.z = Math.round(intersection.z / gridSize) * gridSize;
        intersection.y = 0;
        
        setPreviewPosition([intersection.x, intersection.y, intersection.z]);
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, [placementMode, gl.domElement, raycaster, camera, pointer]);

  // Listen for placement requests from the library
  useEffect(() => {
    const handlePlacementRequest = (event: CustomEvent) => {
      const { type, category } = event.detail;
      setPlacementMode({ active: true, type, category });
      
      // Disable orbit controls during placement
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }
    };

    window.addEventListener('requestPlacement', handlePlacementRequest as EventListener);
    return () => {
      window.removeEventListener('requestPlacement', handlePlacementRequest as EventListener);
    };
  }, []);

  // Handle placement click
  const handlePlacementClick = (event: any) => {
    if (!placementMode?.active) return;
    
    event.stopPropagation();
    
    const { type, category } = placementMode;
    
    // Place the object
    switch (category) {
      case 'process':
        addProcessNode(type as any, previewPosition);
        break;
      case 'environment':
        addEnvironmentAsset(type as any, previewPosition);
        break;
      case 'actor':
        addActor(type as any, previewPosition);
        break;
    }
    
    // Exit placement mode
    setPlacementMode(null);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }
  };

  // Handle object selection with raycast
  const handleObjectClick = (id: string, type: 'process' | 'environment' | 'actor', event: any) => {
    if (placementMode?.active) return; // Don't select during placement
    
    event.stopPropagation();
    setSelectedObject(id, type);
  };

  // Handle background click (deselect or place)
  const handleBackgroundClick = (event: any) => {
    if (placementMode?.active) {
      handlePlacementClick(event);
    } else {
      setSelectedObject(null, null);
    }
  };

  // Handle right-click context menu
  const handleContextMenu = (event: any, objectId?: string, objectType?: 'process' | 'environment' | 'actor') => {
    event.preventDefault();
    
    if (objectId && objectType) {
      // Show context menu for object
      const contextMenu = document.createElement('div');
      contextMenu.className = 'fixed bg-white border border-gray-300 rounded shadow-lg z-50 py-1';
      contextMenu.style.left = `${event.clientX}px`;
      contextMenu.style.top = `${event.clientY}px`;
      
      const deleteOption = document.createElement('button');
      deleteOption.className = 'block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50';
      deleteOption.textContent = 'Delete';
      deleteOption.onclick = () => {
        removeObject(objectId, objectType);
        document.body.removeChild(contextMenu);
      };
      
      const duplicateOption = document.createElement('button');
      duplicateOption.className = 'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50';
      duplicateOption.textContent = 'Duplicate';
      duplicateOption.onclick = () => {
        // TODO: Implement duplication
        console.log('Duplicate:', objectId);
        document.body.removeChild(contextMenu);
      };
      
      contextMenu.appendChild(deleteOption);
      contextMenu.appendChild(duplicateOption);
      document.body.appendChild(contextMenu);
      
      // Remove context menu on outside click
      const removeMenu = () => {
        if (document.body.contains(contextMenu)) {
          document.body.removeChild(contextMenu);
        }
        document.removeEventListener('click', removeMenu);
      };
      setTimeout(() => document.addEventListener('click', removeMenu), 0);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - exit placement mode
      if (e.key === 'Escape' && placementMode?.active) {
        setPlacementMode(null);
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }
        return;
      }

      // Delete key
      if (e.key === 'Delete' && selectedObjectId && selectedObjectType) {
        removeObject(selectedObjectId, selectedObjectType);
        return;
      }

      // Don't handle other shortcuts during placement
      if (placementMode?.active) return;

      // Transform mode shortcuts
      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        // Only if no input is focused
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }

        // TODO: Implement transform mode changes via store
        // This would need to be handled by a parent component that has access to setTransformMode
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placementMode, selectedObjectId, selectedObjectType, removeObject]);

  // Update simulation
  useFrame((state) => {
    const currentTime = state.clock.getElapsedTime();
    const deltaTime = currentTime - lastTime.current;
    lastTime.current = currentTime;

    if (isPlaying && deltaTime > 0) {
      updateSimulation(deltaTime);
    }
  });

  // Setup transform controls
  useEffect(() => {
    if (transformControlsRef.current) {
      const controls = transformControlsRef.current;
      
      const handleChange = () => {
        if (selectedObjectId && selectedObjectType && controls.object) {
          const object = controls.object;
          const updates = {
            position: [object.position.x, object.position.y, object.position.z] as [number, number, number],
            rotation: [object.rotation.x, object.rotation.y, object.rotation.z] as [number, number, number],
            scale: [object.scale.x, object.scale.y, object.scale.z] as [number, number, number],
          };
          updateObject(selectedObjectId, selectedObjectType, updates);
        }
      };

      const handleMouseDown = () => {
        // Disable orbit controls when dragging transform handles
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = false;
        }
      };

      const handleMouseUp = () => {
        // Re-enable orbit controls after transform
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }
      };

      controls.addEventListener('change', handleChange);
      controls.addEventListener('mouseDown', handleMouseDown);
      controls.addEventListener('mouseUp', handleMouseUp);
      
      return () => {
        controls.removeEventListener('change', handleChange);
        controls.removeEventListener('mouseDown', handleMouseDown);
        controls.removeEventListener('mouseUp', handleMouseUp);
      };
    }
  }, [selectedObjectId, selectedObjectType, updateObject]);

  // Find selected object
  const selectedObject = selectedObjectId ? scene.getObjectByName(selectedObjectId) : null;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[20, 20, 10]}
        intensity={sceneSettings.lighting.intensity * 0.8}
        castShadow={sceneSettings.lighting.shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Environment - HDRI lighting */}
      <Environment 
        preset="warehouse"
        background={false}
        environmentIntensity={0.4}
      />

      {/* Grid */}
      {sceneSettings.grid.visible && (
        <Grid
          args={[sceneSettings.grid.size, sceneSettings.grid.divisions]}
          position={[0, -0.01, 0]}
          cellColor="#3a3a4a"
          sectionColor="#06b6d4"
          fadeDistance={40}
          fadeStrength={1}
        />
      )}

      {/* Ground plane for shadows and raycasting */}
      <mesh
        onClick={handleBackgroundClick}
        position={[0, -0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Contact shadows for better depth perception */}
      {sceneSettings.lighting.shadows && (
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.2}
          scale={80}
          blur={1}
          far={20}
        />
      )}

      {/* Process Nodes */}
      {processNodes.map((node) => (
        <group key={node.id} name={node.id}>
          <ProcessNodeComponent 
            node={node}
            onClick={(event) => handleObjectClick(node.id, 'process', event)}
            isSelected={selectedObjectId === node.id}
          />
        </group>
      ))}

      {/* Environment Assets */}
      {environmentAssets.map((asset) => (
        <group key={asset.id} name={asset.id}>
          <EnvironmentAssetComponent 
            asset={asset}
            onClick={(event) => handleObjectClick(asset.id, 'environment', event)}
            isSelected={selectedObjectId === asset.id}
          />
        </group>
      ))}

      {/* Actors */}
      {actors.map((actor) => (
        <group key={actor.id} name={actor.id}>
          <ActorComponent 
            actor={actor}
            onClick={(event) => handleObjectClick(actor.id, 'actor', event)}
            isSelected={selectedObjectId === actor.id}
          />
        </group>
      ))}

      {/* Edges */}
      {edges.map((edge) => {
        const fromNode = processNodes.find(n => n.id === edge.from);
        const toNode = processNodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) return null;
        
        return (
          <EdgeComponent
            key={edge.id}
            edge={edge}
            fromPosition={fromNode.position}
            toPosition={toNode.position}
            onClick={(event) => handleObjectClick(edge.id, 'process', event)}
            isSelected={selectedObjectId === edge.id}
          />
        );
      })}

      {/* Simulation Items */}
      {simulationItems.map((item) => (
        <SimulationItem key={item.id} item={item} />
      ))}

      {/* Placement Preview */}
      {placementMode?.active && (
        <PlacementPreview
          type={placementMode.type}
          category={placementMode.category}
          position={previewPosition}
        />
      )}

      {/* Transform Controls - Only show when not in placement mode */}
      {selectedObject && !placementMode?.active && (
        <TransformControls
          ref={transformControlsRef}
          object={selectedObject}
          mode={transformMode}
          showX={true}
          showY={transformMode !== 'translate'} // Hide Y axis for translate to keep objects on ground
          showZ={true}
          size={0.8}
          space="world"
        />
      )}

      {/* Orbit Controls */}
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={100}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.2} // Prevent looking under the ground
        target={[0, 0, 0]}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
      />

      {/* Placement instructions */}
      {placementMode?.active && (
        <Html position={[0, 5, 0]} center>
          <div className="bg-[#06b6d4] text-white px-4 py-2 rounded-lg shadow-lg pointer-events-none">
            <div className="text-center">
              <div className="font-medium">Placing: {placementMode.type.replace('-', ' ')}</div>
              <div className="text-sm opacity-90">Click to place • ESC to cancel</div>
            </div>
          </div>
        </Html>
      )}

      {/* Connection Manager for snapping */}
      <ConnectionManager />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <Html center>
      <div className="bg-[#252536] rounded-lg px-6 py-4 shadow-lg border border-[#3a3a4a]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#e0e0e0] font-medium">Loading 3D Scene...</span>
        </div>
      </div>
    </Html>
  );
}

// FPS Counter
function FPSCounter() {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useFrame(() => {
    frameCount.current++;
    const now = Date.now();
    
    if (now - lastTime.current >= 1000) {
      setFps(Math.round(frameCount.current / ((now - lastTime.current) / 1000)));
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  // Update the bottom bar FPS display via custom event
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('fpsUpdate', { detail: { fps } }));
  }, [fps]);

  return null;
}

// Main Viewport Component
export default function EditorViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sceneSettings } = useEditorStore();

  return (
    <div className="w-full h-full relative bg-[#1a1a2a]">
      <Canvas
        ref={canvasRef}
        shadows={sceneSettings.lighting.shadows}
        camera={{ 
          position: [15, 10, 15], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        className="touch-none"
      >
        {/* Camera */}
        <PerspectiveCamera 
          makeDefault 
          position={[15, 10, 15]} 
          fov={50}
          near={0.1}
          far={1000}
        />

        {/* Scene Content */}
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
          <FPSCounter />
        </Suspense>
      </Canvas>

      {/* Viewport overlay instructions */}
      <div className="absolute top-4 right-4 bg-[#252536]/90 backdrop-blur-sm rounded border border-[#3a3a4a] px-3 py-2 text-xs text-[#e0e0e0] pointer-events-none">
        <div className="space-y-1">
          <div><span className="text-[#06b6d4]">Left Click:</span> Select object</div>
          <div><span className="text-[#06b6d4]">Right Click:</span> Context menu</div>
          <div><span className="text-[#06b6d4]">Middle Drag:</span> Pan view</div>
          <div><span className="text-[#06b6d4]">Scroll:</span> Zoom</div>
        </div>
      </div>
    </div>
  );
}