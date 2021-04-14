import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  httpUrl;


  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/hr/setting";
  }
  //fields
  async getFields(obj){
  
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/fields/getfields'+obj).toPromise().then(res => {
      return res;

    });
    return res;

  }
  async createFields(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/metadata/fields/createField', obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }
   async updateFields(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/metadata/fields/updateField', obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }
   //codeValue
   async getCodeValue(b_acct_id){
    const resp = await this.http.get<any>(this.main.httpUrl + '/metadata/codeValue/getCodeValues'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getFieldCodeValues(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/metadata/codeValue/getFieldCodeValues' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async insertCodeValue(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/metadata/codeValue/createCodeValue',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateCodeValues(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/metadata/codeValue/updateCodeValue',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteCodeValue(obj){
    const resp = await this.http.delete<any>(this.main.httpUrl + '/metadata/codeValue/deleteCodeValue'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
