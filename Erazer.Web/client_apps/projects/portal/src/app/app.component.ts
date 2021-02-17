import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() { }

  onLogout() {
    sessionStorage.clear();
    window.location.href = "/auth/logout"

  }
}
