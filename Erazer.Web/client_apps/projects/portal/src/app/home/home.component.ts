import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Observable } from 'rxjs';
import { ResultModel } from '../models/result';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public results: Observable<Array<ResultModel>>

  constructor(private service: HomeService) { }

  ngOnInit() {
    // TODO Create custom RxJS pipe
    this.results = this.service.getResults().pipe(startWith([undefined, undefined]));
  }
}
