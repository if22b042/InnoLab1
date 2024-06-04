import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRunComponent } from './test-run.component';

describe('TestRunComponent', () => {
  let component: TestRunComponent;
  let fixture: ComponentFixture<TestRunComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestRunComponent]
    });
    fixture = TestBed.createComponent(TestRunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
