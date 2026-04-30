import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ChevronRight, Pencil, Trash2, Plus, Search, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Subcategory, CatalogItem } from '@/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const CatalogSubcategoryListView: React.FC = () => {
  const { 
    setView, categories, subcategories, catalog_items, addingCategoryId, setAddingSubcategoryId,
    addSubcategory, updateSubcategory, deleteSubcategory, deleteCatalogItem, updateCatalogItem,
    showFavoritesOnly, setShowFavoritesOnly
  } = useAppContext();

  const selectedCategory = categories.find(c => c.id === addingCategoryId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subToEdit, setSubToEdit] = useState<Subcategory | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subcategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subcategoryHasFavorites = (subId: string) => {
    return catalog_items.some(item => item.subcategoryId === subId && item.is_favorite);
  };

  const visibleSubcategories = useMemo(() => {
    let subs = subcategories.filter(sc => sc.categoryId === addingCategoryId);
    if (showFavoritesOnly) { subs = subs.filter(s => subcategoryHasFavorites(s.id)); }
    return subs.sort((a, b) => a.name.localeCompare(b.name));
  }, [subcategories, addingCategoryId, showFavoritesOnly, catalog_items]);

  if (!selectedCategory) { setView('items-management'); return null; }

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setAddingSubcategoryId(subcategory.id);
    setView('catalog-item-list' as any);
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24 px-4 pt-4">
      <div className="flex items-center justify-between gap-4">
        <Button variant="default" size="sm" onClick={() => setView('items-management')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        <h2 className="text-xl font-bold truncate">{selectedCategory.name}</h2>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Folder</Button>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search folders or items..." className="pl-11 bg-card border-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2 px-1">
          <Checkbox id="show-favorites-sub" checked={showFavoritesOnly} onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))} />
          <Label htmlFor="show-favorites-sub" className="text-sm font-medium cursor-pointer flex items-center gap-2">
            Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-icon-active text-icon-active" : "text-muted-foreground")} />
          </Label>
        </div>

        <div className="space-y-2">
          {visibleSubcategories.map(subcategory => (
            <Card key={subcategory.id} className="hover:bg-muted/50 transition-colors cursor-pointer bg-card" onClick={() => handleSubcategoryClick(subcategory)}>
              <CardContent className="py-2 px-4 flex justify-between items-center min-h-[44px]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{subcategory.name}</span>
                  {subcategoryHasFavorites(subcategory.id) && <Star className="h-3 w-3 fill-icon-active text-icon-active" />}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={(e) => { e.stopPropagation(); setSubToEdit(subcategory); setSubName(subcategory.name); setIsEditDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* CRUD Dialogs preserved in your local file */}
    </div>
  );
};

export default CatalogSubcategoryListView;