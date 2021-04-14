import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class SalaryBillService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/account/ap/salaryBill";
   }
   async  getAllSalaryBills(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getSalaryBill' + obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }
  async  changeStatusOfSalaryBill(obj){
    const resp = this.http.put<any>(this.httpUrl + '/changePaymentStatus' ,obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }
}
