import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const DiamondNode = memo(({ data, isConnectable }: NodeProps) => {
    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-primary bg-background rotate-45 z-0" />
            <div className="relative z-10 p-2 text-center text-xs break-words rotate-0">
                {data.label}
            </div>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="-mt-3.5" />
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="-mb-3.5" />
            <Handle type="source" position={Position.Left} isConnectable={isConnectable} className="-ml-3.5" />
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="-mr-3.5" />
        </div>
    );
});

export const TextNode = memo(({ data }: NodeProps) => {
    return (
        <div className="p-2 min-w-[100px] text-center">
            {data.label}
        </div>
    );
});

export const CircleNode = memo(({ data, isConnectable }: NodeProps) => {
    return (
        <div className="w-16 h-16 rounded-full border-2 border-primary bg-background flex items-center justify-center text-xs p-1 text-center">
            {data.label}
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        </div>
    );
});

export const RectangleNode = memo(({ data, isConnectable }: NodeProps) => {
    return (
        <div className="min-w-[100px] min-h-[50px] border-2 border-primary bg-background flex items-center justify-center text-xs p-2 rounded-md">
            {data.label}
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        </div>
    );
});

DiamondNode.displayName = "DiamondNode";
TextNode.displayName = "TextNode";
CircleNode.displayName = "CircleNode";
RectangleNode.displayName = "RectangleNode";
