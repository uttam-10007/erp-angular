import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
@Injectable({
  providedIn: 'root'
})
export class AllEmpService {

  httpUrl;

  employee_id;

  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/hr";
  }
  //hr
  async  getEmployeeMasterData(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/emp_info/empInfo/getAllEmployee' + (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updatedob(obj){
    const resp = await this.http.put<any>(this.httpUrl+'/emp_info/empInfo/updatedob', (obj)).toPromise().then(res => {
    return res;
    });
    return resp;
    }
  async  getAllPartyFields(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/emp_info/empInfo/getAllEmployee' + (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  // async addEmployeePersonalInfo(obj){
  //   const resp = await this.http.post<any>(this.httpUrl+'/party/personal/addPersonalInfo', (obj)).toPromise().then(res => {
  //     return res;
  //   });
  //   return resp;
  // }
  async updatePersonalInfo(obj){
    const resp = await this.http.put<any>(this.httpUrl+'/emp_info/empInfo/updateEmployeePersonalInfo', (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getUploadedFiles(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/establishment_info/uploadfile/getUploadedFiles' + (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getUploadedFileData(obj) {
     
  

    const resp = await this.http.post(this.httpUrl+'/establishment_info/uploadfile/getUploadedFileData', obj, { responseType: 'blob' }).toPromise().then(res => {
      return res;
    });
    if (resp) {
      return resp;
  }
  }
  async getPersonalInfo(obj){
    const resp = await this.http.get<any>(this.httpUrl+'/emp_info/empInfo/getPersonalInfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //Qualification Services
  async  getQualifications(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/emp_info/education/getQualifications' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addQualification(obj){
    const resp = await this.http.post<any>(this.httpUrl+'/emp_info/education/addQualification', (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateQualifications(obj){
    const resp = await this.http.put<any>(this.httpUrl+'/emp_info/education/updateQualification', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteQualification(obj){
    const resp = await this.http.delete<any>(this.httpUrl+'/emp_info/education/deleteQualification' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  //Nominee Services
  async  getNominee(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/emp_info/nominee/getNominee' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addNominee(obj){
    const resp = await this.http.post<any>(this.httpUrl+'/emp_info/nominee/addNominee', (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateNominee(obj){
    const resp = await this.http.put<any>(this.httpUrl+'/emp_info/nominee/updateNominee', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteNominee(obj){
    const resp = await this.http.delete<any>(this.httpUrl+'/emp_info/nominee/deleteNominee' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //bank account info
  async getBankAcctInfo(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/emp_info/bankAccount/getPartyBankAccount' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addBankAcctInfo(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/hr/emp_info/bankAccount/addBankAccount', (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateBankAcctInfo(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/emp_info/bankAccount/updateBankAccount', (obj)).toPromise().then(res => {
      return res;
    });
    return resp;

  }
  async deleteBankAcctInfo(obj){
  const resp = await this.http.delete<any>(this.httpUrl + '/emp_info/bankAccount/deleteBankAccount'+ JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  }
  async  getDependentInfo(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/emp_info/dependent/getDependents' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addDependentInfo(obj){
    const resp = await this.http.post<any>(this.httpUrl+'/emp_info/dependent/addDependent', (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateDependentInfo(obj){
    const resp = await this.http.put<any>(this.httpUrl+'/emp_info/dependent/updateDependent', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteDependentInfo(obj){
    const resp = await this.http.delete<any>(this.httpUrl+'/emp_info/dependent/deleteDependent' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //lic
  async getLicInfo(obj){
  
    const res = await this.http.get<any>(this.main.httpUrl + '/hr/emp_info/lic/getLicInfo'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async updateLicInfo(obj){
  
    const res = await this.http.put<any>(this.main.httpUrl + '/hr/emp_info/lic/updateLicInfo',obj).toPromise().then(res => {
      return res;

    });
    return res;

  }

  async addLicInfo(obj){
  
    const res = await this.http.post<any>(this.main.httpUrl + '/hr/emp_info/lic/addLicInfo',obj).toPromise().then(res => {
      return res;

    });
    return res;

  }

  async deleteLicInfo(obj){
  
    const res = await this.http.delete<any>(this.main.httpUrl + '/hr/emp_info/lic/deleteLicInfo'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

}
