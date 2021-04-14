import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

 
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/metadata';
  }



  async getJournal(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/metadata/eventlayout/getJournal'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateSystemRecords(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/metadata/records/updateSystemRecords',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


 /*  async getJournal(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/metadata/records/getjournal'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateRecordStr(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/updaterecord/updaterecordstructure',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  } */

  async getDomain(obj){
    const resp = await this.http.get<any>(this.httpUrl + '/getdata'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getFields(obj){
    const resp = await this.http.get<any>(this.httpUrl + '/fields/getfields'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async updateJournal(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updateJournal',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
