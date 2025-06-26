import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Plus, Edit2, Trash2 } from 'lucide-react';
import ItemSelectionDialog from './ItemSelectionDialog';
import PersonSelector from './PersonSelector';
import EditPersonDialog from './EditPersonDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Person } from '@/types';

interface TripPeopleViewProps {
  onBack: () => void;
  onPersonClick: (personId: string) => void;
}

const TripPeopleView: React.FC<TripPeopleViewProps> = ({ onBack, onPersonClick }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const {
    people,
    items,
    categories,
    subcategories,
    bags,
    addItem,
    addItemToPacking,
    addPerson,
    updatePerson,
    removePersonFromTrip,
  } = useAppContext();

  const getPersonStats = (personId: string) => {
    const personItems = items.filter(item => item.personId === personId);
    const packedCount = personItems.filter(item => item.packed).length;
    const totalCount = personItems.length;
    return { packed: packedCount, total: totalCount };
  };

  const handlePersonSelect = (personId: string) => {
    setShowPersonSelector(false);
    onPersonClick(personId);
  };

  const handleAddNewPerson = (personName: string) => {
    const newPerson = { name: personName };
    addPerson(newPerson);
    setShowPersonSelector(false);
  };

  const handleEditPerson = (person: Person, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPerson(person);
    setShowEditDialog(true);
  };

  const handleSavePersonEdit = (personId: string, newName: string) => {
    updatePerson(personId, { name: newName });
  };

  const handleRemoveFromTrip = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removePersonFromTrip(personId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">People on Trip</h2>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={() => setShowPersonSelector(true)}
          className="flex-1 bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          ADD PERSON
        </Button>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          ADD ITEM
        </Button>
      </div>

      {showPersonSelector && (
        <Card>
          <CardHeader>
            <CardTitle>Select or Add Person</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PersonSelector
              people={people}
              onPersonSelect={handlePersonSelect}
              onAddNewPerson={handleAddNewPerson}
              placeholder="Choose a person or add new..."
            />
            <Button 
              variant="outline" 
              onClick={() => setShowPersonSelector(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => {
          const stats = getPersonStats(person.id);
          return (
            <Card key={person.id} className="hover:shadow-lg transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2" onClick={() => onPersonClick(person.id)}>
                    <User className="h-5 w-5 text-blue-600" />
                    <span>{person.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditPerson(person, e)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Person from Trip</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {person.name} from this trip? This will only remove them from the trip, not delete the person entirely.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => handleRemoveFromTrip(person.id, e)}>
                            Remove from Trip
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent onClick={() => onPersonClick(person.id)}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Items Progress</span>
                  <Badge variant={stats.packed === stats.total && stats.total > 0 ? "default" : "secondary"}>
                    {stats.packed}/{stats.total}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {people.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 mb-4">No people added to this trip yet.</p>
          </CardContent>
        </Card>
      )}

      {editingPerson && (
        <EditPersonDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          person={editingPerson}
          onSave={handleSavePersonEdit}
        />
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
      />
    </div>
  );
};

export default TripPeopleView;