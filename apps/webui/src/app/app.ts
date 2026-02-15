import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MATERIAL_UI_IMPORTS } from './core/material/material.imports';

@Component({
  imports: [RouterModule, ...MATERIAL_UI_IMPORTS],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'webui-theme';
  isDarkMode = false;

  constructor() {
    this.isDarkMode = this.resolveInitialTheme();
    this.applyTheme(this.isDarkMode);
  }

  onThemeToggle(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem(this.storageKey, this.isDarkMode ? 'dark' : 'light');
  }

  private resolveInitialTheme(): boolean {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'dark') {
      return true;
    }
    if (saved === 'light') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDarkMode: boolean): void {
    const root = this.document.documentElement;
    root.classList.toggle('theme-dark', isDarkMode);
    root.classList.toggle('theme-light', !isDarkMode);
  }
}
