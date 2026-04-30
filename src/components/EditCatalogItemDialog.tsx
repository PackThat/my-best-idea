import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CatalogItem } from '@/types';
import { useAppContext } from '@/contexts/AppContext';

interface EditCatalogItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CatalogItem | null;
}

const EditCatalogItemDialog: React.FC<EditCatalogItemDialogProps> = ({
  open,
  onOpenChange,
  item,
}) => {
  const { categories, subcategories, updateCatalogItem, deleteCatalogItem } = useAppContext();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategoryId(item.categoryId);
      setSubcategoryId(item.subcategoryId);
    }
  }, [item, open]);

  const handleSave = async () => {
    if (item && name.trim()) {
      await updateCatalogItem(item.id, {
        name: name.trim(),
        categoryId: categoryId,
        subcategoryId: subcategoryId === 'none' ? undefined : subcategoryId
      });
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (item && window.confirm(`Delete "${item.name}" from your Master List?`)) {
      await deleteCatalogItem(item.id);
      onOpenChange(false);
    }
  };

  const filteredSubcategories = subcategories.filter(sc => sc.categoryId === categoryId);
  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit Master Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Item Name</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <select className={selectClass} value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(undefined); }}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Subcategory (Optional)</Label>
            <select className={selectClass} value={subcategoryId || 'none'} onChange={(e) => setSubcategoryId(e.target.value)}>
              <option value="none">None</option>
              {filteredSubcategories.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between items-center gap-2">
          <Button variant="destructive" onClick={handleDelete} size="sm">Delete</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCatalogItemDialog;