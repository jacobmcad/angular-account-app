import { Component, DestroyRef, ViewChild, inject, signal } from '@angular/core';
import type { ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface SummaryMessage {
  fieldId: string;
  message: string;
}

const QUESTION_CONTROL_KEYS = ['question1', 'question2', 'question3'] as const;
type QuestionControlName = typeof QUESTION_CONTROL_KEYS[number];

const ANSWER_CONTROL_KEYS = ['answer1', 'answer2', 'answer3'] as const;
type AnswerControlName = typeof ANSWER_CONTROL_KEYS[number];
type ControlName = QuestionControlName | AnswerControlName;

@Component({
  selector: 'app-set-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-questions.component.html',
})
export class SetQuestionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly questions = [
    'What is your favorite book?',
    'What city were you born in?',
    'What is the name of your first pet?',
    'What is your mother’s maiden name?',
    'What is your favorite teacher’s name?',
  ];

  private readonly questionControls = QUESTION_CONTROL_KEYS;
  private readonly answerControls = ANSWER_CONTROL_KEYS;
  readonly questionIndexes = [0, 1, 2] as const;

  readonly form = this.fb.group({
    question1: ['', Validators.required],
    answer1: ['', [Validators.required, Validators.minLength(4)]],
    question2: ['', Validators.required],
    answer2: ['', [Validators.required, Validators.minLength(4)]],
    question3: ['', Validators.required],
    answer3: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly duplicateQuestionIndexes = signal<number[]>([]);
  readonly validationMessages = signal<SummaryMessage[]>([]);
  readonly successMessage = signal<string | null>(null);

  @ViewChild('errorSummaryRef') private errorSummary?: ElementRef<HTMLDivElement>;
  @ViewChild('successBannerRef') private successBanner?: ElementRef<HTMLDivElement>;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateDuplicateState();
      });
  }

  questionControl(index: number): QuestionControlName {
    return this.questionControls[index];
  }

  answerControl(index: number): AnswerControlName {
    return this.answerControls[index];
  }

  questionId(index: number): string {
    return `question${index + 1}`;
  }

  answerId(index: number): string {
    return `answer${index + 1}`;
  }

  describeQuestion(index: number): string | null {
    const ids = [`${this.questionId(index)}-help`];
    if (this.getQuestionError(index)) {
      ids.push(`${this.questionId(index)}-error`);
    }
    return ids.join(' ');
  }

  describeAnswer(index: number): string | null {
    const ids = [`${this.answerId(index)}-help`];
    if (this.getAnswerError(index)) {
      ids.push(`${this.answerId(index)}-error`);
    }
    return ids.join(' ');
  }

  hasQuestionError(index: number): boolean {
    const control = this.getControl(this.questionControl(index));
    if (!control.touched && !control.dirty) {
      return false;
    }
    return control.invalid || this.hasDuplicateQuestions(index);
  }

  hasAnswerError(index: number): boolean {
    const control = this.getControl(this.answerControl(index));
    if (!control.touched && !control.dirty) {
      return false;
    }
    return control.invalid;
  }

  getQuestionError(index: number): string | null {
    const control = this.getControl(this.questionControl(index));
    if (!(control.touched || control.dirty)) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Select a security question.';
    }
    if (this.hasDuplicateQuestions(index)) {
      return 'Choose a different question for this slot.';
    }
    return null;
  }

  getAnswerError(index: number): string | null {
    const control = this.getControl(this.answerControl(index));
    if (!(control.touched || control.dirty)) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Provide an answer for this question.';
    }
    if (control.hasError('minlength')) {
      return 'Answers must be at least 4 characters long.';
    }
    return null;
  }

  shouldShowErrorSummary(): boolean {
    return this.validationMessages().length > 0;
  }

  isOptionDisabled(option: string, currentIndex: number): boolean {
    return this.questionIndexes.some(index => {
      if (index === currentIndex) {
        return false;
      }
      return this.getControl(this.questionControl(index)).value === option;
    });
  }

  focusField(fieldId: string): void {
    const field = document.getElementById(fieldId);
    if (field) {
      field.focus();
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    this.updateDuplicateState();

    if (this.form.invalid || this.duplicateQuestionIndexes().length > 0) {
      this.validationMessages.set(this.collectValidationMessages());
      this.successMessage.set(null);
      this.focusErrorSummary();
      return;
    }

    this.validationMessages.set([]);
    this.successMessage.set('Your password reset questions have been saved.');
    this.form.reset();
    this.focusSuccessBanner();
    // TODO: swap with DAL call when backend endpoint is available.
  }

  private collectValidationMessages(): SummaryMessage[] {
    const messages: SummaryMessage[] = [];

    this.questionIndexes.forEach(index => {
      const error = this.getQuestionError(index);
      if (error) {
        messages.push({ fieldId: this.questionId(index), message: error });
      }

      const answerError = this.getAnswerError(index);
      if (answerError) {
        messages.push({ fieldId: this.answerId(index), message: answerError });
      }
    });

    return messages;
  }

  private updateDuplicateState(): void {
    const duplicates = new Set<number>();
    const values = this.questionIndexes
      .map(index => ({ index, value: this.getControl(this.questionControl(index)).value }))
      .filter(entry => !!entry.value);

    values.forEach((current, idx) => {
      for (let next = idx + 1; next < values.length; next++) {
        if (values[next].value === current.value) {
          duplicates.add(current.index);
          duplicates.add(values[next].index);
        }
      }
    });

    this.duplicateQuestionIndexes.set([...duplicates]);
  }

  private hasDuplicateQuestions(index: number): boolean {
    return this.duplicateQuestionIndexes().includes(index);
  }

  private getControl(name: ControlName): FormControl<string | null> {
    const controls = this.form.controls as Record<ControlName, FormControl<string | null>>;
    return controls[name];
  }

  private focusErrorSummary(): void {
    setTimeout(() => this.errorSummary?.nativeElement.focus());
  }

  private focusSuccessBanner(): void {
    setTimeout(() => this.successBanner?.nativeElement.focus());
  }
}
