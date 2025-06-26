import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Edit2, Trash2, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Person } from '@/types';
import { defaultPeople } from '@/data/defaultData';

interface PeopleManagementViewProps {
  onBack: () => void;
}

const PeopleManagementView: React.FC<PeopleManagementViewProps> = ({ onBack }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { items, updatePerson, deletePerson, setCurrentView } = useAppContext();
  
  // Use all people from database instead of just trip people
  const allPeople = defaultPeople;

  const handleBackClick = () => {
    // Navigate back to home view instead of calling onBack
    setCurrentView('home');
  };

  const handleEdit = (person: Person) => {
    setEditingId(person.id);
    setEditName(person.name);
  };

  const handleSave = (personId: string) => {
    if (editName.trim()) {
      updatePerson(personId, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (personId: string) => {
    deletePerson(personId);
  };

  const getPersonItemCount = (personId: string) => {
    return items.filter(item => item.personId === personId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Manage People ({allPeople.length})</h2>
      </div>
      
      <div className="grid gap-4">
        {allPeople.map((person) => {
          const itemCount = getPersonItemCount(person.id);
          const isEditing = editingId === person.id;
          
          return (
            <Card key={person.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {isEditing ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-lg font-semibold"
                        autoFocus
                      />
                    ) : (
                      <span>{person.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(person.id)}
                          disabled={!editName.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(person)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Person</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{person.name}"? 
                                {itemCount > 0 && (
                                  <span className="text-red-600 font-medium">
                                    {' '}This will also delete {itemCount} associated item(s).
                                  </span>
                                )}
                                {' '}This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(person.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} associated
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {allPeople.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No people found in the database.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PeopleManagementView;