import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { TokenInterceptor } from './token.interceptor';
import { AuthService } from './auth.service';

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    CookieService,
    AuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: (initialAuthService: AuthService) => () => initialAuthService.initAuth(),
      deps: [AuthService],
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
