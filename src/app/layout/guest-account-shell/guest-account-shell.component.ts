import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RightRailService } from '../right-rail.service';

interface GuestNavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-guest-account-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './guest-account-shell.component.html',
  styleUrls: ['./guest-account-shell.component.css'],
})
export class GuestAccountShellComponent {
  private readonly rightRail = inject(RightRailService);

  readonly navItems: GuestNavItem[] = [
    { label: 'Create Guest Account', route: 'create-guest-acct' },
    { label: 'Claim Account', route: 'claim-acct' },
    { label: 'Recover Your UMN Password', route: 'recover-password' },
    { label: 'Recover Internet ID', route: 'recover-internet-id' },
  ];

  readonly activeRailTemplate = computed(() => this.rightRail.template());
}
