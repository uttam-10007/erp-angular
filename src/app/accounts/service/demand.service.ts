import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class DemandService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/account/demand";
  }

  async createDemand(obj){
    const res = await this.http.post<any>(this.httpUrl + '/adddemand',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async insertProcessedDemandData(obj){
    const res = await this.http.post<any>(this.httpUrl + '/insertProcessedDemandData',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async  getDemandList(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getdemand' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteDEmand(obj){
    const res = await this.http.delete<any>(this.httpUrl+'/deletedemand'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async updateDemand(obj){
    const res = await this.http.put<any>(this.httpUrl + '/updatedemand',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

}
