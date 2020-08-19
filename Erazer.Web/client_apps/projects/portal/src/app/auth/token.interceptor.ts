import { Injectable, isDevMode } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InitialAuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private authService: InitialAuthService) { }

    async addSign(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
        const privateKey = this.authService.getKey()?.privateKey;

        if (!privateKey) 
            return next.handle(req).toPromise();

        const epoch = Date.now().toString();
        const encoded = new TextEncoder().encode(epoch);
        const signature = await window.crypto.subtle.sign(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            privateKey,
            encoded
        );

        const signBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
        const newReq = req.clone({ setHeaders: { "X-Epoch": epoch, "X-Signature": signBase64 } });
        return next.handle(newReq).toPromise();
    }

    handle401Error() {
        if (isDevMode()) {
            alert('Session expired/invalid! Press OK to restart a refresh');
            location.reload();
            return throwError('Expiration!!');
        }
        else {
            alert('TODO')
            return throwError('Redirecting!!');
        }
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.addSign(req, next)).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse) {
                    switch ((<HttpErrorResponse>error).status) {
                        case 401:
                            return this.handle401Error();
                    }
                }
                return of(error);
            }));
    }
}