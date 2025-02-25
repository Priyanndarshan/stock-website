import { Menu } from "lucide-react";
import { Button } from "./ui/button";

interface HamburgerButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function HamburgerButton({ onClick, isOpen }: HamburgerButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`fixed top-4 left-4 z-50 hover:bg-gray-800`}
    >
      <Menu className="h-6 w-6 text-gray-300" />
    </Button>
  );
} 