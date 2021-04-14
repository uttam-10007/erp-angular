import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class BatchItemService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/eng/batchitem';
  }
  async getbatchitem(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/getbatchitem'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deletebatchitem(obj){
    const resp = await this.http.delete<any>(this.httpUrl + '/deletebatchitem'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async insertbatchitem(obj){
    const resp = await this.http.post<any>(this.httpUrl + '/insertbatchitem',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updatebatchitem(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updatebatchitem',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
