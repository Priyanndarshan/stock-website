import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card } from "./ui/card";

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsiblePanel({ title, children, defaultOpen = true }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="bg-gray-900 text-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-800/50 transition-colors"
      >
        <h2 className="text-xl font-semibold w-full text-center pr-5">{title}</h2>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-left">
            {children}
          </div>
        </div>
      )}
    </Card>
  );
} 