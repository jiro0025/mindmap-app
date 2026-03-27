import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Node, Edge } from '@xyflow/react';

import Sidebar from './components/Sidebar';
import MindMapCanvas from './components/MindMapCanvas';
import { loadAppState, saveAppState, exportToFile } from './utils/storage';
import type { AppState, MapData } from './utils/storage';
import type { MindMapNodeData } from './components/CustomNode';

function App() {
  const [appState, setAppState] = useState<AppState>(loadAppState);

  // Auto-save app state whenever it changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const activeMap = appState.maps[appState.activeMapId];

  const handleSelectMap = (id: string) => {
    setAppState(prev => ({ ...prev, activeMapId: id }));
  };

  const handleCreateMap = (name: string) => {
    const newId = uuidv4();
    const newMap: MapData = {
      id: newId,
      name,
      nodes: [
        {
          id: 'root',
          type: 'mindmapNode',
          position: { x: 0, y: 0 },
          data: { label: 'Central Idea' },
        },
      ],
      edges: [],
      lastModified: Date.now(),
    };
    
    setAppState(prev => ({
      ...prev,
      activeMapId: newId,
      maps: { ...prev.maps, [newId]: newMap }
    }));
  };

  const handleDeleteMap = (id: string) => {
    setAppState(prev => {
      const newMaps = { ...prev.maps };
      delete newMaps[id];
      const remainingIds = Object.keys(newMaps);
      const newActiveId = remainingIds[0];
      return {
        ...prev,
        activeMapId: newActiveId,
        maps: newMaps
      };
    });
  };

  const handleRenameMap = (id: string, newName: string) => {
    setAppState(prev => ({
      ...prev,
      maps: {
        ...prev.maps,
        [id]: { ...prev.maps[id], name: newName, lastModified: Date.now() }
      }
    }));
  };

  const handleSaveMap = useCallback((nodes: Node<MindMapNodeData>[], edges: Edge[]) => {
    setAppState(prev => {
      const currentMap = prev.maps[prev.activeMapId];
      // Only update if actually different to prevent infinite loops
      // Simple check: compare timestamps or just let React handle it
      return {
        ...prev,
        maps: {
          ...prev.maps,
          [prev.activeMapId]: {
            ...currentMap,
            nodes,
            edges,
            lastModified: Date.now()
          }
        }
      };
    });
  }, []);

  const handleExportMap = (id: string) => {
    exportToFile(appState.maps[id]);
  };

  const handleImportMap = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedMap = JSON.parse(e.target?.result as string) as MapData;
        const newId = uuidv4(); // Generate new ID to avoid collisions
        const newMap: MapData = {
          ...importedMap,
          id: newId,
          lastModified: Date.now()
        };
        
        setAppState(prev => ({
          ...prev,
          activeMapId: newId,
          maps: { ...prev.maps, [newId]: newMap }
        }));
      } catch (err) {
        alert("Failed to import map: Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-layout" style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <Sidebar
        maps={appState.maps}
        activeMapId={appState.activeMapId}
        onSelectMap={handleSelectMap}
        onCreateMap={handleCreateMap}
        onDeleteMap={handleDeleteMap}
        onRenameMap={handleRenameMap}
        onExportMap={handleExportMap}
        onImportMap={handleImportMap}
      />
      <main className="main-container">
        <header className="app-header">
          <h1>{activeMap?.name}</h1>
        </header>
        {activeMap && (
          <MindMapCanvas 
            key={activeMap.id} // Important for component reset
            activeMapId={activeMap.id}
            initialNodes={activeMap.nodes}
            initialEdges={activeMap.edges}
            onSave={handleSaveMap}
          />
        )}
      </main>
    </div>
  );
}

export default App;
