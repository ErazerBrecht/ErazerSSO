import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { InitialAuthService } from './auth.service';

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    InitialAuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: (initialAuthService: InitialAuthService) => () => initialAuthService.initAuth(),
      deps: [InitialAuthService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
})
export class AuthModule { }
