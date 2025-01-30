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
  },
]
const nodeTypes = {
  dragHandleNode: DragHandleNode,
};

let id = 1;
const getId = () => `${id++}`
const nodeOrigin: [number, number] = [0.5, 0];

const initialEdge = []


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
      console.log('node', node.position)
      setSelectedNode({ id, data, position });
    },
    []
  );

  const existingNodesInSameYAxis = (newNode: Node | Node[]): boolean => {
    if (Array.isArray(newNode)) {
      return newNode.some(n => nodes.some(node => node.position.y === n.position.y));
    }
    return nodes.some(node => node.position.y === newNode.position.y);
  }

  const checkSelectedNodeXPosition = () => {
    if (selectedNode) {
      const { x } = selectedNode.position;
      return x;
    }
    return null;
  }

  const addNode = useCallback(
    (event: React.MouseEventHandler<HTMLButtonElement>) => {
      console.log('selectedNode', selectedNode)
      const baseX = selectedNode?.position.x ?? 0
      const baseY = selectedNode?.position.y ?? 50
      
      console.log('add node', { baseX, baseY })

      const newNode: Node = {
        id: getId(),
        position: {
          x: baseX,
          y: baseY + 100
        },
        data: { label: `Node ${id}` },
        type: 'input',
      };

      setNodes((nds) => {
        if (existingNodesInSameYAxis(newNode)) {
          console.log('-> ', checkSelectedNodeXPosition())
          const selectedNodeX = checkSelectedNodeXPosition();
          if (selectedNodeX !== null && selectedNodeX >= 0){
            // adiciona o novo node depois do maior
            const maxX = Math.max(...nds.filter((node) => node.position.y === newNode.position.y).map((node) => node.position.x));
            newNode.position.x = maxX + 300;
          }
          if(selectedNodeX !== null && selectedNodeX < 0){
            // adiciona o novo node antes do menor
            const minX = Math.min(...nds.filter((node) => node.position.y === newNode.position.y).map((node) => node.position.x));
            newNode.position.x = minX - 300;
          }
        }

        return [...nds, newNode];
      });

      if (selectedNode) {
        setEdges(eds => [...eds, { id: getId(), source: selectedNode.id, target: newNode.id, type: 'smoothstep', animated: true }]);
      }
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

    const newConditions: Node[] = [
      {
        id: getId(),
        position: { x: baseX - 150, y: baseY + 100 },
        data: { label: `condition 1 ${id}` },
        type: 'input',
      },
      {
        id: getId(),
        position: { x: baseX + 150, y: baseY + 100 },
        data: { label: `condition 2 ${id}` },
        type: 'input',
      },
    ];

    // Filtra os nós que possuem a mesma posição y do primeiro nó condicional
    const sameYNodes = nodes.filter((node) => node.position.y === newConditions[0].position.y);
    // Procura o maior valor de x entre os nós que possuem a mesma posição y
    const maxX = Math.max(...sameYNodes.map((node) => node.position.x));
    // Se o maior valor de x for maior que 0, significa que existem nós na mesma posição y
    // Então adiciona o novo nó condicional com um x maior que o maior valor de x encontrado
    if (maxX > 0) {
      newConditions[0].position.x = maxX + 300;
      newConditions[1].position.x = maxX + 600;
    }

    // Adiciona os novos nós condicionais ao array de nós
    setNodes((nds) => [...nds, ...newConditions]);

    // Reseta o nó selecionado
    setSelectedNode(null);
  }, [nodes, selectedNode]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      if(selectedNode.id === '0') {
        alert('Não é possivel remover o primeiro nó')
        return
      }
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

