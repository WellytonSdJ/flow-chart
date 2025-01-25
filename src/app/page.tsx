import { ReactFlowProvider } from "@xyflow/react";
import { Flow } from "./component/flow";

export default function Home() {
  return (
    <div className="fixed flex flex-col justify-normal  bg-slate-600 w-full h-full ">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
