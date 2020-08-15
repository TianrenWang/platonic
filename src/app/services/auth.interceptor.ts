import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(public authService: AuthService) {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = this.authService.getUserData().token
        let header = {
            'Content-Type' : 'application/json'
        }
        if (token){
            header['Authorization'] = token
        }
        req = req.clone({
            setHeaders: header
        });
        return next.handle(req);
    }
}