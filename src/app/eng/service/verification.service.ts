import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/eng/application';
  }

  async getApplications(obj){
    const resp = await this.http.get<any>(this.httpUrl + '/getApplications'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getUploadedDocuments(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/eng/upload/getUploadedDocuments'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getRefApplications(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/eng/applicationRef/getRefApplications'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async downloadDocument(obj) {

    const resp = await this.http.post(this.main.httpUrl + '/eng/upload/downloadDocument', obj, { responseType: 'blob' }).toPromise().then(res => {
      return res;
    });
    if (resp) {
      return resp;
  }
  }
  async updateApplication(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updateApplication',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteApplication(obj){
    const resp = await this.http.delete<any>(this.httpUrl + '/deleteApplication'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getSystemDate(){
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/sysAttribute/getSystemDate').toPromise().then(res => {
      return res;
    });
    return res;
  }
}
