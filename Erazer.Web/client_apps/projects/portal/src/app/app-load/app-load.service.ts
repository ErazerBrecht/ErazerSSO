import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class AppLoadService {

  constructor(private http: HttpClient) { }

  loadAccessToken(): Promise<any> {
    if (isDevMode()) {
      const tokenRequest = new URLSearchParams();

      tokenRequest.set('grant_type', "password");
      tokenRequest.set('username', this.getEnv('username'));
      tokenRequest.set('password', this.getEnv('password'));
      tokenRequest.set('client_id', this.getEnv('client_id') );
      tokenRequest.set('client_secret', this.getEnv('client_secret'));

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/x-www-form-urlencoded'
        })
      }

      return this.http
        .post<string>('http://localhost:5000/connect/token', tokenRequest.toString(), httpOptions)
        .toPromise()
        .then((data: any) => this.saveToken(data.access_token))
        .catch((err: any) => console.log(err));
    }

    return this.http
      .get<string>('/auth/token')
      .toPromise()
      .then((data: any) => this.saveToken(data))
      .catch((err: any) => Promise.resolve());
  }

  private getEnv(name: string){
    if (environment.hasOwnProperty(name))
      return environment[name];
    throw Error('Environment variable is not defined!');
  }

  private saveToken(token: string){
      localStorage.setItem('token', token);
  }
}
