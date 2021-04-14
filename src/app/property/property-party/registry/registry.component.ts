import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PartyService } from '../../service/party.service';
import {RegistryService  } from '../../service/registry.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';

import { SchemeService } from '../../service/scheme.service';
import { SubSchemeService } from '../../service/sub-scheme.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {MainService} from '../../service/main.service'
import { ExcelService } from '../../service/file-export.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any;

@Component({
  selector: 'app-registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.css']
})
export class RegistryComponent implements OnInit {
  displayedColumns = ['party_id','party_name','party_phone_no','property_type_code','property_no','arr_effective_date','action'];
  obj={}

  erpUser;
  b_acct_id
  data;
  schemeArr;
  selectedSchemeCode=''
  dataSource
  schemeObject={}
  party_id=''
  costCodeArr=[]
scheduleArr=[];
partyObj={}
partyArr
subschemeArr;
subschemeObject={}
subselectedSchemeCode;
user_id
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private subSchemeService: SubSchemeService, private mainService:MainService,private excel:ExcelService,private schemeService: SchemeService,private registerService:RegistryService,private service: PartyService,private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }

 
   
    async  ngOnInit() {
      this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
      this.b_acct_id=this.erpUser.b_acct_id;
      this.user_id=this.erpUser.user_id;
     
      await this.getAllSchemes()
      
     

    }

    async getAllSchemes(){
      this.spinner.show()
      var resp = await this.schemeService.getScheme(this.b_acct_id);
      if (resp['error'] == false) {
        this.schemeArr = resp.data;
        
        for(let i=0;i<this.schemeArr.length;i++){
this.schemeObject[this.schemeArr[i]['scheme_code']]=this.schemeArr[i]['scheme_name']
        }
        this.spinner.hide();
       
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Schemes", 'Error', {
          duration: 5000,
        });
      }
    }
    async getAllSubschemes(){
      var obj = new Object();
      obj['b_acct_id'] = this.b_acct_id;
      obj['scheme_code']=this.selectedSchemeCode;
      this.spinner.show();
            var resp = await this.subSchemeService.getsubScheme(obj);
      if (resp['error'] == false) {
        this.subschemeArr = resp.data;
        
        for(let i=0;i<this.subschemeArr.length;i++){
  this.subschemeObject[this.subschemeArr[i]['sub_scheme_code']]=this.subschemeArr[i]['sub_scheme_name']
        }
        this.spinner.hide();
       
      } else {
        
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Sub Schemes", 'Error', {
          duration: 5000,
        });
      }
    }
    async getRegisteredInfo(){
      var obj=new Object;
      obj['b_acct_id']=this.b_acct_id
      obj['scheme_code']=this.selectedSchemeCode
      obj['sub_scheme_code']=this.subselectedSchemeCode
      this.spinner.show();

      var resp = await this.registerService.getAllregistered(obj);
      if (resp['error'] == false) {
        this.data = resp.data;
        
    
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.sort = this.sort;
        
        this.dataSource.paginator = this.paginator;
        this.spinner.hide();

      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Information", 'Error', {
          duration: 5000,
        });
      }
    }
    async  fetch(){
      if(this.party_id!=''){
        this.obj=Object.assign({},{data:[]})
      
        this.costCodeArr=[]
      var obj=new Object;
      obj['b_acct_id']=this.b_acct_id
      
      obj['party_id']=this.party_id
      this.spinner.show()
            var resp = await this.registerService.getdetailsForregistry(obj);
            if (resp['error'] == false) {
              if(resp.data.length>0){
                this.obj = resp.data[0];
                this.obj['b_acct_id']= this.b_acct_id
                this.obj['create_user_id']=this.user_id
                this.obj['arr_effective_date']=''

        this.spinner.hide()
        
              }else{
                this.obj=new Object
                this.spinner.hide();
                this.snackBar.open("No Record Found", 'Error', {
                  duration: 5000,
                });
              
              }
             
            
            } else {
              //this.toastr.errorToastr('Some Error Occurred')
              this.spinner.hide();
              this.snackBar.open("Error occured while getting Information", 'Error', {
                duration: 5000,
              });
            }
      
          }
          }
          async addNew(){
            this.spinner.show();
            var resp = await this.registerService.createregistry(this.obj);
            if (resp['error'] == false) {
          
              this.obj=Object.assign({},{data:[]})
          this.party_id=''
              this.spinner.hide();
              this.snackBar.open("Registered Successfully", 'Success!', {
                duration: 5000,
              });
              //this.toastr.successToastr('Added Successfully')
            } else {
              this.spinner.hide();
              this.snackBar.open("Request Failed", 'Error', {
                duration: 5000,
              });
           }
          
          }
          // async edit(element, i) {
    

          //  this.obj=Object.assign({},element)
          //     this.obj['b_acct_id']= this.b_acct_id
          //     this.obj['update_user_id']=this.user_id
      
          // $('.nav-tabs a[href="#tab-3"]').tab('show')
      
          // }
          // async update(){
           
          //   this.spinner.show();
           
          //   var resp = await this.registerService.updateregistry(this.obj);
          //   if (resp['error'] == false) {
        
          //    await this.getRegisteredInfo()
          //     this.spinner.hide();
          //    $('.nav-tabs a[href="#tab-1"]').tab('show')
          //    this.snackBar.open("Updated Successfully", 'Success!', {
          //     duration: 5000,
          //   });
          //     //this.toastr.successToastr('Updated Successfully')
          //   } else {
          //     this.spinner.hide();
          //     this.snackBar.open("Request Failed", 'Error', {
          //       duration: 5000,
          //     });
          //     //this.toastr.errorToastr(resp['data']);
          //   }
          // }

          refressadd(){
            this.obj=Object.assign({},{})
         
          }
         
          applyFilter(filterValue: string) {
      
            this.dataSource.filter = filterValue.trim().toLowerCase();
          }
          export1() {
            var exp = []
            for (var i = 0; i < this.data.length; i++) {
              var obj = new Object();
              obj['SNO'] = i + 1;
              obj['Applicant ID'] = this.data[i]['party_id']
              obj['Applicant Name'] = this.data[i]['party_name']
              obj['Phone Number'] = this.data[i]['party_phone_no']
              obj['Property Type'] = this.data[i]['property_type_code']
              obj['Property Number'] = this.data[i]['property_no']
              obj[' Effective Date'] = this.mainService.dateFormatChange(this.data[i]['arr_effective_date'])
              exp.push(obj);
            }
            this.excel.exportAsExcelFile(exp, 'registry')
          }
          async print1() {
            this.spinner.show()
            let data2 = []
            for (let i = 0; i < this.data.length; i++) {
              let obj = {}
              if(this.data[i]['party_id']){
                obj['party_id'] = this.data[i]['party_id']

              }else{
                obj['party_id'] =''
              }
              if(this.data[i]['party_name']){
                obj['party_name'] = this.data[i]['party_name']
              }else{
                obj['party_name'] =''
              }
              if(this.data[i]['party_phone_no']){
                obj['party_phone_no'] = this.data[i]['party_phone_no']
              }else{
                obj['party_phone_no'] =''
              }
              if(this.data[i]['property_type_code']){
                obj['property_type_code'] = this.data[i]['property_type_code']
              }else{
                obj['property_type_code'] =''
              }
              if(this.data[i]['property_no']){
                obj['property_no'] = this.data[i]['property_no']
              }else{
                obj['property_no'] =''
              }
              if(this.data[i]['scheme_code']){
                obj['scheme_code'] = this.data[i]['scheme_code']
              }else{
                obj['scheme_code'] =''
              }
              if(this.data[i]['sub_scheme_code']){
                obj['sub_scheme_code'] = this.data[i]['sub_scheme_code']
              }else{
                obj['sub_scheme_code'] =''
              }
              if(this.data[i]['party_email']){
                obj['party_email'] = this.data[i]['party_email']
              }else{
                obj['party_email'] =''
              }
              if(this.data[i]['arr_effective_date']){
                obj['arr_effective_date'] = this.mainService.dateFormatChange(this.data[i]['arr_effective_date'])
              }else{
                obj['arr_effective_date'] =''
              }
              data2.push(obj)
            }
            let sch = '';
            let sub_sch = ''
            for (let i = 0; i < this.schemeArr.length; i++) {
              if (this.selectedSchemeCode == this.schemeArr[i]['scheme_code']) {
                sch = this.schemeArr[i]['scheme_name']
                break;
              }
            }
            for (let i = 0; i < this.subschemeArr.length; i++) {
              if (this.subselectedSchemeCode == this.subschemeArr[i]['sub_scheme_code']) {
                sub_sch = this.subschemeArr[i]['sub_scheme_name']
                break;
              }
            }      // ------------
            var txt = this.mainService.accInfo['account_name'] + '(' + this.mainService.accInfo['account_short_name'] + ')'
            var dd = {
              pageSize: 'A3',
              header: function (currentPage, pageCount) {
                var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
                return obj;
              },
        
              pageOrientation: 'landscape',
        
              pageMargins: [40, 60, 40, 60],
              content: [
              ]
            };
            
            var header0 = {
              columns: [
                {
                  width: '*',
                  text: 'Registry',
                  bold: true,
                  alignment: 'center'
                }
        
              ],
            }
            var header9 = {
              columns: [
                {
                  width: '*',
                  text: '* Note : This is a computer generated document.',
                  bold: true,
                  alignment: 'left'
                }
        
              ],
            }
            var header1 = {
              columns: [
                {
                  width: '*',
                  text: 'Scheme :',
                  bold: true
                },        
                {
                  width: '*',
                  text: sch
                },
                {
                  width: '*',
                  text: 'Sub Scheme :',
                  bold: true
                },
        
                {
                  width: '*',
                  text: sub_sch
                }
        
              ],
            }
        
            dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
            dd.content.push({ text: " " });
            dd.content.push(header0);
            dd.content.push({ text: " " });
            dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
            dd.content.push({ text: " " });
            dd.content.push(header1);
            dd.content.push({ text: " " });
            dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
            var tbl = {
        
              // layout: 'lightHorizontalLines',
              fontSize: 10,
              table: {
        
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*', '*'],
                body: [
                  ['Application ID','Applicant Name','Phone Number', 'Property Number', 'Property Type','Effective Date']
                ],
              }
            };
            dd.content.push(tbl);
            for (var i = 0; i < data2.length; i++) {
              var arr = []
              arr.push(data2[i]['party_id']);
              arr.push(data2[i]['party_name']);
              arr.push(data2[i]['party_phone_no']);
              arr.push(data2[i]['property_no']);
              arr.push(data2[i]['property_type_code']);
              arr.push(data2[i]['arr_effective_date']);
              dd.content[dd.content.length - 1].table.body.push(arr);
            }
            dd.content.push({ text: " " });
            dd.content.push(header9);
            this.spinner.hide()
            pdfMake.createPdf(dd).download("registry");
          }
          async print(data) {
            this.spinner.show()
              var txt = this.mainService.accInfo['account_name'] + '(' + this.mainService.accInfo['account_short_name'] + ')'
              var dd = {
                pageSize: 'A4',
                header: function (currentPage, pageCount) {
                  var obj = { text: txt + "" + '', alignment: 'center', margin: [72, 40] };
                  return obj;
                },
        
                pageOrientation: 'portrait',
        
                pageMargins: [40, 60, 40, 60],
                content: [
                ]
              };
              var header0 = {
                columns: [
                  {
                    width: '*',
                    text: 'REGISTRY',
                    bold: true,
                    alignment:'center'
                  }       
        
                ],
              }
               var header1 = {
                columns: [
                  {
                    width: '*',
                    text: 'Applicant ID :',
                    bold: true
                  },
        
                  {
                    width: '*',
                    text: data['party_id']
                  },
                  {
                    width: '*',
                    text: 'Applicant Name:',
                    bold: true
                  },
        
                  {
                    width: '*',
                    text: data['party_name']
                  }
        
                ],
              }
              var header4 = {
                columns: [
                 
                  {
                    width: '*',
                    text: 'Registry Date :',
                    bold: true
                  },
        
                  {
                    width: '*',
                    text: this.mainService.dateFormatChange(data['arr_effective_date'])
                  },
                                   {
                    width: '*',
                    text: 'Property Number :',
                    bold: true
                  },
                  {
                    width: '*',
                    text: data['property_no']
                  },
                ],
              }
              var header5 = {
                columns: [
                  {
                    width: '*',
                    text: 'Scheme :',
                    bold: true
                  },
                  {
                    width: '*',
                    text: data['scheme_code']        
                  },
                  {
                    width: '*',
                    text: 'Sub Scheme :',
                    bold: true
                  },
        
                  {
                    width: '*',
                    text: data['sub_scheme_code']
                  }
                ],
              }
              var header2 = {
                columns: [
                  {
                    width: '*',
                    text: 'Phone Number :',
                    bold: true
                  },
                  {
                    width: '*',
                    text: data['party_phone_no']        
                  },
                  {
                    width: '*',
                    text: 'Property Type :',
                    bold: true
                  },
        
                  {
                    width: '*',
                    text: data['property_type_code']
                  }
                ],
              }
              var header3 = {
                columns: [
                  {
                    width: '*',
                    text: 'Email :',
                    bold: true
                  },
                  {
                    width: '*',
                    text: data['party_email']        
                  },
                 
                  {
                    width: '*',
                    text: '',
                    bold: true
                  },
                  {
                    width: '*',
                    text:''
                  }
                ],
              }
              var header9 = {
                columns: [
                  {
                    width: '*',
                    text: '* Note : This is a computer-generated document.',
                    bold: true,
                    alignment: 'left'
                  }
          
                ],
              }
              dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
              dd.content.push({ text: " " });
              dd.content.push(header0);
              dd.content.push({ text: " " });
              dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
              dd.content.push({ text: " " });
              dd.content.push(header5);
              dd.content.push({ text: " " });
              dd.content.push(header1);
              dd.content.push({ text: " " });
              dd.content.push(header4);
              dd.content.push({ text: " " });
              dd.content.push(header2);
              dd.content.push({ text: " " });
              dd.content.push(header3);
              dd.content.push({ text: " " });  
              dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
              dd.content.push({ text: " " });
              dd.content.push(header9);
              this.spinner.hide()
              pdfMake.createPdf(dd).download("registry");
         
          }
}
