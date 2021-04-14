import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { HrmsReportService } from '../../service/hrms-report.service';
import { MainService } from '../../service/main.service';
import { AllEmpComponent } from '../../party/all-emp/all-emp.component';
import {  ChangeDetectorRef } from '@angular/core';
import {ExcelService} from '../../service/file-export.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any
@Component({
  selector: 'app-emp-report',
  templateUrl: './emp-report.component.html',
  styleUrls: ['./emp-report.component.css']
})
export class EmpReportComponent implements OnInit {

  constructor(private excl:ExcelService,private cdr: ChangeDetectorRef,public mainService: MainService, private hrmsReportService: HrmsReportService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  allReport = [];
  filter = {};
  project = [];

  report_name;
  report_id;
  emp_id = false
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;

  displayedColumns = ['report_id', 'report_name', 'action'];
  displayedColumns1 = [];


  datasource: MatTableDataSource<any>;
  datasource1: MatTableDataSource<any>;



  project_fields = [{ field_technical_name: 'pay_scale_code', field_business_name: 'Pay Scale' }
    , { field_technical_name: 'class_code', field_business_name: 'Class Code' }
    , { field_technical_name: 'emp_id', field_business_name: 'Employee ID' }
    , { field_technical_name: 'emp_name', field_business_name: 'Employee Name' }
    , { field_technical_name: 'level_code', field_business_name: 'Level Code' }
    , { field_technical_name: 'employee_current_type_code', field_business_name: 'Employee Current Type Code' }
    , { field_technical_name: 'establishment_type_code', field_business_name: 'Establishment Type Code' }
    , { field_technical_name: 'cadre_code', field_business_name: 'Cadre Code' }
    , { field_technical_name: 'grade_pay_code', field_business_name: 'Grade Pay Code' }
    , { field_technical_name: 'pay_commission_code', field_business_name: 'Pay Commission Code' }
    , { field_technical_name: 'emp_status_code', field_business_name: 'Employee Status Code' }
    , { field_technical_name: 'retirement_age', field_business_name: 'Retirement Age' }
    , { field_technical_name: 'designation_code', field_business_name: 'Designation Code' }
    , { field_technical_name: 'order_id', field_business_name: 'Order ID' }
    , { field_technical_name: 'promotion_type_code', field_business_name: 'Promotion Type Code' }
    , { field_technical_name: 'inc_month', field_business_name: 'Inc Month' }
    , { field_technical_name: 'joining_date', field_business_name: 'Joining Date' }
    , { field_technical_name: 'joining_type_code', field_business_name: 'Joining Type Code' }
    , { field_technical_name: 'joining_service_date', field_business_name: 'Joining Service Date' }
    , { field_technical_name: 'retirement_date', field_business_name: 'Retirement Date' }
    , { field_technical_name: 'ordering_authority', field_business_name: 'Ordering Authority' }
    , { field_technical_name: 'probation_end_dt', field_business_name: 'Probation End Date' }
    , { field_technical_name: 'probation_feedback', field_business_name: 'Probation Feedback' }
    , { field_technical_name: 'notice_period', field_business_name: 'Notice Period' }
    , { field_technical_name: 'designation_group_code', field_business_name: 'Designation Group Code' }
    , { field_technical_name: 'uniform_ind', field_business_name: 'Uniform Ind' }
    , { field_technical_name: 'conv_code', field_business_name: 'Conv Code' }
    , { field_technical_name: 'family_planning', field_business_name: 'Family Planning' }
    , { field_technical_name: 'emp_sex', field_business_name: 'Employee Sex' }
    , { field_technical_name: 'emp_email', field_business_name: 'Employee Email' }
    , { field_technical_name: 'emp_phone_no', field_business_name: 'Employee Phone Number' }
    , { field_technical_name: 'emp_dob', field_business_name: 'Employee Date Of Birth' }
    , { field_technical_name: 'emp_father_name', field_business_name: 'Employee Father Name' }
    , { field_technical_name: 'emp_pan_no', field_business_name: 'Employee Pan Number' }
    , { field_technical_name: 'emp_adhar_no', field_business_name: 'Employee Addhar Number' }
    , { field_technical_name: 'emp_gst_no', field_business_name: 'Employee GST Number' }
    , { field_technical_name: 'bank_code', field_business_name: 'Employee Bank Code' }
    , { field_technical_name: 'branch_code', field_business_name: 'Employee  Branch Code' }
    , { field_technical_name: 'ifsc_code', field_business_name: 'Employee IFSC Code' }
    , { field_technical_name: 'acct_no', field_business_name: 'Employee Account Number' }
    , { field_technical_name: 'pf_acct_no', field_business_name: 'Employee PF Account Number' }
    , { field_technical_name: 'identification_mark', field_business_name: 'Identification Mark' }
    , { field_technical_name: 'gis_no', field_business_name: 'Employee GIS Number' }
    , { field_technical_name: 'nps_no', field_business_name: 'Employee NPS Number' }
    , { field_technical_name: 'reservation_category_code', field_business_name: 'Reservation Category Code' }
    , { field_technical_name: 'marital_status', field_business_name: 'Marital Status' }
    , { field_technical_name: 'emp_husband_name', field_business_name: 'Employee Husband Name' }
    , { field_technical_name: 'emp_religeon', field_business_name: 'Employee Religeon' }
    , { field_technical_name: 'emp_nationality', field_business_name: 'Employee Nationality' }
    , { field_technical_name: 'emp_mother_name', field_business_name: 'Employee Mother Name' }
    , { field_technical_name: 'posting_date', field_business_name: 'Posting Date' }
    , { field_technical_name: 'posting_status_code', field_business_name: 'Posting_Status Code' }
    , { field_technical_name: 'section_code', field_business_name: 'Section Code' }
    , { field_technical_name: 'posting_type_code', field_business_name: 'Posting Type Code' }
    , { field_technical_name: 'education_name', field_business_name: 'Education Name' }
    , { field_technical_name: 'education_type_code', field_business_name: 'Education Type Code' }
    , { field_technical_name: 'pass_year_code', field_business_name: 'Pass Year' }



    , { field_technical_name: 'pay_component_code', field_business_name: 'Pay Component Code' }
    , { field_technical_name: 'pay_component_amt', field_business_name: 'Pay Component Amount' }
    , { field_technical_name: 'effective_start_dt', field_business_name: 'Effective Start Date' }
    , { field_technical_name: 'effective_end_dt', field_business_name: 'Effective End Date' }
    , { field_technical_name: 'pay_code', field_business_name: 'Pay Code' },
  ];

  table_name = {
    pay_scale_code: 'establishment_info',
    class_code: 'establishment_info',
    emp_id: 'establishment_info',
    emp_name: 'establishment_info',
    level_code: 'establishment_info',
    employee_current_type_code: 'establishment_info',
    establishment_type_code: 'establishment_info',
  
    cadre_code: 'establishment_info',
    grade_pay_code: 'establishment_info',
    pay_commission_code: 'establishment_info',
    emp_status_code: 'establishment_info',
    retirement_age: 'establishment_info',
    designation_code: 'establishment_info',
    order_id: 'establishment_info',
    promotion_type_code: 'establishment_info',
    inc_month: 'establishment_info',
    joining_date: 'establishment_info',
    joining_type_code: 'establishment_info',
    joining_service_date: 'establishment_info',
    retirement_date: 'establishment_info',
    ordering_authority: 'establishment_info',
    probation_end_dt: 'establishment_info',
    probation_feedback: 'establishment_info',
    notice_period: 'establishment_info',
    designation_group_code: 'establishment_info',
    uniform_ind: 'establishment_info',
    conv_code: 'establishment_info',
    family_planning: 'establishment_info',
    emp_sex: 'emp_personal_info',
    emp_email: 'emp_personal_info',
    emp_phone_no: 'emp_personal_info',
    emp_dob: 'emp_personal_info',
    emp_father_name: 'emp_personal_info',
    emp_pan_no: 'emp_personal_info',
    emp_adhar_no: 'emp_personal_info',
    bank_code: 'emp_personal_info',
    emp_gst_no: 'emp_personal_info',
    branch_code: 'emp_personal_info',
    ifsc_code: 'emp_personal_info',
    acct_no: 'emp_personal_info',
    pf_acct_no: 'emp_personal_info',
    identification_mark: 'emp_personal_info',
    gis_no: 'emp_personal_info',
    nps_no: 'emp_personal_info',
    reservation_category_code: 'emp_personal_info',
    marital_status: 'emp_personal_info',
    emp_husband_name: 'emp_personal_info',
    emp_religeon: 'emp_personal_info',
    emp_nationality: 'emp_personal_info',
    emp_mother_name: 'emp_personal_info',
    posting_date: 'post',
    posting_status_code: 'post',
    section_code: 'post',
    posting_type_code: 'post',
    education_name: 'education',
    education_type_code: 'education',
    pass_year_code: 'education',

    pay_component_code: 'fixed_pay_amount',
    pay_component_amt: 'fixed_pay_amount',
    effective_start_dt: 'fixed_pay_amount',
    effective_end_dt: 'fixed_pay_amount',
    pay_code: 'fixed_pay_amount',
  }
  datatype = {
    pay_scale_code: 'establishment_info',
    class_code: 'establishment_info',
    emp_id: 'establishment_info',
    emp_name: 'establishment_info',
    level_code: 'establishment_info',
    employee_current_type_code: 'establishment_info',
    establishment_type_code: 'establishment_info',
  
    cadre_code: 'establishment_info',
    grade_pay_code: 'establishment_info',
    pay_commission_code: 'establishment_info',
    emp_status_code: 'establishment_info',
    retirement_age: 'date',
    designation_code: 'establishment_info',
    order_id: 'establishment_info',
    promotion_type_code: 'establishment_info',
    inc_month: 'establishment_info',
    joining_date: 'date',
    joining_type_code: 'establishment_info',
    joining_service_date: 'establishment_info',
    retirement_date: 'date',
    ordering_authority: 'establishment_info',
    probation_end_dt: 'date',
    probation_feedback: 'establishment_info',
    notice_period: 'establishment_info',
    designation_group_code: 'establishment_info',
    uniform_ind: 'establishment_info',
    conv_code: 'establishment_info',
    family_planning: 'establishment_info',
    emp_sex: 'emp_personal_info',
    emp_email: 'emp_personal_info',
    emp_phone_no: 'emp_personal_info',
    emp_dob: 'date',
    emp_father_name: 'emp_personal_info',
    emp_pan_no: 'emp_personal_info',
    emp_adhar_no: 'emp_personal_info',
    bank_code: 'emp_personal_info',
    emp_gst_no: 'emp_personal_info',
    branch_code: 'emp_personal_info',
    ifsc_code: 'emp_personal_info',
    acct_no: 'emp_personal_info',
    pf_acct_no: 'emp_personal_info',
    identification_mark: 'emp_personal_info',
    gis_no: 'emp_personal_info',
    nps_no: 'emp_personal_info',
    reservation_category_code: 'emp_personal_info',
    marital_status: 'emp_personal_info',
    emp_husband_name: 'emp_personal_info',
    emp_religeon: 'emp_personal_info',
    emp_nationality: 'emp_personal_info',
    emp_mother_name: 'emp_personal_info',
    posting_date: 'date',
    posting_status_code: 'post',
    section_code: 'post',
    posting_type_code: 'post',
    education_name: 'education',
    education_type_code: 'education',
    pass_year_code: 'education',

    pay_component_code: 'fixed_pay_amount',
    pay_component_amt: 'fixed_pay_amount',
    effective_start_dt: 'date',
    effective_end_dt: 'date',
    pay_code: 'fixed_pay_amount',
  }

  ObjFieldTechNameToBusinessName = {};
  Status = [{ code: 'ALL', value: 'ALL' }, { code: 'ACTIVE', value: 'ACTIVE' }, { code: 'INACTIVE', value: 'INACTIVE' }];


  CadreArr = [];
  ClassArr = [];
  DesignationArr = [];
  SectionArr = [];
  EducationArr = [];
  PayCommissionArr = []; 
  result=[];
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllReport();
    await this.createFilterData();
    this.ObjFieldTechNameToBusinessName['serial_no'] = 'Serial No'
    for (let i = 0; i < this.project_fields.length; i++) {
      this.ObjFieldTechNameToBusinessName[this.project_fields[i]['field_technical_name']] = this.project_fields[i]['field_business_name'];
    }
    
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }


