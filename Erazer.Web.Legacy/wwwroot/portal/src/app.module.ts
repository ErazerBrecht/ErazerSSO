import * as angular from 'angular';
import { IUrlRouterProvider, IStateProvider } from 'angular-ui-router';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ComponentsModule } from './components/components.module';

import './app.scss';


function routeConfig($locationProvider: ng.ILocationProvider, $urlRouterProvider: IUrlRouterProvider, $stateProvider: IStateProvider) {
    "ngInject";

    $stateProvider.state('app', {
        redirectTo: 'app.home',
    });

    //$locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
}

function themeConfig($mdThemingProvider: ng.material.IThemingProvider) {
    "ngInject";

    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('green');
}

export const App: ng.IModule = angular
    .module('app', [
        'ui.router',
        'ngMessages',
        'ngMaterial',
        'ngAria',
        'ngAnimate',
        'md.data.table',
        AuthModule.name,
        CommonModule.name,
        ComponentsModule.name
    ])
    .config(routeConfig)
    .config(themeConfig)
    .component('app', new AppComponent);