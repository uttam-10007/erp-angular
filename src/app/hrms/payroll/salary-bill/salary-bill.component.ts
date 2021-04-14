import { Component, OnInit, ViewChild, KeyValueDiffers ,ElementRef} from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { SalaryHoldAndStartService } from '../../service/salary-hold-and-start.service';
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import {MainService} from '../../service/main.service';
import {EstablishmentService} from '../../service/establishment.service';

import {ApprService} from '../../service/appr.service';
import { UserAddService } from '../../../../app/portal/service/user-add.service';
 
declare var $: any
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-salary-bill',
  templateUrl: './salary-bill.component.html',
  styleUrls: ['./salary-bill.component.css']
})
export class SalaryBillComponent implements OnInit {
  monthObj={'1': 'January','2': 'February','3':'March','4': 'April','5': 'May','6':'June','7':'July','8':'August','9':'September','10':'October','11':'November','12':'December'}
  monthEnd={'1': 31,'2': 28,'3':31,'4': 30,'5': 31,'6':30,'7':31,'8':31,'9':30,'10':31,'11':30,'12':31}

  constructor(private userAdd:UserAddService,private apprService: ApprService,private establishmentService: EstablishmentService,public mainService: MainService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService, private SalaryHoldAndStartService: SalaryHoldAndStartService) { }
  erpUser;
  b_acct_id;
  salaryObj={accrual_date:'',b_acct_id:'',fin_year:'',month:'',section_code:'',emp_cat_code:'',post_info:{},emp_info:{},employement_info:{},bank_info : {},att_info:{},fixed_pay_info:{}, variable_pay_info:{},total_pay:{}}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;
  @ViewChild('paginator3', { static: false }) paginator3: MatPaginator;
  @ViewChild('sortCol3', { static: false }) sortCol3: MatSort;
  dataSource1;
  displayedColumns1 = ['bill_id', 'bill_desc', 'bill_status_code','bill_date','print','action'];
  displayedColumns = ['emp_id', 'emp_name','emp_phone_no', 'pay_component_code','pay_component_amt','pay_code'];
  displayedColumns3 = ['emp_id', 'emp_name','emp_phone_no', 'pay_component_code','pay_component_amt','pay_code'];
  datasource;
  datasource3;
  allEmplyees = [];
  allAttendance=[];
  billIdObj={}
  ind_emp_id;
  updateSalaryObj={};
  allBankAccount = [];
  allCurrentArrangements=[];
  allFixedPay = [];
  allEmplyees_new =[]
  allVariablePay =[];
  allPosting =[]
  salaryArr=[];
  allBillData=[];
  allRule={};
  allBillId=[];
  actualSalaryArr=[];
  currentBillObj={header:{},allEmployees:[],data:{},sums:{}};
  allApproval=[];
  stopObj={};
  t=[{code:'ind',value:'Individual'},{code:'sec',value:'Category Wise'}]
  statusArr=[];
  levelOfApproval={}
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getUsersInfo();
    await this.getAllEmployees();
    await this.getAllActiveEmployees();
    await this.getAllPosting();
    await this.getAllRule()
    await this.getsalarystatus();

  }


  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  data =[]
  async getsalarystatus() {
    this.data=[]
    this.spinner.show()
    var arr = []
    var holdsalary = []
    //this.allStop = [];
    var resp = await this.SalaryHoldAndStartService.getsalarystatus(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      var dt = resp.data;
      // for (var i = 0; i < dt.length; i++){
      //   if (dt[i]['status'] == 'STOP'){
      //     this.allStop.push(dt[i]);
      //   }
      // }
      arr = dt;
      for (let i = 0; i < arr.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, arr[i]);
        obj['tempid'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id'])+'- ' + obj['emp_name']+' STOP From '+this.monthObj[obj['stop_month']]+','+obj['stop_fin_year'] +' to '
        if(obj['start_month'] == null){
          obj['tempid'] = obj['tempid'] +' Till Now'

        }else{
          obj['tempid'] = obj['tempid']+' ' +this.monthObj[obj['start_month']] +','+obj['start_fin_year']
        }
        holdsalary.push(obj)
      }
      this.data = holdsalary

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all  list", 'Error', {
        duration: 5000
      });
    }
  }
  hold_emp_id
  paid_arr = []
  hold_emp_id_no
  paid_sal = []
  async getSalaryhold(){
    this.paid_arr = []
    console.log('123')
    var obj1 = Object()
    var paid = []
    for (let i = 0; i < this.data.length; i++) {
      if(this.data[i]['id'] == this.hold_emp_id){
        obj1 = this.data[i]
        if(this.data[i]['paid'] == null){
          paid = []
        }else{
          paid = JSON.parse(this.data[i]['paid'])
        }
        
      }
      
    }
    this.paid_sal = paid
    console.log(obj1)
    if(obj1['start_month'] == obj1['stop_month'] && obj1['start_fin_year'] == obj1['stop_fin_year']){
      swal.fire('Success',' Salary Already Paid','success');
      return
    }
    if(obj1['start_month'] == null){
      obj1['start_fin_year'] = new Date().getFullYear();
      obj1['start_month'] = new Date().getMonth() +1;
    }
    let date =  new Date().getMonth();
console.log(date);
    var stop_fin_year = obj1['stop_fin_year']
    var fin_year_arr = []
    while (stop_fin_year <= obj1['start_fin_year']) {
     fin_year_arr.push(stop_fin_year)
     stop_fin_year = Number(stop_fin_year) + 1
     
    }
    console.log(fin_year_arr)
  /*  for (let i = 0; i < fin_year_arr.length; i++) {
    console.log(obj1['start_month'])
     for (let j = Number(obj1['stop_month']); j <= 12; j++) {
       console.log(obj1['start_month'])
       if(j < obj1['start_month'] || fin_year_arr[i] <= obj1['start_fin_year']){
         var obj2 = Object()
         obj2['fin_year'] = fin_year_arr[i]
         obj2['month'] = j
         obj2['check'] = false
         this.paid_arr.push(obj2)
       }
       
     }
     
   } */
   var enddate  =  obj1['start_fin_year']+"-"+obj1['start_month']+"-"+1
   var startdate =  obj1['stop_fin_year']+"-"+obj1['stop_month']+"-"+1
   var obj4 = Object()
   obj4['fin_year'] = obj1['stop_fin_year']
   obj4['month'] = obj1['stop_month']
   obj4['check'] = false
   this.paid_arr.push(obj4)
   //for (let i = 0; i < fin_year_arr.length; i++) {
     var stdate =new Date(startdate) 
     var endate = new Date(enddate)
   while (stdate.getTime() < endate.getTime() ) {
    var dt = new Date(stdate);
    dt.setMonth( dt.getMonth() + 1 );
    stdate = dt
   var obj2 = Object()
   var dtstring = dt.getFullYear()
    + '-' + (dt.getMonth()+1)
    + '-' + (dt.getDate())
    var arr = dtstring.split("-")
    obj2['fin_year'] = arr[0]
    obj2['month'] = arr[1]
    obj2['check'] = false
    this.paid_arr.push(obj2)
    //startdate = arr[0]+"-"+Number(arr[1])+1+"-"+1 
    console.log(stdate)
   }
  //}
   if(paid == null){
     paid = []
   }
   for (let i = 0; i < this.paid_arr.length; i++) {
    for (let j = 0; j < paid.length; j++) {
     if(this.paid_arr[i]['month'] == paid[j]['month'] && this.paid_arr[i]['fin_year'] == paid[j]['fin_year']){
      this.paid_arr.splice(i, 1);
     }
      
    }
     
   }
   this.hold_emp_id_no = obj1['emp_id']
   $('#myModal2').modal('show');
  }
  sal_arr = []
  check(item,i){
    console.log(i)
  
    if( this.paid_arr[i]['check'] == true){
      this.paid_arr[i]['check'] = false
    }else{
      this.paid_arr[i]['check'] = true
    }
    console.log(item)
  }
  flag_sal = false
  hold_sal = []
  async generateSalaryhold(){
    this.spinner.show();
    //$('#myModal2').modal('close');
    this.hold_sal = []
    //this.salaryObj={accrual_date:'',b_acct_id:'',fin_year:'',month:'',section_code:'',emp_cat_code:'',post_info:{},emp_info:{},employement_info:{},bank_info : {},att_info:{},fixed_pay_info:{}, variable_pay_info:{},total_pay:{}}
    this.salaryObj['type'] = 'ind'

    await this.getFixedPay()

   // await this.getVariablePay();
    //await this.getAllAttandence();
   // await this.getSalaryStatus();
   
   this.stopObj = {};
   this.ind_emp_id = [this.hold_emp_id_no]
   for (let i = 0; i < this.paid_arr.length; i++) {
     if(this.paid_arr[i]['check'] == true){
      this.flag_sal = true
      this.salaryObj['fin_year'] = this.paid_arr[i]['fin_year']
      this.salaryObj['month'] = this.paid_arr[i]['month']
      await this.calculateSalary();
     }
     
     
   }
   console.log(this.hold_sal)
   this.salaryArr = this.hold_sal
   this.datasource3 = new MatTableDataSource(this.hold_sal);
   this.datasource3.paginator = this.paginator3;
   this.datasource3.sort = this.sortCol3;
   
    this.spinner.hide();
  }
  async generateholdSalary(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    for (let i = 0; i < this.paid_arr.length; i++) {
      if(this.paid_arr[i]['check'] == true){
       this.paid_sal.push(this.paid_arr[i])
      }
      
      
    }
    obj['paid'] = JSON.stringify(this.paid_sal)
    obj['id'] = this.hold_emp_id
    this.spinner.show();
    var resp = await this.SalaryHoldAndStartService.updatesalary(obj);
    console.log(resp)
    if (resp['error'] == false) {
      this.spinner.hide();

      swal.fire('Success',' Status Changed Successfully','success')
     this.generateSalary()
     await this.getsalarystatus();
     
    
    } else {
      this.spinner.hide();
      swal.fire('Error','Error Occured','error')
     
    }
  }
  async getAllBillID(){
    var obj = new Object();
    this.billIdObj['b_acct_id'] = this.b_acct_id;
    
    var resp = await this.payableService.getAllBillId(JSON.stringify(this.billIdObj));
    if(resp['error'] == false){
      this.allBillId = resp.data;
      this.dataSource1 = new MatTableDataSource(this.allBillId);
      this.dataSource1.paginator = this.paginator1
      this.dataSource1.sort = this.sortCol2;
    }else{
      this.snackBar.open("Error in getting All Bill", 'Error', {
        duration: 5000
      });
    }
  }
  async getbillbydate(){
    var obj = new Object();
    this.billIdObj['b_acct_id'] = this.b_acct_id;
    
    var resp = await this.payableService.getbillbydate(JSON.stringify(this.billIdObj));
    if(resp['error'] == false){
      this.allBillId = resp.data;
      this.dataSource1 = new MatTableDataSource(this.allBillId);
      this.dataSource1.paginator = this.paginator1
      this.dataSource1.sort = this.sortCol2;
    }else{
      this.snackBar.open("Error in getting All Bill", 'Error', {
        duration: 5000
      });
    }
  }
  async getAllBill(element,type){
    this.currentBillObj ={header:{},allEmployees:[],data:{},sums:{}};

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['bill_id'] = element['bill_id'];
    this.spinner.show()
    var resp = await this.payableService.getAllBill(JSON.stringify(obj));
    if(resp['error']==false){
      var billObj={};
      var header="";
      var dt =  resp['data'];
      console.log(dt)
      if(dt.length>0){
        header = dt[0];
      }
      var grand=undefined;
      var month="";
      var fin_year="";
      var fixedarr = []
      for(var i=0;i<dt.length;i++){
        //header = dt[0];
        if(billObj[dt[i]['section_code']]==undefined){
          month = dt[i]['month'];
          fin_year = dt[i]['fin_year'];
          billObj[dt[i]['section_code']]={};
          billObj[dt[i]['section_code']]['data']={};//{'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[]};
          billObj[dt[i]['section_code']]['total']={'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,NPS:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[],total:0.00,net:0.00};
          if(grand == undefined){
            grand = {'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,NPS:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[],total:0.00,net:0.00};
          }
        }
        if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']] == undefined){
           fixedarr = []
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']] = {emp_id:'',emp_name:'',designation_code:'',grade_pay_code:'',pay_band:'',sal_acc:'',pf:'',pf_ifsc:'','BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,'NPS':0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[],total:0.00,net:0.00};
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['emp_id']="VDA"+this.getNumberFormat(dt[i]['emp_id']);
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['emp_name']=this.salaryObj.emp_info[dt[i].emp_id]['emp_name'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['designation_code']=this.salaryObj.employement_info[dt[i].emp_id]['designation_code'];;
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['grade_pay_code']="GP "+this.salaryObj.employement_info[dt[i].emp_id]['grade_pay_code'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pay_band']='PB '+'('+this.salaryObj.employement_info[dt[i].emp_id]['pay_scale_code']+')';
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['sal_acc']=this.salaryObj.emp_info[dt[i].emp_id]['acct_no'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pf']=this.salaryObj.emp_info[dt[i].emp_id]['pf_acct_no'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pf_ifsc']=this.salaryObj.emp_info[dt[i].emp_id]['pf_ifsc_code'];
        }
     
        if(dt[i]['pay_code'] =='PAY'){
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['total'] +=dt[i]['pay_component_amt']; 
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['net'] +=dt[i]['pay_component_amt'];
          billObj[dt[i]['section_code']]['total']['total'] +=dt[i]['pay_component_amt']; 
          billObj[dt[i]['section_code']]['total']['net'] +=dt[i]['pay_component_amt'];
          grand['total'] +=dt[i]['pay_component_amt']; 
          grand['net'] +=dt[i]['pay_component_amt']; 
          if(!fixedarr.includes(dt[i]['pay_component_code'])){
            fixedarr.push(dt[i]['pay_component_code'])
          if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']]!=undefined){
            billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
            grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
          }else{
            billObj[dt[i]['section_code']]['total']['miscpay'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});
            grand['miscpay'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['miscpay'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});
          }
        }else{            billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

          if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"] == undefined){
          var temp = grand[dt[i]['pay_component_code']]
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"] = []
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push( billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']])
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push(dt[i]['pay_component_amt'])

          grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

          }else{
            grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push(dt[i]['pay_component_amt'])
          }

        }
        }else{
          if(!fixedarr.includes(dt[i]['pay_component_code'])){
            fixedarr.push(dt[i]['pay_component_code'])
          billObj[dt[i]['section_code']]['total']['net'] -=dt[i]['pay_component_amt'];
          grand['net'] -=dt[i]['pay_component_amt'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['net'] -=dt[i]['pay_component_amt'];
          if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']]!=undefined){
            billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
            grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
          }else{
            billObj[dt[i]['section_code']]['total']['miscded'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});
            grand['miscded'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['miscded'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});
          }
        }else{     
        billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
        billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['net'] -=dt[i]['pay_component_amt'];
        if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"] == undefined){
        var temp = grand[dt[i]['pay_component_code']]
        billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"] = []
       billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push( billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']])
        billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push(dt[i]['pay_component_amt'])
  
        grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
  
        }else{
          grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
  
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push(dt[i]['pay_component_amt'])
        }
  
      }
        }
    
     
      }
      if(type=='bill'){
        console.log(fixedarr)
        console.log(billObj,header,grand,month,fin_year)
        this.print(billObj,header,grand,month,fin_year);

      }
      else{
        this.print1(billObj,header,grand,month,fin_year);
      }
      this.spinner.hide()
    }else{
      this.spinner.hide();
      swal.fire("Error","Error while printing pay bill",'error')
    }
  }


  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    var resp = await this.payableService.getEmployeeMasterData(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data;
      
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
        
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        this.allEmplyees.push(obj)
      } 
      this.allEmplyees_new=[];
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.allEmplyees_new.push(obj)
      }
      for(var i=0;i<this.allEmplyees.length;i++){
        this.salaryObj.emp_info[this.allEmplyees[i].emp_id]=this.allEmplyees[i];
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }

  async getAllActiveEmployees(){
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    //obj['emp_status_code'] = ['ACTIVE']
    var resp = await this.payableService.getArrayAllCurrentEstablishementInfo(JSON.stringify(obj));
    if(resp['error']==false){
      this.spinner.hide()
      this.allCurrentArrangements = resp['data'];
      for(var i=0;i<this.allCurrentArrangements.length;i++){
        this.salaryObj.employement_info[this.allCurrentArrangements[i].emp_id]=this.allCurrentArrangements[i];

      }
      
    }else{
      this.spinner.hide()
    }
  }

  async getAllAttandence(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    this.salaryObj.att_info={}
    if(this.salaryObj.month=='1' || this.salaryObj.month=='2' || this.salaryObj.month=='3'){
      obj['year'] = parseInt(this.salaryObj.fin_year)+1;
    }else{
      obj['year'] = this.salaryObj.fin_year;
    }
    obj['month'] = this.salaryObj.month;
    var resp = await this.payableService.getAllAttendence(obj);
    if(resp['error']==false){
      this.allAttendance = resp.data;
      for(var i=0;i<this.allAttendance.length;i++){
        if(this.salaryObj.att_info[this.allAttendance[i].emp_id] ==undefined){
          this.salaryObj.att_info[this.allAttendance[i].emp_id] = [];
        }
        this.salaryObj.att_info[this.allAttendance[i].emp_id]=this.allAttendance[i];

      }
    }else{
      swal.fire("Error","Error while getting Attendance Info",'error');
    }
  }
  async getAllPosting(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
   
    var resp = await this.payableService.getAllPosting(obj);
    if(resp['error']==false){
      this.allPosting = resp.data;
      for(var i=0;i<this.allPosting.length;i++){
        
        this.salaryObj.post_info[this.allPosting[i].emp_id]=this.allPosting[i].section_code;

      }
    }else{

    }
  }
  async getVariablePay(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['year'] = this.salaryObj.fin_year;
    obj['month'] = this.salaryObj.month;
    this.salaryObj.variable_pay_info={};
    var resp = await this.payableService.getEffectiveVariablePay(obj);
    if(resp['error'] == false){
      this.allVariablePay = resp.data;
      for(var i=0;i<this.allVariablePay.length;i++){
        if((this.allVariablePay[i].fin_year == this.salaryObj.fin_year && this.allVariablePay[i].month == this.salaryObj.month && this.allVariablePay[i].pay_code == 'DED')){
          if(this.salaryObj.variable_pay_info[this.allVariablePay[i].emp_id] == undefined){
            this.salaryObj.variable_pay_info[this.allVariablePay[i].emp_id] =[];
          }
          this.salaryObj.variable_pay_info[this.allVariablePay[i].emp_id].push(this.allVariablePay[i]);
        }
      }
    }else{
      swal.fire("Error","Error while Getting All Variable Deductions",'error');
    }
  }
 
  async getFixedPay(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['month'] = this.salaryObj.month;
    this.getLeap(year);

    var year;
    if(this.salaryObj.month=='1' || this.salaryObj.month=='2' || this.salaryObj.month=='3'){
      year = parseInt(this.salaryObj.fin_year)+1;
    }else{
      year = parseInt(this.salaryObj.fin_year);
    }
    obj['year'] = year;
    obj['end_dt'] = '2090-10-10';
    
    this.salaryObj.fixed_pay_info={};
    var resp = await this.payableService.getEffectiveFixedSalary(obj);
    if(resp['error'] == false){
      this.allFixedPay = resp.data;
      for(var i=0;i<this.allFixedPay.length;i++){
          if(this.salaryObj.fixed_pay_info[this.allFixedPay[i].emp_id] == undefined){
            this.salaryObj.fixed_pay_info[this.allFixedPay[i].emp_id] =[];
          }
            this.salaryObj.fixed_pay_info[this.allFixedPay[i].emp_id].push(this.allFixedPay[i]);

          
        
      }
    }else{
      swal.fire("Error","Error while getting Fixed Pay",'error');
    }
  }
  async getSalaryStatus(){
    var resp = await this.payableService.getstopsalary(this.b_acct_id);
    if (resp['error'] == false) {
      var dt = resp['data'];
      for(var i=0;i<dt.length;i++){
        if(dt[i]['status']=='STOP'){
          this.stopObj[dt[i]['emp_id']] = 1;
        }
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all  list", 'Error', {
        duration: 5000
      });
    }
  }
  async getSalary(){
    //variable_pay
    this.spinner.show();
    await this.getFixedPay()
   // await this.getVariablePay();
    //await this.getAllAttandence();
    await this.getSalaryStatus();

    await this.calculateSalary();
    this.spinner.hide();


  }
  getLeap(year){
    //var year = this.attendanceObj['year'];
    var leap =false;
    if(year % 4 == 0)
    {
            if( year % 100 == 0)
            {
                // year is divisible by 400, hence the year is a leap year
                if ( year % 400 == 0)
                    leap = true;
                else
                    leap = false;
            }
            else
                leap = true;
    }
    else
      leap = false;
    if(leap ==true){
      this.monthEnd[2] = 29;
    }


  }

  async calculateSalary(){
    console.log(this.salaryObj)
    this.salaryArr = []
    var year;
    if(this.salaryObj.month=='1' || this.salaryObj.month=='2' || this.salaryObj.month=='3'){
      year = parseInt(this.salaryObj.fin_year)+1;
    }else{
      year = parseInt(this.salaryObj.fin_year);
    }
    var flag =false;
    var errorMsg="";
    var activeEmps = Object.keys(this.salaryObj.employement_info);
    if(this.salaryObj['type'] == 'ind'){
      activeEmps = this.ind_emp_id;
      // this.salaryObj.section_code = this.salaryObj.post_info[activeEmps[0]]
      // this.salaryObj.emp_cat_code = this.salaryObj.emp_info[activeEmps[0]]['emp_cat_code']

    }
  
    var payObj={};
    var accrual_date = this.salaryObj.accrual_date;
    //*********************Fix and Variable Pay Calculation */
   
    for(var i=0;i<activeEmps.length;i++){
      if(this.salaryObj.post_info[activeEmps[i]]==undefined){
        this.salaryObj.post_info[activeEmps[i]] = "ESP";
      }
      if((this.salaryObj.emp_info[activeEmps[i]]['emp_cat_code'] == this.salaryObj.emp_cat_code || this.salaryObj['type'] == 'ind') && (this.stopObj[activeEmps[i]] == undefined || this.stopObj[activeEmps[i]] =='START')){
       var salArr = this.salaryObj.fixed_pay_info[activeEmps[i]];
        if(salArr == undefined){
          salArr=[];
        }
       var salObj={}
       if(salArr!=undefined){
       for(var j=0;j<salArr.length;j++){
         
         var effectiveStartDate = salArr[j].effective_start_dt;
         var effectiveEndDate = salArr[j].effective_end_dt
         var x = effectiveStartDate.split('-');
         var y = effectiveEndDate.split('-');
         var effectiveStartYear = parseInt(x[0]);
         var effectiveStartMonth = parseInt(x[1]);
         var effectiveStartDay = parseInt(x[2]);
         var effectiveEndYear = parseInt(y[0]);
         var effectiveEndMonth = parseInt(y[1]);
         var effectiveEndDay = parseInt(y[2]);
           console.log(effectiveStartYear);
          console.log(effectiveStartMonth);
           console.log(effectiveStartDay);
          console.log(effectiveEndYear);
          console.log(effectiveEndMonth);
           console.log(effectiveEndDay);
         if(activeEmps[i]=='20'){
          // console.log(effectiveStartYear);
          // console.log(effectiveStartMonth);
          // console.log(effectiveStartDay);
          // console.log(effectiveEndYear);
          // console.log(effectiveEndMonth);
          // console.log(effectiveEndDay);
         }
         var currYear = parseInt(this.salaryObj.fin_year);
         var currMonth = parseInt(this.salaryObj.month);
         if(currMonth ==1 || currMonth ==2 || currMonth == 3){
           currYear +=1;
         }

         if(currYear>effectiveStartYear || (currYear == effectiveStartYear && currMonth>=effectiveStartMonth)){
            var start = 1;
            var end = this.monthEnd[this.salaryObj.month];
            if(currYear == effectiveStartYear && currMonth == effectiveStartMonth){
              start = effectiveStartDay;
            }
            if(currYear == effectiveEndYear && currMonth == effectiveEndMonth){
              end = effectiveEndDay;
              //end=end-1;
            }
          console.log(salArr[j]["pay_component_code"]+"-"+String( end-start+1) )
            if(end-start+1>=0){
              if(salObj[salArr[j]["pay_component_code"]+"-"+String( end-start+1)] == undefined){
                salObj[salArr[j]["pay_component_code"]+"-"+String( end-start+1)]={type:'fix',pay_component_code: salArr[j].pay_component_code,emp_id: activeEmps[i],pay_code : salArr[j].pay_code,pay_component_amt: 0,num_of_days:end-start+1};
               }
              if(salObj[salArr[j]["pay_component_code"]+"-"+String( end-start+1)]['pay_code']=='PAY'){
                salObj[salArr[j]["pay_component_code"]+"-"+String( end-start+1)]['pay_component_amt'] =   Math.round(salObj[salArr[j]["pay_component_code"]+"-"+String( end-start+1)]['pay_component_amt'] + parseFloat((salArr[j].pay_component_amt*(end-start+1)/this.monthEnd[this.salaryObj.month]).toFixed(2)));

              }else{
                salObj[salArr[j]["pay_component_code"]+"-"+String( end-start+1)]['pay_component_amt'] =   salArr[j].pay_component_amt;

              }
              console.log(salObj[salArr[j]["pay_component_code"]+"-"+String( end-start+1)]['pay_component_amt'] )
              console.log(salObj)
            }


         }
       }
       }
       var keys = Object.keys(salObj);
       for(var j=0;j<keys.length;j++){
       this.salaryArr.push(salObj[keys[j]]);
       }
       console.log(this.salaryArr)
       
      }
     
      
    }
    //********************Attendance Calculation , Suspended Calculation*/
    var emps=[]
    for(var i=0;i<this.salaryArr.length;i++){
      var present_days;
      var absent_days;
      var total_days;
      if(emps.indexOf(this.salaryArr[i].emp_id)<0){
        emps.push(this.salaryArr[i].emp_id);
      }
 
        if(this.salaryArr[i].type=='fix' && this.salaryArr[i].pay_code == 'PAY'){
          
          if(payObj[this.salaryArr[i].emp_id]==undefined){
            payObj[this.salaryArr[i].emp_id] = 0;
          }
          payObj[this.salaryArr[i].emp_id]+=this.salaryArr[i].pay_component_amt;

        }
        this.salaryArr[i]['b_acct_id'] = this.b_acct_id;
        this.salaryArr[i]['emp_id'] = this.salaryArr[i].emp_id;
        this.salaryArr[i]['fin_year'] = this.salaryObj.fin_year;
        this.salaryArr[i]['month'] = this.salaryObj.month;
        if(this.salaryObj['type'] == 'ind'  && this.flag_sal == true){
          this.salaryArr[i]['bill_desc'] = "Pay Bill for "+this.mainService.accInfo['account_short_name'] +this.getNumberFormat(this.salaryArr[i].emp_id) +"-"+this.salaryObj.emp_info[this.salaryArr[i].emp_id].emp_name/* " hold employees"+ *///" for Month "+this.monthObj[this.salaryObj.month]+", "+year;

        }else if(this.salaryObj['type'] == 'ind'){
          this.salaryArr[i]['bill_desc'] = "Pay Bill for "+this.mainService.accInfo['account_short_name'] +this.getNumberFormat(this.salaryArr[i].emp_id) +"-"+this.salaryObj.emp_info[this.salaryArr[i].emp_id].emp_name+/* " hold employees"+ */" for Month "+this.monthObj[this.salaryObj.month]+", "+year;

        }
        else{
          this.salaryArr[i]['bill_desc'] = "Pay Bill for "+this.mainService.codeValueShowObj['HR0046'][this.salaryObj.emp_cat_code]+" for Month "+this.monthObj[this.salaryObj.month]+", "+year;

        }
        console.log(this.monthEnd[this.salaryObj.month])
        this.salaryArr[i]['pay_component_code'] = this.salaryArr[i].pay_component_code;
        this.salaryArr[i]['pay_code'] = this.salaryArr[i].pay_code;
        this.salaryArr[i]['section_code'] = this.salaryObj.post_info[this.salaryArr[i].emp_id];
        this.salaryArr[i]['bill_status_code'] = "GENERATED";
        this.salaryArr[i]['create_user_id'] = this.erpUser.user_id;
        this.salaryArr[i]['emp_name'] = this.salaryObj.emp_info[this.salaryArr[i].emp_id].emp_name;
        this.salaryArr[i]['emp_phone_no'] = this.salaryObj.emp_info[this.salaryArr[i].emp_id].emp_phone_no;
        this.salaryArr[i]['accrual_date'] = accrual_date;
        this.salaryArr[i]['bill_date'] = accrual_date;
        //this.salaryArr[i]['num_of_days'] = this.monthEnd[this.salaryObj.month] - absent_days;
        if(this.salaryArr[i]['pay_component_code'] == 'NPS'){
          this.salaryArr[i]['pay_component_amt'] = Math.round(this.salaryArr[i]['pay_component_amt'])
        }

      


    }
  
   
    //***************************Deduction Normalisation */
    this.actualSalaryArr=[];
    var salObjNew={}
    for(var i = 0;i<this.salaryArr.length;i++){
      if(salObjNew[this.salaryArr[i].emp_id] == undefined){
        salObjNew[this.salaryArr[i].emp_id] ={};
      }
      salObjNew[this.salaryArr[i].emp_id][this.salaryArr[i]["pay_component_code"]+"-"+i] = this.salaryArr[i];
    }
    var seq = ['BASIC','DA','HRA','CCA','MA','PB','CONV','PERSNLPAY','GIS'];
    for(var i=0;i<emps.length;i++){
      var obj = salObjNew[emps[i]];
      var keys = Object.keys(obj);

      for(var j=0;j<seq.length;j++){
        if(obj[seq[j]]!=undefined){
          if(obj[seq[j]].pay_code =='PAY'){
            this.actualSalaryArr.push(obj[seq[j]]);

          }else{
            if(obj[seq[j]].pay_component_amt <= payObj[emps[i]]){
              this.actualSalaryArr.push(obj[seq[j]]);
              payObj[emps[i]] -= obj[seq[j]].pay_component_amt;
            }else{
              obj[seq[j]].pay_component_amt = payObj[emps[i]]
              payObj[emps[i]]=0;
              this.actualSalaryArr.push(obj[seq[j]]);

            }
          }
        }
      }
      for(var j=0;j<keys.length;j++){
        if(seq.indexOf(keys[j])<0){
          if(obj[keys[j]].pay_code =='PAY' || obj[keys[j]].pay_code =='CONT'){
            this.actualSalaryArr.push(obj[keys[j]]);
          }else{
            if(obj[keys[j]].pay_component_amt <= payObj[emps[i]]){
              this.actualSalaryArr.push(obj[keys[j]]);
              payObj[emps[i]] -= obj[keys[j]].pay_component_amt;
            }else{
              obj[keys[j]].pay_component_amt = payObj[emps[i]]
              payObj[emps[i]]=0;
              this.actualSalaryArr.push(obj[keys[j]]);

            }
          }
        }
      }
    }

    console.log(this.actualSalaryArr)
    if(flag == false && this.flag_sal == false){
      this.datasource = new MatTableDataSource(this.actualSalaryArr);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
     
    }else if(flag == false && this.flag_sal == true ){
     console.log(this.salaryArr)
     for (let i = 0; i < this.actualSalaryArr.length; i++) {
       this.hold_sal.push(this.actualSalaryArr[i])
       
     }
      this.flag_sal = false
    }
    else{
      this.salaryArr = [];
      this.actualSalaryArr = [];
      swal.fire("Error",errorMsg,'error');
      this.datasource = new MatTableDataSource(this.actualSalaryArr);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    }

  }

  async sendBillToAccount(num){
    var billObj = new Object();
    billObj["b_acct_id"] = this.b_acct_id;
    billObj['data'] = [];
    var amt=0;
    var cb_description = '';
    var cb_date="";

    for(var i=0;i<this.salaryArr.length;i++){
      amt+= this.salaryArr[i].pay_component_amt;
      cb_date = this.salaryArr[i]['bill_date'];
      cb_description = this.salaryArr[i]['bill_desc'];
      var ob = new Object();
      ob['account_amount']= this.salaryArr[i].pay_component_amt
      ob['account_code'] = this.salaryArr[i].pay_component_code
      ob['party_id'] = "HR"+this.salaryArr[i]['emp_id'];
      ob['cb_description'] = cb_description;
      ob['cb_date'] = cb_date;
      ob['source_code'] = "HR";

      ob['source_local_no'] = "HR"+num;
     
      billObj['data'].push(JSON.stringify(ob));
    }

    billObj["cb_description"] = cb_description;
    billObj['cb_amount'] = amt;
    billObj['cb_date'] = cb_date;
    billObj['cb_status'] = "PENDING"
    billObj['source_local_no'] = "HR"+num
    billObj['source_code'] = "HR"
    
    billObj['create_user_id'] = this.erpUser.user_id;
    var resp = await this.payableService.createContingentBill(billObj);
    if(resp['error'] == false){

    }else{
      this.spinner.hide();
      swal.fire('Error','Error while sending the bill to accounts','error');
    }
  }
  async schedule(num){
    var s = "SALBILL"
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] =[];
    for(var i=0;i<this.allApproval.length;i++){
      if(this.allApproval[i]['doc_type'] == s){
        obj['data'].push({user_id:this.allApproval[i]['user_id'],level_of_approval: this.allApproval[i]['level_of_approval'],doc_type: this.allApproval[i]['doc_type'],create_user_id: this.erpUser.user_id,doc_local_no: num['bill_id'],doc_local_desc: num['bill_desc'], status: 'PENDING'})
      }
    }
    var resp = await this.payableService.sendToApproval(obj);
    if(resp['error'] == false){
      await this.statusChange(num);
      await this.getAllBillID();
      this.spinner.hide();
    }else{
      this.spinner.hide();
      swal.fire('Error','Error while sending the bill to accounts','error');
    }
  }
  async insertIntoAccount(source_local_no){
    var partyObj=new Object();
    partyObj['b_acct_id'] = this.b_acct_id;
    partyObj['data'] = [];
    var obj={};
    for(var i=0;i<this.salaryArr.length;i++){
      obj[this.salaryArr[i].emp_id] = this.salaryObj.emp_info[this.salaryArr[i].emp_id];
    }
    var keys  = Object.keys(obj);
    for(var i=0;i<keys.length;i++){
      var ob = new Object();
      ob['party_id'] = "HR"+obj[keys[i]]['emp_id'];
      ob['party_legal_name'] = obj[keys[i]]['emp_name']
      ob['party_origination_source_code'] = "HR"
      ob['party_type_code'] ="EMPLOYEE"
      ob['party_gst_no'] = ''
      ob['party_adhaar_no'] = ''
      ob['party_pan_no'] =  obj[keys[i]]['emp_pan_no']
      ob['party_phone_no'] = obj[keys[i]]['emp_phone_no']
      ob['party_email'] = obj[keys[i]]['emp_email']
      ob['party_city'] = obj[keys[i]]['emp_local_addr_city']
      ob['party_district'] = obj[keys[i]]['emp_local_addr_dist']
      ob['party_addr_line1']  = obj[keys[i]]['emp_local_addr_line1']
      ob['party_addr_line2'] = obj[keys[i]]['emp_local_addr_line2']
      ob['party_state'] = obj[keys[i]]['emp_local_addr_state']
      ob['party_country'] = "INDIA"
      ob['party_pin_code']  = obj[keys[i]]['emp_local_addr_pin_code']
      ob['party_bank_acct_no'] - obj[keys[i]]['acct_no'] 
      ob['party_bank_code'] = obj[keys[i]]['bank_code']
      ob['party_branch_code'] = obj[keys[i]]['branch_code'] 
      ob['party_ifsc_code'] = obj[keys[i]]['ifsc_code']
      ob['pf_acct_no'] = obj[keys[i]]['pf_acct_no']
      ob['gis_no'] = obj[keys[i]]['gis_no']
      ob['nps_no'] = obj[keys[i]]['nps_no']
      ob['party_local_no'] = obj[keys[i]]['emp_id']
      ob['create_user_id']   = this.erpUser.user_id;
      partyObj['data'].push(ob);
      
    }
    var resp = await this.payableService.createparty(partyObj);
    if(resp['error'] == false){
      //await this.sendBillToAccount(source_local_no);
      //await this.sendToApproval(source_local_no);
    }else{
      this.spinner.hide();
      swal.fire("Error","Error while adding Updating Employee Detail in Accounts",'error');
    }
  }
  
  async generateSalary(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] = this.salaryArr;
    this.spinner.show();
    var resp = await this.payableService.generateSalaryBill(obj);
    if(resp['error'] == false){
      //await this.sendToApproval(resp['data']);
      await this.getAllBillID();
      //await this.insertIntoAccount(1);
      this.spinner.hide();
      swal.fire('Success','Bill Generated Successfully','success');

        
    }else{
      this.spinner.hide();
      swal.fire('Error','Error in Bill Generation','error');
    }

  }
  async statusChange(element){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['update_user_id'] = this.erpUser.user_id;
    obj['bill_id'] = element.bill_id;
    obj['bill_status_code'] = "SCHEDULED";
    //this.spinner.show();
    var resp = await this.payableService.changeStatusOfBill(obj);
    if(resp['error'] == false){
      //await this.sendToApproval(resp['data']);
      //await this.getAllBillID();
      //await this.insertIntoAccount(1);
      //this.spinner.hide();
      //swal.fire('Success','Bill Generated Successfully');

        
    }else{
      this.spinner.hide();
      swal.fire('Error','Error in Bill Generation','error');
    }

  }
  async getAllRule(){
    this.spinner.show()
    var resp = await this.apprService.getAllApproval(this.b_acct_id);
    if(resp['error'] == false){
      this.spinner.hide()
      this.allApproval = resp['data'];
      for(var i=0;i<this.allApproval.length;i++){
        if(this.allApproval[i]['doc_type'] == 'SALBILL'){
          this.levelOfApproval[this.allApproval[i]['level_of_approval']] = this.allApproval[i];
        }
      }
    }else{
      this.spinner.hide()
    }
  }

  print(billObj,header,grand,month,fin_year){
    //var txt = "VARANASASI DEVELOPMENT AUTHORITY(VDA)   Officers/THIRD/FOURTH Category EMPLOYEES STATEMENT FOR THE MONTH OF June,2020   PIRNT DATE: 2020-10-10"
    var txt=this.mainService.accInfo['account_name']+"("+this.mainService.accInfo['account_short_name']+")"+"   "+header['bill_desc']+"   Date: "+header['accrual_date'];
    var dd ={
      pageSize: 'A3',
      header:function(currentPage, pageCount) { 
        var obj = {text: txt+"     Page No. - "+currentPage,alignment: 'center',margin: [72,40]};
        return obj; 
      },
      
      //footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; },

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',
    
      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [ 40, 60, 40, 60 ],
      //pageMargins: [ 40, 20, 20, 20 ],
      content: [
        
      ]
    };
    var sections = Object.keys(billObj);
    var count=0;
    for(var i=0;i<sections.length;i++){
      var data = billObj[sections[i]];

      var sectionText={ text: 'Section : '+sections[i], fontSize: 8};
      if(i!=0){
        sectionText['pageBreak'] = 'before'
      }
      dd.content.push(sectionText);
      var tbl ={
     
        layout: 'lightHorizontalLines',
        fontSize: 10, 
        table: {
     
          headerRows: 1,
          widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
          
          body: [
            [ 'Emp\nDetail', 'Basic\nPay', 'Dep.\nAllow', 'DA/Relief','Med\nAllow','Veh\nAllow','HRA','WA','Misc\nAllow','Total','LIC','PF\nDed','NPS','Group\nIns.','IT','House\nRent','Veh\nDed','Veh\nAdv.','Bld\nAdv.','PF\nAdv.','Bank\nAdv.','EWF','Misc\nDed','Net.\nSal.' ]
           
            
            
          ]
        }
      };
      dd.content.push(tbl);
      var emps= Object.keys(data['data']);
      count=count+emps.length;
      for(var j=0;j<emps.length;j++){
        var obj = data['data'][emps[j]];
        var arr=[];
        var str = obj['emp_id']+"\n"+obj['emp_name']+"\n"+obj['designation_code']+"\n"+obj['grade_pay_code']+"\n"+obj['pay_band']+"\n"+"SAL A/C - "+obj['sal_acc'];
        if(obj['pf']!=undefined && obj['pf']!=null && obj['pf']!=0){
          str+="\n"+"PF A/C - "+obj['pf']
        }
        if(obj['pf_ifsc']!=undefined && obj['pf_ifsc']!=null && obj['pf_ifsc']!=0){
          str+="\n"+"PF Ifsc - "+obj['pf_ifsc']
        }
        arr.push(str);
        if(obj['BASIC_arr'] != undefined){
          for (let i = 0; i < obj['BASIC_arr'].length; i++) {
            if(i == 0){
              var basic=obj['BASIC_arr'][i]
 
            }else{
               basic=basic+"\n"+obj['BASIC_arr'][i]

            }

            
          }
          arr.push(basic);
        }else{
          arr.push(obj['BASIC']);

        }
      if(obj['DEP_arr'] != undefined){
          for (let i = 0; i < obj['DEP_arr'].length; i++) {
            if(i == 0){
              var DEP=obj['DEP_arr'][i]
 
            }else{
              DEP=DEP+"\n"+obj['DEP_arr'][i]

            }

            
          }
          arr.push(DEP);
        }else{
          arr.push(obj['DEP']);

        }
        if(obj['DA_arr'] != undefined){
          for (let i = 0; i < obj['DA_arr'].length; i++) {
            if(i == 0){
              var DA=obj['DA_arr'][i]
 
            }else{
              DA=DA+"\n"+obj['DA_arr'][i]

            }

            
          }
          arr.push(DA);
        }else{
          arr.push(obj['DA']);

        }
        if(obj['MA_arr'] != undefined){
          for (let i = 0; i < obj['MA_arr'].length; i++) {
            if(i == 0){
              var MA=obj['MA_arr'][i]
 
            }else{
              MA=MA+"\n"+obj['MA_arr'][i]

            }

            
          }
          arr.push(MA);
        }else{
          arr.push(obj['MA']);

        } 
        if(obj['VA_arr'] != undefined){
          for (let i = 0; i < obj['VA_arr'].length; i++) {
            if(i == 0){
              var VA=obj['VA_arr'][i]
 
            }else{
              VA=VA+"\n"+obj['VA_arr'][i]

            }

            
          }
          arr.push(VA);
        }else{
          arr.push(obj['VA']);

        } if(obj['HRA_arr'] != undefined){
          for (let i = 0; i < obj['HRA_arr'].length; i++) {
            if(i == 0){
              var HRA=obj['HRA_arr'][i]
 
            }else{
              HRA=HRA+"\n"+obj['HRA_arr'][i]

            }

            
          }
          arr.push(HRA);
        }else{
          arr.push(obj['HRA']);

        }
        if(obj['WA_arr'] != undefined){
          for (let i = 0; i < obj['WA_arr'].length; i++) {
            if(i == 0){
              var WA=obj['WA_arr'][i]
 
            }else{
              WA=WA+"\n"+obj['WA_arr'][i]

            }

            
          }
          arr.push(WA);
        }else{
          arr.push(obj['WA']);

        }
       /*  arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']); */
        //arr.push(obj['VA']);
       // arr.push(obj['HRA']);
       // arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var str1="";
        for(var k=0;k<miscpay.length;k++){
          if(k==0){
            str1+=miscpay[k]['code'] +" - "+ miscpay[k]['amount'];
          }else{
            str1+="\n"+miscpay[k]['code'] +" - "+ miscpay[k]['amount'];
          }

        }
        if(str1!=""){
          arr.push(str1);
        }
        else{
          arr.push(0.00);
        }
        arr.push(obj['total']);
        var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];

        arr.push(licstr);
        if(obj['PF_arr'] != undefined){
          for (let i = 0; i < obj['PF_arr'].length; i++) {
            if(i == 0){
              var PF=obj['PF_arr'][i]
 
            }else{
               PF=PF+"\n"+obj['PF_arr'][i]

            }

            
          }
          arr.push(PF);
        }else{
          arr.push(obj['PF']);

        }
      if(obj['NPS_arr'] != undefined){
          for (let i = 0; i < obj['NPS_arr'].length; i++) {
            if(i == 0){
              var NPS=obj['NPS_arr'][i]
 
            }else{
              NPS=NPS+"\n"+obj['NPS_arr'][i]

            }

            
          }
          arr.push(NPS);
        }else{
          arr.push(obj['NPS']);

        }
        if(obj['GIS_arr'] != undefined){
          for (let i = 0; i < obj['GIS_arr'].length; i++) {
            if(i == 0){
              var GIS=obj['GIS_arr'][i]
 
            }else{
              GIS=GIS+"\n"+obj['GIS_arr'][i]

            }

            
          }
          arr.push(GIS);
        }else{
          arr.push(obj['GIS']);

        }
        if(obj['IT_arr'] != undefined){
          for (let i = 0; i < obj['IT_arr'].length; i++) {
            if(i == 0){
              var IT=obj['IT_arr'][i]
 
            }else{
              IT=IT+"\n"+obj['IT_arr'][i]

            }

            
          }
          arr.push(IT);
        }else{
          arr.push(obj['IT']);

        } 
        if(obj['HRR_arr'] != undefined){
          for (let i = 0; i < obj['HRR_arr'].length; i++) {
            if(i == 0){
              var HRR=obj['HRR_arr'][i]
 
            }else{
              HRR=HRR+"\n"+obj['HRR_arr'][i]

            }

            
          }
          arr.push(HRR);
        }else{
          arr.push(obj['HRR']);

        } if(obj['VD_arr'] != undefined){
          for (let i = 0; i < obj['VD_arr'].length; i++) {
            if(i == 0){
              var VD=obj['VD_arr'][i]
 
            }else{
              VD=VD+"\n"+obj['VD_arr'][i]

            }

            
          }
          arr.push(VD);
        }else{
          arr.push(obj['VD']);

        }
        if(obj['VADV_arr'] != undefined){
          for (let i = 0; i < obj['VADV_arr'].length; i++) {
            if(i == 0){
              var VADV=obj['VADV_arr'][i]
 
            }else{
              VADV=VADV+"\n"+obj['VADV_arr'][i]

            }

            
          }
          arr.push(VADV);
        }else{
          arr.push(obj['VADV']);

        }
       /*  arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']); */
        var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
        arr.push(bldstr);
        var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
        arr.push(pfstr);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var str2="";
        for(var k=0;k<miscded.length;k++){
          if(k==0){
            str2+=miscded[k]['code'] +" - "+ miscded[k]['amount'];
          }else{
            str2+="\n"+miscded[k]['code'] +" - "+ miscded[k]['amount'];
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }

        arr.push(obj['net']);
        
        dd.content[dd.content.length-1].table.body.push(arr);
      }
      var obj = data['total'];
        var arr=[];
        var str = "Section : "+sections[i]+"\n";
        str+="Total Employees : "+emps.length;
        
        arr.push(str);
        arr.push(obj['BASIC']);
        arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']);
        arr.push(obj['VA']);
        arr.push(obj['HRA']);
        arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var miscpayObj={};
        for(var k=0;k<miscpay.length;k++){
          if(miscpayObj[miscpay[k]['code']]==undefined){
            miscpayObj[miscpay[k]['code']] =0;
          }
          miscpayObj[miscpay[k]['code']]+= miscpay[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscpayObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscpayObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscpayObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }
        arr.push(obj['total']);
        var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];

        arr.push(licstr);
        arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']);
        var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
        arr.push(bldstr);
        var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
        arr.push(pfstr);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var miscdedObj={};
        for(var k=0;k<miscded.length;k++){
          if(miscdedObj[miscded[k]['code']]==undefined){
            miscdedObj[miscded[k]['code']] =0;
          }
          miscdedObj[miscded[k]['code']]+= miscded[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscdedObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscdedObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscdedObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }

        arr.push(obj['net']);
        
        dd.content[dd.content.length-1].table.body.push(arr);

    }
    var totalText={ text: 'Grand Total'+"\nTotal Employees : "+count, fontSize: 10,bold:true};

    var obj = grand;
     var arr=[]
     arr.push(totalText);
     arr.push(obj['BASIC']);
     arr.push(obj['DEP']);
     arr.push(obj['DA']);
     arr.push(obj['MA']);
     arr.push(obj['VA']);
     arr.push(obj['HRA']);
     arr.push(obj['WA']);
     var miscpay = obj['miscpay'];
     var miscpayObj={};
     for(var k=0;k<miscpay.length;k++){
       if(miscpayObj[miscpay[k]['code']]==undefined){
         miscpayObj[miscpay[k]['code']] =0;
       }
       miscpayObj[miscpay[k]['code']]+= miscpay[k]['amount'];
     }
     var str2="";
     var keys=Object.keys(miscpayObj);
     for(var k=0;k<keys.length;k++){
       if(k==0){
         str2+=keys[k] +" - "+ miscpayObj[keys[k]];
       }else{
         str2+="\n"+keys[k] +" - "+ miscpayObj[keys[k]];;
       }

     }
     if(str2!=""){
       arr.push({text:str2,fontSize:8});
     }
     else{
       arr.push(0.00);
     }
     arr.push({text:obj['total'],bold:true});
     var amt = obj['LIC1']+obj['LIC2']+obj['LIC3']+obj['LIC4']+obj['LIC5']+obj['LIC6']+obj['LIC7']
     //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
     //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
     arr.push(amt);
     arr.push(obj['PF']);
     arr.push(obj['NPS']);

     arr.push(obj['GIS']);
     arr.push(obj['IT']);
     arr.push(obj['HRR']);
     arr.push(obj['VD']);
     arr.push(obj['VADV']);
     amt = obj['BLDADV1']+obj['BLDADV2']+obj['BLDADV3'];
     //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
     arr.push(amt);
     amt = obj['PFADV']+obj['PFADV1']+obj['PFADV2'];
     //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
     arr.push(amt);
     arr.push(obj['BADV']);
     arr.push(obj['EWF']);
     var miscded = obj['miscded'];
     var miscdedObj={};
     for(var k=0;k<miscded.length;k++){
       if(miscdedObj[miscded[k]['code']]==undefined){
         miscdedObj[miscded[k]['code']] =0;
       }
       miscdedObj[miscded[k]['code']]+= miscded[k]['amount'];
     }
     var str2="";
     var keys=Object.keys(miscdedObj);
     for(var k=0;k<keys.length;k++){
       if(k==0){
         str2+=keys[k] +" - "+ miscdedObj[keys[k]];
       }else{
         str2+="\n"+keys[k] +" - "+ miscdedObj[keys[k]];;
       }

     }
     if(str2!=""){
       arr.push({text:str2,fontSize:8});
     }
     else{
       arr.push(0.00);
     }

     arr.push({text: obj['net'],bold:true});
     
     dd.content[dd.content.length-1].table.body.push(arr);
     dd.content.push("\n\n");
     var sign1={
      columns: [
        {
          width: '*',
          text: 'PREPARED BY:',
          bold: true
        },

        {
          width: '*',
          text: 'CHECKED BY:' ,
          bold: true
        },
        {
          width: '*',
          text: 'SIGNED BY:',
          bold: true
        }

        
      ],

    }
     dd.content.push("\n\n\n");
     dd.content.push(sign1);
     dd.content.push("\n\n");
     dd.content.push({text:"CERTIFIED:",bold:true})
     dd.content.push("\n\n");
     dd.content.push({text:"1. That I have satisfied myself that all the salaries included in the bills drawn in the month of "+this.monthObj[month]+"/"+fin_year+" [the last preceding month] with the exception of those detailed below of which total has been refunded by deduction from the bill has been distributed to the proper persons and their receipts have been taken in acquittance rolls field in my office with reciept-stamp dully cancelled for every payment in access of Rs. 20 and that all leaves and promotions etc have been in the service book of the official concerned."})
     dd.content.push("\n");
     dd.content.push({text:"2. That all persons for whom pay has been drawn in this bill have actually been entertained during the month."})
     dd.content.push("\n");

     dd.content.push({text:"3. That all the persons for whom house-rent allowance has been shown in this bill actually occupied a rented house for which they paid rent as shown in this bill and are entitled to the allowance under the standing instructions."})
     dd.content.push("\n");

     dd.content.push({text:"4. That all the persons in respect of whom conveyance allowance has been drawn in the bill have satisfied me that they have actually maintained the conveyance in a workable condition and have been using them."})
     dd.content.push("\n");

     dd.content.push({text:"5. That the bill has been checked with the sanctioned in the scale register."})
     dd.content.push("\n");

     dd.content.push({text:"Date :                                                    Signature Of Drawing Officer:"})
     dd.content.push("\n");

     dd.content.push({text:"Pay Rs. ....................................."})


 
  
    pdfMake.createPdf(dd).download();
  }
  print1(billObj,header,grand,month,fin_year){
    if(month == 1 || month == 2 || month ==3){
      fin_year=fin_year+1;
    }
    //var txt = "VARANASASI DEVELOPMENT AUTHORITY(VDA)   Officers/THIRD/FOURTH Category EMPLOYEES STATEMENT FOR THE MONTH OF June,2020   PIRNT DATE: 2020-10-10"
    var txt=this.mainService.accInfo['account_name']+"("+this.mainService.accInfo['account_short_name']+")"+"   "+header['bill_desc']+"   Date: "+header['accrual_date'];
    var dd ={
      pageSize: 'A3',
      header:function(currentPage, pageCount) { 
        var obj = {text: txt+"     Page No. - "+currentPage,alignment: 'center',margin: [72,40]};
        return obj; 
      },
      
      //footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; },

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',
    
      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [ 40, 60, 40, 60 ],
      //pageMargins: [ 40, 20, 20, 20 ],
      content: [
        
      ]
    };
    var sections = Object.keys(billObj);
    var count =0;
    var tbl ={
     
      layout: 'lightHorizontalLines',
      fontSize: 10, 
      table: {
   
        headerRows: 1,
        widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
        
        body: [
          [ 'Section\nDetail', 'Basic\nPay', 'Dep.\nAllow', 'DA/Relief','Med\nAllow','Veh\nAllow','HRA','WA','Misc\nAllow','Total','LIC','PF\nDed','NPS','Group\nIns.','IT','House\n Rent','Veh\nDed','Veh\nAdv.','Bld\nAdv.','PF\nAdv.','Bank\nAdv.','EWF','Misc\nDed','Net.\nSal.' ]

          //[ 'Section Detail', 'Basic\nPay', 'Dep. \nAllow', 'DA/Relief','Medical \nAllow','Vehicle\nAllow','HRA','Wash\nAllow','Misc\nAllow','Total','LIC\n(1,2,3,4,5,6,7)','PF\nDed','Group\nIns.','IT','House\n Rent','Vehicle\n Ded','Vehicle\n Adv.','Bld Adv.\n(1,2,3)','PF Adv.\n(1,2,3)','Bank\n Adv.','EWF','Misc\nDed','Net. Sal.' ]
         
          
          
        ]
      }
    };
    dd.content.push(tbl);
    for(var i=0;i<sections.length;i++){
      var data = billObj[sections[i]];
      var emps= Object.keys(data['data']);
      count+=emps.length;
        var obj = data['total'];
        var arr=[];
        var sectionText={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 10,bold:true};

       
        
        arr.push(sectionText);
        arr.push(obj['BASIC']);
        arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']);
        arr.push(obj['VA']);
        arr.push(obj['HRA']);
        arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var miscpayObj={};
        for(var k=0;k<miscpay.length;k++){
          if(miscpayObj[miscpay[k]['code']]==undefined){
            miscpayObj[miscpay[k]['code']] =0;
          }
          miscpayObj[miscpay[k]['code']]+= miscpay[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscpayObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscpayObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscpayObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }
        arr.push({text:obj['total'],bold:true});
        var amt = obj['LIC1']+obj['LIC2']+obj['LIC3']+obj['LIC4']+obj['LIC5']+obj['LIC6']+obj['LIC7']
        //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
        //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
        arr.push(amt);
        arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']);
        amt = obj['BLDADV1']+obj['BLDADV2']+obj['BLDADV3'];
        //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
        arr.push(amt);
        amt = obj['PFADV']+obj['PFADV1']+obj['PFADV2'];
        //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
        arr.push(amt);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var miscdedObj={};
        for(var k=0;k<miscded.length;k++){
          if(miscdedObj[miscded[k]['code']]==undefined){
            miscdedObj[miscded[k]['code']] =0;
          }
          miscdedObj[miscded[k]['code']]+= miscded[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscdedObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscdedObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscdedObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }

        arr.push({text: obj['net'],bold:true});
        
        dd.content[dd.content.length-1].table.body.push(arr);

    }
    var sectionText={ text: 'Grand Total'+"\nTotal Employees : "+count, fontSize: 10,bold:true};

       var obj = grand;
        var arr=[]
        arr.push(sectionText);
        arr.push(obj['BASIC']);
        arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']);
        arr.push(obj['VA']);
        arr.push(obj['HRA']);
        arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var miscpayObj={};
        for(var k=0;k<miscpay.length;k++){
          if(miscpayObj[miscpay[k]['code']]==undefined){
            miscpayObj[miscpay[k]['code']] =0;
          }
          miscpayObj[miscpay[k]['code']]+= miscpay[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscpayObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscpayObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscpayObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }
        arr.push({text:obj['total'],bold:true});
        var amt = obj['LIC1']+obj['LIC2']+obj['LIC3']+obj['LIC4']+obj['LIC5']+obj['LIC6']+obj['LIC7']
        //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
        //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
        arr.push(amt);
        arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']);
        amt = obj['BLDADV1']+obj['BLDADV2']+obj['BLDADV3'];
        //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
        arr.push(amt);
        amt = obj['PFADV']+obj['PFADV1']+obj['PFADV2'];
        //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
        arr.push(amt);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var miscdedObj={};
        for(var k=0;k<miscded.length;k++){
          if(miscdedObj[miscded[k]['code']]==undefined){
            miscdedObj[miscded[k]['code']] =0;
          }
          miscdedObj[miscded[k]['code']]+= miscded[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscdedObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscdedObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscdedObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }

        arr.push({text: obj['net'],bold:true});
        
        dd.content[dd.content.length-1].table.body.push(arr);
        dd.content.push("\n\n");
       var sign= {
          columns: [
            {
              // auto-sized columns have their widths based on their content
              width: 'auto',
              text: 'PREPARED BY:',
              bold: true,
              fontSize:10
            },
            {
              // auto-sized columns have their widths based on their content
              width: 'auto',
              text: 'CHECKED BY:',
              bold: true,
              fontSize:10
            },
            {
              // auto-sized columns have their widths based on their content
              width: 'auto',
              text: 'SIGNED BY:',
              bold: true,
              fontSize:10
            },
            
           
          ]
        }
        var sign1={
          columns: [
            {
              width: '*',
              text: 'PREPARED BY:',
              bold: true
            },
    
            {
              width: '*',
              text: 'CHECKED BY:' ,
              bold: true
            },
            {
              width: '*',
              text: 'SIGNED BY:',
              bold: true
            }
    
            
          ],
    
        }
        dd.content.push("\n\n\n");
        dd.content.push(sign1);
        dd.content.push("\n\n");
        dd.content.push({text:"CERTIFIED:",bold:true})
        dd.content.push("\n\n");
        dd.content.push({text:"1. That I have satisfied myself that all the salaries included in the bills drawn in the month of "+this.monthObj[month]+"/"+fin_year+" [the last preceding month] with the exception of those detailed below of which total has been refunded by deduction from the bill has been distributed to the proper persons and their receipts have been taken in acquittance rolls field in my office with reciept-stamp dully cancelled for every payment in access of Rs. 20 and that all leaves and promotions etc have been in the service book of the official concerned."})
        dd.content.push("\n");
        dd.content.push({text:"2. That all persons for whom pay has been drawn in this bill have actually been entertained during the month."})
        dd.content.push("\n");

        dd.content.push({text:"3. That all the persons for whom house-rent allowance has been shown in this bill actually occupied a rented house for which they paid rent as shown in this bill and are entitled to the allowance under the standing instructions."})
        dd.content.push("\n");

        dd.content.push({text:"4. That all the persons in respect of whom conveyance allowance has been drawn in the bill have satisfied me that they have actually maintained the conveyance in a workable condition and have been using them."})
        dd.content.push("\n");

        dd.content.push({text:"5. That the bill has been checked with the sanctioned in the scale register."})
        dd.content.push("\n");

        dd.content.push({text:"Date :                                                    Signature Of Drawing Officer:"})
        dd.content.push("\n");

        dd.content.push({text:"Pay Rs. ....................................."})

  
    pdfMake.createPdf(dd).download();
  }

  async deleteBill(element){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['bill_id'] = element.bill_id;
    this.spinner.show();
    var resp = await this.payableService.deleteBill(JSON.stringify(obj));
    if(resp['error'] == false){
      //await this.sendToApproval(resp['data']);
      await this.getAllBillID();
      //await this.insertIntoAccount(1);
      this.spinner.hide();
      swal.fire('Success','Bill Deleted Successfully','success');

        
    }else{
      this.spinner.hide();
      swal.fire('Error','Error in Bill Deletion','error');
    }

  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  applyFilter1(filterValue: string) {

    this.dataSource1.filter = filterValue.trim().toLowerCase();
  } 
  applyFilter3(filterValue: string) {

    this.datasource3.filter = filterValue.trim().toLowerCase();
  }

  allUser=[];
  UserObj={};
  async getUsersInfo(){
    var obj={b_acct_id: this.b_acct_id};
    var resp = await this.userAdd.getAllUsersInfo(JSON.stringify(obj));
    console.log(resp);
    if(resp['error']==false){
      this.allUser = resp['data'];
      for(let i=0;i<this.allUser.length;i++){
        this.UserObj[this.allUser[i]['user_id']]=this.allUser[i]['first_name']+" "+this.allUser[i]['last_name']
        this.allUser[i]['name']=this.allUser[i]['first_name']+" "+this.allUser[i]['last_name']
      }
    }else{
      
    }
  }

  async status(element){
    var obj=new Object();
    console.log(element);
    obj["b_acct_id"] = this.b_acct_id;
    obj["bill_id"] = element.bill_id;
    this.spinner.show();
    var resp = await this.payableService.getSalaryDocumentStatus(obj);
    console.log(resp);
    if(resp['error'] == false){
      this.statusArr = resp['data'];
      $('#myModal').modal('show');
      this.spinner.hide()
    }else{
      this.spinner.hide();
      swal.fire("Error","Error while getting status",'error');
    }
  }



}
