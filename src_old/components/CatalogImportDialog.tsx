import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface CatalogImportDialogProps {
  children: React.ReactNode;
}

export const CatalogImportDialog: React.FC<CatalogImportDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMultipleItems } = useAppContext();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: 'Please select a CSV file', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const processCsvData = () => {
    if (!csvText.trim()) {
      toast({ title: 'Please provide CSV data', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const items = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const item: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'name':
            case 'item':
              item.name = value;
              break;
            case 'category':
              item.category = value;
              break;
            case 'quantity':
            case 'qty':
              item.quantity = parseInt(value) || 1;
              break;
            case 'notes':
            case 'description':
              item.notes = value;
              break;
          }
        });
        
        return item;
      }).filter(item => item.name);

      addMultipleItems(items);
      toast({ title: `Successfully imported ${items.length} items!` });
      setOpen(false);
      setCsvText('');
    } catch (error) {
      toast({ title: 'Error processing CSV data', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Master Catalog
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Upload CSV File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-1"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>CSV should have columns: name, category, quantity, notes</p>
            <p>Example: "T-shirt, Clothing, 3, Cotton blend"</p>
          </div>
          <div>
            <Label htmlFor="csv-text">Or Paste CSV Data</Label>
            <Textarea
              id="csv-text"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="name,category,quantity,notes&#10;T-shirt,Clothing,3,Cotton blend&#10;Toothbrush,Toiletries,1,Electric"
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processCsvData} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Import Items'}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};