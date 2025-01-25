"use client"

import { useCallback, useRef } from 'react';
import { ReactFlow, Controls, Background, NodeToolbar, Position, ReactFlowProvider, Panel, useNodesState, useEdgesState, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';

const initialNodes = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Inicio' },
    position: { x: 0, y: 50 },
  },
]

let id = 1;
const getId = () => `${id++}`
const nodeOrigin: [number, number] = [0.5, 0];


export function Flow() {
  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();


  const addNode = useCallback(
    (event) => {
      const { clientX, clientY } =
        'changedTouches' in event ? event.changedTouches[0] : event;
      
      const lastNode = nodes[nodes.length - 1];
      const newNode = {
        id: getId(),
        position: {
          x: lastNode ? lastNode.position.x : screenToFlowPosition({ x: clientX, y: clientY }).x,
          y: lastNode ? lastNode.position.y + 100 : screenToFlowPosition({ x: clientX, y: clientY }).y + 100,
        },
        data: { label: `Node ${id}` },
        origin: [0.5, 0.0],
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, screenToFlowPosition],
  );


  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        // edges={edges}
        nodeOrigin={nodeOrigin}
        onClick={(e) => addNode(e)}

      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}