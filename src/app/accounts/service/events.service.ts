import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/account/event";
  }
  
  async createEventLayout(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/metadata/eventlayout/createRecord', obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }
   async  getFilteredEvents(obj) {
    const resp = this.http.post<any>(this.httpUrl + '/getFilteredEvents', obj).toPromise().then(res => {
      return res
    });
    return resp
  }
   async getEventLayoutss(obj){
  
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/eventlayout/geteventlayout'+obj).toPromise().then(res => {
      return res;

    });
    return res;

  }
  async deleteEventLayout(obj){
  
    const res = await this.http.delete<any>(this.main.httpUrl + '/metadata/eventlayout/deleteeventlayout'+obj).toPromise().then(res => {
      return res;

    });
    return res;

  }
  async updateeventlayout(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/metadata/eventlayout/updateeventlayout', obj).toPromise().then(res => {
      return res;
     });
    return resp;
   }



   async  addevent(obj){
    const resp = this.http.post<any>(this.httpUrl + '/addevent' ,obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }
  async  getevents(obj){
    const resp = this.http.get<any>(this.httpUrl + '/getevents' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
  async  updateevent(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/updateevent',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteevent(obj){
    const resp = this.http.delete<any>(this.httpUrl + '/deleteevent' + JSON.stringify(obj)).toPromise().then(res => {
      return res
    });
    return resp
  }
}
