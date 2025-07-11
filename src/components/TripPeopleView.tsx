import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Plus, Edit2, Trash2, X } from 'lucide-react';
import PersonSelector from './PersonSelector';
import EditPersonDialog from './EditPersonDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Person } from '@/types';

interface TripPeopleViewProps {
  onBack: () => void;
  onPersonClick: (personId: string) => void;
}

const TripPeopleView: React.FC<TripPeopleViewProps> = ({ onBack, onPersonClick }) => {
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const {
    people, tripPeople, items,
    addPerson, addPersonToTrip, updatePerson, removePersonFromTrip,
  } = useAppContext();

  const currentTripPeople = people.filter(p => tripPeople.includes(p.id));

  const getPersonStats = (personId: string) => {
    const personItems = items.filter(item => item.personId === personId);
    const packedCount = personItems.filter(item => item.packed).length;
    const totalCount = personItems.length;
    return { packed: packedCount, total: totalCount };
  };

  const handlePersonSelect = (personId: string) => {
    addPersonToTrip(personId);
    setShowPersonSelector(false); 
  };

  const handleAddNewPerson = async (personData: { name: string; color?: string }) => {
    await addPerson(personData);
    setShowPersonSelector(false); 
  };

  const handleEditPerson = (person: Person, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPerson(person);
  };

  const handleSavePersonEdit = (personId: string, updates: Partial<Person>) => {
    updatePerson(personId, updates);
  };

  const handleRemoveFromTrip = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removePersonFromTrip(personId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip
          </Button>
          <h2 className="text-2xl font-bold">People</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPersonSelector(!showPersonSelector)}>
            {showPersonSelector ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
            {showPersonSelector ? 'Cancel' : 'Add Person'}
          </Button>
        </div>
      </div>

      {showPersonSelector && (
        <Card className="bg-card">
          <CardHeader><CardTitle>Select or Add Person</CardTitle></CardHeader>
          <CardContent>
            <PersonSelector
              people={people}
              onPersonSelect={handlePersonSelect}
              onAddNewPerson={handleAddNewPerson}
              placeholder="Choose a person to add..."
            />
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentTripPeople.map((person) => {
          const stats = getPersonStats(person.id);
          return (
            <Card key={person.id} className="hover:shadow-lg transition-all cursor-pointer bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2" onClick={() => onPersonClick(person.id)}>
                    {person.color && ( <div className="w-4 h-4 rounded-full" style={{ backgroundColor: person.color }} /> )}
                    <User className="h-5 w-5" />
                    <span>{person.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => handleEditPerson(person, e)}><Edit2 className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Person from Trip</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to remove {person.name} from this trip?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => handleRemoveFromTrip(person.id, e)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent onClick={() => onPersonClick(person.id)}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Items Progress</span>
                  <Badge variant={stats.packed === stats.total && stats.total > 0 ? "default" : "secondary"}>{stats.packed}/{stats.total}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {currentTripPeople.length === 0 && !showPersonSelector && (
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No people added to this trip yet.</p>
          </CardContent>
        </Card>
      )}

      {editingPerson && (
        <EditPersonDialog
          open={!!editingPerson}
          onOpenChange={() => setEditingPerson(null)}
          person={editingPerson}
          onSave={handleSavePersonEdit}
        />
      )}
    </div>
  );
};

export default TripPeopleView;