  createFilterData() {
   var  PayCommissionArr_temp=[];
   PayCommissionArr_temp.push({ code: 'ALL', value: 'ALL' });
    for (let i = 0; i < this.mainService.codeValueTechObj['HR0016'].length; i++) {
      PayCommissionArr_temp.push(this.mainService.codeValueTechObj['HR0016'][i]);
    }
    this.PayCommissionArr=PayCommissionArr_temp;




    var EducationArr_temp=[];
    EducationArr_temp.push({ code: 'ALL', value: 'ALL' });

    for (let i = 0; i < this.mainService.codeValueTechObj['HR0005'].length; i++) {
      EducationArr_temp.push(this.mainService.codeValueTechObj['HR0005'][i]);
    }
    this.EducationArr=EducationArr_temp;



    var SectionArr_temp=[{ code: 'ALL', value: 'ALL' }]
    for (let i = 0; i < this.mainService.codeValueTechObj['HR0031'].length; i++) {
      SectionArr_temp.push(this.mainService.codeValueTechObj['HR0031'][i]);
    }
    this.SectionArr=SectionArr_temp;



    var DesignationArr_temp=[{ code: 'ALL', value: 'ALL' }];
    for (let i = 0; i < this.mainService.codeValueTechObj['HR0011'].length; i++) {
      DesignationArr_temp.push(this.mainService.codeValueTechObj['HR0011'][i]);
    }
    this.DesignationArr=DesignationArr_temp;



    var ClassArr_temp=[{ code: 'ALL', value: 'ALL' }];
    for (let i = 0; i < this.mainService.codeValueTechObj['HR0014'].length; i++) {
      ClassArr_temp.push(this.mainService.codeValueTechObj['HR0014'][i]);
    }
    this.ClassArr=ClassArr_temp;



    var CadreArr_temp=[{ code: 'ALL', value: 'ALL' }];
    for (let i = 0; i < this.mainService.codeValueTechObj['HR0013'].length; i++) {
      CadreArr_temp.push(this.mainService.codeValueTechObj['HR0013'][i]);
    }
    this.CadreArr=CadreArr_temp;

  }

