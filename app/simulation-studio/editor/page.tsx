'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  ArrowLeft,
  Play,
  Pause,
  Square,
  Save,
  Settings,
  Download,
  Upload,
  Undo,
  Redo,
  Move3D,
  RotateCw,
  Maximize,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Target,
  Search,
  ChevronDown,
  MousePointer,
  Clock
} from 'lucide-react';

// Dynamic imports for Three.js components (SSR safety)
const EditorViewport = dynamic(() => import('../_components/EditorViewport'), { ssr: false });
const LibraryPanel = dynamic(() => import('../_components/LibraryPanel'), { ssr: false });
const PropertiesPanel = dynamic(() => import('../_components/PropertiesPanel'), { ssr: false });

import { useEditorStore } from '../_store/editorStore';

export default function EditorPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setProjectId(params.get('id'));
    }
  }, []);
  
  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [scenePreset, setScenePreset] = useState('warehouse');
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const [showSceneSettings, setShowSceneSettings] = useState(false);
  
  // Store state
  const {
    projectName,
    isPlaying,
    simulationSpeed,
    isDirty,
    transformMode,
    totalItemsProduced,
    totalItemsConsumed,
    simulationTime,
    simulationItems,
    activeLibraryTab,
    selectedObjectId,
    selectedObjectType,
    processNodes,
    environmentAssets,
    actors,
    play,
    pause,
    reset,
    setSimulationSpeed,
    setTransformMode,
    getSceneData,
    loadScene,
    setProjectName,
    markClean,
    removeObject,
    addProcessNode,
    addEnvironmentAsset,
    addActor,
  } = useEditorStore();

  // Autosave interval
  const autosaveInterval = useRef<NodeJS.Timeout>();
  const [lastAutoSave, setLastAutoSave] = useState<number>(Date.now());

  // Auth guard
  useEffect(() => {
    const session = localStorage.getItem('sim_studio_session');
    if (!session) {
      router.push('/simulation-studio');
      return;
    }

    try {
      const data = JSON.parse(session);
      if (data.expires <= Date.now()) {
        localStorage.removeItem('sim_studio_session');
        router.push('/simulation-studio');
        return;
      }
    } catch {
      localStorage.removeItem('sim_studio_session');
      router.push('/simulation-studio');
      return;
    }
  }, [router]);

  // Load project
  useEffect(() => {
    if (!projectId) return;

    const stored = localStorage.getItem(`sim_project_${projectId}`);
    if (stored) {
      try {
        const projectData = JSON.parse(stored);
        loadScene(projectData.sceneData || {});
        if (projectData.name) {
          setProjectName(projectData.name);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    }
  }, [projectId, loadScene, setProjectName]);

  // Save project function
  const saveProject = useCallback(async (showMessage = true) => {
    if (!projectId) return;

    setIsSaving(true);
    
    try {
      const sceneData = getSceneData();
      const projectData = {
        id: projectId,
        name: projectName,
        sceneData,
        lastModified: Date.now(),
      };

      // Save to localStorage
      localStorage.setItem(`sim_project_${projectId}`, JSON.stringify(projectData));

      // Update projects list
      const projectsList = localStorage.getItem('sim_studio_projects');
      if (projectsList) {
        const projects = JSON.parse(projectsList);
        const updatedProjects = projects.map((p: any) =>
          p.id === projectId
            ? { ...p, name: projectName, lastModified: Date.now() }
            : p
        );
        localStorage.setItem('sim_studio_projects', JSON.stringify(updatedProjects));
      }

      markClean();
      setLastAutoSave(Date.now());

      if (showMessage) {
        setSaveMessage('Project saved successfully');
        setTimeout(() => setSaveMessage(''), 2000);
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      if (showMessage) {
        setSaveMessage('Failed to save project');
        setTimeout(() => setSaveMessage(''), 2000);
      }
    } finally {
      setIsSaving(false);
    }
  }, [projectId, projectName, getSceneData, markClean]);

  // Auto-save setup
  useEffect(() => {
    if (autosaveInterval.current) {
      clearInterval(autosaveInterval.current);
    }

    autosaveInterval.current = setInterval(() => {
      if (isDirty && projectId) {
        saveProject(false); // Silent autosave
      }
    }, 30000); // Autosave every 30 seconds

    return () => {
      if (autosaveInterval.current) {
        clearInterval(autosaveInterval.current);
      }
    };
  }, [isDirty, projectId, saveProject]);

  // Export project
  const exportProject = () => {
    const sceneData = getSceneData();
    const projectData = {
      name: projectName,
      sceneData,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}.metamech-sim.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get selected object name
  const getSelectedObjectName = () => {
    if (!selectedObjectId || !selectedObjectType) return '';
    
    let obj;
    if (selectedObjectType === 'process') {
      obj = processNodes.find(n => n.id === selectedObjectId);
    } else if (selectedObjectType === 'environment') {
      obj = environmentAssets.find(a => a.id === selectedObjectId);
    } else if (selectedObjectType === 'actor') {
      obj = actors.find(a => a.id === selectedObjectId);
    }
    
    return obj?.name || selectedObjectId.substring(0, 8);
  };

  // Count total objects
  const totalObjects = processNodes.length + environmentAssets.length + actors.length;

  // Delete selected object
  const deleteSelectedObject = () => {
    if (selectedObjectId && selectedObjectType) {
      removeObject(selectedObjectId, selectedObjectType);
    }
  };

  // Duplicate selected object
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save: Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }

      // Delete: Delete key
      if (e.key === 'Delete' && selectedObjectId) {
        deleteSelectedObject();
      }

      // Duplicate: Ctrl/Cmd + D
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelectedObject();
      }

      // Transform modes: W/E/R (only if no input is focused)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')) {
          switch (e.key.toLowerCase()) {
            case 'w':
              setTransformMode('translate');
              break;
            case 'e':
              setTransformMode('rotate');
              break;
            case 'r':
              setTransformMode('scale');
              break;
            case ' ':
              e.preventDefault();
              isPlaying ? pause() : play();
              break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, setTransformMode, saveProject, selectedObjectId, deleteSelectedObject]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Panel resize handlers
  const handleLeftResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  };

  const handleRightResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  };

  useEffect(() => {
    let animationFrame: number;
    let currentMouseX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      currentMouseX = e.clientX;
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      animationFrame = requestAnimationFrame(() => {
        if (isResizingLeft) {
          const newWidth = Math.min(Math.max(currentMouseX, 200), 500);
          setLeftPanelWidth(newWidth);
        }
        if (isResizingRight) {
          const newWidth = Math.min(Math.max(window.innerWidth - currentMouseX, 200), 500);
          setRightPanelWidth(newWidth);
        }
      });
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };

    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isResizingLeft, isResizingRight]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      switch (e.key) {
        case '1':
          e.preventDefault();
          setIsLeftPanelVisible(!isLeftPanelVisible);
          break;
        case '2':
          e.preventDefault();
          setIsRightPanelVisible(!isRightPanelVisible);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          // Dispatch fit all objects event to viewport
          window.dispatchEvent(new CustomEvent('fitAllObjects'));
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedObjectId && selectedObjectType) {
            e.preventDefault();
            if (confirm('Are you sure you want to delete the selected object?')) {
              removeObject(selectedObjectId, selectedObjectType);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLeftPanelVisible, isRightPanelVisible, selectedObjectId, selectedObjectType, removeObject]);

  return (
    <div className="h-screen bg-[#1e1e2e] flex flex-col overflow-hidden font-inter text-sm text-[#e0e0e0]">
      {/* TOP BAR - 48px height */}
      <div className="h-12 bg-[#252536] border-b border-[#3a3a4a] flex items-center justify-between px-4 z-30">
        {/* Left: Back arrow + Logo */}
        <div className="flex items-center gap-4">
          <Link 
            href="/simulation-studio/dashboard"
            className="flex items-center gap-2 px-2 py-1 text-[#e0e0e0] hover:text-white hover:bg-[#333345] rounded transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="text-[#e0e0e0] font-semibold">MetaMech Simulation Studio</div>
        </div>

        {/* Center: Project name + Auto-save indicator */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-[#1a1a2a] border border-[#3a3a4a] rounded px-3 py-1 text-[#e0e0e0] text-center min-w-48 focus:outline-none focus:border-[#06b6d4]"
          />
          <div className="flex items-center gap-1 text-xs">
            {isDirty ? (
              <>
                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                <span className="text-[#888]">Unsaved</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-[#888]">Auto-saved</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Scene preset, Save, Export, Settings */}
        <div className="flex items-center gap-2">
          <select
            value={scenePreset}
            onChange={(e) => setScenePreset(e.target.value)}
            className="bg-[#333345] border border-[#3a3a4a] rounded px-3 py-1 text-[#e0e0e0] text-xs"
          >
            <option value="warehouse">Warehouse</option>
            <option value="factory">Factory</option>
            <option value="studio">Studio</option>
            <option value="outdoor">Outdoor</option>
          </select>
          
          <button
            onClick={() => saveProject()}
            disabled={isSaving || !isDirty}
            className="px-3 py-1 bg-[#06b6d4] text-white rounded hover:bg-[#0891b2] disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Save size={14} />
            Save
          </button>
          
          <button
            onClick={exportProject}
            className="px-3 py-1 bg-[#333345] text-[#e0e0e0] hover:bg-[#404055] rounded transition-colors flex items-center gap-1"
          >
            <Download size={14} />
            Export
          </button>
          
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* TOOLBAR - 40px height */}
      <div className="h-10 bg-[#252536] border-b border-[#3a3a4a] flex items-center justify-between px-4">
        {/* Left side tools */}
        <div className="flex items-center gap-1">
          {/* Selection tools */}
          <div className="flex items-center bg-[#1a1a2a] rounded border border-[#3a3a4a] p-1">
            <button
              className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors"
              title="Selection Tool"
            >
              <MousePointer size={14} />
            </button>
            <button
              onClick={() => setTransformMode('translate')}
              className={`p-1 rounded transition-colors ${
                transformMode === 'translate'
                  ? 'bg-[#06b6d4] text-white'
                  : 'text-[#e0e0e0] hover:bg-[#333345]'
              }`}
              title="Move (W)"
            >
              <Move3D size={14} />
            </button>
            <button
              onClick={() => setTransformMode('rotate')}
              className={`p-1 rounded transition-colors ${
                transformMode === 'rotate'
                  ? 'bg-[#06b6d4] text-white'
                  : 'text-[#e0e0e0] hover:bg-[#333345]'
              }`}
              title="Rotate (E)"
            >
              <RotateCw size={14} />
            </button>
            <button
              onClick={() => setTransformMode('scale')}
              className={`p-1 rounded transition-colors ${
                transformMode === 'scale'
                  ? 'bg-[#06b6d4] text-white'
                  : 'text-[#e0e0e0] hover:bg-[#333345]'
              }`}
              title="Scale (R)"
            >
              <Maximize size={14} />
            </button>
          </div>

          <div className="w-px h-6 bg-[#3a3a4a]" />

          {/* Simulation controls */}
          <div className="flex items-center bg-[#1a1a2a] rounded border border-[#3a3a4a] p-1">
            <button
              onClick={isPlaying ? pause : play}
              className={`p-1 rounded transition-colors ${
                isPlaying 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={reset}
              className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors"
              title="Stop"
            >
              <Square size={14} />
            </button>
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-[#e0e0e0] text-xs px-1"
            >
              <option value={0.25} className="bg-[#252536]">0.25x</option>
              <option value={0.5} className="bg-[#252536]">0.5x</option>
              <option value={1} className="bg-[#252536]">1x</option>
              <option value={2} className="bg-[#252536]">2x</option>
              <option value={4} className="bg-[#252536]">4x</option>
            </select>
          </div>

          <div className="w-px h-6 bg-[#3a3a4a]" />

          {/* Edit tools */}
          <div className="flex items-center bg-[#1a1a2a] rounded border border-[#3a3a4a] p-1">
            <button
              className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors"
              title="Undo"
            >
              <Undo size={14} />
            </button>
            <button
              className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors"
              title="Redo"
            >
              <Redo size={14} />
            </button>
          </div>

          <div className="w-px h-6 bg-[#3a3a4a]" />

          {/* Object tools */}
          <div className="flex items-center bg-[#1a1a2a] rounded border border-[#3a3a4a] p-1">
            <button
              onClick={deleteSelectedObject}
              disabled={!selectedObjectId}
              className="p-1 text-red-400 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Selected"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={duplicateSelectedObject}
              disabled={!selectedObjectId}
              className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Duplicate Selected"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        {/* Right side tools */}
        <div className="flex items-center bg-[#1a1a2a] rounded border border-[#3a3a4a] p-1">
          <button
            className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            className="p-1 text-[#e0e0e0] hover:bg-[#333345] rounded transition-colors"
            title="Fit View"
          >
            <Target size={14} />
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-[#06b6d4] text-white text-sm rounded shadow-lg">
          {saveMessage}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - resizable */}
        <div 
          className="overflow-hidden flex flex-col relative"
          style={{ width: isLeftPanelVisible ? leftPanelWidth : 'auto' }}
        >
          {/* Library Panel */}
          <LibraryPanel 
            isVisible={isLeftPanelVisible} 
            onVisibilityChange={setIsLeftPanelVisible} 
          />

          {/* Left Resize Handle */}
          {isLeftPanelVisible && (
            <div
              className="absolute right-0 top-0 bottom-0 w-1.5 bg-transparent hover:bg-teal-500 cursor-col-resize transition-colors"
              onMouseDown={handleLeftResizeStart}
              onDoubleClick={() => setLeftPanelWidth(280)}
              title="Resize panel (double-click to reset)"
            />
          )}
        </div>

        {/* 3D VIEWPORT */}
        <div className="flex-1 relative bg-[#1a1a2a]">
          <EditorViewport />
        </div>

        {/* RIGHT PANEL - resizable */}
        <div 
          className="overflow-hidden relative"
          style={{ width: (isRightPanelVisible && selectedObjectId) ? rightPanelWidth : 'auto' }}
        >
          {/* Right Resize Handle */}
          {isRightPanelVisible && selectedObjectId && (
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent hover:bg-teal-500 cursor-col-resize transition-colors"
              onMouseDown={handleRightResizeStart}
              onDoubleClick={() => setRightPanelWidth(300)}
              title="Resize panel (double-click to reset)"
            />
          )}
          
          <PropertiesPanel 
            isVisible={isRightPanelVisible && (selectedObjectId !== null)}
            onVisibilityChange={setIsRightPanelVisible}
          />
        </div>
      </div>

      {/* BOTTOM BAR - 32px height */}
      <div className="h-8 bg-[#252536] border-t border-[#3a3a4a] flex items-center justify-between px-4 text-xs">
        {/* Left: Objects count */}
        <div className="flex items-center gap-4">
          <span>Objects: <span className="text-[#06b6d4] font-mono">{totalObjects}</span></span>
          {selectedObjectId && (
            <span>Selected: <span className="text-[#06b6d4] font-mono">{getSelectedObjectName()}</span></span>
          )}
        </div>

        {/* Center: Simulation stats */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatTime(simulationTime)}
          </span>
          <span>Processed: <span className="text-green-400 font-mono">{totalItemsConsumed}</span></span>
        </div>

        {/* Right: Performance */}
        <div className="flex items-center gap-4">
          <span>FPS: <span className="text-green-400 font-mono">60</span></span>
          <span className="text-[#888]">Quality: High</span>
        </div>
      </div>
    </div>
  );
}