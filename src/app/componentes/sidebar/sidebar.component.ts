import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  notes = [
    { color: '#ffeb3b', text: 'Escribe algo...' },
    { color: '#8bc34a', text: 'Escribe algo...' },
    { color: '#fa719fff', text: 'Escribe algo...' },
    { color: '#74c7e0ff', text: 'Escribe algo...' },
    { color: '#fdb96cff', text: 'Escribe algo...' },
    { color: '#ce74e0ff', text: 'Escribe algo...' }
  ];
}
