import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './componentes/sidebar/sidebar.component';
import { BoardComponent } from './componentes/board/board.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from './services/note.service';

interface Note {
  idNote?: string;
  color: string;
  top: number;
  left: number;
  content: string;
  saved?: boolean;
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

  onNoteCreated(color: string) {
    this.currentNote = {
      color,
      top: 0,
      left: 0,
      content: ''
    };
    this.showNoteModal = true;
  }

  saveCurrentNote() {
    if (!this.currentNote) return;
    
    if (!this.currentNote.content || this.currentNote.content.trim() === '') {
      alert('El contenido de la nota no puede estar vacío');
      return;
    }

    this.currentNote.top = Math.floor(Math.random() * 500);;
    this.currentNote.left = 300 + Math.floor(Math.random() * 700);;

    const noteToSave = {
      content: this.currentNote.content.trim(),
      color: this.currentNote.color,
      positionX: this.currentNote.left,
      positionY: this.currentNote.top
    };

    this.noteService.createNote(noteToSave).subscribe({
      next: (response) => {
        if (response.success) {
          // Actualizar la nota con el ID del backend
          this.currentNote!.idNote = response.note.idNote;
          this.currentNote!.saved = true;
          
          // Agregar al board
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

  onModalClosed() {
    this.closeModal();
  }

  private closeModal() {
    this.showNoteModal = false;
    this.currentNote = null;
  }
}