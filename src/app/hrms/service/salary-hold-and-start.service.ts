import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
@Injectable({
  providedIn: 'root'
})
export class SalaryHoldAndStartService {
  httpUrl
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/hr";
   }
   async  getEmployeeMasterData(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl+'/emp_info/empInfo/getAllEmployee' + (b_acct_id)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updatesalary(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/salaryhold/updatesalary',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getsalarystatus(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/salaryhold/getsalarystatus'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getholdsalaryreport(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/salaryhold/getholdsalaryreport'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async holdsalary(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/salaryhold/holdsalary',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getstopsalary(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/salaryhold/getstopsalary'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async changeStatusOfsalary(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/salaryhold/changeStatusOfsalary',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deletesalarystatus(obj){
  
    const res = await this.http.delete<any>(this.httpUrl + '/payroll_info/salaryhold/deletesalarystatus'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
}
