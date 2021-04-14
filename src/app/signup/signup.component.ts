import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../authentication.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private router: Router,private snackBar: MatSnackBar,private auth: AuthenticationService) { }
  obj={email:'',password:'',confirmPassword:''}
  ngOnInit() {
    localStorage.removeItem('erpUser')
  }
  async signup(){
    if(this.obj.password == this.obj.confirmPassword){
      var resp =await  this.auth.signUp(this.obj);
      if(resp['error']==false){
Swal.fire('Success...','Signup Successfully','success')
        this.router.navigate(['/login']);
      }else{
       
        Swal.fire('Error...',''+resp['data'],'error')
      }
    }else{
      Swal.fire('Warning..','Password doesn`t match','warning')
    }
    
  }


}
