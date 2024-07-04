// #region Imports

import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BranchService } from '../services/branch.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

// #endregion

declare var google: any;

@Component({
  selector: 'app-branches-charts',
  standalone: true,
  imports: [MatButtonModule, TranslateModule, RouterModule],
  templateUrl: './branches-charts.component.html',
  styleUrls: ['./branches-charts.component.scss'],
})
export class BranchesChartsComponent implements AfterViewInit {
  isBrowser: boolean;

  // #region Constructor and Lifecycle Methods

  constructor(
    private branchService: BranchService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private titleService: Title
  ) {
    this.titleService.setTitle(`Branches Chart`);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.translate.onLangChange.subscribe(() => {
      this.loadTranslationsAndDrawChart();
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.loadGoogleChartsLibrary()
        .then(() => {
          this.loadTranslationsAndDrawChart();
        })
        .catch((error) => {
          console.error('Error loading Google Charts library:', error);
        });
    }
  }

  // #endregion

  // #region Google Charts Library

  private loadGoogleChartsLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(resolve);
      } else {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          if (google && google.charts) {
            google.charts.load('current', { packages: ['corechart'] });
            google.charts.setOnLoadCallback(resolve);
          } else {
            reject(new Error('Google Charts library not available.'));
          }
        };
        script.onerror = () => reject(new Error('Failed to load Google Charts library.'));
        document.head.appendChild(script);
      }
    });
  }

  // #endregion

  // #region Chart Rendering

  private loadTranslationsAndDrawChart(): void {
    this.translate
      .get(['CHART.TITLE', 'CHART.HAXIS_TITLE', 'CHART.VAXIS_TITLE'])
      .subscribe((translations) => {
        const branches = this.branchService.getBranches();
        const locationCount: { [key: string]: number } = {};
        branches.forEach((branch) => {
          locationCount[branch.location] =
            (locationCount[branch.location] || 0) + 1;
        });

        const dataArray: (string | number)[][] = [
          [translations['CHART.HAXIS_TITLE'], translations['CHART.VAXIS_TITLE']],
        ];
        for (const [key, value] of Object.entries(locationCount)) {
          dataArray.push([key, value]);
        }

        const data = google.visualization.arrayToDataTable(dataArray);
        const options = {
          title: translations['CHART.TITLE'],
          hAxis: { title: translations['CHART.HAXIS_TITLE'] },
          vAxis: { title: translations['CHART.VAXIS_TITLE'] },
          seriesType: 'bars',
          series: { 5: { type: 'line' } },
        };

        const chart = new google.visualization.ComboChart(
          document.getElementById('chart_div')
        );
        chart.draw(data, options);
      });
  }

  // #endregion
}
