import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { SetQuestionsComponent } from './set-questions.component';

describe('SetQuestionsComponent', () => {
  let component: SetQuestionsComponent;
  let fixture: ComponentFixture<SetQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SetQuestionsComponent]
    });
    fixture = TestBed.createComponent(SetQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
