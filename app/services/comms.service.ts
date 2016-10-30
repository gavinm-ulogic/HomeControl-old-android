import { Injectable } from '@angular/core';
// import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Logger } from './logger.service';

@Injectable()
export class CommsService {

  private BASE_URL: string  = 'http://192.168.0.35/MillControl/api/';

  constructor(
    private logger: Logger,
    private http: Http) {}


    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        // this.logger.error('An error occurred:' + error);
        return Promise.reject(error.message || error);
    }

    private handleResponse(response: any): Promise<any> {
        let test: any = response.json();
        return Promise.resolve(test);
    }

    getFromServer(url: string) {
        let fullUrl = this.BASE_URL + url;

        return this.http.get(fullUrl)
                .toPromise()
                .then(this.handleResponse)
                .catch(this.handleError);
    }

    postToServer(url: string, item: any) {
        let fullUrl = this.BASE_URL + url;

        return this.http.post(fullUrl, item)
                .toPromise()
                .then(this.handleResponse)
                .catch(this.handleError);
    }

    putToServer(url: string, item: any) {
        let fullUrl = this.BASE_URL + url;

        return this.http.put(fullUrl, item)
                .toPromise()
                .then(this.handleResponse)
                .catch(this.handleError);
    }

    deleteFromServer(url: string) {
        let fullUrl = this.BASE_URL + url;

        return this.http.delete(fullUrl)
                .toPromise()
                .then(this.handleResponse)
                .catch(this.handleError);
    }

}
