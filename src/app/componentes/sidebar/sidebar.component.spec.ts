import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from './sidebar.component';
import { NoteService, Category } from '../../services/note.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let noteServiceSpy: jasmine.SpyObj<NoteService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj<NoteService>('NoteService', [
      'getAllCategories',
      'createCategory'
    ]);

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, HttpClientTestingModule],
      providers: [{ provide: NoteService, useValue: spy }]
    }).compileComponents();

    noteServiceSpy = TestBed.inject(NoteService) as jasmine.SpyObj<NoteService>;
    noteServiceSpy.getAllCategories.and.returnValue(of([]));

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => document.body.classList.remove('modal-open'));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start empty and render no post-its', () => {
    expect(component.categories.length).toBe(0);
    expect(fixture.debugElement.queryAll(By.css('.note')).length).toBe(0);
  });

  it('should open and close the modal (and toggle body class)', () => {
    const btn = fixture.debugElement.query(By.css('button[data-testid="add-category"]'));
    (btn.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.modalOpen).toBeTrue();
    expect(document.body.classList.contains('modal-open')).toBeTrue();

    component.closeModal();
    fixture.detectChanges();
    expect(component.modalOpen).toBeFalse();
    expect(document.body.classList.contains('modal-open')).toBeFalse();
  });

  it('should validate HEX and canSave reflect validity', () => {
    component.modalOpen = true;
    component.form.categoryId = 'Work';
    component.form.color = '#ABCDEF';
    expect(component.isValidHex(component.form.color)).toBeTrue();
    expect(component.canSave()).toBeTrue();

    component.form.color = '123456';
    expect(component.isValidHex(component.form.color)).toBeFalse();
    expect(component.canSave()).toBeFalse();

    component.form.categoryId = '';
    component.form.color = '#ABCDEF';
    expect(component.canSave()).toBeFalse();
  });

  it('should normalizeHex by adding # and uppercasing', () => {
    component.form.color = 'abc123';
    component.normalizeHex();
    expect(component.form.color).toBe('#ABC123');

    component.form.color = '#aabbcc';
    component.normalizeHex();
    expect(component.form.color).toBe('#AABBCC');
  });

  it('should fetch categories successfully and render post-its', fakeAsync(() => {
    const mockCats: Category[] = [
      { categoryId: 'Trabajo', color: '#9DC3E6' },
      { categoryId: 'Uni',     color: '#FFD966' }
    ];
    noteServiceSpy.getAllCategories.and.returnValue(of(mockCats));

    component.loadCategories();
    tick();
    fixture.detectChanges();

    expect(component.categories.length).toBe(2);
    const notes = fixture.debugElement.queryAll(By.css('.note'));
    expect(notes.length).toBe(2);
    expect((notes[0].nativeElement as HTMLElement).textContent?.trim()).toBe('Trabajo');
  }));

  it('should set errorMsg when GET 404', fakeAsync(() => {
    noteServiceSpy.getAllCategories.and.returnValue(
      throwError(() => ({ status: 404, error: { message: 'Not Found' } }))
    );

    component.loadCategories();
    tick();
    fixture.detectChanges();

    expect((component as any).errorMsg).toContain('Not Found');
  }));

  it('should set errorMsg when GET network error (status 0)', fakeAsync(() => {
    noteServiceSpy.getAllCategories.and.returnValue(
      throwError(() => ({ status: 0 }))
    );

    component.loadCategories();
    tick();
    fixture.detectChanges();

    expect((component as any).errorMsg).toContain('No se pudo conectar');
  }));

  it('should save category, dedupe, reset form and close modal', fakeAsync(() => {
    component.categories = [{ categoryId: 'Ideas', color: '#FF0000' }];
    component.modalOpen = true;
    component.form.categoryId = 'Ideas';
    component.form.color = '#FFD966';

    noteServiceSpy.createCategory.and.returnValue(of({ categoryId: 'Ideas', color: '#FFD966' }));

    component.saveCategory();
    tick();
    fixture.detectChanges();

    expect((component as any).loading).toBeFalse();
    expect(component.modalOpen).toBeFalse();
    expect(component.form.categoryId).toBe('');
    expect(component.form.color).toBe('#FFD966');
    expect(component.categories.length).toBe(1);
    expect(component.categories[0]).toEqual({ categoryId: 'Ideas', color: '#FFD966' });
  }));

  it('should keep modal open and show msg when POST 404', fakeAsync(() => {
    component.modalOpen = true;
    component.form.categoryId = 'Nueva';
    component.form.color = '#FFD966';

    noteServiceSpy.createCategory.and.returnValue(
      throwError(() => ({ status: 404, error: { message: 'No route' } }))
    );

    component.saveCategory();
    tick();
    fixture.detectChanges();

    expect((component as any).loading).toBeFalse();
    expect(component.modalOpen).toBeTrue();
    expect((component as any).errorMsg).toContain('No route');
    expect(component.categories.length).toBe(0);
  }));

  it('should keep modal open and set errorMsg on POST network error', fakeAsync(() => {
    component.modalOpen = true;
    component.form.categoryId = 'OfflineCat';
    component.form.color = '#9DC3E6';

    noteServiceSpy.createCategory.and.returnValue(
      throwError(() => ({ status: 0 }))
    );

    component.saveCategory();
    tick();
    fixture.detectChanges();

    expect((component as any).loading).toBeFalse();
    expect(component.modalOpen).toBeTrue();
    expect((component as any).errorMsg).toContain('No se pudo conectar');
    expect(component.categories.length).toBe(0);
  }));
});
