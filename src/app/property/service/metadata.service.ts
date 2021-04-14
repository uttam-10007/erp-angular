import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

 
 
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/metadata";
  }

//scheme
  async getScheme(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getscheme' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createScheme(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createscheme', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deleteScheme(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/deleteScheme' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updatescheme(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updatescheme', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  //sub-scheme
  async getsubScheme(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getSubScheme' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createsubScheme(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createSubSubcheme', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updatesubscheme(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateSubScheme', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  //property-info
  async getPropertyInfo(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getAllpropertyinfo' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async getCostEmiInfo(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getCostEmiInfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  
  async createPropertyInfo(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createpropertyinfoWithCostEmi', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deletePropertyInfo(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/propertyinfodelete' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updatePropertyInfo(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updatepropertyinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


//cost
  async getCostInfo(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getcostinfo' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createCostInfo(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createcostinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deleteCostInfo(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/deletecostinfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateCostInfo(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updatecostinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }





//property
  async getProperty(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getproperty' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createProperty(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createproperty', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deleteProperty(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/deleteproperty' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateProperty(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateproperty', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }



//emi-info
  async getAllEMI(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getemiinfo' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createEMI(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createemi', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

 

  async updateEMI(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateemi', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async getPropertyStatus(obj){
    const resp = await this.http.get<any>(this.httpUrl + '/getstatusproperty'+ JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  //resrvation

  async getAllResvations(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getReservationCategories' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createResvation(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createReservationCategory', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

 

  async updateResvation(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateReservationCategory', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  //registarion-fee-charge 

  async getRegistrationFees(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getRegistrationFees' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createRegistrationfee(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createRegistrationfee', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

 

  async updateRegistrationfees(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateRegistrationfees', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

}
