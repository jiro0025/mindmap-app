import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { MindMapNodeData } from '../components/CustomNode';

export function getChildNodePosition(
  parentPosition: { x: number; y: number },
  existingChildrenCount: number
) {
  return {
    x: parentPosition.x + 300,
    y: parentPosition.y + (existingChildrenCount * 80)
  };
}

export function getSiblingNodePosition(
  siblingPosition: { x: number; y: number }
) {
  return {
    x: siblingPosition.x,
    y: siblingPosition.y + 100
  };
}

export const getLayoutedElements = (
  nodes: Node<MindMapNodeData>[],
  edges: Edge[],
  direction = 'LR' // Left to Right
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure DAG Layout
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 180 });

  // Add nodes and edges to graph for calculation
  nodes.forEach((node) => {
    // Estimating node dimensions based on typical content
    dagreGraph.setNode(node.id, { width: 180, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Apply calculated positions back to ReactFlow nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 180 / 2, // Center anchor compensation
        y: nodeWithPosition.y - 50 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
