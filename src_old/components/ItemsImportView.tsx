import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Item } from '@/types';

interface ItemsImportViewProps {
  onImportItems: (items: Omit<Item, 'id' | 'packed' | 'needsToBuy' | 'personId' | 'bagId'>[]) => void;
}

const ItemsImportView: React.FC<ItemsImportViewProps> = ({ onImportItems }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      setResult({ success: false, message: 'Please select a valid CSV file.' });
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const itemIndex = headers.indexOf('item');
    const categoryIndex = headers.indexOf('category');
    const subcategoryIndex = headers.indexOf('subcategory');
    
    if (itemIndex === -1 || categoryIndex === -1 || subcategoryIndex === -1) {
      throw new Error('CSV must have ITEM, CATEGORY, and SUBCATEGORY columns');
    }
    
    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 3 && values[itemIndex] && values[categoryIndex] && values[subcategoryIndex]) {
        items.push({
          name: values[itemIndex],
          category: values[categoryIndex],
          subcategory: values[subcategoryIndex]
        });
      }
    }
    
    return items;
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    try {
      const text = await file.text();
      const items = parseCSV(text);
      
      if (items.length === 0) {
        setResult({ success: false, message: 'No valid items found in CSV file.' });
        return;
      }
      
      onImportItems(items);
      setResult({ success: true, message: `Successfully imported ${items.length} items.`, count: items.length });
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'Failed to import CSV file.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Import Items</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">CSV Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Must include columns: ITEM, CATEGORY, SUBCATEGORY</li>
              <li>First row should contain column headers</li>
              <li>Duplicate items will be ignored</li>
              <li>Existing items will not be removed</li>
            </ul>
          </div>
          
          {file && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">{file.name}</span>
            </div>
          )}
          
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleImport} 
            disabled={!file || importing}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importing...' : 'Import Items'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemsImportView;