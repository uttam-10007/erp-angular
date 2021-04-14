import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';


@Injectable({
  providedIn: 'root'
})
export class RefundService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/refund";
  }

  async getRefundGenerate(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/getdataforgeneraterefund'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getrefunds(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/getrefunds'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async generateRefund(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/generaterefund',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

}