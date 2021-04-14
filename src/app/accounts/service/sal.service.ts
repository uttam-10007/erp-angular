import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class SalService {

  
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/metadata';
  }


  async getSal(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/metadata/eventlayout/getsal'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateSystemRecords(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/metadata/records/updateSystemRecords',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async getFields(obj){
    const resp = await this.http.get<any>(this.httpUrl + '/fields/getfields'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getmaxlclno(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/account/ip/arrgetmaxlclno'+obj).toPromise().then(res => {
    return res;
    });
    return resp;
    }


  
}
