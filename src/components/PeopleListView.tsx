import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Trash2 } from 'lucide-react';
import { Person, Item } from '@/types';
import { AddPersonDialog } from './AddPersonDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppContext } from '@/contexts/AppContext';

interface PeopleListViewProps {
  people: Person[];
  items: Item[];
  onAddPerson: (person: Omit<Person, 'id'>) => void;
  onPersonClick: (personId: string) => void;
}

const PeopleListView: React.FC<PeopleListViewProps> = ({
  people,
  items,
  onAddPerson,
  onPersonClick,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { deletePerson } = useAppContext();

  const handleDeletePerson = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePerson(personId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">People</h2>
          <Badge variant="outline">{people.length}</Badge>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Person
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => {
          const personItems = items.filter(item => item.personId === person.id);
          const packedItems = personItems.filter(item => item.packed);
          
          return (
            <Card 
              key={person.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onPersonClick(person.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${person.color}`} />
                    {person.name}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Person</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{person.name}"? 
                          {personItems.length > 0 && (
                            <span className="text-red-600 font-medium">
                              {' '}This will also delete {personItems.length} associated item(s).
                            </span>
                          )}
                          {' '}This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => handleDeletePerson(person.id, e)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Items:</span>
                    <Badge variant="outline">{personItems.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Packed:</span>
                    <Badge variant={packedItems.length === personItems.length ? "default" : "secondary"}>
                      {packedItems.length}/{personItems.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {people.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No people added yet</h3>
          <p className="text-gray-500 mb-4">Add people to start organizing items by person.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Person
          </Button>
        </div>
      )}

      <AddPersonDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddPerson={onAddPerson}
      />
    </div>
  );
};

export default PeopleListView;