'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  ArrowLeft,
  Play,
  Pause,
  Square,
  Save,
  Settings,
  Layers,
  Package,
  Users,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Home,
  Maximize,
  Download,
  Upload,
  Undo,
  Redo,
  Move,
  RotateCw,
  Scale,
} from 'lucide-react';

// Dynamic imports for Three.js components (SSR safety)
const EditorViewport = dynamic(() => import('../_components/EditorViewport'), { ssr: false });
const LibraryPanel = dynamic(() => import('../_components/LibraryPanel'), { ssr: false });
const PropertiesPanel = dynamic(() => import('../_components/PropertiesPanel'), { ssr: false });

import { useEditorStore } from '../_store/editorStore';

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('id');
  
  // UI State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
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
    play,
    pause,
    reset,
    setSimulationSpeed,
    setTransformMode,
    getSceneData,
    loadScene,
    setProjectName,
    markClean,
  } = useEditorStore();

  // Autosave interval
  const autosaveInterval = useRef<NodeJS.Timeout>();

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save: Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }

      // Transform modes: W/E/R
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, setTransformMode, saveProject]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 flex items-center justify-between px-3 lg:px-6 py-2 lg:py-3 z-30">
        {/* Left Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Back Button */}
          <Link 
            href="/simulation-studio/dashboard"
            className="flex items-center gap-2 px-2 lg:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-sm">Dashboard</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            <Menu size={20} />
          </button>

          {/* Project Name */}
          <div className="flex items-center gap-2">
            <h1 className="font-orbitron text-base lg:text-lg font-bold text-gray-900 truncate max-w-32 sm:max-w-48 lg:max-w-none">
              {projectName}
            </h1>
            {isDirty && <div className="w-2 h-2 bg-orange-400 rounded-full" />}
          </div>
        </div>

        {/* Center - Simulation Controls */}
        <div className="flex items-center gap-1 lg:gap-2 bg-gray-50 rounded-lg p-1">
          {/* Play/Pause */}
          <button
            onClick={isPlaying ? pause : play}
            className={`p-2 lg:p-2.5 rounded-md transition-colors touch-target ${
              isPlaying 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-teal-500 text-white hover:bg-teal-600'
            }`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            className="p-2 lg:p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors touch-target"
          >
            <Square size={18} />
          </button>

          {/* Speed Control */}
          <div className="hidden sm:flex items-center gap-1 lg:gap-2 ml-2 lg:ml-3">
            {[0.25, 0.5, 1, 2, 4].map(speed => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded transition-colors touch-target ${
                  simulationSpeed === speed
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Transform Mode Controls */}
          <div className="hidden md:flex items-center bg-gray-50 rounded-lg p-1">
            {[
              { mode: 'translate', icon: Move, key: 'W' },
              { mode: 'rotate', icon: RotateCw, key: 'E' },
              { mode: 'scale', icon: Scale, key: 'R' },
            ].map(({ mode, icon: Icon, key }) => (
              <button
                key={mode}
                onClick={() => setTransformMode(mode as any)}
                className={`p-2 rounded transition-colors touch-target ${
                  transformMode === mode
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title={`${mode} (${key})`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={() => saveProject()}
            disabled={isSaving || !isDirty}
            className="px-3 lg:px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 touch-target"
          >
            <Save size={16} />
            <span className="hidden sm:inline text-sm">
              {isSaving ? 'Saving...' : 'Save'}
            </span>
          </button>

          {/* Properties Toggle (Tablet/Mobile) */}
          <button
            onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg shadow-lg">
          {saveMessage}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Library Panel - Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200 overflow-hidden">
          <LibraryPanel />
        </div>

        {/* Library Panel - Mobile/Tablet Overlay */}
        {isLibraryOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsLibraryOpen(false)}
            />
            
            {/* Panel */}
            <div className="relative w-80 max-w-[85vw] bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-orbitron text-lg font-bold">Library</h2>
                <button
                  onClick={() => setIsLibraryOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <LibraryPanel />
              </div>
            </div>
          </div>
        )}

        {/* 3D Viewport */}
        <div className="flex-1 relative bg-gray-800">
          <EditorViewport />
          
          {/* KPI Bar */}
          <div className="absolute bottom-4 left-4 right-4 lg:right-80 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
                <span>Produced: <strong className="text-teal-400">{totalItemsProduced}</strong></span>
                <span>Consumed: <strong className="text-orange-400">{totalItemsConsumed}</strong></span>
                <span>Active: <strong className="text-purple-400">{simulationItems.length}</strong></span>
                <span>Time: <strong className="text-blue-400">{formatTime(simulationTime)}</strong></span>
                {simulationTime > 0 && (
                  <span>Throughput: <strong className="text-green-400">
                    {((totalItemsConsumed / simulationTime) * 60).toFixed(1)} items/min
                  </strong></span>
                )}
              </div>
              
              {selectedObjectId && (
                <div className="text-xs text-gray-300 hidden lg:block">
                  Selected: {selectedObjectId.substring(0, 8)}...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Panel - Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200 overflow-hidden">
          <PropertiesPanel />
        </div>

        {/* Properties Panel - Mobile/Tablet Overlay */}
        {isPropertiesOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsPropertiesOpen(false)}
            />
            
            {/* Panel */}
            <div className="relative w-80 max-w-[85vw] bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-orbitron text-lg font-bold">Properties</h2>
                <button
                  onClick={() => setIsPropertiesOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PropertiesPanel />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Speed Control Bar (when playing) */}
      {isPlaying && (
        <div className="sm:hidden bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Speed:</span>
            {[0.25, 0.5, 1, 2, 4].map(speed => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-3 py-1 text-sm rounded transition-colors touch-target ${
                  simulationSpeed === speed
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Simulation Studio...</p>
        </div>
      </div>
    }>
      <EditorPageContent />
    </Suspense>
  );
}