import React from 'react';
import { cn } from '@/lib/utils';
import { COLOR_PALETTE } from '@/lib/constants'; // Imports colors from our new central file

interface ColorPaletteProps {
  selectedColor?: string;
  onSelectColor: (color?: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelectColor(color === selectedColor ? undefined : color)}
          className={cn(
            "w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110",
            color === '#FFFFFF' && 'border-gray-300',
            selectedColor === color ? 'border-primary scale-110' : 'border-transparent'
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};