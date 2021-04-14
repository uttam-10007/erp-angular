import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubSchemeService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/subscheme";
  }


  async getsubScheme(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getSubScheme' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }

  // async createsubScheme(obj) {
  //   const resp = await this.http.post<any>(this.httpUrl + '/createSubSubcheme', obj).toPromise().then(res => {
  //     return res;
  //   });
  //   return resp;
  // }
  async updatesubscheme(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateSubScheme', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
