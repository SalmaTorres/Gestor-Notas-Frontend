import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  id: string;
  name: string;
  color: string; 
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  categories: Category[] = [];

  @Output() noteCreated = new EventEmitter<string>();

  modalOpen = false;
  form = { name: '', color: '#FFD966' };

  openModal(): void { this.modalOpen = true; }
}
