import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import type { TemplateRef } from '@angular/core';

import { SetSharedSecretComponent } from '../app/features/password-management/set-shared-secret/set-shared-secret.component';
import { RightRailService } from '../app/layout/right-rail.service';

// Simple mock of the service so the story renders without the app shell
class MockRightRailService {
  private readonly templateSignal = signal<TemplateRef<unknown> | null>(null);

  template(): TemplateRef<unknown> | null {
    return this.templateSignal();
  }

  setTemplate(template: TemplateRef<unknown> | null): void {
    this.templateSignal.set(template);
  }
}

const meta: Meta<SetSharedSecretComponent> = {
  title: 'Password Management/Set Shared Secret',
  component: SetSharedSecretComponent,
  decorators: [
    applicationConfig({
      providers: [{ provide: RightRailService, useClass: MockRightRailService }],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Standalone view of the Set Shared Secret workflow rendered within Storybook. The right-rail helper content is mocked by the story.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<SetSharedSecretComponent>;

export const Default: Story = {
  args: {},
};
