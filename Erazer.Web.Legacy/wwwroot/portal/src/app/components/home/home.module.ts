import * as angular from 'angular';
import { IStateProvider } from 'angular-ui-router';
import { HomeComponent } from './home.component';
import { HomeService } from './home.service';
import { NavService, NavItem } from './../../common/nav/nav.service';

function routeConfig($stateProvider: IStateProvider,) {
    "ngInject";

    $stateProvider
        .state('app.home', {
            url: '/',
            component: 'home'
        });

}
function runConfig(NavService: NavService) {
    "ngInject";
    const page: NavItem = {
        state: 'app.home',
        url: '/',
        label: 'Home'
    };
        
    NavService.addNavItem(page);

}

export const Home: ng.IModule = angular
    .module('components.home', [

    ])
    .config(routeConfig)
    .run(runConfig)
    .service('homeService', HomeService)
    .component('home', new HomeComponent);
    