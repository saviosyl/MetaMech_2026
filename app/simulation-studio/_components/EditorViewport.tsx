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
      // Gentle rotation for better visibility
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      // Pulse scale effect
      const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.05;
      groupRef.current.scale.setScalar(scale);
    }
  });

  // Get preview geometry based on category and type with more detail
  const getPreviewGeometry = () => {
    if (category === 'product') {
      const productDimensions: Record<string, [number, number, number]> = {
        'box': [0.25, 0.3, 0.25],
        'tote': [0.4, 0.4, 0.3],
        'pallet': [1.2, 0.15, 0.8],
        'bottle': [0.1, 0.35, 0.1],
        'bag': [0.3, 0.2, 0.2],
        'drum': [0.6, 0.9, 0.6],
      };
      const dims = productDimensions[type] || [0.25, 0.3, 0.25];
      return <boxGeometry args={dims} />;
    } else if (category === 'process') {
      // Different geometries for different process types
      if (type.includes('conveyor')) {
        return <boxGeometry args={[1, 0.3, 5]} />;
      } else if (type === 'machine') {
        return <boxGeometry args={[1.5, 2, 1.5]} />;
      } else if (type === 'buffer') {
        return <boxGeometry args={[1, 1.5, 1]} />;
      } else if (type === 'source' || type === 'sink') {
        return <boxGeometry args={[1, 1, 1]} />;
      } else {
        return <boxGeometry args={[1.5, 1, 1.5]} />;
      }
    } else if (category === 'environment') {
      if (type === 'wall') {
        return <boxGeometry args={[5, 3, 0.2]} />;
      } else if (type === 'pallet-rack') {
        return <boxGeometry args={[3, 4, 1.2]} />;
      } else {
        return <boxGeometry args={[2, 2, 2]} />;
      }
    } else if (category === 'actor') {
      if (type === 'forklift') {
        return <boxGeometry args={[1.2, 1.8, 2.5]} />;
      } else if (type === 'agv') {
        return <boxGeometry args={[1.2, 0.3, 2]} />;
      } else {
        return <boxGeometry args={[0.5, 2, 0.5]} />;
      }
    } else {
      return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const getColor = () => {
    switch (category) {
      case 'product': return "#f97316";
      case 'process': return "#06b6d4";
      case 'environment': return "#22c55e"; 
      case 'actor': return "#8b5cf6";
      default: return "#06b6d4";
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Preview wireframe */}
      <mesh>
        {getPreviewGeometry()}
        <meshBasicMaterial 
          color={getColor()} 
          wireframe 
          transparent 
          opacity={0.7} 
        />
      </mesh>
      {/* Solid preview (slightly transparent) */}
      <mesh>
        {getPreviewGeometry()}
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={0.2} 
        />
      </mesh>
      {/* Preview label */}
      <Html position={[0, 1.8, 0]} center>
        <div 
          className="text-white px-3 py-1 rounded-lg text-sm font-medium pointer-events-none shadow-lg"
          style={{ backgroundColor: getColor() }}
        >
          {type.replace('-', ' ').replace('_', ' ')}
        </div>
      </Html>
      {/* Ground projection circle */}
      <mesh position={[0, -position[1] + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2]} />
        <meshBasicMaterial 
          color={getColor()} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
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
    addProduct,
    removeObject,
  } = useEditorStore();

  // Duplicate object function
  const duplicateSelectedObject = () => {
    if (selectedObjectId && selectedObjectType) {
      let sourceObject;
      if (selectedObjectType === 'process') {
        sourceObject = processNodes.find(n => n.id === selectedObjectId);
      } else if (selectedObjectType === 'environment') {
        sourceObject = environmentAssets.find(a => a.id === selectedObjectId);
      } else if (selectedObjectType === 'actor') {
        sourceObject = actors.find(a => a.id === selectedObjectId);
      }
      
      if (sourceObject) {
        // Create duplicate at offset position
        const offset = 2.0;
        const newPosition: [number, number, number] = [
          sourceObject.position[0] + offset,
          sourceObject.position[1],
          sourceObject.position[2] + offset
        ];
        
        if (selectedObjectType === 'process') {
          addProcessNode(sourceObject.type as any, newPosition);
        } else if (selectedObjectType === 'environment') {
          addEnvironmentAsset(sourceObject.type as any, newPosition);
        } else if (selectedObjectType === 'actor') {
          addActor(sourceObject.type as any, newPosition);
        }
      }
    }
  };

  const { camera, gl, scene, raycaster, pointer } = useThree();
  const transformControlsRef = useRef<any>();
  const orbitControlsRef = useRef<any>();
  const lastTime = useRef(0);
  
  // Placement state
  const [placementMode, setPlacementMode] = useState<{
    active: boolean;
    type: string;
    category: 'process' | 'environment' | 'actor' | 'product';
  } | null>(null);
  const [previewPosition, setPreviewPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [connectionFlash, setConnectionFlash] = useState<{
    position: [number, number, number];
    active: boolean;
  } | null>(null);

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
        
        // Adjust Y position based on object type
        let yOffset = 0;
        if (placementMode.category === 'process' && placementMode.type.includes('conveyor')) {
          yOffset = 0.15; // Conveyor base height
        } else if (placementMode.category === 'environment' && placementMode.type === 'wall') {
          yOffset = 1.5; // Wall center height
        } else if (placementMode.category === 'actor') {
          yOffset = placementMode.type === 'agv' ? 0.15 : 1; // AGV or human height
        }
        
        setPreviewPosition([intersection.x, yOffset, intersection.z]);
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

    const handleProductPlacementRequest = (event: CustomEvent) => {
      const { productType } = event.detail;
      setPlacementMode({ active: true, type: productType, category: 'product' });
      
      // Disable orbit controls during placement
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }
    };

    window.addEventListener('requestPlacement', handlePlacementRequest as EventListener);
    window.addEventListener('requestProductPlacement', handleProductPlacementRequest as EventListener);
    return () => {
      window.removeEventListener('requestPlacement', handlePlacementRequest as EventListener);
      window.removeEventListener('requestProductPlacement', handleProductPlacementRequest as EventListener);
    };
  }, []);

  // Handle placement click
  const handlePlacementClick = (event: any) => {
    if (!placementMode?.active) return;
    
    event.stopPropagation();
    
    const { type, category } = placementMode;
    
    // Place the object and get the new object ID for selection
    let newObjectId: string | null = null;
    
    // Place the object
    switch (category) {
      case 'process':
        addProcessNode(type as any, previewPosition);
        // The store will automatically select the newly added object
        break;
      case 'environment':
        addEnvironmentAsset(type as any, previewPosition);
        // The store will automatically select the newly added object
        break;
      case 'actor':
        addActor(type as any, previewPosition);
        // The store will automatically select the newly added object
        break;
      case 'product':
        // For products, check if we're near a conveyor and snap to its surface
        const nearbyConveyor = findNearbyConveyor(previewPosition);
        if (nearbyConveyor) {
          // Place product ON TOP of the conveyor (y = conveyor_height + product_height/2)
          const conveyorHeight = nearbyConveyor.position[1] + 0.5; // Assuming conveyor height is 0.5
          const productHeight = getProductHeight(type);
          const productPosition: [number, number, number] = [
            nearbyConveyor.position[0], 
            conveyorHeight + productHeight / 2,
            nearbyConveyor.position[2]
          ];
          addProduct(type, productPosition, nearbyConveyor.id);
        } else {
          // Place product at preview position if not near a conveyor
          const productHeight = getProductHeight(type);
          const productPosition: [number, number, number] = [
            previewPosition[0], 
            previewPosition[1] + productHeight / 2,
            previewPosition[2]
          ];
          addProduct(type, productPosition);
        }
        break;
    }
    
    // Exit placement mode
    setPlacementMode(null);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }
    
    // Brief delay to ensure the object is rendered before trying to attach transform controls
    setTimeout(() => {
      // The store automatically selects the new object, so transform controls should attach
      if (transformControlsRef.current && selectedObjectId) {
        const target = scene.getObjectByName(selectedObjectId);
        if (target) {
          transformControlsRef.current.attach(target);
        }
      }
    }, 100);
  };

  // Helper function to find nearby conveyor
  const findNearbyConveyor = (position: [number, number, number]) => {
    const snapDistance = 2.0; // Distance to snap to conveyor
    
    return processNodes.find(node => {
      if (node.type === 'conveyor') {
        const distance = Math.sqrt(
          Math.pow(node.position[0] - position[0], 2) +
          Math.pow(node.position[2] - position[2], 2)
        );
        return distance <= snapDistance;
      }
      return false;
    });
  };

  // Helper function to get product height
  const getProductHeight = (productType: string) => {
    const heights: Record<string, number> = {
      'box': 0.3,
      'tote': 0.4,
      'pallet': 0.15,
      'bottle': 0.35,
      'bag': 0.2,
      'drum': 0.9,
    };
    return heights[productType] || 0.3;
  };

  // Handle object selection with raycast
  const handleObjectClick = (id: string, type: 'process' | 'environment' | 'actor', event: any) => {
    if (placementMode?.active) return; // Don't select during placement
    
    event.stopPropagation();
    setSelectedObject(id, type);
    
    // Force update transform controls
    if (transformControlsRef.current) {
      const target = scene.getObjectByName(id);
      if (target) {
        transformControlsRef.current.attach(target);
      }
    }
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
      // Select the object first
      setSelectedObject(objectId, objectType);
      
      // Show context menu for object
      const contextMenu = document.createElement('div');
      contextMenu.className = 'fixed bg-[#252536] border border-[#3a3a4a] rounded shadow-lg z-50 py-1 text-[#e0e0e0] min-w-[120px]';
      contextMenu.style.left = `${event.clientX}px`;
      contextMenu.style.top = `${event.clientY}px`;
      
      const deleteOption = document.createElement('button');
      deleteOption.className = 'block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2';
      deleteOption.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path></svg>Delete`;
      deleteOption.onclick = () => {
        if (confirm('Are you sure you want to delete this object?')) {
          removeObject(objectId, objectType);
        }
        document.body.removeChild(contextMenu);
      };
      
      const duplicateOption = document.createElement('button');
      duplicateOption.className = 'block w-full text-left px-3 py-2 text-sm text-[#e0e0e0] hover:bg-[#333345] flex items-center gap-2';
      duplicateOption.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5,15H4a2,2 0 0,1-2-2V4a2,2 0 0,1,2-2H13a2,2 0 0,1,2,2v1"></path></svg>Duplicate`;
      duplicateOption.onclick = () => {
        duplicateSelectedObject();
        document.body.removeChild(contextMenu);
      };

      const selectOption = document.createElement('button');
      selectOption.className = 'block w-full text-left px-3 py-2 text-sm text-[#06b6d4] hover:bg-[#333345] flex items-center gap-2';
      selectOption.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11 3 3 8-8"></path><path d="M21,12v7a2,2 0 0,1-2,2H5a2,2 0 0,1-2-2V5a2,2 0 0,1,2-2h11"></path></svg>Select`;
      selectOption.onclick = () => {
        setSelectedObject(objectId, objectType);
        document.body.removeChild(contextMenu);
      };
      
      contextMenu.appendChild(selectOption);
      contextMenu.appendChild(duplicateOption);
      contextMenu.appendChild(deleteOption);
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
        // Dispatch event to inform main page
        window.dispatchEvent(new CustomEvent('placementCanceled'));
        return;
      }

      // Delete key
      if (e.key === 'Delete' && selectedObjectId && selectedObjectType) {
        if (confirm('Are you sure you want to delete this object?')) {
          removeObject(selectedObjectId, selectedObjectType);
        }
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

  // Attach TransformControls to selected object when selection changes
  useEffect(() => {
    if (transformControlsRef.current && selectedObjectId) {
      const target = scene.getObjectByName(selectedObjectId);
      if (target) {
        transformControlsRef.current.attach(target);
      } else {
        transformControlsRef.current.detach();
      }
    } else if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
  }, [selectedObjectId, scene]);

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
            onContextMenu={(event) => handleContextMenu(event, node.id, 'process')}
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
            onContextMenu={(event) => handleContextMenu(event, asset.id, 'environment')}
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
            onContextMenu={(event) => handleContextMenu(event, actor.id, 'actor')}
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

      {/* Transform Controls - Only show when not in placement mode and not in mate mode */}
      {selectedObject && !placementMode?.active && transformMode !== 'mate' && (
        <TransformControls
          ref={transformControlsRef}
          object={selectedObject}
          mode={transformMode}
          showX={true}
          showY={transformMode !== 'translate'} // Hide Y axis for translate to keep objects on ground
          showZ={true}
          size={0.8}
          space="world"
          enabled={true}
          // Use standard RGB=XYZ color convention
          axisColors={[0xff0000, 0x00ff00, 0x0000ff]} // Red=X, Green=Y, Blue=Z
        />
      )}

      {/* Connection Ports Visualization - Show all ports in mate mode */}
      {transformMode === 'mate' && processNodes.map(node => {
        const length = node.parameters?.length || 5;
        return (
          <group key={`ports-${node.id}`} position={node.position}>
            {/* Input port (green circle) */}
            <mesh position={[0, 0.5, -length/2 - 0.15]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial 
                color="#22c55e" 
                emissive="#22c55e" 
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Output port (blue circle) */}
            <mesh position={[0, 0.5, length/2 + 0.15]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial 
                color="#3b82f6" 
                emissive="#3b82f6" 
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}

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
        <Html position={[0, 6, 0]} center>
          <div className="bg-[#252536] border border-[#3a3a4a] text-[#e0e0e0] px-4 py-3 rounded-lg shadow-xl pointer-events-none backdrop-blur-sm">
            <div className="text-center space-y-1">
              <div className="font-semibold text-lg">Placing: {placementMode.type.replace('-', ' ')}</div>
              <div className="text-sm text-[#888] space-y-0.5">
                <div>• <span className="text-[#06b6d4]">Click</span> to place at cursor position</div>
                <div>• <span className="text-[#06b6d4]">ESC</span> to cancel placement mode</div>
                <div>• Objects snap to 0.5m grid automatically</div>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Mate tool instructions */}
      {transformMode === 'mate' && !placementMode?.active && (
        <Html position={[0, 6, 0]} center>
          <div className="bg-[#252536] border border-[#3a3a4a] text-[#e0e0e0] px-4 py-3 rounded-lg shadow-xl pointer-events-none backdrop-blur-sm">
            <div className="text-center space-y-1">
              <div className="font-semibold text-lg flex items-center justify-center gap-2">
                🔗 Mate Tool Active
              </div>
              <div className="text-sm text-[#888] space-y-0.5">
                <div>• Select and drag objects near other objects to connect</div>
                <div>• <span className="text-[#22c55e] font-medium">Green circles</span> = Input ports</div>
                <div>• <span className="text-[#3b82f6] font-medium">Blue circles</span> = Output ports</div>
                <div>• Connections snap automatically when objects align</div>
                <div>• Press <span className="text-[#06b6d4]">W/E/R</span> to exit mate mode</div>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Empty state message */}
      {processNodes.length === 0 && environmentAssets.length === 0 && actors.length === 0 && !placementMode?.active && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-[#252536]/90 backdrop-blur-sm border border-[#3a3a4a] text-[#e0e0e0] px-8 py-6 rounded-lg shadow-xl pointer-events-none">
            <div className="text-center space-y-3">
              <div className="text-2xl font-semibold text-[#06b6d4]">Start Building Your Simulation</div>
              <div className="text-lg text-[#888]">Click a component from the Library to start building</div>
              <div className="text-sm text-[#666] space-y-1 mt-4">
                <div>• Drag objects from the <span className="text-[#06b6d4]">Library panel</span> on the left</div>
                <div>• Use <span className="text-[#06b6d4]">W/E/R</span> keys to switch between Move/Rotate/Scale tools</div>
                <div>• Right-click objects for context menu</div>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Connection success flash effect */}
      {connectionFlash?.active && (
        <group position={connectionFlash.position}>
          <mesh>
            <sphereGeometry args={[1]} />
            <meshStandardMaterial 
              color="#06b6d4" 
              emissive="#06b6d4" 
              emissiveIntensity={1}
              transparent
              opacity={0.6}
            />
          </mesh>
          {/* Expanding ring effect */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 1.5]} />
            <meshBasicMaterial 
              color="#06b6d4" 
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
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
      <div className="absolute top-4 right-4 bg-[#252536]/90 backdrop-blur-sm rounded border border-[#3a3a4a] px-4 py-3 text-sm text-[#e0e0e0] pointer-events-none">
        <div className="space-y-1.5">
          <div><span className="text-[#06b6d4] font-medium">Left Click:</span> Select object</div>
          <div><span className="text-[#06b6d4] font-medium">Right Click:</span> Context menu</div>
          <div><span className="text-[#06b6d4] font-medium">Middle Drag:</span> Pan view</div>
          <div><span className="text-[#06b6d4] font-medium">Scroll:</span> Zoom</div>
          <div className="border-t border-[#3a3a4a] pt-1.5 mt-2">
            <div><span className="text-[#06b6d4] font-medium">W/E/R:</span> Move/Rotate/Scale</div>
            <div><span className="text-[#06b6d4] font-medium">M:</span> Mate tool</div>
            <div><span className="text-[#06b6d4] font-medium">Space:</span> Play/Pause</div>
          </div>
        </div>
      </div>
    </div>
  );
}