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
      'deleteNote',
      'getAllCategories',
      'createCategory'
    ]);

    spy.getAllNotes.and.returnValue(of([]));
    spy.getAllCategories.and.returnValue(of([]));

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

describe('AppComponent Integration (category + color)', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let noteServiceSpy: jasmine.SpyObj<NoteService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NoteService', [
      'createNote',
      'getAllNotes',
      'updateNote',
      'deleteNote',
      'getAllCategories',
      'createCategory'
    ]);

    spy.createNote.and.returnValue(of({ success: true, note: { idNote: '123' } }));
    spy.getAllNotes.and.returnValue(of([]));
    spy.getAllCategories.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent, SidebarComponent, BoardComponent, FormsModule, HttpClientTestingModule],
      providers: [{ provide: NoteService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    noteServiceSpy = TestBed.inject(NoteService) as jasmine.SpyObj<NoteService>;
    fixture.detectChanges();
  });

  it('should create a note from sidebar category and render on board', fakeAsync(() => {
    const sidebar = fixture.debugElement.query(By.directive(SidebarComponent)).componentInstance as SidebarComponent;
    const cat = { categoryId: 'Trabajo', color: '#FFD700' };


    sidebar.noteCreated.emit(cat);
    tick();
    fixture.detectChanges();
    app.currentNote!.content = 'Test';
    app.saveCurrentNote();
    tick();
    fixture.detectChanges();
    expect(app.createdNotes.length).toBe(1);
    const board = fixture.debugElement.query(By.directive(BoardComponent)).componentInstance as BoardComponent;
    expect(board.notes.length).toBe(1);
    expect(board.notes[0].color).toBe('#FFD700');
    expect(noteServiceSpy.createNote).toHaveBeenCalled();
    const payload = noteServiceSpy.createNote.calls.mostRecent().args[0] as any;
    const sentCategory =
      typeof payload.category === 'string'
        ? payload.category
        : (payload.category?.categoryId ?? payload.categoryId);

    expect(sentCategory).toBe('Trabajo');
    expect(payload.color).toBe('#FFD700');
    expect(payload.content).toBe('Test');
    expect(typeof payload.positionX).toBe('number');
    expect(typeof payload.positionY).toBe('number');
  }));
});
