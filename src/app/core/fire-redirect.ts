import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  template: `<p>Redirecting...</p>`
})
export class FireRedirect implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    const oobCode = this.route.snapshot.queryParamMap.get('oobCode');

    const queryParams = { oobCode, mode };
    switch (mode) {
      case 'verifyEmail':
        this.router.navigate(['/verify-email'], { queryParams });
        break;
      case 'resetPassword':
        this.router.navigate(['/reset-password'], { queryParams });
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}