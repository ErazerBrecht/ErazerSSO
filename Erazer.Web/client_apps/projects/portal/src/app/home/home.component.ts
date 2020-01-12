import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Observable } from 'rxjs';
import { ResultModel } from '../models/result';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public results: Observable<Array<ResultModel>>

  constructor(private service: HomeService) { }

  ngOnInit() {
    this.results = this.service.getResults();
  }
}
