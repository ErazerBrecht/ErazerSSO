import { Component, OnInit } from '@angular/core';
import { LandingService } from './landing.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  motd$: Observable<string>;

  constructor(private service: LandingService) { 
    this.motd$ = this.service.getMotd();
  }
}
