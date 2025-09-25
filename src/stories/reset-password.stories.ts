import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';

import { ResetPasswordComponent } from '../app/features/password-management/reset-password/reset-password.component';
import { API_CLIENT } from '../app/lib/api/client.token';
import type { ApiClient } from '../app/lib/api/client.token';
import type { ResetPasswordRequest, ResetPasswordResponse, UserDetails } from '../app/lib/api/models';

class MockApiClient implements ApiClient {
  private readonly response = signal<ResetPasswordResponse>({
    success: true,
    message: 'Password changed successfully.',
  });

  // Unused in this component but required by the interface
  async getUserDetails(): Promise<UserDetails> {
    throw new Error('Not implemented in Storybook mock');
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    console.warn('Mock resetPassword called', request);
    return this.response();
  }

  withResponse(response: ResetPasswordResponse): MockApiClient {
    this.response.set(response);
    return this;
  }
}

const meta: Meta<ResetPasswordComponent> = {
  title: 'Password Management/Reset UMN Password',
  component: ResetPasswordComponent,
  decorators: [
    applicationConfig({
      providers: [{ provide: API_CLIENT, useFactory: () => new MockApiClient() }],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Standalone rendering of the change password workflow. All API interactions are mocked so the form can be exercised in isolation.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<ResetPasswordComponent>;

export const Default: Story = {
  args: {},
};

export const ApiFailure: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: API_CLIENT,
          useFactory: () =>
            new MockApiClient().withResponse({
              success: false,
              message: 'Password reset failed due to backend error.',
            }),
        },
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Simulates the backend responding with an error so downstream UI states (error banner, summary links) can be validated.',
      },
    },
  },
};
