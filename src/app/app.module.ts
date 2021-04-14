import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ScriptLoaderService } from './_services/script-loader.service';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgtreegridModule } from 'ngtreegrid';
import { ChartsModule } from 'ng2-charts';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxSpinnerModule } from "ngx-spinner";
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatStepperModule } from '@angular/material/stepper';

//Portal Imports
import { PortalDashComponent } from './portal/portal-dash/portal-dash.component';
import { PortalLayoutsModule } from './portal/portal-layouts/protal-layouts.module';
import { LeaveComponent } from './portal/leave/leave.component';
import { PortalUserProfileComponent } from './portal/portal-user-profile/portal-user-profile.component';
import { PortalUsersComponent } from './portal/portal-users/portal-users.component';
import { PortalProductsComponent } from './portal/portal-products/portal-products.component';
import { AccountProfileComponent } from './portal/account-profile/account-profile.component';
import { SalaryComponent } from './portal/salary/salary.component';
import { TaskComponent } from './portal/task/task.component';


// HRMS Imporrts
import { DeductionReportComponent } from './hrms/hrms-report/deduction-report/deduction-report.component';
import { LicReportComponent } from './hrms/hrms-report/lic-report/lic-report.component';
import { PensionContributionComponent } from './hrms/hrms-report/pension-contribution/pension-contribution.component';
import { SettingPensionContributionComponent } from './hrms/hrms-setting/setting-pension-contribution/setting-pension-contribution.component';
import { HrmsDashComponent } from './hrms/hrms-dash/hrms-dash.component';
import { HrmsNotificationComponent } from './hrms/hrms-notification/hrms-notification.component';

import { HrmsLayoutsModule } from './hrms/hrms-layouts/hrms-layouts.module';
import { ArrComponent } from './hrms/arr/arr.component';
import { PartyComponent } from './hrms/party/party.component';
import { AllEmpComponent } from './hrms/party/all-emp/all-emp.component';
import { DependentInfoComponent } from './hrms/party/dependent-info/dependent-info.component';
import { JoiningComponent } from './hrms/party/joining/joining.component';
import { PersonalInfoComponent } from './hrms/party/personal-info/personal-info.component';
import { EducationInfoComponent } from './hrms/party/education-info/education-info.component';
import { NomineeInfoComponent } from './hrms/party/nominee-info/nominee-info.component';
import { BankAccountInfoComponent } from './hrms/party/bank-account-info/bank-account-info.component';
import { EstablishmentComponent } from './hrms/arr/establishment/establishment.component';
import { EmpPromotionComponent } from './hrms/arr/emp-promotion/emp-promotion.component';
import { EnquiryComponent } from './hrms/arr/enquiry/enquiry.component';
import { PostingComponent } from './hrms/arr/posting/posting.component';
import { ComplaintComponent } from './hrms/arr/complaint/complaint.component';
import { PayrollComponent } from './hrms/payroll/payroll.component';
import { VariablePayComponent } from './hrms/payroll/variable-pay/variable-pay.component';
import { FixedPayComponent } from './hrms/payroll/fixed-pay/fixed-pay.component';
import { SalaryBillComponent } from './hrms/payroll/salary-bill/salary-bill.component';
import { SuspensionComponent } from './hrms/arr/suspension/suspension.component';
import { PaidSalaryComponent } from './hrms/payroll/paid-salary/paid-salary.component';
import { LoanComponent } from './hrms/payroll/loan/loan.component';
import { LeavesComponent } from './hrms/arr/leaves/leaves.component';
import { LeavesApplyComponent } from './hrms/arr/leaves-apply/leaves-apply.component';
import { RetirementComponent } from './hrms/arr/retirement/retirement.component';
import { DeathComponent } from './hrms/arr/death/death.component';
import { TerminationComponent } from './hrms/arr/termination/termination.component';
import { ReappointmentComponent } from './hrms/arr/reappointment/reappointment.component';
import { EmpResignComponent } from './hrms/arr/emp-resign/emp-resign.component';
import { EmpTransferComponent } from './hrms/arr/emp-transfer/emp-transfer.component';
import { ProbationComponent } from './hrms/arr/probation/probation.component';
import { AttendanceComponent } from './hrms/arr/attendance/attendance.component';
import { PayMatrixComponent } from './hrms/hrms-setting/pay-matrix/pay-matrix.component';

