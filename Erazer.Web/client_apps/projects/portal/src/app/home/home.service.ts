import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IResultDto } from '../models/result';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class HomeService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.bff + "/api";
   }

  public getResults(): Observable<Array<IResultDto>> {
    return this.http.get<Array<IResultDto>>(`${this.baseUrl}/results`);
  }
}
