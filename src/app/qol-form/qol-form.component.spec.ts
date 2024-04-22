import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QolFormComponent } from './qol-form.component';

describe('QolFormComponent', () => {
  let component: QolFormComponent;
  let fixture: ComponentFixture<QolFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QolFormComponent]
    });
    fixture = TestBed.createComponent(QolFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
