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
  } = useEditorStore();

  const { camera, gl, scene } = useThree();
  const transformControlsRef = useRef<any>();
  const lastTime = useRef(0);

  // Handle object selection
  const handleObjectClick = (id: string, type: 'process' | 'environment' | 'actor', event: any) => {
    event.stopPropagation();
    setSelectedObject(id, type);
  };

  // Handle background click (deselect)
  const handleBackgroundClick = () => {
    setSelectedObject(null, null);
  };

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

      controls.addEventListener('change', handleChange);
      return () => controls.removeEventListener('change', handleChange);
    }
  }, [selectedObjectId, selectedObjectType, updateObject]);

  // Find selected object
  const selectedObject = selectedObjectId ? scene.getObjectByName(selectedObjectId) : null;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={sceneSettings.lighting.intensity}
        castShadow={sceneSettings.lighting.shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Environment */}
      <Environment 
        preset={
          sceneSettings.environment === 'factory' ? 'warehouse' :
          sceneSettings.environment === 'studio-white' ? 'studio' :
          sceneSettings.environment === 'dark-showroom' ? 'night' :
          'warehouse'
        }
        background={sceneSettings.environment !== 'transparent'}
      />

      {/* Grid */}
      {sceneSettings.grid.visible && (
        <Grid
          args={[sceneSettings.grid.size, sceneSettings.grid.divisions]}
          position={[0, -0.01, 0]}
          cellColor="#6b7280"
          sectionColor="#374151"
          fadeDistance={30}
          fadeStrength={1}
        />
      )}

      {/* Axes Helper */}
      {sceneSettings.axes.visible && (
        <axesHelper args={[sceneSettings.axes.size]} />
      )}

      {/* Ground plane for shadows */}
      {sceneSettings.lighting.shadows && (
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.3}
          scale={50}
          blur={2}
          far={10}
        />
      )}

      {/* Background click handler */}
      <mesh
        onClick={handleBackgroundClick}
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

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

      {/* Transform Controls */}
      {selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          object={selectedObject}
          mode={transformMode}
          showX={true}
          showY={true}
          showZ={true}
          size={1}
          space="world"
        />
      )}
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <Html center>
      <div className="bg-white rounded-lg px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-700 font-medium">Loading 3D Scene...</span>
        </div>
      </div>
    </Html>
  );
}

// Performance Monitor (optional)
function PerformanceMonitor() {
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

  return (
    <Html position={[-8, 6, 0]}>
      <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        FPS: {fps}
      </div>
    </Html>
  );
}

// Main Viewport Component
export default function EditorViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { sceneSettings } = useEditorStore();

  // Handle touch events for mobile
  const handleTouchStart = () => setIsDragging(false);
  const handleTouchMove = () => setIsDragging(true);

  return (
    <div className="w-full h-full relative">
      <Canvas
        ref={canvasRef}
        shadows={sceneSettings.lighting.shadows}
        camera={{ position: [10, 8, 10], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="touch-none" // Prevent default touch behaviors
      >
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={50} />
        
        {/* Controls - Touch enabled by default */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={100}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
          // Touch controls are enabled by default in drei OrbitControls
        />

        {/* Scene Content */}
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>

        {/* Performance Monitor (development only) */}
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
      </Canvas>

      {/* Touch Helper Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Touch hints for mobile users */}
        <div className="md:hidden absolute top-4 left-4 bg-black bg-opacity-60 text-white text-xs px-3 py-2 rounded-lg">
          <div>Tap: Select • Drag: Orbit • Pinch: Zoom</div>
        </div>
      </div>
    </div>
  );
}