import { AuthService } from './auth.service';
import { API_URL } from '../config/api.settings';

interface IInterceptor {
    request: Function;
    requestError: Function;
    response: Function;
    responseError: Function;
}

class AuthenticationInterceptor implements IInterceptor {
    public static $inject = ["$injector", "$q", "logger"];

    public static Factory($injector: ng.auto.IInjectorService, $q: ng.IQService) {
        "ngInject";
        return new AuthenticationInterceptor($injector, $q);
    }

    constructor(private $injector: ng.auto.IInjectorService, private $q: ng.IQService) {
    }

    public request = (requestConfig: ng.IRequestConfig): ng.IRequestConfig => {
        if (requestConfig.url.startsWith(API_URL)) {
            requestConfig.headers = requestConfig.headers || {};
            const token = this.getTokenFromLocalstorage();
            if (token)
                requestConfig.headers.Authorization = 'Bearer ' + token;
        }

        return requestConfig;
    }

    public requestError = (requestFailure): ng.IPromise<any> => {
        return requestFailure;
    }
    public response = (responseSuccess): ng.IPromise<any> => {
        return responseSuccess;
    }
    public responseError = (responseFailure): ng.IPromise<any> => {
        if (responseFailure.status === 401) {
            this.getTokenFromBackend();
        }
        return this.$q.reject(responseFailure);
    }

    private getTokenFromBackend() {
        const authService = this.$injector.get('authService') as AuthService;
        authService.getToken().then(
            t => localStorage.setItem('token', t),
            e => console.log(e));                       // TODO Redirect to REFRESH SESSION URL!
    }

    private getTokenFromLocalstorage() {
        return localStorage.getItem('token');
    }
}

export const httpConfig = ($httpProvider: ng.IHttpProvider) => {
    "ngInject";
    $httpProvider.interceptors.push(AuthenticationInterceptor.Factory);
};