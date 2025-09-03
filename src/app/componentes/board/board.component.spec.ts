import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BoardComponent, Note, RecoverNote } from './board.component';
import { NoteService } from '../../services/note.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let noteServiceSpy: jasmine.SpyObj<NoteService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NoteService', [
      'createNote',
      'deleteNote',
      'getAllNotes',
      'updateNote',
      'getAllCategories',
      'createCategory',
      'deleteCategory',
      'searchAndFilterNotes',
      'getNotesByCategory'
    ]);
    
    // Configurar valores por defecto para los observables
    spy.getAllNotes.and.returnValue(of([]));
    spy.getAllCategories.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BoardComponent, HttpClientTestingModule],
      providers: [{ provide: NoteService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    noteServiceSpy = TestBed.inject(NoteService) as jasmine.SpyObj<NoteService>;
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('isNoteSaved', () => {
    it('should return true if note is saved', () => {
      const note: Note = {
        color: '#FFB6C1',
        top: 20,
        left: 20,
        content: 'Hola',
        saved: true,
        active: false
      };
      expect(component.isNoteSaved(note)).toBeTrue();
    });

    it('should return false if note is not saved', () => {
      const note: Note = {
        color: '#FFB6C1',
        top: 20,
        left: 20,
        content: 'Hola',
        active: false
      };
      expect(component.isNoteSaved(note)).toBeFalse();
    });
  });

  describe('deleteNote', () => {
    it('should remove a note from notes array if it has no idNote', () => {
      const note: Note = {
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Nota temporal',
        active: false
      };
      component.notes = [note];
      component.deleteNote(note);
      expect(component.notes.length).toBe(0);
    });

    it('should delete a saved note successfully', fakeAsync(() => {
      const note: Note = {
        idNote: '123',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Guardada',
        active: false
      };
      component.notes = [note];
      component.savedNotes = [note];
      
      noteServiceSpy.deleteNote.and.returnValue(of({ success: true }));
      spyOn(component, 'applyFilters'); // Mock applyFilters method

      component.deleteNote(note);
      tick();

      expect(component.notes.length).toBe(0);
      expect(component.savedNotes.length).toBe(0);
      expect(component.applyFilters).toHaveBeenCalled();
    }));

    it('should handle delete note error response', fakeAsync(() => {
      const note: Note = {
        idNote: '123',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Guardada',
        active: false
      };
      component.notes = [note];
      component.savedNotes = [note];

      noteServiceSpy.deleteNote.and.returnValue(of({ success: false, message: 'No se pudo eliminar' }));
      spyOn(window, 'alert');

      component.deleteNote(note);
      tick();

      expect(component.notes.length).toBe(1);
      expect(window.alert).toHaveBeenCalledWith('Error: No se pudo eliminar');
    }));

    it('should handle delete note request failure', fakeAsync(() => {
      const note: Note = {
        idNote: '123',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Guardada',
        active: false
      };
      component.notes = [note];
      component.savedNotes = [note];

      noteServiceSpy.deleteNote.and.returnValue(throwError(() => new Error('Network error')));
      spyOn(window, 'alert');

      component.deleteNote(note);
      tick();

      expect(window.alert).toHaveBeenCalledWith('Error en la eliminación: Network error');
    }));
  });

  describe('mapNotes', () => {
    beforeEach(() => {
      // Setup categories for the test
      component.categories = [
        { categoryId: 'cat1', color: '#ff0000' },
        { categoryId: 'cat2', color: '#00ff00' }
      ];
    });

    it('should map a RecoverNote to a Note correctly', () => {
      const recoverNote: RecoverNote = {
        idNote: '1',
        content: 'Test content',
        positionX: 100,
        positionY: 200,
        category: { categoryId: 'cat1', color: '#ff0000' }
      };
      const index = 2;

      const note: Note = component.mapNotes(recoverNote, index);

      expect(note.idNote).toBe('1');
      expect(note.content).toBe('Test content');
      expect(note.color).toBe('#ff0000');
      expect(note.top).toBe(200);
      expect(note.left).toBe(100);
      expect(note.saved).toBeTrue();
      expect(note.categoryId).toBe('cat1');
    });

    it('should use default color when no category is provided', () => {
      const recoverNote: RecoverNote = {
        idNote: '1',
        content: 'Test content'
      };

      const note: Note = component.mapNotes(recoverNote, 0);

      expect(note.color).toBe('#ffff99');
      expect(note.top).toBe(0);
      expect(note.left).toBe(0);
    });
  });

  describe('getNotes', () => {
    it('should load notes when service returns data', fakeAsync(() => {
      const mockResponse: RecoverNote[] = [
        { idNote: '1', content: 'Note 1' },
        { idNote: '2', content: 'Note 2' }
      ];

      noteServiceSpy.getAllNotes.and.returnValue(of(mockResponse));
      spyOn(component, 'applyFilters');

      component.getNotes();
      tick();

      expect(component.savedNotes.length).toBe(2);
      expect(component.notes.length).toBe(2);
      expect(component.savedNotes[0].saved).toBeTrue();
      expect(component.applyFilters).toHaveBeenCalled();
    }));

    it('should handle empty response', fakeAsync(() => {
      noteServiceSpy.getAllNotes.and.returnValue(of([]));
      spyOn(component, 'applyFilters');

      component.getNotes();
      tick();

      expect(component.savedNotes.length).toBe(0);
      expect(component.notes.length).toBe(0);
      expect(component.applyFilters).toHaveBeenCalled();
    }));

    it('should handle error response', fakeAsync(() => {
      noteServiceSpy.getAllNotes.and.returnValue(throwError(() => new Error('Service error')));
      spyOn(console, 'error');

      component.getNotes();
      tick();

      expect(console.error).toHaveBeenCalledWith('Error al obtener notas', jasmine.any(Error));
      // Verificamos que savedNotes y notes permanezcan vacíos en caso de error
      expect(component.savedNotes.length).toBe(0);
      expect(component.notes.length).toBe(0);
    }));
  });

  describe('updateNote', () => {
    it('should update note successfully', fakeAsync(() => {
      const note: Note = {
        idNote: '1',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Contenido actualizado',
        active: false
      };

      noteServiceSpy.updateNote.and.returnValue(of(true));
      spyOn(window, 'alert');

      component.updateNote(note);
      tick();

      expect(noteServiceSpy.updateNote).toHaveBeenCalledWith('1', { content: 'Contenido actualizado' });
      expect(window.alert).not.toHaveBeenCalled();
    }));

    it('should show error if updateNote returns false', fakeAsync(() => {
      const note: Note = {
        idNote: '1',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Contenido',
        active: false
      };

      noteServiceSpy.updateNote.and.returnValue(of(false));
      spyOn(window, 'alert');

      component.updateNote(note);
      tick();

      expect(window.alert).toHaveBeenCalledWith('Error al actualizar la nota');
    }));

    it('should show error if note has no idNote on update', () => {
      const note: Note = {
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Sin ID',
        active: false
      };

      spyOn(window, 'alert');

      component.updateNote(note);

      expect(window.alert).toHaveBeenCalledWith('Esta nota no existe');
    });
  });

  describe('drag & delete confirm flow', () => {
    it('should set lastDragPosition on drag start', () => {
      const note: Note = {
        color: '#FFD700',
        top: 50,
        left: 50,
        content: 'drag',
        active: false
      };

      component.onDragStarted(note);

      expect(component.lastDragPosition?.note).toBe(note);
      expect(component.lastDragPosition?.top).toBe(50);
      expect(component.lastDragPosition?.left).toBe(50);
    });

    it('should open delete confirm modal on drag end inside trash', () => {
      const note: Note = {
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'drag',
        active: false
      };

      const mockNoteElement = {
        getBoundingClientRect: jasmine.createSpy().and.returnValue({
          left: 10, top: 20, right: 50, bottom: 60
        })
      };

      const mockTrashElement = {
        getBoundingClientRect: jasmine.createSpy().and.returnValue({
          left: 0, top: 0, right: 100, bottom: 100
        })
      };

      const mockBoardElement = document.createElement('div');

      const mockEvent = {
        source: {
          data: note,
          element: { nativeElement: mockNoteElement },
          getFreeDragPosition: jasmine.createSpy().and.returnValue({ x: 10, y: 20 }),
          reset: jasmine.createSpy()
        }
      };

      spyOn(component, 'openDeleteConfirm');

      component.onDragEnd(mockEvent, mockBoardElement, mockTrashElement as any);

      expect(component.openDeleteConfirm).toHaveBeenCalledWith(note);
      expect(mockEvent.source.reset).toHaveBeenCalled();
    });

    it('should reset flags when closing delete confirm', () => {
      const note: Note = {
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'delete',
        active: false
      };

      component.noteToDelete = note;
      component.confirmDeleteOpen = true;
      component.trashOpen = true;

      component.closeDeleteConfirm(true);

      expect(component.confirmDeleteOpen).toBeFalse();
      expect(component.noteToDelete).toBeNull();
      expect(component.trashOpen).toBeFalse();
      expect(component.lastDragPosition).toBeNull();
    });

    it('should call deleteNote when confirmDelete is executed', () => {
      const note: Note = {
        idNote: '1',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'delete',
        active: false
      };

      component.noteToDelete = note;
      spyOn(component, 'deleteNote');
      spyOn(component, 'closeDeleteConfirm');

      component.confirmDelete();

      expect(component.deleteNote).toHaveBeenCalledWith(note);
      expect(component.closeDeleteConfirm).toHaveBeenCalled();
    });
  });

  describe('bringToFront', () => {
    it('should set all notes inactive and bring selected note to front', () => {
      const note1: Note = {
        idNote: '1',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Nota 1',
        active: true
      };
      const note2: Note = {
        idNote: '2',
        color: '#FFB6C1',
        top: 20,
        left: 20,
        content: 'Nota 2',
        active: true
      };
      const note3: Note = {
        idNote: '3',
        color: '#8bc34a',
        top: 30,
        left: 30,
        content: 'Nota 3',
        active: true
      };

      component.notes = [note1, note2, note3];
      component.bringToFront(note2);

      expect(note1.active).toBeFalse();
      expect(note2.active).toBeTrue();
      expect(note3.active).toBeFalse();
    });

    it('should activate only the passed note even if it was already inactive', () => {
      const note1: Note = {
        idNote: '1',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Nota 1',
        active: false
      };
      const note2: Note = {
        idNote: '2',
        color: '#FFB6C1',
        top: 20,
        left: 20,
        content: 'Nota 2',
        active: false
      };

      component.notes = [note1, note2];
      component.bringToFront(note1);

      expect(note1.active).toBeTrue();
      expect(note2.active).toBeFalse();
    });
  });

  describe('onDragEnd position updates', () => {
    let boardElement: HTMLElement;
    let trashElement: HTMLElement;
    let mockEvent: any;
    let note: Note;

    beforeEach(() => {
      boardElement = document.createElement('div');
      trashElement = document.createElement('div');
      
      note = {
        idNote: '1',
        color: '#FFD700',
        top: 10,
        left: 10,
        content: 'Nota',
        active: false
      };

      mockEvent = {
        source: {
          getFreeDragPosition: jasmine.createSpy().and.returnValue({ x: 20, y: 30 }),
          element: {
            nativeElement: {
              getBoundingClientRect: jasmine.createSpy()
            }
          },
          data: note,
          reset: jasmine.createSpy()
        }
      };
    });

    it('should reset note position if it is out of board', () => {
      // Mock board dimensions
      spyOn(boardElement, 'getBoundingClientRect').and.returnValue({
        left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500
      } as DOMRect);

      // Mock trash dimensions (not overlapping)
      spyOn(trashElement, 'getBoundingClientRect').and.returnValue({
        left: 600, top: 600, right: 700, bottom: 700, width: 100, height: 100
      } as DOMRect);

      // Mock note element out of bounds
      mockEvent.source.element.nativeElement.getBoundingClientRect.and.returnValue({
        left: -50, top: -50, right: -10, bottom: -10, width: 40, height: 40
      } as DOMRect);

      spyOn(component, 'updateNote');

      component.onDragEnd(mockEvent, boardElement, trashElement);

      expect(mockEvent.source.reset).toHaveBeenCalled();
      expect(component.updateNote).not.toHaveBeenCalled();
    });

    it('should update note position and call updateNote if inside board', fakeAsync(() => {
      // Mock board dimensions
      spyOn(boardElement, 'getBoundingClientRect').and.returnValue({
        left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500
      } as DOMRect);

      // Mock trash dimensions (not overlapping)
      spyOn(trashElement, 'getBoundingClientRect').and.returnValue({
        left: 600, top: 600, right: 700, bottom: 700, width: 100, height: 100
      } as DOMRect);

      // Mock note element inside board
      mockEvent.source.element.nativeElement.getBoundingClientRect.and.returnValue({
        left: 100, top: 100, right: 200, bottom: 200, width: 100, height: 100
      } as DOMRect);

      spyOn(component, 'updateNote');

      component.onDragEnd(mockEvent, boardElement, trashElement);
      tick();

      expect(note.top).toBe(40); // 10 + 30
      expect(note.left).toBe(30); // 10 + 20
      expect(mockEvent.source.reset).toHaveBeenCalled();
      expect(component.updateNote).toHaveBeenCalledWith(note);
    }));
  });

  describe('addNewNote', () => {
    it('should add a new note to notes array', () => {
      const initialLength = component.notes.length;
      
      component.addNewNote();
      
      expect(component.notes.length).toBe(initialLength + 1);
      const newNote = component.notes[component.notes.length - 1];
      expect(newNote.content).toBe('Nueva nota...');
      expect(newNote.saved).toBeFalse();
      expect(newNote.active).toBeFalse();
      expect(component.colorNotes).toContain(newNote.color);
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      component.savedNotes = [
        {
          idNote: '1',
          content: 'Note about work',
          color: '#fff',
          top: 0,
          left: 0,
          active: false,
          categoryId: 'work',
          saved: true
        },
        {
          idNote: '2',
          content: 'Personal note',
          color: '#fff',
          top: 0,
          left: 0,
          active: false,
          categoryId: 'personal',
          saved: true
        }
      ];
    });

    it('should filter notes by category', () => {
      component.selectedCategory = 'work';
      component.searchTerm = '';

      component.applyFilters();

      expect(component.filteredNotes.length).toBe(1);
      expect(component.filteredNotes[0].categoryId).toBe('work');
    });

    it('should filter notes by search term', () => {
      component.selectedCategory = '';
      component.searchTerm = 'work';

      component.applyFilters();

      expect(component.filteredNotes.length).toBe(1);
      expect(component.filteredNotes[0].content).toContain('work');
    });

    it('should show error message when no notes match filters', () => {
      component.selectedCategory = 'nonexistent';
      component.searchTerm = '';

      component.applyFilters();

      expect(component.filteredNotes.length).toBe(0);
      expect(component.errorMsg).toBe('No hay notas que coincidan con los filtros.');
    });
  });
});