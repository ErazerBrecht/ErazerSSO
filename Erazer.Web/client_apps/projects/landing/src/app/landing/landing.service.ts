import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { environment } from '../../environments/environment';

@Injectable()
export class LandingService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = `http://${environment.host}:5002/api`;
   }

  getMotd(): Observable<string> {
      return this.http.get<string>(`${this.baseUrl}/public`);
  }
}
