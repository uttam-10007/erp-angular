import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

 
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/budget";
  }
 
  async  getBudgetInfo(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getBudgetInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  createBudgetVersion(obj) {
    const resp = await this.http.post<any>(this.httpUrl+'/createBudgetVersion',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  updateBudget(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/updateBudget',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  updateAllocationAmount(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/updateAllocationAmount',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  AllocationInactive(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/AllocationInactive',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async  getAllAllocation(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getAllAllocation' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async getActiveFinYear(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/journal/getActiveFinYear'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  
  async getAllFinYear(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/journal/getAllFinYear'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }


  async  getHierarchy(obj){
    const resp = this.http.get<any>(this.main.httpUrl + '/accounts/hierarchy/getHierarchy' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }

  async  createBudgetInfo(obj) {
    const resp = await this.http.post<any>(this.httpUrl+'/createBudgetInfo',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  createAllocation(obj) {
    const resp = await this.http.post<any>(this.httpUrl+'/createAllocation',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  

}
