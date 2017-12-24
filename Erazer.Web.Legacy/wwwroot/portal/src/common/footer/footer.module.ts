import { StateProvider } from 'angular-ui-router';
import * as angular from 'angular';
import { FooterComponent } from './footer.component';

export const FooterModule: ng.IModule = angular
    .module('common.footer', [])
    .config(($stateProvider: StateProvider) => {
        "ngInject";

    })
    .component('footer', new FooterComponent);