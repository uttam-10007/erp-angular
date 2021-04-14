import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';


@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/partyemi";
   }

  async schedulePayment(obj){
    const resp = this.http.post<any>(this.httpUrl + '/addPartyEmi',obj).toPromise().then(res => {
      return res
    });
    return resp

  }

  async getSchedule(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getAllPartyEmi' + obj).toPromise().then(res => {
      return res
    });
    return resp
  }
  async deletePaymentSchedule(obj){
    const resp = this.http.delete<any>(this.httpUrl + '/deletepartyEmi' + obj).toPromise().then(res => {
      return res
    });
    return resp
  }
 

}