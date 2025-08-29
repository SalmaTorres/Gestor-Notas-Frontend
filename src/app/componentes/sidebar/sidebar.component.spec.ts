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
  
  it('should show a "+" button in the header', () => {
    const btn = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(btn.textContent.trim()).toBe('+');
  });

  it('should start with an empty categories list', () => {
    expect(component.categories.length).toBe(0);
    const chips = fixture.debugElement.queryAll(By.css('.chip'));
    expect(chips.length).toBe(0);
  });
});
