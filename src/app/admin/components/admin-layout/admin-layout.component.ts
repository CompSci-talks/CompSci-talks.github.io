import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex bg-surface-muted min-h-screen">

      <!-- Sidebar -->
      <aside class="w-64 bg-sidebar-bg text-sidebar-text-active flex flex-col flex-shrink-0 sticky top-0 h-screen">

        <!-- Brand -->
        <div class="px-6 py-5 border-b border-sidebar-border">
          <p class="text-xs font-semibold text-sidebar-text uppercase tracking-widest mb-1">Admin Portal</p>
          <h1 class="text-lg font-bold text-sidebar-text-active tracking-tight">CompSci Talks</h1>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <a routerLink="seminars" routerLinkActive="bg-sidebar-bg-active text-sidebar-text-active"
             class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-text rounded-lg hover:bg-sidebar-bg-hover hover:text-sidebar-text-active transition-colors group">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            </svg>
            Seminar Scheduling
          </a>

          <a routerLink="speakers" routerLinkActive="bg-sidebar-bg-active text-sidebar-text-active"
             class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-text rounded-lg hover:bg-sidebar-bg-hover hover:text-sidebar-text-active transition-colors group">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Speaker Manager
          </a>

          <a routerLink="tags" routerLinkActive="bg-sidebar-bg-active text-sidebar-text-active"
             class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-text rounded-lg hover:bg-sidebar-bg-hover hover:text-sidebar-text-active transition-colors group">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Tag Manager
          </a>

          <a routerLink="moderation" routerLinkActive="bg-sidebar-bg-active text-sidebar-text-active"
             class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-text rounded-lg hover:bg-sidebar-bg-hover hover:text-sidebar-text-active transition-colors group">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Comment Moderation
          </a>

          <a routerLink="feedback" routerLinkActive="bg-sidebar-bg-active text-sidebar-text-active"
             class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-text rounded-lg hover:bg-sidebar-bg-hover hover:text-sidebar-text-active transition-colors group">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Contact Admission
          </a>

          <a routerLink="user-management" routerLinkActive="bg-sidebar-bg-active text-sidebar-text-active"
             class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-text rounded-lg hover:bg-sidebar-bg-hover hover:text-sidebar-text-active transition-colors group">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            User Management
          </a>

          <!-- <a routerLink="email-settings" routerLinkActive="bg-sidebar-bg-active text-sidebar-text-active"
             class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-text rounded-lg hover:bg-sidebar-bg-hover hover:text-sidebar-text-active transition-colors group">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Email Settings
          </a> -->

        </nav>

        <!-- Footer -->
        <div class="px-4 py-4 border-t border-sidebar-border">
          <a routerLink="/" class="flex items-center gap-2 text-xs text-sidebar-text hover:text-sidebar-text-active transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Public Portal
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0">

        <!-- Top bar -->
        <header class="h-14 bg-sidebar-top-bar-bg border-b border-sidebar-top-bar-border flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-10">
          <span class="text-xs font-semibold text-sidebar-top-bar-text uppercase tracking-widest">Dashboard</span>
          <div class="flex items-center gap-3">
            <span class="text-xs text-sidebar-top-bar-text">Logged in as Admin</span>
            <div class="w-8 h-8 rounded-full bg-sidebar-bg-active flex items-center justify-center overflow-hidden">
              @if (auth.currentUser$ | async; as user) {
                @if (user.photo_url) {
                  <img [src]="user.photo_url" [alt]="user.display_name" class="w-8 h-8 rounded-full object-cover">
                } @else {
                  <span class="text-sidebar-text-active text-xs font-bold">{{ user.display_name.charAt(0).toUpperCase() }}</span>
                }
              }
            </div>
          </div>
        </header>

        <!-- Page content — all admin pages render here with consistent padding -->
        <div class="flex-1 p-8">
          <router-outlet></router-outlet>
        </div>

      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  auth = inject(AUTH_SERVICE);
}
