import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface ProcessNode {
  id: string;
  type: 'source' | 'sink' | 'conveyor' | 'buffer' | 'machine' | 'router' | 
        'transfer-bridge' | 'popup-transfer' | 'pusher-transfer' | 
        'spiral-conveyor' | 'vertical-lifter' | 'pick-and-place' | 'palletizer';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parameters: Record<string, any>;
  name: string;
}

export interface EnvironmentAsset {
  id: string;
  type: 'wall' | 'door' | 'window' | 'stairs' | 'safety-rail' | 
        'floor-marking' | 'pallet-rack' | 'warehouse-shell' | 'floor';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parameters: Record<string, any>;
  name: string;
}

export interface Actor {
  id: string;
  type: 'operator' | 'engineer' | 'forklift' | 'agv';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parameters: Record<string, any>;
  name: string;
}

export interface ProcessEdge {
  id: string;
  from: string;
  to: string;
  parameters: Record<string, any>;
}

export interface Underlay {
  id: string;
  url: string;
  opacity: number;
  visible: boolean;
  locked: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SceneSettings {
  environment: 'factory' | 'studio-white' | 'dark-showroom' | 'transparent';
  lighting: {
    intensity: number;
    shadows: boolean;
  };
  grid: {
    visible: boolean;
    size: number;
    divisions: number;
  };
  axes: {
    visible: boolean;
    size: number;
  };
}

export interface CustomProduct {
  id: string;
  name: string;
  model?: string;
  color: string;
  dimensions: [number, number, number];
}

export interface SimulationItem {
  id: string;
  productId: string;
  position: [number, number, number];
  targetPosition: [number, number, number];
  currentNode: string;
  nextNode?: string;
  progress: number;
  speed: number;
}

interface EditorState {
  // Scene objects
  processNodes: ProcessNode[];
  environmentAssets: EnvironmentAsset[];
  actors: Actor[];
  edges: ProcessEdge[];
  underlay: Underlay | null;
  customProducts: CustomProduct[];
  
  // Scene settings
  sceneSettings: SceneSettings;
  
  // Selection and tools
  selectedObjectId: string | null;
  selectedObjectType: 'process' | 'environment' | 'actor' | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  
  // Simulation state
  isPlaying: boolean;
  simulationSpeed: number;
  simulationItems: SimulationItem[];
  
  // KPIs
  totalItemsProduced: number;
  totalItemsConsumed: number;
  simulationTime: number;
  
  // UI state
  activeLibraryTab: 'process' | 'environment' | 'actors';
  showPropertiesPanel: boolean;
  
  // Project state
  projectName: string;
  isDirty: boolean;
  lastSaved: number;
  
  // Actions
  addProcessNode: (type: ProcessNode['type'], position: [number, number, number]) => void;
  addEnvironmentAsset: (type: EnvironmentAsset['type'], position: [number, number, number]) => void;
  addActor: (type: Actor['type'], position: [number, number, number]) => void;
  
  updateObject: (id: string, type: 'process' | 'environment' | 'actor', updates: any) => void;
  removeObject: (id: string, type: 'process' | 'environment' | 'actor') => void;
  
  setSelectedObject: (id: string | null, type: 'process' | 'environment' | 'actor' | null) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  
  setSceneSettings: (settings: Partial<SceneSettings>) => void;
  setActiveLibraryTab: (tab: 'process' | 'environment' | 'actors') => void;
  setShowPropertiesPanel: (show: boolean) => void;
  
  // Simulation controls
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSimulationSpeed: (speed: number) => void;
  updateSimulation: (deltaTime: number) => void;
  
  // Project management
  setProjectName: (name: string) => void;
  markDirty: () => void;
  markClean: () => void;
  
  // Scene management
  clearScene: () => void;
  loadScene: (data: any) => void;
  getSceneData: () => any;
}

const defaultSceneSettings: SceneSettings = {
  environment: 'factory',
  lighting: {
    intensity: 1.0,
    shadows: true,
  },
  grid: {
    visible: true,
    size: 50,
    divisions: 50,
  },
  axes: {
    visible: true,
    size: 5,
  },
};

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  processNodes: [],
  environmentAssets: [],
  actors: [],
  edges: [],
  underlay: null,
  customProducts: [],
  
  sceneSettings: defaultSceneSettings,
  
  selectedObjectId: null,
  selectedObjectType: null,
  transformMode: 'translate',
  
  isPlaying: false,
  simulationSpeed: 1.0,
  simulationItems: [],
  
  totalItemsProduced: 0,
  totalItemsConsumed: 0,
  simulationTime: 0,
  
  activeLibraryTab: 'process',
  showPropertiesPanel: true,
  
  projectName: 'Untitled Project',
  isDirty: false,
  lastSaved: 0,
  