  open_update(element) {
    var temp = JSON.parse(element.filter_and_project);
    this.filter = Object.assign({}, temp['filter']);
    this.project = temp['project'];
    this.report_name = element.report_name;
    this.report_id = element.report_id;
    $('.nav-tabs a[href="#tab-4"]').tab('show');
  }

  async submit_and_view() {
    await this.submit();
    $('.nav-tabs a[href="#tab-2"]').tab('show');

  }

  createObj() {
    var education = [];
    var post = [];
    var emp_personal_info = [];
    var establishment_info = [];
    var fixed_pay_amount = [];


    for (let i = 0; i < this.project.length; i++) {
      if (this.table_name[this.project[i]] == 'education') {
        education.push(this.project[i]);
      } else if (this.table_name[this.project[i]] == 'post') {
        post.push(this.project[i]);

      } else if (this.table_name[this.project[i]] == 'emp_personal_info') {
        emp_personal_info.push(this.project[i]);

      } else if (this.table_name[this.project[i]] == 'establishment_info') {
        establishment_info.push(this.project[i]);

      } else if (this.table_name[this.project[i]] == 'fixed_pay_amount') {
        fixed_pay_amount.push(this.project[i]);
      }
    }

    var project_temp = new Object();
    project_temp['establishment_info'] = establishment_info;
    project_temp['emp_personal_info'] = emp_personal_info;
    project_temp['post'] = post;
    project_temp['education'] = education;
    project_temp['fixed_pay_amount'] = fixed_pay_amount;
    var filter_temp = new Object();
    var arr = []
    if (this.filter['cadre_code'] != 'ALL') {
      arr.push({ cadre_code: this.filter['cadre_code'] })
    }
    if (this.filter['class_code'] != 'ALL') {
      arr.push({ class_code: this.filter['class_code'] })
    }

    if (this.filter['designation_code'] != 'ALL') {
      arr.push({ designation_code: this.filter['designation_code'] })
    }

    if (this.filter['pay_commission_code'] != 'ALL') {
      arr.push({ pay_commission_code: this.filter['pay_commission_code'] })
    }

    if (this.filter['emp_status_code'] != 'ALL') {
      arr.push({ emp_status_code: this.filter['emp_status_code'] })
    }

    var arr1 = []
    if (this.filter['section_code'] != 'ALL') {
      arr1.push({ section_code: this.filter['section_code'] })
    }

    var arr2 = [];
    if (this.filter['education_name'] != 'ALL') {
      arr2.push({ education_name: this.filter['education_name'] })
    }


    filter_temp['establishment_info'] = arr;
    filter_temp['emp_personal_info'] = [];
    filter_temp['post'] = arr1;
    filter_temp['education'] = arr2;
    filter_temp['fixed_pay_amount'] = [];
    var obj = new Object();
    obj['project'] = project_temp;
    obj['filter'] = filter_temp;
    return obj;
  }

