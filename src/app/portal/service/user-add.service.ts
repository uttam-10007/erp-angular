import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';

@Injectable({
  providedIn: 'root'
})
export class UserAddService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/usermanagement';
  }
  async getUsersInfo(obj) {

    const resp = await this.http.get(this.httpUrl + '/getUsersInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllUsersInfo(obj) {

    const resp = await this.http.get(this.httpUrl + '/getAllUsersInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addUsers(obj) {

    const resp = await this.http.post(this.httpUrl + '/addUser', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateUsers(obj) {

    const resp = await this.http.put(this.httpUrl + '/updateAssignedProducts', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteUsers(obj) {

    const resp = await this.http.delete(this.httpUrl + '/deleteUser'+ obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


}
