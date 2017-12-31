import { API_URL } from '../../config/api.settings';
import { IResult } from '../../models/result.models';
import IHttpService = angular.IHttpService;
import IQService = angular.IQService;
import IPromise = angular.IPromise;
import IHttpResponse = angular.IHttpResponse;

export class HomeService {
    static $inject = ['$http', '$q'];
    
    constructor(private $http: IHttpService) {
    }

    getResults(): IPromise<IResult[]>{
        return this.$http.get(`${API_URL}/results`)
            .then(response => response.data as IResult[]);
    }
}