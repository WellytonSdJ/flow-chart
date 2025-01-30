"use client";

import { useCallback, useRef, useState } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, useReactFlow, addEdge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import DragHandleNode from '../DragHandleNode';

// [x] Criar um nó partindo do nó selecionado
// [ ] Ajustar posições automaticamente
// [ ] Proibir mover nó acima de 'nó anterior + 100' (altura base)
// [ ] Excluir nó selecionado
// [ ] Criar ligações entre nós

type Node = {
  id: string;
  type?: string;
  data: { label: string };
  position: { x: number; y: number };
  origin?: [number, number]
  dragHandle?: string
};

const initialNodes: Node[] = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Inicio' },
    position: { x: 0, y: 50 },
    // Specify the custom class acting as a drag handle
    dragHandle: '.drag-handle__custom',
  },
]
const nodeTypes = {
  dragHandleNode: DragHandleNode,
};

let id = 1;
const getId = () => `${id++}`
const nodeOrigin: [number, number] = [0.5, 0];


export function Flow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds) as never[]),
    [],
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  console.log(nodes)

  const onNodeClick = useCallback(
    (event: { stopPropagation: () => void; }, node: Node) => {
      event.stopPropagation();
      const { id, data, position } = node
      console.log('node', node)
      setSelectedNode({ id, data, position });
    },
    []
  );



  const addNode = useCallback(
    (event: React.MouseEventHandler<HTMLButtonElement>) => {
      const { clientX, clientY } =
        'changedTouches' in event ? event.changedTouches[0] : event;

        console.log('selectedNode', selectedNode)
        const baseX = selectedNode?.position.x ?? 0
        const baseY = selectedNode?.position.y ?? 50

      console.log('add node', {baseX, baseY})  

      

      const newNode: Node = {
        id: getId(),
        position: {
          x: baseX,
          y: baseY + 150
        },
        data: { label: `Node ${id}` },
        type: 'input',
        // origin: [0.5, 0.0],
      };

      // Verifica se há conflito de posição entre o novo nó e os nós existentes
      const hasConflict = (newNode: Node) =>
        nodes.some(
          (existingNode) =>
            // Verifica se o newNode está na mesma posição de algum node dentro do state de nodes
            Math.abs(existingNode.position.x - newNode.position.x) < 150 &&
            existingNode.position.y === newNode.position.y,
        );

      if (hasConflict(newNode)) {
        const newNodeWithConflictResolution = {
          ...newNode,
          position: {
            x: newNode.position.x + newNode.data.label.length * 10 + 50,
            y: newNode.position.y,
          },
        };
        setNodes(nds => [...nds, newNodeWithConflictResolution]);
      } else {
        setNodes(nds => [...nds, newNode]);
      }

      console.log(hasConflict(newNode))


    },
    [nodes, screenToFlowPosition, selectedNode],
  );

  const addConditionalNodes = useCallback(() => {
    const baseX = selectedNode ? selectedNode.position.x : 0;
    const baseY = selectedNode ? selectedNode.position.y : 50;

    console.log(
      'new conditional',
      {
        baseX,
        baseY
      })

    const newNodes: Node[] = [
      {
        id: getId(),
        position: { x: baseX, y: baseY + 100 },
        data: { label: `Conditional ${id}` },
        type: 'input',
      },
      {
        id: getId(),
        position: { x: baseX - 100, y: baseY + 150 },
        data: { label: `condition 1 ${id}` },
        type: 'input',
      },
      {
        id: getId(),
        position: { x: baseX + 100, y: baseY + 150 },
        data: { label: `condition 2 ${id}` },
        type: 'input',
      },
    ];

    const hasConflict = (newNodes: Node[]) =>
      newNodes.some(
        (newNode) =>
          nodes.some(
            (existingNode) =>
              // Verifica se a diferença na posição x é menor ou igual a 100
              Math.abs(existingNode.position.x - newNode.position.x) <= 100 &&
              // Verifica se a diferença na posição y é menor ou igual a 100
              Math.abs(existingNode.position.y - newNode.position.y) <= 100,
          ),
      );

    console.log('conditional conflict', hasConflict(newNodes))

    // checar se as medidas não colidem com outras medidas dentro do node

    setNodes((nds) => [...nds, ...newNodes]);

    setSelectedNode(null);
  }, [nodes, selectedNode]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    }
    setSelectedNode(null);
  }, [nodes, selectedNode]);



  return (
    <div style={{ height: '100%' }} ref={reactFlowWrapper}>
      <div className='flex flex-col fixed top-4 left-4 gap-2 z-10 p-2'>
        <div className='flex flex-col bg-white p-2 w-80 rounded'>
          <span className="text-3xl p-2 font-semibold">Selected Node</span>
          <span className="text-2xl p-2">ID: {selectedNode?.id}</span>
          <span className="text-2xl p-2">positionX {selectedNode?.position.x}</span>
          <span className="text-2xl p-2">positionY {selectedNode?.position.y}</span>
        </div>
        <Button onClick={(e) => addNode(e)}>Novo nó</Button>
        <Button onClick={(e) => addConditionalNodes(e)}>Novo condicional</Button>
        <Button onClick={deleteSelectedNode} disabled={!selectedNode}>Deletar nó selecionado</Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // edges={edges}
        nodeOrigin={nodeOrigin}
        nodeTypes={nodeTypes}
        draggable
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

