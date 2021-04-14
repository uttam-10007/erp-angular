import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PropertyInfoService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/propertyTypeInfo";
  }

  async getAllPropertyType(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getAllPropertyTypeInfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async getPropertyTypeCost(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getPropertyTypeCost' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async getAllPropertyTypeCost(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getAllPropertyTypeCost' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async createPropertyType(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createPropertyTypeInfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updatePropertyType(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updatePropertyTypeInfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateCost(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updatescheme', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
