import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class WorkService {

 
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/accounts/work';
  }
  async  getWorkList(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getworkInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  updateWork(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/updateWork',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteWork(obj){
    const res = await this.http.delete<any>(this.httpUrl + '/deleteWork'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
   async createWork(obj){
    const res = await this.http.post<any>(this.httpUrl + '/createWork',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

}
