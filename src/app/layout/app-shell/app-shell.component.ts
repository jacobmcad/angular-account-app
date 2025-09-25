import { Component, computed, signal, inject } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { RightRailService } from '../right-rail.service';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SideNavComponent],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css']
})
export class AppShellComponent {
  private readonly rightRail = inject(RightRailService);
  readonly refreshPanelOpen = signal(true);
  readonly activeRailTemplate = computed<TemplateRef<unknown> | null>(() => this.rightRail.template());

  toggleRefreshPanel(): void {
    this.refreshPanelOpen.update(open => !open);
  }
}
