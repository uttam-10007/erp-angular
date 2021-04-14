import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class TransferPropertyService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/transfer";
  }

  async getTransferedProperty(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/gettransferred' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createtransfer(obj) {
    const resp = this.http.post<any>(this.httpUrl + '/createtransfer' ,obj).toPromise().then(res => {
      return res
    });
    return resp
  }

  async getdetailsForTransfer(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getdetailsForTransfer'  + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
}
