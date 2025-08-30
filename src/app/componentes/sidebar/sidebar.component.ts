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

  palette = ['#FFD966','#F4B183','#F8CBAD','#C5E0B4','#A9D18E','#9DC3E6','#BDD7EE','#D9D2E9','#F4B6C2','#FFE699'];

  openModal(): void { this.modalOpen = true; }
  closeModal(): void { this.modalOpen = false; }

  isValidHex(hex: string): boolean {
    return /^#([0-9a-fA-F]{6})$/.test((hex || '').trim());
  }

  normalizeHex(): void {
    const v = (this.form.color || '').trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
      this.form.color = (v.startsWith('#') ? v : '#'+v).toUpperCase();
    }
  }

  canSave(): boolean {
    return this.form.name.trim().length > 0 && this.isValidHex(this.form.color);
  }

  saveCategory(): void {
    if (!this.canSave()) return;
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: this.form.name.trim(),
      color: this.form.color
    };
    this.categories.unshift(newCat); 
    this.form = { name: '', color: '#FFD966' };
    this.modalOpen = false;
  }
}
