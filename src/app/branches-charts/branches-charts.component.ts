import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BranchService } from '../services/branch.service';
import { Branch } from '../models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

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

  constructor(
    private branchService: BranchService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.translate.onLangChange.subscribe(() => {
      this.loadTranslationsAndDrawChart();
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.loadGoogleChartsLibrary()
        // Load and draw chart after view initializes
        .then(() => {
          this.loadTranslationsAndDrawChart();
        })
        .catch((error) => {
          console.error('Error loading Google Charts library:', error);
        });
    }
  }

  private loadGoogleChartsLibrary(): Promise<void> {
    // Promise resolves when the library is loaded
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(() => {
          resolve();
        });
      } else {
        // Loads Google Charts library script dynamically if it's not available
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          if (google && google.charts) {
            google.charts.load('current', { packages: ['corechart'] });
            google.charts.setOnLoadCallback(() => {
              resolve();
            });
          } else {
            reject(new Error('Google Charts library not available.'));
          }
        };
        script.onerror = () =>
          reject(new Error('Failed to load Google Charts library.'));
        document.head.appendChild(script);
      }
    });
  }

  loadTranslationsAndDrawChart() {
    if (this.isBrowser) {
      this.translate
        .get(['chart.TITLE', 'chart.HAXIS_TITLE', 'chart.VAXIS_TITLE'])
        .subscribe((translations) => {
          this.drawChart(translations);
        });
    }
  }

  drawChart(translations: any): void {
    if (this.isBrowser) {
      const branches: Branch[] = this.branchService.getBranches();
      const locationCount: { [key: string]: number } = {};
      branches.forEach((branch) => {
        locationCount[branch.ort] = (locationCount[branch.ort] || 0) + 1;
      });

      const dataArray: (string | number)[][] = [
        // Prepare data array for Google Charts
        [translations['chart.HAXIS_TITLE'], translations['chart.VAXIS_TITLE']],
      ];
      for (const [key, value] of Object.entries(locationCount)) {
        dataArray.push([key, value]);
      }
      // Convert the data array to Google Charts DataTable
      const data = google.visualization.arrayToDataTable(dataArray);

      const options = {
        title: translations['chart.TITLE'],
        hAxis: { title: translations['chart.HAXIS_TITLE'] },
        vAxis: { title: translations['chart.VAXIS_TITLE'] },
        seriesType: 'bars',
        series: { 5: { type: 'line' } },
      };

      const chart = new google.visualization.ComboChart(
        document.getElementById('chart_div')
      );
      chart.draw(data, options);
    }
  }
}
