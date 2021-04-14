import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class HierarchyService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/hierarchy";
  }
  async  getHierarchy(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getHierarchy' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async  createHierarchy(obj){
    const resp = this.http.post<any>(this.httpUrl + '/createHierarchy' ,obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }
 
  async deleteHierarchy(obj){
    const resp = this.http.delete<any>(this.httpUrl + '/deleteHierarchy' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async  updateHierarchy(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/updateHierarchy',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
