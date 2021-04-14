import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/property/party";
  }
  //party-account
  async getAccountdetail(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getaccountinfo' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createAccountDetail(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createaccountinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deleteAccount(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/deleteaccountinfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateAccountDetail(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateaccountinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

//Party-detail

  async getPartydetail(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getpartyinfo' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }
  async getPartyShortdetails(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getpartyshortdetails' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createParty(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createpartyinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deleteParty(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/deletepartyinfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateParty(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updatepartyinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }




  //Nominee-info


  async getNomineedetail(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getnomineeinfo' + b_acct_id).toPromise().then(res => {
      return res
    });
    return resp
  }

  async createNomineeDetail(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createnomineeinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deleteNominee(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/deletenomineeinfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateNomineeDetail(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updatenomineeinfo', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  getAllbookletapplied

  async getApplicationapplied(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/getAllApplications'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getarrangementinfo(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/getarrangementinfo'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getDistinctPropertyInfo(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/getAllpropertytype'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  

  async getapplicationreport(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/property/application/getapplicationreport'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //BookletPurchase
  async addBookletPurchase(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/addBookletPurchase', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateBookletPurchase(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateBookletPurchase', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllbookletpurchase(b_acct_id) {
    const resp = this.http.get<any>(this.httpUrl + '/getAllbookletpurchase' + b_acct_id).toPromise().then(res => {
     
      return res
    });
    return resp
  }
  async getAllAllotment(obj) {
    const resp = this.http.get<any>(this.main.httpUrl + '/property/allotment/getAllAllotment' + obj).toPromise().then(res => {
     
      return res
    });
    return resp
  }
  async createAllotment(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/property/allotment/createAllotment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateAllotment(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl + '/property/allotment/updateAllotment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

async getDataForAllotment(obj) {
  const resp = this.http.get<any>(this.main.httpUrl + '/property/allotment/getDataForAllotment' + obj).toPromise().then(res => {
   
    return res
  });
  return resp
}


  async getArrinfoForInvoice(obj){
    const resp = await this.http.get<any>(this.httpUrl + '/getArrinfoForInvoice'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

}