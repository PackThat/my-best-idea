import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import ItemCard from './ItemCard';

interface TripSubcategoryViewProps {
  subcategoryId: string;
  onBack: () => void;
}

const TripSubcategoryView: React.FC<TripSubcategoryViewProps> = ({ 
  subcategoryId, 
  onBack 
}) => {
  const { categories, subcategories, items, bags, people, updateItem, deleteItem } = useAppContext();
  
  const subcategory = subcategories.find(s => s.id === subcategoryId);
  const category = subcategory ? categories.find(c => c.id === subcategory.categoryId) : null;
  const subcategoryItems = items.filter(item => item.subcategoryId === subcategoryId);
  
  const packedCount = subcategoryItems.filter(item => item.packed).length;
  const totalCount = subcategoryItems.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  if (!subcategory || !category) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {category.name}
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{subcategory.name}</h2>
          <p className="text-gray-600">{category.name} • {totalCount} items</p>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
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

      {/* Items Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Items to Pack</h3>
        {subcategoryItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subcategoryItems.map((item) => {
              const bag = bags.find(b => b.id === item.bagId);
              const person = people.find(p => p.id === item.personId);
              
              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  category={category}
                  subcategory={subcategory}
                  bag={bag}
                  person={person}
                  bags={bags}
                  people={people}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                />
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No items in this subcategory yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TripSubcategoryView;