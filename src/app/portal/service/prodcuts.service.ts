import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class ProdcutsService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/portal';
  }
  async addProducts(obj){
    const resp = await this.http.post<any>(this.httpUrl + '/addProducts', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async removeProduct(obj){
    const resp = await this.http.delete<any>(this.httpUrl + '/removeProduct'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
