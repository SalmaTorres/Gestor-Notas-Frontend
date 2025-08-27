import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BoardComponent, Note } from './board.component';
import { NoteService } from '../../services/note.service';
import { of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let noteServiceSpy: jasmine.SpyObj<NoteService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NoteService', ['createNote', 'deleteNote', 'getAllNotes']);

    await TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: NoteService, useValue: spy },
        provideHttpClientTesting(),
        importProvidersFrom(HttpClientTestingModule)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    noteServiceSpy = TestBed.inject(NoteService) as jasmine.SpyObj<NoteService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should save a note successfully', fakeAsync(() => {
    const note: Note = { color: '#FFD700', top: 10, left: 10, content: 'Test' };
    const mockResponse = { success: true, note: { ...note, idNote: '123' } };

    noteServiceSpy.createNote.and.returnValue(of(mockResponse));

    spyOn(window, 'alert'); // para evitar que aparezca alert real
    component.saveNote(note);
    tick(); // avanza el tiempo para que se ejecute el observable

    expect(component.savedNotes.length).toBe(1);
    expect(note['saved']).toBeTrue();
    expect(component.savedNotes[0].idNote).toBe('123');
  }));

  it('should handle save note error', fakeAsync(() => {
    const note: Note = { color: '#FFD700', top: 10, left: 10, content: 'Test' };
    noteServiceSpy.createNote.and.returnValue(throwError(() => new Error('Network error')));

    spyOn(window, 'alert');
    component.saveNote(note);
    tick();

    expect(component.savedNotes.length).toBe(0);
    expect(note['saved']).toBeUndefined();
  }));

  it('should return true if note is saved', () => {
    const note: Note = { color: '#FFB6C1', top: 20, left: 20, content: 'Hola', saved: true };
    expect(component.isNoteSaved(note)).toBeTrue();
  });

  it('should return false if note is not saved', () => {
    const note: Note = { color: '#FFB6C1', top: 20, left: 20, content: 'Hola' };
    expect(component.isNoteSaved(note)).toBeFalse();
  });

  it('should remove a note from notes array if it has no idNote', () => {
    const note: Note = { color: '#FFD700', top: 10, left: 10, content: 'Nota temporal' };
    component.notes = [note]; // simulamos que la nota está en el array
    component.deleteNote(note);
    expect(component.notes.length).toBe(0);
  });
  it('should delete a note successfully', fakeAsync(() => {
    const note: Note = { idNote: '123', color: '#FFD700', top: 10, left: 10, content: 'Guardada' };
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
    const note: Note = { idNote: '123', color: '#FFD700', top: 10, left: 10, content: 'Guardada' };
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
    const note: Note = { idNote: '123', color: '#FFD700', top: 10, left: 10, content: 'Guardada' };
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

  it('should show alert if service throws error', fakeAsync(() => {
    spyOn(window, 'alert');
    noteServiceSpy.getAllNotes.and.returnValue(throwError(() => new Error('Network error')));

    component.getNotes();
    tick();

    expect(window.alert).toHaveBeenCalled();
    expect(component.savedNotes.length).toBe(0);
    expect(component.notes.length).toBe(0);
  }));
});

