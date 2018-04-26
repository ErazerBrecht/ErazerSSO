import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable'; 
import { BehaviorSubject } from 'rxjs/BehaviorSubject'; 
import { makeStateKey, TransferState } from '@angular/platform-browser';
import 'rxjs/add/operator/do';

const CACHE_KEY = makeStateKey('MOTD');

@Injectable()
export class LandingService {

  constructor(private http: HttpClient, private state: TransferState) { }

  getMotd(): Observable<string> {
    let cache = this.state.get(CACHE_KEY, null) as string;
    if (!cache) {
      return this.http.get<string>('http://localhost:5002/api/public').do(data => this.state.set(CACHE_KEY, data));
    }
    else {
      return new BehaviorSubject(cache);
    }
  }
}
