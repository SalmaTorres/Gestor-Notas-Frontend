import { Component } from '@angular/core';
import { SidebarComponent } from './componentes/sidebar/sidebar.component';
import { BoardComponent } from './componentes/board/board.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService, Category } from './services/note.service';

interface Note {
  idNote?: string;
  color: string;
  top: number;
  left: number;
  content: string;
  saved?: boolean;
  categoryId?: string;
}

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, BoardComponent, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'notas';
  createdNotes: Note[] = [];
  showNoteModal = false;
  currentNote: Note | null = null;

  constructor(private noteService: NoteService) {}

  onNoteCreated(category: Category) {
    this.currentNote = {
      color: category.color,
      top: 0,
      left: 0,
      content: '',
      categoryId: category.categoryId
    };
    this.showNoteModal = true;
  }

  saveCurrentNote() {
    if (!this.currentNote) return;

    if (!this.currentNote.content || this.currentNote.content.trim() === '') {
      alert('El contenido de la nota no puede estar vacío');
      return;
    }

    // mismas posiciones random que ya usabas
    this.currentNote.top  = Math.floor(Math.random() * 500);
    this.currentNote.left = 300 + Math.floor(Math.random() * 700);

    // LO QUE TU BACKEND ESPERA: category (string) + color (string)
    const noteToSave = {
      content: this.currentNote.content.trim(),
      color: this.currentNote.color,
      category: this.currentNote.categoryId ?? '',
      positionX: this.currentNote.left,
      positionY: this.currentNote.top
    };

    // casteo a any para no tocar el tipo del service ahora mismo
    this.noteService.createNote(noteToSave as any).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentNote!.idNote = response.note.idNote;
          this.currentNote!.saved = true;

          this.createdNotes.push({ ...this.currentNote! });
          alert('Nota guardada correctamente');
          this.closeModal();
        } else {
          alert('Error: ' + response.message);
        }
      },
      error: (err) => {
        alert('Error al guardar la nota: ' + err.message);
      }
    });
  }

  onModalClosed() { this.closeModal(); }

  private closeModal() {
    this.showNoteModal = false;
    this.currentNote = null;
  }
}
