'use client';

import { useState } from 'react';
import { 
  Package, 
  Layers, 
  Users, 
  Plus,
  Box,
  Truck,
  Wrench,
  Building,
  User,
  Settings,
} from 'lucide-react';
import { useEditorStore } from '../_store/editorStore';

// Library item data
const libraryItems = {
  process: [
    { type: 'source', name: 'Source', icon: '📤', description: 'Spawns items into the simulation' },
    { type: 'sink', name: 'Sink', icon: '📥', description: 'Consumes items from the simulation' },
    { type: 'conveyor', name: 'Conveyor', icon: '🚚', description: 'Moves items along a path' },
    { type: 'buffer', name: 'Buffer', icon: '📦', description: 'Temporary storage for items' },
    { type: 'machine', name: 'Machine', icon: '⚙️', description: 'Processes items with delay' },
    { type: 'router', name: 'Router', icon: '🔀', description: 'Splits flow into multiple paths' },
    { type: 'transfer-bridge', name: 'Transfer Bridge', icon: '🌉', description: 'Bridge over conveyor' },
    { type: 'popup-transfer', name: 'Pop-Up Transfer', icon: '⬆️', description: 'Lifts items up/down' },
    { type: 'pusher-transfer', name: 'Pusher Transfer', icon: '👋', description: 'Pushes items sideways' },
    { type: 'spiral-conveyor', name: 'Spiral Conveyor', icon: '🌪️', description: 'Helical conveyor path' },
    { type: 'vertical-lifter', name: 'Vertical Lifter', icon: '🏗️', description: 'Moves items vertically' },
    { type: 'pick-and-place', name: 'Pick & Place Robot', icon: '🤖', description: 'Automated pick and place' },
    { type: 'palletizer', name: 'Palletizer', icon: '📚', description: 'Stacks items on pallets' },
  ],
  environment: [
    { type: 'wall', name: 'Wall', icon: '🧱', description: 'Structural wall element' },
    { type: 'door', name: 'Door', icon: '🚪', description: 'Entrance/exit door' },
    { type: 'window', name: 'Window', icon: '🪟', description: 'Window with glass' },
    { type: 'stairs', name: 'Stairs', icon: '🪜', description: 'Staircase structure' },
    { type: 'safety-rail', name: 'Safety Rail', icon: '🛡️', description: 'Protective railing' },
    { type: 'floor-marking', name: 'Floor Marking', icon: '📏', description: 'Floor lines and markings' },
    { type: 'pallet-rack', name: 'Pallet Rack', icon: '🏢', description: 'Storage rack system' },
    { type: 'warehouse-shell', name: 'Warehouse Shell', icon: '🏭', description: 'Building structure' },
    { type: 'floor', name: 'Floor', icon: '⬜', description: 'Floor surface' },
  ],
  actors: [
    { type: 'operator', name: 'Operator', icon: '👷', description: 'Human worker' },
    { type: 'engineer', name: 'Engineer', icon: '👨‍🔧', description: 'Technical specialist' },
    { type: 'forklift', name: 'Forklift', icon: '🚗', description: 'Material handling vehicle' },
    { type: 'agv', name: 'AGV', icon: '🤖', description: 'Automated guided vehicle' },
  ],
} as const;

interface LibraryItemProps {
  item: {
    type: string;
    name: string;
    icon: string;
    description: string;
  };
  onAdd: () => void;
}