  // Actions
  addProcessNode: (type, position) => {
    const newNode: ProcessNode = {
      id: uuidv4(),
      type,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      parameters: getDefaultParameters(type),
      name: `${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}_${Date.now()}`,
    };
    
    set(state => ({
      processNodes: [...state.processNodes, newNode],
      selectedObjectId: newNode.id,
      selectedObjectType: 'process',
      isDirty: true,
    }));
  },
  
  addEnvironmentAsset: (type, position) => {
    const newAsset: EnvironmentAsset = {
      id: uuidv4(),
      type,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      parameters: getDefaultParameters(type),
      name: `${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}_${Date.now()}`,
    };
    
    set(state => ({
      environmentAssets: [...state.environmentAssets, newAsset],
      selectedObjectId: newAsset.id,
      selectedObjectType: 'environment',
      isDirty: true,
    }));
  },
  
  addActor: (type, position) => {
    const newActor: Actor = {
      id: uuidv4(),
      type,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      parameters: getDefaultParameters(type),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}_${Date.now()}`,
    };
    
    set(state => ({
      actors: [...state.actors, newActor],
      selectedObjectId: newActor.id,
      selectedObjectType: 'actor',
      isDirty: true,
    }));
  },
  
  updateObject: (id, type, updates) => {
    set(state => {
      let newState: Partial<EditorState> = { isDirty: true };
      
      if (type === 'process') {
        newState.processNodes = state.processNodes.map(node =>
          node.id === id ? { ...node, ...updates } : node
        );
      } else if (type === 'environment') {
        newState.environmentAssets = state.environmentAssets.map(asset =>
          asset.id === id ? { ...asset, ...updates } : asset
        );
      } else if (type === 'actor') {
        newState.actors = state.actors.map(actor =>
          actor.id === id ? { ...actor, ...updates } : actor
        );
      }
      
      return { ...state, ...newState };
    });
  },
  
  removeObject: (id, type) => {
    set(state => {
      const newState: Partial<EditorState> = {
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === id ? null : state.selectedObjectType,
        isDirty: true,
      };
      
      if (type === 'process') {
        newState.processNodes = state.processNodes.filter(node => node.id !== id);
        // Remove edges connected to this node
        newState.edges = state.edges.filter(edge => edge.from !== id && edge.to !== id);
      } else if (type === 'environment') {
        newState.environmentAssets = state.environmentAssets.filter(asset => asset.id !== id);
      } else if (type === 'actor') {
        newState.actors = state.actors.filter(actor => actor.id !== id);
      }
      
      return { ...state, ...newState };
    });
  },
  
  setSelectedObject: (id, type) => {
    set({ selectedObjectId: id, selectedObjectType: type });
  },
  
  setTransformMode: (mode) => {
    set({ transformMode: mode });
  },
  
  setSceneSettings: (settings) => {
    set(state => ({
      sceneSettings: { ...state.sceneSettings, ...settings },
      isDirty: true,
    }));
  },
  
  setActiveLibraryTab: (tab) => {
    set({ activeLibraryTab: tab });
  },
  
  setShowPropertiesPanel: (show) => {
    set({ showPropertiesPanel: show });
  },
  
  play: () => {
    set({ isPlaying: true });
  },
  
  pause: () => {
    set({ isPlaying: false });
  },
  
  reset: () => {
    set({ 
      isPlaying: false,
      simulationItems: [],
      totalItemsProduced: 0,
      totalItemsConsumed: 0,
      simulationTime: 0,
    });
  },
  
  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
  },
  
  updateSimulation: (deltaTime) => {
    const state = get();
    if (!state.isPlaying) return;
    
    const dt = deltaTime * state.simulationSpeed;
    let newItems = [...state.simulationItems];
    let produced = state.totalItemsProduced;
    let consumed = state.totalItemsConsumed;
    
    // Update simulation time
    const newSimulationTime = state.simulationTime + dt;
    
    // Spawn items from sources
    const sources = state.processNodes.filter(node => node.type === 'source');
    sources.forEach(source => {
      const spawnRate = source.parameters.spawnRate || 1.0;
      const shouldSpawn = Math.random() < (spawnRate * dt);
      
      if (shouldSpawn) {
        const newItem: SimulationItem = {
          id: uuidv4(),
          productId: source.parameters.productType || 'default',
          position: [...source.position] as [number, number, number],
          targetPosition: [...source.position] as [number, number, number],
          currentNode: source.id,
          progress: 0,
          speed: 1.0,
        };
        newItems.push(newItem);
        produced++;
      }
    });
    
    // Update item positions
    newItems = newItems.map(item => {
      const updatedItem = { ...item };
      
      // Simple movement logic - move towards target
      if (updatedItem.progress < 1) {
        updatedItem.progress = Math.min(1, updatedItem.progress + dt * updatedItem.speed);
        
        // Linear interpolation to target
        const t = updatedItem.progress;
        updatedItem.position = [
          updatedItem.position[0] * (1 - t) + updatedItem.targetPosition[0] * t,
          updatedItem.position[1] * (1 - t) + updatedItem.targetPosition[1] * t,
          updatedItem.position[2] * (1 - t) + updatedItem.targetPosition[2] * t,
        ];
      }
      
      return updatedItem;
    });
    
    // Remove items at sinks
    const sinks = state.processNodes.filter(node => node.type === 'sink');
    newItems = newItems.filter(item => {
      const currentNode = state.processNodes.find(n => n.id === item.currentNode);
      if (currentNode && currentNode.type === 'sink' && item.progress >= 1) {
        consumed++;
        return false;
      }
      return true;
    });
    
    set({
      simulationItems: newItems,
      totalItemsProduced: produced,
      totalItemsConsumed: consumed,
      simulationTime: newSimulationTime,
    });
  },
  
  setProjectName: (name) => {
    set({ projectName: name, isDirty: true });
  },
  
  markDirty: () => {
    set({ isDirty: true });
  },
  
  markClean: () => {
    set({ isDirty: false, lastSaved: Date.now() });
  },
  
  clearScene: () => {
    set({
      processNodes: [],
      environmentAssets: [],
      actors: [],
      edges: [],
      underlay: null,
      simulationItems: [],
      selectedObjectId: null,
      selectedObjectType: null,
      isPlaying: false,
      totalItemsProduced: 0,
      totalItemsConsumed: 0,
      simulationTime: 0,
      isDirty: false,
    });
  },
  
  loadScene: (data) => {
    set({
      processNodes: data.processNodes || [],
      environmentAssets: data.environmentAssets || [],
      actors: data.actors || [],
      edges: data.edges || [],
      underlay: data.underlay || null,
      sceneSettings: { ...defaultSceneSettings, ...(data.sceneSettings || {}) },
      customProducts: data.customProducts || [],
      projectName: data.projectName || 'Untitled Project',
      selectedObjectId: null,
      selectedObjectType: null,
      isPlaying: false,
      simulationItems: [],
      totalItemsProduced: 0,
      totalItemsConsumed: 0,
      simulationTime: 0,
      isDirty: false,
      lastSaved: data.lastSaved || 0,
    });
  },
  
  getSceneData: () => {
    const state = get();
    return {
      processNodes: state.processNodes,
      environmentAssets: state.environmentAssets,
      actors: state.actors,
      edges: state.edges,
      underlay: state.underlay,
      sceneSettings: state.sceneSettings,
      customProducts: state.customProducts,
      projectName: state.projectName,
      lastSaved: state.lastSaved,
      version: '1.0.0',
    };
  },
}));

// Helper function to get default parameters for different object types
function getDefaultParameters(type: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    // Process nodes
    source: { spawnRate: 1.0, productType: 'default' },
    sink: { capacity: 100 },
    conveyor: { length: 5, width: 1, speed: 1.0 },
    buffer: { capacity: 10 },
    machine: { processingTime: 2.0, capacity: 1 },
    router: { mode: 'round-robin' },
    'transfer-bridge': { length: 2 },
    'popup-transfer': { height: 0.5, speed: 1.0 },
    'pusher-transfer': { force: 1.0, angle: 90 },
    'spiral-conveyor': { radius: 2, height: 5, speed: 0.5 },
    'vertical-lifter': { height: 3, speed: 1.0 },
    'pick-and-place': { reach: 3, speed: 1.0 },
    palletizer: { palletSize: [1.2, 0.8], stackHeight: 1.5 },
    
    // Environment
    wall: { width: 5, height: 3, thickness: 0.2 },
    door: { width: 2, height: 2.5, thickness: 0.1 },
    window: { width: 2, height: 1.5, thickness: 0.1 },
    stairs: { width: 2, steps: 10, stepHeight: 0.2 },
    'safety-rail': { length: 5, height: 1.2 },
    'floor-marking': { length: 5, width: 0.2, color: 'yellow' },
    'pallet-rack': { width: 3, height: 4, depth: 1.2, levels: 4 },
    'warehouse-shell': { width: 20, height: 8, depth: 15 },
    floor: { width: 50, depth: 50, color: '#f0f0f0' },
    
    // Actors
    operator: { walkSpeed: 1.5, color: '#4f46e5' },
    engineer: { walkSpeed: 1.2, color: '#059669' },
    forklift: { speed: 3.0, liftHeight: 4, capacity: 2000 },
    agv: { speed: 2.0, capacity: 500, batteryLevel: 100 },
  };
  
  return defaults[type] || {};
}