import { HrmsReportComponent } from './hrms/hrms-report/hrms-report.component';
import { EmpReportComponent } from './hrms/hrms-report/emp-report/emp-report.component';
import { BillReportComponent } from './hrms/hrms-report/bill-report/bill-report.component';
import { PayrollReportComponent } from './hrms/hrms-report/payroll-report/payroll-report.component';
import { LpcComponent } from './hrms/hrms-report/lpc/lpc.component';
import { HrmsSettingComponent } from './hrms/hrms-setting/hrms-setting.component';
import { HrmsCodeValueComponent } from './hrms/hrms-setting/hrms-code-value/hrms-code-value.component';
import { HrmsFieldComponent } from './hrms/hrms-setting/hrms-field/hrms-field.component';
import { LeaveInfoComponent } from './hrms/hrms-setting/leave-info/leave-info.component';
import { OtherPaymentComponent } from './hrms/payroll/other-payment/other-payment.component'
import { SalarySlipComponent } from './hrms/hrms-report/salary-slip/salary-slip.component';
import { SalaryComponentDefinitionComponent } from './hrms/hrms-setting/salary-component-definition/salary-component-definition.component';
import { SectionComponent } from './hrms/hrms-setting/section/section.component';
import { ApprovalComponent } from './portal/approval/approval.component';
import { LicComponent } from './hrms/party/lic/lic.component'
import { SalaryHoldAndStartComponent } from './hrms/payroll/salary-hold-and-start/salary-hold-and-start.component';
import { AnnualIncrementComponent } from './hrms/payroll/annual-increment/annual-increment.component';
import { LeaveEncashmentComponent } from './hrms/payroll/leave-encashment/leave-encashment.component';
import { DaArrearComponent } from './hrms/payroll/variable-pay/da-arrear/da-arrear.component';
import { LeaveencashArrearComponent } from './hrms/payroll/variable-pay/leaveencash-arrear/leaveencash-arrear.component';
//Property Imports
import { PropertyDashComponent } from './property/property-dash/property-dash.component';
import { PropertyLayoutsModule } from './property/property-layouts/property-layouts.module';
import { PropertyPartyComponent } from './property/property-party/property-party.component';
import { BookletPurchaseComponent } from './property/property-party/booklet-purchase/booklet-purchase.component';
import { PartyAccountsComponent } from './property/property-party/party-accounts/party-accounts.component';
import { PartyInfoComponent } from './property/property-party/party-info/party-info.component';
import { PartyNomineeComponent } from './property/property-party/party-nominee/party-nominee.component';
import { BidDetailsComponent } from './property/bid-details/bid-details.component';

import { PropertyDefinitionComponent } from './property/property-setting/property-definition/property-definition.component';
import { PropertyInfoComponent } from './property/property-setting/property-info/property-info.component';
import { SchemeComponent } from './property/property-setting/scheme/scheme.component';
import { PropertySettingComponent } from './property/property-setting/property-setting.component';
import { ApplicationReportComponent } from './property/property-party/application-report/application-report.component';
import { ApplicationRefundComponent } from './property/property-party/application-refund/application-refund.component';
import { AllotmentComponent } from './property/property-party/allotment/allotment.component';
import { InstallmentPaymentComponent } from './property/property-party/installment-payment/installment-payment.component';
import { PaymentScheduleComponent } from './property/property-party/payment-schedule/payment-schedule.component';
import { RegistryComponent } from './property/property-party/registry/registry.component';
import { TransferPropertyComponent } from './property/property-party/transfer-property/transfer-property.component';
import { SubschemeComponent } from './property/property-setting/subscheme/subscheme.component';

import { PropertyCancellationComponent } from './property/property-party/property-cancellation/property-cancellation.component';
import { PropertyCodeValueComponent } from './property/property-setting/property-code-value/property-code-value.component';
import { PropertyFieldComponent } from './property/property-setting/property-field/property-field.component';
import { ApplicationsComponent } from './property/property-party/applications/applications.component';
import { RestoreComponent } from './property/property-party/restore/restore.component';
import { AuctionComponent } from './property/auction/auction.component';
import { AuctionApplicationComponent } from './property/auction-application/auction-application.component';






