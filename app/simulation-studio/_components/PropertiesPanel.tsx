'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RotateCw,
  Move,
  Scale,
  Palette,
  Sliders,
} from 'lucide-react';
import { useEditorStore } from '../_store/editorStore';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function NumberInput({ label, value, onChange, min, max, step = 0.1, unit }: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(value.toString());
    } else {
      let clampedValue = parsed;
      if (min !== undefined) clampedValue = Math.max(min, clampedValue);
      if (max !== undefined) clampedValue = Math.min(max, clampedValue);
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#e0e0e0]">
        {label} {unit && <span className="text-[#888]">({unit})</span>}
      </label>
      <input
        type="number"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 bg-[#1a1a2a] border border-[#3a3a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
      />
    </div>
  );
}

interface Vector3InputProps {
  label: string;
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
  step?: number;
  unit?: string;
}

function Vector3Input({ label, value, onChange, step = 0.1, unit }: Vector3InputProps) {
  const labels = ['X', 'Y', 'Z'];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#e0e0e0]">
        {label} {unit && <span className="text-[#888]">({unit})</span>}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {value.map((val, index) => (
          <div key={index}>
            <label className="block text-xs text-[#888] mb-1">{labels[index]}</label>
            <input
              type="number"
              value={val.toFixed(2)}
              onChange={(e) => {
                const newValue = [...value] as [number, number, number];
                newValue[index] = parseFloat(e.target.value) || 0;
                onChange(newValue);
              }}
              step={step}
              className="w-full px-2 py-1.5 text-sm bg-[#1a1a2a] border border-[#3a3a4a] rounded text-[#e0e0e0] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#e0e0e0]">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-[#3a3a4a] cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#1a1a2a] border border-[#3a3a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}

export default function PropertiesPanel() {
  const {
    selectedObjectId,
    selectedObjectType,
    processNodes,
    environmentAssets,
    actors,
    edges,
    sceneSettings,
    updateObject,
    removeObject,
    removeEdge,
    addProcessNode,
    addEdge,
    setSceneSettings,
  } = useEditorStore();

  const [showSceneSettings, setShowSceneSettings] = useState(false);

  // Get selected object
  const selectedObject = selectedObjectId ? (
    selectedObjectType === 'process' && processNodes.find(n => n.id === selectedObjectId) ?
      processNodes.find(n => n.id === selectedObjectId) :
    selectedObjectType === 'environment' ? environmentAssets.find(a => a.id === selectedObjectId) :
    selectedObjectType === 'actor' ? actors.find(a => a.id === selectedObjectId) :
    null
  ) : null;

  // Check if selected object is an edge
  const selectedEdge = selectedObjectId ? edges.find(e => e.id === selectedObjectId) : null;

  // Handle object updates
  const handleUpdate = (updates: any) => {
    if (selectedObjectId && selectedObjectType) {
      updateObject(selectedObjectId, selectedObjectType, updates);
    }
  };

  // Handle object deletion
  const handleDelete = () => {
    if (selectedObjectId && selectedObjectType) {
      if (confirm('Are you sure you want to delete this object?')) {
        removeObject(selectedObjectId, selectedObjectType);
      }
    }
  };

  // Render object-specific parameters
  const renderParameters = (obj: any) => {
    const params = obj.parameters || {};
    const updates: any = {};

    const parameterInputs = [];

    // Common parameters based on object type
    switch (obj.type) {
      case 'source':
        parameterInputs.push(
          <div key="itemType" className="space-y-2">
            <label className="block text-sm font-medium text-[#e0e0e0]">Item Type</label>
            <select
              value={params.itemType || 'box'}
              onChange={(e) => handleUpdate({ parameters: { ...params, itemType: e.target.value } })}
              className="w-full px-3 py-2 bg-[#1a1a2a] border border-[#3a3a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
            >
              <option value="box">Box</option>
              <option value="tote">Tote</option>
              <option value="pallet">Pallet</option>
              <option value="bottle">Bottle</option>
            </select>
          </div>,
          <NumberInput
            key="spawnRate"
            label="Spawn Rate"
            value={params.spawnRate || 1.0}
            onChange={(value) => handleUpdate({ parameters: { ...params, spawnRate: value } })}
            min={0}
            max={10}
            step={0.1}
            unit="items/sec"
          />
        );
        break;

      case 'conveyor':
        parameterInputs.push(
          <div key="conveyorType" className="space-y-2">
            <label className="block text-sm font-medium text-[#e0e0e0]">Conveyor Type</label>
            <select
              value={params.type || 'roller'}
              onChange={(e) => handleUpdate({ parameters: { ...params, type: e.target.value } })}
              className="w-full px-3 py-2 bg-[#1a1a2a] border border-[#3a3a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
            >
              <option value="roller">Roller Conveyor</option>
              <option value="belt">Belt Conveyor</option>
              <option value="chain">Chain Conveyor</option>
              <option value="modular-belt">Modular Belt</option>
            </select>
          </div>,
          <NumberInput
            key="length"
            label="Length"
            value={params.length || 5}
            onChange={(value) => handleUpdate({ parameters: { ...params, length: value } })}
            min={0.5}
            max={20}
            step={0.5}
            unit="m"
          />,
          <NumberInput
            key="width"
            label="Width"
            value={params.width || 1}
            onChange={(value) => handleUpdate({ parameters: { ...params, width: value } })}
            min={0.3}
            max={3}
            step={0.1}
            unit="m"
          />,
          <NumberInput
            key="speed"
            label="Speed"
            value={params.speed || 1.0}
            onChange={(value) => handleUpdate({ parameters: { ...params, speed: value } })}
            min={0.1}
            max={5}
            step={0.1}
            unit="m/s"
          />
        );
        break;

      case 'machine':
        parameterInputs.push(
          <div key="machineType" className="space-y-2">
            <label className="block text-sm font-medium text-[#e0e0e0]">Machine Type</label>
            <select
              value={params.type || 'cnc'}
              onChange={(e) => handleUpdate({ parameters: { ...params, type: e.target.value } })}
              className="w-full px-3 py-2 bg-[#1a1a2a] border border-[#3a3a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
            >
              <option value="cnc">CNC Machine</option>
              <option value="assembly">Assembly Station</option>
              <option value="inspection">Inspection Station</option>
              <option value="packaging">Packaging Machine</option>
            </select>
          </div>,
          <NumberInput
            key="processingTime"
            label="Processing Time"
            value={params.processingTime || 2.0}
            onChange={(value) => handleUpdate({ parameters: { ...params, processingTime: value } })}
            min={0.1}
            max={60}
            step={0.1}
            unit="sec"
          />
        );
        break;

      case 'wall':
        parameterInputs.push(
          <NumberInput
            key="width"
            label="Width"
            value={params.width || 5}
            onChange={(value) => handleUpdate({ parameters: { ...params, width: value } })}
            min={0.5}
            max={20}
            step={0.5}
            unit="m"
          />,
          <NumberInput
            key="height"
            label="Height"
            value={params.height || 3}
            onChange={(value) => handleUpdate({ parameters: { ...params, height: value } })}
            min={1}
            max={10}
            step={0.5}
            unit="m"
          />
        );
        break;

      case 'router':
        parameterInputs.push(
          <div key="routerMode" className="space-y-2">
            <label className="block text-sm font-medium text-[#e0e0e0]">Router Mode</label>
            <select
              value={params.mode || 'divert'}
              onChange={(e) => handleUpdate({ parameters: { ...params, mode: e.target.value } })}
              className="w-full px-3 py-2 bg-[#1a1a2a] border border-[#3a3a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
            >
              <option value="divert">Divert (Y-split)</option>
              <option value="merge">Merge (Y-merge)</option>
            </select>
          </div>
        );
        break;

      case 'pallet-rack':
        parameterInputs.push(
          <NumberInput
            key="levels"
            label="Levels"
            value={params.levels || 4}
            onChange={(value) => handleUpdate({ parameters: { ...params, levels: Math.floor(value) } })}
            min={1}
            max={6}
            step={1}
            unit="levels"
          />,
          <NumberInput
            key="bays"
            label="Bays"
            value={params.bays || 2}
            onChange={(value) => handleUpdate({ parameters: { ...params, bays: Math.floor(value) } })}
            min={1}
            max={5}
            step={1}
            unit="bays"
          />,
          <NumberInput
            key="width"
            label="Width"
            value={params.width || 3}
            onChange={(value) => handleUpdate({ parameters: { ...params, width: value } })}
            min={2}
            max={6}
            step={0.5}
            unit="m"
          />,
          <NumberInput
            key="height"
            label="Height"
            value={params.height || 4}
            onChange={(value) => handleUpdate({ parameters: { ...params, height: value } })}
            min={2}
            max={8}
            step={0.5}
            unit="m"
          />
        );
        break;

      case 'spiral-conveyor':
        parameterInputs.push(
          <div key="spiralDirection" className="space-y-2">
            <label className="block text-sm font-medium text-[#e0e0e0]">Direction</label>
            <select
              value={params.direction || 'up'}
              onChange={(e) => handleUpdate({ parameters: { ...params, direction: e.target.value } })}
              className="w-full px-3 py-2 bg-[#1a1a2a] border border-[#3a3a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
            >
              <option value="up">Spiral Up</option>
              <option value="down">Spiral Down</option>
            </select>
          </div>,
          <NumberInput
            key="height"
            label="Height"
            value={params.height || 5}
            onChange={(value) => handleUpdate({ parameters: { ...params, height: value } })}
            min={1}
            max={10}
            step={0.5}
            unit="m"
          />,
          <NumberInput
            key="radius"
            label="Radius"
            value={params.radius || 2}
            onChange={(value) => handleUpdate({ parameters: { ...params, radius: value } })}
            min={0.5}
            max={5}
            step={0.1}
            unit="m"
          />
        );
        break;

      case 'operator':
      case 'engineer':
        parameterInputs.push(
          <ColorInput
            key="color"
            label="Color"
            value={params.color || '#4f46e5'}
            onChange={(value) => handleUpdate({ parameters: { ...params, color: value } })}
          />
        );
        break;
    }

    return parameterInputs;
  };

  return (
    <div className="h-full flex flex-col bg-[#252536]">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-[#3a3a4a]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orbitron text-lg font-bold text-[#e0e0e0]">
            Properties
          </h2>
          <button
            onClick={() => setShowSceneSettings(!showSceneSettings)}
            className={`p-2 rounded-lg transition-colors touch-target ${
              showSceneSettings
                ? 'bg-teal-100 text-teal-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedEdge ? (
          <div className="p-4 lg:p-6 space-y-6">
            {/* Edge Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Connection</h3>
                <p><strong>From:</strong> {processNodes.find(n => n.id === selectedEdge.from)?.name || 'Unknown'}</p>
                <p><strong>To:</strong> {processNodes.find(n => n.id === selectedEdge.to)?.name || 'Unknown'}</p>
                <p><strong>ID:</strong> {selectedEdge.id.substring(0, 8)}...</p>
              </div>
            </div>

            {/* Edge Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this connection?')) {
                    removeEdge(selectedEdge.id);
                  }
                }}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 touch-target"
              >
                <Trash2 size={16} />
                Delete Connection
              </button>
            </div>
          </div>
        ) : selectedObject ? (
          <div className="p-4 lg:p-6 space-y-6">
            {/* Object Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Object Name
                </label>
                <input
                  type="text"
                  value={selectedObject.name || ''}
                  onChange={(e) => handleUpdate({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 touch-target"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Type:</strong> {selectedObject.type}</p>
                <p><strong>ID:</strong> {selectedObject.id.substring(0, 8)}...</p>
              </div>
            </div>

            {/* Transform */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Move size={16} />
                Transform
              </h3>

              <Vector3Input
                label="Position"
                value={selectedObject.position}
                onChange={(value) => handleUpdate({ position: value })}
                unit="m"
              />

              <Vector3Input
                label="Rotation"
                value={selectedObject.rotation.map(r => r * 180 / Math.PI) as [number, number, number]}
                onChange={(value) => handleUpdate({
                  rotation: value.map(r => r * Math.PI / 180) as [number, number, number]
                })}
                unit="deg"
              />

              <Vector3Input
                label="Scale"
                value={selectedObject.scale}
                onChange={(value) => handleUpdate({ scale: value })}
                step={0.01}
              />
            </div>

            {/* Object-specific Parameters */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sliders size={16} />
                Parameters
              </h3>

              <div className="space-y-4">
                {renderParameters(selectedObject)}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors touch-target"
              >
                <Trash2 size={16} />
                Delete Object
              </button>
            </div>
          </div>
        ) : showSceneSettings ? (
          <div className="p-4 lg:p-6 space-y-6">
            {/* Scene Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings size={16} />
                Scene Settings
              </h3>

              {/* Environment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <select
                  value={sceneSettings.environment}
                  onChange={(e) => setSceneSettings({ environment: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 touch-target"
                >
                  <option value="factory">Factory</option>
                  <option value="studio-white">Studio White</option>
                  <option value="dark-showroom">Dark Showroom</option>
                  <option value="transparent">Transparent</option>
                </select>
              </div>

              {/* Lighting */}
              <NumberInput
                label="Lighting Intensity"
                value={sceneSettings.lighting.intensity}
                onChange={(value) => setSceneSettings({
                  lighting: { ...sceneSettings.lighting, intensity: value }
                })}
                min={0}
                max={3}
                step={0.1}
              />

              {/* Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Show Grid</span>
                  <button
                    onClick={() => setSceneSettings({
                      grid: { ...sceneSettings.grid, visible: !sceneSettings.grid.visible }
                    })}
                    className={`p-2 rounded-lg transition-colors touch-target ${
                      sceneSettings.grid.visible
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {sceneSettings.grid.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>

                {sceneSettings.grid.visible && (
                  <>
                    <NumberInput
                      label="Grid Size"
                      value={sceneSettings.grid.size}
                      onChange={(value) => setSceneSettings({
                        grid: { ...sceneSettings.grid, size: value }
                      })}
                      min={10}
                      max={100}
                      step={5}
                      unit="m"
                    />

                    <NumberInput
                      label="Grid Divisions"
                      value={sceneSettings.grid.divisions}
                      onChange={(value) => setSceneSettings({
                        grid: { ...sceneSettings.grid, divisions: value }
                      })}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </>
                )}
              </div>

              {/* Axes */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Show Axes</span>
                <button
                  onClick={() => setSceneSettings({
                    axes: { ...sceneSettings.axes, visible: !sceneSettings.axes.visible }
                  })}
                  className={`p-2 rounded-lg transition-colors touch-target ${
                    sceneSettings.axes.visible
                      ? 'bg-teal-100 text-teal-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {sceneSettings.axes.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* Shadows */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Enable Shadows</span>
                <button
                  onClick={() => setSceneSettings({
                    lighting: { ...sceneSettings.lighting, shadows: !sceneSettings.lighting.shadows }
                  })}
                  className={`p-2 rounded-lg transition-colors touch-target ${
                    sceneSettings.lighting.shadows
                      ? 'bg-teal-100 text-teal-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {sceneSettings.lighting.shadows ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 lg:p-6 flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Settings size={24} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Selection</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-48">
              Select an object in the 3D viewport to view and edit its properties.
            </p>
            
            {/* Quick Actions */}
            <div className="space-y-2 mb-4 w-full max-w-48">
              <button
                onClick={() => {
                  addProcessNode('source', [-3, 0, 0]);
                  addProcessNode('sink', [3, 0, 0]);
                }}
                className="w-full px-3 py-2 bg-teal-500 text-white text-xs rounded-lg hover:bg-teal-600 transition-colors touch-target"
              >
                Quick: Source + Sink
              </button>
              
              <button
                onClick={() => setShowSceneSettings(true)}
                className="w-full px-3 py-2 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors touch-target"
              >
                Scene Settings
              </button>
            </div>
            
            <div className="text-xs text-gray-400">
              <p>💡 Use Library panel to add more components</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}