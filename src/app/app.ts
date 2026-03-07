import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor(private router: Router) {}

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
}