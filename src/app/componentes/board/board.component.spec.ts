import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BoardComponent } from './board.component';

export interface Note {
  color: string;
  top: number;
  left: number;
  text: string;
  saved?: boolean;
}

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create a note and mark as saved', () => {
    const note: Note = { color: '#FFD700', top: 10, left: 10, text: 'Test' };
    component.saveNote(note);
    expect(component.savedNotes.length).toBe(1);
    expect(note.saved).toBeTrue();
  });

  it('should add note text correctly', () => {
    const note: Note = { color: '#FFB6C1', top: 20, left: 20, text: '' };
    note.text = 'Hola';
    expect(note.text).toBe('Hola');
  });
});
