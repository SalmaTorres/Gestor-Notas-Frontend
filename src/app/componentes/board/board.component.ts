import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NoteService } from '../../services/note.service';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';

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
  imports: [CommonModule, FormsModule, CdkDrag],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  @Input() notes: Note[] = [];
  savedNotes: Note[] = [];
  isDraggingOverTrash: boolean = false;
  isDragging: boolean = false;
  // Detectar drop en el basurero
  confirmDeleteOpen = false;
  noteToDelete: Note | null = null;

  //ultima posicion cuando se arrastra la nota
  lastDragPosition: { note: Note, top: number, left: number } | null = null;

  // Colores para nuevas notas
  colorNotes = [
    '#ffeb3b', '#8bc34a', '#fa719f', '#74c7e0', '#fdb96c', '#ce74e0'
  ];
  
  constructor(private noteService: NoteService) {
    this.getNotes();
  }
  
  mapNotes(recoverNote: RecoverNote, index: number): Note {
    let top = recoverNote.positionY || 0;
    let left = recoverNote.positionX || 0;

    if (top === 0) {
      top = 200 * (index % 3);
    }
    if (left === 0) {
      left = 200 * (index % 5);
    }
    
    return {
      ...recoverNote,
      color: this.colorNotes[Math.floor(Math.random() * this.colorNotes.length)],
      top: top,
      left: left,
      saved: true
    }
  }

  getNotes() {
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

  addNewNote() {
    const newNote: Note = {
      color: this.colorNotes[Math.floor(Math.random() * this.colorNotes.length)],
      top: Math.random() * 300,
      left: Math.random() * 500,
      content: 'Nueva nota...',
      saved: false
    };
    
    this.notes.push(newNote);
  }

  updateNote(note: Note) {
    if(note.idNote) {
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

          //alert('Nota eliminada correctamente');
        } else {
          alert('Error: ' + response.message);
        }
      },
      error: (err: any) => {
        alert('Error en la eliminación: ' + err.message);
      }
    });
  }

  onDragStarted(note: Note){
    this.lastDragPosition = { note, top: note.top!, left: note.left! };
  }

  onDragEnd(event: any, board: HTMLElement, trash: HTMLElement) {
    this.isDragging = false;
    this.isDraggingOverTrash = false;
    
    const note: Note = event.source.data;
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
      this.openDeleteConfirm(note);
      return;
    }
    
    // si no cayó en basurero, mantener posición
    const { x, y } = event.source.getFreeDragPosition();
    console.log("Nueva posición:", x, y);
  }

  openDeleteConfirm(note: Note) {
    this.noteToDelete = note;
    this.confirmDeleteOpen = true;
    console.log('Modal abierto'); // <-- prueba de depuración
  }

  closeDeleteConfirm(cancelled: boolean = false) {
      if (cancelled && this.lastDragPosition && this.noteToDelete) {
      // Devolver la nota a su última posición
      if (this.lastDragPosition.note === this.noteToDelete) {
        this.noteToDelete.top = this.lastDragPosition.top;
        this.noteToDelete.left = this.lastDragPosition.left - 150; 
        // el -150 px la mueve a la izquierda del basurero
      }
    }
    this.confirmDeleteOpen = false;
    this.noteToDelete = null;
    this.lastDragPosition = null;
  }

  confirmDelete() {
    if (this.noteToDelete) {
      this.deleteNote(this.noteToDelete);
    }
    this.closeDeleteConfirm();
  }
}