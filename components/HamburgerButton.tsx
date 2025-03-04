import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

interface HamburgerButtonProps {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
}

export function HamburgerButton({ onClick, isOpen, className = '' }: HamburgerButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`hover:bg-gray-700/50 ${className}`}
    >
      {isOpen ? (
        <X className="h-6 w-6 text-gray-400" />
      ) : (
        <Menu className="h-6 w-6 text-gray-400" />
      )}
    </Button>
  );
} 