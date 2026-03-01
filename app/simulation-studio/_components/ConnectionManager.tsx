'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEditorStore } from '../_store/editorStore';

export default function ConnectionManager() {
  const {
    processNodes,
    connectionPoints,
    snapMode,
    snapDistance,
    highlightedPorts,
    selectedObjectId,
    selectedObjectType,
    transformMode,
    updateConnectionPoints,
    setHighlightedPorts,
    autoConnectPorts,
    updateObject,
  } = useEditorStore();

  const { scene, camera } = useThree();
  const lastUpdateTime = useRef(0);

  // Update connection points when objects change
  useEffect(() => {
    updateConnectionPoints();
  }, [processNodes, updateConnectionPoints]);

  // Monitor for potential connections during transform operations
  useFrame(({ clock }) => {
    if (!snapMode || !selectedObjectId || selectedObjectType !== 'process') return;
    
    // Only check every 100ms to avoid performance issues
    const now = clock.getElapsedTime() * 1000;
    if (now - lastUpdateTime.current < 100) return;
    lastUpdateTime.current = now;

    const selectedNode = processNodes.find(n => n.id === selectedObjectId);
    if (!selectedNode) return;

    // Find potential snap targets
    const nearbyPorts: string[] = [];
    const selectedLength = selectedNode.parameters?.length || 2;
    
    // Get selected object's connection points
    const selectedOutputPort = `${selectedObjectId}_output`;
    const selectedInputPort = `${selectedObjectId}_input`;
    
    const selectedOutputPos = [
      selectedNode.position[0],
      selectedNode.position[1] + 0.5,
      selectedNode.position[2] + selectedLength/2 + 0.1
    ];
    
    const selectedInputPos = [
      selectedNode.position[0],
      selectedNode.position[1] + 0.5,
      selectedNode.position[2] - selectedLength/2 - 0.1
    ];

    // Check proximity to other objects' connection points
    connectionPoints.forEach(point => {
      if (point.objectId === selectedObjectId) return; // Skip own ports
      
      const distance1 = Math.sqrt(
        Math.pow(selectedOutputPos[0] - point.position[0], 2) +
        Math.pow(selectedOutputPos[1] - point.position[1], 2) +
        Math.pow(selectedOutputPos[2] - point.position[2], 2)
      );
      
      const distance2 = Math.sqrt(
        Math.pow(selectedInputPos[0] - point.position[0], 2) +
        Math.pow(selectedInputPos[1] - point.position[1], 2) +
        Math.pow(selectedInputPos[2] - point.position[2], 2)
      );

      // Check if within snap distance
      if (distance1 < snapDistance && point.type === 'input' && !point.connected) {
        nearbyPorts.push(point.portId);
        nearbyPorts.push(selectedOutputPort);
      } else if (distance2 < snapDistance && point.type === 'output' && !point.connected) {
        nearbyPorts.push(point.portId);  
        nearbyPorts.push(selectedInputPort);
      }
    });

    // Update highlighted ports
    if (nearbyPorts.length !== highlightedPorts.length || 
        !nearbyPorts.every(port => highlightedPorts.includes(port))) {
      setHighlightedPorts(nearbyPorts);
    }
  });

  // Handle automatic snapping when object is released
  useEffect(() => {
    const handleTransformEnd = () => {
      if (!snapMode || !selectedObjectId || selectedObjectType !== 'process' || highlightedPorts.length === 0) {
        return;
      }

      // Find the best snap target
      const selectedNode = processNodes.find(n => n.id === selectedObjectId);
      if (!selectedNode) return;

      const selectedLength = selectedNode.parameters?.length || 2;
      const selectedOutputPos = [
        selectedNode.position[0],
        selectedNode.position[1] + 0.5,
        selectedNode.position[2] + selectedLength/2 + 0.1
      ];
      
      const selectedInputPos = [
        selectedNode.position[0],
        selectedNode.position[1] + 0.5,
        selectedNode.position[2] - selectedLength/2 - 0.1
      ];

      // Find closest compatible connection
      interface BestConnection {
        sourcePort: string;
        targetPort: string;
        distance: number;
      }
      let bestConnection: BestConnection | null = null;

      connectionPoints.forEach(point => {
        if (point.objectId === selectedObjectId || point.connected) return;
        
        const selectedOutputPort = `${selectedObjectId}_output`;
        const selectedInputPort = `${selectedObjectId}_input`;

        // Check output to input connection
        if (point.type === 'input') {
          const distance = Math.sqrt(
            Math.pow(selectedOutputPos[0] - point.position[0], 2) +
            Math.pow(selectedOutputPos[1] - point.position[1], 2) +
            Math.pow(selectedOutputPos[2] - point.position[2], 2)
          );
          
          if (distance < snapDistance && (!bestConnection || distance < bestConnection.distance)) {
            bestConnection = {
              sourcePort: selectedOutputPort,
              targetPort: point.portId,
              distance
            };
          }
        }
        
        // Check input to output connection
        if (point.type === 'output') {
          const distance = Math.sqrt(
            Math.pow(selectedInputPos[0] - point.position[0], 2) +
            Math.pow(selectedInputPos[1] - point.position[1], 2) +
            Math.pow(selectedInputPos[2] - point.position[2], 2)
          );
          
          if (distance < snapDistance && (!bestConnection || distance < bestConnection.distance)) {
            bestConnection = {
              sourcePort: point.portId,
              targetPort: selectedInputPort,
              distance
            };
          }
        }
      });

      if (bestConnection) {
        // Snap objects together
        const { sourcePort, targetPort } = bestConnection;
        const targetPoint = connectionPoints.find(p => 
          p.portId === targetPort || p.portId === sourcePort
        );
        
        if (targetPoint && targetPoint.objectId !== selectedObjectId) {
          // Calculate snap position
          const isOutputToInput = (sourcePort as string).includes(selectedObjectId);
          const targetNode = processNodes.find(n => n.id === targetPoint.objectId);
          
          if (targetNode) {
            const targetLength = targetNode.parameters?.length || 2;
            let newPosition: [number, number, number];
            
            if (isOutputToInput) {
              // Snap selected object's output to target's input
              newPosition = [
                targetNode.position[0],
                selectedNode.position[1],
                targetNode.position[2] - targetLength/2 - selectedLength/2 - 0.2
              ];
            } else {
              // Snap selected object's input to target's output
              newPosition = [
                targetNode.position[0],
                selectedNode.position[1],
                targetNode.position[2] + targetLength/2 + selectedLength/2 + 0.2
              ];
            }
            
            // Update selected object position
            updateObject(selectedObjectId, 'process', { position: newPosition });
            
            // Create connection
            setTimeout(() => {
              autoConnectPorts(bestConnection!.sourcePort, bestConnection!.targetPort);
            }, 100);
          }
        }
      }

      // Clear highlights
      setHighlightedPorts([]);
    };

    // Listen for transform control changes
    window.addEventListener('transformEnd', handleTransformEnd);
    return () => window.removeEventListener('transformEnd', handleTransformEnd);
  }, [snapMode, selectedObjectId, selectedObjectType, highlightedPorts, processNodes, connectionPoints, snapDistance, autoConnectPorts, updateObject, setHighlightedPorts]);

  return null; // This component doesn't render anything visible
}