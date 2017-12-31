import * as angular from 'angular';

import {Home} from './home/home.module';
import {About} from './about/about.module';

export const ComponentsModule: ng.IModule = angular
.module('app.components', [
    Home.name,
    About.name
]);