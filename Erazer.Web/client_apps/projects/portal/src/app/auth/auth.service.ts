import { Injectable, isDevMode } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InitialAuthService {

    private _key: CryptoKeyPair | undefined;

    constructor(private cookieService: CookieService) { }

    public initAuth(): Promise<any> {
        if (isDevMode()) {
            return Promise.resolve();
        }
        return this.initProd();
    }

    public getKey() {
        return this._key;
    }

    private async initProd(): Promise<any> {
        const key = await window.crypto.subtle.generateKey(
            {
                name: "RSA-PSS",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            false,
            ["sign"]
        );

        const jwk = await window.crypto.subtle.exportKey('jwk', key.publicKey);

        try {
            var result = await fetch('/auth/key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-Token': this.cookieService.get('XSRF-TOKEN')
                },
                body: JSON.stringify({ publicKey: jwk })
            });

            if (!result.ok) {
                throw new Error();
            }

            // Dispatch to store (NgRx / NGXS / ...) in non PoC
            this._key = key;

        } catch (err) {
            console.error('Something went wrong providing public key to BFF');
            window.location.href = "/auth/login";
            return Promise.reject('Redirecting...');
        }
    }


}
