import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class PropertyDefinitionService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/propertyinfo";
  }
  async  gettypeofproperty(obj){
    const resp = this.http.get<any>(  this.main.httpUrl +'/property/propertytypeinfo/getallpropertytypeinfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async  getproperty(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getproperty' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async createProperty(obj){
    const resp = this.http.post<any>(this.httpUrl +'/createProperty',obj).toPromise().then(res => {
      return res
    });
    return resp
    }

    async deleteproperty(obj){
      const resp = await this.http.delete<any>(this.httpUrl +'/deleteproperty'+JSON.stringify(obj)).toPromise().then(res => {
        return res;
      });
      return resp;
    }
    async  updateProperty(obj){
      const resp = this.http.put<any>(this.httpUrl +'/updateProperty',obj).toPromise().then(res => {
        return res
      });
      return resp
      }
}
