import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from './sidebar.component';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    httpSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get', 'post']);

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        provideHttpClientTesting(),
        importProvidersFrom(HttpClientTestingModule),
      ],
    }).compileComponents();

    httpSpy.get.and.returnValue(of([]));

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ejecuta ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start empty and render no post-its', () => {
    expect(component.categories.length).toBe(0);
    const notes = fixture.debugElement.queryAll(By.css('.note'));
    expect(notes.length).toBe(0);
  });

  it('should open and close the modal (and toggle body class)', () => {
    const btn = fixture.debugElement.query(By.css('button[data-testid="add-category"]'));
    expect(btn).toBeTruthy();

    (btn.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.modalOpen).toBeTrue();
    expect(document.body.classList.contains('modal-open')).toBeTrue();
    expect(fixture.debugElement.query(By.css('.modal'))).toBeTruthy();

    component.closeModal();
    fixture.detectChanges();

    expect(component.modalOpen).toBeFalse();
    expect(document.body.classList.contains('modal-open')).toBeFalse();
  });

  it('should validate HEX and canSave should reflect validity', () => {
    component.modalOpen = true;
    component.form.categoryId = 'Work';
    component.form.color = '#ABCDEF';
    fixture.detectChanges();

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
    const mockCats = [
      { categoryId: 'Trabajo', color: '#9DC3E6' },
      { categoryId: 'Uni',     color: '#FFD966' },
    ];
    httpSpy.get.and.returnValue(of(mockCats));

    component.fetchCategories();
    tick();
    fixture.detectChanges();

    expect(component.categories.length).toBe(2);
    const notes = fixture.debugElement.queryAll(By.css('.note'));
    expect(notes.length).toBe(2);
    expect((notes[0].nativeElement as HTMLElement).textContent?.trim()).toBe('Trabajo');
  }));

  it('should set errorMsg when GET fails with 404', fakeAsync(() => {
    httpSpy.get.and.returnValue(
      throwError(() => ({ status: 404, error: { message: 'Not Found' } }))
    );

    component.fetchCategories();
    tick();
    fixture.detectChanges();

    expect(component['errorMsg']).toContain('Ruta no encontrada');
  }));

  it('should set errorMsg when GET fails with network error (status 0)', fakeAsync(() => {
    httpSpy.get.and.returnValue(throwError(() => ({ status: 0 })));

    component.fetchCategories();
    tick();
    fixture.detectChanges();

    expect(component['errorMsg']).toContain('No se pudo conectar');
  }));

  it('should save a category successfully, dedupe by categoryId, reset form, and close modal', fakeAsync(() => {
    component.categories = [{ categoryId: 'Ideas', color: '#FF0000' }];
    component.modalOpen = true;
    component.form.categoryId = 'Ideas';
    component.form.color = '#FFD966';
    fixture.detectChanges();

    httpSpy.post.and.returnValue(of({ categoryId: 'Ideas', color: '#FFD966' }));

    component.saveCategory();
    tick();
    fixture.detectChanges();

    expect(component['loading']).toBeFalse();
    expect(component.modalOpen).toBeFalse();
    expect(component.form.categoryId).toBe('');
    expect(component.form.color).toBe('#FFD966'); 
    expect(component.categories.length).toBe(1);
    expect(component.categories[0]).toEqual({ categoryId: 'Ideas', color: '#FFD966' });

    const notes = fixture.debugElement.queryAll(By.css('.note'));
    expect(notes.length).toBe(1);
    expect((notes[0].nativeElement as HTMLElement).textContent?.trim()).toBe('Ideas');
  }));

  it('should keep modal open and set errorMsg when POST fails with 404', fakeAsync(() => {
    component.modalOpen = true;
    component.form.categoryId = 'Nueva';
    component.form.color = '#FFD966';
    fixture.detectChanges();

    httpSpy.post.and.returnValue(
      throwError(() => ({ status: 404, error: { message: 'No route' } }))
    );

    component.saveCategory();
    tick();
    fixture.detectChanges();

    expect(component['loading']).toBeFalse();
    expect(component.modalOpen).toBeTrue();
    expect(component['errorMsg']).toContain('Ruta no encontrada');
    expect(component.categories.length).toBe(0);
  }));

  it('should set errorMsg on POST network error (status 0) and not modify categories', fakeAsync(() => {
    component.modalOpen = true;
    component.form.categoryId = 'OfflineCat';
    component.form.color = '#9DC3E6';
    fixture.detectChanges();

    httpSpy.post.and.returnValue(
      throwError(() => ({ status: 0 }))
    );

    component.saveCategory();
    tick();
    fixture.detectChanges();

    expect(component['loading']).toBeFalse();
    expect(component.modalOpen).toBeTrue(); 
    expect(component['errorMsg']).toContain('No se pudo conectar');
    expect(component.categories.length).toBe(0);
  }));
});
