import { Injectable, isDevMode } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private _key: CryptoKeyPair | undefined;

    constructor(private cookieService: CookieService) { }

    public initAuth(): Promise<any> {
        if (isDevMode()) {
            return Promise.resolve();
        }
        return this.initProd();
    }

    public async calculateSign(plain: string) {
        if (this._key === undefined)
            throw new Error("Key is not initiliazed yet!");

        const result = await this.calculateSignWithKey(this._key.privateKey, plain);
        return result;
    }


    private async calculateSignWithKey(key: CryptoKey, plain: string) {
        const encoded = new TextEncoder().encode(plain);
        const signature = await window.crypto.subtle.sign(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            key,
            encoded
        );

        const signBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
        return signBase64;
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
            const epoch = Date.now().toString();
            const endpoint = "/auth/key";
            const body = JSON.stringify({ publicKey: jwk });

            const signature = await this.calculateSignWithKey(key.privateKey, epoch + endpoint + body);

            var result = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-Token': this.cookieService.get('XSRF-TOKEN'),
                    'X-Epoch': epoch,
                    'X-Signature': signature
                },
                body: body
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
