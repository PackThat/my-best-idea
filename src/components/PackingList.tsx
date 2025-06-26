import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, User, Package } from 'lucide-react';
import { Person, Category } from '@/types';

interface PackingListProps {
  onPersonClick: (personId: string) => void;
  onCategoryClick: (categoryId: string, personId?: string) => void;
}

const PackingList: React.FC<PackingListProps> = ({ onPersonClick, onCategoryClick }) => {
  const { people, categories, items } = useAppContext();

  const getPersonItemCount = (personId: string) => {
    return items.filter(item => item.personId === personId).length;
  };

  const getPersonPackedCount = (personId: string) => {
    return items.filter(item => item.personId === personId && item.packed).length;
  };

  const getCategoryItemCount = (categoryId: string, personId?: string) => {
    return items.filter(item => 
      item.categoryId === categoryId && 
      (!personId || item.personId === personId)
    ).length;
  };

  const getCategoryPackedCount = (categoryId: string, personId?: string) => {
    return items.filter(item => 
      item.categoryId === categoryId && 
      (!personId || item.personId === personId) && 
      item.packed
    ).length;
  };

  const getPersonCategories = (personId: string) => {
    const personItems = items.filter(item => item.personId === personId);
    const categoryIds = [...new Set(personItems.map(item => item.categoryId))];
    return categories.filter(cat => categoryIds.includes(cat.id));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Packing List</h2>
      
      {people.map((person) => {
        const totalItems = getPersonItemCount(person.id);
        const packedItems = getPersonPackedCount(person.id);
        const personCategories = getPersonCategories(person.id);
        
        if (totalItems === 0) return null;
        
        return (
          <Card key={person.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader 
              className="pb-3"
              onClick={() => onPersonClick(person.id)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: person.color }}
                  />
                  <User className="h-5 w-5" />
                  <span>{person.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {packedItems}/{totalItems} packed
                  </Badge>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-2">
                {personCategories.map((category) => {
                  const catTotal = getCategoryItemCount(category.id, person.id);
                  const catPacked = getCategoryPackedCount(category.id, person.id);
                  
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryClick(category.id, person.id);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <Package className="h-4 w-4" />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {catPacked}/{catTotal}
                        </Badge>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PackingList;