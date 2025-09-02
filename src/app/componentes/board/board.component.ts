import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NoteService } from '../../services/note.service';
import { FormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';

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
  positionX?: number;
  positionY?: number;
  category?: Category;
}

export interface Category {
  categoryId: string; 
  color: string;

}

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule, CdkDrag],
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

    let top = recoverNote.positionY || 0;
    let left = recoverNote.positionX || 0;
    let colorNote = recoverNote.category?.color || "0";

    if (top === 0) {
      top = 200 * (index % 3);
    }
    if (left === 0) {
      left = 200 * (index % 5);
    }
    if(colorNote === "0"){
      colorNote = colorNotes[Math.floor(Math.random() * colorNotes.length)].color
    }
    
    return{
      ...recoverNote,
      color: colorNote,
      top: top,
      left: left,
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
      const { idNote, content, top, left } = note;
      const cleanNote: RecoverNote = { content:content, positionX:left, positionY:top };
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
    // Nota no guardada todavía → quitar del arreglo notes
    if (!note.idNote) {
      const index = this.notes.indexOf(note);
      if (index !== -1) this.notes.splice(index, 1);
      return;
    }

    this.noteService.deleteNote(note.idNote!).subscribe({
      next: (response: any) => {
        if (response.success) {
          // eliminar de savedNotes
          const savedIndex = this.savedNotes.findIndex(n => n.idNote === note.idNote);
          if (savedIndex !== -1) this.savedNotes.splice(savedIndex, 1);

          // eliminar de notes
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

onDragEnd(event: any, board: HTMLElement) {
  const { x, y } = event.source.getFreeDragPosition();
  const note = event.source.element.nativeElement;
  const boardRect = board.getBoundingClientRect();
  const noteRect = note.getBoundingClientRect();
  const noteSelect:Note = event.source.data;

  // Verifica si salió del tablero
  const isOut =
    noteRect.left < boardRect.left ||
    noteRect.right > boardRect.right ||
    noteRect.top < boardRect.top ||
    noteRect.bottom > boardRect.bottom;

    console.log(isOut);
    console.log("left", x);
    console.log("top", y);
  if (isOut) {
  // Resetea a posición inicial
    event.source.reset();
  }
  else{
    noteSelect.top += y;
    noteSelect.left += x;
    event.source.reset();
    this.updateNote(noteSelect);
  }
}

}
