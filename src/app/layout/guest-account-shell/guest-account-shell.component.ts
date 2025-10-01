import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RightRailService } from '../right-rail.service';

interface GuestNavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-guest-account-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './guest-account-shell.component.html',
  styleUrls: ['./guest-account-shell.component.css'],
})
export class GuestAccountShellComponent {
  private readonly router = inject(Router);
  private readonly rightRail = inject(RightRailService);

  readonly showNav = environment.features.guestNav !== false;
  readonly activeRailTemplate = computed(() => this.rightRail.template());
  readonly refreshPanelOpen = signal(false);

  readonly navItems: GuestNavItem[] = [
    { label: 'Create Guest Account', path: '/create-guest-acct' },
    { label: 'Claim Account', path: '/claim-acct' },
    { label: 'Recover Your UMN Password', path: '/recover-password' },
    { label: 'Recover Internet ID', path: '/recover-internet-id' },
  ];

  isActive(path: string): boolean {
    if (this.router.url === path) {
      return true;
    }
    return this.router.url.startsWith(`${path}/`);
  }
}
