import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { User, Plus, Edit2, Trash2, X } from 'lucide-react';
import EditPersonDialog from './EditPersonDialog';
import InlinePersonForm from './InlinePersonForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Person } from '@/types';
import { cn } from '@/lib/utils';

const PeopleManagementView: React.FC = () => {
  const { people, createPerson, updatePerson, deletePerson } = useAppContext();
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleUpdate = (personId: number, updates: Partial<Person>) => {
    updatePerson(personId, updates);
  };
  
  const handleAdd = async (personData: { name: string, color?: string }) => {
    await createPerson(personData);
    setShowAddForm(false);
  };

  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full md:max-w-screen-md mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage All People</h2>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showAddForm ? 'Cancel' : 'Add New Person'}
          </Button>
        </div>

        {showAddForm && (
          <InlinePersonForm
            onCancel={() => setShowAddForm(false)}
            onSave={handleAdd}
          />
        )}
        
        <div className="border rounded-md bg-card">
          <Table>
            <TableBody>
              {sortedPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-3">
                      {person.color && (
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: person.color }} />
                      )}
                      <span className="font-medium text-card-foreground">{person.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {editingPerson && (
          <EditPersonDialog
            open={!!editingPerson}
            onOpenChange={() => setEditingPerson(null)}
            person={editingPerson}
            onSave={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default PeopleManagementView;