import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MATERIAL_UI_IMPORTS } from './core/material/material.imports';

@Component({
  imports: [RouterModule, ...MATERIAL_UI_IMPORTS],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {}
