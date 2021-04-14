import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl =  this.main.httpUrl+ "/property/auction";
  }
  async createAuction(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/addauction', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllBids(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getallbid' + obj).toPromise().then(res => {
      return res
    });
    return resp
  }
  async updateAuction(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateauction', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllAuction(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getAuctiondata' + obj).toPromise().then(res => {
     
      return res
    });
    return resp
  }
  async deleteauction(obj){
    const resp = await this.http.delete<any>(this.httpUrl +'/deleteauction'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllAuctionApplication(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getapplication' + obj).toPromise().then(res => {
     
      return res
    });
    return resp
  }
}
