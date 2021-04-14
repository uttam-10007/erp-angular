import { Component } from '@angular/core';
import {MainService} from '../../service/main.service';
import {ProfileService} from '../../service/profile.service';
import {Router} from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: '[app-property-sidebar]',
  templateUrl: './property-sidebar.component.html',
  styleUrls: ['./property-sidebar.component.css']
})
export class PropertySidebarComponent{

  user_id;
  imgURL;
  erpUser;
  accInfo;
  userInfo={emp_name:'Ram Prasad',designation:'Accountant'}
  constructor( private router:Router,private spinner:NgxSpinnerService,private profileService: ProfileService,private sanitizer: DomSanitizer, private mainService: MainService) {}
  hidden=true;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.user_id = this.erpUser.user_id;
    if(this.erpUser.is_admin==0){
      this.hidden=true;
    }else{
      this.hidden=false
    }
    this.imgURL = './assets/img/admin-avatar.png';
    await this.getUserImage();
    await this.getUserInfo();
    await this.getAccImage();
    await this.getAccInfo();
  }
 

  
  
  async getUserImage(){
    const res = await this.profileService.getImage(this.user_id);
    if (res) {
      const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
      this.imgURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
      this.mainService.profileImageUrl=this.imgURL;
      
    }
  }
  async getUserInfo(){
    this.spinner.show()
    var resp= await this.profileService.getUserProfileInfo(this.user_id);
    if(resp['error']==false){
      this.spinner.hide()

      this.userInfo=resp.data[0];
    }else{

      this.spinner.hide()
    }
  }
  async getAccImage() {
    const res = await this.profileService.getAccImage(this.erpUser.b_acct_id);
    if (res) {
      const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
      this.imgURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
      this.mainService.accountImageUrl = this.imgURL;

    }
  }
  async getAccInfo() {
    this.spinner.show()
    var resp = await this.profileService.getAccProfileInfo(this.erpUser.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.accInfo = resp.data[0];
      this.mainService.accInfo = this.accInfo;
    } else {
      this.spinner.hide()

    }

  }

}


