import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class InitialAuthService {

    private _key: CryptoKeyPair | undefined;

    constructor() { }

    public initAuth(): Promise<any> {
        if (isDevMode()) {
            return this.initDev();
        }
        return this.initProd();
    }

    public getKey() {
        return this._key;
    }

    private async initDev() {
        console.log('TODO');
    }

    private async initProd(): Promise<any> {
        // Dispatch to store in non PoC
        this._key = await window.crypto.subtle.generateKey(
            {
                name: "RSA-PSS",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            false,
            ["sign"]
        );

        const jwk = await window.crypto.subtle.exportKey('jwk', this._key.publicKey);

        try {
            var result = await fetch('/auth/key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ publicKey: jwk })
            });

            if (!result.ok) {
                throw new Error();
            }
        } catch (err) {
            console.error('Something went wrong providing public key to BFF');
            window.location.href = "/auth/login";
            return Promise.reject('Redirecting...');
        }
    }


}
