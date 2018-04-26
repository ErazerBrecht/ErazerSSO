import { Component, OnInit } from '@angular/core';
import { LandingService } from './landing.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})

export class LandingComponent implements OnInit {
  motd$: Observable<string>;

  constructor(private service: LandingService) { }

  ngOnInit() {
    this.motd$ = this.service.getMotd();
  }
}
