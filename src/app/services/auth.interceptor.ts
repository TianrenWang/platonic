import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const BASE_URL = environment.backendUrl;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor() {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
        }
        let token = localStorage.getItem('token');
        if (token && req.url.includes(BASE_URL) === true){
            headers['Authorization'] = token;
        }
        req = req.clone({
            setHeaders: headers
        });
        return next.handle(req);
    }
}