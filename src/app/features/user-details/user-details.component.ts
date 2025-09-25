import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { API_CLIENT } from '../../lib/api/client.token';
import type { UserDetails } from '../../lib/api/models';

@Component({
  standalone: true,
  selector: 'app-user-details',
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent {
  private api = inject(API_CLIENT);
  user = signal<UserDetails | null>(null);
  error = signal<string | null>(null);
  loading = signal(true);

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.api.getUserDetails();
      this.user.set(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load user';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
