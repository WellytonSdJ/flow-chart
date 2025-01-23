"use client"

import { useState } from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function Flow() {
  const [nodes, setNodes] = useState([
    {
      id: '1',
      data: { label: 'Hello' },
      position: { x: 0, y: 0 },
      type: 'input',
    },
    {
      id: '2',
      data: { label: 'World' },
      position: { x: 100, y: 100 },
    },
  ])
  const edges = [{ id: '1-2', source: '1', target: '2' }];

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Flow;