import '@angular/localize/init';
import { enableProdMode } from '@angular/core';

export { AppServerModule } from './app/app-server.module';
export { ngExpressEngine } from '@nguniversal/express-engine';
export { renderModule, renderModuleFactory } from '@angular/platform-server';

enableProdMode();
