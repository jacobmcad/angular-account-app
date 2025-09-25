import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import type { OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RightRailService } from '../../../layout/right-rail.service';

@Component({
  selector: 'app-set-shared-secret',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-shared-secret.component.html',
  styleUrls: ['./set-shared-secret.component.css'],
})
export class SetSharedSecretComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly rightRail = inject(RightRailService);

  @ViewChild('rail', { static: true })
  private railTemplate?: TemplateRef<unknown>;

  readonly questions: string[] = [
    'What is the first name of your best friend?',
    'What is the name of the high school you attended?',
    'What is the street name of first home?',
    'What is your city of birth?',
    "What is your father’s middle name?",
  ];

  readonly form = this.fb.group({
    question: ['', Validators.required],
    answer: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    if (this.railTemplate) {
      this.rightRail.setTemplate(this.railTemplate);
    }
  }

  ngOnDestroy(): void {
    this.rightRail.setTemplate(null);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    // TODO: wire to DAL when backend available.
    console.warn('Shared secret submitted (stub)', this.form.value);
  }
}
