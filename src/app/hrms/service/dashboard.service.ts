import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { stringify } from 'querystring';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  httpUrl;


  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/hr/hrdata";
  }

  async  getDashBoardCount(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl+'/dashboardcount' +b_acct_id).toPromise().then(res => {

      return res;
    });
    return resp;

  }
  async getSystemDate(){
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/sysAttribute/getSystemDate').toPromise().then(res => {
      return res;
    });
    return res;
  }
}
