import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class InstallmentService {
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/installment";
   }

   async  getAllInstallmentPayments(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getAllInstallmentPayments' + JSON.stringify(obj)).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }

  async getInstallmentPaymentdata(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getInstallmentPaymentdata' + JSON.stringify(obj)).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }

  async createInstallmentPayments(obj){
    const resp = this.http.post<any>(this.httpUrl + '/createInstallmentPayments' ,obj).toPromise().then(res => {
      return res
    });
    return resp
  }

  async updateInstallmentPayment(obj){
    const resp = this.http.put<any>(this.httpUrl + '/updateInstallmentPayment' ,obj).toPromise().then(res => {
      return res
    });
    return resp
  }
}