  // ngAfterViewInit(){
  //   //this.datasource_report = new MatTableDataSource(resp.data)
    // this.cdr.detectChanges();
  //   this.datasource_report.paginator = this.paginator1;
  //   this.datasource_report.sort = this.sort1;
  // }


  async submit() {

    var obj = this.createObj();
    var final_Query = this.createQuery(obj);
      var obj1 = new Object();
      obj1['b_acct_id'] = this.b_acct_id;
      obj1['query'] = final_Query;
    this.spinner.show()
      var resp = await this.hrmsReportService.getReport(obj1);
      if (resp['error'] == false) {
        this.displayedColumns1 = []
        if (resp.data.length > 0) {
           var column=Object.keys(resp.data[0]);
           this.displayedColumns1.push('serial_no')
           for(let i=0;i<column.length;i++){
            this.displayedColumns1.push(column[i])
           }
        }
        
        
       // this.cdr.detectChanges();
       var allEmplyees = resp.data
       var allEmplyees_new=[];

       for(let i=0;i<allEmplyees.length;i++){
         var obj=new Object();
         obj=allEmplyees[i];
         if(obj['emp_id'] != undefined){
           this.emp_id = true
           obj['serial_no'] = i+1
         obj['emp_id']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
         allEmplyees_new.push(obj)
         }
         else{
           allEmplyees[i]['serial_no'] = i+1
          allEmplyees_new.push(allEmplyees[i])
         }
       }
       this.result = allEmplyees_new;
        this.datasource1 = new MatTableDataSource(allEmplyees_new)
        this.datasource1.paginator= this.paginator1;
        this.datasource1.sort = this.sortCol2;
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.snackBar.open("Error while getting Report Data", 'Error', {
          duration: 5000
        });
      }
  }

