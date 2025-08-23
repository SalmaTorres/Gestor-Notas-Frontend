import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface Note {
  color: string;
  top: number;
  left: number;
  text: string;
  saved?: boolean;
}

@Component({
  selector: 'app-board',
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})

export class BoardComponent {
  @Input() notes: Note[] = [];
  savedNotes: Note[] = [];

  saveNote(note: Note) {
    this.savedNotes.push({ ...note }); 
    note.saved = true;               
    alert('Nota guardada correctamente');
  }
}
