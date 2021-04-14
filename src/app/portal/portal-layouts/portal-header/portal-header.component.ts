import { Component, AfterViewInit, OnInit} from '@angular/core';
import {MainService} from '../../service/main.service';
import {ProfileService} from '../../service/profile.service';
import {Router} from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: '[app-portal-header]',
  templateUrl: './portal-header.component.html',
  styleUrls: ['./portal-header.component.css']
})
export class PortalHeaderComponent implements AfterViewInit {

  user_id;
  imgURL;
  erpUser;
  userInfo={first_name:'UNKNOWN',designation:'Accountant'}
  constructor( private router:Router,private profileService: ProfileService,private sanitizer: DomSanitizer, public mainService: MainService) {}
  hidden=true;
  accInfo={}
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    // console.log(this.erpUser)
    this.user_id = this.erpUser.user_id;
    console.log(this.user_id)
    if(this.erpUser.is_admin==0){
      this.hidden=true;
    }else{
      this.hidden=false
    }
    this.imgURL = './assets/img/admin-avatar.png';
    await this.getUserImage();
    await this.getUserInfo();
    await this.getAccInfo();
    await this.getAccImage();
  }
 

  
  
  async getUserImage(){
    const res = await this.profileService.getImage(this.user_id);
    console.log(res)

    if (res) {
      const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
      this.imgURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
      this.mainService.profileImageUrl=this.imgURL;
    }
  }


  async getUserInfo(){
    var resp= await this.profileService.getUserProfileInfo(this.user_id);
    console.log(resp);
    if(resp['error']==false){
      this.userInfo=resp.data[0];
      var erp=this.erpUser;
      erp['User_name']=this.userInfo['first_name']+" "+this.userInfo['last_name'];
      localStorage.setItem('erpUser', JSON.stringify(erp));

      // console.log(this.userInfo)
    }else{

    }
  }
  home(){
    this.router.navigate(['/index'])
  }
  ngAfterViewInit()  {
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
    var resp = await this.profileService.getAccProfileInfo(this.erpUser.b_acct_id);
    console.log(resp);
    if (resp['error'] == false) {
      this.accInfo = resp.data[0];
      this.mainService.accInfo = this.accInfo;
    } else {

    }

  }

}