  refresh() {
    this.filter = {};
    this.project = [];
  }

  async delete(element) {
    var obj = new Object();
    obj['report_id'] = element.report_id;
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.hrmsReportService.deleteReport(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.getAllReport();
      this.snackBar.open(resp.data, 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while deleting Report List", 'Error', {
        duration: 5000
      });
    }

  }

  async getAllReport() {
this.spinner.show()
    var resp = await this.hrmsReportService.getAllSavedreports(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allReport = resp.data;
      this.datasource = new MatTableDataSource(this.allReport)
      this.cdr.detectChanges();

      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  Report List", 'Error', {
        duration: 5000
      });
    }
  }


  async update() {
this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['report_name'] = this.report_name;
    obj['filter_and_project'] = JSON.stringify({ filter: this.filter, project: this.project });
    obj['update_user_id'] = this.erpUser.user_id;
    obj['report_id'] = this.report_id;
    var resp = await this.hrmsReportService.updateReport(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.getAllReport();
      $('#update-report').modal('hide');

      this.snackBar.open(resp.data, 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      $('#update-report').modal('hide');

      this.snackBar.open("Error while saved Report ", 'Error', {
        duration: 5000
      });
    }


  }
  async save() {
this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['report_name'] = this.report_name;
    obj['filter_and_project'] = JSON.stringify({ filter: this.filter, project: this.project });
    obj['create_user_id'] = this.erpUser.user_id;
    var resp = await this.hrmsReportService.createReport(obj);
    if (resp['error'] == false) {
      this.getAllReport();
      $('#save-report').modal('hide');
      this.spinner.hide();
      this.snackBar.open("Saved Report Successfully!!", 'Success', {
        duration: 5000
      });
    } else {
      $('#save-report').modal('hide');
      this.spinner.hide()
      this.snackBar.open("Error while saved Report ", 'Error', {
        duration: 5000
      });
    }
  }



  async submit_for_view(element) {

    var temp = JSON.parse(element.filter_and_project);
    this.filter = Object.assign({}, temp['filter']);
    this.project = temp['project'];
    await this.submit();
    $('.nav-tabs a[href="#tab-2"]').tab('show');

  }


  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  applyFilter1(filterValue: string) {
    this.datasource1.filter = filterValue.trim().toLowerCase();
  }
  export(){
    var ar=[]
    for(var i=0;i<this.result.length;i++){
      var obj = new Object();
      var keys = Object.keys(this.result[i]);
      obj['Sr No'] = this.result[i]['serial_no'];
      for(var j=0;j<keys.length;j++){
        if(keys[j]!='serial_no'){
          if(this.datatype[keys[j]]!='date'){
            obj[this.ObjFieldTechNameToBusinessName[keys[j]]] = this.result[i][keys[j]];

          }
          else{
            obj[this.ObjFieldTechNameToBusinessName[keys[j]]] = this.result[i][keys[j]].split('T')[0];

          }

        }
      }
      ar.push(obj);

    }
    this.excl.exportAsExcelFile(ar,'down')
  }


  print() {
    let printContents, popupWin;
    printContents = document.getElementById('p').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <html>
      <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      </head>
      <style>
      #tbl {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        max-width: 2480px;
        page-break-after:auto 
    }
    
    #tbl td,
    #tbl th {
        border: 1px solid #ddd;
        padding: 8px;
        width: auto;
        word-wrap: break-word;
        page-break-inside:avoid; page-break-after:auto 
    }

    
    
    #tbl th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #d9edf7;
      color: black;
  }
      </style>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
    );
    popupWin.document.close();


  }

  /***************************************************kunal Quer Create Code********************************** */

  createQuery(obj) {
    var query = ""
    query = this.createprojectPart(obj) + " " + this.createJoinPart(obj) + " " + this.createFilterPart(obj)

    return query;

  }
  createprojectPart(obj) {
    var str = 'select '
    if (obj['project']['establishment_info'].length > 0) {
      str += "est."
      str += obj['project']['establishment_info'].join(',est.')
      str += ','
    }
    if (obj['project']['emp_personal_info'].length > 0) {
      str += "emp."
      str += obj['project']['emp_personal_info'].join(',emp.')
      str += ','
    }
    if (obj['project']['post'].length > 0) {
      str += "posti."
      str += obj['project']['post'].join(',posti.')
      str += ','
    }

    if (obj['project']['education'].length > 0) {
      str += "edu."
      str += obj['project']['education'].join(',edu.')
      str += ','
    }
    if (obj['project']['fixed_pay_amount'].length > 0) {
      str += "fpa."
      str += obj['project']['fixed_pay_amount'].join(',fpa.')
      str += ','
    }
    str = str.substring(0, str.length - 1) + " from"
    return str
  }
  createJoinPart(obj) {
    let db = "svayam_" + this.b_acct_id + "_hr";

    let str = " (Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info )est "
    if (obj['project']['emp_personal_info'].length > 0 || obj['filter']['emp_personal_info'].length > 0) {
      str += " join " + db + ".emp_personal_info emp on est.emp_id=emp.emp_id"
    }
    if (obj['project']['post'].length > 0 || obj['filter']['post'].length > 0) {
      str += " join " + db + ".post posti on est.emp_id=posti.emp_id"
    } if (obj['project']['education'].length > 0 || obj['filter']['education'].length > 0) {
      str += " join " + db + ".education edu on est.emp_id=edu.emp_id"
    }
    if (obj['project']['fixed_pay_amount'].length > 0 || obj['filter']['fixed_pay_amount'].length > 0) {
      str += " join " + db + ".fixed_pay_amount fpa on est.emp_id=fpa.emp_id"
    }
    return str;
  }

  createFilterPart(obj) {
    var str = ' where  est.svm_rank=1 AND '
    if (obj['filter']['establishment_info'].length > 0) {
      let arr = obj['filter']['establishment_info']
      for (let i = 0; i < arr.length; i++) {
        str += "est." + Object.keys(arr[i])[0] + "='" + arr[i][Object.keys(arr[i])[0]].replace("'", "\\'") + "' AND "
        //str += "est." + Object.keys(arr[i])[0] + "='" + arr[i][Object.keys(arr[i])[0]] + "' AND "

      }

    }
    if (obj['filter']['emp_personal_info'].length > 0) {
      let arr = obj['filter']['emp_personal_info']
      for (let i = 0; i < arr.length; i++) {
        str += "emp." + Object.keys(arr[i])[0] + "='" + arr[i][Object.keys(arr[i])[0]].replace("'", "\\'") + "' AND "
      }

    }
    if (obj['filter']['post'].length > 0) {
      let arr = obj['filter']['post']
      for (let i = 0; i < arr.length; i++) {
        str += "posti." + Object.keys(arr[i])[0] + "='" + arr[i][Object.keys(arr[i])[0]].replace("'", "\\'") + "' AND "
      }

    }

    if (obj['filter']['education'].length > 0) {
      let arr = obj['filter']['education']
      for (let i = 0; i < arr.length; i++) {
        str += "edu." + Object.keys(arr[i])[0] + "='" + arr[i][Object.keys(arr[i])[0]].replace("'", "\\'") + "' AND "
      }

    }
    str = str.substring(0, str.length - 4)
    return str
  }
  printPdf(){
    var ar=[]
    var header=[]
    for(var i=0;i<this.result.length;i++){
      if(i==0){
        header.push("Sr No");


      }
      var obj = [];
      var keys = Object.keys(this.result[i]);
     obj.push(this.result[i]['serial_no']);
      for(var j=0;j<keys.length;j++){
        if(keys[j]!='serial_no'){
          if(i==0){

            header.push(this.ObjFieldTechNameToBusinessName[keys[j]]);

          }
          if(this.datatype[keys[j]]!='date'){
            obj.push(this.result[i][keys[j]]);

          }
          else{
            obj.push(this.result[i][keys[j]].split('T')[0]);

          }

        }
      }
      ar.push(obj);

    }
    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")";
    var dd = {
      pageMargins: [ 40, 60, 40, 60 ],
    pageSize: 'A4',
      header:[
        // { canvas: [{ type: 'line', x1: 10, y1: 30, x2: 595-10, y2: 30, lineWidth: 0.5 }] },

        { text: txt, alignment: 'center',margin: [72,40]}
        //return obj;
      ],


      pageOrientation: 'portrait',

      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      //pageMargins: [ 40, 60, 40, 60 ],
      
      content: [

      ]
    };

    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: [],
        layout: "headerLineOnly",
        body: [
         



          //[ 'Section Detail', 'Basic\nPay', 'Dep. \nAllow', 'DA/Relief','Medical \nAllow','Vehicle\nAllow','HRA','Wash\nAllow','Misc\nAllow','Total','LIC\n(1,2,3,4,5,6,7)','PF\nDed','Group\nIns.','IT','House\n Rent','Vehicle\n Ded','Vehicle\n Adv.','Bld Adv.\n(1,2,3)','PF Adv.\n(1,2,3)','Bank\n Adv.','EWF','Misc\nDed','Net. Sal.' ]



        ]
      }
    };
    var width = [];
    for(var i=0;i<header.length;i++){
      width.push('*');
    }
    tbl.table.widths=width;
  
    tbl.table.body.push(header);
    //tbl.table.body.push(ar);
    for(var i=0;i<ar.length;i++)
    tbl.table.body.push(ar[i]);

    dd.content.push("\n")
    dd.content.push({ text: "EMPLOYEE REPORT", alignment: 'center',bold:true});
    dd.content.push("\n")
    dd.content.push(tbl);
  

    pdfMake.createPdf(dd).download("employee_report.pdf");
  }
}
