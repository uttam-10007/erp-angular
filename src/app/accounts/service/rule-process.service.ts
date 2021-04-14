import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class RuleProcessService {

    constructor(private http: HttpClient) { }
    profileImageUrl;
    codeValueTechObj = {};
    codeValueShowObj = {}
    //httpUrl="http://localhost:30001";
    httpUrl = "http://139.59.61.84:3001";
    accountImageUrl;
    accInfo = {};



    journalArr = [];
    unknownEvents = [];
    systemDate=''
    fin_year
    party_name;
    org_short_name
    async startProcessing(events, allRule,systemDate,finYear,orgShortName) {
        console.log(events);
      console.log(finYear)
        console.log(allRule);
        this.unknownEvents = []
        this.journalArr = []
     
            if(events.length>0){
                this.party_name=events[0]['party_name']
            }
       
        this.systemDate=systemDate

        this.fin_year=finYear
        this.org_short_name=orgShortName
        // let events = [{ "evt_grp_ln_dist_cd": 'EV1', "evt_grp_acct_id": '110', "evt_grp_ln_dist_id": 200, "evt_grp_dt": '2018-20-15' },
        // { "evt_grp_ln_dist_cd": 'EVW1', "evt_grp_acct_id": '110', "evt_grp_ln_dist_id": 200, "evt_grp_dt": '2018-20-15' }]
        for (let i = 0; i < events.length; i++) {
            console.log(events,allRule)
            let rule = await this.getRuleForEvent(events[i], allRule)
       console.log(rule,allRule)
            if (rule.length == 1) {
                await this.generateJournals(events[i], rule[0])
            } else {
                this.unknownEvents.push(events[i])
            }
        }
       
        var obj = new Object();
        obj['jrnl'] = this.journalArr;
        obj['event'] = this.unknownEvents;

        return obj;

    }
    async generateJournals(event, rule) {
        var temp = Object.assign({}, JSON.parse(rule['rule_data']))
        var then = temp['then']
        var journalArr = []
        for (let i = 0; i < then.length; i++) {
            var arr = then[i]['arr']
            let obj = new Object();

            for (let j = 0; j < arr.length; j++) {
                // if (arr[j]['type'] == 'static') {
                if (arr[j]['value'] == "") {
                    arr[j]['value'] = null
                }
                if (arr[j]['key'] != 'id') {
                    obj[arr[j]['key']] = arr[j]['value']

                }
            }
            obj['jrnl_dtl_ln_id'] = i+1;

            var obj1 = new Object
            if (event['bus_event_type'] == 'CHALLAN') {
                obj1 = await this.assignValuesForChallan(event, obj)

            }
            if (event['bus_event_type'] == 'BILL') {
                obj1 = await this.assignValuesForBill(event, obj)
            }
            if (event['bus_event_type'] == 'DEMAND') {
                obj1 = await this.assignValuesForDemand(event, obj)
            }
            this.journalArr.push(obj1)
        }
    }

    
    async assignValuesForDemand(event, obj) {
        obj['org_unit_cd'] =  this.org_short_name   //need 
        obj['tgt_curr_cd'] = 'INR'
        obj['jrnl_id'] = event['event_id']
        obj['prep_id'] = event['create_user_id']
        obj['appr_id'] = event['create_user_id']
        obj['acct_dt'] = event['evt_grp_dt']
        obj['jrnl_desc'] = event['event_desc']
        obj['txn_amt'] = event['txn_amt']
        obj['jrnl_ln_id'] = event['event_ln_id']
        //obj['jrnl_dtl_ln_id'] = event['event_ln_id']
        obj['event_code'] = event['event_code']
        // obj['event_desc'] = event['event_desc']
        obj['proc_dt'] = this.systemDate //need
        obj['event_id'] = event['event_id']
        obj['fin_year'] =  this.fin_year  // need
        obj['arr_id'] = event['arr_num']
        obj['event_ln_id'] = event['event_ln_id']
          // ---
          obj['jrnl_desc'] = 'Demand Id  ' +event['event_id']+' of '+ this.party_name +' for ' +event['remark'] 
          obj['jrnl_line_desc'] = event['event_desc']
          obj['jrnl_type']=event['bus_event_type']
          obj['status']='UNPOSTED'
        console.log(obj)
        return obj;
    }

    async assignValuesForBill(event, obj) {
        obj['org_unit_cd'] =  this.org_short_name   //need 
        obj['tgt_curr_cd'] = 'INR'
        obj['jrnl_id'] = event['event_id']
        obj['prep_id'] = event['create_user_id']
        obj['appr_id'] = event['create_user_id']
        obj['acct_dt'] = event['evt_grp_dt']
        obj['jrnl_desc'] = 'Bill Id  ' +event['event_id']+' of '+ this.party_name +' for ' +event['event_desc'] 
        obj['txn_amt'] = event['txn_amt']
        obj['jrnl_ln_id'] = event['event_ln_id']
        obj['event_code'] = event['event_code']
        obj['proc_dt'] = this.systemDate //need
        obj['event_id'] = event['event_id']
        obj['fin_year'] =  this.fin_year  //need
        obj['arr_id'] = event['arr_num']
        obj['event_ln_id'] = event['event_ln_id']
        obj['jrnl_type']=event['bus_event_type']
        obj['jrnl_line_desc'] = event['ev_desc']
        obj['status']='UNPOSTED'
        console.log(obj)
        return obj;
    }

    async assignValuesForChallan(event, obj) {
        obj['org_unit_cd'] =  this.org_short_name   //need 
        obj['tgt_curr_cd'] = 'INR'
        obj['jrnl_id'] = event['event_id']
        obj['prep_id'] = event['create_user_id']
        obj['appr_id'] = event['create_user_id']
        obj['acct_dt'] = event['evt_grp_dt']
        obj['jrnl_desc'] ="Challan ID " +event['event_id']+" of "+ event['party_name']+" for "+  event['event_desc'] 
        obj['txn_amt'] = event['txn_amt']
        obj['jrnl_ln_id'] = event['event_ln_id']
        //obj['jrnl_dtl_ln_id'] = event['event_ln_id']
        obj['event_code'] = event['event_code']
        obj['proc_dt'] = this.systemDate //need
        obj['event_id'] = event['event_id']
        obj['fin_year'] =  this.fin_year  //need
        obj['arr_id'] = event['arr_num']
        obj['event_ln_id'] = event['event_ln_id']
        obj['jrnl_line_desc'] = event['ev_desc']
        obj['status'] = 'UNPOSTED'
        obj['jrnl_type'] = event['bus_event_type']




        return obj;
    }


    async getRuleForEvent(event, allRule) {
        var eventRules = []
        for (let i = 0; i < allRule.length; i++) {
            if (event['event_code'] == allRule[i]['event_code']) {
                eventRules.push(allRule[i])
            }
        }
        var validRules = []
        for (let i = 0; i < eventRules.length; i++) {
            var temp = Object.assign({}, JSON.parse(eventRules[i]['rule_data']))
            var when = temp['when']
            if (when.length == 1) {
                validRules.push(eventRules[i])
            }
            if (when.length > 1) {
                var flag = true
                for (let j = 1; j < when.length; j++) {
                    if (flag == true) {
                        var local = false
                        if (when[j]['operator'] == '==') {
                            if (event[when[j]['key']] == when[j]['value']) {
                                local = true
                            }
                        } else if (when[j]['operator'] == '!=') {
                            if (event[when[j]['key']] != when[j]['value']) {
                                local = true
                            }
                        } else if (when[j]['operator'] == '<') {
                            if (event[when[j]['key']] < when[j]['value']) {
                                local = true
                            }
                        } else if (when[j]['operator'] == '>') {
                            if (event[when[j]['key']] > when[j]['value']) {
                                local = true
                            }
                        }
                        if (local == false && when[j]['condition'] == 'AND') {
                            flag = false
                        }
                    }
                }
                if (flag == true) {
                    validRules.push(eventRules[i])
                }
            }

        }
        var returnArr = []

        for (let i = 0; i < validRules.length; i++) {
            if (i == 0) {
                returnArr.push(validRules[i])
            } else if (returnArr[0]['priority'] < validRules[i]['priority']) {
                returnArr[0] = Object.assign({}, validRules[i])
            }
        }
        console.log(returnArr)
        return returnArr;
    }
}

