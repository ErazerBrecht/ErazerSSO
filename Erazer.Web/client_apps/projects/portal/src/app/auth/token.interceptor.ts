import { Injectable, isDevMode } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private oauthService: OAuthService) { }

    addToken(req: HttpRequest<any>): HttpRequest<any> {
        req = req.clone({ withCredentials: true });
        const token = sessionStorage.getItem('access_token');
        return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    }

    handle401Error() {
        if (isDevMode()) {
            alert('This should not happen!');       // TODO
            return throwError('Expiration!!');
        }
        else {
            this.oauthService.initLoginFlow();
            return throwError('Redirecting!!');
        }
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
        return next.handle(this.addToken(req)).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse) {
                    switch ((<HttpErrorResponse>error).status) {
                        case 401:
                            return this.handle401Error();
                    }
                }
            }));
    }
}