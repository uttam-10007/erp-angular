import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";

declare var $: any;
enum CheckBoxType { APPLY_FOR_JOB, MODIFY_A_JOB, NONE };
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  obj = { email: '', password: '', confirmPassword: '' }
  constructor(private router: Router, private snackBar: MatSnackBar, private spinner: NgxSpinnerService, private auth: AuthenticationService) { }
  mobile_otp;
  otp_to_Match = 0;
  allowLogin: boolean = false;
  phone_no;
  your_password_flag = false;
  your_password;
  ngOnInit() {
    localStorage.removeItem('erpUser')
  }
  otp_flag: boolean = false;
  otp;
  erpUserData = {};
  SubmitForgetPassword() {
    console.log("Not Working Now!")
  }
  close() {
    console.log("Not Working Now!")
  }
  async sendOtp() {
    this.allowLogin = false
    this.obj['work_phone_no'] = this.obj['mobile_number']
    var valid_mob = this.validatePhoneNumber(this.obj['work_phone_no'])
    if (valid_mob == true) {
      this.spinner.show()
      var resp = await this.auth.loginWithPhoneNumber(this.obj);
      if (resp['error'] == false) {
        this.spinner.hide()
        this.allowLogin = true
        this.otp_flag = true
        this.otp = 123456
        this.erpUserData = resp['data']
        await this.getProfileData(resp['data']['b_acct_id'], this.obj['mobile_number']);
        Swal.fire('Success..', 'Otp Generated Successfully', 'success')
      } else if (resp['error'] == true) {
        this.spinner.hide()
        Swal.fire('Error..', '' + resp['data'], 'error')
      }
      else {
        this.spinner.hide()
        Swal.fire('Error...', 'Some Error Occured', 'error')
      }
    } else {
      this.spinner.hide()
      Swal.fire('Warning...', 'Invalid Mobile Number', 'warning')
    }
  }

  async getProfileData(b_acct_id, key) {
    let obj2 = new Object();
    obj2['b_acct_id'] = b_acct_id;
    obj2['key'] = key
    var resp2 = await this.auth.getDataFromMobileNumberOrEmail(JSON.stringify(obj2));
    if (resp2['error'] == false) {
      this.auth.profile_data = resp2.data;
      if (resp2.data.length == 0) {

        if(this.erpUserData['is_admin']==1){
          this.erpUserData['Designation'] = 'ADMIN';
          this.erpUserData['Designation_for_header'] = 'ADMIN';
          this.erpUserData['User_name'] = '';
        }else{
          this.erpUserData['Designation'] = 'Employee Detail Not Found';
          this.erpUserData['Designation_for_header'] = 'UNKNOWN';
          this.erpUserData['User_name'] = '';
        }
       
      } else {
        this.erpUserData['Designation'] = resp2.data[0]['designation_code'];
        this.erpUserData['Designation_for_header'] = resp2.data[0]['designation_code'];
        this.erpUserData['User_name'] = resp2.data[0]['emp_name'];
      }

    }
  }

  allowLoginValidate() {
    this.allowLogin = false
    this.otp = ''
  }
  LoginWithOtp() {
    this.spinner.hide()
    if (this.allowLogin == true) {
      if (this.otp == this.obj['otp']) {
        localStorage.setItem('erpUser', JSON.stringify(this.erpUserData));

        Swal.fire('Success...', 'Login Successfully', 'success')
        this.router.navigate(['/index']);
      } else {
        Swal.fire('Error...', 'Otp Do Not Matched', 'error')
      }
    } else {
      Swal.fire('Error...', 'Invalid Credentials', 'error')
    }

  }
  forgetPassWord() {
    $('#forget').modal('show');
  }
  async login() {
    if (this.currentlyChecked == 0 || this.currentlyChecked == 1) {
      var valid_mob = this.validatePhoneNumber(this.obj['email'])
      var valid_email = this.validateEmail(this.obj['email'])
      if (valid_mob == true && this.currentlyChecked == 0) {
        this.spinner.show()
        var resp = await this.auth.login(this.obj);
        if (resp['error'] == false) {
          this.spinner.hide()
          resp['data']['email'] = this.obj['email'];
          this.erpUserData = resp['data'];
          await this.getProfileData(resp['data']['b_acct_id'], this.obj['email'])
          localStorage.setItem('erpUser', JSON.stringify(this.erpUserData));
          Swal.fire('Success...', 'Login Successfully', 'success')
          this.router.navigate(['/index']);
        } else {
          this.spinner.hide()
          Swal.fire('Error...', 'This Email Or Mobile Is Not Registered', 'error')
        }
      } else if (valid_email == true && this.currentlyChecked == 1) {
        this.spinner.show()
        var resp = await this.auth.login(this.obj);
        if (resp['error'] == false) {
          this.spinner.hide()
          resp['data']['email'] = this.obj['email'];
          this.erpUserData = resp['data'];
          await this.getProfileData(resp['data']['b_acct_id'], this.obj['email'])
          localStorage.setItem('erpUser', JSON.stringify(this.erpUserData));

          Swal.fire('Success...', 'Login Successfully', 'success')
          this.router.navigate(['/index']);
        } else {
          this.spinner.hide()
          Swal.fire('Error...', 'This Email Or Mobile Is Not Registered', 'error')
        }
      }
      else {
        Swal.fire('Error...', 'Invalid Credentials', 'error')
      }

    } else {
      Swal.fire('Warning', ' Please Select An Option For Login', 'warning')
    }
  }
  check_box_type = CheckBoxType;

  currentlyChecked: CheckBoxType = 0;
  // this.currentlyChecked=1;
  selectCheckBox(targetType: CheckBoxType) {
    // If the checkbox was already checked, clear the currentlyChecked variable
    if (this.currentlyChecked === targetType) {
      this.currentlyChecked = CheckBoxType.NONE;
      return;
    }

    this.currentlyChecked = targetType;

  }


  validatePhoneNumber(input_str) {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

    return re.test(input_str);
  }
  validateEmail(input_str) {
    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/im;
    return re.test(input_str);
  }
}
