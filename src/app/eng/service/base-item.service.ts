import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class BaseItemService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/eng/baseitem';
  }
  async getbaseitem(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/getbaseitem'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deletebaseitem(obj){
    const resp = await this.http.delete<any>(this.httpUrl + '/deletebaseitem'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async insertbaseitem(obj){
    const resp = await this.http.post<any>(this.httpUrl + '/insertbaseitem',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updatebaseitem(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updatebaseitem',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
