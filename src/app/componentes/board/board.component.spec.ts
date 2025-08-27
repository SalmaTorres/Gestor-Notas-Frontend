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
    const spy = jasmine.createSpyObj('NoteService', ['createNote']);

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

});
