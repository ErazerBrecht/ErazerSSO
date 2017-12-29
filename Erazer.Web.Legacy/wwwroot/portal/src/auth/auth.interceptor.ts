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

    public static Factory($injector: ng.auto.IInjectorService, $q: ng.IQService, $window: ng.IWindowService) {
        "ngInject";
        return new AuthenticationInterceptor($injector, $q, $window);
    }

    constructor(private $injector: ng.auto.IInjectorService, private $q: ng.IQService, private $window: ng.IWindowService) {
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
    public responseError = <T>(responseFailure: ng.IHttpPromiseCallbackArg<T>): ng.IPromise<any> => {
        if (responseFailure.status === 401) {
            const $http = this.$injector.get('$http');            
            const deferred = this.$q.defer();
            const promise = deferred.promise.then(() => $http(responseFailure.config))

            this.getTokenFromBackend().then(() => {
                console.log('Successfully retrieve a new access_token');                
                console.log('Retrying original call');
                deferred.resolve();
             }, e => {
                const dashboardUrl = `${this.$window.location.origin}/dashboard?returnRoute=${this.$window.location.hash}`;
                this.$window.location.href = dashboardUrl;
             });

             return promise;
        }
        return this.$q.reject(responseFailure);
    }

    private getTokenFromBackend(): ng.IPromise<void> {
        const authService = this.$injector.get('authService') as AuthService;
        return authService.getToken().then(t => localStorage.setItem('token', t));                       
    }

    private getTokenFromLocalstorage() {
        return localStorage.getItem('token');
    }
}

export const httpConfig = ($httpProvider: ng.IHttpProvider) => {
    "ngInject";
    $httpProvider.interceptors.push(AuthenticationInterceptor.Factory);
};