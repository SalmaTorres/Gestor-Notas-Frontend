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

export interface RecoverNote {
  idNote?: string;
  content: string;
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

  constructor(private noteService: NoteService) {
    this.getNotes();
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
    return{
      ...recoverNote,
      color: colorNotes[Math.floor(Math.random() * colorNotes.length)].color,
      top: 200* (index%3),// < 600? 200 * index: 300 * index%3,
      left: 200 * (index%5),// < 1000? 200 * index: 300 * index%5,
      saved: true
    }
  }

  getNotes(){
    this.noteService.getAllNotes().subscribe({
      next: (response) => {
          if(response) {
            this.savedNotes = response.map((note: RecoverNote, index: number) => this.mapNotes(note, index));
            this.notes.push(...this.savedNotes)
          } else{
            alert('No existen notas, crea tu primer nota');
          }
      },
    })
  }

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
}
