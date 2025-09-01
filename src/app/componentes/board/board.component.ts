import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NoteService } from '../../services/note.service';
import { FormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkDropList } from '@angular/cdk/drag-drop';

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
}

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule, CdkDrag, CdkDropList],
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

  onDragEnd(event: any, board: HTMLElement, trash: HTMLElement) {
    const noteEl = event.source.element.nativeElement;
    const noteRect = noteEl.getBoundingClientRect();
    const trashRect = trash.getBoundingClientRect();

    // Verificar si la nota se soltó dentro del área del basurero
    const isInsideTrash =
      noteRect.left < trashRect.right &&
      noteRect.right > trashRect.left &&
      noteRect.top < trashRect.bottom &&
      noteRect.bottom > trashRect.top;

    if (isInsideTrash) {
      const note: Note = event.source.data;
      this.deleteNote(note);
      return; // no mover posición si fue eliminada
    }

    // si no cayó en basurero, mantener posición
    const { x, y } = event.source.getFreeDragPosition();
    console.log("Nueva posición:", x, y);
  }

  // Detectar drop en el basurero
  canDropToTrash = () => true;

  onDropToTrash(event: CdkDragDrop<any>) {
    console.log("Drop detectado en basurero:", event);
    const note: Note = event.item.data;

    event.item.reset(); // reset visual

    if (note) {
      this.deleteNote(note);
    }
  }

}
