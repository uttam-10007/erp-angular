import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  profileImageUrl;
  accountImageUrl;
  //httpUrl="http://localhost:3001";
  //httpUrl="http://139.59.61.84:3001";
  //httpUrl="http://143.110.244.179:3000";
  //httpUrl="https://vdaerp.svayamtech.com:3000"
  httpUrl="https://vdaerp.svayamtech.com:3000";

  //httpUrl="http://139.59.61.84:3000";
  tasks=0;
  emp_id;
  accInfo={}
  codeValueTechObj={};
  codeValueShowObj={}
  httpUrl1=""
  personalInfoObj={};

  constructor(private http: HttpClient) { 
    this.httpUrl1 = this.httpUrl+"/hr/setting";
  }
  async getCodeValue(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/metadata/codeValue/getCodeValues'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }

}
