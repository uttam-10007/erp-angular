
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ScriptLoaderService } from '../../_services/script-loader.service';
import { ProfileService } from '../service/profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainService } from '../service/main.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css']
})
export class AccountProfileComponent implements OnInit {

  constructor(private sanitizer: DomSanitizer, private mainService: MainService, private _script: ScriptLoaderService, private profileService: ProfileService, private snackBar: MatSnackBar) { }
  erpUser;
  imgURL;
  updateObj = {};
  selectedFile: File = null;
  isUpload;
  state_arr = [];
  public imagePath;
  httpUrl;
  uploader;
  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.getAccInfo();
    this.getAccImage();
    this.httpUrl = this.profileService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'aimage' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
  }

  async getAccInfo() {
    var resp = await this.profileService.getAccProfileInfo(this.erpUser.b_acct_id);
    console.log(resp);
    if (resp['error'] == false) {
      this.updateObj = resp.data[0];
    } else {
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000,
      });
    }

  }
  async getAccImage() {
    const res = await this.profileService.getAccImage(this.erpUser.b_acct_id);
    console.log(res);
    if (res) {
      const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
      this.imgURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
      this.mainService.accountImageUrl = this.imgURL;

    }
  }

  async updateAccInfo() {
    console.log(this.updateObj);
    var resp = await this.profileService.updateAccProfile(this.updateObj);
    console.log(resp);
    if (resp['error'] == false) {
      this.getAccInfo();
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
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['file_name'] = this.uploader.queue[0].some.name;
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/uploadAccountImage' + params;
    this.uploader.queue[0].upload();
    console.log(obj);
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      if (!response.error) {
        const res = await this.profileService.getAccImage(this.erpUser.b_acct_id);
        console.log(res);
        if (res) {
          const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
          this.imgURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
          this.mainService.accountImageUrl = this.imgURL;
        }

      } else {

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

}
