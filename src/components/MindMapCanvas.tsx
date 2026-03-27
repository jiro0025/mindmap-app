import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  useReactFlow,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import type {
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { toPng } from 'html-to-image';
import { Image as ImageIcon, LayoutGrid } from 'lucide-react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import type { MindMapNodeData } from './CustomNode';
import CustomEdge from './CustomEdge';
import { getChildNodePosition, getSiblingNodePosition, getLayoutedElements } from '../utils/layout';


const nodeTypes: NodeTypes = {
  mindmapNode: CustomNode as any,
};

const edgeTypes: EdgeTypes = {
  mindmapEdge: CustomEdge as any,
};

type MindMapCanvasProps = {
  activeMapId: string;
  initialNodes: Node<MindMapNodeData>[];
  initialEdges: Edge[];
  onSave: (nodes: Node<MindMapNodeData>[], edges: Edge[]) => void;
};

const MindMapCanvas = ({ activeMapId, initialNodes, initialEdges, onSave }: MindMapCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<MindMapNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // When the active map ID changes, reset the local node/edge state
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    // Only re-run when the activeMapId changes to avoid infinite save loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMapId, setNodes, setEdges]);

  // Auto-save: Whenever nodes or edges change in THIS sub-component, bubble it up
  useEffect(() => {
    onSave(nodes, edges);
  }, [nodes, edges, onSave]);

  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          n.data = { ...n.data, label: newLabel };
        }
        return n;
      })
    );
  }, [setNodes]);

  const updateNodeColor = useCallback((nodeId: string, color?: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          n.data = { ...n.data, color };
        }
        return n;
      })
    );
  }, [setNodes]);

  const { getNodes, getEdges, fitView } = useReactFlow();

  const onAddChild = useCallback((parentId: string) => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    const parentNode = currentNodes.find((n) => n.id === parentId);
    if (!parentNode) return;

    const existingChildrenCount = currentEdges.filter(e => e.source === parentId).length;
    
    const newId = uuidv4();
    const newNode: Node<MindMapNodeData> = {
      id: newId,
      type: 'mindmapNode',
      position: getChildNodePosition(parentNode.position, existingChildrenCount),
      data: { label: 'New Node' },
      selected: true,
    };

    const newEdge: Edge = {
      id: `e-${parentId}-${newId}`,
      source: parentId,
      target: newId,
      type: 'mindmapEdge',
    };
    
    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNode));
    setEdges((eds) => addEdge(newEdge, eds));
  }, [getNodes, getEdges, setNodes, setEdges]);

  const onAddSibling = useCallback((nodeId: string) => {
    if (nodeId === 'root') return;

    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const currentNode = currentNodes.find((n) => n.id === nodeId);
    if (!currentNode) return;

    const parentEdge = currentEdges.find((e) => e.target === nodeId);
    const parentId = parentEdge ? parentEdge.source : 'root';

    const newId = uuidv4();
    const newNode: Node<MindMapNodeData> = {
      id: newId,
      type: 'mindmapNode',
      position: getSiblingNodePosition(currentNode.position),
      data: { label: 'New Node' },
      selected: true,
    };

    const newEdge: Edge = {
      id: `e-${parentId}-${newId}`,
      source: parentId,
      target: newId,
      type: 'mindmapEdge',
    };

    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNode));
    setEdges((eds) => addEdge(newEdge, eds));
  }, [getNodes, getEdges, setNodes, setEdges]);

  const onDeleteNode = useCallback((nodeId: string) => {
    if (nodeId === 'root') return; // Do not delete root
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);


  // Global Keydown Handler (Tab, Enter, Backspace) for selected nodes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Avoid triggering if we are typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;

      const selectedNode = nodes.find((n) => n.selected);
      if (!selectedNode) return;

      if (event.key === 'Tab') {
        event.preventDefault();
        onAddChild(selectedNode.id);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onAddSibling(selectedNode.id);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        if (selectedNode.id !== 'root') {
          onDeleteNode(selectedNode.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, onAddChild, onAddSibling, onDeleteNode]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'mindmapEdge' }, eds)), [setEdges]);

  // Handle Organize Layout
  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    window.requestAnimationFrame(() => {
      fitView({ padding: 0.5, duration: 800 });
    });
  }, [nodes, edges, setNodes, setEdges, fitView]);

  // Handle PNG Image Download
  const onDownloadImage = useCallback(() => {
    // Hide controls briefly if needed, but selecting .react-flow__viewport captures only the map
    const elem = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!elem) return;
    
    // We capture the viewport specifically to avoid UI chrome
    toPng(elem, {
      backgroundColor: '#0f172a',
      pixelRatio: 2,
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', `${activeMapId}-mindmap.png`);
      a.setAttribute('href', dataUrl);
      a.click();
    }).catch(err => {
      console.error('Failed to export image', err);
      alert('Failed to export image.');
    });
  }, [activeMapId]);

  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onAddChild,
        onAddSibling,
        onDelete: onDeleteNode,
        updateNodeLabel,
        updateNodeColor,
      },
    }));
  }, [nodes, onAddChild, onAddSibling, onDeleteNode, updateNodeLabel, updateNodeColor]);

  return (
    <ReactFlow
      nodes={nodesWithCallbacks}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode={ConnectionMode.Loose}
      fitView
      fitViewOptions={{ padding: 0.5 }}
      minZoom={0.1}
      maxZoom={2}
    >
      <Panel position="top-right" style={{ display: 'flex', gap: '8px' }}>
        <button className="secondary-btn" onClick={onLayout} style={{ background: 'rgba(15,23,42,0.8)', padding: '6px 12px' }}>
          <LayoutGrid size={16} />
          Organize Map
        </button>
        <button className="secondary-btn" onClick={onDownloadImage} style={{ background: 'rgba(15,23,42,0.8)', padding: '6px 12px' }}>
          <ImageIcon size={16} />
          Save PNG
        </button>
      </Panel>
      <Background color="#1e293b" gap={20} size={2} />
      <Controls />
      <MiniMap 
        nodeColor={(n) => n.id === 'root' ? '#3b82f6' : '#1e293b'} 
        maskColor="rgba(15, 23, 42, 0.7)"
        style={{ backgroundColor: '#0f172a' }}
      />
    </ReactFlow>
  );
};

const MindMapCanvasWithProvider = (props: MindMapCanvasProps) => {
  return (
    <ReactFlowProvider>
      <MindMapCanvas {...props} />
    </ReactFlowProvider>
  )
}

export default MindMapCanvasWithProvider;
