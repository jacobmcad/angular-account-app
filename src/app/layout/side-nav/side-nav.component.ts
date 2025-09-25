import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// use '@/environments/environment' if you have an alias
import { environment } from '../../../environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type FeatureKey = keyof typeof environment.features;

interface NavItem {
  label: string;
  route?: string;        // leaf link
  children?: NavItem[];  // group
  expanded?: boolean;    // UI state
  flag?: FeatureKey;     // feature flag key
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
})
export class SideNavComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  // base list (original references kept)
  items: NavItem[] = [
    { label: 'User Details', route: '', flag: 'user' },

    {
      label: 'Password Management',
      flag: 'password',
      expanded: false,
      children: [
        { label: 'Reset Your UMN Password', route: '/password/reset', flag: 'password' },
        { label: 'Set UMN Password Reset Questions', route: '/password/questions', flag: 'password' },
        { label: 'Set Shared Secret', route: '/password/shared-secret', flag: 'password' },
        { label: 'Prevent UMN Password Resets By Phone', route: '/password/prevent-phone', flag: 'password' },
      ],
    },

    {
      label: 'Duo Security',
      flag: 'duo',
      expanded: false,
      children: [
        { label: 'Duo Details', route: '/duo/details', flag: 'duo' },
        { label: 'Generate Duo Bypass Codes', route: '/duo/bypass', flag: 'duo' },
        { label: 'Enable Duo Security', route: '/duo/enable', flag: 'duo' },
      ],
    },

    {
      label: 'Google',
      flag: 'google',
      expanded: false,
      children: [
        { label: 'Google Details', route: '/google/details', flag: 'google' },
        { label: 'Create Personal Google Group', route: '/google/group', flag: 'google' },
      ],
    },

    {
      label: 'Additional Accounts',
      flag: 'accounts',
      expanded: false,
      children: [
        { label: 'Associated Details', route: '/accounts/details', flag: 'accounts' },
        { label: 'ORCID iD', route: '/accounts/orcid', flag: 'accounts' },
      ],
    },

    { label: 'Set WWW URL', route: '/www-url', flag: 'www' },
  ];

  // the list actually rendered (stable ref)
  navItems: NavItem[] = [];

  constructor() {
    this.applyFeatureFlagsInPlace();
    this.expandGroupsForUrl(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(event => this.expandGroupsForUrl(event.urlAfterRedirects));
  }

  private isEnabled(item: NavItem): boolean {
    return !item.flag || !!environment.features[item.flag];
  }

  // filter parents & children IN-PLACE to keep references stable
  private applyFeatureFlagsInPlace(): void {
    // filter parents
    this.items = this.items.filter(i => this.isEnabled(i));
    // filter children (don’t recreate parent objects)
    for (const g of this.items) {
      if (g.children) {
        g.children = g.children.filter(c => this.isEnabled(c));
      }
    }
    this.navItems = this.items; // stable reference for *ngFor
  }

  toggle(item: NavItem): void {
    item.expanded = !item.expanded; // simple, working behavior
  }

  idFor(label: string): string {
    return 'sub-' + label.toLowerCase().replace(/\s+/g, '-');
  }

  private expandGroupsForUrl(url: string): void {
    for (const item of this.items) {
      if (!item.children) {
        continue;
      }

      const hasActiveChild = item.children.some(child => child.route && url.startsWith(child.route));

      if (hasActiveChild) {
        item.expanded = true;
      }
    }
  }
}
