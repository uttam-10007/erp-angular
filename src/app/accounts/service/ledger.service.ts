import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {

  
  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/journal";
  }

  async getGstOutputReport(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getGstOutputReport'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async getdemandGstInputReport(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getdemandGstInputReport'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async getGstInputReport(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getGstInputReport'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
 
//party
  async  getPartyInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/party/getPartyInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getLedgerReport(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/report/getledgerreport' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  //jrnl listing
async  getJournalList(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/report/getJournalList'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  getAllArrangement(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/account/ip/getsal'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
   //arr listing
   async  getarrList(obj) {
     console.log(obj);
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/report/getarrList'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //get Account Type
  async  getAccountInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/settings/accountInfo/getAccountInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getchartofaccount(obj){
    const resp = this.http.get<any>(this.main.httpUrl + '/accounts/chartofaccount/getchartofaccount'+obj).toPromise().then(res => {
      return res
    });
    return resp
  }
//journal
//*********************************Fin Year*********************************************
async getActiveFinYear(obj){
  const res = await this.http.get<any>(this.httpUrl + '/getActiveFinYear'+obj).toPromise().then(res => {
    return res;
  });
  return res;
}

async getAllFinYear(obj){
  const res = await this.http.get<any>(this.httpUrl + '/getAllFinYear'+obj).toPromise().then(res => {
    return res;
  });
  return res;
}


async  createfinyear(obj) {
  const resp = await this.http.post<any>(this.httpUrl+'/createfinyear',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  updatefinyear(obj) {
  const resp = await this.http.put<any>(this.httpUrl+'/updatefinyear',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

//***************************************************** */

async getMaxJournalLineID(b_acct_id){
  const res = await this.http.get<any>(this.main.httpUrl + '/account/setting/gst/getmaxjrnlid'+b_acct_id).toPromise().then(res => {
    return res;
  });
  return res;
}

async getAllJournalInfo(obj){
    const res = await this.http.get<any>(this.httpUrl + '/getAllJournal'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  //unposted Journal

  async getAllUnpostedJournalInfo(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/account/journal/getAllUnpostedJournal'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async addUnpostedJournal(obj){
    const res = await this.http.post<any>(this.main.httpUrl + '/account/journal/postUnpostedJournal',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async updateUnpostedJournal(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/account/journal/updateUnpostedJournal',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async updateUnpostedJournalStatus(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/account/journal/updateUnpostedJournalStatus',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async deleteUnpostedJournal(obj){
    const res = await this.http.delete<any>(this.main.httpUrl + '/account/journal/deleteUnpostedJournal'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async getJournalDetail(obj){
    const res = await this.http.get<any>(this.httpUrl + '/getJournalDetail'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  
  async postingJournal(obj){
    const res = await this.http.post<any>(this.main.httpUrl + '/account/Journal/postjournal',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async  getevents(obj){
    const resp = this.http.get<any>(this.main.httpUrl + '/account/event/getevents' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  

  ///////////////////////////

  async getTrailBalance(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/gettrailbalance'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async getDrillDownTrailBalance(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getDrillDownTrailBalance'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async getPartyListing(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getPartyListing'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async getJournalListing(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getJournalListing'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async getBankPayment(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getBankPayment'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async getAllBankPaymentList(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getAllBankPaymentList'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }


  async getAnyBankPayment(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/report/getAnyBankPayment'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async changeBPstatus(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/accounts/report/changeBPstatus',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async  getAdhocReport(obj){
    const resp = this.http.get<any>( this.main.httpUrl + '/accounts/report/getAdhocReport'+obj).toPromise().then(res => {
      return res
    });
    return resp
  }


  async addBankPayment(obj){
    const res = await this.http.post<any>(this.main.httpUrl + '/accounts/report/addBankPayment',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }


  async getFields(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/metadata/fields/getfields'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getjrnldata(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/metadata/eventlayout/getJournal'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getMaxJournalId(obj){
    const res = await this.http.get<any>(this.httpUrl + '/getMaxJournalId'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async getContingentBill(obj){
    const res = await this.http.get<any>(this.httpUrl + '/getContingentBill'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async postJournal(obj){
    const res = await this.http.put<any>(this.httpUrl +'/postJournal',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async createJournal(obj){
    const res = await this.http.post<any>(this.httpUrl + '/createJournal',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async deleteJournal(obj){
    const res = await this.http.delete<any>(this.httpUrl + '/deleteJournal'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
}
