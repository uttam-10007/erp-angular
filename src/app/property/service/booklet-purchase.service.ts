import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class BookletPurchaseService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/bookletpurchase";
  }


  async getAllbookletpurchase(obj) {
    const resp = this.http.get<any>(this.main.httpUrl + '/property/bookletpurchase/getAllbookletpurchase' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  
  async getScheme(b_acct_id) {
    const resp = this.http.get<any>(this.main.httpUrl + '/property/scheme/getScheme' +b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }
  
  
  async getsubScheme(obj) {
    const resp = this.http.get<any>(this.main.httpUrl + '/property/subscheme/getsubscheme' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  
  
  async changeStatusbookletpurchase(obj) {
    const resp = this.http.put<any>(this.httpUrl + '/changeBookletPurchaseStatus' ,obj).toPromise().then(res => {
      return res
    });
    return resp
  }

}
