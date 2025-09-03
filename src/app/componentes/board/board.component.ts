import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Category, NoteService } from '../../services/note.service';
import { FormsModule } from '@angular/forms';

export interface Note {
  idNote?: string;
  color: string;
  top: number;
  left: number;
  content: string;
  saved?: boolean;
  categoryId?: string; 
}

export interface RecoverNote {
  idNote?: string;
  content: string;
  positionX?: number;
  positionY?: number;
  category?: {
    categoryId: string;
    color: string;
  };
}

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})

export class BoardComponent {
  @Input() notes: Note[] = [];
  savedNotes: Note[] = [];
  filteredNotes: Note[] = [];

  searchTerm: string = '';
  selectedCategory: string = '';
  categories: Category[] = [];

  errorMsg = '';

  constructor(private noteService: NoteService) {
    this.loadCategories();
    this.getNotes();
  }

  loadCategories(): void {
    this.errorMsg = '';
    this.noteService.getAllCategories().subscribe({
      next: (cats) => { 
        this.categories = cats || []; 
      },
      error: (err) => { 
        this.errorMsg = this.parseError(err); 
      }
    });
  }

  addNewCategory(category: Category): void {
    const existingIndex = this.categories.findIndex(c => c.categoryId === category.categoryId);
    if (existingIndex !== -1) {
      this.categories[existingIndex] = category;
    } else {
      this.categories = [category, ...this.categories];
    }
  }

  setSelectedCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  refreshNotes(): void {
    this.getNotes();
  }

  private parseError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (err?.status === 0)   return 'No se pudo conectar con el backend.';
    if (err?.status === 404) return 'Ruta no encontrada (revisa /api).';
    return 'No se pudo completar la operación.';
  }
  
  mapNotes(recoverNote: RecoverNote, index: number): Note {
    let top = recoverNote.positionY || 0;
    let left = recoverNote.positionX || 0;
    
    let noteColor = '#ffff99'; 
    if (recoverNote.category?.categoryId) {
      const category = this.categories.find(cat => cat.categoryId === recoverNote.category?.categoryId);
      noteColor = category?.color || recoverNote.category.color || '#ffff99';
    }
    
    return {
      ...recoverNote,
      color: noteColor,
      top: top,
      left: left,
      saved: true,
      categoryId: recoverNote.category?.categoryId
    }
  }

  getNotes() {
    this.noteService.getAllNotes().subscribe({
      next: (response: RecoverNote[] | null) => {
        if (response && response.length) {
          this.savedNotes = response.map((n, i) => this.mapNotes(n, i));
        } else {
          this.savedNotes = [];
        }
        this.notes = [...this.savedNotes];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al obtener notas', err);
        alert(this.parseError(err));
      }
    });
  }

  updateNote(note: Note){
    if(note.idNote){
      const { idNote, content } = note;
      const cleanNote: RecoverNote = { content };
      this.noteService.updateNote(idNote, cleanNote).subscribe({
        next:(response) => {
            if(response){
              alert("Nota actualizada correctamente");
            }
            else{
              alert("Error al actualizar la nota");
            }
        },
      })
    }
    else{
      alert("Esta nota no existe");
    }
  }

  isNoteSaved(note: Note): boolean {
    return !!note['saved'];
  }

  deleteNote(note: Note) {
    if (!note.idNote) {
      const index = this.notes.indexOf(note);
      if (index !== -1) this.notes.splice(index, 1);
      return;
    }

    this.noteService.deleteNote(note.idNote!).subscribe({
      next: (response: any) => {
        if (response.success) {
          const savedIndex = this.savedNotes.findIndex(n => n.idNote === note.idNote);
          if (savedIndex !== -1) this.savedNotes.splice(savedIndex, 1);

          const noteIndex = this.notes.findIndex(n => n.idNote === note.idNote);
          if (noteIndex !== -1) this.notes.splice(noteIndex, 1);

          alert('Nota eliminada correctamente');
        } else {
          alert('Error: ' + response.message);
        }
      },
      error: (err: any) => {
        alert('Error en la eliminación: ' + err.message);
      }
    });
  }

  applyFilters() {
    const search = (this.searchTerm || '').toLowerCase().trim();
    
    this.filteredNotes = this.savedNotes.filter(note => {
      const matchesCategory = !this.selectedCategory || 
                             this.selectedCategory === '' || 
                             note.categoryId === this.selectedCategory;
      
      const matchesSearch = !search || 
                           (note.content || '').toLowerCase().includes(search);
      
      return matchesCategory && matchesSearch;
    });
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }
}
