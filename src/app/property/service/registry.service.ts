import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class RegistryService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/registry";
   }

   async  getAllregistered(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getAllregistered' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }



 async  getdetailsForregistry(obj){
  const resp = this.http.get<any>(this.httpUrl + '/getdetailsForregistry' + JSON.stringify(obj)).toPromise().then(res => {
    return res
  });
  return resp
  }


async createregistry(obj){
  const resp = this.http.post<any>(this.httpUrl + '/createregistry',obj).toPromise().then(res => {
    return res
  });
  return resp
  }
async  updateregistry(obj){
    const resp = this.http.put<any>(this.httpUrl + '/updateregistry',obj).toPromise().then(res => {
      return res
    });
    return resp
    }
}
