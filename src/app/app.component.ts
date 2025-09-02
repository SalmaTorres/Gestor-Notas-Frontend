import { Component } from '@angular/core';
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
  category?: Category; // para mostrar en UI si el back lo devuelve
  active: boolean;
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

  showNoteModal = false;
  currentNote: BoardNote | null = null;
  selectedCategory: Category | null = null;

  constructor(private noteService: NoteService) {}

  // AHORA el sidebar emite Category completo
  onNoteCreated(cat: Category) {
    this.selectedCategory = cat;
    this.currentNote = {
      color: cat.color,
      top: 0,
      left: 0,
      content: '',
      category: cat,
      active: false
    };
    this.showNoteModal = true;
  }

  saveCurrentNote() {
    if (!this.currentNote || !this.selectedCategory) return;

    const text = (this.currentNote.content || '').trim();
    if (!text) {
      alert('El contenido de la nota no puede estar vacío');
      return;
    }

    // genera posición
    this.currentNote.top = Math.floor(Math.random() * 500);
    this.currentNote.left = 300 + Math.floor(Math.random() * 700);

    // ⬇️ Payload que el backend espera: category como OBJETO
    const payload = {
      content: text,
      color: this.selectedCategory.color,                 // HEX
      category: {                                         // OBJETO
        categoryId: this.selectedCategory.categoryId,
        color: this.selectedCategory.color
      },
      positionX: this.currentNote.left,
      positionY: this.currentNote.top
    };

    this.noteService.createNote(payload as any).subscribe({
      next: (res) => {
        // Según tu código actual, esperas { success, note }
        if (res?.success) {
          // toma lo que devuelva el back (idNote y opcionalmente category)
          this.currentNote!.idNote = res.note?.idNote;
          this.currentNote!.saved = true;
          // si el back devuelve la categoría, úsala; si no, conserva la seleccionada
          this.currentNote!.category = res.note?.category || this.selectedCategory;

          this.createdNotes.push({ ...this.currentNote! });
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
