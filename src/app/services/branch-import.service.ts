import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Branch } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BranchImportService {
  importedData: Branch[] = [];

  constructor() {}

  // Import
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop();
    const fileReader: FileReader = new FileReader();

    fileReader.onload = (e) => {
      let importedData;
      const contents = fileReader.result;

      try {
        switch (fileExtension) {
          case 'json':
            importedData = JSON.parse(contents as string);
            break;
          case 'csv':
            const csvData = (contents as string).trim();
            importedData = this.parseCSVtoJSON(csvData);
            break;
          case 'xlsx':
            const workbook = XLSX.read(contents, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            importedData = XLSX.utils.sheet_to_json(worksheet);
            break;
          default:
            console.error('Unsupported file type');
            return;
        }
        this.importedData = importedData as Branch[];
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };

    if (fileExtension === 'xlsx') {
      fileReader.readAsArrayBuffer(file);
    } else {
      fileReader.readAsText(file);
    }
  }

  parseCSVtoJSON(csvData: string): Branch[] {
    const lines = csvData.split('\n');
    return lines.map((line) => {
      const values = line.split(',');
      // Create and return a Branch object, trimming quotes and whitespace from each value
      return {
        id: values[0].trim().replace(/^"|"$/g, ''),
        postCode: values[1].trim().replace(/^"|"$/g, ''),
        name: values[2].trim().replace(/^"|"$/g, ''),
        location: values[3].trim().replace(/^"|"$/g, ''),
        email: values[4].trim().replace(/^"|"$/g, ''),
        canton: values[5].trim().replace(/^"|"$/g, ''),
        website: values[6].trim().replace(/^"|"$/g, ''),
        openingHours: values[7].trim().replace(/^"|"$/g, ''),
        phone: values[8].trim().replace(/^"|"$/g, ''),
        lat: parseFloat(values[9].trim().replace(/^"|"$/g, '')),
        lng: parseFloat(values[10].trim().replace(/^"|"$/g, '')),
        imagePath: values[11]
          ? values[11].trim().replace(/^"|"$/g, '')
          : undefined,
      };
    });
  }
}
