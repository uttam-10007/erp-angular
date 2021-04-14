import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  httpUrl;


  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/hr/setting";
  }
  //fields
  async getFields(obj){
  
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/fields/getfields'+obj).toPromise().then(res => {
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
  async deleteCodeValue(obj){
    const resp = await this.http.delete<any>(this.main.httpUrl + '/metadata/codeValue/deleteCodeValue'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //hrms-fileds
  async addcontribution(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/hr/setting/pensioncontribution/addcontribution',obj).toPromise().then(res => {
    return res;
    });
    return resp;
    }
    async getcontribution(b_acct_id){
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/setting/pensioncontribution/getcontribution'+b_acct_id).toPromise().then(res => {
    return res;
    });
    return resp;
    }
    async deletecontribution(obj){
    const resp = await this.http.delete<any>(this.main.httpUrl + '/hr/setting/pensioncontribution/deletecontribution'+obj).toPromise().then(res => {
    return res;
    });
    return resp;
    }
  //leave-reference-data
  async  getAllRules(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/hr/leaveRule/getAllRules'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async  addLeaveRule(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl+'/hr/leaveRule/addLeaveRule',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  
  async  updateLeaveRule(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl+'/hr/leaveRule/updateLeaveRule' ,obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  deleteLeaveRule(obj) {
    const resp = await this.http.delete<any>(this.main.httpUrl+'/hr/leaveRule/deleteLeaveRule'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  
  // salary
  async getAllSalaryCD(obj){
    
    const res = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/salaryComponents/getComponentDefinition'+JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async createSalaryCD(obj){
    const resp = await this.http.post<any>(this.main.httpUrl+'/hr/payroll_info/salaryComponents/addComponentDefinition',obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }
   async updateSalaryCD(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/hr/payroll_info/salaryComponents/activateComponent', obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }
   async deleteSalaryCD(obj){
    const resp = await this.http.delete<any>(this.main.httpUrl + '/hr/payroll_info/salaryComponents/deleteComponentDefinition'+obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }
   async getAllCurrentArrangements(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/establishment/getAllCurrentEstablishementInfo'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getArrayAllCurrentEstablishementInfo(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/establishment/getArrayAllCurrentEstablishementInfo'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getAllPartyFields(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/hr/emp_info/empInfo/getAllEmployee' + (obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  
    //section
    async getAllSections(obj){
      const res = await this.http.get<any>(this.main.httpUrl + '/hr/establishment_info/section/getAllSections'+obj).toPromise().then(res => {
        return res;
      });
      return res;
    }
    async createSection(obj){
      const resp = await this.http.post<any>(this.main.httpUrl+'/hr/establishment_info/section/createSection',obj).toPromise().then(res => {
        return res;
       });
      return resp;
     }
     async updateSection(obj){
      const resp = await this.http.put<any>(this.main.httpUrl + '/hr/establishment_info/section/updateSection', obj).toPromise().then(res => {
        return res;
       });
      return resp;
     }
     async deleteSection(obj){
      const resp = await this.http.delete<any>(this.main.httpUrl + '/hr/establishment_info/section/deleteSection'+obj).toPromise().then(res => {
        return res;
       });
      return resp;
     }
     //matrix
     async getMatrix(obj){
      const resp = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/payMatrix/getPayMatrix'+obj).toPromise().then(res => {
        return res;
      });
      return resp;
    }
    
    async addMatrix(obj){
      const resp = await this.http.post<any>(this.main.httpUrl + '/hr/payroll_info/payMatrix/addPayMatrix',obj).toPromise().then(res => {
        return res;
      });
      return resp;
    }
    async updateMatrix(obj){
      const resp = await this.http.put<any>(this.main.httpUrl + '/hr/payroll_info/payMatrix/updatePayMatrix',obj).toPromise().then(res => {
        return res;
      });
      return resp;
    }
    async deleteMatrix(obj){
      const resp = await this.http.delete<any>(this.main.httpUrl + '/hr/payroll_info/payMatrix/deletePayMatrix'+obj).toPromise().then(res => {
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
    async addFixedPay(obj){
      const resp = await this.http.post<any>(this.main.httpUrl+'/hr/payroll_info/fixedPayAmount/addFixedPay', (obj)).toPromise().then(res => {
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

}
