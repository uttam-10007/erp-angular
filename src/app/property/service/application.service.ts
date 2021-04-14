import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/application";
  }


    //application
async getCoApplicantDetail(obj){
  const resp = this.http.get<any>(this.httpUrl + '/getCoApplicantDetail' + JSON.stringify(obj)).toPromise().then(res => {
    return res
  });
  return resp
}


    async getAllApplications(obj) {
      const resp = this.http.get<any>(this.httpUrl + '/getAllapplication' + JSON.stringify(obj)).toPromise().then(res => {
        return res
      });
      return resp
    }
    async changeApplicationStatus(obj) {
      const resp = await this.http.put<any>(this.httpUrl + '/changeApplicationStatus', obj).toPromise().then(res => {
        return res;
      });
      return resp;
    }
    async getUploadedFileofparty(obj) {

      const resp = await this.http.post(this.httpUrl + '/getUploadedFileofparty', obj, { responseType: 'blob' }).toPromise().then(res => {
        return res;
      });
      if (resp) {
        return resp;
    }
    }

  async  getUploadedFileofcoapplicant(obj){
    const resp = await this.http.post(this.httpUrl + '/getUploadedFileofcoapplicant', obj, { responseType: 'blob' }).toPromise().then(res => {
      return res;
    });
    if (resp) {
      return resp;
  }
    }
}
