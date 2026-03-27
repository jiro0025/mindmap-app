import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { Plus, Trash2, AlignEndHorizontal } from 'lucide-react';

export type MindMapNodeData = {
  label: string;
  color?: string;
  onAddChild?: (parentId: string) => void;
  onAddSibling?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  updateNodeLabel?: (nodeId: string, newLabel: string) => void;
  updateNodeColor?: (nodeId: string, color?: string) => void;
} & Record<string, unknown>;

export type CustomNodeProps = NodeProps<Node<MindMapNodeData>>;

const THEMES = [
  { name: 'Default', value: undefined },
  { name: 'Red', value: 'rgba(239, 68, 68, 0.7)' },
  { name: 'Green', value: 'rgba(34, 197, 94, 0.7)' },
  { name: 'Blue', value: 'rgba(59, 130, 246, 0.7)' },
  { name: 'Yellow', value: 'rgba(234, 179, 8, 0.7)' },
];

const CustomNode = ({ id, data, selected }: CustomNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // When label prop changes externally, update local state
  useEffect(() => {
    setLabelText(data.label);
  }, [data.label]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text
      inputRef.current.select();
    }
  }, [isEditing]);

  const onDoubleClick = () => {
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
    if (data.updateNodeLabel) {
      data.updateNodeLabel(id, labelText);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (data.updateNodeLabel) {
        data.updateNodeLabel(id, labelText);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLabelText(data.label); // Revert
    }
    // Prevent propagating to graph (which might trigger other hotkeys)
    e.stopPropagation();
  };

  return (
    <div 
      className={`mindmap-node ${selected ? 'selected' : ''}`} 
      onDoubleClick={onDoubleClick}
      style={{ backgroundColor: data.color || 'var(--node-bg)' }}
    >
      
      {/* Target handle for incoming edge - Hidden visually but used by React Flow */}
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      {/* Toolbar - Shows on hover/selected based on CSS */}
      <div className="node-toolbar" style={{ flexDirection: 'column', padding: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
          <button 
            className="toolbar-btn" 
            title="Add Child (Tab)"
            onClick={(e) => { e.stopPropagation(); data.onAddChild?.(id); }}
          >
            <Plus size={16} />
          </button>
          {id !== 'root' && (
            <>
              <button 
                className="toolbar-btn" 
                title="Add Sibling (Enter)"
                onClick={(e) => { e.stopPropagation(); data.onAddSibling?.(id); }}
              >
                <AlignEndHorizontal size={16} />
              </button>
              <button 
                className="toolbar-btn text-red-400 hover:text-red-300"
                title="Delete (Backspace/Delete)" 
                onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }}
              >
                <Trash2 size={16} style={{ color: '#ef4444' }} />
              </button>
            </>
          )}
        </div>
        
        {/* Color Picker Row */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', borderTop: '1px solid var(--node-border)', paddingTop: '4px' }}>
          {THEMES.map((theme) => (
            <button
              key={theme.name}
              title={`Set color: ${theme.name}`}
              onClick={(e) => { e.stopPropagation(); data.updateNodeColor?.(id, theme.value); }}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: data.color === theme.value ? '2px solid white' : '1px solid var(--node-border)',
                background: theme.value || 'var(--node-bg)',
                cursor: 'pointer',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          value={labelText}
          onChange={(e) => setLabelText(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      ) : (
        <div style={{ textAlign: 'center', fontWeight: id === 'root' ? 600 : 500 }}>
          {labelText}
        </div>
      )}

      {/* Source handle for outgoing edges - Hidden visually */}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};

export default memo(CustomNode);