//accounts Import
import { AccountsLayoutsModule } from './accounts/accounts-layouts/accounts-layouts.module';
import { DemandComponent } from './accounts/demand/demand.component';
import { JvComponent } from './accounts/ledger/jv/jv.component';
import { JrnlListingComponent } from './accounts/ledger/report/jrnl-listing/jrnl-listing.component';
import { AccountsDashComponent } from './accounts/accounts-dash/accounts-dash.component';
import { BillComponent } from './accounts/bill/bill.component';
import { BankAccountComponent } from './accounts/tresuary/bank-account/bank-account.component';
import { ProductComponent } from './accounts/budget/product.component';
import { AccountsSettingComponent } from './accounts/setting/setting.component';
import { AccountsPartyComponent } from './accounts/setting/party/party.component';
import { AccFieldsComponent } from './accounts/setting/acc-fields/acc-fields.component';
import { AccCodeValueComponent } from './accounts/setting/acc-code-value/acc-code-value.component';
import { BpComponent } from './accounts/bp/bp.component';
import { ChallanComponent } from './accounts/challan/challan.component';
import { AccountInfoComponent } from './accounts/setting/account-info/account-info.component';
import { LedgerComponent } from './accounts/ledger/ledger.component';
import { AccJournalComponent } from './accounts/ledger/acc-journal/acc-journal.component';
import { AccRuleComponent } from './accounts/ledger/acc-rule/acc-rule.component';
import { CharOfAccountComponent } from './accounts/ledger/char-of-account/char-of-account.component';
import { ReportComponent } from './accounts/ledger/report/report.component';
import { SavedReportComponent } from './accounts/ledger/report/saved-report/saved-report.component';
import { AdhocReportComponent } from './accounts/ledger/report/adhoc-report/adhoc-report.component';
import { FinYearComponent } from './accounts/setting/fin-year/fin-year.component';
import { TrialBalanceComponent } from './accounts/ledger/report/trial-balance/trial-balance.component';
import { PartyReportComponent } from './accounts/ledger/report/party-report/party-report.component';
import { JournalReportComponent } from './accounts/ledger/report/journal-report/journal-report.component';
import { ProdHierComponent } from './accounts/ledger/prod-hier/prod-hier.component';
import { ProjHierComponent } from './accounts/ledger/proj-hier/proj-hier.component';
import { BudHierComponent } from './accounts/ledger/bud-hier/bud-hier.component';
import { ActivityHierComponent } from './accounts/ledger/activity-hier/activity-hier.component';
import { EventLayoutsComponent } from './accounts/setting/event-layouts/event-layouts.component';
import { EventsComponent } from './accounts/ledger/events/events.component';
import { SalComponent } from './accounts/setting/sal/sal.component';
import { IpComponent } from './accounts/setting/ip/ip.component'
import { AccGstComponent } from './accounts/setting/acc-gst/acc-gst.component';
import { JournalComponent } from './accounts/setting/journal/journal.component'
import { AccSalComponent } from './accounts/setting/acc-sal/acc-sal.component';
import { ArrListingComponent } from './accounts/ledger/report/arr-listing/arr-listing.component';
import { ProjectBankAccComponent } from './accounts/setting/project-bank-acc/project-bank-acc.component';
import { TresuaryComponent } from './accounts/tresuary/tresuary.component';
import { ContraComponent } from './accounts/tresuary/contra/contra.component';
import { LedgerReportComponent } from './accounts/ledger/report/ledger-report/ledger-report.component';
import { GstReportComponent } from './accounts/ledger/report/gst-report/gst-report.component';
import { BankReportComponent } from './accounts/ledger/report/bank-report/bank-report.component';
import { ChartOfAccMappingComponent } from './accounts/setting/chart-of-acc-mapping/chart-of-acc-mapping.component';
import { TdsGstReportComponent } from './accounts/ledger/report/tds-gst-report/tds-gst-report.component';
import { AdviceComponent } from './accounts/advice/advice.component';
import { WorkComponent } from './accounts/setting/work/work.component';
import { AllDedReportComponent } from './accounts/ledger/report/all-ded-report/all-ded-report.component';


