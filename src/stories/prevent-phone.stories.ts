import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import type { TemplateRef } from '@angular/core';

import { PreventPhoneComponent } from '../app/features/password-management/prevent-phone/prevent-phone.component';
import { RightRailService } from '../app/layout/right-rail.service';

class MockRightRailService {
  private readonly templateSignal = signal<TemplateRef<unknown> | null>(null);

  template(): TemplateRef<unknown> | null {
    return this.templateSignal();
  }

  setTemplate(template: TemplateRef<unknown> | null): void {
    this.templateSignal.set(template);
  }
}

const meta: Meta<PreventPhoneComponent> = {
  title: 'Password Management/Prevent Phone Resets',
  component: PreventPhoneComponent,
  decorators: [
    applicationConfig({
      providers: [{ provide: RightRailService, useClass: MockRightRailService }],
    }),
  ],
};

export default meta;

type Story = StoryObj<PreventPhoneComponent>;

export const Default: Story = {
  args: {},
};
