import { Injectable, isDevMode, Inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private router: Router) { }

    addToken(req: HttpRequest<any>): HttpRequest<any> {
        const token = localStorage.getItem('token');
        return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    }

    handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        if (isDevMode()) {
            alert('This should not happen!');       // TODO
            return throwError('Expiration!!'); 
        }
        else
        {
            window.location.href = `/auth/dashboard?redirect=${this.router.url}`;
            return throwError('Redirecting!!');   
        }
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
        return next.handle(this.addToken(req)).pipe(
            catchError((error, test) => {
                if (error instanceof HttpErrorResponse) {
                    switch ((<HttpErrorResponse>error).status) {
                        case 401:
                            return this.handle401Error(req, next);
                    }
                }
            }));
    }
}