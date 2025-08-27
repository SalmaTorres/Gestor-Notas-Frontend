import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NoteService } from '../../services/note.service';
import { FormsModule } from '@angular/forms';

export interface Note {
  idNote?: string;
  color: string;
  top: number;
  left: number;
  content: string;
  saved?: boolean;
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

  constructor(private noteService: NoteService) {}
  
  saveNote(note: Note) {
    this.noteService.createNote(note).subscribe({
      next: (response) => {
        if (response.success) {
          note.idNote = response.note.idNote; 
          this.savedNotes.push(response.note);
          note['saved'] = true;
          alert('Nota guardada correctamente');
        } else {
          alert('Error: ' + response.message);
        }
      },
      error: (err) => {
        alert('Error al guardar la nota: ' + err.message);
      }
    });
  }

  isNoteSaved(note: Note): boolean {
    return !!note['saved'];
  }
  deleteNote(note: Note) {
  if (!note.idNote) {
    // Nota no guardada todavía solo quitarla del arreglo notes
    this.notes = this.notes.filter(n => n !== note);
    return;
    } 
  }
  
}
