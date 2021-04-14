
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ScriptLoaderService } from '../../_services/script-loader.service';
import { ProfileService } from '../service/profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainService } from '../service/main.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUploader } from 'ng2-file-upload';
import {Router} from '@angular/router';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
declare var $: any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-portal-user-profile',
  templateUrl: './portal-user-profile.component.html',
  styleUrls: ['./portal-user-profile.component.css']
})
export class PortalUserProfileComponent implements OnInit {

  constructor(private sanitizer: DomSanitizer, private router:Router,private mainService: MainService, private _script: ScriptLoaderService, private profileService: ProfileService, private snackBar: MatSnackBar) { }
  empObj = { emp_id: '', emp_name: '', email: '', contact_no: '', addr_line_1: '', addr_line_2: '', designation: '' };
  pass = { password: '', new_password: '', confirm_new_password: '' }
  erpUser;
  imgURL;
  updateObj = {};
  selectedFile: File = null;
  isUpload;
  state_arr = [];
  public imagePath;
  httpUrl;
  uploader;
  estabInfo=[];
  personalInfoObj={};
  designation="UNKNOWN";
  selectFileType = null
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.httpUrl = this.profileService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'pimage' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };

    await this.getEmpInfo();
    await this.getUserImage();
    await this.getEstablishmentInfo()
  }

  async getEmpInfo() {
    var resp = await this.profileService.getUserProfileInfo(this.erpUser.user_id);
    console.log(resp);
    if (resp['error'] == false) {
      this.empObj = resp['data'][0];
      this.updateObj = Object.assign({}, this.empObj);
    } else {
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000,
      });
    }

  }
  back(){
    this.router.navigate(['/index'])
  }
  getNumberFormat(num) {
    if(num!=undefined){
      return num.toString().padStart(3, "0")
    }else{
      return num
    }
  }
  async getEstablishmentInfo(){
    var obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['email'] = this.empObj['email'];
    obj['phone_no'] = this.empObj['work_phone_no'];
    var resp = await this.profileService.getEstablishmentInfo(JSON.stringify(obj));
    console.log(resp);
    if(resp['error'] == false){
      if(resp['data'].length>0){
        this.personalInfoObj = resp['data'][0];
        this.personalInfoObj['emp_dob']=this.dateformatchange(this.personalInfoObj['emp_dob']);
        this.personalInfoObj['joining_date']=this.dateformatchange(this.personalInfoObj['joining_date']);
        this.personalInfoObj['joining_service_date']=this.dateformatchange(this.personalInfoObj['joining_service_date']);
      }
      console.log(this.personalInfoObj)

      this.estabInfo=resp['data'];
      console.log( this.estabInfo)
      if(this.estabInfo.length!=0){
        this.designation = this.estabInfo[resp['data'].length-1]['designation_code']
      }
    }else{

    }
  }

  dateformatchange(date){
    if(date==undefined || date==null || date==''){
      return 'DD/MM/YYYY';
    }
    var datear1 = date.split('T')[0]
    var datearr = datear1.split("-") 
    return datearr[2]+'/'+datearr[1]+'/'+datearr[0]
  }

  async getUserImage() {
    const res = await this.profileService.getImage(this.erpUser.user_id);
    if (res) {
      const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
      this.imgURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
      this.mainService.profileImageUrl = this.imgURL;

    }
  }
  async updatePassword() {
    console.log(this.pass);
    if (this.pass.new_password == this.pass.confirm_new_password) {
      this.pass['user_id'] = this.erpUser.user_id;
      var resp = await this.profileService.changePassword(this.pass);
      console.log(resp);
      if (resp['error'] == false) {
        this.snackBar.open(resp['data'], 'Success', {
          duration: 5000,
        });
      } else {
        this.snackBar.open(resp['data'], 'Error', {
          duration: 5000,
        });
      }
    } else {
      this.snackBar.open('Password and confirm password does not match', 'Error', {
        duration: 5000,
      });
    }

  }
  async updateEmpInfo() {
    var resp = await this.profileService.updateProfile(this.updateObj);
    console.log(resp);
    if (resp['error'] == false) {
      this.getEmpInfo();
      this.snackBar.open(resp['data'], 'Success', {
        duration: 5000,
      });
    } else {
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000,
      });
    }
  }
  async Upload() {
    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    const obj = new Object();
    obj['user_id'] = this.erpUser.user_id;
    obj['file_name'] = this.uploader.queue[0].some.name;
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/uploadimage' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      if (!response.error) {
        const res = await this.profileService.getImage(this.erpUser.user_id);

        if (res) {
          const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
          this.imgURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
          this.mainService.profileImageUrl = this.imgURL;
        }
        console.log("Image Uploaded!!!")
        Swal.fire('Success..', 'Uploaded Successfully', 'success')

      } else {
        Swal.fire('Error...', 'Some Error Occured', 'error')

      }
    };
  }
  onFileUpload(event, files) {
    this.selectedFile = <File>event.target.files[0];

    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };

  }
  ngAfterViewInit() {
    this._script.load('./assets/js/scripts/profile-demo.js');
  }
  async print1() {
    console.log(this.estabInfo)
    var txt = this.mainService.accInfo['account_name'] + '(' + this.mainService.accInfo['account_short_name'] + ')'
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
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
          text: 'Establishment Information',
          bold: true,
          alignment: 'center'
        }

      ],
    }
   
    var header1 = {
      columns: [
        {
          width: '*',
          text: 'Legal Name :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj['emp_name']
        },
        {
          width: '*',
          text: 'Employee ID :',
          bold: true
        },

        {
          width: '*',
          text: 'VDA'+''+this.getNumberFormat(this.personalInfoObj['emp_id'])
        }

      ],
    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Bank Account Number :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj['acct_no']
        },
        {
          width: '*',
          text: 'Adhar Number  :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj['emp_adhar_no']
        }

      ],
    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'DOB :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj['emp_dob']
        },
        {
          width: '*',
          text: 'Email :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj['emp_email']
        }

      ],
    }
    var header4 = {
      columns: [
       
        {
          width: '*',
          text: 'Father/Husband Name :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj['emp_father_name']
        },
        {
          width: '*',
          text: 'Identification Mark  :',
          bold: true
        },

        {
          width: '*',
          text:this.personalInfoObj['identification_mark']
        }

      ],
    }
    var header5 = {
      columns: [
       
        {
          width: '*',
          text: 'Joining Date :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj['joining_date']
        },
        {
          width: '*',
          text: 'Joining Of Service Date :',
          bold: true
        },

        {
          width: '*',
          text:this.personalInfoObj['joining_service_date']
        }

      ],
    }
    var header6 = {
      columns: [
       
        {
          width: '*',
          text: 'Marital Status :',
          bold: true
        },

        {
          width: '*',
          text:this.personalInfoObj['marital_status']
        },
        {
          width: '*',
          text: "Pf Account Number ",
          bold: true
        },
        {
          width: '*',
          text: this.personalInfoObj['pf_status_no'],
          bold: true
        },

      ],
    }
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header0);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push({ text: " " });
    dd.content.push(header2);
    dd.content.push({ text: " " });
    dd.content.push(header3);
    dd.content.push({ text: " " });
    dd.content.push(header4);
    dd.content.push({ text: " " });
    dd.content.push(header5);
    dd.content.push({ text: " " });
    dd.content.push(header6);
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
    var tbl = {

      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*','*', '*', '*', '*', '*'],
        body: [
          ['S NO.', 'DESIGNATION', 'CLASS', {text:'GRADE PAY',alignment:'right'}, {text:'PAY BAND',alignment:'right'}, {text:'LEVEL',alignment:'right'}]
        ],
      }
    };
    dd.content.push(tbl);
    for (var i = 0; i < this.estabInfo.length; i++) {
      var arr = []
      arr.push(i + 1);
      arr.push(this.estabInfo[i]['designation_code']);
      arr.push(this.estabInfo[i]['class_code']);
      arr.push({text:this.estabInfo[i]['grade_pay_code'],alignment:'right'});
      arr.push({text:this.estabInfo[i]['pay_scale_code'],alignment:'right'});
      arr.push({text:this.estabInfo[i]['level_code'],alignment:'right'});
     
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
  
    // this.spinner.hide()
    pdfMake.createPdf(dd).download("establishmentInfo");
  }
}

