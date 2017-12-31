import * as angular from 'angular';
import { IStateProvider } from 'angular-ui-router';
import { AboutComponent } from './about.component';
import { NavService, NavItem } from './../../common/nav/nav.service';


function routeConfig($stateProvider: IStateProvider) {
    "ngInject";


    $stateProvider
        .state('app.about', {
            url: '/about',
            component: 'about'
        });

}
function runConfig(NavService: NavService) {
    const page: NavItem = {
        state: 'app.about',
        url: '/about',
        label: 'About'
    };

    NavService.addNavItem(page);
}

export const About: ng.IModule = angular
    .module('components.about', [])
    .component('about', new AboutComponent)
    .config(routeConfig)
    .run(runConfig);