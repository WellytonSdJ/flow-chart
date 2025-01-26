"use client"

import { SetStateAction, useCallback, useRef, useState } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, useReactFlow, addEdge, Panel, NodeToolbar } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';

type Node = {
  id: string;
  type?: string;
  data: { label: string };
  position: { x: number; y: number };
  origin?: [number, number]
};

const initialNodes: Node[] = [
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
  const onConnect = useCallback(
    (params: never) => setEdges(eds => addEdge(params, eds) as never[]),
    [],
  );

  const [open, setOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  console.log(nodes)

  const onNodeClick = useCallback(
    (event: { stopPropagation: () => void; }, node: SetStateAction<Node | null>) => {
      event.stopPropagation();
      setSelectedNode(node);
      setOpen(true);
    },
    []
  );

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const addNode = useCallback(
    (event: React.MouseEventHandler<HTMLButtonElement>) => {
      const { clientX, clientY } =
        'changedTouches' in event ? event.changedTouches[0] : event;

      console.log('event', event)

      const lastNode = nodes[nodes.length - 1];
      const newNode = {
        id: getId(),
        position: {
          x: lastNode ? lastNode.position.x : screenToFlowPosition({ x: clientX, y: clientY }).x,
          y: lastNode ? lastNode.position.y + 100 : screenToFlowPosition({ x: clientX, y: clientY }).y,
        },
        data: { label: `Node ${id}` },
        origin: [0.5, 0.0],
      };

      setNodes(nds => [...nds, newNode]);
      // setEdges((eds) =>
      //   eds.concat({ id, source: connectionState.fromNode.id, target: id }),
      // );
    },
    [nodes, screenToFlowPosition],
  );

  const addConditionalNodes = useCallback(() => {
    const lastNode = nodes[nodes.length - 1];
    const baseX = lastNode ? lastNode.position.x : 0;
    const baseY = lastNode ? lastNode.position.y + 100 : 100;

    const newNodes: Node[] = [
      {
        id: getId(),
        position: { x: baseX - 100, y: baseY + 100 },
        data: { label: `Node ${id}` },
        origin: [0.5, 0.0],
      },
      {
        id: getId(),
        position: { x: baseX + 100, y: baseY + 100 },
        data: { label: `Node ${id}` },
        origin: [0.5, 0.0],
      },
    ];

    setNodes((nds) => [...nds, ...newNodes]);
  }, [nodes]);


  return (
    <div style={{ height: '100%' }} ref={reactFlowWrapper}>
      <div className='flex flex-col fixed top-4 left-4 gap-2 z-10'>
        <Button onClick={(e) => addNode(e)}>Novo nó</Button>
        <Button onClick={(e) => addConditionalNodes(e)}>Novo condicional</Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // edges={edges}
        nodeOrigin={nodeOrigin}
        // nodeTypes={nodeTypes}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}


