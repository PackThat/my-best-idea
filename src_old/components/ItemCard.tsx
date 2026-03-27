import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Edit2, Trash2, Package, User, ArrowRightLeft } from 'lucide-react';
import { Item, Category, Subcategory, Bag, Person } from '@/types';
import QuickEditDialog from './QuickEditDialog';

interface ItemCardProps {
  item: Item;
  category?: Category;
  subcategory?: Subcategory;
  bag?: Bag;
  person?: Person;
  bags: Bag[];
  people: Person[];
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  category,
  subcategory,
  bag,
  person,
  bags,
  people,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [showQuickEdit, setShowQuickEdit] = React.useState(false);
  const [editData, setEditData] = React.useState({
    name: item.name,
    quantity: item.quantity,
    notes: item.notes,
  });

  const handleSave = () => {
    onUpdate(item.id, editData);
    setIsEditing(false);
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${
        item.packed ? 'bg-green-50 border-green-200' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={item.packed}
                onCheckedChange={(checked) => 
                  onUpdate(item.id, { packed: !!checked })
                }
              />
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="font-medium"
                />
              ) : (
                <h3 className={`font-medium ${
                  item.packed ? 'line-through text-gray-500' : ''
                }`}>
                  {item.name}
                </h3>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickEdit(true)}
                title="Change bag/person"
              >
                <ArrowRightLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {category && (
              <Badge variant="secondary" className={category.color}>
                {category.name}
              </Badge>
            )}
            {subcategory && (
              <Badge variant="outline">{subcategory.name}</Badge>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Input
                type="number"
                value={editData.quantity}
                onChange={(e) => setEditData(prev => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 0 
                }))}
                placeholder="Quantity"
              />
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes..."
                rows={2}
              />
              <Button onClick={handleSave} size="sm">Save</Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">
                Quantity: {item.quantity}
              </p>
              {item.notes && (
                <p className="text-sm text-gray-500 mb-2">{item.notes}</p>
              )}
            </>
          )}

          <div className="flex items-center justify-between mt-3">
            <Button
              variant={item.needsToBuy ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate(item.id, { needsToBuy: !item.needsToBuy })}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              {item.needsToBuy ? 'Need to Buy' : 'Have It'}
            </Button>
            
            {(bag || person) && (
              <div className="flex gap-1">
                {person && (
                  <Badge className={person.color}>
                    <User className="h-3 w-3 mr-1" />
                    {person.name}
                  </Badge>
                )}
                {bag && (
                  <Badge className={bag.color}>
                    <Package className="h-3 w-3 mr-1" />
                    {bag.name}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <QuickEditDialog
        open={showQuickEdit}
        onOpenChange={setShowQuickEdit}
        item={item}
        bags={bags}
        people={people}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default ItemCard;