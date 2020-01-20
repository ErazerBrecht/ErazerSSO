import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { OAuthModule, AuthConfig } from 'angular-oauth2-oidc';
import { InitialAuthService } from './auth.service';

@NgModule({
  imports: [
    HttpClientModule,
    OAuthModule.forRoot()
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
