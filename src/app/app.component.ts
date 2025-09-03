import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from './componentes/sidebar/sidebar.component';
import { BoardComponent } from './componentes/board/board.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService, Category } from './services/note.service';

interface BoardNote {
  idNote?: string;
  color: string;
  top: number;
  left: number;
  content: string;
  saved?: boolean;
  category?: Category; 
}

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, BoardComponent, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'notas';
  createdNotes: BoardNote[] = [];
  categories: Category[] = [];
  selectedCategoryForBoard: string = '';

  showNoteModal = false;
  currentNote: BoardNote | null = null;
  selectedCategory: Category | null = null;

  constructor(private noteService: NoteService) {
    this.loadCategories();
  }

  loadCategories(): void {
    this.noteService.getAllCategories().subscribe({
      next: (cats) => { 
        this.categories = cats || []; 
      },
      error: (err) => { 
        console.error('Error loading categories:', err);
      }
    });
  }

  onNoteCreated(cat: Category) {
    this.selectedCategory = cat;
    this.currentNote = {
      color: cat.color,
      top: 0,
      left: 0,
      content: '',
      category: cat
    };
    this.showNoteModal = true;
  }

  onCategoryCreated(category: Category) {
    const existingIndex = this.categories.findIndex((c: Category) => c.categoryId === category.categoryId);
    if (existingIndex !== -1) {
      this.categories[existingIndex] = category;
    } else {
      this.categories = [category, ...this.categories];
    }
  }

  saveCurrentNote() {
    if (!this.currentNote || !this.selectedCategory) return;

    const text = (this.currentNote.content || '').trim();
    if (!text) {
      alert('El contenido de la nota no puede estar vacío');
      return;
    }

    this.currentNote.top = 50 + Math.floor(Math.random() * 500);
    this.currentNote.left = 300 + Math.floor(Math.random() * 700);

    const payload = {
      content: text,
      color: this.selectedCategory.color,               
      category: {                                        
        categoryId: this.selectedCategory.categoryId,
        color: this.selectedCategory.color
      },
      positionX: this.currentNote.left,
      positionY: this.currentNote.top
    };

    this.noteService.createNote(payload as any).subscribe({
      next: (res) => {
        if (res?.success) {
          this.currentNote!.idNote = res.note?.idNote;
          this.currentNote!.saved = true;
          this.currentNote!.category = res.note?.category || this.selectedCategory;

          this.createdNotes.push({ ...this.currentNote! });

          this.selectedCategoryForBoard = this.selectedCategory!.categoryId;
          
          alert('Nota guardada correctamente');
          this.closeModal();
        } else {
          alert('Error: ' + (res?.message || 'No se pudo guardar'));
        }
      },
      error: (err) => {
        alert('Error al guardar la nota: ' + (err?.message || err));
      }
    });
  }

  onModalClosed() { this.closeModal(); }

  private closeModal() {
    this.showNoteModal = false;
    this.currentNote = null;
    this.selectedCategory = null;
  }
}
