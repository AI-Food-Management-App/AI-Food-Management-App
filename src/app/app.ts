import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor(private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const nav     = document.getElementById('nav');
        const toggler = document.getElementById('navToggler');
        if (nav?.classList.contains('show')) {
          nav.classList.remove('show');
          toggler?.setAttribute('aria-expanded', 'false');
        }
      });
  }

  logout() {
    this.auth.logout();  // clears token and redirects to /login
  }
}