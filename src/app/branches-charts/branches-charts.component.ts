import { Component, AfterViewInit } from '@angular/core';
import { BranchService } from '../services/branch.service';
import { Branch } from '../models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-branches-charts',
  standalone: true,
  imports: [
    MatButtonModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './branches-charts.component.html',
  styleUrls: ['./branches-charts.component.scss']
})
export class BranchesChartsComponent implements AfterViewInit {

  constructor(private branchService: BranchService, private translate: TranslateService) {
    this.translate.onLangChange.subscribe(() => {
      this.loadTranslationsAndDrawChart();
    });
  }

  ngAfterViewInit() {
    if (typeof google !== 'undefined' && google.charts) {
      google.charts.load('current', { packages: ['corechart'] });
      google.charts.setOnLoadCallback(() => {
        this.loadTranslationsAndDrawChart();
      });
    } else {
      console.error('Google Charts library is not loaded.');
    }
  }

  loadTranslationsAndDrawChart() {
    this.translate.get(['chart.TITLE', 'chart.HAXIS_TITLE', 'chart.VAXIS_TITLE']).subscribe(translations => {
      this.drawChart(translations);
    });
  }

  drawChart(translations: any): void {
    const branches: Branch[] = this.branchService.getBranches();
    const locationCount: { [key: string]: number } = {};
    branches.forEach(branch => {
      locationCount[branch.ort] = (locationCount[branch.ort] || 0) + 1;
    });

    const dataArray: (string | number)[][] = [[translations['chart.HAXIS_TITLE'], translations['chart.VAXIS_TITLE']]];
    for (const [key, value] of Object.entries(locationCount)) {
      dataArray.push([key, value]);
    }

    const data = google.visualization.arrayToDataTable(dataArray);
    
    const options = {
      title: translations['chart.TITLE'],
      hAxis: { title: translations['chart.HAXIS_TITLE'] },
      vAxis: { title: translations['chart.VAXIS_TITLE'] },
      seriesType: 'bars',
      series: { 5: { type: 'line' } }
    };
    
    const chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  }
}
