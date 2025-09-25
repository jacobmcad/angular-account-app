import { Injectable, signal } from '@angular/core';
import type { TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RightRailService {
  private readonly templateSignal = signal<TemplateRef<unknown> | null>(null);

  readonly template = this.templateSignal.asReadonly();

  setTemplate(template: TemplateRef<unknown> | null): void {
    this.templateSignal.set(template);
  }
}
