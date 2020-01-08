import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs'; 
import { tap } from "rxjs/operators";
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

const CACHE_KEY = makeStateKey('MOTD');

@Injectable()
export class LandingService {
  private baseUrl: string;

  constructor(private http: HttpClient, private state: TransferState) {
    this.baseUrl = `http://${environment.host}:5002/api`;
   }

  getMotd(): Observable<string> {
    let cache = this.state.get(CACHE_KEY, null) as string;
    if (!cache) {
      return this.http.get<string>(`${this.baseUrl}/public`)
      .pipe(
        tap(data => this.state.set(CACHE_KEY, data))
      );
    }
    else {
      return new BehaviorSubject(cache);
    }
  }
}
