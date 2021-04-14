import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/settings";
  }
  //hrms-fileds
  //fields
  
  async  createDeductionMapping(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl+'/account/tdsmapping/addtdsmapping',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getDeductionMappingList(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/account/tdsmapping/gettdsmapping'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  deleteDeductionMappingRow(obj) {
    const resp = await this.http.delete<any>(this.main.httpUrl+'/account/tdsmapping/deletetdsmapping'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  updateDeductionMapping(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl+'/account/tdsmapping/updatetdsmapping',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
//sal new
async  getSalInfoNew(obj) {
  const resp = await this.http.get<any>(this.main.httpUrl + '/account/ip/getsal' + obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  createSalNew(obj) {
  const resp = await this.http.post<any>(this.main.httpUrl + '/account/ip/insertsal', obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  updateSalNew(obj) {
  const resp = await this.http.put<any>(this.main.httpUrl + '/account/ip/updatesal', obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
  async getFields(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/fields/getfields'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async getDataTypes(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/datatypes/getDatatypes'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async createFields(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/metadata/fields/createField', obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }
   async updateFields(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/metadata/fields/updateField', obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }
   //codeValue
   async getCodeValue(b_acct_id){
    const resp = await this.http.get<any>(this.main.httpUrl + '/metadata/codeValue/getCodeValues'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteCodeValue(obj){
    const resp = await this.http.delete<any>(this.main.httpUrl + '/metadata/codeValue/deleteCodeValue'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getFieldCodeValues(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/metadata/codeValue/getFieldCodeValues' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async insertCodeValue(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/metadata/codeValue/createCodeValue',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateCodeValues(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/metadata/codeValue/updateCodeValue',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //Account Info
  async  getAccountInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/settings/accountInfo/getAccountInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  addAccountInfo(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl+'/accounts/settings/accountInfo/addAccountInfo',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  updateAccountInfo(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl+'/accounts/settings/accountInfo/updateAccountInfo',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  deleteAccountInfo(obj) {
    const resp = await this.http.delete<any>(this.main.httpUrl+'/accounts/settings/accountInfo/deleteAccountInfo'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  // bank account
  async  getBankAccounts(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/bankAccount/getBankAccounts' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  createBankAccount(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl+'/accounts/bankAccount/createBankAccount',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  updateBankAccount(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl+'/accounts/bankAccount/updateBankAccount',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

// party
async  getPartyInfo(obj) {
  const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/party/getPartyInfo' + obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

async  createParty(obj) {
  const resp = await this.http.post<any>(this.main.httpUrl+'/accounts/party/createPartyWithoutPartyID',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  updateParty(obj) {
  const resp = await this.http.put<any>(this.main.httpUrl+'/accounts/party/updatePartyInfo',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

//party new
async  getPartyInfoNew(obj) {
  const resp = await this.http.get<any>(this.main.httpUrl+'/account/ip/getip' + obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  createPartyNew(obj) {
  const resp = await this.http.post<any>(this.main.httpUrl+'/account/ip/insertip',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  updatePartyNew(obj) {
  const resp = await this.http.put<any>(this.main.httpUrl+'/account/ip/updateip',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
  //Budget
  async  getBudgets(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/budget/getBudgetInfo' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  createBudget(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl+'/accounts/budget/createBudget',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  updateBudget(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl+'/accounts/budget/updateBudget',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  // HSN Code(GST) 
  async  getHSNAccounts(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/account/setting/gst/getgst'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  createHSNAccount(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl+'/account/setting/gst/addgst',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  updateHSNAccount(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl+'/account/setting/gst/updategst',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  deleteHSNAccount(obj) {
    const resp = await this.http.delete<any>(this.main.httpUrl+'/account/setting/gst/deletegst'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

}