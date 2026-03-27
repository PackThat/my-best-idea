import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus } from 'lucide-react';
import ItemCard from './ItemCard';
import ItemSelectionDialog from './ItemSelectionDialog';
import AddItemDialog from './TripAddItemDialog';

interface CategoryViewProps {
  categoryId: string;
  personId?: string;
  onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ categoryId, personId, onBack }) => {
  const { 
    categories, 
    subcategories, 
    bags, 
    people, 
    items: tripItems, 
    catalog_items,    
    
    updateItem, 
    deleteItem,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItem,
    createPerson,
    createBag,
    addCategory,
  } = useAppContext();
  
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  
  // --- DIAGNOSTICS ---
  // Try to find the category using String conversion to be safe
  const category = categories.find(c => String(c.id) === String(categoryId));
  const person = personId ? people.find(p => String(p.id) === String(personId)) : null;

  // DIAGNOSTIC 1: If category is missing, show a big error instead of a blank screen
  if (!category) {
    return (
      <div className="p-8 space-y-4 border-2 border-red-500 m-4 rounded bg-red-50">
        <h2 className="text-xl font-bold text-red-700">DEBUG: Category Not Found</h2>
        <p>The app tried to look for Category ID: <strong>{categoryId}</strong></p>
        <p>But it wasn't found in the list of {categories.length} categories.</p>
        <div className="text-sm text-gray-600 bg-white p-2 rounded border">
          <strong>Available Categories:</strong><br/>
          {categories.map(c => `${c.name} (${c.id})`).join(', ')}
        </div>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const isGlobalMode = !personId;

  // Filter items
  const displayItems = isGlobalMode
    ? catalog_items.filter(i => String(i.categoryId) === String(categoryId))
    : tripItems.filter(i => String(i.categoryId) === String(categoryId) && String(i.personId) === String(personId));

  const packedCount = displayItems.filter(item => (item as any).packed).length;
  const totalCount = displayItems.length;

  const getTitle = () => {
    if (person) return `${person.name} - ${category.name}`;
    return `Catalog: ${category.name}`;
  };

  const handleSelectExistingItem = (selectedItem: any) => {
    console.log("Select item logic:", selectedItem);
  };

  const handleCreateNewItem = () => {
    setShowAddItemDialog(true);
  };

  const handleUpdate = async (itemId: string, updates: any) => {
    if (isGlobalMode) await updateCatalogItem(itemId, updates);
    else await updateItem(itemId, updates);
  };

  const handleDelete = async (itemId: string) => {
    if (isGlobalMode) await deleteCatalogItem(itemId);
    else await deleteItem(itemId);
  };

  const handleAddItemFromDialog = async (itemData: any) => {
      await addCatalogItem({
          name: itemData.name,
          categoryId: itemData.categoryId,
          subcategoryId: itemData.subcategoryId
      });
  };

  return (
    <div className="space-y-4 p-4">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#ccc' }} />
          <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          {!isGlobalMode && (
            <Badge variant="outline">{packedCount}/{totalCount} packed</Badge>
          )}
        </div>
        <Button onClick={() => setShowItemSelection(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* ITEM GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item as any}
            category={categories.find(c => String(c.id) === String(item.categoryId))}
            subcategory={subcategories.find(s => String(s.id) === String(item.subcategoryId))}
            bag={bags.find(b => String(b.id) === String((item as any).bagId))}
            person={people.find(p => String(p.id) === String((item as any).personId))}
            bags={bags}
            people={people}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* EMPTY STATE with DIAGNOSTICS */}
      {displayItems.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
          <p className="text-gray-600 font-medium">No items found in "{category.name}".</p>
          
          <div className="mt-4 text-xs text-left inline-block bg-white p-4 border rounded shadow-sm">
            <p className="font-bold mb-2">Diagnostic Info:</p>
            <p>Mode: {isGlobalMode ? "Global Catalog" : "Trip View"}</p>
            <p>Looking for Category ID: {categoryId}</p>
            <p>Total Global Catalog Items: {catalog_items.length}</p>
            <p>Total Trip Items: {tripItems.length}</p>
            {isGlobalMode && catalog_items.length > 0 && (
              <div className="mt-2 border-t pt-2">
                <p>Sample Catalog Item Category IDs:</p>
                {catalog_items.slice(0, 3).map(i => i.categoryId).join(', ')}
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Button onClick={() => setShowItemSelection(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        </div>
      )}

      <ItemSelectionDialog
        open={showItemSelection}
        onOpenChange={setShowItemSelection}
        {...{ items: isGlobalMode ? catalog_items : tripItems } as any}
        onSelectItem={handleSelectExistingItem}
        onCreateNew={handleCreateNewItem}
      />

      <AddItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        categories={categories}
        subcategories={subcategories}
        bags={bags}
        people={people}
        items={tripItems} 
        onAddItem={handleAddItemFromDialog}
        onAddNewItem={handleAddItemFromDialog}
        onAddItemToPacking={async () => {}}
        onAddPerson={createPerson}
        onAddCategory={async (cat: any) => await addCategory(cat.name)}
        onAddBag={createBag}
        onAddSubcategory={async () => {}} 
      />
    </div>
  );
};

export default CategoryView;