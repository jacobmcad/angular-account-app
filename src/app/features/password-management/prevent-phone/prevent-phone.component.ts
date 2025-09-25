import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import type { OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RightRailService } from '../../../layout/right-rail.service';

@Component({
  selector: 'app-prevent-phone',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prevent-phone.component.html',
  styleUrls: ['./prevent-phone.component.css'],
})
export class PreventPhoneComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly rightRail = inject(RightRailService);

  @ViewChild('rail', { static: true })
  private railTemplate?: TemplateRef<unknown>;

  readonly form = this.fb.group({
    preference: ['prevent', Validators.required],
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
    if (this.form.invalid) {
      return;
    }
    // TODO: Connect to DAL when available.
    console.warn('Prevent phone preference submitted (stub)', this.form.value);
  }
}
