import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor() {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = localStorage.getItem('token');
        let header = {
            'Content-Type' : 'application/json'
        }
        if (token){
            header['Authorization'] = token
            req = req.clone({
                setHeaders: header
            });
        }
        return next.handle(req);
    }
}