import { StopReportComponent } from './hrms/hrms-report/stop-report/stop-report.component';
import { DeductiionMappingComponent } from './accounts/setting/deductiion-mapping/deductiion-mapping.component';
import { TdsComponent } from './accounts/ledger/report/tds/tds.component';

//Engineering Impoers

import { EngDashComponent } from './eng/eng-dash/eng-dash.component';
import { EngLayoutsModule } from './eng/eng-layouts/eng-layouts.module';
import { BaseItemComponent } from './eng/base-item/base-item.component';
import { BatchItemComponent } from './eng/batch-item/batch-item.component';
import { EngCodeValueComponent } from './eng/setting/eng-code-value/eng-code-value.component';
import { EngFieldsComponent } from './eng/setting/eng-fields/eng-fields.component';
import { SettingComponent } from './eng/setting/setting.component';
import { EstimateComponent } from './eng/estimate/estimate.component';
import { UnitConversionComponent } from './eng/setting/unit-conversion/unit-conversion.component';
import { EngRegistrationComponent } from './eng/eng-registration/eng-registration.component';
import { VerificationComponent } from './eng/eng-registration/verification/verification.component';
import { StatusAndRenewalComponent } from './eng/eng-registration/status-and-renewal/status-and-renewal.component';
import { ApplicationCategoryComponent } from './eng/setting/application-category/application-category.component';
import { EmbComponent } from './eng/emb/emb.component';
import { FieldMeasureComponent } from './eng/emb/field-measure/field-measure.component';
import { ConsumptionAnaComponent } from './eng/emb/consumption-ana/consumption-ana.component';
import { BoqComponent } from './eng/emb/boq/boq.component';
import { TendersComponent } from './eng/tenders/tenders.component';
import { ExportedTenderComponent } from './eng/tenders/exported-tender/exported-tender.component';
import { ImportedTenderComponent } from './eng/tenders/imported-tender/imported-tender.component';
import { EvaluationComponent } from './eng/tenders/evaluation/evaluation.component';
import { MechanismComponent } from './eng/tenders/mechanism/mechanism.component';
import { SorEstimateComponent } from './eng/sor-estimate/sor-estimate.component';
import { SorListComponent } from './eng/sor-list/sor-list.component';
import { SorSelectionComponent } from './eng/sor-selection/sor-selection.component';
import {AnnualStatementComponent} from './hrms/hrms-report/annual-statement/annual-statement.component';



