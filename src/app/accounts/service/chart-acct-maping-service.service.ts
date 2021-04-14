import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class ChartAcctMapingServiceService {


  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/relation";
  }


  async  getRelationList(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getRelationList' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  updateRelation(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/updaterelation',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteRelation(obj){
    const res = await this.http.delete<any>(this.httpUrl + '/deleteRelation'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
   async createRelation(obj){
    const res = await this.http.post<any>(this.httpUrl + '/createrelation',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
}
