import { Routes } from '@angular/router';
import { LoginComponent } from './Pages/Login/login/login.component';
import { HomeParentComponent } from './Pages/Parent/home-parent/home-parent.component';
import { StudentHomeComponent } from './Pages/Student/student-home/student-home.component';
import { EmployeeHomeComponent } from './Pages/Employee/employee-home/employee-home.component';
import { noNavigateWithoutLoginGuard } from './Guards/no-navigate-without-login.guard';
import { noNavigateToLoginIfLoginGuard } from './Guards/no-navigate-to-login-if-login.guard';
import { navigateIfParentGuard } from './Guards/navigate-if-parent.guard';
import { navigateIfStudentGuard } from './Guards/navigate-if-student.guard';
import { navigateIfEmployeeGuard } from './Guards/navigate-if-employee.guard';
import { MainLayoutComponent } from './Pages/Layouts/main-layout/main-layout.component';
import { OctaLoginComponent } from './Pages/Login/octa-login/octa-login.component';
import { navigateIfOctaGuard } from './Guards/navigate-if-octa.guard';
import { noNavigateWithoutOctaLoginGuard } from './Guards/no-navigate-without-octa-login.guard';
import { navigateIfHaveSettingPageGuard } from './Guards/navigate-if-have-This-page.guard';
import { BusTypesComponent } from './Pages/Employee/Bus/bus-types/bus-types.component';
import { BusStatusComponent } from './Pages/Employee/Bus/bus-status/bus-status.component';
import { BusCategoriesComponent } from './Pages/Employee/Bus/bus-categories/bus-categories.component';
import { BusCompaniesComponent } from './Pages/Employee/Bus/bus-companies/bus-companies.component';
import { BusDetailsComponent } from './Pages/Employee/Bus/bus-details/bus-details.component';
import { BusStudentComponent } from './Pages/Employee/Bus/bus-student/bus-student.component';
import { BusPrintNameTagComponent } from './Pages/Employee/Bus/bus-print-name-tag/bus-print-name-tag.component';
import { BusDistrictsComponent } from './Pages/Employee/Bus/bus-districts/bus-districts.component';
import { DomainsComponent } from './Pages/Octa/domains/domains.component';
import { RoleComponent } from './Pages/Employee/Administrator/role/role.component';
import { RoleAddEditComponent } from './Pages/Employee/Administrator/role-add-edit/role-add-edit.component';
import { SchoolTypeComponent } from './Pages/Octa/school-type/school-type.component';
import { SchoolComponent as SchoolComponentOcta } from './Pages/Octa/school/school.component';
import { SchoolComponent as SchoolComponentEmployee } from './Pages/Employee/Administrator/school/school.component';
import { AccountComponent } from './Pages/Octa/account/account.component';
import { SubjectCategoryComponent } from './Pages/Employee/LMS/subject-category/subject-category.component';
import { SubjectComponent } from './Pages/Employee/LMS/subject/subject.component';
import { SubjectViewComponent } from './Pages/Employee/LMS/subject-view/subject-view.component';
import { EmployeeComponent } from './Pages/Employee/Administrator/employee/employee.component';
import { EmployeeAddEditComponent } from './Pages/Employee/Administrator/employee-add-edit/employee-add-edit.component';
import { EmployeeViewComponent } from './Pages/Employee/Administrator/employee-view/employee-view.component';
import { BuildingComponent } from './Pages/Employee/LMS/building/building.component';
import { FloorComponent } from './Pages/Employee/LMS/floor/floor.component';
import { ClassroomComponent } from './Pages/Employee/LMS/classroom/classroom.component';
import { ViolationTypesComponent } from './Pages/Employee/Violation/violation-types/violation-types.component';
import { SectionComponent } from './Pages/Employee/LMS/section/section.component';
import { GradeComponent } from './Pages/Employee/LMS/grade/grade.component';
import { AcademicYearComponent } from './Pages/Employee/LMS/academic-year/academic-year.component';
import { SemesterComponent } from './Pages/Employee/LMS/semester/semester.component';
import { SemesterViewComponent } from './Pages/Employee/LMS/semester-view/semester-view.component';
import { RegistrationFormFieldComponent } from './Pages/Employee/Registration/registration-form-field/registration-form-field.component';
import { FieldsComponent } from './Pages/Employee/Registration/fields/fields.component';
import { AdmissionTestComponent } from './Pages/Employee/Registration/admission-test/admission-test.component';
import { QuestionsComponent } from './Pages/Employee/Registration/questions/questions.component';
import { RegistrationFormComponent } from './Pages/Employee/Registration/registration-form/registration-form.component';
import { RegistrationConfirmationTestDetailsComponent } from './Pages/Employee/Registration/registration-confirmation-test-details/registration-confirmation-test-details.component';
import { RegistrationFormTestAnswerComponent } from './Pages/Employee/Registration/registration-form-test-answer/registration-form-test-answer.component';
import { RegistrationConfirmationComponent } from './Pages/Employee/Registration/registration-confirmation/registration-confirmation.component';
import { RegistrationConfirmationDetailsComponent } from './Pages/Employee/Registration/registration-confirmation-details/registration-confirmation-details.component';
import { InterviewTimeTableComponent } from './Pages/Employee/Registration/interview-time-table/interview-time-table.component';
import { InterviewRegistrationComponent as InterviewRegistrationComponentEmployee } from './Pages/Employee/Registration/interview-registration/interview-registration.component';
import { InterviewRegistrationComponent as InterviewRegistrationComponentParent } from './Pages/Parent/interview-registration/interview-registration.component';
import { AdmissionTestParentComponent } from './Pages/Parent/RegistrationModule/admission-test-parent/admission-test-parent.component';
import { RegistraionTestComponent } from './Pages/Parent/RegistrationModule/registraion-test/registraion-test.component';
import { ClassroomsAccommodationComponent } from './Pages/Employee/Registration/classrooms-accommodation/classrooms-accommodation.component';
import { SignUpComponent } from './Pages/Login/sign-up/sign-up.component';
import { SuppliersComponent } from './Pages/Employee/Accounting/suppliers/suppliers.component';
import { DebitsComponent } from './Pages/Employee/Accounting/debits/debits.component';
import { CreditsComponent } from './Pages/Employee/Accounting/credits/credits.component';
import { AssetsComponent } from './Pages/Employee/Accounting/assets/assets.component';
import { TuitionFeesTypesComponent } from './Pages/Employee/Accounting/tuition-fees-types/tuition-fees-types.component';
import { TuitionDiscountTypesComponent } from './Pages/Employee/Accounting/tuition-discount-types/tuition-discount-types.component';
import { AccountingEntriesDocTypeComponent } from './Pages/Employee/Accounting/accounting-entries-doc-type/accounting-entries-doc-type.component';
import { JobComponent } from './Pages/Employee/Administrator/job/job.component';
import { JobCategoriesComponent } from './Pages/Employee/Administrator/job-categories/job-categories.component';
import { AcademicDegreeComponent } from './Pages/Employee/Administrator/academic-degree/academic-degree.component';
import { ReasonsforleavingworkComponent } from './Pages/Employee/Administrator/reasonsforleavingwork/reasonsforleavingwork.component';
import { DepartmentComponent } from './Pages/Employee/Administrator/department/department.component';
import { OutcomesComponent } from './Pages/Employee/Accounting/outcomes/outcomes.component';
import { IncomesComponent } from './Pages/Employee/Accounting/incomes/incomes.component';
import { SavesComponent } from './Pages/Employee/Accounting/saves/saves.component';
import { AccountingTreeComponent } from './Pages/Employee/Accounting/accounting-tree/accounting-tree.component';
import { BankComponent } from './Pages/Employee/Accounting/bank/bank.component';
import { AccountingEmployee } from './Models/Accounting/accounting-employee';
import { AccountingEmployeeComponent } from './Pages/Employee/Accounting/accounting-employee/accounting-employee.component';
import { AccountingEmployeeEditComponent } from './Pages/Employee/Accounting/accounting-employee-edit/accounting-employee-edit.component';
import { AccountingStudentComponent } from './Pages/Employee/Accounting/accounting-student/accounting-student.component';
import { AccountingStudentEditComponent } from './Pages/Employee/Accounting/accounting-student-edit/accounting-student-edit.component';
import { AddChildComponent } from './Pages/Employee/Accounting/add-child/add-child.component';
import { FeesActivationComponent } from './Pages/Employee/Accounting/fees-activation/fees-activation.component';
import { ReceivableComponent } from './Pages/Employee/Accounting/receivable/receivable.component';
import { ReceivableDetailsComponent } from './Pages/Employee/Accounting/receivable-details/receivable-details.component';
import { PayableComponent } from './Pages/Employee/Accounting/payable/payable.component';
import { PayableDetailsComponent } from './Pages/Employee/Accounting/payable-details/payable-details.component';
import { AccountingEntriesComponent } from './Pages/Employee/Accounting/accounting-entries/accounting-entries.component';
import { AccountingEntriesDetailsComponent } from './Pages/Employee/Accounting/accounting-entries-details/accounting-entries-details.component';
import { InstallmentDeductionDetailComponent } from './Pages/Employee/Accounting/installment-deduction-detail/installment-deduction-detail.component';
import { InstallmentDeductionMasterComponent } from './Pages/Employee/Accounting/installment-deduction-master/installment-deduction-master.component';
import { PayableDocTypeComponent } from './Pages/Employee/Accounting/payable-doc-type/payable-doc-type.component';
import { ReceivableDocTypeComponent } from './Pages/Employee/Accounting/receivable-doc-type/receivable-doc-type.component';
import { CategoriesComponent } from './Pages/Employee/Inventory/categories/categories.component';
import { SubCategoryComponent } from './Pages/Employee/Inventory/sub-category/sub-category.component';
import { ShopItemsComponent } from './Pages/Employee/Inventory/shop-items/shop-items.component';
import { ShopItemsAddEditComponent } from './Pages/Employee/Inventory/shop-items-add-edit/shop-items-add-edit.component';
import { StoresComponent } from './Pages/Employee/Inventory/stores/stores.component';
import { InventoryMasterComponent } from './Pages/Employee/Inventory/inventory-master/inventory-master.component';
import { InventoryDetailsComponent } from './Pages/Employee/Inventory/inventory-details/inventory-details.component';
import { CreateHygieneFormComponent } from './Pages/Employee/Clinic/hygiene_form/create-hygiene-form/create-hygiene-form.component';
import { HygieneFormComponent } from './Pages/Employee/Clinic/hygiene_form/hygiene-form/hygiene-form.component';
import { DrugsComponent } from './Pages/Employee/Clinic/drugs/drugs.component';
import { DiagnosisComponent } from './Pages/Employee/Clinic/diagnosis/diagnosis.component';
import { HygieneTypesComponent } from './Pages/Employee/Clinic/hygiene-types/hygiene-types.component';
import { FollowUpComponent } from './Pages/Employee/Clinic/follow-up/follow-up.component';
import { MedicalHistoryComponent } from './Pages/Employee/Clinic/medical-history/medical-history-table/medical-history.component';
import { ShopComponent } from './Pages/Student/Ecommerce/shop/shop.component';
import { ShopItemComponent } from './Pages/Student/Ecommerce/shop-item/shop-item.component';
import { CartComponent } from './Pages/Student/Ecommerce/cart/cart.component';
import { OrderComponent } from './Pages/Student/Ecommerce/order/order.component';
import { DosesComponent } from './Pages/Employee/Clinic/doses/doses.component';
import { MedicalReportComponent } from './Pages/Employee/Clinic/medical-report/medical-report/medical-report.component';
import { OrderItemsComponent } from './Pages/Student/Ecommerce/order-items/order-items.component';
import { OrderHistoryComponent } from './Pages/Employee/E-Commerce/order-history/order-history.component';
import { StockingComponent } from './Pages/Employee/Inventory/stocking/stocking.component';
import { StockingDetailsComponent } from './Pages/Employee/Inventory/stocking-details/stocking-details.component';
import { ViewHygieneFormComponent } from './Pages/Employee/Clinic/hygiene_form/veiw-hygiene-form/veiw-hygiene-form.component';
import { StudentsNamesInClassComponent } from './Pages/Employee/Registration/Reports/students-names-in-class/students-names-in-class.component';
import { StudentInformationComponent } from './Pages/Employee/Registration/Reports/student-information/student-information.component';
import { ProofRegistrationAndSuccessFormReportComponent } from './Pages/Employee/Registration/Reports/proof-registration-and-success-form-report/proof-registration-and-success-form-report.component';
import { ProofRegistrationReportComponent } from './Pages/Employee/Registration/Reports/proof-registration-report/proof-registration-report.component';
import { StudentsInformationFormReportComponent } from './Pages/Employee/Registration/Reports/students-information-form-report/students-information-form-report.component';
import { PdfPrintComponent } from './Component/pdf-print/pdf-print.component';
import { AcademicSequentialReportComponent } from './Pages/Employee/Registration/Reports/academic-sequential-report/academic-sequential-report.component';
import { TransferedFromKindergartenReportComponent } from './Pages/Employee/Registration/Reports/transfered-from-kindergarten-report/transfered-from-kindergarten-report.component';
import { TemplateComponent } from './Pages/Employee/LMS/template/template.component';
import { InventoryTransactionReportComponent } from './Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master/invoice-report-master.component';
import { InvoiceReportMasterDetailedComponent } from './Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master-detailed/invoice-report-master-detailed.component';
import { EvaluationComponent } from './Pages/Employee/LMS/evaluation/evaluation.component';
import { EvaluationTemplateGroupComponent } from './Pages/Employee/LMS/evaluation-template-group/evaluation-template-group.component';
import { EvaluationTemplateGroupQuestionComponent } from './Pages/Employee/LMS/evaluation-template-group-question/evaluation-template-group-question.component';
import { EvaluationFeedbackComponent } from './Pages/Employee/LMS/evaluation-feedback/evaluation-feedback.component';
import { EvaluationEmployeeAnswerComponent } from './Pages/Employee/LMS/evaluation-employee-answer/evaluation-employee-answer.component';
import { BookCorrectionComponent } from './Pages/Employee/LMS/book-correction/book-correction.component';
import { MedalComponent } from './Pages/Employee/LMS/medal/medal.component';
import { LessonActivityTypeComponent } from './Pages/Employee/LMS/lesson-activity-type/lesson-activity-type.component';
import { LessonResourcesTypeComponent } from './Pages/Employee/LMS/lesson-resources-type/lesson-resources-type.component';
import { StudentMedalComponent } from './Pages/Employee/LMS/student-medal/student-medal.component';
import { LessonComponent } from './Pages/Employee/LMS/lesson/lesson.component';
import { PerformanceTypeComponent } from './Pages/Employee/LMS/performance-type/performance-type.component';
import { DailyPerformanceComponent } from './Pages/Employee/LMS/daily-performance/daily-performance.component';
import { LessonResourceComponent } from './Pages/Employee/LMS/lesson-resource/lesson-resource.component';
import { LessonActivityComponent } from './Pages/Employee/LMS/lesson-activity/lesson-activity.component';
import { LessonLiveComponent } from './Pages/Employee/LMS/lesson-live/lesson-live.component';
import { StudentLessonLiveComponent } from './Pages/Student/LMS/student-lesson-live/student-lesson-live.component';
import { AssignmentEditComponent } from './Pages/Employee/LMS/assignment/assignment-edit/assignment-edit.component';
import { ZatcaDevicesComponent } from './Pages/Employee/Zatca/zatca-devices/zatca-devices.component';
import { SubjectsComponent } from './Pages/Student/LMS/UI/subject/subjects.component';
import { SubjectDetailsComponent } from './Pages/Student/LMS/UI/subject-details/subject-details.component';
import { WeekDetailsComponent } from './Pages/Student/LMS/UI/week-details/week-details.component';
import { ElectronicInvoiceComponent } from './Pages/Employee/Zatca-ETA/electronic-invoice/electronic-invoice.component';
import { LessonResourcesComponent } from './Pages/Student/LMS/UI/lesson-resources/lesson-resources.component';
import { AssignmentsComponent } from './Pages/Student/LMS/UI/assignments/assignments.component';
import { ClassroomViewComponent } from './Pages/Employee/LMS/classroom-view/classroom-view.component';
import { QuestionBankComponent } from './Pages/Employee/LMS/question-bank/question-bank.component';
import { LessonLiveUIComponent } from './Pages/Student/LMS/UI/lesson-live/lesson-live.component';
import { WeightTypeComponent } from './Pages/Employee/LMS/weight-type/weight-type.component';
import { ClassroomStudentsComponent } from './Pages/Employee/LMS/classroom-students/classroom-students.component';
import { ClassroomSubjectsComponent } from './Pages/Employee/LMS/classroom-subjects/classroom-subjects.component';
import { SubjectTeacherComponent } from './Pages/Employee/Administrator/subject-teacher/subject-teacher.component';
import { SubjectCoTeacherComponent } from './Pages/Employee/Administrator/subject-co-teacher/subject-co-teacher.component';
import { StudentsComponent } from './Pages/Employee/Administrator/students/students.component';
import { DailyPerformanceMasterComponent } from './Pages/Employee/LMS/daily-performance-master/daily-performance-master.component';
import { AssignmentComponent } from './Pages/Employee/LMS/assignment/assignment.component';
import { ReportItemCardComponent } from './Pages/Employee/Inventory/Report/report-item-card/item-card/report-item-card.component';
import { AssignmentStudentComponent } from './Pages/Employee/LMS/assignment-student/assignment-student.component';
import { AssignmentStudentComponent as AssignmentStudentStudentComponent } from './Pages/Student/LMS/assignment-student/assignment-student.component';
import { SubjectComponent as SubjectStudentComponent } from './Pages/Student/LMS/subject/subject.component';
import { AssignmentDetailComponent } from './Pages/Employee/LMS/assignment-detail/assignment-detail.component';
import { POSComponent } from './Pages/Employee/ETA/pos/pos.component';
import { CertificatesIssuerComponent } from './Pages/Employee/ETA/certificates-issuer/certificates-issuer.component';
import { ElectronicInvoiceDetailComponent } from './Pages/Employee/Zatca-ETA/electronic-invoice-detail/electronic-invoice-detail.component';
import { TaxIssuerComponent } from './Pages/Employee/ETA/tax-issuer/tax-issuer.component';
import { SchoolConfigurationComponent } from './Pages/Employee/Zatca-ETA/school-configuration/school-configuration.component';
import { DailyPerformanceViewComponent } from './Pages/Employee/LMS/daily-performance-view/daily-performance-view.component';
import { SubjectWeeksComponent } from './Pages/Student/LMS/subject-weeks/subject-weeks.component';
import { FeesActivationReportComponent } from './Pages/Employee/Accounting/Report/fees-activation-report/fees-activation-report.component';
import { SubjectWeekLessonComponent } from './Pages/Student/LMS/subject-week-lesson/subject-week-lesson.component';
import { SubjectResourcesComponent } from './Pages/Student/LMS/subject-resources/subject-resources.component';
import { SubjectLessonLiveComponent } from './Pages/Student/LMS/subject-lesson-live/subject-lesson-live.component';
import { AccountigReportsComponent } from './Pages/Employee/Accounting/Report/accountig-reports/accountig-reports.component';
import { SubjectAssignmentComponent } from './Pages/Student/LMS/subject-assignment/subject-assignment.component';
import { StudentAssignmentViewComponent } from './Pages/Student/LMS/student-assignment-view/student-assignment-view.component';
import { AccountigConstraintsComponent } from './Pages/Employee/Accounting/Report/accountig-constraints/accountig-constraints.component';
import { AverageCostCalcComponent } from './Pages/Employee/Inventory/Report/report-item-card/average-cost-calc/average-cost-calc/average-cost-calc.component';
import { AccountigConfigurationComponent } from './Pages/Employee/Accounting/accountig-configuration/accountig-configuration.component';
import { TimeTable } from './Models/LMS/time-table';
import { TimeTableComponent } from './Pages/Employee/LMS/time-table/time-table.component';
import { TimeTableViewComponent } from './Pages/Employee/LMS/time-table-view/time-table-view.component';
import { TimeTableReplace } from './Models/LMS/time-table-replace';
import { TimeTableReplaceComponent } from './Pages/Employee/LMS/time-table-replace/time-table-replace.component';
import { SignUpEmployeeComponent } from './Pages/Login/sign-up-employee/sign-up-employee.component';
import { DutyComponent } from './Pages/Employee/LMS/duty/duty.component';
import { RegisteredEmployeeComponent } from './Pages/Employee/Administrator/registered-employee/registered-employee.component';
import { RegisteredEmployeeViewComponent } from './Pages/Employee/Administrator/registered-employee-view/registered-employee-view.component';
import { Violation } from './Models/Violation/violation';
import { ViolationComponent } from './Pages/Employee/Violation/violation/violation.component';
import { ViolationViewComponent } from './Pages/Employee/Violation/violation-view/violation-view.component';
import { AnnouncementComponent } from './Pages/Employee/Administrator/announcement/announcement.component';
import { StoreBalanceReportComponent } from './Pages/Employee/Inventory/Report/store-balance-report/store-balance-report/store-balance-report.component';
import { AllStoresBalanceReportComponent } from './Pages/Employee/Inventory/Report/store-balance-report/all-store-balance/all-store-balance.component';
import { DiscussionRoomComponent } from './Pages/Employee/LMS/discussion-room/discussion-room.component';
import { NotificationComponent } from './Pages/Employee/Communication/notification/notification.component';
import { MyNotificationComponent } from './Pages/Communication/my-notification/my-notification.component';
import { ParentMedicalHistoryComponent } from './Pages/Parent/clinic/medical-history/medical-history-table/medical-history-table.component';
import { RemedialClassroomComponent } from './Pages/Employee/LMS/remedial-classroom/remedial-classroom.component';
import { RemedialTimeTableComponent } from './Pages/Employee/LMS/remedial-time-table/remedial-time-table.component';
import { RemedialTimeTableViewComponent } from './Pages/Employee/LMS/remedial-time-table-view/remedial-time-table-view.component';
import { RemedialClassroomStudentComponent } from './Pages/Employee/LMS/remedial-classroom-student/remedial-classroom-student.component';
import { ConductLevelComponent } from './Pages/Employee/SocialWorker/conduct-level/conduct-level.component';
import { ProcedureTypeComponent } from './Pages/Employee/SocialWorker/procedure-type/procedure-type.component';
import { ConductTypeComponent } from './Pages/Employee/SocialWorker/conduct-type/conduct-type.component';
import { ConductComponent } from './Pages/Employee/SocialWorker/conduct/conduct.component';
import { ConductAddEditComponent } from './Pages/Employee/SocialWorker/conduct-add-edit/conduct-add-edit.component';
import { AccountStatementsComponent } from './Pages/Employee/Accounting/Report/account-statement/account-statements.component';
import { MyRequestsComponent } from './Pages/Communication/my-requests/my-requests.component';
import { IssuesTypeComponent } from './Pages/Employee/SocialWorker/issues-type/issues-type.component';
import { StudentIssuesComponent } from './Pages/Employee/SocialWorker/student-issues/student-issues.component';
import { SocialWorkerMedalComponent } from './Pages/Employee/SocialWorker/social-worker-medal/social-worker-medal.component';
import { CertificateTypeComponent } from './Pages/Employee/SocialWorker/certificate-type/certificate-type.component';
import { StudentCertificateComponent } from './Pages/Employee/SocialWorker/student-certificate/student-certificate.component';
import { SocialWorkerMedalStudentComponent } from './Pages/Employee/SocialWorker/social-worker-medal-student/social-worker-medal-student.component';
import { AttendanceComponent } from './Pages/Employee/SocialWorker/attendance/attendance.component';
import { AttendanceStudentComponent } from './Pages/Employee/SocialWorker/attendance-student/attendance-student.component';
import { ViewReportComponent } from './Pages/Employee/Clinic/medical-report/view-report/view-report.component';
import { HorizontalMeeting } from './Models/SocialWorker/horizontal-meeting';
import { HorizontalMeetingComponent } from './Pages/Employee/SocialWorker/horizontal-meeting/horizontal-meeting.component';
import { ParentMeetingComponent } from './Pages/Employee/SocialWorker/parent-meeting/parent-meeting.component';
import { AppointmentComponent } from './Pages/Employee/SocialWorker/appointment/appointment.component';
import { AppointmentParentComponent } from './Pages/Employee/SocialWorker/appointment-parent/appointment-parent.component';
import { EvaluationReportComponent } from './Pages/Employee/LMS/reports/evaluation-report/evaluation-report.component';
import { ViolationReportComponent } from './Pages/Employee/Violation/Reports/violation-report/violation-report.component';
import { MyMessagesComponent } from './Pages/Communication/my-messages/my-messages.component';
import { DailyPreformanceReportComponent } from './Pages/Employee/LMS/reports/daily-preformance-report/daily-preformance-report.component';
import { DirectMarkComponent } from './Pages/Employee/LMS/direct-mark/direct-mark.component';
import { DirectMarkStudentComponent } from './Pages/Employee/LMS/direct-mark-student/direct-mark-student.component';
import { MaintenanceEmployeesComponent } from './Pages/Employee/Maintenance/maintenance-employees/maintenance-employees.component';
import { MaintenanceCompaniesComponent } from './Pages/Employee/Maintenance/maintenance-companies/maintenance-companies.component';
import { MaintenanceItemsComponent } from './Pages/Employee/Maintenance/maintenance-items/maintenance-items.component';
import { CertificateComponent } from './Pages/Employee/LMS/certificate/certificate.component';
import { TeacherEvaluationReportComponent } from './Pages/Employee/LMS/reports/teacher-evaluation-report/teacher-evaluation-report.component';
import { ConductReportComponent } from './Pages/Employee/SocialWorker/Reports/conduct-report/conduct-report.component';
import { OfficialHolidaysComponent } from './Pages/Employee/HR/official-holidays/official-holidays.component';
import { VacationTypesComponent } from './Pages/Employee/HR/vacation-types/vacation-types.component';
import { AttendanceReportComponent } from './Pages/Employee/SocialWorker/Reports/attendance-report/attendance-report.component';
import { StudentIssueReportComponent } from './Pages/Employee/SocialWorker/Reports/student-issue-report/student-issue-report.component';
import { CertificateStudentReportComponent } from './Pages/Employee/SocialWorker/Reports/certificate-student-report/certificate-student-report.component';
import { LoansComponent } from './Pages/Employee/HR/loans/loans.component';
import { BonusComponent } from './Pages/Employee/HR/bonus/bonus.component';
import { DeductionComponent } from './Pages/Employee/HR/deduction/deduction.component';
import { LeaveRequestComponent } from './Pages/Employee/HR/leave-request/leave-request.component';
import { StudentMedalReportComponent } from './Pages/Employee/SocialWorker/Reports/student-medal-report/student-medal-report.component';
import { AccountBalanceComponent } from './Pages/Employee/Accounting/Report/account-balance/account-balance.component';
import { AccountingSubledgerComponent } from './Pages/Employee/Accounting/Report/accounting-subledger/accounting-subledger.component';
import { PermissionGroupComponent } from './Pages/Employee/Archiving/permission-group/permission-group.component';
import { PermissionGroupEmployeeComponent } from './Pages/Employee/Archiving/permission-group-employee/permission-group-employee.component';
import { PermissionGroupDetailsComponent } from './Pages/Employee/Archiving/permission-group-details/permission-group-details.component';
import { ArchivingComponent } from './Pages/Employee/Archiving/archiving/archiving.component';
import { AccountingStatementReportComponent } from './Pages/Employee/Accounting/Report/accounting-statement-report/accounting-statement-report.component';
import { VacationEmployeeComponent } from './Pages/Employee/HR/vacation-employee/vacation-employee.component';
import { LocationComponent } from './Pages/Employee/HR/location/location.component';
import { AssignmentReportComponent } from './Pages/Employee/LMS/reports/assignment-report/assignment-report.component';
import { MaintenanceComponent } from './Pages/Employee/Maintenance/maintenance/maintenance.component';
import { EmployeeClocksComponent } from './Pages/Employee/HR/employee-clocks/employee-clocks.component';
import { MaintenanceReportComponent } from './Pages/Employee/Maintenance/Reports/maintenance-report/maintenance-report.component';
import { SalaryConfigurationComponent } from './Pages/Employee/HR/salary-configuration/salary-configuration.component';
import { EmployeeJobReportComponent } from './Pages/Employee/HR/Reports/employee-job-report/employee-job-report.component';
import { LoansReportComponent } from './Pages/Employee/HR/Reports/loans-report/loans-report.component';
import { BonusReportComponent } from './Pages/Employee/HR/Reports/bonus-report/bonus-report.component';
import { DeductionReportComponent } from './Pages/Employee/HR/Reports/deduction-report/deduction-report.component';
import { LeaveRequestReportComponent } from './Pages/Employee/HR/Reports/leave-request-report/leave-request-report.component';
import { VacationEmployeeReportComponent } from './Pages/Employee/HR/Reports/vacation-employee-report/vacation-employee-report.component';

