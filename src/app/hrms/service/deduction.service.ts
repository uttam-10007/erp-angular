import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class DeductionService {
  httpUrl;


  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/hr";
  }

  async  getBill(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/payroll_info/bill/getBill' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getTdsReport(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/payroll_info/bill/getTdsReport' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
