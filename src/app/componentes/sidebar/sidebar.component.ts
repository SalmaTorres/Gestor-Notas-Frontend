import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService, Category } from '../../services/note.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  categories: Category[] = [];

  @Output() noteCreated = new EventEmitter<Category>();
  @Output() categoryCreated = new EventEmitter<Category>();

  modalOpen = false;
  loading = false;
  errorMsg = '';

  form: Category = { categoryId: '', color: '#FFD966' };

  palette = ['#FFD966','#F4B183','#F8CBAD','#C5E0B4','#A9D18E','#9DC3E6','#BDD7EE','#D9D2E9','#F4B6C2','#FFE699'];

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.errorMsg = '';
    this.noteService.getAllCategories().subscribe({
      next: (cats) => { this.categories = cats || []; },
      error: (err) => { this.errorMsg = this.parseError(err); }
    });
  }

  openModal(): void { this.modalOpen = true; document.body.classList.add('modal-open'); }
  closeModal(): void { this.modalOpen = false; this.errorMsg = ''; document.body.classList.remove('modal-open'); }

  isValidHex(hex: string): boolean {
    return /^#([0-9a-fA-F]{6})$/.test((hex || '').trim());
  }

  normalizeHex(): void {
    const v = (this.form.color || '').trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(v)) this.form.color = (v.startsWith('#') ? v : '#'+v).toUpperCase();
  }

  canSave(): boolean {
    return this.form.categoryId.trim().length > 0 && this.isValidHex(this.form.color);
  }

  saveCategory(): void {
    if (!this.canSave() || this.loading) return;

    this.loading = true;
    this.errorMsg = '';

    const payload: Category = {
      categoryId: this.form.categoryId.trim(),
      color: this.form.color
    };

    this.noteService.createCategory(payload).subscribe({
      next: (saved) => {
        this.categories = [saved, ...this.categories.filter(c => c.categoryId !== saved.categoryId)];
        
        this.categoryCreated.emit(saved);

        this.form = { categoryId: '', color: '#FFD966' };
        this.modalOpen = false;
        this.loading = false;

        document.body.classList.remove('modal-open');
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      },
      error: (err) => {
        this.errorMsg = this.parseError(err);
        this.loading = false;
      }
    });
  }

  private parseError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (err?.status === 0)   return 'No se pudo conectar con el backend.';
    if (err?.status === 404) return 'Ruta no encontrada (revisa /api).';
    return 'No se pudo completar la operación.';
  }
}
