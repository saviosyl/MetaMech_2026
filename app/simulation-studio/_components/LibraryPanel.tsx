'use client';

import { useState, useMemo } from 'react';
import { 
  Plus,
  Search,
  Pin,
  Minimize2,
  Menu,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useEditorStore } from '../_store/editorStore';

// Library item data organized by category
const libraryData = {
  processEquipment: {
    title: 'Process Equipment',
    icon: '⚙️',
    items: [
      { type: 'source', name: 'Source', icon: '📤', description: 'Spawns items into the simulation' },
      { type: 'sink', name: 'Sink', icon: '📥', description: 'Consumes items from the simulation' },
      { type: 'conveyor', name: 'Conveyor', icon: '🚚', description: 'Moves items along a path' },
      { type: 'buffer', name: 'Buffer', icon: '📦', description: 'Temporary storage for items' },
      { type: 'machine', name: 'Machine', icon: '⚙️', description: 'Processes items with delay' },
      { type: 'router', name: 'Router', icon: '🔀', description: 'Splits flow into multiple paths' },
      { type: 'transfer-bridge', name: 'Transfer Bridge', icon: '🌉', description: 'Bridge over conveyor' },
      { type: 'spiral-conveyor', name: 'Spiral Conveyor', icon: '🌪️', description: 'Helical conveyor path' },
      { type: 'vertical-lifter', name: 'Vertical Lifter', icon: '🏗️', description: 'Moves items vertically' },
      { type: 'pick-and-place', name: 'Pick & Place', icon: '🤖', description: 'Automated pick and place' },
      { type: 'palletizer', name: 'Palletizer', icon: '📚', description: 'Stacks items on pallets' },
    ]
  },
  environment: {
    title: 'Environment',
    icon: '🏢',
    items: [
      { type: 'wall', name: 'Wall', icon: '🧱', description: 'Structural wall element' },
      { type: 'door', name: 'Door', icon: '🚪', description: 'Entrance/exit door' },
      { type: 'window', name: 'Window', icon: '🪟', description: 'Window with glass' },
      { type: 'stairs', name: 'Stairs', icon: '🪜', description: 'Staircase structure' },
      { type: 'safety-rail', name: 'Safety Rail', icon: '🛡️', description: 'Protective railing' },
      { type: 'floor-marking', name: 'Floor Marking', icon: '📏', description: 'Floor lines and markings' },
      { type: 'pallet-rack', name: 'Pallet Rack', icon: '🏢', description: 'Storage rack system' },
      { type: 'warehouse-shell', name: 'Warehouse Shell', icon: '🏭', description: 'Building structure' },
    ]
  },
  actorsEquipment: {
    title: 'Actors & Equipment',
    icon: '👷',
    items: [
      { type: 'operator', name: 'Operator', icon: '👷', description: 'Human worker' },
      { type: 'engineer', name: 'Engineer', icon: '👨‍🔧', description: 'Technical specialist' },
      { type: 'forklift', name: 'Forklift', icon: '🚗', description: 'Material handling vehicle' },
      { type: 'agv', name: 'AGV', icon: '🤖', description: 'Automated guided vehicle' },
    ]
  },
  products: {
    title: 'Products',
    icon: '📦',
    items: [
      { type: 'box', name: 'Box', icon: '📦', description: 'Standard shipping box' },
      { type: 'tote', name: 'Tote', icon: '🪣', description: 'Reusable storage container' },
      { type: 'pallet', name: 'Pallet', icon: '🪵', description: 'Euro standard pallet' },
      { type: 'bottle', name: 'Bottle', icon: '🍾', description: 'Beverage container' },
    ]
  },
  sampleLayouts: {
    title: 'Sample Layouts',
    icon: '🏗️',
    items: [
      { type: 'basic-line', name: 'Basic Line', icon: '➡️', description: 'Simple source → conveyor → sink flow' },
      { type: 'assembly-line', name: 'Assembly Line', icon: '🏭', description: 'Manufacturing line with buffer and machine' },
      { type: 'warehouse', name: 'Warehouse', icon: '🏢', description: 'Warehouse with racks, forklift, and operators' },
    ]
  }
} as const;

