import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { AppLoadService } from './app-load.service';

export function loadAccessToken(service: AppLoadService) {
  return () => service.loadAccessToken();
}

@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    AppLoadService,
    { 
      provide: APP_INITIALIZER, 
      useFactory: loadAccessToken,
      deps: [AppLoadService],
      multi: true 
    }
  ]
})
export class AppLoadModule { }
