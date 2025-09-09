import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

export const TripSettingsView: React.FC = () => {
  const { setView } = useAppContext();
  const { setTheme } = useTheme();

  const handleResetTrip = () => {
    alert('Reset trip functionality will be implemented in a future step.');
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView('trip-home')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip
          </Button>
          <h2 className="text-2xl font-bold">Trip Settings</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel for your trip.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTheme('light')}>
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button variant="outline" onClick={() => setTheme('dark')}>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Note: For now, this changes the theme for the entire app. We will connect this to the specific trip later.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg-url">Background Image URL</Label>
              <Input id="bg-url" placeholder="https://example.com/image.png" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip Data</CardTitle>
            <CardDescription>
              Manage the data for this trip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleResetTrip}>
              Reset Trip Data
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This will mark all packed items as "To Be Packed".
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripSettingsView;