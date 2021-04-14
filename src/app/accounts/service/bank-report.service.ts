import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class BankReportService {


  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/report";
  }

  async  getBankReport(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getReport' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
