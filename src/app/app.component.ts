import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AUTH_SERVICE } from './core/contracts/auth.interface';
import { ToastComponent } from './core/components/toast/toast.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { BehaviorSubject, filter, map, switchMap, timer, tap, of, Subscription } from 'rxjs';
import { ToastService } from './core/services/toast.service';
import { NavbarComponent } from './core/components/header/navbar-component/navbar-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ToastComponent, FooterComponent, NavbarComponent],
  template: `
    <div class="fixed top-0 left-0 w-full h-progress z-progress bg-transparent pointer-events-none">
      <div class="h-full bg-primary transition-all duration-300 ease-out"
           [style.width]="(isLoading$ | async) ? '100%' : '0%'"
           [class.animate-progress-indeterminate]="isLoading$ | async"></div>
    </div>

    <app-navbar></app-navbar>

    <main class="min-h-screen">
      <router-outlet></router-outlet>
    </main>

    <app-footer></app-footer>
    <app-toast></app-toast>
  `
})
export class AppComponent implements OnInit {
  auth = inject(AUTH_SERVICE);
  private router = inject(Router);
  private toastservice = inject(ToastService);

  isLoading$ = new BehaviorSubject<boolean>(false);
  private slowConnectionSub?: Subscription;

  ngOnInit() {
    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ),
      map(event => event instanceof NavigationStart),
      tap(loading => this.isLoading$.next(loading)),
      switchMap(loading => {
        if (loading) {
          return timer(10000).pipe(
            tap(() => {
              if (this.isLoading$.value) {
                this.toastservice.info('Loading is taking longer than expected. Please check your connection.');
              }
            })
          );
        }
        return of(null);
      })
    ).subscribe();

    this.auth.currentUser$.subscribe(user => {
      console.log('[AppComponent] Current user role:', user?.role);
      const currentUrl = this.router.url;
      const isEntryRoute = currentUrl === '/' || currentUrl === '/login';
      if (user?.role === 'admin' && isEntryRoute) {
        this.router.navigate(['/admin']);
      }
    });
  }

  logout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}