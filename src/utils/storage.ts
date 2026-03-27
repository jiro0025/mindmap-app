import type { Node, Edge } from '@xyflow/react';
import type { MindMapNodeData } from '../components/CustomNode';

const STORAGE_KEY = 'mindmap-app-data-v2';

export type MapData = {
  id: string;
  name: string;
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
  lastModified: number;
};

export type AppState = {
  activeMapId: string;
  maps: Record<string, MapData>;
};

const defaultNodes: Node<MindMapNodeData>[] = [
  {
    id: 'root',
    type: 'mindmapNode',
    position: { x: 0, y: 0 },
    data: { label: 'Central Idea' },
  },
];

export const saveAppState = (state: AppState) => {
  // Deep clone to avoid modifying original state during serialization
  const serializedState = {
    ...state,
    maps: Object.fromEntries(
      Object.entries(state.maps).map(([id, map]) => [
        id,
        {
          ...map,
          nodes: map.nodes.map(node => ({
            ...node,
            data: { 
              label: node.data.label,
              color: node.data.color 
            } // Strip callbacks
          }))
        }
      ])
    )
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedState));
};

export const loadAppState = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const defaultId = 'default-map';
    return {
      activeMapId: defaultId,
      maps: {
        [defaultId]: {
          id: defaultId,
          name: 'My First Mindmap',
          nodes: defaultNodes,
          edges: [],
          lastModified: Date.now()
        }
      }
    };
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse app state", e);
    // Return default state on error
    const fallbackId = 'fallback-map';
    return {
      activeMapId: fallbackId,
      maps: {
        [fallbackId]: {
          id: fallbackId,
          name: 'Default Map',
          nodes: defaultNodes,
          edges: [],
          lastModified: Date.now()
        }
      }
    };
  }
};

// Export to file function
export const exportToFile = (map: MapData) => {
  const dataStr = JSON.stringify(map, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${map.name.replace(/\s+/g, '_')}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
