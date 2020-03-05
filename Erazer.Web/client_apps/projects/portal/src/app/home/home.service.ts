import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResultModel } from '../models/result';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class HomeService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.api;
   }

  public getResults(): Observable<Array<ResultModel>> {
    return this.http.get<Array<ResultModel>>(`${this.baseUrl}/results`);
  }
}