function LibraryItem({ item, onAdd }: LibraryItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => {
    setIsPressed(false);
    onAdd();
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer touch-target select-none ${
        isPressed
          ? 'bg-teal-50 border-teal-300 scale-95'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
      }`}
      onClick={onAdd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setIsPressed(false)}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0 mt-0.5">
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {item.name}
          </h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isPressed 
              ? 'bg-teal-500 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-teal-500 hover:text-white'
          }`}>
            <Plus size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPanel() {
  const { 
    activeLibraryTab, 
    setActiveLibraryTab, 
    addProcessNode, 
    addEnvironmentAsset, 
    addActor,
    addEdge,
    clearScene
  } = useEditorStore();

  const tabs = [
    { id: 'process', name: 'Process', icon: Package },
    { id: 'environment', name: 'Environment', icon: Building },
    { id: 'actors', name: 'Actors', icon: Users },
    { id: 'samples', name: 'Samples', icon: Settings },
  ] as const;

  const handleAddItem = (type: string, category: 'process' | 'environment' | 'actors') => {
    // Request placement mode in viewport
    window.dispatchEvent(new CustomEvent('requestPlacement', {
      detail: { type, category }
    }));
  };

  const createSampleLayout = (layoutType: string) => {
    clearScene();
    
    setTimeout(() => {
      switch (layoutType) {
        case 'basic-line':
          // Create a simple source -> conveyor -> sink line
          addProcessNode('source', [-8, 0, 0]);
          addProcessNode('conveyor', [0, 0, 0]);
          addProcessNode('sink', [8, 0, 0]);
          
          // Create edges after a short delay to ensure nodes exist
          setTimeout(() => {
            const allNodes = document.querySelectorAll('[data-node-type]');
            // This is a simple way - in a real app you'd track the actual node IDs
            // For now we'll create a basic flow demonstration
          }, 200);
          break;
        
      case 'assembly-line':
        // Create an assembly line with buffer and machine
        addProcessNode('source', [-12, 0, 0]);
        addProcessNode('conveyor', [-6, 0, 0]);
        addProcessNode('buffer', [0, 0, 0]);
        addProcessNode('machine', [6, 0, 0]);
        addProcessNode('conveyor', [12, 0, 0]);
        addProcessNode('sink', [18, 0, 0]);
        break;
        
      case 'warehouse':
        // Create a warehouse setup
        addEnvironmentAsset('warehouse-shell', [0, 0, 0]);
        addEnvironmentAsset('pallet-rack', [-8, 0, -5]);
        addEnvironmentAsset('pallet-rack', [8, 0, -5]);
        addProcessNode('source', [0, 0, 8]);
        addProcessNode('conveyor', [0, 0, 4]);
        addProcessNode('router', [0, 0, 0]);
        addActor('forklift', [-5, 0, 0]);
        addActor('operator', [5, 0, 0]);
        break;
    }
    }, 50);
  };

  const currentItems = activeLibraryTab === 'samples' ? [] : libraryItems[activeLibraryTab];
  
  const sampleLayouts = [
    { 
      id: 'basic-line', 
      type: 'sample',
      name: 'Basic Line', 
      icon: '➡️', 
      description: 'Simple source → conveyor → sink flow'
    },
    { 
      id: 'assembly-line', 
      type: 'sample',
      name: 'Assembly Line', 
      icon: '🏭', 
      description: 'Manufacturing line with buffer and machine'
    },
    { 
      id: 'warehouse', 
      type: 'sample',
      name: 'Warehouse', 
      icon: '🏢', 
      description: 'Warehouse with racks, forklift, and operators'
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h2 className="font-orbitron text-lg font-bold text-gray-900 mb-4">
          Library
        </h2>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLibraryTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-200 touch-target ${
                  activeLibraryTab === tab.id
                    ? 'bg-white text-teal-600 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-3">
          {/* Category Description */}
          <div className="text-sm text-gray-600 mb-4">
            {activeLibraryTab === 'process' && 
              'Manufacturing and material handling equipment for your simulation.'
            }
            {activeLibraryTab === 'environment' && 
              'Structural elements and facility components for your factory layout.'
            }
            {activeLibraryTab === 'actors' && 
              'People and vehicles that operate within your simulation.'
            }
            {activeLibraryTab === 'samples' && 
              'Pre-built sample layouts to get started quickly.'
            }
          </div>

          {/* Items Grid */}
          {activeLibraryTab === 'samples' ? (
            <div className="space-y-2">
              {sampleLayouts.map((layout) => (
                <LibraryItem
                  key={layout.id}
                  item={layout}
                  onAdd={() => createSampleLayout(layout.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {currentItems.map((item) => (
                <LibraryItem
                  key={item.type}
                  item={item}
                  onAdd={() => handleAddItem(item.type, activeLibraryTab)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Tips */}
        <div className="p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Desktop:</strong> Click to add items to the scene</p>
            <p><strong>Tablet/Mobile:</strong> Tap to place items</p>
            <p><strong>Transform:</strong> Select objects and use W/E/R keys or toolbar</p>
          </div>
        </div>
      </div>
    </div>
  );
}