import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {

  httpUrl;

  employee_id;
  complaint_detail;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/hr";
  }
  //  all employee
  async  getEmployeeMasterData(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl+'/emp_info/empInfo/getAllEmployee' + (b_acct_id)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  //arrangment
  async addEstablishment(obj){
    const resp = await this.http.post<any>(this.httpUrl+'/establishment/createArrangement', (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
 

  async getallEstablishment(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl+'/establishment/getAllArrangement'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }










//complaint
async createComplaint(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/complaint/createComplaint',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async updateComplaintDetail(obj) {
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/complaint/updateComplaintDetail',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async changeComplaintStatus(obj){
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/complaint/changeComplaintStatus',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

async getAllComplaints(b_acct_id) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/complaint/getAllComplaints'+b_acct_id).toPromise().then(res => {
    return res;
  });
  return resp;
}



//Enquiry
async setupEnquiry(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/enquiry/setupEnquiry',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

async getEnquiryForComplaint(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/enquiry/getEnquiryForComplaint'+JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}




  //Leaves 
  async adjustLeave(obj){
    const resp = await this.http.put<any>(this.httpUrl+'/leaveInfo/adjustLeaves' ,obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async carryForwardLeav(obj){
    const resp = await this.http.post<any>(this.httpUrl+'/leaveInfo/carryForwardLeaves' ,obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
 
  async getLeaveInfo(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/leaveInfo/getLeaveInfo'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async addLeaveInfo(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/leaveInfo/addLeaveInfo',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateLeaveInfo(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/leaveInfo/updateLeaveInfo', (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteLeaveInfo(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/leaveInfo/deleteLeaveInfo'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  // Leave Apply
  async getAllLeaveLedger(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/leaveLedger/getLeaveRecords'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getRemainingLeaves(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/leaveInfo/getRemainingLeaves'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  
  async applyForLeave(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/leaveLedger/applyForLeave'+obj,"").toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteLeaveRecord(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/leaveLedger/deleteLeaveRecord'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async approveLeave(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/leaveLedger/approveLeave',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async rejectLeave(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/leaveLedger/rejectLeave',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
     
//termination
async getAllTerminatedEmployees(b_acct_id) {
  const resp = await this.http.get<any>(this.httpUrl + '/termination/getAllTerminatedEmployees'+(b_acct_id)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async getBillDetailForTermination(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/termination/getBillDetailForTermination'+obj).toPromise().then(res => {
    return res;
  });
  return resp;
  }

async terminateEmployee(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/termination/terminateEmployee',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

//retirement
async retireEmployee(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/retirement/retireEmployee',obj).toPromise().then(res => {
    return res;
  });
  return resp;
  }
  async addretirement(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/retirement/addretirement',obj).toPromise().then(res => {
      return res;
    });
    return resp;
    }
  async getAllRetireEmployee(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/retirement/getretirementinfo'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
    }
  
  
    async getBillDetailForRetirement(obj) {
      const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/retirement/getBillDetailForRetirement'+obj).toPromise().then(res => {
        return res;
      });
      return resp;
      }
      async onTimeRetireEmployee(obj) {
        const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/retirement/onTimeRetireEmployee',obj).toPromise().then(res => {
          return res;
        });
        return resp;
        }

//death



async getNominee(obj) {
const resp = await this.http.get<any>(this.httpUrl + '/party/nominee/getNominee'+JSON.stringify(obj)).toPromise().then(res => {
  return res;
});
return resp;
}



async getDeadEmployees(b_acct_id) {
const resp = await this.http.get<any>(this.httpUrl+'/death/getDeadEmployees'+b_acct_id).toPromise().then(res => {
  return res;
});
return resp;
}


async deathOfEmployee(obj) {
const resp = await this.http.post<any>(this.httpUrl+'/establishment_info/death/deathOfEmployee',obj).toPromise().then(res => {
  return res;
});
return resp;
}
async getBillDetailForDeath(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/death/getBillDetailForDeath'+obj).toPromise().then(res => {
    return res;
  });
  return resp;
  }


async getNomineePayments(obj) {
const resp = await this.http.get<any>(this.httpUrl + '/death/getNomineePayments'+JSON.stringify(obj)).toPromise().then(res => {
  return res;
});
return resp;
}


async nomineePaymentAccrued(obj) {
const resp = await this.http.put<any>(this.httpUrl+'/death/nomineePaymentAccrued',obj).toPromise().then(res => {
  return res;
});
return resp;
}

async nomineePaymentComplete(obj) {
const resp = await this.http.put<any>(this.httpUrl+'/death/nomineePaymentComplete',obj).toPromise().then(res => {
  return res;
});
return resp;
}


//reappointment


async updateArrangement(obj) {
const resp = await this.http.put<any>(this.httpUrl+'/establishment/updateArrangement',obj).toPromise().then(res => {
  return res;
});
return resp;
}
// Employee Transfer (Anant)
async  getAllTransferredEmployees(b_acct_id) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/transfer/getAllTransferredEmployees' + (b_acct_id)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async addEmpTransfer(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/transfer/transferEmployee', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
// Employee Resignation (Anant)
async  getAllResignation(b_acct_id) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/resignation/getallresignations' + (b_acct_id)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async addResign(obj){
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/resignation/resign', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async approveResignation(obj){
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/resignation/approveResignation', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;

}
async resignationComplete(obj){
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/resignation/resignationComplete', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;

}
async getCurrentArrangement(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment/getCurrentArrangementOfParty'+JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}


async addPostingInfo(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/post/assignPost', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}


async getPostingInfo(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/post/getAllAssignedPosts' + JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}

async getCurrentlyAssignedPosts(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/post/getCurrentlyAssignedPosts' + JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}

async deactivatePost(obj) {
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/post/deactivatePost',(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async updatePost(obj) {
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/post/updatePost', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}


async addDCPPromtion(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/promotion/addDCPPromtion', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async addACP(obj){
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/promotion/addACP' , obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  deleteACP(obj) {
  const resp = await this.http.delete<any>(this.httpUrl + '/establishment_info/promotion/deleteACP' + JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  getPreviousPromotions(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/promotion/getAllPromotions' + JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async getAllFixedPay(obj) {
  const resp = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/fixedPayAmount/ruleGetAllFixedPayForRule'+JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}

async addPromtion(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/promotion/addPromtion', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}

async promoteEmployee(obj) {
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/promotion/promoteEmployee', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async getDate(){
  const resp = await this.http.get<any>(this.main.httpUrl+'/portal/getServerDate').toPromise().then(res => {
    return res;
  });
  return resp;
}
async rejectPromotion(obj) {
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/promotion/rejectPromotion', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
//Probation

async  getAllProbationInfo(b_acct_id) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/probation/getAllProbationInfo' + b_acct_id).toPromise().then(res => {
    return res;
  });
  return resp;
}

async  getPartyProbationInfo(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/probation/getPartyProbationInfo' + JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}


async addPartyProbation(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/probation/addPartyProbation', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}

async updateProbation(obj) {
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/probation/updateProbation', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
//arrangement

async  getAllCurrentArrangements(obj) {
  const resp = await this.http.get<any>(this.main.httpUrl + '/hr/establishment/getAllCurrentEstablishementInfo'+JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async  getArrayAllCurrentEstablishementInfo(obj) {
  const resp = await this.http.get<any>(this.main.httpUrl + '/hr/establishment/getArrayAllCurrentEstablishementInfo'+JSON.stringify(obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
//attendance info

async gatAllAttendance(obj){
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/attendance/getAttendanceDetail' + obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async addAttendanceInfo(obj) {
  const resp = await this.http.post<any>(this.httpUrl + '/establishment_info/attendance/addEmployeesAttendanceDetail', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}
async updateAttendanceInfo(obj) {
  const resp = await this.http.put<any>(this.httpUrl + '/establishment_info/attendance/updateAttendanceDetail', (obj)).toPromise().then(res => {
    return res;
  });
  return resp;
}

async getMatrix(obj){
  const resp = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/payMatrix/getPayMatrix'+obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

//Suspension
async getAllsuspensions(obj) {
  const resp = await this.http.get<any>(this.httpUrl + '/establishment_info/suspension/getAllsuspensions'+obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async suspensionWithdraw(obj) {
  const resp = await this.http.put<any>(this.httpUrl+'/establishment_info/suspension/suspensionWithdraw',obj).toPromise().then(res => {
    return res;
  });
  return resp;
  }
async suspendEmployee(obj) {
  const resp = await this.http.post<any>(this.httpUrl+'/establishment_info/suspension/suspendEmployee',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}
async updatesuspension(obj) {
const resp = await this.http.put<any>(this.httpUrl+'/establishment_info/suspension/updatesuspension',obj).toPromise().then(res => {
  return res;
});
return resp;
}
async getbillforSuspension(obj) {
const resp = await this.http.get<any>(this.httpUrl+'/payroll_info/bill/getbillforSuspension'+obj).toPromise().then(res => {
  return res;
});
return resp;
}

async addarrayVariablePay(obj) {
const resp = await this.http.post<any>(this.httpUrl+'/payroll_info/variablePay/addarrayVariablePay',obj).toPromise().then(res => {
  return res;
});
return resp;
}



async  getUploadedFileData(obj) {
     
  const resp = await this.http.post(this.httpUrl+'/setting/notice/getUploadedFileData', obj, { responseType: 'blob' }).toPromise().then(res => {
    return res;
  });
  if (resp) {
    return resp;
}
}
async  getAllNotice(b_acct_id) {
  const resp = await this.http.get<any>(this.httpUrl + '/setting/notice/getuploadednotice'+b_acct_id).toPromise().then(res => {
    return res;
  });
  return resp;
}

async  deleteNotice(obj) {
  const resp = await this.http.delete<any>(this.httpUrl + '/setting/notice/deletenotice'+obj).toPromise().then(res => {
    return res;
  });
  return resp;
}

async  updateNotice(obj) {
  const resp = await this.http.put<any>(this.httpUrl + '/setting/notice/updateNotice',obj).toPromise().then(res => {
    return res;
  });
  return resp;
}


}
