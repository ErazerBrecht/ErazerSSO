import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResultModel } from '../models/result';
import { Observable } from 'rxjs';

@Injectable()
export class HomeService {

  constructor(private http: HttpClient) { }

  public getResults(): Observable<Array<ResultModel>> {
    return this.http.get<Array<ResultModel>>('http://localhost:5002/api/results');
  }
}
