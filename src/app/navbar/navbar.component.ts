// #region Imports

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../services/translation.service';
import { CommonModule } from '@angular/common';
import { languages } from '../data';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';

// #endregion

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    CommonModule,
    TranslateModule,
    MatListModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  languages = languages;

  // #region Constructor

  constructor(private translationService: TranslationService) {}

  // #endregion

  // #region ChangeLang Method Call

  changeLang(lang: string) {
    this.translationService.changeLang(lang);
  }
  
  // #endregion
}
