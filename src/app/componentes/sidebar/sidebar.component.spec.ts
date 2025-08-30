import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should start with an empty categories list', () => {
    expect(component.categories.length).toBe(0);
    const chips = fixture.debugElement.queryAll(By.css('.chip'));
    expect(chips.length).toBe(0);
  });
  it('should open the modal when clicking "+"', () => {
  fixture.detectChanges();

  // buscar por data-testid (evita falsos negativos si cambian clases)
  const btnDe = fixture.debugElement.query(By.css('button[data-testid="add-category"]'));
  expect(btnDe).withContext('Add button not found').toBeTruthy();

  (btnDe.nativeElement as HTMLButtonElement).click(); // más estable que triggerEventHandler
  fixture.detectChanges();

  expect(component.modalOpen).toBeTrue();
  const modal = fixture.debugElement.query(By.css('.modal'));
  expect(modal).toBeTruthy();
});


  it('should validate HEX and enable Save only when form is valid', () => {
    component.modalOpen = true;
    component.form.name = 'Work';
    component.form.color = '#ABCDEF';
    fixture.detectChanges();

    expect(component.isValidHex(component.form.color)).toBeTrue();
    expect(component.canSave()).toBeTrue();

    component.form.color = '123456'; // sin "#"
    expect(component.isValidHex(component.form.color)).toBeFalse();
    expect(component.canSave()).toBeFalse();
  });

  it('should add a new category and close modal on Save', () => {
    component.modalOpen = true;
    component.form.name = 'Ideas';
    component.form.color = '#FFD966';
    fixture.detectChanges();

    component.saveCategory();
    fixture.detectChanges();

    expect(component.categories.length).toBe(1);
    expect(component.modalOpen).toBeFalse();

    const chips = fixture.debugElement.queryAll(By.css('.chip'));
    expect(chips.length).toBe(1);
    expect((chips[0].nativeElement as HTMLElement).textContent?.trim()).toBe('Ideas');
  });
});
