import { Component, Inject } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Branch } from '../models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-download-dialog',
  standalone: true,
  imports: [MatDialogModule, TranslateModule, MatButtonModule,MatIconModule],
  providers: [],
  templateUrl: './download-dialog.component.html',
  styleUrls: ['./download-dialog.component.scss'],
})
export class DownloadDialogComponent {
  branchData: Branch[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { filteredData: Branch[] },
  ) {
    this.branchData = data.filteredData;
  }

  download(format: string) {
    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(this.branchData);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      XLSX.writeFile(workbook, 'branches.xlsx');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Name', 'PostCode', 'Location', 'Canton']],
        body: this.branchData.map(branch => [
          branch.name,
          branch.postCode,
          branch.location,
          branch.canton,
        ]),
      });
      doc.save('branches.pdf');
    }
  }
}
