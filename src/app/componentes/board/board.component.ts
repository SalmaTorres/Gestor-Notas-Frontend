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
  categoryId?: string;
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
    this.getNotes();
    this.loadCategories();
  }

  loadCategories(): void {
    this.errorMsg = '';
    this.noteService.getAllCategories().subscribe({
      next: (cats) => { this.categories = cats || []; },
      error: (err) => { this.errorMsg = this.parseError(err); }
    });
  }

  private parseError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (err?.status === 0)   return 'No se pudo conectar con el backend.';
    if (err?.status === 404) return 'Ruta no encontrada (revisa /api).';
    return 'No se pudo completar la operación.';
  }
  
  mapNotes(recoverNote: RecoverNote, index: number): Note{
    var colorNotes = [
    { color: '#ffeb3b'},
    { color: '#8bc34a'},
    { color: '#fa719fff'},
    { color: '#74c7e0ff'},
    { color: '#fdb96cff'},
    { color: '#ce74e0ff'}
    ];

    let top = recoverNote.positionY || 0;
    let left = recoverNote.positionX || 0;

    if (top === 0) {
      top = 200 * (index % 3);
    }
    if (left === 0) {
      left = 200 * (index % 5);
    }
    
    return{
      ...recoverNote,
      color: colorNotes[Math.floor(Math.random() * colorNotes.length)].color,
      top: top,
      left: left,
      saved: true
    }
  }

  getNotes() {
    this.noteService.getAllNotes().subscribe({
      next: (response) => {
        if (response) {
          this.savedNotes = response.map((note: RecoverNote, index: number) => this.mapNotes(note, index));
          this.filteredNotes = [...this.savedNotes];
        } else {
          alert('No existen notas, crea tu primer nota');
        }
      },
    });
  }


  // saveNote(note: Note) {
  //   if (!note.content || note.content.trim() === '') {
  //     alert('El contenido de la nota no puede estar vacío');
  //     return;
  //   }

  //   const noteToSave = {
  //     content: note.content.trim(),
  //     color: note.color,
  //     positionX: note.left, 
  //     positionY: note.top 
  //   };

  //   this.noteService.createNote(note).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         note.idNote = response.note.idNote; 
  //         this.savedNotes.push(response.note);
  //         note['saved'] = true;
  //         alert('Nota guardada correctamente');
  //       } else {
  //         alert('Error: ' + response.message);
  //       }
  //     },
  //     error: (err) => {
  //       alert('Error al guardar la nota: ' + err.message);
  //     }
  //   });
  // }

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
    this.filteredNotes = this.savedNotes.filter(note => {
      const matchesCategory = this.selectedCategory
        ? note.categoryId === this.selectedCategory
        : true;
      const matchesSearch = this.searchTerm
        ? note.content.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }
}
