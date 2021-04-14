import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';



@Injectable({
  providedIn: 'root'
})
export class ArInvoiceService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/account/ar";
   }



  async  getinvoice(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getarinvoice' + JSON.stringify(obj)).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }
  async  approve(obj){
    const resp = this.http.put<any>(this.httpUrl + '/approvestatus' ,obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }

  async  createARinvoice(obj){
    const resp = this.http.post<any>(this.httpUrl + '/createARinvoice' ,obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }
}
