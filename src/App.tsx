import { useEffect } from 'react';
// @ts-ignore
import type { Node, Edge } from '@xyflow/react';

import Sidebar from './components/Sidebar';
import MindMapCanvas from './components/MindMapCanvas';
import AuthScreen from './components/AuthScreen';
import { useAuth } from './hooks/useAuth';
import { useMindMap } from './hooks/useMindMap';

function App() {
  const { user, loading: authLoading, loginWithGoogle, loginAnonymously, logout } = useAuth();
  const { 
    maps, 
    currentMap, 
    currentMapId, 
    setCurrentMapId, 
    createMap, 
    saveMapData, 
    updateMapName, 
    deleteMap,
    loading: mapsLoading
  } = useMindMap(user?.uid);

  // 初回ログイン時にマップが一つもなければ作成
  useEffect(() => {
    if (user && !mapsLoading && maps.length === 0) {
      createMap('My First Mindmap');
    }
  }, [user, mapsLoading, maps.length]);

  if (authLoading) {
    return <div className="loading-screen">読み込み中...</div>;
  }

  if (!user) {
    return <AuthScreen onLoginGooglePrimary={loginWithGoogle} onLoginAnonymous={loginAnonymously} />;
  }

  const handleSaveMap = (nodes: Node[], edges: Edge[]) => {
    if (currentMapId) {
      saveMapData(currentMapId, nodes, edges);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        maps={Object.fromEntries(maps.map(m => [m.id, m]))}
        activeMapId={currentMapId || ''}
        onSelectMap={setCurrentMapId}
        onCreateMap={createMap}
        onDeleteMap={deleteMap}
        onRenameMap={updateMapName}
        onExportMap={() => alert('Export is currently in cloud-only mode')}
        onImportMap={() => alert('Import will be added in next update')}
        onLogout={logout}
      />
      <main className="main-container">
        <header className="app-header">
          <div className="header-content">
            <h1>{currentMap?.name || 'Loading...'}</h1>
            <div className="user-info">
              <span>{user.isAnonymous ? 'Guest' : user.email}</span>
            </div>
          </div>
        </header>
        {currentMap && (
          <MindMapCanvas 
            key={currentMap.id}
            activeMapId={currentMap.id}
            initialNodes={currentMap.nodes}
            initialEdges={currentMap.edges}
            onSave={handleSaveMap}
          />
        )}
      </main>
    </div>
  );
}

export default App;
