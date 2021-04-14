import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';

// Portal Components
import { PortalDashComponent } from './portal/portal-dash/portal-dash.component';
import { PortalLayoutsComponent } from './portal/portal-layouts/portal-layouts.component'
import { LeaveComponent } from './portal/leave/leave.component';
import { PortalUserProfileComponent } from './portal/portal-user-profile/portal-user-profile.component';
import { PortalUsersComponent } from './portal/portal-users/portal-users.component';
import { PortalProductsComponent } from './portal/portal-products/portal-products.component';
import { AccountProfileComponent } from './portal/account-profile/account-profile.component';
import { SalaryComponent } from './portal/salary/salary.component';
import { TaskComponent } from './portal/task/task.component';



// hrms imports
import { LicReportComponent } from './hrms/hrms-report/lic-report/lic-report.component';
import { HrmsNotificationComponent } from './hrms/hrms-notification/hrms-notification.component';
import { PensionContributionComponent } from './hrms/hrms-report/pension-contribution/pension-contribution.component';

import { PayMatrixComponent } from './hrms/hrms-setting/pay-matrix/pay-matrix.component';
import { DeductionReportComponent } from './hrms/hrms-report/deduction-report/deduction-report.component';
import {AnnualStatementComponent} from './hrms/hrms-report/annual-statement/annual-statement.component';

import { HrmsDashComponent } from './hrms/hrms-dash/hrms-dash.component';
import { HrmsLayoutsComponent } from './hrms/hrms-layouts/hrms-layouts.component';
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
import { LeaveInfoComponent } from './hrms/hrms-setting/leave-info/leave-info.component';
import { SalarySlipComponent } from './hrms/hrms-report/salary-slip/salary-slip.component';
import { HrmsReportComponent } from './hrms/hrms-report/hrms-report.component';
import { EmpReportComponent } from './hrms/hrms-report/emp-report/emp-report.component';
import { BillReportComponent } from './hrms/hrms-report/bill-report/bill-report.component';
import { PayrollReportComponent } from './hrms/hrms-report/payroll-report/payroll-report.component';
import { LpcComponent } from './hrms/hrms-report/lpc/lpc.component';
import { HrmsSettingComponent } from './hrms/hrms-setting/hrms-setting.component';
import { HrmsCodeValueComponent } from './hrms/hrms-setting/hrms-code-value/hrms-code-value.component';
import { HrmsFieldComponent } from './hrms/hrms-setting/hrms-field/hrms-field.component';
import { OtherPaymentComponent } from './hrms/payroll/other-payment/other-payment.component'
import { SalaryComponentDefinitionComponent } from './hrms/hrms-setting/salary-component-definition/salary-component-definition.component';
import { SectionComponent } from './hrms/hrms-setting/section/section.component';
import { ApprovalComponent } from './portal/approval/approval.component';
import { LicComponent } from './hrms/party/lic/lic.component';
import { StopReportComponent } from './hrms/hrms-report/stop-report/stop-report.component';
import { LeaveEncashmentComponent } from './hrms/payroll/leave-encashment/leave-encashment.component';
import { DaArrearComponent } from './hrms/payroll/variable-pay/da-arrear/da-arrear.component';
import { LeaveencashArrearComponent } from './hrms/payroll/variable-pay/leaveencash-arrear/leaveencash-arrear.component';
import { SettingPensionContributionComponent } from './hrms/hrms-setting/setting-pension-contribution/setting-pension-contribution.component';

// Property Imports
import { SalaryHoldAndStartComponent } from './hrms/payroll/salary-hold-and-start/salary-hold-and-start.component';



//accounts import
import { JrnlListingComponent } from './accounts/ledger/report/jrnl-listing/jrnl-listing.component';
import { DemandComponent } from './accounts/demand/demand.component';
import {JvComponent} from './accounts/ledger/jv/jv.component';

import { AccountsDashComponent } from './accounts/accounts-dash/accounts-dash.component';
import { AccountsLayoutsComponent } from './accounts/accounts-layouts/accounts-layouts.component';
import { BillComponent } from './accounts/bill/bill.component';
import { BankAccountComponent } from './accounts/tresuary/bank-account/bank-account.component';
import { ProductComponent } from './accounts/budget/product.component';
import { AccountsSettingComponent } from './accounts/setting/setting.component';
import { AccountsPartyComponent } from './accounts/setting/party/party.component'
import { AccFieldsComponent } from './accounts/setting/acc-fields/acc-fields.component';
import { AccCodeValueComponent } from './accounts/setting/acc-code-value/acc-code-value.component'
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
import { AnnualIncrementComponent } from './hrms/payroll/annual-increment/annual-increment.component'
import { AccGstComponent } from './accounts/setting/acc-gst/acc-gst.component';
import { AccSalComponent } from './accounts/setting/acc-sal/acc-sal.component';
import { GstReportComponent } from './accounts/ledger/report/gst-report/gst-report.component';

