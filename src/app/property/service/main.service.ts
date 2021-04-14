import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(private http: HttpClient) { }
  profileImageUrl;
  codeValueTechObj={};
  accountImageUrl;
  accInfo={}
  codeValueShowObj={};
  //httpUrl="http://localhost:30001";
  //httpUrl="http://139.59.61.84:3000";
  httpUrl="https://vdaerp.svayamtech.com:3000";

  dateFormatChange(date) {
    var datear1 = date.split('T')[0]
    var datearr = datear1.split("-")
    return datearr[2] + '/' + datearr[1] + '/' + datearr[0]
  }
  async getFields(obj){
  
    const res = await this.http.get<any>(this.httpUrl + '/metadata/fields/getfields'+obj).toPromise().then(res => {
      return res;

    });
    return res;

  }
  async getCodeValue(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/metadata/codeValue/getCodeValues'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}

