import IHttpService = angular.IHttpService;
import ILocationService = angular.ILocationService;
import IPromise = angular.IPromise;
import IHttpResponse = angular.IHttpResponse;
import { MVC_URL } from '../config/api.settings';

export class AuthService {
    BASE_URL: string;

    static $inject = ['$http', '$location'];    
    constructor(private $http: IHttpService, private $location: ILocationService) {
        this.BASE_URL = `${MVC_URL}/auth`;         
    }

    getToken(): IPromise<string>{
        return this.$http.get(`${this.BASE_URL}/token`)
            .then(response => response.data as string);
    }
}