import { JournalComponent } from './accounts/setting/journal/journal.component';
import { ArrListingComponent } from './accounts/ledger/report/arr-listing/arr-listing.component';
import { ProjectBankAccComponent } from './accounts/setting/project-bank-acc/project-bank-acc.component';
import { TresuaryComponent } from './accounts/tresuary/tresuary.component';
import { ContraComponent } from './accounts/tresuary/contra/contra.component';
import {LedgerReportComponent} from './accounts/ledger/report/ledger-report/ledger-report.component';
import {BankReportComponent} from './accounts/ledger/report/bank-report/bank-report.component';
import {ChartOfAccMappingComponent} from './accounts/setting/chart-of-acc-mapping/chart-of-acc-mapping.component';
import { TdsGstReportComponent } from './accounts/ledger/report/tds-gst-report/tds-gst-report.component';
import {TdsComponent} from './accounts/ledger/report/tds/tds.component';
import {AdviceComponent} from './accounts/advice/advice.component';
import {WorkComponent} from './accounts/setting/work/work.component';
import {AllDedReportComponent} from './accounts/ledger/report/all-ded-report/all-ded-report.component';

//Md Imports

import {DeductiionMappingComponent} from './accounts/setting/deductiion-mapping/deductiion-mapping.component';



//Engineering Impoerts


import { EngDashComponent } from './eng/eng-dash/eng-dash.component';
import { EngLayoutsModule } from './eng/eng-layouts/eng-layouts.module';
import { BaseItemComponent } from './eng/base-item/base-item.component';
import { BatchItemComponent } from './eng/batch-item/batch-item.component';
import { EngCodeValueComponent } from './eng/setting/eng-code-value/eng-code-value.component';
import { EngFieldsComponent } from './eng/setting/eng-fields/eng-fields.component';
import {SettingComponent } from './eng/setting/setting.component';
import { EstimateComponent } from './eng/estimate/estimate.component';
import {UnitConversionComponent} from './eng/setting/unit-conversion/unit-conversion.component';
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
import {SorEstimateComponent} from './eng/sor-estimate/sor-estimate.component';
import {SorListComponent} from './eng/sor-list/sor-list.component';
import {SorSelectionComponent} from './eng/sor-selection/sor-selection.component';

//Property Imports
import { PropertyDashComponent } from './property/property-dash/property-dash.component';
import { PropertyLayoutsModule } from './property/property-layouts/property-layouts.module';
import { PropertyPartyComponent } from './property/property-party/property-party.component';
import { BookletPurchaseComponent } from './property/property-party/booklet-purchase/booklet-purchase.component';
import { PartyAccountsComponent } from './property/property-party/party-accounts/party-accounts.component';
import { PartyInfoComponent } from './property/property-party/party-info/party-info.component';
import { PartyNomineeComponent } from './property/property-party/party-nominee/party-nominee.component';
import {BidDetailsComponent} from './property/bid-details/bid-details.component';
import { PropertyLayoutsComponent } from './property/property-layouts/property-layouts.component';

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
import { EngLayoutsComponent } from './eng/eng-layouts/eng-layouts.component';