@NgModule({
  declarations: [
    TdsGstReportComponent,
    PropertyDashComponent,
    DeductiionMappingComponent,
    LedgerReportComponent,
    ChartOfAccMappingComponent,
    PensionContributionComponent,
    GstReportComponent,
    BookletPurchaseComponent,
    PartyAccountsComponent,
    PartyInfoComponent,
    PartyNomineeComponent,
    BidDetailsComponent,
    EngDashComponent ,
    BaseItemComponent ,
    BatchItemComponent ,
    EngCodeValueComponent ,
    EngFieldsComponent ,
    SettingComponent ,
    EstimateComponent ,
     UnitConversionComponent,
    EngRegistrationComponent,
    VerificationComponent,
    StatusAndRenewalComponent,
    ApplicationCategoryComponent,
    EmbComponent ,
    FieldMeasureComponent,
    ConsumptionAnaComponent,
    BoqComponent,
    TendersComponent,
    ExportedTenderComponent,
    ImportedTenderComponent,
    EvaluationComponent,
    MechanismComponent,
    SorEstimateComponent,
    SorListComponent,
    SorSelectionComponent,
    
    PropertyDefinitionComponent,
    PropertyInfoComponent,
    SchemeComponent,
    PropertySettingComponent,
    ApplicationReportComponent,
    ApplicationRefundComponent,
    AllotmentComponent,
    InstallmentPaymentComponent,
    PaymentScheduleComponent,
    RegistryComponent,
    TransferPropertyComponent,
    SubschemeComponent,

    PropertyCancellationComponent,
    PropertyCodeValueComponent,
    PropertyFieldComponent,
    ApplicationsComponent,
    RestoreComponent,
    AuctionComponent,
    AuctionApplicationComponent,

    AllDedReportComponent,
    BankReportComponent,
    ProjectBankAccComponent,
    LeaveencashArrearComponent,
    DaArrearComponent,
    JvComponent,
    PropertyPartyComponent,
    LicReportComponent,
    LeaveEncashmentComponent,
    ArrListingComponent,
    AnnualIncrementComponent,
    JrnlListingComponent,
    EventsComponent,
    SalComponent,
    AccGstComponent,
    AccSalComponent,
    IpComponent,
    SettingPensionContributionComponent,
    TdsComponent,
    JournalComponent,
    EventLayoutsComponent,
    HrmsNotificationComponent,
    SalaryHoldAndStartComponent,
    LicComponent,
    HrmsReportComponent,
    EmpReportComponent,
    BillReportComponent,
    PayrollReportComponent,
    LpcComponent,
    TrialBalanceComponent,
    FinYearComponent,
    AccountInfoComponent,
    AccountInfoComponent,
    LedgerComponent,
    AccRuleComponent,
    ReportComponent,
    SavedReportComponent,
    AdhocReportComponent,
    CharOfAccountComponent,
    AccJournalComponent,
    AccountsPartyComponent,
    AccountsSettingComponent,
    AppComponent,
    SigninComponent,
    SignupComponent,
    PortalDashComponent,
    LeaveComponent,
    PortalUserProfileComponent,
    PortalUsersComponent,
    PortalProductsComponent,
    AccountsDashComponent,
    HrmsDashComponent,
    ArrComponent,
    PartyComponent,
    AllEmpComponent,
    DependentInfoComponent,
    JoiningComponent,
    PersonalInfoComponent,
    EducationInfoComponent,
    NomineeInfoComponent,
    BankAccountInfoComponent,
    EstablishmentComponent,
    AdviceComponent,
    WorkComponent,
    DeductionReportComponent,
    EmpPromotionComponent,
    EnquiryComponent,
    PostingComponent,
    ComplaintComponent,
    PayrollComponent,
    VariablePayComponent,
    FixedPayComponent,
    SalaryBillComponent,
    SuspensionComponent,
    PaidSalaryComponent,
    LoanComponent,
    LeavesComponent,
    LeavesApplyComponent,
    RetirementComponent,
    DeathComponent,
    TerminationComponent,
    ReappointmentComponent,
    EmpResignComponent,
    EmpTransferComponent,
    ProbationComponent,
    AccountProfileComponent,
    AttendanceComponent,
    HrmsSettingComponent,
    HrmsCodeValueComponent,
    HrmsFieldComponent,
    LeaveInfoComponent,
    BillComponent,
    BankAccountComponent,
    ProductComponent,
    AccFieldsComponent,
    AccCodeValueComponent,
    OtherPaymentComponent,
    SalarySlipComponent,
    BpComponent,
    ChallanComponent,
    SalaryComponentDefinitionComponent,
    SectionComponent,
    PayMatrixComponent,
    PartyReportComponent,
    SalaryComponent,
    TaskComponent,
    ApprovalComponent,
    JournalReportComponent,
    ProdHierComponent,
    ProjHierComponent,
    BudHierComponent,
    ActivityHierComponent,
    StopReportComponent,
    TresuaryComponent,
    ContraComponent,
    DemandComponent,
    AnnualStatementComponent,
  ],
  imports: [
    AccountsLayoutsModule,
    EngLayoutsModule,
    PropertyLayoutsModule,
    BrowserModule,
    AppRoutingModule,
    PortalLayoutsModule,
    HrmsLayoutsModule,
    NgSelectModule,
    ChartsModule,
    FileUploadModule,
    MatInputModule,
    NgbModule,
    MatSlideToggleModule,
    FormsModule,
    NgtreegridModule,
    MatStepperModule,
    MatCheckboxModule,
    MatExpansionModule,
    NgxSpinnerModule,
    HttpClientModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [ScriptLoaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
