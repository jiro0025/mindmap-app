import React, { useState } from 'react';
import { Plus, Download, Upload, Trash2, Edit2 } from 'lucide-react';
import type { MapData } from '../utils/storage';

type SidebarProps = {
  maps: Record<string, MapData>;
  activeMapId: string;
  onSelectMap: (id: string) => void;
  onCreateMap: (name: string) => void;
  onDeleteMap: (id: string) => void;
  onRenameMap: (id: string, newName: string) => void;
  onExportMap: (id: string) => void;
  onImportMap: (file: File) => void;
};

const Sidebar = ({
  maps,
  activeMapId,
  onSelectMap,
  onCreateMap,
  onDeleteMap,
  onRenameMap,
  onExportMap,
  onImportMap,
}: SidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const handleRenameStart = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setEditingId(id);
    setTempName(currentName);
  };

  const handleRenameSubmit = (id: string) => {
    onRenameMap(id, tempName);
    setEditingId(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportMap(e.target.files[0]);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 style={{ fontSize: '24px', fontWeight: 700, background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Mindscape
        </h1>
      </div>

      <div className="sidebar-content">
        <div style={{ marginBottom: '12px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your Maps
        </div>
        {Object.values(maps).sort((a, b) => b.lastModified - a.lastModified).map((map) => (
          <div
            key={map.id}
            className={`map-list-item ${activeMapId === map.id ? 'active' : ''}`}
            onClick={() => onSelectMap(map.id)}
          >
            {editingId === map.id ? (
              <input
                className="map-name-input"
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => handleRenameSubmit(map.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(map.id)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {map.name}
              </span>
            )}

            <div style={{ display: 'flex', gap: '2px' }}>
              {editingId !== map.id && (
                <button 
                  className="icon-btn" 
                  onClick={(e) => handleRenameStart(e, map.id, map.name)}
                  title="Rename"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {activeMapId === map.id && (
                <button 
                  className="icon-btn" 
                  onClick={(e) => { e.stopPropagation(); onExportMap(map.id); }}
                  title="Export to JSON"
                >
                  <Download size={14} />
                </button>
              )}
              {Object.keys(maps).length > 1 && (
                <button 
                  className="icon-btn" 
                  onClick={(e) => { e.stopPropagation(); onDeleteMap(map.id); }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="primary-btn" onClick={() => onCreateMap('New Mindmap')}>
          <Plus size={18} />
          Create New Map
        </button>
        
        <label className="secondary-btn">
          <Upload size={18} />
          Import JSON
          <input type="file" accept=".json" onChange={handleFileInput} style={{ display: 'none' }} />
        </label>
      </div>
    </aside>
  );
};

export default Sidebar;
