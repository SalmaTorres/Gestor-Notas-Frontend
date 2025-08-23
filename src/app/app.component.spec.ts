import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './componentes/sidebar/sidebar.component';
import { BoardComponent } from './componentes/board/board.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
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

  beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [AppComponent, SidebarComponent, BoardComponent, FormsModule]
  }).compileComponents();

  fixture = TestBed.createComponent(AppComponent);
  app = fixture.componentInstance;
  fixture.detectChanges();
});


  it('should create a note via sidebar and display in board', () => {
    const sidebar = fixture.debugElement.query(By.directive(SidebarComponent)).componentInstance;
    sidebar.noteCreated.emit('#FFD700'); // simula evento
    fixture.detectChanges();
    
    expect(app.createdNotes.length).toBe(1);
    const board = fixture.debugElement.query(By.directive(BoardComponent)).componentInstance;
    expect(board.notes.length).toBe(1);
  });
});