const routes: Routes = [
    { path: '', redirectTo: 'index', pathMatch: 'full' },
    {
        "path": "",
        "component": PortalLayoutsComponent,
        "children": [
            {
                path: "index",
                component: PortalDashComponent
            },

            {
                path: "leave",
                component: LeaveComponent
            },
            {
                path: "yourproducts",
                component: PortalProductsComponent
            },
            {
                path: "task",
                component: TaskComponent
            },
            {
                path: "salary",
                component: SalaryComponent
            },
            {
                path: "users",
                component: PortalUsersComponent
            },
            {
                path: 'acc',
                component: AccountProfileComponent
            },

            {
                path: "profile",
                component: PortalUserProfileComponent
            },
            
            {
                path: "appr",
                component: ApprovalComponent
            },
        ]
    },
    {
        "path": "hrms",
        "component": HrmsLayoutsComponent,
        "children": [
            {
                path: "index",
                component: HrmsDashComponent
            },
            {
                path: "notice",
                component: HrmsNotificationComponent
            },
            {
                "path": "hrms-report",
                "component": HrmsReportComponent,
                "children": [
                    {
                        path: "emp-report",
                        component: EmpReportComponent
                    },
                    {
                        path: "pention-contribution",
                        component: PensionContributionComponent
                    },

                    {
                        path: "bill-report",
                        component: BillReportComponent
                    },
                    {
                        path: "payroll-report",
                        component: PayrollReportComponent
                    },
                    {
                        path: "lic-report",
                        component: LicReportComponent
                    },
                    {
                        path: "deduction-report",
                        component: DeductionReportComponent
                    },
                    {
                        path: "pay-slip",
                        component: SalarySlipComponent
                    },
                    {
                        path: "lpc",
                        component: LpcComponent
                    },
                    {
                        path: "annl",
                        component: AnnualStatementComponent
                    },
                    {
                        path: "hold",
                        component: StopReportComponent
                    }

                ]
            },

            {
                "path": "party",
                "component": PartyComponent,
                "children": [
                    {
                        path: "allemp",
                        component: AllEmpComponent
                    },
                    {
                        path: "personal-info",
                        component: PersonalInfoComponent
                    },
                    {
                        path: "dependent-info",
                        component: DependentInfoComponent
                    },
                    {
                        path: "joining",
                        component: JoiningComponent
                    },
                    {
                        path: "edu-info",
                        component: EducationInfoComponent
                    },
                    {
                        path: "nom-info",
                        component: NomineeInfoComponent
                    },
                    {
                        path: "bank-dtl-info",
                        component: BankAccountInfoComponent
                    },
                    {
                        path: "lic",
                        component: LicComponent
                    },

                ]
            },
            {
                "path": "arr",
                "component": PartyComponent,
                "children": [

                    {
                        path: "establish",
                        component: EstablishmentComponent
                    },
                    {
                        path: "posting",
                        component: PostingComponent
                    },
                    {
                        path: "enquiry",
                        component: EnquiryComponent
                    },
                    {
                        path: "complaint",
                        component: ComplaintComponent
                    },
                    {
                        path: "promotion",
                        component: EmpPromotionComponent
                    },
                    {
                        path: "probation",
                        component: ProbationComponent
                    },
                    {
                        path: "suspension",
                        component: SuspensionComponent
                    },
                    {
                        path: "leaves",
                        component: LeavesComponent
                    },
                    {
                        path: "leaves-apply",
                        component: LeavesApplyComponent
                    },
                    {
                        path: "termination",
                        component: TerminationComponent
                    },
                    {
                        path: "retirement",
                        component: RetirementComponent
                    },
                    {
                        path: "death",
                        component: DeathComponent
                    },
                    {
                        path: "reappointment",
                        component: ReappointmentComponent
                    },
                    {
                        path: "attendance",
                        component: AttendanceComponent
                    },
                    {
                        path: "resign",
                        component: EmpResignComponent
                    },
                    {
                        path: "transfer",
                        component: EmpTransferComponent
                    },

                ]
            },
            {
                "path": "payroll",
                "component": PayrollComponent,
                "children": [

                    {
                        path: "fixed-pay",
                        component: FixedPayComponent
                    },
                    {
                        path: "variable-pay",
                        component: VariablePayComponent,
                        children: [
                            {
                                path: "da-arrear",
                                component: DaArrearComponent,
                            },
                            {
                                path: "leaveel-arrear",
                                component: LeaveencashArrearComponent,
                            }
                        ]
                    },
                    {
                        path: "sal-bill",
                        component: SalaryBillComponent
                    },
                    {
                        path: "sal-start-stop",
                        component: SalaryHoldAndStartComponent
                    },
                    {
                        path: "other-bill",
                        component: OtherPaymentComponent
                    },
                    {
                        path: "ann_inc",
                        component: AnnualIncrementComponent
                    },
                    {
                        path: "paid-salary",
                        component: PaidSalaryComponent
                    },

                    {
                        path: "loan",
                        component: LoanComponent
                    },
                    {
                        path: "el-encash",
                        component: LeaveEncashmentComponent
                    }


                ]
            },
            {
                "path": "setting",
                "component": HrmsSettingComponent,
                "children": [

                    {
                        path: "fields",
                        component: HrmsFieldComponent
                    },
                    {
                        path: "pension-contribution",
                        component: SettingPensionContributionComponent
                    },
                    {
                        path: "code-value",
                        component: HrmsCodeValueComponent
                    },
                    {
                        path: "leave-def",
                        component: LeaveInfoComponent
                    },
                    {
                        path: "section-def",
                        component: SectionComponent
                    },

                    {
                        path: "matrix",
                        component: PayMatrixComponent
                    },
                    {
                        path: "salary-rules",
                        component: SalaryComponentDefinitionComponent
                    },
                    



                ]
            },
        ]
    },
    {
        "path": "eng",
        "component": EngLayoutsComponent,
        "children": [
            {
                path: "index",
                component: EngDashComponent
            },
            {
                path: "base-item",
                component: BaseItemComponent,


            },
            {
                path: "batch-item",
                component: BatchItemComponent,


            },
            {
                path: "estimate",
                component: EstimateComponent,


            },
            {
                path: "sor-list",
                component: SorListComponent,


            },
            {
                path: "sor-selection",
                component: SorSelectionComponent,


            },
            {
                path: "sor-est",
                component: SorEstimateComponent,


            },
            {
                path: "reg",
                component: EngRegistrationComponent,
                children: [


                    {
                        path: "verification",
                        component: VerificationComponent
                    },
                    {
                        path: "status-renewal",
                        component: StatusAndRenewalComponent
                    }
                ]

            },
            {
                path: "tender",
                component: TendersComponent,
                children: [

                    {
                        path: "mechanism",
                        component: MechanismComponent
                    },
                    {
                        path: "exported-tender",
                        component: ExportedTenderComponent
                    },
                    {
                        path: "imported-tender",
                        component: ImportedTenderComponent
                    },
                    {
                        path: "evaluation",
                        component: EvaluationComponent
                    },

                ]

            },
            {
                path: "emb",
                component: EmbComponent,
                children: [


                    {
                        path: "field-measure",
                        component: FieldMeasureComponent
                    },
                    {
                        path: "consumption-analysis",
                        component: ConsumptionAnaComponent
                    },
                    {
                        path: "boq",
                        component: BoqComponent
                    }
                ]

            },
            {
                path: "setting",
                component: SettingComponent,
                children: [

                    {
                        path: "app-cat",
                        component: ApplicationCategoryComponent
                    },
                    {
                        path: "fields",
                        component: EngFieldsComponent
                    },
                    {
                        path: "unit-conversion",
                        component: UnitConversionComponent
                    },
                    {
                        path: "code-value",
                        component: EngCodeValueComponent

                    }
                ]

            },


        ]
    },
    {
        "path": "property",
        "component": PropertyLayoutsComponent,
        "children": [
            {
                path: "index",
                component: PropertyDashComponent
            },
            {
                path: "activity",
                component: PropertyPartyComponent,
                "children": [
                    {
                        path: "party-info",
                        component: PartyInfoComponent

                    },
                    {
                        path: "bid-details",
                        component:BidDetailsComponent

                    },
                    {
                        path: "party-accounts",
                        component: PartyAccountsComponent

                    },
                    {
                        path: "party-nominee",
                        component: PartyNomineeComponent

                    },
                    {
                        path: "applications",
                        component: ApplicationsComponent

                    },
                    {
                        path: "booklet-purchase",
                        component: BookletPurchaseComponent

                    },
                    {
                        path: "auction",
                        component: AuctionComponent

                    },
                    {
                        path: "auction-application",
                        component: AuctionApplicationComponent

                    },
                    {
                        path: "all-applications",
                        component: ApplicationReportComponent

                    },
                    {
                        path: "restore",
                        component: RestoreComponent

                    },
                    {
                        path: "applications-refund",
                        component: ApplicationRefundComponent

                    },
                    {
                        path: "allotment",
                        component: AllotmentComponent

                    },
                    {
                        path: "payment-schedule",
                        component: PaymentScheduleComponent

                    },
                    {
                        path: "installment",
                        component: InstallmentPaymentComponent

                    },
                    {
                        path: "registry",
                        component: RegistryComponent

                    },
                    {
                        path: "property-cancellation",
                        component: PropertyCancellationComponent

                    },
                    {
                        path: "transfer",
                        component: TransferPropertyComponent

                    },
                ]

            },

            {
                path: "property-setting",
                component: PropertySettingComponent,
                "children": [
                    {
                        path: "property-info",
                        component: PropertyInfoComponent
                    },
                    {
                        path: "property-def",
                        component: PropertyDefinitionComponent
                    },

                    {
                        path: "prop-code-value",
                        component: PropertyCodeValueComponent
                    },
                    {
                        path: "prop-field",
                        component: PropertyFieldComponent
                    },

                    {
                        path: "scheme",
                        component: SchemeComponent
                    }, {
                        path: "subscheme",
                        component: SubschemeComponent
                    },

                ]
            },
        ]
    },
    {
        "path": "accounts",
        "component": AccountsLayoutsComponent,
        "children": [
            {
                path: "index",
                component: AccountsDashComponent
            },
            {
                path: "bill",
                component: BillComponent,

            },
            {
                path: "demand",
                component: DemandComponent,

            },

            {
                path: "budget",
                component: ProductComponent
            },
            {
                path: "challan",
                component: ChallanComponent
            },
            {
                path: "bank-payment",
                component: BpComponent
            },
             {
                path: "advice",
                component: AdviceComponent
            },
            {
                path: "ledger",
                component: LedgerComponent,
                children: [
                    {
                        path: "jrnl",
                        component: AccJournalComponent
                    },
                    {
                        path: "jv",
                        component: JvComponent
                    },
                   
                    {
                        path: "rule",
                        component: AccRuleComponent
                    },
                    {
                        path: "coa",
                        component: CharOfAccountComponent
                    },
                    {
                        path: "activity-hier",
                        component: ActivityHierComponent
                    },
                    {
                        path: "bud-hier",
                        component: BudHierComponent
                    },
                    {
                        path: "events",
                        component: EventsComponent
                    },
                    {
                        path: "prod-hier",
                        component: ProdHierComponent
                    },
                    {
                        path: "proj-hier",
                        component: ProjHierComponent
                    },
                    {
                        path: "report",
                        component: ReportComponent,
                        children: [
                            {
                                path: "trail-balance",
                                component: TrialBalanceComponent
                            },
                            {
                                path: "tds",
                                component: TdsComponent
                            },
                            {
                                path: "tds-gst",
                                component: TdsGstReportComponent
                            },
                            {
                                path: "ledger-report",
                                component: LedgerReportComponent
                            },
                            {
                                path: "adhoc-report",
                                component: AdhocReportComponent
                            },
                            {
                                path: "party-report",
                                component: PartyReportComponent
                            },
                            {
                                path: "arr-report",
                                component: ArrListingComponent
                            },
                            {
                                path: "jrnl-report",
                                component: JrnlListingComponent
                            },
                            {
                                path: "gst",
                                component: GstReportComponent
                            },
                            {
                                path: "bank-report",
                                component: BankReportComponent
                            },
                            {
                                path: "all-ded",
                                component: AllDedReportComponent
                            },


                        ]

                    },

                ]

            },
            {
                path: "tresuary",
                component: TresuaryComponent,
                children: [
                    {
                        path: "contra",
                        component: ContraComponent
                    },
                    {
                        path: "bank-account",
                        component: BankAccountComponent
                    },




                ]

            },
            {
                path: "setting",
                component: AccountsSettingComponent,
                children: [
                    {
                        path: "party",
                        component: AccountsPartyComponent
                    },
                    {
                        path: "work",
                        component: WorkComponent
                    },
                    {
                        path:'deduction-mapping',
                        component:DeductiionMappingComponent
                    },
                    {
                        path: "project-bank",
                        component: ProjectBankAccComponent

                    },
                    {
                        path: "acc-sal",
                        component: AccSalComponent
                    },
                    {
                        path: "acc-mapping",
                        component:ChartOfAccMappingComponent

                    },

                    {
                        path: "fields",
                        component: AccFieldsComponent
                    },
                    {
                        path: "code-value",
                        component: AccCodeValueComponent

                    },
                    {
                        path: "account-info",
                        component: AccountInfoComponent

                    },
                    {
                        path: "event-layout",
                        component: EventLayoutsComponent

                    },
                    {
                        path: "fin-year",
                        component: FinYearComponent

                    },
                    {
                        path: "jrnl",
                        component: JournalComponent

                    },
                    {
                        path: "ip",
                        component: IpComponent

                    },
                    {
                        path: "sal",
                        component: SalComponent

                    },
                    {
                        path: "hsn",
                        component: AccGstComponent

                    }
                ]

            },


        ]
    },
    {
        "path": "login",
        "component": SigninComponent
    },
    {
        "path": "register",
        "component": SignupComponent
    },
    {
        "path": "**",
        "redirectTo": "error_404",
        "pathMatch": "full"
    },
];

@NgModule({
    declarations: [

    ],
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [
        RouterModule,
    ]
})

export class AppRoutingModule { }
