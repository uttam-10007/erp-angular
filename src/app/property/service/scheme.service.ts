import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SchemeService {
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/scheme";
  }

  async getScheme(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getscheme' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createScheme(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createscheme', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  // async deleteScheme(obj) {
  //   const resp = await this.http.delete<any>(this.httpUrl + '/deleteScheme' + JSON.stringify(obj)).toPromise().then(res => {
  //     return res;
  //   });
  //   return resp;
  // }

  async updatescheme(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updatescheme', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
