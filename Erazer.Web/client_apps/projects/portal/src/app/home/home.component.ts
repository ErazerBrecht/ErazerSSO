import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Observable } from 'rxjs';
import { IResultDto } from '../models/result';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public results: Observable<Array<IResultDto | null>>

  constructor(private service: HomeService) {
    // TODO Create custom pipe to 'random generate some null starting values'
    this.results = this.service.getResults().pipe(startWith([null, null]));
  }
}
