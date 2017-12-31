import * as angular from 'angular';
import { httpConfig } from './auth.interceptor';
import { AuthService } from './auth.service';

export const AuthModule: ng.IModule = angular
    .module('app.auth', [])
    .service('authService', AuthService)
    .config(httpConfig);