import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isDevMode } from '@angular/core';

@Injectable()
export class AppLoadService {

  constructor(private http: HttpClient) { }

  loadAccessToken(): Promise<any> {
    if (isDevMode())
    {
      console.log('Acces token:', 'TODO');
      Promise.resolve();
    }

    return this.http
        .get<string>('/token')
        .toPromise()
        .then((data: any) => console.log('Access token:', data))
        .catch((err: any) => Promise.resolve());
  }
}
