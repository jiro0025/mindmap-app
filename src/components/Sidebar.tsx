import React, { useState } from 'react';
import { Plus, Download, Upload, Trash2, Edit2, LogOut, Menu, X } from 'lucide-react';
import type { MindMap } from '../hooks/useMindMap';

type SidebarProps = {
  maps: Record<string, MindMap>;
  activeMapId: string;
  onSelectMap: (id: string) => void;
  onCreateMap: (name: string) => void;
  onDeleteMap: (id: string) => void;
  onRenameMap: (id: string, newName: string) => void;
  onExportMap: (id: string) => void;
  onImportMap: (file: File) => void;
  onLogout: () => void;
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
  onLogout,
}: SidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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

  const handleSelectMap = (id: string) => {
    onSelectMap(id);
    setIsOpen(false); // スマホではマップ選択後にサイドバーを閉じる
  };

  return (
    <>
      {/* ハンバーガーメニューボタン（モバイルのみ表示） */}
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="メニューを開く"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* オーバーレイ（モバイルでサイドバーが開いた時の背景） */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* サイドバー本体 */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="gradient-text">Mindscape</h1>
          {/* スマホで閉じるボタン */}
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="section-label">Your Maps</div>
          {Object.values(maps).sort((a, b) => {
            const aTime = a.updatedAt?.toMillis?.() ?? 0;
            const bTime = b.updatedAt?.toMillis?.() ?? 0;
            return bTime - aTime;
          }).map((map) => (
            <div
              key={map.id}
              className={`map-list-item ${activeMapId === map.id ? 'active' : ''}`}
              onClick={() => handleSelectMap(map.id)}
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
                <span className="map-name-text">
                  {map.name}
                </span>
              )}

              <div className="item-actions">
                {editingId !== map.id && (
                  <button className="icon-btn" onClick={(e) => handleRenameStart(e, map.id, map.name)}>
                    <Edit2 size={14} />
                  </button>
                )}
                {activeMapId === map.id && (
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onExportMap(map.id); }}>
                    <Download size={14} />
                  </button>
                )}
                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onDeleteMap(map.id); }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="primary-btn" onClick={() => { onCreateMap('New Mindmap'); setIsOpen(false); }}>
            <Plus size={18} />
            Create New Map
          </button>

          <label className="secondary-btn">
            <Upload size={18} />
            Import JSON
            <input type="file" accept=".json" onChange={handleFileInput} style={{ display: 'none' }} />
          </label>

          <button className="ghost-btn" onClick={onLogout}>
            <LogOut size={18} />
            ログアウト
          </button>
        </div>
      </aside>

      <style>{`
        /* ===== ハンバーガーボタン（モバイル専用） ===== */
        .hamburger-btn {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 400;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          border-radius: 10px;
          width: 44px;
          height: 44px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        /* ===== オーバーレイ ===== */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 250;
          backdrop-filter: blur(2px);
        }

        /* ===== 閉じるボタン（サイドバー内） ===== */
        .sidebar-close-btn {
          display: none;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .sidebar-close-btn:hover { color: white; }

        /* ===== サイドバー本体 ===== */
        .sidebar {
          width: 260px;
          height: 100vh;
          background: #0f172a;
          color: white;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
          z-index: 300;
          transition: transform 0.3s ease;
        }
        .sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .section-label {
          padding: 0 12px 8px;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .sidebar-content { flex: 1; overflow-y: auto; padding: 0 12px; }
        .map-list-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 4px;
          transition: 0.2s;
          min-height: 48px; /* タップしやすいサイズ */
        }
        .map-list-item:hover { background: rgba(255,255,255,0.05); }
        .map-list-item.active {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .map-name-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }
        .item-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
        .map-list-item:hover .item-actions,
        .map-list-item.active .item-actions { opacity: 1; }
        .icon-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          min-width: 32px;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover { color: white; background: rgba(255,255,255,0.1); }
        .sidebar-footer {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .primary-btn, .secondary-btn, .ghost-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          border: none;
          font-weight: 500;
          width: 100%;
          min-height: 48px; /* タップしやすいサイズ */
        }
        .primary-btn { background: #3b82f6; color: white; }
        .primary-btn:hover { background: #2563eb; }
        .secondary-btn { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .secondary-btn:hover { background: rgba(255,255,255,0.1); }
        .ghost-btn { background: transparent; color: #f43f5e; opacity: 0.7; }
        .ghost-btn:hover { opacity: 1; background: rgba(244, 63, 94, 0.1); }
        .map-name-input {
          background: #1e293b;
          border: 1px solid #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          width: 100%;
          outline: none;
          font-size: 14px;
        }
        .gradient-text {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ===== モバイル対応 ===== */
        @media (max-width: 768px) {
          .hamburger-btn {
            display: flex;
          }
          .sidebar-overlay {
            display: block;
          }
          .sidebar-close-btn {
            display: flex;
            align-items: center;
          }
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            transform: translateX(-100%);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          /* モバイルでは item-actions を常に表示 */
          .item-actions {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
