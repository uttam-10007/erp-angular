import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class EmbService {
  httpUrl;

  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/eng/fieldmeasurement';
   }
  
   async getFieldMeasurement(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/getfieldmeasurement'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
   async create_Field_meas(obj){
    const resp = await this.http.post<any>(this.httpUrl + '/createfieldmeasurement',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateFieldMeasurement(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updatefieldmeasurement',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteFieldMeasurement(obj){
    const resp = await this.http.delete<any>(this.httpUrl + '/deletefieldmeasurement'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

}

