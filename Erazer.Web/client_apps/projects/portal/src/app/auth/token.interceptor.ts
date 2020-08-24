import { Injectable, isDevMode } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) { }

    async addSign(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
        if (isDevMode()) {
            const newReq = req.clone({ withCredentials: true });
            return next.handle(newReq).toPromise();
        }
        else {
            try {
                const epoch = Date.now().toString();
                const url = new URL(req.urlWithParams);
                const path = url.pathname.toLowerCase();
                const search = url.search.toLowerCase();

                let plain = epoch + path;
                if (search) {
                    plain = plain + search;
                }

                const signature = await this.authService.calculateSign(plain);
                const newReq = req.clone({ setHeaders: { "X-Epoch": epoch, "X-Signature": signature } });
                return next.handle(newReq).toPromise();
            } catch (e) {
                console.error("Something went wrong while intercepting a request", e);
                return next.handle(req).toPromise();
            }
        }
    }

    async handle401Error() {
        if (isDevMode()) {
            alert('Session expired/invalid! Press OK to start a new session');
            try {
                var respons = await fetch(`${environment.bff}/auth/login/local`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: environment.username, password: environment.password })
                });

                if (!respons.ok) {
                    throw new Error();
                }

                window.location.reload();
                return Promise.resolve('Refreshing page...');
            } catch (err) {
                alert("Couldn't refresh local session...");
                return Promise.reject("Couldn't refresh local session...");
            }
        }
        else {
            console.error('Session is unauthenticated. Refresh session...');
            window.location.href = "/auth/login";
            return Promise.reject('Redirecting...');
        }
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.addSign(req, next)).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse) {
                    switch ((<HttpErrorResponse>error).status) {
                        case 401:
                            return from(this.handle401Error());
                    }
                }
                return of(error);
            }));
    }
}