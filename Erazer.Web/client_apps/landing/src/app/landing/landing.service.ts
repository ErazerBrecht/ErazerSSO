import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs'; 
import { tap } from "rxjs/operators";
import { makeStateKey, TransferState } from '@angular/platform-browser';

const CACHE_KEY = makeStateKey('MOTD');

@Injectable()
export class LandingService {

  constructor(private http: HttpClient, private state: TransferState) { }

  getMotd(): Observable<string> {
    let cache = this.state.get(CACHE_KEY, null) as string;
    if (!cache) {
      return this.http.get<string>('http://localhost:5002/api/public')
      .pipe(
        tap(data => this.state.set(CACHE_KEY, data))
      );
    }
    else {
      return new BehaviorSubject(cache);
    }
  }
}
