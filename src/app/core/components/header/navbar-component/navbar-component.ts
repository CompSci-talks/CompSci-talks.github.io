import { Component, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AUTH_SERVICE } from '../../../contracts/auth.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-surface-card border-b border-border shadow-sm sticky top-0 z-50">
      <div class="container-main h-16 flex items-center justify-between">

        <!-- Logo -->
        <a routerLink="/" class="text-xl font-bold text-primary tracking-tight flex-shrink-0">
          CompSci Talks
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-6">
          <a routerLink="/schedule" routerLinkActive="text-primary font-semibold border-b-2 border-primary"
             class="text-sm font-medium text-text-muted hover:text-primary transition-colors pb-0.5">
            Schedule
          </a>
          <a routerLink="/archive" routerLinkActive="text-primary font-semibold border-b-2 border-primary"
             class="text-sm font-medium text-text-muted hover:text-primary transition-colors pb-0.5">
            Archive
          </a>

          @if (auth.currentUser$ | async; as user) {
            <a routerLink="/profile" routerLinkActive="text-primary font-semibold border-b-2 border-primary"
              class="text-sm font-medium text-text-muted hover:text-primary transition-colors pb-0.5">
              My Profile
            </a>

            <a routerLink="/dashboard" routerLinkActive="text-primary font-semibold border-b-2 border-primary"
               class="text-sm font-medium text-text-muted hover:text-primary transition-colors pb-0.5">
              Dashboard
            </a>

            <!-- User dropdown -->
            <div class="relative" data-dropdown>
              <button (click)="toggleDropdown()"
                      class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  <img
                    class="w-8 h-8 rounded-full"
                    [src]="(user.photo_url && user.photo_url.trim()) ? user.photo_url : 'https://ui-avatars.com/api/?name=' + user.display_name"
                    alt="{{user.display_name}} image"
                  >
                </div>
                <span class="text-sm font-medium text-text-main">{{ user.display_name }}</span>
                <svg class="w-4 h-4 text-text-muted transition-transform duration-200"
                     [class.rotate-180]="dropdownOpen()"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              @if (dropdownOpen()) {
                <div class="absolute right-0 mt-2 w-48 bg-surface-card border border-border rounded-xl shadow-lg py-1 z-50">
                  <div class="px-4 py-2 border-b border-border">
                    <p class="text-xs font-semibold text-text-main truncate">{{ user.display_name }}</p>
                    <p class="text-xs text-text-muted truncate">{{ user.email }}</p>
                    <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                      [class.badge-role-admin]="user.role === 'admin'"
                      [class.badge-role-moderator]="user.role === 'moderator'"
                      [class.badge-role-user]="user.role === 'authenticated'"
                    >{{ user.role }}</span>
                  </div>
                  <a routerLink="/profile" (click)="closeDropdown()"
                    class="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-primary hover:bg-surface-muted transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    My Profile
                  </a>
                  <a routerLink="/dashboard" (click)="closeDropdown()"
                     class="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-primary hover:bg-surface-muted transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"/>
                    </svg>
                    Dashboard
                  </a>
                  @if (user.role === 'admin') {
                    <a routerLink="/admin" (click)="closeDropdown()"
                       class="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-primary hover:bg-surface-muted transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Admin Panel
                    </a>
                  }
                  <div class="border-t border-border mt-1 pt-1">
                    <button (click)="logout()"
                            class="flex items-center gap-2 w-full px-4 py-2 text-sm text-status-error hover:bg-status-error/5 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              }
            </div>

          } @else if (!(auth.isInitialized$ | async)) {
            <!-- Desktop loading skeleton -->
            <div class="flex items-center gap-4">
              <div class="h-4 w-16 bg-skeleton rounded animate-pulse"></div>
              <div class="w-8 h-8 rounded-full bg-skeleton animate-pulse"></div>
            </div>

          } @else {
            <a routerLink="/login" class="btn btn-primary py-1.5 px-4 text-sm">Login</a>
            <a routerLink="/register" class="btn btn-outline py-1.5 px-4 text-sm">Register</a>
          }
        </nav>

        <!-- Mobile right side -->
        <div class="flex md:hidden items-center gap-3">
          @if (auth.currentUser$ | async; as user) {
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              <img
                class="w-8 h-8 rounded-full"
                [src]="(user.photo_url && user.photo_url.trim()) ? user.photo_url : 'https://ui-avatars.com/api/?name=' + user.display_name"
                alt="{{user.display_name}} image"
              >
            </div>
          } @else if (!(auth.isInitialized$ | async)) {
            <div class="w-8 h-8 rounded-full bg-skeleton animate-pulse"></div>
          }

          <button (click)="toggleMobile()" class="text-text-muted hover:text-primary transition-colors">
            @if (mobileOpen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <div class="md:hidden border-t border-border bg-surface-card px-4 py-4 space-y-1">
          <a routerLink="/schedule" routerLinkActive="text-primary font-semibold bg-surface-muted"
             (click)="closeMobile()"
             class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-primary hover:bg-surface-muted transition-colors">
            Schedule
          </a>
          <a routerLink="/archive" routerLinkActive="text-primary font-semibold bg-surface-muted"
             (click)="closeMobile()"
             class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-primary hover:bg-surface-muted transition-colors">
            Archive
          </a>

          @if (auth.currentUser$ | async; as user) {

            <a routerLink="/profile" routerLinkActive="text-primary font-semibold bg-surface-muted"
              (click)="closeMobile()"
              class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-primary hover:bg-surface-muted transition-colors">
              My Profile
            </a>
            <a routerLink="/dashboard" routerLinkActive="text-primary font-semibold bg-surface-muted"
               (click)="closeMobile()"
               class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-primary hover:bg-surface-muted transition-colors">
              Dashboard
            </a>
            @if (user.role === 'admin') {
              <a routerLink="/admin" routerLinkActive="text-primary font-semibold bg-surface-muted"
                 (click)="closeMobile()"
                 class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-primary hover:bg-surface-muted transition-colors">
                Admin Panel
              </a>
            }
            <div class="border-t border-border mt-2 pt-2">
              <div class="px-3 py-2 mb-1">
                <p class="text-xs font-semibold text-text-main">{{ user.display_name }}</p>
                <p class="text-xs text-text-muted">{{ user.email }}</p>
                <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                  [class.badge-role-admin]="user.role === 'admin'"
                  [class.badge-role-moderator]="user.role === 'moderator'"
                  [class.badge-role-user]="user.role === 'authenticated'"
                >{{ user.role }}</span>
              </div>
              <button (click)="logout()"
                      class="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-status-error hover:bg-status-error/5 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Logout
              </button>
            </div>
          } @else if (!(auth.isInitialized$ | async)) {
            <div class="space-y-2 px-3 py-2">
              <div class="h-4 w-32 bg-skeleton rounded animate-pulse"></div>
              <div class="h-4 w-24 bg-skeleton rounded animate-pulse"></div>
            </div>
          } @else {
            <a routerLink="/login" (click)="closeMobile()"
               class="block w-full text-center btn btn-primary py-2 text-sm mt-2">
              Login
            </a>
            <a routerLink="/register" (click)="closeMobile()"
               class="block w-full text-center btn btn-outline py-2 text-sm mt-2">
              Register
            </a>
          }
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  auth = inject(AUTH_SERVICE);
  private router = inject(Router);

  dropdownOpen = signal(false);
  mobileOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-dropdown]')) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown() { this.dropdownOpen.update(v => !v); }
  closeDropdown() { this.dropdownOpen.set(false); }
  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile() { this.mobileOpen.set(false); }

  logout() {
    this.auth.signOut().subscribe(() => {
      this.closeDropdown();
      this.closeMobile();
      this.router.navigate(['/']);
    });
  }
}