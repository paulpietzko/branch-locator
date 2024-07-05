import { Component, Input } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Branch, FileFormat } from '../models';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-branches-table-download',
  standalone: true,
  imports: [TranslateModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './branches-table-download.component.html',
  styleUrls: ['./branches-table-download.component.scss'],
})
export class BranchesTableDownloadComponent {
  @Input() branchData: Branch[] = [];

  FileFormat = FileFormat;

  constructor() {}
  
  // #region Download methods
  
  download(format: FileFormat) {
    switch (format) {
      case FileFormat.Excel:
        this.downloadExcel();
        break;
      case FileFormat.Pdf:
        this.downloadPdf();
        break;
      case FileFormat.Json:
        this.downloadJson();
        break;
      case FileFormat.Csv:
        this.downloadCsv();
        break;
      default:
        console.error('Unsupported format');
    }
  }

  private downloadPdf() {
    const doc = new jsPDF();
    this.generatePdf(doc);
    doc.save('branches.pdf');
  }

  private downloadExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.branchData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'branches.xlsx');
  }

  private downloadJson() {
    const jsonContent = JSON.stringify(this.branchData, null, 2);
    this.downloadFile(jsonContent, 'branches.json', 'application/json');
  }

  private downloadCsv() {
    const csvContent = this.convertArrayOfObjectsToCSV(this.branchData);
    this.downloadFile(csvContent, 'branches.csv', 'text/csv');
  }

  private downloadFile(content: string, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  // #endregion

  // #region Generation and conversion methods

  private generatePdf(doc: jsPDF) {
    autoTable(doc, {
      head: [['Name', 'PostCode', 'Location', 'Canton']],
      body: this.branchData.map((branch) => [
        branch.name,
        branch.postCode,
        branch.location,
        branch.canton,
      ]),
    });
  }

  private convertArrayOfObjectsToCSV(data: Branch[]): string {
    const csv = data
      .map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(',')
      )
      .join('\n');
    return csv;
  }

  // #endregion
}
