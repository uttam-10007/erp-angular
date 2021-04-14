import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class JvService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/jv";
  }


  async  getJvList(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getJvData' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  get_Jrnl_Id_Full_Info(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getJvbyjrnlid' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  UpdateStatus(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/changeStatus',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteJV(obj){
    const res = await this.http.delete<any>(this.httpUrl + '/deletejv'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
   async approveJV(obj){
    const res = await this.http.post<any>(this.httpUrl + '/approvejv',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  
}
