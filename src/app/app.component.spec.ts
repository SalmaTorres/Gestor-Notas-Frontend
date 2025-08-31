import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './componentes/sidebar/sidebar.component';
import { BoardComponent } from './componentes/board/board.component';
import { NoteService } from './services/note.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let noteServiceSpy: jasmine.SpyObj<NoteService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NoteService', [
      'createNote',
      'getAllNotes',
      'updateNote',
      'deleteNote'
    ]);

    spy.getAllNotes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent, FormsModule, SidebarComponent, BoardComponent, HttpClientTestingModule],
      providers: [{ provide: NoteService, useValue: spy }]
    }).compileComponents();

    noteServiceSpy = TestBed.inject(NoteService) as jasmine.SpyObj<NoteService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'notas' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('notas');
  });
});

describe('AppComponent Integration', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let noteServiceSpy: jasmine.SpyObj<NoteService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NoteService', [
      'createNote',
      'getAllNotes',
      'updateNote',
      'deleteNote'
    ]);

    spy.createNote.and.returnValue(
      of({
        success: true,
        note: { color: '#FFD700', top: 0, left: 0, content: 'Test', idNote: '123' }
      })
    );
    spy.getAllNotes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent, SidebarComponent, BoardComponent, FormsModule, HttpClientTestingModule],
      providers: [{ provide: NoteService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    noteServiceSpy = TestBed.inject(NoteService) as jasmine.SpyObj<NoteService>;
    fixture.detectChanges();
  });

  it('should create a note via sidebar and display in board', fakeAsync(() => {
    const sidebar = fixture.debugElement.query(By.directive(SidebarComponent)).componentInstance;
    sidebar.noteCreated.emit('#FFD700');

    tick();
    fixture.detectChanges();

    app.currentNote!.content = 'Test';
    app.saveCurrentNote();

    tick();
    fixture.detectChanges();

    expect(app.createdNotes.length).toBe(1);

    const board = fixture.debugElement.query(By.directive(BoardComponent)).componentInstance;
    expect(board.notes.length).toBe(1);
    expect(board.notes[0].color).toBe('#FFD700');
  }));
});
