import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  httpUrl;
  profile_data=''
  constructor(private http: HttpClient) {
    //this.httpUrl="http://localhost:3001/portal";
      this.httpUrl="https://vdaerp.svayamtech.com:3000/portal";

   // this.httpUrl="http://139.59.61.84:3000/portal";
   // this.httpUrl="http://143.110.244.179:3000/portal";
   //this.httpUrl="https://vdaerp.svayamtech.com:3000/portal"
    //this.httpUrl = "" + '/portal';
  }
  async signUp(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/signup', obj).toPromise().then(res => {
      return res;
    });
    return resp;

  }
  async login(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/login', obj).toPromise().then(res => {
      return res;
    });
    return resp;

  }

  async loginWithPhoneNumber(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/loginWithPhoneNumber', obj).toPromise().then(res => {
      return res;
    });
    return resp;

  }

  async getDataFromMobileNumberOrEmail(obj){
    const resp = await this.http.get<any>(this.httpUrl + '/getDataFromMobileNumberOrEmail'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
