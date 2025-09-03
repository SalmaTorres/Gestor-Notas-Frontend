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
  categoryId?: string; 
  active: boolean;
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
  filteredNotes: Note[] = [];

  searchTerm: string = '';
  selectedCategory: string = '';
  categories: Category[] = [];

  errorMsg = '';

  isDraggingOverTrash: boolean = false;
  isDragging: boolean = false;
  confirmDeleteOpen = false;
  noteToDelete: Note | null = null;

  trashOpen = false;
  pendingNote: Note | null = null;

  lastDragPosition: { note: Note, top: number, left: number } | null = null;

  colorNotes = [
    '#ffeb3b', '#8bc34a', '#fa719f', '#74c7e0', '#fdb96c', '#ce74e0'
  ];

  //for typing
  typingTimeout: any;
  
  constructor(private noteService: NoteService) {
    this.loadCategories();
    this.getNotes();
  }

  loadCategories(): void {
    this.errorMsg = '';
    this.noteService.getAllCategories().subscribe({
      next: (cats) => { 
        this.categories = cats || []; 
      },
      error: (err) => { 
        this.errorMsg = this.parseError(err); 
      }
    });
  }

  addNewCategory(category: Category): void {
    const existingIndex = this.categories.findIndex(c => c.categoryId === category.categoryId);
    if (existingIndex !== -1) {
      this.categories[existingIndex] = category;
    } else {
      this.categories = [category, ...this.categories];
    }
  }

  setSelectedCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  refreshNotes(): void {
    this.getNotes();
  }

  private parseError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (err?.status === 0)   return 'No se pudo conectar con el servidor. Intente más tarde.';
    if (err?.status === 404) return 'Ruta no encontrada (revisa /api).';
    return 'No se pudo completar la operación.';
  }
  
  mapNotes(recoverNote: RecoverNote, index: number): Note {
    let top = recoverNote.positionY || 0;
    let left = recoverNote.positionX || 0;
    
    let noteColor = '#ffff99'; 
    if (recoverNote.category?.categoryId) {
      const category = this.categories.find(cat => cat.categoryId === recoverNote.category?.categoryId);
      noteColor = category?.color || recoverNote.category.color || '#ffff99';
    }
    
    return {
      ...recoverNote,
      color: noteColor,
      top: top,
      left: left,
      saved: true,
      categoryId: recoverNote.category?.categoryId,
      active: false
    }
  }

  getNotes() {
    this.noteService.getAllNotes().subscribe({
      next: (response: RecoverNote[] | null) => {
        if (response && response.length) {
          this.savedNotes = response.map((n, i) => this.mapNotes(n, i));
        } else {
          this.savedNotes = [];
        }
        this.notes = [...this.savedNotes];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al obtener notas', err);
        this.parseError(err);
      }
    });
  }

  bringToFront(note: Note) {
    this.notes.forEach(n => n.active = false);
    note.active = true;
  }

  addNewNote() {
    const newNote: Note = {
      color: this.colorNotes[Math.floor(Math.random() * this.colorNotes.length)],
      top: Math.random() * 300,
      left: Math.random() * 500,
      content: 'Nueva nota...',
      saved: false,
      active: false
    };
    
    this.notes.push(newNote);
  }

  updateNote(note: Note){
    console.log(note.idNote);
    if(note.idNote){
      const { idNote, content, top, left } = note;
      const cleanNote: RecoverNote = { content, positionX:left, positionY:top };
      this.noteService.updateNote(idNote, cleanNote).subscribe({
        next:(response) => {
            if(!response){
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
           this.applyFilters(); 
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
    const search = (this.searchTerm || '').toLowerCase().trim();
    
    this.filteredNotes = this.savedNotes.filter(note => {
      const matchesCategory = !this.selectedCategory || 
                             this.selectedCategory === '' || 
                             note.categoryId === this.selectedCategory;
      
      const matchesSearch = !search || 
                           (note.content || '').toLowerCase().includes(search);
      
      return matchesCategory && matchesSearch;
    });
    this.errorMsg = this.filteredNotes.length === 0 
      ? 'No hay notas que coincidan con los filtros.' 
      : '';
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  onDragStarted(note: Note){
    this.lastDragPosition = { note, top: note.top!, left: note.left! };
  }

  onDragMoved(event: any, note:Note, trash: HTMLElement){
    const noteEl = event.source.element.nativeElement;
    const noteRect = noteEl.getBoundingClientRect();
    const trashRect = trash.getBoundingClientRect();

    const isInsideTrash =
      noteRect.left < trashRect.right &&
      noteRect.right > trashRect.left &&
      noteRect.top < trashRect.bottom &&
      noteRect.bottom > trashRect.top;

    if (isInsideTrash) {
      this.trashOpen = true;
      this.pendingNote = note;
    }
    else{
      this.trashOpen = false;
    }
  }

  onDragEnd(event: any, board: HTMLElement, trash: HTMLElement) {
  this.isDragging = false;
  this.isDraggingOverTrash = false;
  const { x, y } = event.source.getFreeDragPosition();
  const note = event.source.element.nativeElement;
  const boardRect = board.getBoundingClientRect();
  const noteRect = note.getBoundingClientRect();
  const trashRect = trash.getBoundingClientRect();
  const noteSelect:Note = event.source.data;
  const isInsideTrash =
      noteRect.left < trashRect.right &&
      noteRect.right > trashRect.left &&
      noteRect.top < trashRect.bottom &&
      noteRect.bottom > trashRect.top;

  const isOut =
    noteRect.left < boardRect.left ||
    noteRect.right > boardRect.right ||
    noteRect.top < boardRect.top ||
    noteRect.bottom > boardRect.bottom;

    console.log(isOut);
    if (isInsideTrash) {
      this.trashOpen = true;
      this.pendingNote = note;

      event.source.reset();
      this.openDeleteConfirm(noteSelect);
      return;
    }
  if (isOut) {
    event.source.reset();
  }
  else{
    noteSelect.top += y;
    noteSelect.left += x;
    event.source.reset();
    this.updateNote(noteSelect);
  }
}

openDeleteConfirm(note: Note) {
    this.noteToDelete = note;
    this.confirmDeleteOpen = true;

    console.log('Modal abierto'); 
  }

  closeDeleteConfirm(cancelled: boolean = false) {
    this.confirmDeleteOpen = false;
    this.noteToDelete = null;
    this.lastDragPosition = null;
    this.trashOpen = false; 
  }

  confirmDelete() {
    if (this.noteToDelete) {
      this.deleteNote(this.noteToDelete);
    }
    this.closeDeleteConfirm();
  }

  inputContent(event: any, note:Note){
    console.log("El usuario escribe")
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(()=>{
      console.log("El usuario dejo de escribir");
      this.updateNote(note);
    }, 3000)
  }
}
