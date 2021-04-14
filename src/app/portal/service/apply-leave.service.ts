import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
@Injectable({
  providedIn: 'root'
})
export class ApplyLeaveService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/portal';
  }




  async  getAllRules(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/leaveRule/getAllRules' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getAllLeaveLedger(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/leaveLedger/getLeaveRecords' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getLeaveInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/leaveInfo/getLeaveInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async applyForLeave(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/hr/leaveLedger/applyForLeave' + obj, "").toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async  getUploadedFileData(obj) {
    const resp = await this.http.post(this.main.httpUrl + '/hr/establishment_info/uploadfile/getUploadedFileData', obj, { responseType: 'blob' }).toPromise().then(res => {
      return res;
    });
    if (resp) {
      return resp;
    }
  }
}
