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
      <label className="block text-sm font-medium text-gray-700">
        {label} {unit && <span className="text-gray-500">({unit})</span>}
      </label>
      <input
        type="number"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 touch-target"
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
      <label className="block text-sm font-medium text-gray-700">
        {label} {unit && <span className="text-gray-500">({unit})</span>}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {value.map((val, index) => (
          <div key={index}>
            <label className="block text-xs text-gray-500 mb-1">{labels[index]}</label>
            <input
              type="number"
              value={val.toFixed(2)}
              onChange={(e) => {
                const newValue = [...value] as [number, number, number];
                newValue[index] = parseFloat(e.target.value) || 0;
                onChange(newValue);
              }}
              step={step}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 touch-target"
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
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer touch-target"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 touch-target"
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
    sceneSettings,
    updateObject,
    removeObject,
    setSceneSettings,
  } = useEditorStore();

  const [showSceneSettings, setShowSceneSettings] = useState(false);

  // Get selected object
  const selectedObject = selectedObjectId ? (
    selectedObjectType === 'process' ? processNodes.find(n => n.id === selectedObjectId) :
    selectedObjectType === 'environment' ? environmentAssets.find(a => a.id === selectedObjectId) :
    selectedObjectType === 'actor' ? actors.find(a => a.id === selectedObjectId) :
    null
  ) : null;

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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orbitron text-lg font-bold text-gray-900">
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
        {selectedObject ? (
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
            <p className="text-sm text-gray-600 mb-4 max-w-48">
              Select an object in the 3D viewport to view and edit its properties.
            </p>
            <button
              onClick={() => setShowSceneSettings(true)}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors touch-target"
            >
              Scene Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}