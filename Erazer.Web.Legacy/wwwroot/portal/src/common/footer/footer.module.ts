import { StateProvider } from 'angular-ui-router';
import * as angular from 'angular';
import { FooterComponent } from './footer.component';

export const FooterModule: ng.IModule = angular
    .module('common.footer', [])
    .component('footer', new FooterComponent);