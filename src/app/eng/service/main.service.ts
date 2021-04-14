import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(private http: HttpClient) { }
  profileImageUrl;
  codeValueTechObj={};
  accountImageUrl;
  accInfo={}
  codeValueShowObj={};
  httpUrl="https://vdaerp.svayamtech.com:3000";
  //httpUrl="http://139.59.61.84:3000";
  
  async getFields(obj){
  
    const res = await this.http.get<any>(this.httpUrl + '/metadata/fields/getfields'+obj).toPromise().then(res => {
      return res;

    });
    return res;

  }
  async getCodeValue(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/metadata/codeValue/getCodeValues'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  public exportAsExcelFile(json: any[],json1: any[],excelFileName: string): void {
    const worksheet1: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(json);
    const worksheet2: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(json1);
    const workbook: XLSX.WorkBook = { Sheets: { 'Sheet2': worksheet2,'Sheet1': worksheet1 }, SheetNames: ['Sheet1','Sheet2'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }
}

