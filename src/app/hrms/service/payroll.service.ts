import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  httpUrl;


  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + "/hr";
  }
  async getbillbydate(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/bill/getbillbydate' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
//salary hold service

async getItReport(obj) {
  const resp = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/bill/getItReport' + obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

async getPersonalInfo(obj){
  const resp = await this.http.get<any>(this.main.httpUrl+'/hr/emp_info/empInfo/getPersonalInfo' + JSON.stringify(obj)).toPromise().then(res => {
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




  async getLeaveEncashment(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/leaveencash/getLeaveEncashment' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async insertarrayarrear(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/arrear/insertarrayarrear', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getarrear(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/arrear/getarrear' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async insertarrear(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/arrear/insertarrear', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updatearrear(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/arrear/updatearrear', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deletearrear(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/payroll_info/arrear/deletearrear' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getEL(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/leaveencash/getEL' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }



  async createLeaveEncashment(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/leaveencash/createLeaveEncashment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateLeaveEncashment(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/leaveencash/updateLeaveEncashment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deleteLeaveEncashment(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/payroll_info/leaveencash/deleteLeaveEncashment' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteloan(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/payroll_info/loan/deleteloan' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //hr
  async getEmployeeMasterData(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/emp_info/empInfo/getAllEmployee' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllAttendence(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/attendance/getAttendanceDetail' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllPosting(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/post/getCurrentlyAssignedPosts' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //fixed pay
  async getMaxYearAndMonth(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/bill/getMaxYearAndMonth' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getstopsalary(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/salaryhold/getstopsalary' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getCurrentArrangement(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/establishment/getCurrentArrangementOfParty' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async getAllFixedPay(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/fixedPayAmount/getAllFixedPay' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getEffectiveFixedSalary(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/fixedPayAmount/getEffectiveFixedPay' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addFixedPayComponent(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/fixedPayAmount/addFixedPayComponent', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addFixedPay(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/fixedPayAmount/addFixedPay', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addFixedPayonly(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/fixedPayAmount/addFixedPayonly', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateFixedPay(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/fixedPayAmount/updateFixedPay', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateFixedPayonly(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/fixedPayAmount/updateFixedPayonly', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //variable pay
  async getAllVariablePay(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/variablePay/getVariablePay' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getEffectiveVariablePay(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/variablePay/getEffectiveVariablePay' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async addVariablePay(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/variablePay/addVariablePay', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //salary-bill


  async getSalaryComponents(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/salary/getSalaryComponents' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getRemainingSalary(obj) {

    const resp = await this.http.get<any>(this.httpUrl + '/remainingSalary/getRemainingsalary' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }



  async getAllCurrentArrangements(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl + '/establishment/getAllCurrentEstablishementInfo' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getArrayAllCurrentEstablishementInfo(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/establishment/getArrayAllCurrentEstablishementInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async salaryAccrual(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/salary/salaryAccrual', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async createContingentBill(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/accounts/contingentBill/createContingentBill', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async sendToApproval(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/approval/addapprovalstatus', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getSalaryDocumentStatus(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/approval/getdataofapprovalstatus' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async createparty(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/accounts/party/createparty', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getAllBankAccounts(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl + '/emp_info/bankAccount/getAllBankAccounts' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }




  //paid-salary
  async getAllPaidSalary(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/salary/getSalaryRecords' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }



  async salaryPaid(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/salary/salaryPaid', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }



  //loan
  async getAllLoanInfo(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/loan/getAllLoans' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async addLoan(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/loan/applyForLoan', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async changeStatusOfLoan(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/loan/changeStatus', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async disburseLoan(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/loan/disburseLoan', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getLoanInstallmentInfo(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/loan/getLoanInstallmentInfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //bill
  async generateSalaryBill(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/bill/addBill', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async changeStatusOfBill(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/bill/changeStatusOfBill', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteBill(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/payroll_info/bill/deleteBill' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllBillId(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/bill/getAllBillId' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllBill(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/bill/getAllBills' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getMonthlyBill(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/bill/getMonthlyBill' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  // paySlip
  async getSalarySlip(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/bill/getPaySlip' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //other-payment
  async deletefixedpay(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/payroll_info/fixedPayAmount/deletefixedpay' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getSystemDate() {
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/sysAttribute/getSystemDate').toPromise().then(res => {
      return res;
    });
    return res;
  }
  async updateOtherPayment(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/otherPayments/updateOtherPayment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateStatusOfPayment(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/payroll_info/otherPayments/updateStatusOfPayment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async defineOtherPayments(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/payroll_info/otherPayments/defineOtherPayments', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getOtherPayments(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/payroll_info/otherPayments/getOtherPayments' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getComponentDefinition(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/salaryComponents/getComponentDefinition' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }


}