export const routes: Routes = [
    { path: "", component: LoginComponent, title: "Login", canActivate: [noNavigateToLoginIfLoginGuard] },
    { path: "Octa/login", component: OctaLoginComponent, title: "login", canActivate: [noNavigateToLoginIfLoginGuard] },
    { path: "SignUp", component: SignUpComponent, title: "SignUp", canActivate: [noNavigateToLoginIfLoginGuard] },
    { path: "EmployeeSignUp", component: SignUpEmployeeComponent, title: "EmployeeSignUp", canActivate: [noNavigateToLoginIfLoginGuard] },
    {
        path: "Employee",
        component: MainLayoutComponent,
        title: "Employee Home",
        canActivate: [navigateIfEmployeeGuard, noNavigateWithoutLoginGuard],
         children: [
            { path: "", component: EmployeeHomeComponent, title: "EmployeeHome" },
            { path: "Hygiene Types", component: HygieneTypesComponent, title: "Hygiene Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Diagnosis", component: DiagnosisComponent, title: "Diagnosis", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Drugs", component: DrugsComponent, title: "Drugs", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Hygiene Form Medical Report", component: HygieneFormComponent, title: "Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Create Hygiene Form", component: CreateHygieneFormComponent, title: "Create Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'view hygiene form/:id', component: ViewHygieneFormComponent, title: "Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Follow Up", component: FollowUpComponent, title: "Follow Up", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Medical History", component: MedicalHistoryComponent, title: "Medical History", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Medical Report", component: MedicalReportComponent, title: "Medical Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'medical-history/parent/:id', component: ViewReportComponent, title: 'Medical History By Parent',data: { reportType: 'parent' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'medical-history/doctor/:id', component: ViewReportComponent, title: 'Medical History By Doctor',data: { reportType: 'doctor' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Doses", component: DosesComponent, title: "Doses", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Details", component: BusDetailsComponent, title: "Bus", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Students/:domainName/:busId", component: BusStudentComponent, title: "Bus Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Types", component: BusTypesComponent, title: "Bus Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Status", component: BusStatusComponent, title: "Bus Status", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Districts", component: BusDistrictsComponent, title: "Bus Districts", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Categories", component: BusCategoriesComponent, title: "Bus Category", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Companies", component: BusCompaniesComponent, title: "Bus Company", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Print Name Tag", component: BusPrintNameTagComponent, title: "Print Name Tag", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Role", component: RoleComponent, title: "Role", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Role Create", component: RoleAddEditComponent, title: "Role Create", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },  //
            { path: "Role Edit/:id", component: RoleAddEditComponent, title: "Role Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },  //
            { path: "Subject Categories", component: SubjectCategoryComponent, title: "Subject Categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Subject", component: SubjectComponent, title: "Subjects", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Subject/:domainName/:SubId", component: SubjectViewComponent, title: "Subject", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee", component: EmployeeComponent, title: "Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee Create", component: EmployeeAddEditComponent, title: "Employee Create", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
            { path: "Employee Edit/:id", component: EmployeeAddEditComponent, title: "Employee Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
            { path: "Employee Details/:id", component: EmployeeViewComponent, title: "Employee Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
            { path: "Building", component: BuildingComponent, title: "Building", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Floor/:domainName/:Id", component: FloorComponent, title: "Floor", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom", component: ClassroomComponent, title: "Classroom", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom/:id", component: ClassroomViewComponent, title: "Classroom", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Violation Types", component: ViolationTypesComponent, title: "Violation Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Section", component: SectionComponent, title: "Section", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Grade/:domainName/:Id", component: GradeComponent, title: "Grade", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Academic Years", component: AcademicYearComponent, title: "Academic Year", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Semester/:domainName/:Id", component: SemesterComponent, title: "Semester", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Working Weeks/:domainName/:Id", component: SemesterViewComponent, title: "Semester", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
            { path: "School", component: SchoolComponentEmployee, title: "Schools", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Form", component: RegistrationFormComponent, title: "Registration Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Form Field", component: RegistrationFormFieldComponent, title: "RegistrationFormField", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Form Field/:id", component: FieldsComponent, title: "CategoryFields", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Admission Test", component: AdmissionTestComponent, title: "Admission Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Question/:id", component: QuestionsComponent, title: "question", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Confirmation", component: RegistrationConfirmationComponent, title: "Registration Confirmation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Confirmation/:Id", component: RegistrationConfirmationDetailsComponent, title: "Registration Confirmation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Confirmation Test/:id", component: RegistrationConfirmationTestDetailsComponent, title: "Registration Confirmation Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Confirmation Test/:Rid/:Pid/:Tid", component: RegistrationFormTestAnswerComponent, title: "Registration Confirmation Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Interview Time Table", component: InterviewTimeTableComponent, title: "Interview Time Table", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Interview Registration/:Id", component: InterviewRegistrationComponentEmployee, title: "Interview Registration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom Accommodation", component: ClassroomsAccommodationComponent, title: "Classroom Accommodation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Supplier", component: SuppliersComponent, title: "Suppliers", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Debit", component: DebitsComponent, title: "Debits", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Credit", component: CreditsComponent, title: "Credits", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Asset", component: AssetsComponent, title: "Assets", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Tuition Fees Type", component: TuitionFeesTypesComponent, title: "Tuition Fees Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Tuition Discount Type", component: TuitionDiscountTypesComponent, title: "TuitionDiscountTypes", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries Doc Type", component: AccountingEntriesDocTypeComponent, title: "AccountingEntriesDocTypes", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Job/:id", component: JobComponent, title: "Job", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Job Category", component: JobCategoriesComponent, title: "Job Categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Academic Degree", component: AcademicDegreeComponent, title: "Academic Degree", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Reasons For Leaving Work", component: ReasonsforleavingworkComponent, title: "Reasons for leaving work", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Department", component: DepartmentComponent, title: "Department", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Outcome", component: OutcomesComponent, title: "Outcome", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Income", component: IncomesComponent, title: "Income", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Safe", component: SavesComponent, title: "Safe", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Tree", component: AccountingTreeComponent, title: "Accounting Tree", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bank", component: BankComponent, title: "Bank", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee Accounting", component: AccountingEmployeeComponent, title: "Employee Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee Edit Accounting/:id", component: AccountingEmployeeEditComponent, title: "Employee Edit Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Accounting", component: AccountingStudentComponent, title: "Student Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Edit Accounting/:id", component: AccountingStudentEditComponent, title: "Student Edit Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Add Children", component: AddChildComponent, title: "Add Children", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Fees Activation", component: FeesActivationComponent, title: "Fees Activation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable", component: ReceivableComponent, title: "Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable Details", component: ReceivableDetailsComponent, title: "Receivable Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable Details/:id", component: ReceivableDetailsComponent, title: "Edit Receivable Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable Details/View/:id", component: ReceivableDetailsComponent, title: "View Receivable Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable", component: PayableComponent, title: "Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable Details", component: PayableDetailsComponent, title: "Payable Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable Details/:id", component: PayableDetailsComponent, title: "Edit Payable Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable Details/View/:id", component: PayableDetailsComponent, title: "View Payable Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries", component: AccountingEntriesComponent, title: "AccountingEntries", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries Details", component: AccountingEntriesDetailsComponent, title: "AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries Details/:id", component: AccountingEntriesDetailsComponent, title: "Edit AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries Details/View/:id", component: AccountingEntriesDetailsComponent, title: "View AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction", component: InstallmentDeductionMasterComponent, title: "Installment Deduction", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction Details/View/:id", component: InstallmentDeductionDetailComponent, title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction Details/Edit/:id", component: InstallmentDeductionDetailComponent, title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction Details", component: InstallmentDeductionDetailComponent, title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable Doc Type", component: PayableDocTypeComponent, title: "Payable Doc Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable Doc Type", component: ReceivableDocTypeComponent, title: "Receivable Doc Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Inventory Categories", component: CategoriesComponent, title: "Inventory categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Inventory Sub Categories/:id", component: SubCategoryComponent, title: "Sub_categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Items", component: ShopItemsComponent, title: "Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Shop Item/Create", component: ShopItemsAddEditComponent, title: "Create Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Shop Item/:id", component: ShopItemsAddEditComponent, title: "Edit Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Stores", component: StoresComponent, title: "Store", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Sales", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 11 } },
            { path: "Sales Item/:FlagId", component: InventoryDetailsComponent, title: "Sales Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Sales Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Sales Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Sales Returns", component: InventoryMasterComponent, title: "Sales Returns", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 12 } },
            { path: "Sales Returns Item/:FlagId", component: InventoryDetailsComponent, title: "Sales Returns Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Sales Returns Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Sales Returns Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchase Returns", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 10 } },
            { path: "Purchase Returns Item/:FlagId", component: InventoryDetailsComponent, title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchase Returns Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchases", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 9 } },
            { path: "Purchases Item/:FlagId", component: InventoryDetailsComponent, title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchases Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Opening Balances", component: InventoryMasterComponent, title: "Opening Balances", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 1 } },
            { path: "Opening Balances Item/:FlagId", component: InventoryDetailsComponent, title: "Opening Balances Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Opening Balances Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Opening Balances Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Addition", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 2 } },
            { path: "Addition Item/:FlagId", component: InventoryDetailsComponent, title: "Addition Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Addition Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Addition Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Addition Adjustment", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 3 } },
            { path: "Addition Adjustment Item/:FlagId", component: InventoryDetailsComponent, title: "Addition Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Addition Adjustment Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Addition Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Disbursement", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 4 } },
            { path: "Disbursement Item/:FlagId", component: InventoryDetailsComponent, title: "Disbursement Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Disbursement Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Disbursement Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Disbursement Adjustment", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 5 } },
            { path: "Disbursement Adjustment Item/:FlagId", component: InventoryDetailsComponent, title: "Disbursement Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Disbursement Adjustment Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Disbursement Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Gifts", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 6 } },
            { path: "Gifts Item/:FlagId", component: InventoryDetailsComponent, title: "Gifts Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Gifts Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Gifts Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchase Order", component: InventoryMasterComponent, title: "Purchase Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 13 } },
            { path: "Purchase Order Item/:FlagId", component: InventoryDetailsComponent, title: "Purchase Order Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchase Order Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Purchase Order Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Transfer to Store", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 8 } },
            { path: "Transfer to Store Item/:FlagId", component: InventoryDetailsComponent, title: "Transfer to Store Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Transfer to Store Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Transfer to Store Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Damaged", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 7 } },
            { path: "Damaged Item/:FlagId", component: InventoryDetailsComponent, title: "Damaged Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Damaged Item/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Damaged Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "The Shop", component: ShopComponent, title: "Shop", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "ShopItem/:id", component: ShopItemComponent, title: "Shop Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Cart", component: CartComponent, title: "Cart", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Order", component: OrderComponent, title: "Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Order History", component: OrderHistoryComponent, title: "Order History", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Order/:id", component: OrderItemsComponent, title: "Order Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Stocking", component: StockingComponent, title: "Stocking", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Stocking Item", component: StockingDetailsComponent, title: "Stocking Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Stocking Item/Edit/:id", component: StockingDetailsComponent, title: "Stocking Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Names In Class", component: StudentsNamesInClassComponent, title: "Students' Names In Class", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Information", component: StudentInformationComponent, title: "StudentInformation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Proof Registration And Success Form", component: ProofRegistrationAndSuccessFormReportComponent, title: "ProofRegistrationAndSuccessForm", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Proof Registration", component: ProofRegistrationReportComponent, title: "ProofRegistration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Students Information Form Report", component: StudentsInformationFormReportComponent, title: "StudentsInformationFormReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Academic Sequential Report", component: AcademicSequentialReportComponent, title: "AcademicSequentialReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Transferred  From Kindergarten Report", component: TransferedFromKindergartenReportComponent, title: "TransferedFromKindergartenReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Template", component: TemplateComponent, title: "Template", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Inventory Transaction Report', component: InventoryTransactionReportComponent, title: 'Inventory Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'inventory' } },
            { path: 'Sales Transaction Report', component: InventoryTransactionReportComponent, title: 'Sales Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'sales' } },
            { path: 'Purchase Transaction Report', component: InventoryTransactionReportComponent, title: 'Purchase Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'purchase' } },
            { path: 'Inventory Transaction Detailed Report', component: InvoiceReportMasterDetailedComponent, title: 'Inventory Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'inventory' } },
            { path: 'Sales Transaction Detailed Report', component: InvoiceReportMasterDetailedComponent, title: 'Sales Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'sales' } },
            { path: 'Purchase Transaction Detailed Report', component: InvoiceReportMasterDetailedComponent, title: 'Purchase Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'purchase' } },
            { path: "Book Correction", component: BookCorrectionComponent, title: "BookCorrectionComponent", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Evaluation", component: EvaluationComponent, title: "Evaluation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Evaluation Report", component: EvaluationReportComponent, title: "Evaluation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Teacher Evaluation Report", component: TeacherEvaluationReportComponent, title: "Teacher Evaluation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "EvaluationTemplateGroup/:id", component: EvaluationTemplateGroupComponent, title: "EvaluationTemplateGroup", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "EvaluationTemplateGroupQuestion/:id", component: EvaluationTemplateGroupQuestionComponent, title: "EvaluationTemplateGroup", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Received Evaluations", component: EvaluationFeedbackComponent, title: "Received Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Created Evaluations", component: EvaluationFeedbackComponent, title: "Created Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Received Evaluations/:id", component: EvaluationEmployeeAnswerComponent, title: "Received Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Created Evaluations/:id", component: EvaluationEmployeeAnswerComponent, title: "Created Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Medal", component: MedalComponent, title: "Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Activity Types", component: LessonActivityTypeComponent, title: "Lesson Activity Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Resources Types", component: LessonResourcesTypeComponent, title: "Lesson Resource Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Medal", component: StudentMedalComponent, title: "Student Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lessons", component: LessonComponent, title: "Lesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Create Daily Performance", component: DailyPerformanceComponent, title: "Daily Performance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Performance Type", component: PerformanceTypeComponent, title: "Performance Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Activity/:id", component: LessonActivityComponent, title: "Lesson Activity", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Resource/:id", component: LessonResourceComponent, title: "Lesson Resource", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Live", component: LessonLiveComponent, title: "Lesson Live", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Zatca Devices", component: ZatcaDevicesComponent, title: "Zatca Devices", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Zatca Electronic-Invoice", component: ElectronicInvoiceComponent, title: "Zatca Electronic Invoice", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'zatca' } },
            { path: "ETA Electronic-Invoice", component: ElectronicInvoiceComponent, title: "ETA Electronic Invoice", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'eta' } },
            { path: "Zatca Electronic-Invoice/:id", component: ElectronicInvoiceDetailComponent, title: "ZATCA Invoice Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'zatca' } },
            { path: "ETA Electronic-Invoice/:id", component: ElectronicInvoiceDetailComponent, title: "ETA Invoice Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'eta' } },
            { path: "Tax Issuer", component: TaxIssuerComponent, title: "Tax Issuer", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Zatca School Configuration", component: SchoolConfigurationComponent, title: "Zatca School Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "ETA School Configuration", component: SchoolConfigurationComponent, title: "ETA School Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Point Of Sale", component: POSComponent, title: "Point Of Sale", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Certificate Issuer", component: CertificatesIssuerComponent, title: "Certificate Issuer", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Weight Types", component: WeightTypeComponent, title: "Weight Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom Students/:id", component: ClassroomStudentsComponent, title: "Classroom Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom Subject/:id", component: ClassroomSubjectsComponent, title: "Classroom Subject", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Question Bank", component: QuestionBankComponent, title: "Question Bank", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Subject Teacher/:id", component: SubjectTeacherComponent, title: "Subject Teacher", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Subject Co-Teacher/:id", component: SubjectCoTeacherComponent, title: "Subject Co-Teacher", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student", component: StudentsComponent, title: "Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Create Student", component: RegistrationFormComponent, title: "Create Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Edit Student/:RegisterationFormParentId/:StudentId", component: RegistrationFormComponent, title: "Edit Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student/:Id", component: RegistrationConfirmationDetailsComponent, title: "Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Enter Daily Performance", component: DailyPerformanceMasterComponent, title: "Daily Performance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Daily Performance/:id", component: DailyPerformanceViewComponent, title: "Daily Performance View", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Daily Performance Report", component: DailyPreformanceReportComponent, title: "Daily Performance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'student' } },
            { path: "Classroom Daily Performance Report", component: DailyPreformanceReportComponent, title: "Classroom Daily Performance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'classroom' } },
            { path: "Assignment", component: AssignmentComponent, title: "Assignment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Assignment Report", component: AssignmentReportComponent, title: "Assignment Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Assignment/:id", component: AssignmentEditComponent, title: "Assignment Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Average Cost Calculation', component: AverageCostCalcComponent, title: 'Average Cost Calculator', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: "Item Card Report", component: ReportItemCardComponent, title: "Item Card Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { showAverage: false } },
            { path: "Item Card Report With Average", component: ReportItemCardComponent, title: "Item Card Report With Average", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { showAverage: true } },
            { path: "Assignment Student/:id", component: AssignmentStudentComponent, title: "AssignmentStudent", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Assignment Student Answer/:id", component: AssignmentDetailComponent, title: "Assignment Detail", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance", component: MaintenanceComponent, title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance Report", component: MaintenanceReportComponent, title: "Maintenance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance Companies", component: MaintenanceCompaniesComponent, title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance Employees", component: MaintenanceEmployeesComponent, title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance Items", component: MaintenanceItemsComponent, title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Fees Activation Report", component: FeesActivationReportComponent, title: "Fees Activation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable Report", component: AccountigReportsComponent, title: "Receivable Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable Report", component: AccountigReportsComponent, title: "Payable Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction Report", component: AccountigReportsComponent, title: "Installment Deduction Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries Report", component: AccountigReportsComponent, title: "Accounting Entries Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Constraints Report", component: AccountigConstraintsComponent, title: "Accounting Constraints Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Configuration", component: AccountigConfigurationComponent, title: "Accounting Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Time Table', component: TimeTableComponent, title: 'Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Time Table/:id', component: TimeTableViewComponent, title: 'Time Table View', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Time Table Replace/:id', component: TimeTableReplaceComponent, title: 'Time Table Replace', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Duty Table', component: DutyComponent, title: 'Duty Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Registered Employee', component: RegisteredEmployeeComponent, title: 'Registered Employee', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Registered Employee/:id', component: RegisteredEmployeeViewComponent, title: 'Registered Employee', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Announcement', component: AnnouncementComponent, title: 'Announcement', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Store Items Balance', component: StoreBalanceReportComponent, data: { reportType: 'QuantityOnly', title: 'Store Balance - Quantity Only' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Store Items Balance with Purchase', component: StoreBalanceReportComponent, data: { reportType: 'PurchasePrice', title: 'Store Balance - Purchase Price' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Store Items Balance with Sales', component: StoreBalanceReportComponent, data: { reportType: 'SalesPrice', title: 'Store Balance - Sales Price' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Store Items Balance with Average Cost', component: StoreBalanceReportComponent, data: { reportType: 'Cost', title: 'Store Balance - Cost' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Store Limited Items', component: StoreBalanceReportComponent, data: { reportType: 'ItemsUnderLimit', title: 'Store Balance - Items Under Limit' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "All Stores Item Balance", component: AllStoresBalanceReportComponent, title: "All Stores Quantity Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'QuantityOnly' } },
            { path: "All Stores Item Balance with Purchase", component: AllStoresBalanceReportComponent, title: "All Stores Purchase Price Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'PurchasePrice' } },
            { path: "All Stores Item Balance with Sales", component: AllStoresBalanceReportComponent, title: "All Stores Sales Price Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'SalesPrice' } },
            { path: "All Stores Item Balance with Average Cost", component: AllStoresBalanceReportComponent, title: "All Stores Cost Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'Cost' } },
            { path: 'Discussion Room', component: DiscussionRoomComponent, title: 'Discussion Room', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'violation', component: ViolationComponent, title: 'Violation', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Violation/:id', component: ViolationViewComponent, title: 'Violation', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'violation Report', component: ViolationReportComponent, title: 'Violation Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Notification', component: NotificationComponent, title: 'Notification', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], }, 
            { path: 'Remedial Classes', component: RemedialClassroomComponent, title: 'Remedial Classroom', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Remedial Classes/:id', component: RemedialClassroomStudentComponent, title: 'Remedial Classroom', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Remedial TimeTable', component: RemedialTimeTableComponent, title: 'Remedial Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Remedial TimeTable/:id', component: RemedialTimeTableViewComponent, title: 'Remedial Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Conduct Level', component: ConductLevelComponent, title: 'Conduct Level', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Procedure Types', component: ProcedureTypeComponent, title: 'Procedure Type', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Conduct Types', component: ConductTypeComponent, title: 'Conduct Type', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Conducts', component: ConductComponent, title: 'Conduct', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: "Conduct Edit/:id", component: ConductAddEditComponent, title: "Conduct", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Conduct Create", component: ConductAddEditComponent, title: "Conduct", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Conducts Report', component: ConductReportComponent, title: 'Conduct Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Attendance Report', component: AttendanceReportComponent, title: 'Attendance Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Student Issue Report', component: StudentIssueReportComponent, title: 'Student Issue Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Certificate To Student Report', component: CertificateStudentReportComponent, title: 'Certificate To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Medal To Student Report', component: StudentMedalReportComponent, title: 'Medal To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Account Balance Report', component: AccountBalanceComponent, title: 'Account Balance Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Account Subledger Report', component: AccountingSubledgerComponent, title: 'Account Subledger Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Account Statement Report', component: AccountingStatementReportComponent, title: 'Account Statement Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: "Supplier Statement",  component: AccountStatementsComponent,  title: "Supplier Statement",  canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard]  },
            { path: "Safe Statement",  component: AccountStatementsComponent,  title: "Safe Statement",  canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard]  },
            { path: "Bank Statement",  component: AccountStatementsComponent,  title: "Bank Statement",  canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard]  },
            { path: "Issues Types", component: IssuesTypeComponent, title: "Issue Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Issues", component: StudentIssuesComponent, title: "Student Issues", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Medal Types", component: SocialWorkerMedalComponent, title: "Social Worker Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Certificate Types", component: CertificateTypeComponent, title: "Certificate Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Add Certificate To Student", component: StudentCertificateComponent, title: "Student Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Add Medal To Student", component: SocialWorkerMedalStudentComponent, title: "Social Worker Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Attendance", component: AttendanceComponent, title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Attendance/:id", component: AttendanceStudentComponent, title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Attendance Create", component: AttendanceStudentComponent, title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Horizontal Meeting", component: HorizontalMeetingComponent, title: "Horizontal Meeting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Parent Meeting", component: ParentMeetingComponent, title: "Parent Meeting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Appoinment", component: AppointmentComponent, title: "Appoinment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Appoinment/:id", component: AppointmentParentComponent, title: "Appoinment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Direct Mark", component: DirectMarkComponent, title: "Direct Mark", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Direct Mark/:id", component: DirectMarkStudentComponent, title: "Direct Mark", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Certificate", component: CertificateComponent, title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Official Holidays", component: OfficialHolidaysComponent, title: "Official Holidays", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Vacation Types", component: VacationTypesComponent, title: "Vacation Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Loans", component: LoansComponent, title: "Loans", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Loans Report", component: LoansReportComponent, title: "Loans Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bonus", component: BonusComponent, title: "Bonus", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bonus Report", component: BonusReportComponent, title: "Bonus Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Deduction", component: DeductionComponent, title: "Deduction", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Deduction Report", component: DeductionReportComponent, title: "Deduction Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Leave Request", component: LeaveRequestComponent, title: "Leave Request", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Leave Request Report", component: LeaveRequestReportComponent, title: "Leave Request Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Permissions Groups", component: PermissionGroupComponent, title: "Permissions Groups", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Permissions Group Employee/:id", component: PermissionGroupEmployeeComponent, title: "Permissions Group Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Permissions Group Archiving/:id", component: PermissionGroupDetailsComponent, title: "Permissions Group Archiving", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Archiving", component: ArchivingComponent, title: "Archiving", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Vacation Employee", component: VacationEmployeeComponent, title: "Vacation Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Vacation Employee Report", component: VacationEmployeeReportComponent, title: "Vacation Employee Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Location", component: LocationComponent, title: "Location", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee Job Report", component: EmployeeJobReportComponent, title: "Employee Job Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Edit Attendance", component: EmployeeClocksComponent, title: "Edit Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Salary Configuration", component: SalaryConfigurationComponent, title: "Salary Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
        ]
    },
    {
        path: "Parent",
        component: MainLayoutComponent,
        title: "Parent Home",
        canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard],
        children: [
            { path: "", component: HomeParentComponent, title: "ParentHome" },
            { path: "Admission Test", component: AdmissionTestParentComponent, title: "Admission Test" },
            { path: "Test/:registerationFormParentID/:TestId", component: RegistraionTestComponent, title: "Test" },
            { path: "Registration Form", component: RegistrationFormComponent, title: "Registration Form" },
            { path: "Interview Registration", component: InterviewRegistrationComponentParent, title: "Interview Registration" },
            { path: "Medical History", component: ParentMedicalHistoryComponent, title: "Medical History" },
            { path: "Parent Certificate", component: CertificateComponent, title: "Certificate", canActivate: [noNavigateWithoutLoginGuard] },
        ]
    },
    {
        path: "Student",
        component: MainLayoutComponent,
        title: "Student Home",
        canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard],
        children: [
            { path: "", component: StudentHomeComponent, title: "StudentHome" },
            { path: "Ecommerce/The Shop", component: ShopComponent, title: "Shop" },
            { path: "Ecommerce/ShopItem/:id", component: ShopItemComponent, title: "Shop Item" },
            { path: "Ecommerce/Cart", component: CartComponent, title: "Cart" },
            { path: "Ecommerce/Order", component: OrderComponent, title: "Order" },
            { path: "Ecommerce/Order/:id", component: OrderItemsComponent, title: "Order Items" },
            { path: "Lesson Live", component: StudentLessonLiveComponent, title: "Lesson Live" },
            { path: "Subject-UI", component: SubjectsComponent, title: "Subjects", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Subject-Details-UI/:subjectId", component: SubjectDetailsComponent, title: "Subject-Details", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "week-details-UI/:subjectId/:weekId", component: WeekDetailsComponent, title: "Week Details", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Lesson-Resources-UI/:subjectId", component: LessonResourcesComponent, title: "Lesson Resources", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Assignments-UI/:subjectId", component: AssignmentsComponent, title: "Assignments", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Lesson-Live-UI/:subjectId", component: LessonLiveUIComponent, title: "Lesson Live", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Assignment/:id", component: AssignmentStudentStudentComponent, title: "Assignment", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Subject", component: SubjectStudentComponent, title: "Subject", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "SubjectWeeks/:id", component: SubjectWeeksComponent, title: "SubjectWeeks", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "SubjectWeeksLesson/:SubjectId/:WeekId", component: SubjectWeekLessonComponent, title: "SubjectWeeksLesson", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "SubjectResources/:SubjectId", component: SubjectResourcesComponent, title: "SubjectResources", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "SubjectLive/:SubjectId", component: SubjectLessonLiveComponent, title: "SubjectResources", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "SubjectAssignment/:SubjectId", component: SubjectAssignmentComponent, title: "SubjectAssignment", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "AssignmentView/:AssignmentStudentId", component: StudentAssignmentViewComponent, title: "AssignmentView", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Student Certificate", component: CertificateComponent, title: "Certificate", canActivate: [noNavigateWithoutLoginGuard] },
        ]
    },
    {
        path: "Octa",
        component: MainLayoutComponent,
        title: "Octa Home",
        canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard],
        children: [
            { path: "Bus Details", component: BusDetailsComponent, title: "Bus", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Bus Students/:domainName/:busId", component: BusStudentComponent, title: "Bus Students", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Bus Types", component: BusTypesComponent, title: "Bus Type", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Bus Status", component: BusStatusComponent, title: "Bus Status", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Bus Districts", component: BusDistrictsComponent, title: "Bus Districts", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Bus Categories", component: BusCategoriesComponent, title: "Bus Category", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Bus Companies", component: BusCompaniesComponent, title: "Bus Company", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Print Name Tag", component: BusPrintNameTagComponent, title: "Print Name Tag", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Domains", component: DomainsComponent, title: "Domains", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "School Types", component: SchoolTypeComponent, title: "School Types", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "School", component: SchoolComponentOcta, title: "Schools", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Account", component: AccountComponent, title: "Accounts", canActivate: [noNavigateWithoutLoginGuard] },
        ]
    },
    {
        path: "CommunicationModule",
        component: MainLayoutComponent,
        title: "Communication",
        canActivate: [noNavigateWithoutLoginGuard],
        children: [
            { path: "My Notifications", component: MyNotificationComponent, title: "Notifications", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "My Requests", component: MyRequestsComponent, title: "Requests", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "My Messages", component: MyMessagesComponent, title: "Messages", canActivate: [noNavigateWithoutLoginGuard] },
        ]
    },

    { path: '**', redirectTo: '/' }
];