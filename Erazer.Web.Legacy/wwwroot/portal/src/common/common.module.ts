import * as angular from 'angular';
import { NavModule } from './nav/nav.module';
import { FooterModule } from './footer/footer.module';

export const CommonModule: ng.IModule = angular
  .module('app.common', [
    NavModule.name,
    FooterModule.name
  ]);