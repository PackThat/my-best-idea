import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Plus, Edit2, Trash2 } from 'lucide-react';
import EditPersonDialog from './EditPersonDialog';
import AddPersonDialog from './AddPersonDialog'; // Import the new dialog
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Person } from '@/types';

const PeopleManagementView: React.FC = () => {
  const { people, addPerson, updatePerson, deletePerson } = useAppContext();
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // State for the new dialog

  const handleUpdate = (personId: string, updates: Partial<Person>) => {
    updatePerson(personId, updates);
  };
  
  const handleAdd = async (personData: { name: string, color?: string }) => {
    await addPerson(personData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage All People</h2>
        {/* This button now opens our new dialog */}
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Person
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <Card key={person.id} className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {person.color && (
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: person.color }} />
                  )}
                  <User className="h-5 w-5" />
                  <span>{person.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingPerson(person)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card text-card-foreground">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{person.name}" and remove them and all their assigned items from every trip. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePerson(person.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      {/* Add the new dialog to the page */}
      <AddPersonDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAdd}
      />

      {editingPerson && (
        <EditPersonDialog
          open={!!editingPerson}
          onOpenChange={() => setEditingPerson(null)}
          person={editingPerson}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default PeopleManagementView;