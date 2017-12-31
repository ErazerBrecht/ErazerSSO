import * as angular from 'angular';
import { NavComponent } from './nav.component';
import { NavService } from './nav.service';


export const NavModule: ng.IModule = angular
    .module('common.nav', [])
    .service('NavService', NavService)
    .component('nav', new NavComponent);