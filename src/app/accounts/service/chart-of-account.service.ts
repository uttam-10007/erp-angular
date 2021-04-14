import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})

export class ChartOfAccountService {
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/chartofaccount";
  }
  async  getchartofaccount(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getchartofaccount' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async  createchartofaccount(obj){
    const resp = this.http.post<any>(this.httpUrl + '/createchartofaccount' ,obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }
  async  deleteChartOfAccount(obj){
    const resp = this.http.delete<any>(this.httpUrl + '/deleteChartOfAccount' +obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }

  async deletechartofaccount(obj){
    const resp = this.http.delete<any>(this.httpUrl + '/deletechartofaccount' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async  updatechartofaccount(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/updatechartofaccount',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
