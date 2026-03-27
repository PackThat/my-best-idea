// src/components/InlineBagForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPalette } from './ColorPalette';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InlineBagFormProps {
  onCancel: () => void;
  onSave: (bagData: { name: string; color?: string }) => Promise<void>;
}

const InlineBagForm: React.FC<InlineBagFormProps> = ({ onCancel, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (name.trim()) {
      setIsSaving(true);
      await onSave({ name: name.trim(), color });
      // The parent component will handle closing the form and resetting state
    }
  };

  return (
    <Card className="bg-card mb-6">
      <CardHeader>
        <CardTitle>Add a New Global Bag</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-bag-name">Bag's Name</Label>
          <Input
            id="new-bag-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Carry-on Suitcase"
            autoFocus
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <ColorPalette selectedColor={color} onSelectColor={setColor} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Adding...' : 'Add Bag'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InlineBagForm;