import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BoardComponent, Note } from './board.component';
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
      'updateNote'
    ]);

    spy.getAllNotes.and.returnValue(of([]));

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

  it('should return true if note is saved', () => {
    const note: Note = { color: '#FFB6C1', top: 20, left: 20, content: 'Hola', saved: true, active: false };
    expect(component.isNoteSaved(note)).toBeTrue();
  });

  it('should return false if note is not saved', () => {
    const note: Note = { color: '#FFB6C1', top: 20, left: 20, content: 'Hola', active: false };
    expect(component.isNoteSaved(note)).toBeFalse();
  });

  it('should remove a note from notes array if it has no idNote', () => {
    const note: Note = { color: '#FFD700', top: 10, left: 10, content: 'Nota temporal', active: false };
    component.notes = [note];
    component.deleteNote(note);
    expect(component.notes.length).toBe(0);
  });

  it('should delete a saved note successfully', fakeAsync(() => {
    const note: Note = { idNote: '123', color: '#FFD700', top: 10, left: 10, content: 'Guardada', active: false };
    component.notes = [note];
    component.savedNotes = [note];

    noteServiceSpy.deleteNote.and.returnValue(of({ success: true }));

    spyOn(window, 'alert');
    component.deleteNote(note);
    tick();

    expect(component.notes.length).toBe(0);
    expect(component.savedNotes.length).toBe(0);
    expect(window.alert).toHaveBeenCalledWith('Nota eliminada correctamente');
  }));

  it('should handle delete note error response', fakeAsync(() => {
    const note: Note = { idNote: '123', color: '#FFD700', top: 10, left: 10, content: 'Guardada', active: false };
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
    const note: Note = { idNote: '123', color: '#FFD700', top: 10, left: 10, content: 'Guardada', active: false };
    component.notes = [note];
    component.savedNotes = [note];

    noteServiceSpy.deleteNote.and.returnValue(throwError(() => new Error('Network error')));

    spyOn(window, 'alert');
    component.deleteNote(note);
    tick();

    expect(window.alert).toHaveBeenCalledWith('Error en la eliminación: Network error');
  }));

  it('should map a RecoverNote to a Note correctly', () => {
    const recoverNote = { idNote: '1', content: 'Test content' };
    const index = 2;

    const note: Note = component.mapNotes(recoverNote as any, index);

    expect(note.idNote).toBe('1');
    expect(note.content).toBe('Test content');

    const validColors = ['#ffeb3b','#8bc34a','#fa719fff','#74c7e0ff','#fdb96cff','#ce74e0ff'];
    expect(validColors).toContain(note.color);

    expect(note.top).toBe(200 * (index % 3));
    expect(note.left).toBe(200 * (index % 5));
    expect(note.saved).toBeTrue();
  });

  it('should load notes when service returns data', fakeAsync(() => {
    const mockResponse = [
      { idNote: '1', content: 'Note 1' },
      { idNote: '2', content: 'Note 2' },
    ];

    noteServiceSpy.getAllNotes.and.returnValue(of(mockResponse));

    component.getNotes();
    tick();

    expect(component.savedNotes.length).toBe(2);
    expect(component.notes.length).toBe(2);
    expect(component.savedNotes[0].saved).toBeTrue();
    expect(component.savedNotes[1].saved).toBeTrue();
  }));

  it('should update note successfully', fakeAsync(() => {
    const note: Note = { idNote: '1', color: '#FFD700', top: 10, left: 10, content: 'Contenido actualizado', active: false };

    noteServiceSpy.updateNote.and.returnValue(of(true));

    spyOn(window, 'alert');
    component.updateNote(note);
    tick();

    expect(window.alert).not.toHaveBeenCalled();
  }));
  it('should show error if updateNote returns false', fakeAsync(() => {
    const note: Note = { idNote: '1', color: '#FFD700', top: 10, left: 10, content: 'Contenido', active: false };

    noteServiceSpy.updateNote.and.returnValue(of(false));

    spyOn(window, 'alert');
    component.updateNote(note);
    tick();

    expect(window.alert).toHaveBeenCalledWith('Error al actualizar la nota');
  }));

  it('should show error if note has no idNote on update', () => {
    const note: Note = { color: '#FFD700', top: 10, left: 10, content: 'Sin ID', active: false };

    spyOn(window, 'alert');
    component.updateNote(note);

    expect(window.alert).toHaveBeenCalledWith('Esta nota no existe');
  });

    it('should set all notes inactive and bring selected note to front', () => {
    const note1: Note = { idNote: '1', color: '#FFD700', top: 10, left: 10, content: 'Nota 1', active: true };
    const note2: Note = { idNote: '2', color: '#FFB6C1', top: 20, left: 20, content: 'Nota 2', active: true };
    const note3: Note = { idNote: '3', color: '#8bc34a', top: 30, left: 30, content: 'Nota 3', active: true };

    component.notes = [note1, note2, note3];

    component.bringToFront(note2);

    expect(note1.active).toBeFalse();
    expect(note2.active).toBeTrue();
    expect(note3.active).toBeFalse();
  });

  it('should activate only the passed note even if it was already inactive', () => {
    const note1: Note = { idNote: '1', color: '#FFD700', top: 10, left: 10, content: 'Nota 1', active: false };
    const note2: Note = { idNote: '2', color: '#FFB6C1', top: 20, left: 20, content: 'Nota 2', active: false };

    component.notes = [note1, note2];

    component.bringToFront(note1);

    expect(note1.active).toBeTrue();
    expect(note2.active).toBeFalse();
  });
    describe('onDragEnd', () => {
    let boardElement: HTMLElement;
    let mockEvent: any;
    let note: Note;

    beforeEach(() => {
      boardElement = document.createElement('div');
      document.body.appendChild(boardElement);
      boardElement.getBoundingClientRect = jasmine.createSpy().and.returnValue({
        left: 0,
        top: 0,
        right: 500,
        bottom: 500,
        width: 500,
        height: 500
      } as DOMRect);

      note = { idNote: '1', color: '#FFD700', top: 10, left: 10, content: 'Nota', active: false };

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
      mockEvent.source.element.nativeElement.getBoundingClientRect.and.returnValue({
        left: -50, top: -50, right: -10, bottom: -10, width: 40, height: 40
      } as DOMRect);

      component.onDragEnd(mockEvent, boardElement);

      expect(mockEvent.source.reset).toHaveBeenCalled();
      spyOn(component, 'updateNote');
      expect(component.updateNote).not.toHaveBeenCalled();
    });

    it('should update note position and call updateNote if inside board', fakeAsync(() => {
      spyOn(component, 'updateNote');

      mockEvent.source.element.nativeElement.getBoundingClientRect.and.returnValue({
        left: 100, top: 100, right: 200, bottom: 200, width: 100, height: 100
      } as DOMRect);

      component.onDragEnd(mockEvent, boardElement);
      tick();

      expect(note.top).toBe(40);
      expect(note.left).toBe(30);
      expect(mockEvent.source.reset).toHaveBeenCalled();
      expect(component.updateNote).toHaveBeenCalledWith(note);
    }));
  });

});

