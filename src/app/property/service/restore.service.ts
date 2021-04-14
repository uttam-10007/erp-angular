import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class RestoreService {
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/restore";
   }

async  getAllcancelled(obj){
  const resp = this.http.get<any>(this.httpUrl + '/getAllcancelled' + JSON.stringify(obj)).toPromise().then(res => {
    return res
  });
  return resp
  }
  async  getAllPaymentType(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getAllPaymentType' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
    }
  async  restoreAtCurrentRate(obj){
    const resp = this.http.put<any>(this.httpUrl + '/restoreAtCurrentRate' ,obj).toPromise().then(res => {
      return res
    });
    return resp
    }
    async  restoreAtNewRate(obj){
      const resp = this.http.post<any>(this.httpUrl + '/restoreAtNewRate' ,obj).toPromise().then(res => {
        return res
      });
      return resp
      }
}

