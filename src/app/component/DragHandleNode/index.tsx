'use client'
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
 
const onConnect = (params) => console.log('handle onConnect', params);
// iniciei mas ainda não dei segmento, esse componente poderaá ser movido, mas apenas até a altura atual dele ou para baixo e lados, nunca acima de sua altura atual.
 
function DragHandleNode() {
  return (
    <>
      <Handle type="target" position={Position.Left} onConnect={onConnect} />
      <div className='drag-handle__label'>
        Only draggable here →
        {/* Use the class specified at node.dragHandle here */}
        <span className="drag-handle__custom" />
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
 
export default memo(DragHandleNode);