import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class CancellationService {
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/cancellation";
   }
   async  getdataforcancellation(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getdataforcancellation' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async  getcancellations(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getcancellations' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  
  async insertdataforCancellation(obj){
    const resp = this.http.post<any>(this.httpUrl + '/insertdataforCancellation',obj).toPromise().then(res => {
      return res
    });
    return resp

  }
  async updatecancellation(obj){
    const resp = this.http.put<any>(this.httpUrl + '/updatecancellation' ,obj).toPromise().then(res => {
      return res
    });
    return resp
  }
  async updatepaymentstatus(obj){
    const resp = this.http.put<any>(this.httpUrl + '/updatepaymentstatus' ,obj).toPromise().then(res => {
      return res
    });
    return resp
  }

}