interface LibraryPanelProps {
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export default function LibraryPanel({ isVisible = true, onVisibilityChange }: LibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  const { 
    addProcessNode, 
    addEnvironmentAsset, 
    addActor,
    clearScene
  } = useEditorStore();

  // Filter items based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return libraryData;
    
    const filtered: Record<string, any> = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(libraryData).forEach(([key, section]) => {
      const matchingItems = section.items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
      
      if (matchingItems.length > 0) {
        filtered[key] = {
          ...section,
          items: matchingItems
        };
      }
    });
    
    return filtered;
  }, [searchQuery]);

  const toggleSection = (sectionKey: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionKey)) {
      newCollapsed.delete(sectionKey);
    } else {
      newCollapsed.add(sectionKey);
    }
    setCollapsedSections(newCollapsed);
  };

  const handleAddItem = (type: string, category: string) => {
    // Map categories to store functions
    const categoryMap = {
      processEquipment: 'process',
      environment: 'environment',
      actorsEquipment: 'actor',
      products: 'product',
      sampleLayouts: 'sample'
    };
    
    const mappedCategory = categoryMap[category as keyof typeof categoryMap];
    
    if (category === 'sampleLayouts') {
      createSampleLayout(type);
    } else {
      // Request placement mode in viewport
      window.dispatchEvent(new CustomEvent('requestPlacement', {
        detail: { type, category: mappedCategory }
      }));
    }
  };

  const createSampleLayout = (layoutType: string) => {
    clearScene();
    
    setTimeout(() => {
      switch (layoutType) {
        case 'basic-line':
          addProcessNode('source', [-8, 0, 0]);
          addProcessNode('conveyor', [0, 0, 0]);
          addProcessNode('sink', [8, 0, 0]);
          break;
        
        case 'assembly-line':
          addProcessNode('source', [-12, 0, 0]);
          addProcessNode('conveyor', [-6, 0, 0]);
          addProcessNode('buffer', [0, 0, 0]);
          addProcessNode('machine', [6, 0, 0]);
          addProcessNode('conveyor', [12, 0, 0]);
          addProcessNode('sink', [18, 0, 0]);
          break;
          
        case 'warehouse':
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

  if (!isVisible) {
    return (
      <div className="w-8 h-full flex flex-col justify-center items-center bg-[#252536] border-r border-gray-600">
        <button
          onClick={() => onVisibilityChange?.(true)}
          className="p-2 text-gray-400 hover:text-teal-400 transition-colors"
          title="Show Library Panel"
        >
          <Menu size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#252536] text-white border-r border-gray-600" style={{fontFamily: 'Inter', fontSize: '13px'}}>
      {/* Header with title and controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-base">📚</span>
          <span className="font-semibold">Library</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-1.5 rounded transition-colors ${
              isPinned 
                ? 'text-teal-400 bg-teal-400/20' 
                : 'text-gray-400 hover:text-teal-400'
            }`}
            title={isPinned ? 'Unpin panel' : 'Pin panel'}
          >
            <Pin size={16} />
          </button>
          <button
            onClick={() => onVisibilityChange?.(false)}
            className="p-1.5 text-gray-400 hover:text-teal-400 transition-colors"
            title="Hide panel"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4 border-b border-gray-600">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#2a2a3e] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-600">
        <div className="p-2">
          {Object.entries(filteredData).map(([sectionKey, section]) => {
            const isCollapsed = collapsedSections.has(sectionKey);
            
            return (
              <div key={sectionKey} className="mb-4">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full flex items-center gap-2 p-2 rounded-md bg-[#2a2a3e] hover:bg-[#333345] transition-colors border-l-2 border-teal-500"
                >
                  {isCollapsed ? (
                    <ChevronRight size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                  <span className="text-sm">{section.icon}</span>
                  <span className="text-sm font-medium">{section.title}</span>
                </button>

                {/* Section items */}
                {!isCollapsed && (
                  <div className="mt-2 ml-4 space-y-1">
                    {section.items.map((item: any) => (
                      <div
                        key={item.type}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#333345] transition-colors cursor-pointer group"
                        onClick={() => handleAddItem(item.type, sectionKey)}
                        title={item.description}
                      >
                        <span className="text-sm flex-shrink-0">{item.icon}</span>
                        <span className="text-sm flex-1 min-w-0 truncate">{item.name}</span>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-teal-500 hover:bg-teal-400 flex items-center justify-center flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddItem(item.type, sectionKey);
                          }}
                          title={`Add ${item.name}`}
                        >
                          <Plus size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}