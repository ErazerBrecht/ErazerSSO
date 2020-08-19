import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IResultDto } from '../models/result';
import { Observable } from 'rxjs';

@Injectable()
export class HomeService {

  constructor(private http: HttpClient) {
   }

  public getResults(): Observable<Array<IResultDto>> {
    return this.http.get<Array<IResultDto>>(`/api/results`);
  }
}
