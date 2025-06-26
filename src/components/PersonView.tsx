import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User, Plus, Package } from 'lucide-react';
import ItemCard from './ItemCard';
import ItemSelectionDialog from './ItemSelectionDialog';

interface PersonViewProps {
  personId: string;
  onBack?: () => void;
  onCategoryClick: (categoryId: string, personId?: string) => void;
}

const PersonView: React.FC<PersonViewProps> = ({ personId, onBack, onCategoryClick }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const {
    people,
    items,
    categories,
    subcategories,
    bags,
    updateItem,
    deleteItem,
    addItem,
    addItemToPacking,
    setCurrentView
  } = useAppContext();

  const person = people.find(p => p.id === personId);
  const personItems = items.filter(item => item.personId === personId);
  const packedCount = personItems.filter(item => item.packed).length;
  const totalCount = personItems.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  const handleBack = () => {
    try {
      if (onBack && typeof onBack === 'function') {
        onBack();
      } else {
        // Fallback navigation
        setCurrentView('trip-people');
      }
    } catch (error) {
      console.error('Error in handleBack:', error);
      // Always fallback to trip-people view
      setCurrentView('trip-people');
    }
  };

  if (!person) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Person not found</p>
        <Button onClick={handleBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const categoryGroups = categories.reduce((acc, category) => {
    const categoryItems = personItems.filter(item => item.categoryId === category.id);
    if (categoryItems.length > 0) {
      acc[category.id] = {
        category,
        items: categoryItems,
        packed: categoryItems.filter(item => item.packed).length,
        total: categoryItems.length
      };
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">{person.name}</h2>
        </div>
      </div>

      <div className="mb-4">
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          ADD ITEM
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Packing Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Packed: {packedCount} of {totalCount}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {Object.keys(categoryGroups).length > 0 ? (
        <div className="space-y-6">
          {Object.values(categoryGroups).map((group: any) => (
            <Card key={group.category.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onCategoryClick(group.category.id, personId)}
              >
                <CardTitle className="flex items-center justify-between">
                  <span>{group.category.name}</span>
                  <Badge variant="outline">
                    {group.packed}/{group.total}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {group.items.map((item: any) => {
                    const category = categories.find(c => c.id === item.categoryId);
                    const subcategory = subcategories.find(s => s.id === item.subcategoryId);
                    const bag = bags.find(b => b.id === item.bagId);
                    const itemPerson = people.find(p => p.id === item.personId);
                    
                    return (
                      <ItemCard
                        key={item.id}
                        item={item}
                        category={category}
                        subcategory={subcategory}
                        bag={bag}
                        person={itemPerson}
                        bags={bags}
                        people={people}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 mb-4">No items assigned to {person.name} yet.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      )}

      <ItemSelectionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        categories={categories}
        subcategories={subcategories}
        items={items}
        people={people}
        bags={bags}
        onAddItemToPacking={addItemToPacking}
        onAddNewItem={addItem}
        preselectedPersonId={personId}
      />
    </div>
  );
};

export default PersonView;