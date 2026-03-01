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
  activeLibraryTab: 'process' | 'environment' | 'actors' | 'samples';
  showPropertiesPanel: boolean;
  
  // Project state
  projectName: string;
  isDirty: boolean;
  lastSaved: number;
  
  // Connection points for snapping
  connectionPoints: Array<{
    objectId: string;
    portId: string;
    position: [number, number, number];
    type: 'input' | 'output';
    connected: boolean;
  }>;
  
  // Snapping state
  snapMode: boolean;
  snapDistance: number;
  highlightedPorts: string[];

  // Actions
  addProcessNode: (type: ProcessNode['type'], position: [number, number, number]) => void;
  addEnvironmentAsset: (type: EnvironmentAsset['type'], position: [number, number, number]) => void;
  addActor: (type: Actor['type'], position: [number, number, number]) => void;
  
  // Snapping actions
  setSnapMode: (enabled: boolean) => void;
  updateConnectionPoints: () => void;
  setHighlightedPorts: (portIds: string[]) => void;
  autoConnectPorts: (sourcePortId: string, targetPortId: string) => void;
  
  updateObject: (id: string, type: 'process' | 'environment' | 'actor', updates: any) => void;
  removeObject: (id: string, type: 'process' | 'environment' | 'actor') => void;
  
  addEdge: (from: string, to: string) => void;
  removeEdge: (id: string) => void;
  
  setSelectedObject: (id: string | null, type: 'process' | 'environment' | 'actor' | null) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  
  setSceneSettings: (settings: Partial<SceneSettings>) => void;
  setActiveLibraryTab: (tab: 'process' | 'environment' | 'actors' | 'samples') => void;
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
  
  // Connection points and snapping
  connectionPoints: [],
  snapMode: true,
  snapDistance: 0.5,
  highlightedPorts: [],
  
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
  
  addEdge: (from, to) => {
    const newEdge: ProcessEdge = {
      id: uuidv4(),
      from,
      to,
      parameters: {},
    };
    
    set(state => ({
      edges: [...state.edges, newEdge],
      isDirty: true,
    }));
  },
  
  removeEdge: (id) => {
    set(state => ({
      edges: state.edges.filter(edge => edge.id !== id),
      isDirty: true,
    }));
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
      const shouldSpawn = Math.random() < (spawnRate * dt * 0.5); // Reduce spawn rate for better visualization
      
      if (shouldSpawn) {
        const newItem: SimulationItem = {
          id: uuidv4(),
          productId: source.parameters.productType || 'default',
          position: [source.position[0], source.position[1] + 0.5, source.position[2]] as [number, number, number],
          targetPosition: [source.position[0], source.position[1] + 0.5, source.position[2]] as [number, number, number],
          currentNode: source.id,
          progress: 1, // Start at 100% progress to find next node
          speed: 2.0,
        };
        newItems.push(newItem);
        produced++;
      }
    });
    
    // Update item positions and find paths
    newItems = newItems.map(item => {
      const updatedItem = { ...item };
      
      // If item has completed its path to current node, find next destination
      if (updatedItem.progress >= 1 && !updatedItem.nextNode) {
        const currentNode = state.processNodes.find(n => n.id === updatedItem.currentNode);
        
        if (currentNode) {
          // Find outgoing edges from current node
          const outgoingEdges = state.edges.filter(edge => edge.from === updatedItem.currentNode);
          
          if (outgoingEdges.length > 0) {
            // For now, just take the first outgoing edge (could add routing logic here)
            const nextEdge = outgoingEdges[0];
            const nextNode = state.processNodes.find(n => n.id === nextEdge.to);
            
            if (nextNode) {
              updatedItem.nextNode = nextNode.id;
              updatedItem.targetPosition = [
                nextNode.position[0], 
                nextNode.position[1] + 0.5, 
                nextNode.position[2]
              ] as [number, number, number];
              updatedItem.progress = 0;
            }
          } else if (currentNode.type === 'sink') {
            // Item reached sink, mark for removal
            updatedItem.progress = 2; // Special value to mark for removal
          }
        }
      }
      
      // Move item towards target
      if (updatedItem.progress < 1 && updatedItem.targetPosition) {
        updatedItem.progress = Math.min(1, updatedItem.progress + dt * updatedItem.speed);
        
        // Linear interpolation to target
        const t = updatedItem.progress;
        const startPos = updatedItem.position;
        const targetPos = updatedItem.targetPosition;
        
        updatedItem.position = [
          startPos[0] * (1 - t) + targetPos[0] * t,
          startPos[1] * (1 - t) + targetPos[1] * t,
          startPos[2] * (1 - t) + targetPos[2] * t,
        ];
        
        // If reached target, update current node
        if (updatedItem.progress >= 1 && updatedItem.nextNode) {
          updatedItem.currentNode = updatedItem.nextNode;
          updatedItem.nextNode = undefined;
        }
      }
      
      return updatedItem;
    });
    
    // Remove items at sinks
    newItems = newItems.filter(item => {
      if (item.progress >= 2) { // Items marked for removal at sink
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
  
  // Snapping actions
  setSnapMode: (enabled) => {
    set({ snapMode: enabled });
  },
  
  updateConnectionPoints: () => {
    const state = get();
    const points: Array<{
      objectId: string;
      portId: string;
      position: [number, number, number];
      type: 'input' | 'output';
      connected: boolean;
    }> = [];
    
    // Generate connection points for process nodes
    state.processNodes.forEach(node => {
      if (node.type === 'conveyor' || node.type === 'machine' || 
          node.type === 'buffer' || node.type === 'source' || node.type === 'sink') {
        
        const length = node.parameters?.length || 2;
        
        // Input port (rear of object)
        if (node.type !== 'source') {
          points.push({
            objectId: node.id,
            portId: `${node.id}_input`,
            position: [
              node.position[0],
              node.position[1] + 0.5,
              node.position[2] - length/2 - 0.1
            ],
            type: 'input',
            connected: state.edges.some(e => e.to === node.id)
          });
        }
        
        // Output port (front of object)
        if (node.type !== 'sink') {
          points.push({
            objectId: node.id,
            portId: `${node.id}_output`,
            position: [
              node.position[0],
              node.position[1] + 0.5,
              node.position[2] + length/2 + 0.1
            ],
            type: 'output',
            connected: state.edges.some(e => e.from === node.id)
          });
        }
      }
    });
    
    set({ connectionPoints: points });
  },
  
  setHighlightedPorts: (portIds) => {
    set({ highlightedPorts: portIds });
  },
  
  autoConnectPorts: (sourcePortId, targetPortId) => {
    const state = get();
    
    // Extract object IDs from port IDs
    const sourceObjectId = sourcePortId.replace('_output', '').replace('_input', '');
    const targetObjectId = targetPortId.replace('_output', '').replace('_input', '');
    
    // Verify ports exist and are compatible
    const sourcePort = state.connectionPoints.find(p => p.portId === sourcePortId);
    const targetPort = state.connectionPoints.find(p => p.portId === targetPortId);
    
    if (sourcePort && targetPort && 
        sourcePort.type === 'output' && targetPort.type === 'input' &&
        !sourcePort.connected && !targetPort.connected) {
      
      // Create edge
      const newEdge: ProcessEdge = {
        id: uuidv4(),
        from: sourceObjectId,
        to: targetObjectId,
        parameters: {},
      };
      
      set(state => ({
        edges: [...state.edges, newEdge],
        isDirty: true,
      }));
      
      // Update connection points
      get().updateConnectionPoints();
    }
  },
}));

// Helper function to get default parameters for different object types
function getDefaultParameters(type: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    // Process nodes
    source: { 
      spawnRate: 1.0, 
      productType: 'default',
      itemType: 'box' // box, tote, pallet, bottle
    },
    sink: { capacity: 100 },
    conveyor: { 
      length: 5, 
      width: 1, 
      speed: 1.0, 
      type: 'roller' // belt, roller, chain, modular-belt
    },
    buffer: { capacity: 10 },
    machine: { 
      processingTime: 2.0, 
      capacity: 1,
      type: 'cnc' // cnc, assembly, inspection, packaging
    },
    router: { 
      mode: 'divert' // divert, merge
    },
    'transfer-bridge': { length: 2 },
    'popup-transfer': { height: 0.5, speed: 1.0 },
    'pusher-transfer': { force: 1.0, angle: 90 },
    'spiral-conveyor': { 
      radius: 2, 
      height: 5, 
      speed: 0.5,
      direction: 'up' // up, down
    },
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
    'pallet-rack': { width: 3, height: 4, depth: 1.2, levels: 4, bays: 2 },
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