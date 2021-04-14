import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class EstimateService {
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/eng/estimate';
   }
  async insertestimate(obj){
    const resp = await this.http.post<any>(this.httpUrl + '/createestimate',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getestimate(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/getestimate'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteestimate(obj){
    const resp = await this.http.delete<any>(this.httpUrl + '/deleteestimate'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateestimate(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updateestimate',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
