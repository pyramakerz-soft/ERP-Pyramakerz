import { Routes } from '@angular/router';
import { noNavigateWithoutLoginGuard } from './Guards/no-navigate-without-login.guard';
import { noNavigateToLoginIfLoginGuard } from './Guards/no-navigate-to-login-if-login.guard';
import { navigateIfParentGuard } from './Guards/navigate-if-parent.guard';
import { navigateIfStudentGuard } from './Guards/navigate-if-student.guard';
import { navigateIfEmployeeGuard } from './Guards/navigate-if-employee.guard';
import { navigateIfOctaGuard } from './Guards/navigate-if-octa.guard';
import { noNavigateWithoutOctaLoginGuard } from './Guards/no-navigate-without-octa-login.guard';
import { navigateIfHaveSettingPageGuard } from './Guards/navigate-if-have-This-page.guard';
// import { LoginComponent } from './Pages/Login/login/login.component';
// import { HomeParentComponent } from './Pages/Parent/home-parent/home-parent.component';
// import { EmployeeHomeComponent } from './Pages/Employee/employee-home/employee-home.component';
// import { MainLayoutComponent } from './Pages/Layouts/main-layout/main-layout.component';
// import { OctaLoginComponent } from './Pages/Login/octa-login/octa-login.component';
// import { BusTypesComponent } from './Pages/Employee/Bus/bus-types/bus-types.component';
// import { BusStatusComponent } from './Pages/Employee/Bus/bus-status/bus-status.component';
// import { BusCategoriesComponent } from './Pages/Employee/Bus/bus-categories/bus-categories.component';
// import { BusCompaniesComponent } from './Pages/Employee/Bus/bus-companies/bus-companies.component';
// import { BusDetailsComponent } from './Pages/Employee/Bus/bus-details/bus-details.component';
// import { BusStudentComponent } from './Pages/Employee/Bus/bus-student/bus-student.component';
// import { BusPrintNameTagComponent } from './Pages/Employee/Bus/bus-print-name-tag/bus-print-name-tag.component';
// import { BusDistrictsComponent } from './Pages/Employee/Bus/bus-districts/bus-districts.component';
// import { DomainsComponent } from './Pages/Octa/domains/domains.component';
// import { RoleComponent } from './Pages/Employee/Administrator/role/role.component';
// import { RoleAddEditComponent } from './Pages/Employee/Administrator/role-add-edit/role-add-edit.component';
// import { SchoolTypeComponent } from './Pages/Octa/school-type/school-type.component';
// import { SchoolComponent as SchoolComponentOcta } from './Pages/Octa/school/school.component';
// import { SchoolComponent as SchoolComponentEmployee } from './Pages/Employee/Administrator/school/school.component';
// import { AccountComponent } from './Pages/Octa/account/account.component';
// import { SubjectCategoryComponent } from './Pages/Employee/LMS/subject-category/subject-category.component';
// import { SubjectComponent } from './Pages/Employee/LMS/subject/subject.component';
// import { SubjectViewComponent } from './Pages/Employee/LMS/subject-view/subject-view.component';
// import { EmployeeComponent } from './Pages/Employee/Administrator/employee/employee.component';
// import { EmployeeAddEditComponent } from './Pages/Employee/Administrator/employee-add-edit/employee-add-edit.component';
// import { EmployeeViewComponent } from './Pages/Employee/Administrator/employee-view/employee-view.component';
// import { BuildingComponent } from './Pages/Employee/LMS/building/building.component';
// import { FloorComponent } from './Pages/Employee/LMS/floor/floor.component';
// import { ClassroomComponent } from './Pages/Employee/LMS/classroom/classroom.component';
// import { ViolationTypesComponent } from './Pages/Employee/Violation/violation-types/violation-types.component';
// import { SectionComponent } from './Pages/Employee/LMS/section/section.component';
// import { GradeComponent } from './Pages/Employee/LMS/grade/grade.component';
// import { AcademicYearComponent } from './Pages/Employee/LMS/academic-year/academic-year.component';
// import { SemesterComponent } from './Pages/Employee/LMS/semester/semester.component';
// import { SemesterViewComponent } from './Pages/Employee/LMS/semester-view/semester-view.component';
// import { RegistrationFormFieldComponent } from './Pages/Employee/Registration/registration-form-field/registration-form-field.component';
// import { FieldsComponent } from './Pages/Employee/Registration/fields/fields.component';
// import { AdmissionTestComponent } from './Pages/Employee/Registration/admission-test/admission-test.component';
// import { QuestionsComponent } from './Pages/Employee/Registration/questions/questions.component';
// import { RegistrationFormComponent } from './Pages/Employee/Registration/registration-form/registration-form.component';
// import { RegistrationConfirmationTestDetailsComponent } from './Pages/Employee/Registration/registration-confirmation-test-details/registration-confirmation-test-details.component';
// import { RegistrationFormTestAnswerComponent } from './Pages/Employee/Registration/registration-form-test-answer/registration-form-test-answer.component';
// import { RegistrationConfirmationComponent } from './Pages/Employee/Registration/registration-confirmation/registration-confirmation.component';
// import { RegistrationConfirmationDetailsComponent } from './Pages/Employee/Registration/registration-confirmation-details/registration-confirmation-details.component';
// import { InterviewTimeTableComponent } from './Pages/Employee/Registration/interview-time-table/interview-time-table.component';
// import { InterviewRegistrationComponent as InterviewRegistrationComponentEmployee } from './Pages/Employee/Registration/interview-registration/interview-registration.component';
// import { InterviewRegistrationComponent as InterviewRegistrationComponentParent } from './Pages/Parent/interview-registration/interview-registration.component';
// import { AdmissionTestParentComponent } from './Pages/Parent/RegistrationModule/admission-test-parent/admission-test-parent.component';
// import { RegistraionTestComponent } from './Pages/Parent/RegistrationModule/registraion-test/registraion-test.component';
// import { ClassroomsAccommodationComponent } from './Pages/Employee/Registration/classrooms-accommodation/classrooms-accommodation.component';
// import { SignUpComponent } from './Pages/Login/sign-up/sign-up.component';
// import { SuppliersComponent } from './Pages/Employee/Accounting/suppliers/suppliers.component';
// import { DebitsComponent } from './Pages/Employee/Accounting/debits/debits.component';
// import { CreditsComponent } from './Pages/Employee/Accounting/credits/credits.component';
// import { AssetsComponent } from './Pages/Employee/Accounting/assets/assets.component';
// import { TuitionFeesTypesComponent } from './Pages/Employee/Accounting/tuition-fees-types/tuition-fees-types.component';
// import { TuitionDiscountTypesComponent } from './Pages/Employee/Accounting/tuition-discount-types/tuition-discount-types.component';
// import { AccountingEntriesDocTypeComponent } from './Pages/Employee/Accounting/accounting-entries-doc-type/accounting-entries-doc-type.component';
// import { JobComponent } from './Pages/Employee/Administrator/job/job.component';
// import { JobCategoriesComponent } from './Pages/Employee/Administrator/job-categories/job-categories.component';
// import { AcademicDegreeComponent } from './Pages/Employee/Administrator/academic-degree/academic-degree.component';
// import { ReasonsforleavingworkComponent } from './Pages/Employee/Administrator/reasonsforleavingwork/reasonsforleavingwork.component';
// import { DepartmentComponent } from './Pages/Employee/Administrator/department/department.component';
// import { OutcomesComponent } from './Pages/Employee/Accounting/outcomes/outcomes.component';
// import { IncomesComponent } from './Pages/Employee/Accounting/incomes/incomes.component';
// import { SavesComponent } from './Pages/Employee/Accounting/saves/saves.component';
// import { AccountingTreeComponent } from './Pages/Employee/Accounting/accounting-tree/accounting-tree.component';
// import { BankComponent } from './Pages/Employee/Accounting/bank/bank.component';
// import { AccountingEmployeeComponent } from './Pages/Employee/Accounting/accounting-employee/accounting-employee.component';
// import { AccountingEmployeeEditComponent } from './Pages/Employee/Accounting/accounting-employee-edit/accounting-employee-edit.component';
// import { AccountingStudentComponent } from './Pages/Employee/Accounting/accounting-student/accounting-student.component';
// import { AccountingStudentEditComponent } from './Pages/Employee/Accounting/accounting-student-edit/accounting-student-edit.component';
// import { AddChildComponent } from './Pages/Employee/Accounting/add-child/add-child.component';
// import { FeesActivationComponent } from './Pages/Employee/Accounting/fees-activation/fees-activation.component';
// import { ReceivableComponent } from './Pages/Employee/Accounting/receivable/receivable.component';
// import { ReceivableDetailsComponent } from './Pages/Employee/Accounting/receivable-details/receivable-details.component';
// import { PayableComponent } from './Pages/Employee/Accounting/payable/payable.component';
// import { PayableDetailsComponent } from './Pages/Employee/Accounting/payable-details/payable-details.component';
// import { AccountingEntriesComponent } from './Pages/Employee/Accounting/accounting-entries/accounting-entries.component';
// import { AccountingEntriesDetailsComponent } from './Pages/Employee/Accounting/accounting-entries-details/accounting-entries-details.component';
// import { InstallmentDeductionDetailComponent } from './Pages/Employee/Accounting/installment-deduction-detail/installment-deduction-detail.component';
// import { InstallmentDeductionMasterComponent } from './Pages/Employee/Accounting/installment-deduction-master/installment-deduction-master.component';
// import { PayableDocTypeComponent } from './Pages/Employee/Accounting/payable-doc-type/payable-doc-type.component';
// import { ReceivableDocTypeComponent } from './Pages/Employee/Accounting/receivable-doc-type/receivable-doc-type.component';
// import { CategoriesComponent } from './Pages/Employee/Inventory/categories/categories.component';
// import { SubCategoryComponent } from './Pages/Employee/Inventory/sub-category/sub-category.component';
// import { ShopItemsComponent } from './Pages/Employee/Inventory/shop-items/shop-items.component';
// import { ShopItemsAddEditComponent } from './Pages/Employee/Inventory/shop-items-add-edit/shop-items-add-edit.component';
// import { StoresComponent } from './Pages/Employee/Inventory/stores/stores.component';
// import { InventoryMasterComponent } from './Pages/Employee/Inventory/inventory-master/inventory-master.component';
// import { InventoryDetailsComponent } from './Pages/Employee/Inventory/inventory-details/inventory-details.component';
// import { CreateHygieneFormComponent } from './Pages/Employee/Clinic/hygiene_form/create-hygiene-form/create-hygiene-form.component';
// import { HygieneFormComponent } from './Pages/Employee/Clinic/hygiene_form/hygiene-form/hygiene-form.component';
// import { DrugsComponent } from './Pages/Employee/Clinic/drugs/drugs.component';
// import { DiagnosisComponent } from './Pages/Employee/Clinic/diagnosis/diagnosis.component';
// import { HygieneTypesComponent } from './Pages/Employee/Clinic/hygiene-types/hygiene-types.component';
// import { FollowUpComponent } from './Pages/Employee/Clinic/follow-up/follow-up.component';
// import { MedicalHistoryComponent } from './Pages/Employee/Clinic/medical-history/medical-history-table/medical-history.component';
// import { ShopComponent } from './Pages/Student/Ecommerce/shop/shop.component';
// import { ShopItemComponent } from './Pages/Student/Ecommerce/shop-item/shop-item.component';
// import { CartComponent } from './Pages/Student/Ecommerce/cart/cart.component';
// import { OrderComponent } from './Pages/Student/Ecommerce/order/order.component';
// import { DosesComponent } from './Pages/Employee/Clinic/doses/doses.component';
// import { MedicalReportComponent } from './Pages/Employee/Clinic/medical-report/medical-report/medical-report.component';
// import { OrderItemsComponent } from './Pages/Student/Ecommerce/order-items/order-items.component';
// import { OrderHistoryComponent } from './Pages/Employee/E-Commerce/order-history/order-history.component';
// import { StockingComponent } from './Pages/Employee/Inventory/stocking/stocking.component';
// import { StockingDetailsComponent } from './Pages/Employee/Inventory/stocking-details/stocking-details.component';
// import { ViewHygieneFormComponent } from './Pages/Employee/Clinic/hygiene_form/veiw-hygiene-form/veiw-hygiene-form.component';
// import { StudentsNamesInClassComponent } from './Pages/Employee/Registration/Reports/students-names-in-class/students-names-in-class.component';
// import { StudentInformationComponent } from './Pages/Employee/Registration/Reports/student-information/student-information.component';
// import { ProofRegistrationAndSuccessFormReportComponent } from './Pages/Employee/Registration/Reports/proof-registration-and-success-form-report/proof-registration-and-success-form-report.component';
// import { ProofRegistrationReportComponent } from './Pages/Employee/Registration/Reports/proof-registration-report/proof-registration-report.component';
// import { StudentsInformationFormReportComponent } from './Pages/Employee/Registration/Reports/students-information-form-report/students-information-form-report.component';
// import { PdfPrintComponent } from './Component/pdf-print/pdf-print.component';
// import { AcademicSequentialReportComponent } from './Pages/Employee/Registration/Reports/academic-sequential-report/academic-sequential-report.component';
// import { TransferedFromKindergartenReportComponent } from './Pages/Employee/Registration/Reports/transfered-from-kindergarten-report/transfered-from-kindergarten-report.component';
// import { TemplateComponent } from './Pages/Employee/LMS/template/template.component';
// import { InventoryTransactionReportComponent } from './Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master/invoice-report-master.component';
// import { InvoiceReportMasterDetailedComponent } from './Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master-detailed/invoice-report-master-detailed.component';
// import { EvaluationComponent } from './Pages/Employee/LMS/evaluation/evaluation.component';
// import { EvaluationTemplateGroupComponent } from './Pages/Employee/LMS/evaluation-template-group/evaluation-template-group.component';
// import { EvaluationTemplateGroupQuestionComponent } from './Pages/Employee/LMS/evaluation-template-group-question/evaluation-template-group-question.component';
// import { EvaluationFeedbackComponent } from './Pages/Employee/LMS/evaluation-feedback/evaluation-feedback.component';
// import { EvaluationEmployeeAnswerComponent } from './Pages/Employee/LMS/evaluation-employee-answer/evaluation-employee-answer.component';
// import { BookCorrectionComponent } from './Pages/Employee/LMS/book-correction/book-correction.component';
// import { MedalComponent } from './Pages/Employee/LMS/medal/medal.component';
// import { LessonActivityTypeComponent } from './Pages/Employee/LMS/lesson-activity-type/lesson-activity-type.component';
// import { LessonResourcesTypeComponent } from './Pages/Employee/LMS/lesson-resources-type/lesson-resources-type.component';
// import { StudentMedalComponent } from './Pages/Employee/LMS/student-medal/student-medal.component';
// import { LessonComponent } from './Pages/Employee/LMS/lesson/lesson.component';
// import { PerformanceTypeComponent } from './Pages/Employee/LMS/performance-type/performance-type.component';
// import { DailyPerformanceComponent } from './Pages/Employee/LMS/daily-performance/daily-performance.component';
// import { LessonResourceComponent } from './Pages/Employee/LMS/lesson-resource/lesson-resource.component';
// import { LessonActivityComponent } from './Pages/Employee/LMS/lesson-activity/lesson-activity.component';
// import { LessonLiveComponent } from './Pages/Employee/LMS/lesson-live/lesson-live.component';
// import { StudentLessonLiveComponent } from './Pages/Student/LMS/student-lesson-live/student-lesson-live.component';
// import { AssignmentEditComponent } from './Pages/Employee/LMS/assignment/assignment-edit/assignment-edit.component';
// import { ZatcaDevicesComponent } from './Pages/Employee/Zatca/zatca-devices/zatca-devices.component';
// import { ElectronicInvoiceComponent } from './Pages/Employee/Zatca-ETA/electronic-invoice/electronic-invoice.component';
// import { ClassroomViewComponent } from './Pages/Employee/LMS/classroom-view/classroom-view.component';
// import { QuestionBankComponent } from './Pages/Employee/LMS/question-bank/question-bank.component';
// import { WeightTypeComponent } from './Pages/Employee/LMS/weight-type/weight-type.component';
// import { ClassroomStudentsComponent } from './Pages/Employee/LMS/classroom-students/classroom-students.component';
// import { ClassroomSubjectsComponent } from './Pages/Employee/LMS/classroom-subjects/classroom-subjects.component';
// import { SubjectTeacherComponent } from './Pages/Employee/Administrator/subject-teacher/subject-teacher.component';
// import { SubjectCoTeacherComponent } from './Pages/Employee/Administrator/subject-co-teacher/subject-co-teacher.component';
// import { StudentsComponent } from './Pages/Employee/Administrator/students/students.component';
// import { DailyPerformanceMasterComponent } from './Pages/Employee/LMS/daily-performance-master/daily-performance-master.component';
// import { AssignmentComponent } from './Pages/Employee/LMS/assignment/assignment.component';
// import { ReportItemCardComponent } from './Pages/Employee/Inventory/Report/report-item-card/item-card/report-item-card.component';
// import { AssignmentStudentComponent } from './Pages/Employee/LMS/assignment-student/assignment-student.component';
// import { AssignmentStudentComponent as AssignmentStudentStudentComponent } from './Pages/Student/LMS/assignment-student/assignment-student.component';
// import { SubjectComponent as SubjectStudentComponent } from './Pages/Student/LMS/subject/subject.component';
// import { AssignmentDetailComponent } from './Pages/Employee/LMS/assignment-detail/assignment-detail.component';
// import { POSComponent } from './Pages/Employee/ETA/pos/pos.component';
// import { CertificatesIssuerComponent } from './Pages/Employee/ETA/certificates-issuer/certificates-issuer.component';
// import { ElectronicInvoiceDetailComponent } from './Pages/Employee/Zatca-ETA/electronic-invoice-detail/electronic-invoice-detail.component';
// import { TaxIssuerComponent } from './Pages/Employee/ETA/tax-issuer/tax-issuer.component';
// import { SchoolConfigurationComponent } from './Pages/Employee/Zatca-ETA/school-configuration/school-configuration.component';
// import { DailyPerformanceViewComponent } from './Pages/Employee/LMS/daily-performance-view/daily-performance-view.component';
// import { SubjectWeeksComponent } from './Pages/Student/LMS/subject-weeks/subject-weeks.component';
// import { FeesActivationReportComponent } from './Pages/Employee/Accounting/Report/fees-activation-report/fees-activation-report.component';
// import { SubjectWeekLessonComponent } from './Pages/Student/LMS/subject-week-lesson/subject-week-lesson.component';
// import { SubjectResourcesComponent } from './Pages/Student/LMS/subject-resources/subject-resources.component';
// import { SubjectLessonLiveComponent } from './Pages/Student/LMS/subject-lesson-live/subject-lesson-live.component';
// import { AccountigReportsComponent } from './Pages/Employee/Accounting/Report/accountig-reports/accountig-reports.component';
// import { SubjectAssignmentComponent } from './Pages/Student/LMS/subject-assignment/subject-assignment.component';
// import { StudentAssignmentViewComponent } from './Pages/Student/LMS/student-assignment-view/student-assignment-view.component';
// import { AccountigConstraintsComponent } from './Pages/Employee/Accounting/Report/accountig-constraints/accountig-constraints.component';
// import { AverageCostCalcComponent } from './Pages/Employee/Inventory/Report/report-item-card/average-cost-calc/average-cost-calc/average-cost-calc.component';
// import { AccountigConfigurationComponent } from './Pages/Employee/Accounting/accountig-configuration/accountig-configuration.component';
// import { TimeTable } from './Models/LMS/time-table';
// import { TimeTableComponent } from './Pages/Employee/LMS/time-table/time-table.component';
// import { TimeTableViewComponent } from './Pages/Employee/LMS/time-table-view/time-table-view.component';
// import { TimeTableReplace } from './Models/LMS/time-table-replace';
// import { TimeTableReplaceComponent } from './Pages/Employee/LMS/time-table-replace/time-table-replace.component';
// import { SignUpEmployeeComponent } from './Pages/Login/sign-up-employee/sign-up-employee.component';
// import { DutyComponent } from './Pages/Employee/LMS/duty/duty.component';
// import { RegisteredEmployeeComponent } from './Pages/Employee/Administrator/registered-employee/registered-employee.component';
// import { RegisteredEmployeeViewComponent } from './Pages/Employee/Administrator/registered-employee-view/registered-employee-view.component';
// import { Violation } from './Models/Violation/violation';
// import { ViolationComponent } from './Pages/Employee/Violation/violation/violation.component';
// import { ViolationViewComponent } from './Pages/Employee/Violation/violation-view/violation-view.component';
// import { AnnouncementComponent } from './Pages/Employee/Administrator/announcement/announcement.component';
// import { StoreBalanceReportComponent } from './Pages/Employee/Inventory/Report/store-balance-report/store-balance-report/store-balance-report.component';
// import { AllStoresBalanceReportComponent } from './Pages/Employee/Inventory/Report/store-balance-report/all-store-balance/all-store-balance.component';
// import { DiscussionRoomComponent } from './Pages/Employee/LMS/discussion-room/discussion-room.component';
// import { NotificationComponent } from './Pages/Employee/Communication/notification/notification.component';
// import { MyNotificationComponent } from './Pages/Communication/my-notification/my-notification.component';
// import { ParentMedicalHistoryComponent } from './Pages/Parent/clinic/medical-history/medical-history-table/medical-history-table.component';
// import { RemedialClassroomComponent } from './Pages/Employee/LMS/remedial-classroom/remedial-classroom.component';
// import { RemedialTimeTableComponent } from './Pages/Employee/LMS/remedial-time-table/remedial-time-table.component';
// import { RemedialTimeTableViewComponent } from './Pages/Employee/LMS/remedial-time-table-view/remedial-time-table-view.component';
// import { RemedialClassroomStudentComponent } from './Pages/Employee/LMS/remedial-classroom-student/remedial-classroom-student.component';
// import { ConductLevelComponent } from './Pages/Employee/SocialWorker/conduct-level/conduct-level.component';
// import { ProcedureTypeComponent } from './Pages/Employee/SocialWorker/procedure-type/procedure-type.component';
// import { ConductTypeComponent } from './Pages/Employee/SocialWorker/conduct-type/conduct-type.component';
// import { ConductComponent } from './Pages/Employee/SocialWorker/conduct/conduct.component';
// import { ConductAddEditComponent } from './Pages/Employee/SocialWorker/conduct-add-edit/conduct-add-edit.component';
// import { AccountStatementsComponent } from './Pages/Employee/Accounting/Report/account-statement/account-statements.component';
// import { MyRequestsComponent } from './Pages/Communication/my-requests/my-requests.component';
// import { IssuesTypeComponent } from './Pages/Employee/SocialWorker/issues-type/issues-type.component';
// import { StudentIssuesComponent } from './Pages/Employee/SocialWorker/student-issues/student-issues.component';
// import { SocialWorkerMedalComponent } from './Pages/Employee/SocialWorker/social-worker-medal/social-worker-medal.component';
// import { CertificateTypeComponent } from './Pages/Employee/SocialWorker/certificate-type/certificate-type.component';
// import { StudentCertificateComponent } from './Pages/Employee/SocialWorker/student-certificate/student-certificate.component';
// import { SocialWorkerMedalStudentComponent } from './Pages/Employee/SocialWorker/social-worker-medal-student/social-worker-medal-student.component';
// import { AttendanceComponent } from './Pages/Employee/SocialWorker/attendance/attendance.component';
// import { AttendanceStudentComponent } from './Pages/Employee/SocialWorker/attendance-student/attendance-student.component';
// import { ViewReportComponent } from './Pages/Employee/Clinic/medical-report/view-report/view-report.component';
// import { HorizontalMeeting } from './Models/SocialWorker/horizontal-meeting';
// import { HorizontalMeetingComponent } from './Pages/Employee/SocialWorker/horizontal-meeting/horizontal-meeting.component';
// import { ParentMeetingComponent } from './Pages/Employee/SocialWorker/parent-meeting/parent-meeting.component';
// import { AppointmentComponent } from './Pages/Employee/SocialWorker/appointment/appointment.component';
// import { AppointmentParentComponent } from './Pages/Employee/SocialWorker/appointment-parent/appointment-parent.component';
// import { EvaluationReportComponent } from './Pages/Employee/LMS/reports/evaluation-report/evaluation-report.component';
// import { ViolationReportComponent } from './Pages/Employee/Violation/Reports/violation-report/violation-report.component';
// import { MyMessagesComponent } from './Pages/Communication/my-messages/my-messages.component';
// import { DailyPreformanceReportComponent } from './Pages/Employee/LMS/reports/daily-preformance-report/daily-preformance-report.component';
// import { DirectMarkComponent } from './Pages/Employee/LMS/direct-mark/direct-mark.component';
// import { DirectMarkStudentComponent } from './Pages/Employee/LMS/direct-mark-student/direct-mark-student.component';
// import { MaintenanceEmployeesComponent } from './Pages/Employee/Maintenance/maintenance-employees/maintenance-employees.component';
// import { MaintenanceCompaniesComponent } from './Pages/Employee/Maintenance/maintenance-companies/maintenance-companies.component';
// import { MaintenanceItemsComponent } from './Pages/Employee/Maintenance/maintenance-items/maintenance-items.component';
// import { CertificateComponent } from './Pages/Employee/LMS/certificate/certificate.component';
// import { TeacherEvaluationReportComponent } from './Pages/Employee/LMS/reports/teacher-evaluation-report/teacher-evaluation-report.component';
// import { ConductReportComponent } from './Pages/Employee/SocialWorker/Reports/conduct-report/conduct-report.component';
// import { OfficialHolidaysComponent } from './Pages/Employee/HR/official-holidays/official-holidays.component';
// import { VacationTypesComponent } from './Pages/Employee/HR/vacation-types/vacation-types.component';
// import { AttendanceReportComponent } from './Pages/Employee/SocialWorker/Reports/attendance-report/attendance-report.component';
// import { StudentIssueReportComponent } from './Pages/Employee/SocialWorker/Reports/student-issue-report/student-issue-report.component';
// import { CertificateStudentReportComponent } from './Pages/Employee/SocialWorker/Reports/certificate-student-report/certificate-student-report.component';
// import { LoansComponent } from './Pages/Employee/HR/loans/loans.component';
// import { BonusComponent } from './Pages/Employee/HR/bonus/bonus.component';
// import { DeductionComponent } from './Pages/Employee/HR/deduction/deduction.component';
// import { LeaveRequestComponent } from './Pages/Employee/HR/leave-request/leave-request.component';
// import { StudentMedalReportComponent } from './Pages/Employee/SocialWorker/Reports/student-medal-report/student-medal-report.component';
// import { AccountBalanceComponent } from './Pages/Employee/Accounting/Report/account-balance/account-balance.component';
// import { AccountingSubledgerComponent } from './Pages/Employee/Accounting/Report/accounting-subledger/accounting-subledger.component';
// import { PermissionGroupComponent } from './Pages/Employee/Archiving/permission-group/permission-group.component';
// import { PermissionGroupEmployeeComponent } from './Pages/Employee/Archiving/permission-group-employee/permission-group-employee.component';
// import { PermissionGroupDetailsComponent } from './Pages/Employee/Archiving/permission-group-details/permission-group-details.component';
// import { ArchivingComponent } from './Pages/Employee/Archiving/archiving/archiving.component';
// import { AccountingStatementReportComponent } from './Pages/Employee/Accounting/Report/accounting-statement-report/accounting-statement-report.component';
// import { VacationEmployeeComponent } from './Pages/Employee/HR/vacation-employee/vacation-employee.component';
// import { LocationComponent } from './Pages/Employee/HR/location/location.component';
// import { AssignmentReportComponent } from './Pages/Employee/LMS/reports/assignment-report/assignment-report.component';
// import { MaintenanceComponent } from './Pages/Employee/Maintenance/maintenance/maintenance.component';
// import { EmployeeClocksComponent } from './Pages/Employee/HR/employee-clocks/employee-clocks.component';
// import { MaintenanceReportComponent } from './Pages/Employee/Maintenance/Reports/maintenance-report/maintenance-report.component';
// import { SalaryConfigurationComponent } from './Pages/Employee/HR/salary-configuration/salary-configuration.component';
// import { EmployeeJobReportComponent } from './Pages/Employee/HR/Reports/employee-job-report/employee-job-report.component';
// import { LoansReportComponent } from './Pages/Employee/HR/Reports/loans-report/loans-report.component';
// import { BonusReportComponent } from './Pages/Employee/HR/Reports/bonus-report/bonus-report.component';
// import { DeductionReportComponent } from './Pages/Employee/HR/Reports/deduction-report/deduction-report.component';
// import { LeaveRequestReportComponent } from './Pages/Employee/HR/Reports/leave-request-report/leave-request-report.component';
// import { VacationEmployeeReportComponent } from './Pages/Employee/HR/Reports/vacation-employee-report/vacation-employee-report.component';
// import { AttendanceReportComponent as HRAttendanceReportComponent } from './Pages/Employee/HR/Reports/attendance-report/attendance-report.component';
// import { ParentAppointmentComponent as ParentAppointmentComponent } from './Pages/Parent/LMS/parent-appointment/parent-appointment.component';
// import { ParentMeetingComponent as meetingParent } from './Pages/Parent/LMS/parent-meeting/parent-meeting.component';
// import { SalaryCalculationComponent } from './Pages/Employee/HR/salary-calculation/salary-calculation.component';
// import { EmployeeSalaryDetailedComponent } from './Pages/Employee/HR/employee-salary-detailed/employee-salary-detailed.component';
// import { SalarySummaryComponent } from './Pages/Employee/HR/Reports/salary-summary/salary-summary.component';
// import { HrEmployeeReportComponent } from './Pages/Employee/HR/Reports/hr-employee-report/hr-employee-report.component';
// import { AttendanceReportByTokenComponent } from './Pages/Employee/HR/Reports/attendance-report-by-token/attendance-report-by-token.component';
// import { SalarySummaryTokenComponent } from './Pages/Employee/HR/Reports/salary-summary-token/salary-summary-token.component';
// import { EmployeeSalaryDetailedByTokenComponent } from './Pages/Employee/HR/employee-salary-detailed-by-token/employee-salary-detailed-by-token.component';
// import { LoansStatusComponent } from './Pages/Employee/HR/Reports/loans-status/loans-status.component';
// import { DashboardComponent } from './Pages/Employee/Dashboard/dashboard/dashboard.component';
// import { ParentLessonComponent } from './Pages/Parent/LMS/parent-lesson/parent-lesson.component';
// import { TimeTableStudentComponent } from './Pages/Student/time-table-student/time-table-student.component';
// import { PrivacyHrComponent } from './Pages/privacy-hr/privacy-hr.component';
// import { UpgradeStudentComponent } from './Pages/Employee/LMS/upgrade-student/upgrade-student.component';
// import { FailedStudentComponent } from './Pages/Employee/LMS/failed-student/failed-student.component';

export const routes: Routes = [
    // { path: "", component: LoginComponent, title: "Login", canActivate: [noNavigateToLoginIfLoginGuard] },
    // { path: "Octa/login", component: OctaLoginComponent, title: "login", canActivate: [noNavigateToLoginIfLoginGuard] },
    // { path: "SignUp", component: SignUpComponent, title: "SignUp", canActivate: [noNavigateToLoginIfLoginGuard] },
    // { path: "EmployeeSignUp", component: SignUpEmployeeComponent, title: "EmployeeSignUp", canActivate: [noNavigateToLoginIfLoginGuard] },
    // { path: "privacy_hr", component: PrivacyHrComponent, title: "privacy_hr" },

    {
        path: '',
        loadComponent: () => import('./Pages/Login/login/login.component').then(m => m.LoginComponent),
        title: 'Login',
        canActivate: [noNavigateToLoginIfLoginGuard]
    },
    {
        path: 'Octa/login',
        loadComponent: () => import('./Pages/Login/octa-login/octa-login.component').then(m => m.OctaLoginComponent),
        title: 'Login',
        canActivate: [noNavigateToLoginIfLoginGuard]
    },
    {
        path: 'SignUp',
        loadComponent: () => import('./Pages/Login/sign-up/sign-up.component').then(m => m.SignUpComponent),
        title: 'SignUp',
        canActivate: [noNavigateToLoginIfLoginGuard]
    },
    {
        path: 'EmployeeSignUp',
        loadComponent: () => import('./Pages/Login/sign-up-employee/sign-up-employee.component').then(m => m.SignUpEmployeeComponent),
        title: 'EmployeeSignUp',
        canActivate: [noNavigateToLoginIfLoginGuard]
    },
    {
        path: 'privacy_hr',
        loadComponent: () => import('./Pages/privacy-hr/privacy-hr.component').then(m => m.PrivacyHrComponent),
        title: 'privacy_hr'
    }, 
    // {
    //     path: "Employee",
    //     component: MainLayoutComponent,
    //     title: "Employee Home",
    //     canActivate: [navigateIfEmployeeGuard, noNavigateWithoutLoginGuard],
    //     children: [
    //         { path: "", component: EmployeeHomeComponent, title: "EmployeeHome" },
    //         { path: "Dashboard", component: DashboardComponent, title: "Dashboard", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Hygiene Types", component: HygieneTypesComponent, title: "Hygiene Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Diagnosis", component: DiagnosisComponent, title: "Diagnosis", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Drugs", component: DrugsComponent, title: "Drugs", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Hygiene Form Medical Report", component: HygieneFormComponent, title: "Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Hygiene Form Medical Report/Create", component: CreateHygieneFormComponent, title: "Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Hygiene Form Medical Report/:id', component: ViewHygieneFormComponent, title: "Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Follow Up", component: FollowUpComponent, title: "Follow Up", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Medical History", component: MedicalHistoryComponent, title: "Medical History", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Medical Report", component: MedicalReportComponent, title: "Medical Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Medical Report/parent/:id', component: ViewReportComponent, title: 'Medical Report By Parent', data: { reportType: 'parent' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Medical Report/doctor/:id', component: ViewReportComponent, title: 'Medical Report By Doctor', data: { reportType: 'doctor' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Doses", component: DosesComponent, title: "Doses", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bus Details", component: BusDetailsComponent, title: "Bus", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bus Students/:domainName/:busId", component: BusStudentComponent, title: "Bus Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bus Types", component: BusTypesComponent, title: "Bus Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bus Status", component: BusStatusComponent, title: "Bus Status", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bus Districts", component: BusDistrictsComponent, title: "Bus Districts", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bus Categories", component: BusCategoriesComponent, title: "Bus Category", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bus Companies", component: BusCompaniesComponent, title: "Bus Company", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Print Name Tag", component: BusPrintNameTagComponent, title: "Print Name Tag", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Role", component: RoleComponent, title: "Role", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Role/Create", component: RoleAddEditComponent, title: "Role Create", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },  //
    //         { path: "Role/:id", component: RoleAddEditComponent, title: "Role Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },  //
    //         { path: "Subject Categories", component: SubjectCategoryComponent, title: "Subject Categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Subject", component: SubjectComponent, title: "Subjects", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Subject/:domainName/:SubId", component: SubjectViewComponent, title: "Subject", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Employee", component: EmployeeComponent, title: "Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Employee/Create", component: EmployeeAddEditComponent, title: "Employee Create", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
    //         { path: "Employee/Edit/:id", component: EmployeeAddEditComponent, title: "Employee Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
    //         { path: "Employee/:id", component: EmployeeViewComponent, title: "Employee Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
    //         { path: "Building", component: BuildingComponent, title: "Building", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Floor/:domainName/:Id", component: FloorComponent, title: "Floor", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Classroom", component: ClassroomComponent, title: "Classroom", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Classroom/:id", component: ClassroomViewComponent, title: "Classroom", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Violation Types", component: ViolationTypesComponent, title: "Violation Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Section", component: SectionComponent, title: "Section", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Grade/:domainName/:Id", component: GradeComponent, title: "Grade", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Academic Years", component: AcademicYearComponent, title: "Academic Year", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Semester/:domainName/:Id", component: SemesterComponent, title: "Semester", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Working Weeks/:domainName/:Id", component: SemesterViewComponent, title: "Semester", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
    //         { path: "School", component: SchoolComponentEmployee, title: "Schools", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Registration Form", component: RegistrationFormComponent, title: "Registration Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Registration Form Field", component: RegistrationFormFieldComponent, title: "RegistrationFormField", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Registration Form Field/:id", component: FieldsComponent, title: "CategoryFields", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Admission Test", component: AdmissionTestComponent, title: "Admission Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Question/:id", component: QuestionsComponent, title: "question", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Registration Confirmation", component: RegistrationConfirmationComponent, title: "Registration Confirmation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Registration Confirmation/:Id", component: RegistrationConfirmationDetailsComponent, title: "Registration Confirmation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Registration Confirmation Test/:id", component: RegistrationConfirmationTestDetailsComponent, title: "Registration Confirmation Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Registration Confirmation Test/:Rid/:Pid/:Tid", component: RegistrationFormTestAnswerComponent, title: "Registration Confirmation Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Interview Time Table", component: InterviewTimeTableComponent, title: "Interview Time Table", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Interview Registration/:Id", component: InterviewRegistrationComponentEmployee, title: "Interview Registration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Classroom Accommodation", component: ClassroomsAccommodationComponent, title: "Classroom Accommodation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Supplier", component: SuppliersComponent, title: "Suppliers", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Debit", component: DebitsComponent, title: "Debits", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Credit", component: CreditsComponent, title: "Credits", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Asset", component: AssetsComponent, title: "Assets", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Tuition Fees Type", component: TuitionFeesTypesComponent, title: "Tuition Fees Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Tuition Discount Type", component: TuitionDiscountTypesComponent, title: "TuitionDiscountTypes", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Entries Doc Type", component: AccountingEntriesDocTypeComponent, title: "AccountingEntriesDocTypes", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Job/:id", component: JobComponent, title: "Job", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Job Category", component: JobCategoriesComponent, title: "Job Categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Academic Degree", component: AcademicDegreeComponent, title: "Academic Degree", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Reasons For Leaving Work", component: ReasonsforleavingworkComponent, title: "Reasons for leaving work", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Department", component: DepartmentComponent, title: "Department", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Outcome", component: OutcomesComponent, title: "Outcome", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Income", component: IncomesComponent, title: "Income", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Safe", component: SavesComponent, title: "Safe", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Tree", component: AccountingTreeComponent, title: "Accounting Tree", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bank", component: BankComponent, title: "Bank", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Employee Accounting", component: AccountingEmployeeComponent, title: "Employee Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Employee Accounting/:id", component: AccountingEmployeeEditComponent, title: "Employee Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student Accounting", component: AccountingStudentComponent, title: "Student Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student Accounting/:id", component: AccountingStudentEditComponent, title: "Student Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Add Children", component: AddChildComponent, title: "Add Children", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Fees Activation", component: FeesActivationComponent, title: "Fees Activation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Receivable", component: ReceivableComponent, title: "Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Receivable/Create", component: ReceivableDetailsComponent, title: "Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Receivable/:id", component: ReceivableDetailsComponent, title: "Edit Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Receivable/View/:id", component: ReceivableDetailsComponent, title: "View Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Payable", component: PayableComponent, title: "Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Payable/Create", component: PayableDetailsComponent, title: "Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Payable/:id", component: PayableDetailsComponent, title: "Edit Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Payable/View/:id", component: PayableDetailsComponent, title: "View Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Entries", component: AccountingEntriesComponent, title: "AccountingEntries", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Entries/Create", component: AccountingEntriesDetailsComponent, title: "AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Entries/:id", component: AccountingEntriesDetailsComponent, title: "Edit AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Entries/View/:id", component: AccountingEntriesDetailsComponent, title: "View AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Installment Deduction", component: InstallmentDeductionMasterComponent, title: "Installment Deduction", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Installment Deduction/View/:id", component: InstallmentDeductionDetailComponent, title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Installment Deduction/Edit/:id", component: InstallmentDeductionDetailComponent, title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Installment Deduction/Create", component: InstallmentDeductionDetailComponent, title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Payable Doc Type", component: PayableDocTypeComponent, title: "Payable Doc Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Receivable Doc Type", component: ReceivableDocTypeComponent, title: "Receivable Doc Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Inventory Categories", component: CategoriesComponent, title: "Inventory categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Inventory Sub Categories/:id", component: SubCategoryComponent, title: "Sub_categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Items", component: ShopItemsComponent, title: "Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Shop Item/Create", component: ShopItemsAddEditComponent, title: "Create Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Shop Item/:id", component: ShopItemsAddEditComponent, title: "Edit Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Stores", component: StoresComponent, title: "Store", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Sales", component: InventoryMasterComponent, title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 11 } },
    //         { path: "Sales/:FlagId", component: InventoryDetailsComponent, title: "Sales Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Sales/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Sales Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Sales Returns", component: InventoryMasterComponent, title: "Sales Returns", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 12 } },
    //         { path: "Sales Returns/:FlagId", component: InventoryDetailsComponent, title: "Sales Returns Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Sales Returns/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Sales Returns Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Purchase Returns", component: InventoryMasterComponent, title: "Purchase", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 10 } },
    //         { path: "Purchase Returns/:FlagId", component: InventoryDetailsComponent, title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Purchase Returns/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Purchases", component: InventoryMasterComponent, title: "Purchase", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 9 } },
    //         { path: "Purchases/:FlagId", component: InventoryDetailsComponent, title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Purchases/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Opening Balances", component: InventoryMasterComponent, title: "Opening Balances", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 1 } },
    //         { path: "Opening Balances/:FlagId", component: InventoryDetailsComponent, title: "Opening Balances Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Opening Balances/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Opening Balances Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Addition", component: InventoryMasterComponent, title: "Addition", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 2 } },
    //         { path: "Addition/:FlagId", component: InventoryDetailsComponent, title: "Addition Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Addition/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Addition Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Addition Adjustment", component: InventoryMasterComponent, title: "Addition", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 3 } },
    //         { path: "Addition Adjustment/:FlagId", component: InventoryDetailsComponent, title: "Addition Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Addition Adjustment/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Addition Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Disbursement", component: InventoryMasterComponent, title: "Addition", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 4 } },
    //         { path: "Disbursement/:FlagId", component: InventoryDetailsComponent, title: "Disbursement Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Disbursement/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Disbursement Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Disbursement Adjustment", component: InventoryMasterComponent, title: "Disbursement", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 5 } },
    //         { path: "Disbursement Adjustment/:FlagId", component: InventoryDetailsComponent, title: "Disbursement Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Disbursement Adjustment/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Disbursement Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Gifts", component: InventoryMasterComponent, title: "Gifts", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 6 } },
    //         { path: "Gifts/:FlagId", component: InventoryDetailsComponent, title: "Gifts Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Gifts/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Gifts Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Purchase Order", component: InventoryMasterComponent, title: "Purchase Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 13 } },
    //         { path: "Purchase Order/:FlagId", component: InventoryDetailsComponent, title: "Purchase Order Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Purchase Order/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Purchase Order Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Transfer to Store", component: InventoryMasterComponent, title: "Transfer", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 8 } },
    //         { path: "Transfer to Store/:FlagId", component: InventoryDetailsComponent, title: "Transfer to Store Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Transfer to Store/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Transfer to Store Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Damaged", component: InventoryMasterComponent, title: "Damaged", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 7 } },
    //         { path: "Damaged/:FlagId", component: InventoryDetailsComponent, title: "Damaged Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Damaged/Edit/:FlagId/:id", component: InventoryDetailsComponent, title: "Damaged Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "The Shop", component: ShopComponent, title: "Shop", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "The Shop/:id", component: ShopItemComponent, title: "Shop Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Cart", component: CartComponent, title: "Cart", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Order", component: OrderComponent, title: "Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Order History", component: OrderHistoryComponent, title: "Order History", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Order/:id", component: OrderItemsComponent, title: "Order Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Stocking", component: StockingComponent, title: "Stocking", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Stocking/Create", component: StockingDetailsComponent, title: "Stocking Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Stocking/Edit/:id", component: StockingDetailsComponent, title: "Stocking Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student Names In Class", component: StudentsNamesInClassComponent, title: "Students' Names In Class", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student Information", component: StudentInformationComponent, title: "StudentInformation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Proof Registration And Success Form", component: ProofRegistrationAndSuccessFormReportComponent, title: "ProofRegistrationAndSuccessForm", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Proof Registration", component: ProofRegistrationReportComponent, title: "ProofRegistration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Students Information Form Report", component: StudentsInformationFormReportComponent, title: "StudentsInformationFormReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Academic Sequential Report", component: AcademicSequentialReportComponent, title: "AcademicSequentialReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Transferred  From Kindergarten Report", component: TransferedFromKindergartenReportComponent, title: "TransferedFromKindergartenReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Template", component: TemplateComponent, title: "Template", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Inventory Transaction Report', component: InventoryTransactionReportComponent, title: 'Inventory Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'inventory' } },
    //         { path: 'Sales Transaction Report', component: InventoryTransactionReportComponent, title: 'Sales Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'sales' } },
    //         { path: 'Purchase Transaction Report', component: InventoryTransactionReportComponent, title: 'Purchase Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'purchase' } },
    //         { path: 'Inventory Transaction Detailed Report', component: InvoiceReportMasterDetailedComponent, title: 'Inventory Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'inventory' } },
    //         { path: 'Sales Transaction Detailed Report', component: InvoiceReportMasterDetailedComponent, title: 'Sales Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'sales' } },
    //         { path: 'Purchase Transaction Detailed Report', component: InvoiceReportMasterDetailedComponent, title: 'Purchase Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'purchase' } },
    //         { path: "Book Correction", component: BookCorrectionComponent, title: "BookCorrectionComponent", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Evaluation", component: EvaluationComponent, title: "Evaluation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Evaluation Report", component: EvaluationReportComponent, title: "Evaluation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Teacher Evaluation Report", component: TeacherEvaluationReportComponent, title: "Teacher Evaluation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "EvaluationTemplateGroup/:id", component: EvaluationTemplateGroupComponent, title: "EvaluationTemplateGroup", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "EvaluationTemplateGroupQuestion/:id", component: EvaluationTemplateGroupQuestionComponent, title: "EvaluationTemplateGroup", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Received Evaluations", component: EvaluationFeedbackComponent, title: "Received Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Created Evaluations", component: EvaluationFeedbackComponent, title: "Created Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Received Evaluations/:id", component: EvaluationEmployeeAnswerComponent, title: "Received Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Created Evaluations/:id", component: EvaluationEmployeeAnswerComponent, title: "Created Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Medal", component: MedalComponent, title: "Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Lesson Activity Types", component: LessonActivityTypeComponent, title: "Lesson Activity Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Lesson Resources Types", component: LessonResourcesTypeComponent, title: "Lesson Resource Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student Medal", component: StudentMedalComponent, title: "Student Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Lessons", component: LessonComponent, title: "Lesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Daily Performance", component: DailyPerformanceComponent, title: "Daily Performance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Performance Type", component: PerformanceTypeComponent, title: "Performance Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Lesson Activity/:id", component: LessonActivityComponent, title: "Lesson Activity", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Lesson Resource/:id", component: LessonResourceComponent, title: "Lesson Resource", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Lesson Live", component: LessonLiveComponent, title: "Lesson Live", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Zatca Devices", component: ZatcaDevicesComponent, title: "Zatca Devices", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Zatca Electronic-Invoice", component: ElectronicInvoiceComponent, title: "Zatca Electronic Invoice", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'zatca' } },
    //         { path: "ETA Electronic-Invoice", component: ElectronicInvoiceComponent, title: "ETA Electronic Invoice", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'eta' } },
    //         { path: "Zatca Electronic-Invoice/:id", component: ElectronicInvoiceDetailComponent, title: "ZATCA Invoice Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'zatca' } },
    //         { path: "ETA Electronic-Invoice/:id", component: ElectronicInvoiceDetailComponent, title: "ETA Invoice Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'eta' } },
    //         { path: "Tax Issuer", component: TaxIssuerComponent, title: "Tax Issuer", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Zatca School Configuration", component: SchoolConfigurationComponent, title: "Zatca School Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "ETA School Configuration", component: SchoolConfigurationComponent, title: "ETA School Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Point Of Sale", component: POSComponent, title: "Point Of Sale", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Certificate Issuer", component: CertificatesIssuerComponent, title: "Certificate Issuer", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Weight Types", component: WeightTypeComponent, title: "Weight Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Classroom Students/:id", component: ClassroomStudentsComponent, title: "Classroom Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Classroom Subject/:id", component: ClassroomSubjectsComponent, title: "Classroom Subject", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Question Bank", component: QuestionBankComponent, title: "Question Bank", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Subject Teacher/:id", component: SubjectTeacherComponent, title: "Subject Teacher", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Subject Co-Teacher/:id", component: SubjectCoTeacherComponent, title: "Subject Co-Teacher", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student", component: StudentsComponent, title: "Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student/Create", component: RegistrationFormComponent, title: "Create Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student/Edit/:RegisterationFormParentId/:StudentId", component: RegistrationFormComponent, title: "Edit Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student/:Id", component: RegistrationConfirmationDetailsComponent, title: "Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Enter Daily Performance", component: DailyPerformanceMasterComponent, title: "Daily Performance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Daily Performance/:id", component: DailyPerformanceViewComponent, title: "Daily Performance View", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student Daily Performance Report", component: DailyPreformanceReportComponent, title: "Daily Performance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'student' } },
    //         { path: "Classroom Daily Performance Report", component: DailyPreformanceReportComponent, title: "Classroom Daily Performance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'classroom' } },
    //         { path: "Assignment", component: AssignmentComponent, title: "Assignment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Assignment Report", component: AssignmentReportComponent, title: "Assignment Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Assignment/:id", component: AssignmentEditComponent, title: "Assignment Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Average Cost Calculation', component: AverageCostCalcComponent, title: 'Average Cost Calculator', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: "Item Card Report", component: ReportItemCardComponent, title: "Item Card Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { showAverage: false } },
    //         { path: "Item Card Report With Average", component: ReportItemCardComponent, title: "Item Card Report With Average", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { showAverage: true } },
    //         { path: "Assignment Student/:id", component: AssignmentStudentComponent, title: "AssignmentStudent", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Assignment Student Answer/:id", component: AssignmentDetailComponent, title: "Assignment Detail", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Maintenance", component: MaintenanceComponent, title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Maintenance Report", component: MaintenanceReportComponent, title: "Maintenance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Maintenance Companies", component: MaintenanceCompaniesComponent, title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Maintenance Employees", component: MaintenanceEmployeesComponent, title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Maintenance Items", component: MaintenanceItemsComponent, title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Fees Activation Report", component: FeesActivationReportComponent, title: "Fees Activation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Receivable Report", component: AccountigReportsComponent, title: "Receivable Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Payable Report", component: AccountigReportsComponent, title: "Payable Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Installment Deduction Report", component: AccountigReportsComponent, title: "Installment Deduction Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Entries Report", component: AccountigReportsComponent, title: "Accounting Entries Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Constraints Report", component: AccountigConstraintsComponent, title: "Accounting Constraints Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Accounting Configuration", component: AccountigConfigurationComponent, title: "Accounting Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Time Table', component: TimeTableComponent, title: 'Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Time Table/:id', component: TimeTableViewComponent, title: 'Time Table View', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Time Table Replace/:id', component: TimeTableReplaceComponent, title: 'Time Table Replace', canActivate: [noNavigateWithoutLoginGuard], },
    //         { path: 'Duty Table', component: DutyComponent, title: 'Duty Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Registered Employee', component: RegisteredEmployeeComponent, title: 'Registered Employee', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Registered Employee/:id', component: RegisteredEmployeeViewComponent, title: 'Registered Employee', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Announcement', component: AnnouncementComponent, title: 'Announcement', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Store Items Balance', component: StoreBalanceReportComponent, title: 'Store Items Balance', data: { reportType: 'QuantityOnly', title: 'Store Balance - Quantity Only' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Store Items Balance with Purchase', component: StoreBalanceReportComponent, title: 'Store Items Balance with Purchase', data: { reportType: 'PurchasePrice', title: 'Store Balance - Purchase Price' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Store Items Balance with Sales', component: StoreBalanceReportComponent, title: 'Store Items Balance with Sales', data: { reportType: 'SalesPrice', title: 'Store Balance - Sales Price' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Store Items Balance with Average Cost', component: StoreBalanceReportComponent, title: 'Store Items Balance with Average Cost', data: { reportType: 'Cost', title: 'Store Balance - Cost' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Store Limited Items', component: StoreBalanceReportComponent, title: 'Store Limited Items', data: { reportType: 'ItemsUnderLimit', title: 'Store Balance - Items Under Limit' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "All Stores Item Balance", component: AllStoresBalanceReportComponent, title: "All Stores Quantity Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'QuantityOnly' } },
    //         { path: "All Stores Item Balance with Purchase", component: AllStoresBalanceReportComponent, title: "All Stores Purchase Price Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'PurchasePrice' } },
    //         { path: "All Stores Item Balance with Sales", component: AllStoresBalanceReportComponent, title: "All Stores Sales Price Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'SalesPrice' } },
    //         { path: "All Stores Item Balance with Average Cost", component: AllStoresBalanceReportComponent, title: "All Stores Cost Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'Cost' } },
    //         { path: 'Discussion Room', component: DiscussionRoomComponent, title: 'Discussion Room', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'violation', component: ViolationComponent, title: 'Violation', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'violation/:id', component: ViolationViewComponent, title: 'Violation', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'violation Report', component: ViolationReportComponent, title: 'Violation Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Notification', component: NotificationComponent, title: 'Notification', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Remedial Classes', component: RemedialClassroomComponent, title: 'Remedial Classroom', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Remedial Classes/:id', component: RemedialClassroomStudentComponent, title: 'Remedial Classroom', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Remedial TimeTable', component: RemedialTimeTableComponent, title: 'Remedial Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Remedial TimeTable/:id', component: RemedialTimeTableViewComponent, title: 'Remedial Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Conduct Level', component: ConductLevelComponent, title: 'Conduct Level', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Procedure Types', component: ProcedureTypeComponent, title: 'Procedure Type', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Conduct Types', component: ConductTypeComponent, title: 'Conduct Type', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Conducts', component: ConductComponent, title: 'Conduct', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: "Conducts/:id", component: ConductAddEditComponent, title: "Conduct", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Conducts/Create", component: ConductAddEditComponent, title: "Conduct", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: 'Conducts Report', component: ConductReportComponent, title: 'Conduct Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
    //         { path: 'Attendance Report', component: AttendanceReportComponent, title: 'Attendance Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
    //         { path: 'Student Issue Report', component: StudentIssueReportComponent, title: 'Student Issue Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
    //         { path: 'Certificate To Student Report', component: CertificateStudentReportComponent, title: 'Certificate To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
    //         { path: 'Medal To Student Report', component: StudentMedalReportComponent, title: 'Medal To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
    //         { path: 'Account Balance Report', component: AccountBalanceComponent, title: 'Account Balance Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Account Subledger Report', component: AccountingSubledgerComponent, title: 'Account Subledger Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
    //         { path: 'Account Statement Report', component: AccountingStatementReportComponent, title: 'Account Statement Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
    //         { path: "Supplier Statement", component: AccountStatementsComponent, title: "Supplier Statement", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Safe Statement", component: AccountStatementsComponent, title: "Safe Statement", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bank Statement", component: AccountStatementsComponent, title: "Bank Statement", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Issues Types", component: IssuesTypeComponent, title: "Issue Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Student Issues", component: StudentIssuesComponent, title: "Student Issues", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Medal Types", component: SocialWorkerMedalComponent, title: "Social Worker Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Certificate Types", component: CertificateTypeComponent, title: "Certificate Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Add Certificate To Student", component: StudentCertificateComponent, title: "Student Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Add Medal To Student", component: SocialWorkerMedalStudentComponent, title: "Social Worker Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Attendance", component: AttendanceComponent, title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Attendance/:id", component: AttendanceStudentComponent, title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Attendance/Create", component: AttendanceStudentComponent, title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Horizontal Meeting", component: HorizontalMeetingComponent, title: "Horizontal Meeting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Parent Meeting", component: ParentMeetingComponent, title: "Parent Meeting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Appoinment", component: AppointmentComponent, title: "Appoinment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Appoinment/:id", component: AppointmentParentComponent, title: "Appoinment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Direct Mark", component: DirectMarkComponent, title: "Direct Mark", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Direct Mark/:id", component: DirectMarkStudentComponent, title: "Direct Mark", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Certificate", component: CertificateComponent, title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Official Holidays", component: OfficialHolidaysComponent, title: "Official Holidays", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Vacation Types", component: VacationTypesComponent, title: "Vacation Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Loans", component: LoansComponent, title: "Loans", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Loans Report", component: LoansReportComponent, title: "Loans Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bonus", component: BonusComponent, title: "Bonus", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Bonus Report", component: BonusReportComponent, title: "Bonus Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Deduction", component: DeductionComponent, title: "Deduction", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Deduction Report", component: DeductionReportComponent, title: "Deduction Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Leave Request", component: LeaveRequestComponent, title: "Leave Request", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Leave Request Report", component: LeaveRequestReportComponent, title: "Leave Request Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Permissions Groups", component: PermissionGroupComponent, title: "Permissions Groups", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Permissions Group Employee/:id", component: PermissionGroupEmployeeComponent, title: "Permissions Group Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Permissions Group Archiving/:id", component: PermissionGroupDetailsComponent, title: "Permissions Group Archiving", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Archiving", component: ArchivingComponent, title: "Archiving", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Vacation Employee", component: VacationEmployeeComponent, title: "Vacation Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Vacation Report", component: VacationEmployeeReportComponent, title: "Vacation Employee Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Location", component: LocationComponent, title: "Location", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Employee Job Report", component: EmployeeJobReportComponent, title: "Employee Job Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Edit Attendance", component: EmployeeClocksComponent, title: "Edit Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Salary Configuration", component: SalaryConfigurationComponent, title: "Salary Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Salary Calculation", component: SalaryCalculationComponent, title: "Salary Calculation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Employee Salary Detailed Report", component: EmployeeSalaryDetailedComponent, title: "Employee Salary Detailed", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "HR Attendance Report", component: HRAttendanceReportComponent, title: "HR Attendance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Salary Summary Report", component: SalarySummaryComponent, title: "Salary Summary", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Hr Employees Report", component: HrEmployeeReportComponent, title: "Hr Employees Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "My Attendance", component: AttendanceReportByTokenComponent, title: "My Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "My Salary Summary", component: SalarySummaryTokenComponent, title: "My Salary Summary", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "My Salary Detailed", component: EmployeeSalaryDetailedByTokenComponent, title: "My Salary Detailed", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Loans Status", component: LoansStatusComponent, title: "Loans Status", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Upgrade Students", component: UpgradeStudentComponent, title: "Upgrade Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //         { path: "Failed Students", component: FailedStudentComponent, title: "Failed Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
    //     ]
    // },
    // {
    //     path: "Parent",
    //     component: MainLayoutComponent,
    //     title: "Parent Home",
    //     canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard],
    //     children: [
    //         { path: "", component: HomeParentComponent, title: "ParentHome", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Admission Test", component: AdmissionTestParentComponent, title: "Admission Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Test/:registerationFormParentID/:TestId", component: RegistraionTestComponent, title: "Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Registration Form", component: RegistrationFormComponent, title: "Registration Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Interview Registration", component: InterviewRegistrationComponentParent, title: "Interview Registration", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Medical History", component: ParentMedicalHistoryComponent, title: "Medical History", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Certificate", component: CertificateComponent, title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: 'Student Issue Report', component: StudentIssueReportComponent, title: 'Student Issue Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' }  },
    //         { path: "Student Daily Performance Report", component: DailyPreformanceReportComponent, title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] , data: { reportType: 'parent' } },
    //         { path: 'Conducts Report', component: ConductReportComponent, title: 'Conduct Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' }  },
    //         { path: 'Attendance Report', component: AttendanceReportComponent, title: 'Attendance Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' }  },
    //         { path: 'Student Report', component: CertificateStudentReportComponent, title: 'Certificate To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard],data: { reportType: 'parent' }   },
    //         { path: 'Students Medal', component: StudentMedalReportComponent, title: 'Medal To Student Report', canActivate: [noNavigateWithoutLoginGuard],data: { reportType: 'parent' }   },
    //         { path: "Lessons", component: ParentLessonComponent, title: "Lesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard],data: { reportType: 'parent' }  },
    //         { path: 'Account Statement', component: AccountingStatementReportComponent, title: 'Account Statement Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard],data: { reportType: 'parent' }   },
    //         { path: "Medical Report", component: MedicalReportComponent, title: "Medical Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] ,data: { reportType: 'parent' }},
    //         { path: "The Shop", component: ShopComponent, title: "Shop", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "The Shop/:id", component: ShopItemComponent, title: "Shop Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Cart", component: CartComponent, title: "Cart", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Order", component: OrderComponent, title: "Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Order/:id", component: OrderItemsComponent, title: "Order Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Appointment", component: ParentAppointmentComponent, title: "Appointment", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //         { path: "Meetings", component: meetingParent, title: "Meetings", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
    //     ]
    // },
    // {
    //     path: "Student",
    //     component: MainLayoutComponent,
    //     title: "Subject",
    //     canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard],
    //     children: [
    //         { path: "", redirectTo: "Subject", pathMatch: "full" },
    //         { path: "The Shop", component: ShopComponent, title: "Shop", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "The Shop/:id", component: ShopItemComponent, title: "Shop Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "Cart", component: CartComponent, title: "Cart", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "Order", component: OrderComponent, title: "Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "Order/:id", component: OrderItemsComponent, title: "Order Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "Lesson Live", component: StudentLessonLiveComponent, title: "Lesson Live", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "Assignment/:id", component: AssignmentStudentStudentComponent, title: "Assignment", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "Subject", component: SubjectStudentComponent, title: "Subject", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "SubjectWeeks/:id", component: SubjectWeeksComponent, title: "SubjectWeeks", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "SubjectWeeksLesson/:SubjectId/:WeekId", component: SubjectWeekLessonComponent, title: "SubjectWeeksLesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "SubjectResources/:SubjectId", component: SubjectResourcesComponent, title: "SubjectResources", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "SubjectLive/:SubjectId", component: SubjectLessonLiveComponent, title: "SubjectResources", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "SubjectAssignment/:SubjectId", component: SubjectAssignmentComponent, title: "SubjectAssignment", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "AssignmentView/:AssignmentStudentId", component: StudentAssignmentViewComponent, title: "AssignmentView", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: "Student Certificate", component: CertificateComponent, title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //         { path: 'Certificate To Student Report', component: CertificateStudentReportComponent, title: 'Certificate To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard],data: { reportType: 'student' }   },
    //         { path: "Lessons", component: ParentLessonComponent, title: "Lesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard],data: { reportType: 'student' }  },
    //         { path: 'Students Medal', component: StudentMedalReportComponent, title: 'Medal To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard],data: { reportType: 'student' }   },
    //         { path: 'Time Table', component: TimeTableStudentComponent, title: 'Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard],data: { reportType: 'student' }   },
    //         // { path: "Certificate", component: CertificateComponent, title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
    //     ]
    // },
    // {
    //     path: "Octa",
    //     component: MainLayoutComponent,
    //     title: "Octa Home",
    //     canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard],
    //     children: [
    //         { path: "", redirectTo: "Domains", pathMatch: "full" },
    //         { path: "Domains", component: DomainsComponent, title: "Domains", canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard] },
    //         { path: "School Types", component: SchoolTypeComponent, title: "School Types", canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard] },
    //         { path: "School", component: SchoolComponentOcta, title: "Schools", canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard] },
    //         { path: "Account", component: AccountComponent, title: "Accounts", canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard] },
    //     ]
    // },
    // {
    //     path: "CommunicationModule",
    //     component: MainLayoutComponent,
    //     title: "Communication",
    //     canActivate: [noNavigateWithoutLoginGuard],
    //     children: [
    //         { path: "My Notifications", component: MyNotificationComponent, title: "Notifications", canActivate: [noNavigateWithoutLoginGuard] },
    //         { path: "My Requests", component: MyRequestsComponent, title: "Requests", canActivate: [noNavigateWithoutLoginGuard] },
    //         { path: "My Messages", component: MyMessagesComponent, title: "Messages", canActivate: [noNavigateWithoutLoginGuard] },
    //     ]
    // },
    {
        path: "Employee",
        loadComponent: () => import('./Pages/Layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        title: "Employee Home",
        canActivate: [navigateIfEmployeeGuard, noNavigateWithoutLoginGuard],
        children: [
            { path: "", loadComponent: () => import('./Pages/Employee/employee-home/employee-home.component').then(m => m.EmployeeHomeComponent), title: "EmployeeHome" },
            { path: "Dashboard", loadComponent: () => import('./Pages/Employee/Dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent), title: "Dashboard", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Hygiene Types", loadComponent: () => import('./Pages/Employee/Clinic/hygiene-types/hygiene-types.component').then(m => m.HygieneTypesComponent), title: "Hygiene Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Diagnosis", loadComponent: () => import('./Pages/Employee/Clinic/diagnosis/diagnosis.component').then(m => m.DiagnosisComponent), title: "Diagnosis", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Drugs", loadComponent: () => import('./Pages/Employee/Clinic/drugs/drugs.component').then(m => m.DrugsComponent), title: "Drugs", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Hygiene Form Medical Report", loadComponent: () => import('./Pages/Employee/Clinic/hygiene_form/hygiene-form/hygiene-form.component').then(m => m.HygieneFormComponent), title: "Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Hygiene Form Medical Report/Create", loadComponent: () => import('./Pages/Employee/Clinic/hygiene_form/create-hygiene-form/create-hygiene-form.component').then(m => m.CreateHygieneFormComponent), title: "Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Hygiene Form Medical Report/:id', loadComponent: () => import('./Pages/Employee/Clinic/hygiene_form/veiw-hygiene-form/veiw-hygiene-form.component').then(m => m.ViewHygieneFormComponent), title: "Hygiene Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Follow Up", loadComponent: () => import('./Pages/Employee/Clinic/follow-up/follow-up.component').then(m => m.FollowUpComponent), title: "Follow Up", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Medical History", loadComponent: () => import('./Pages/Employee/Clinic/medical-history/medical-history-table/medical-history.component').then(m => m.MedicalHistoryComponent), title: "Medical History", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Medical Report", loadComponent: () => import('./Pages/Employee/Clinic/medical-report/medical-report/medical-report.component').then(m => m.MedicalReportComponent), title: "Medical Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Medical Report/parent/:id',loadComponent: () => import('./Pages/Employee/Clinic/medical-report/view-report/view-report.component').then(m => m.ViewReportComponent), title: 'Medical Report By Parent', data: { reportType: 'parent' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Medical Report/doctor/:id', loadComponent: () => import('./Pages/Employee/Clinic/medical-report/view-report/view-report.component').then(m => m.ViewReportComponent), title: 'Medical Report By Doctor', data: { reportType: 'doctor' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Doses", loadComponent: () => import('./Pages/Employee/Clinic/doses/doses.component').then(m => m.DosesComponent), title: "Doses", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Details", loadComponent: () => import('./Pages/Employee/Bus/bus-details/bus-details.component').then(m => m.BusDetailsComponent), title: "Bus", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Students/:domainName/:busId", loadComponent: () => import('./Pages/Employee/Bus/bus-student/bus-student.component').then(m => m.BusStudentComponent), title: "Bus Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Types", loadComponent: () => import('./Pages/Employee/Bus/bus-types/bus-types.component').then(m => m.BusTypesComponent), title: "Bus Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Status", loadComponent: () => import('./Pages/Employee/Bus/bus-status/bus-status.component').then(m => m.BusStatusComponent), title: "Bus Status", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Districts", loadComponent: () => import('./Pages/Employee/Bus/bus-districts/bus-districts.component').then(m => m.BusDistrictsComponent), title: "Bus Districts", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Categories", loadComponent: () => import('./Pages/Employee/Bus/bus-categories/bus-categories.component').then(m => m.BusCategoriesComponent), title: "Bus Category", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bus Companies", loadComponent: () => import('./Pages/Employee/Bus/bus-companies/bus-companies.component').then(m => m.BusCompaniesComponent), title: "Bus Company", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Print Name Tag", loadComponent: () => import('./Pages/Employee/Bus/bus-print-name-tag/bus-print-name-tag.component').then(m => m.BusPrintNameTagComponent), title: "Print Name Tag", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Role", loadComponent: () => import('./Pages/Employee/Administrator/role/role.component').then(m => m.RoleComponent), title: "Role", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Role/Create", loadComponent: () => import('./Pages/Employee/Administrator/role-add-edit/role-add-edit.component').then(m => m.RoleAddEditComponent), title: "Role Create", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },  //
            { path: "Role/:id", loadComponent: () => import('./Pages/Employee/Administrator/role-add-edit/role-add-edit.component').then(m => m.RoleAddEditComponent), title: "Role Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },  //
            { path: "Subject Categories", loadComponent: () => import('./Pages/Employee/LMS/subject-category/subject-category.component').then(m => m.SubjectCategoryComponent), title: "Subject Categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Subject", loadComponent: () => import('./Pages/Employee/LMS/subject/subject.component').then(m => m.SubjectComponent), title: "Subjects", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Subject/:domainName/:SubId", loadComponent: () => import('./Pages/Employee/LMS/subject-view/subject-view.component').then(m => m.SubjectViewComponent), title: "Subject", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee", loadComponent: () => import('./Pages/Employee/Administrator/employee/employee.component').then(m => m.EmployeeComponent), title: "Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee/Create", loadComponent: () => import('./Pages/Employee/Administrator/employee-add-edit/employee-add-edit.component').then(m => m.EmployeeAddEditComponent), title: "Employee Create", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
            { path: "Employee/Edit/:id", loadComponent: () => import('./Pages/Employee/Administrator/employee-add-edit/employee-add-edit.component').then(m => m.EmployeeAddEditComponent), title: "Employee Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
            { path: "Employee/:id", loadComponent: () => import('./Pages/Employee/Administrator/employee-view/employee-view.component').then(m => m.EmployeeViewComponent), title: "Employee Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
            { path: "Building", loadComponent: () => import('./Pages/Employee/LMS/building/building.component').then(m => m.BuildingComponent), title: "Building", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Floor/:domainName/:Id", loadComponent: () => import('./Pages/Employee/LMS/floor/floor.component').then(m => m.FloorComponent), title: "Floor", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom", loadComponent: () => import('./Pages/Employee/LMS/classroom/classroom.component').then(m => m.ClassroomComponent), title: "Classroom", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom/:id", loadComponent: () => import('./Pages/Employee/LMS/classroom-view/classroom-view.component').then(m => m.ClassroomViewComponent), title: "Classroom", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Violation Types", loadComponent: () => import('./Pages/Employee/Violation/violation-types/violation-types.component').then(m => m.ViolationTypesComponent), title: "Violation Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Section", loadComponent: () => import('./Pages/Employee/LMS/section/section.component').then(m => m.SectionComponent), title: "Section", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Grade/:domainName/:Id", loadComponent: () => import('./Pages/Employee/LMS/grade/grade.component').then(m => m.GradeComponent), title: "Grade", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Academic Years", loadComponent: () => import('./Pages/Employee/LMS/academic-year/academic-year.component').then(m => m.AcademicYearComponent), title: "Academic Year", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Semester/:domainName/:Id", loadComponent: () => import('./Pages/Employee/LMS/semester/semester.component').then(m => m.SemesterComponent), title: "Semester", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Working Weeks/:domainName/:Id", loadComponent: () => import('./Pages/Employee/LMS/semester-view/semester-view.component').then(m => m.SemesterViewComponent), title: "Semester", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] }, //
            { path: "School", loadComponent: () => import('./Pages/Employee/Administrator/school/school.component').then(m => m.SchoolComponent), title: "Schools", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Form", loadComponent: () => import('./Pages/Employee/Registration/registration-form/registration-form.component').then(m => m.RegistrationFormComponent), title: "Registration Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Form Field", loadComponent: () => import('./Pages/Employee/Registration/registration-form-field/registration-form-field.component').then(m => m.RegistrationFormFieldComponent), title: "RegistrationFormField", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Form Field/:id", loadComponent: () => import('./Pages/Employee/Registration/fields/fields.component').then(m => m.FieldsComponent), title: "CategoryFields", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Admission Test", loadComponent: () => import('./Pages/Employee/Registration/admission-test/admission-test.component').then(m => m.AdmissionTestComponent), title: "Admission Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Question/:id", loadComponent: () => import('./Pages/Employee/Registration/questions/questions.component').then(m => m.QuestionsComponent), title: "question", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Confirmation", loadComponent: () => import('./Pages/Employee/Registration/registration-confirmation/registration-confirmation.component').then(m => m.RegistrationConfirmationComponent), title: "Registration Confirmation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Confirmation/:Id", loadComponent: () => import('./Pages/Employee/Registration/registration-confirmation-details/registration-confirmation-details.component').then(m => m.RegistrationConfirmationDetailsComponent), title: "Registration Confirmation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Confirmation Test/:id", loadComponent: () => import('./Pages/Employee/Registration/registration-confirmation-test-details/registration-confirmation-test-details.component').then(m => m.RegistrationConfirmationTestDetailsComponent), title: "Registration Confirmation Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Registration Confirmation Test/:Rid/:Pid/:Tid", loadComponent: () => import('./Pages/Employee/Registration/registration-form-test-answer/registration-form-test-answer.component').then(m => m.RegistrationFormTestAnswerComponent), title: "Registration Confirmation Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Interview Time Table", loadComponent: () => import('./Pages/Employee/Registration/interview-time-table/interview-time-table.component').then(m => m.InterviewTimeTableComponent), title: "Interview Time Table", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Interview Registration/:Id", loadComponent: () => import('./Pages/Employee/Registration/interview-registration/interview-registration.component').then(m => m.InterviewRegistrationComponent), title: "Interview Registration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom Accommodation", loadComponent: () => import('./Pages/Employee/Registration/classrooms-accommodation/classrooms-accommodation.component').then(m => m.ClassroomsAccommodationComponent), title: "Classroom Accommodation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Supplier", loadComponent: () => import('./Pages/Employee/Accounting/suppliers/suppliers.component').then(m => m.SuppliersComponent), title: "Suppliers", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Debit", loadComponent: () => import('./Pages/Employee/Accounting/debits/debits.component').then(m => m.DebitsComponent), title: "Debits", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Credit", loadComponent: () => import('./Pages/Employee/Accounting/credits/credits.component').then(m => m.CreditsComponent), title: "Credits", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Asset", loadComponent: () => import('./Pages/Employee/Accounting/assets/assets.component').then(m => m.AssetsComponent), title: "Assets", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Tuition Fees Type", loadComponent: () => import('./Pages/Employee/Accounting/tuition-fees-types/tuition-fees-types.component').then(m => m.TuitionFeesTypesComponent), title: "Tuition Fees Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Tuition Discount Type", loadComponent: () => import('./Pages/Employee/Accounting/tuition-discount-types/tuition-discount-types.component').then(m => m.TuitionDiscountTypesComponent), title: "TuitionDiscountTypes", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries Doc Type", loadComponent: () => import('./Pages/Employee/Accounting/accounting-entries-doc-type/accounting-entries-doc-type.component').then(m => m.AccountingEntriesDocTypeComponent), title: "AccountingEntriesDocTypes", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Job/:id", loadComponent: () => import('./Pages/Employee/Administrator/job/job.component').then(m => m.JobComponent), title: "Job", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Job Category", loadComponent: () => import('./Pages/Employee/Administrator/job-categories/job-categories.component').then(m => m.JobCategoriesComponent), title: "Job Categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Academic Degree", loadComponent: () => import('./Pages/Employee/Administrator/academic-degree/academic-degree.component').then(m => m.AcademicDegreeComponent), title: "Academic Degree", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Reasons For Leaving Work", loadComponent: () => import('./Pages/Employee/Administrator/reasonsforleavingwork/reasonsforleavingwork.component').then(m => m.ReasonsforleavingworkComponent), title: "Reasons for leaving work", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            
            { path: "Department", loadComponent: () => import('./Pages/Employee/Administrator/department/department.component').then(m => m.DepartmentComponent), title: "Department", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Offers", loadComponent: () => import('./Pages/Employee/Administrator/offer/offer.component').then(m => m.OfferComponent), title: "Offers", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },

            { path: 'Department/:id',loadComponent: () => import('./Pages/Employee/Administrator/title/title/title.component').then(m => m.TitleComponent),title: 'Titles',canActivate: [noNavigateWithoutLoginGuard] },
            { path: "Outcome", loadComponent: () => import('./Pages/Employee/Accounting/outcomes/outcomes.component').then(m => m.OutcomesComponent), title: "Outcome", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Income", loadComponent: () => import('./Pages/Employee/Accounting/incomes/incomes.component').then(m => m.IncomesComponent), title: "Income", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Safe", loadComponent: () => import('./Pages/Employee/Accounting/saves/saves.component').then(m => m.SavesComponent), title: "Safe", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Tree", loadComponent: () => import('./Pages/Employee/Accounting/accounting-tree/accounting-tree.component').then(m => m.AccountingTreeComponent), title: "Accounting Tree", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bank Infor Details", loadComponent: () => import('./Pages/Employee/Accounting/bank/bank.component').then(m => m.BankComponent), title: "Bank Infor Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee Accounting", loadComponent: () => import('./Pages/Employee/Accounting/accounting-employee/accounting-employee.component').then(m => m.AccountingEmployeeComponent), title: "Employee Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee Accounting/:id", loadComponent: () => import('./Pages/Employee/Accounting/accounting-employee-edit/accounting-employee-edit.component').then(m => m.AccountingEmployeeEditComponent), title: "Employee Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Accounting", loadComponent: () => import('./Pages/Employee/Accounting/accounting-student/accounting-student.component').then(m => m.AccountingStudentComponent), title: "Student Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Accounting/:id", loadComponent: () => import('./Pages/Employee/Accounting/accounting-student-edit/accounting-student-edit.component').then(m => m.AccountingStudentEditComponent), title: "Student Accounting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Add Children", loadComponent: () => import('./Pages/Employee/Accounting/add-child/add-child.component').then(m => m.AddChildComponent), title: "Add Children", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Fees Activation", loadComponent: () => import('./Pages/Employee/Accounting/fees-activation/fees-activation.component').then(m => m.FeesActivationComponent), title: "Fees Activation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable", loadComponent: () => import('./Pages/Employee/Accounting/receivable/receivable.component').then(m => m.ReceivableComponent), title: "Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable/Create", loadComponent: () => import('./Pages/Employee/Accounting/receivable-details/receivable-details.component').then(m => m.ReceivableDetailsComponent), title: "Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable/:id", loadComponent: () => import('./Pages/Employee/Accounting/receivable-details/receivable-details.component').then(m => m.ReceivableDetailsComponent), title: "Edit Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable/View/:id", loadComponent: () => import('./Pages/Employee/Accounting/receivable-details/receivable-details.component').then(m => m.ReceivableDetailsComponent), title: "View Receivable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable", loadComponent: () => import('./Pages/Employee/Accounting/payable/payable.component').then(m => m.PayableComponent), title: "Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable/Create", loadComponent: () => import('./Pages/Employee/Accounting/payable-details/payable-details.component').then(m => m.PayableDetailsComponent), title: "Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable/:id", loadComponent: () => import('./Pages/Employee/Accounting/payable-details/payable-details.component').then(m => m.PayableDetailsComponent), title: "Edit Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable/View/:id", loadComponent: () => import('./Pages/Employee/Accounting/payable-details/payable-details.component').then(m => m.PayableDetailsComponent), title: "View Payable", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries", loadComponent: () => import('./Pages/Employee/Accounting/accounting-entries/accounting-entries.component').then(m => m.AccountingEntriesComponent), title: "AccountingEntries", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries/Create", loadComponent: () => import('./Pages/Employee/Accounting/accounting-entries-details/accounting-entries-details.component').then(m => m.AccountingEntriesDetailsComponent), title: "AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries/:id", loadComponent: () => import('./Pages/Employee/Accounting/accounting-entries-details/accounting-entries-details.component').then(m => m.AccountingEntriesDetailsComponent), title: "Edit AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries/View/:id", loadComponent: () => import('./Pages/Employee/Accounting/accounting-entries-details/accounting-entries-details.component').then(m => m.AccountingEntriesDetailsComponent), title: "View AccountingEntries Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction", loadComponent: () => import('./Pages/Employee/Accounting/installment-deduction-master/installment-deduction-master.component').then(m => m.InstallmentDeductionMasterComponent), title: "Installment Deduction", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction/View/:id", loadComponent: () => import('./Pages/Employee/Accounting/installment-deduction-detail/installment-deduction-detail.component').then(m => m.InstallmentDeductionDetailComponent), title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction/Edit/:id", loadComponent: () => import('./Pages/Employee/Accounting/installment-deduction-detail/installment-deduction-detail.component').then(m => m.InstallmentDeductionDetailComponent), title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction/Create", loadComponent: () => import('./Pages/Employee/Accounting/installment-deduction-detail/installment-deduction-detail.component').then(m => m.InstallmentDeductionDetailComponent), title: "View Installment Deduction Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable Doc Type", loadComponent: () => import('./Pages/Employee/Accounting/payable-doc-type/payable-doc-type.component').then(m => m.PayableDocTypeComponent), title: "Payable Doc Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable Doc Type", loadComponent: () => import('./Pages/Employee/Accounting/receivable-doc-type/receivable-doc-type.component').then(m => m.ReceivableDocTypeComponent), title: "Receivable Doc Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Inventory Categories", loadComponent: () => import('./Pages/Employee/Inventory/categories/categories.component').then(m => m.CategoriesComponent), title: "Inventory categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Inventory Sub Categories/:id", loadComponent: () => import('./Pages/Employee/Inventory/sub-category/sub-category.component').then(m => m.SubCategoryComponent), title: "Sub_categories", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Items", loadComponent: () => import('./Pages/Employee/Inventory/shop-items/shop-items.component').then(m => m.ShopItemsComponent), title: "Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Shop Item/Create", loadComponent: () => import('./Pages/Employee/Inventory/shop-items-add-edit/shop-items-add-edit.component').then(m => m.ShopItemsAddEditComponent), title: "Create Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Shop Item/:id", loadComponent: () => import('./Pages/Employee/Inventory/shop-items-add-edit/shop-items-add-edit.component').then(m => m.ShopItemsAddEditComponent), title: "Edit Shop Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Stores", loadComponent: () => import('./Pages/Employee/Inventory/stores/stores.component').then(m => m.StoresComponent), title: "Store", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Sales", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Sales", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 11 } },
            { path: "Sales/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Sales Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Sales/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Sales Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Sales Returns", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Sales Returns", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 12 } },
            { path: "Sales Returns/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Sales Returns Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Sales Returns/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Sales Returns Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchase Returns", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Purchase Returns", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 10 } },
            { path: "Purchase Returns/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Purchases Returns Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchase Returns/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Purchases Returns Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchases", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Purchase", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 9 } },
            { path: "Purchases/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchases/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Purchases Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Opening Balances", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Opening Balances", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 1 } },
            { path: "Opening Balances/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Opening Balances Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Opening Balances/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Opening Balances Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Addition", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Addition", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 2 } },
            { path: "Addition/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Addition Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Addition/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Addition Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Addition Adjustment", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Addition Adjustment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 3 } },
            { path: "Addition Adjustment/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Addition Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Addition Adjustment/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Addition Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Disbursement", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Disbursement", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 4 } },
            { path: "Disbursement/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Disbursement Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Disbursement/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Disbursement Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Disbursement Adjustment", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Disbursement Adjustment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 5 } },
            { path: "Disbursement Adjustment/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Disbursement Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Disbursement Adjustment/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Disbursement Adjustment Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Gifts", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Gifts", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 6 } },
            { path: "Gifts/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Gifts Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Gifts/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Gifts Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchase Order", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Purchase Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 13 } },
            { path: "Purchase Order/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Purchase Order Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Purchase Order/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Purchase Order Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Transfer to Store", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Transfer to Store", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 8 } },
            { path: "Transfer to Store/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Transfer to Store Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Transfer to Store/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Transfer to Store Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Damaged", loadComponent: () => import('./Pages/Employee/Inventory/inventory-master/inventory-master.component').then(m => m.InventoryMasterComponent), title: "Damaged", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { id: 7 } },
            { path: "Damaged/:FlagId", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Damaged Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Damaged/Edit/:FlagId/:id", loadComponent: () => import('./Pages/Employee/Inventory/inventory-details/inventory-details.component').then(m => m.InventoryDetailsComponent), title: "Damaged Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "The Shop", loadComponent: () => import('./Pages/Student/Ecommerce/shop/shop.component').then(m => m.ShopComponent), title: "Shop", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "The Shop/:id", loadComponent: () => import('./Pages/Student/Ecommerce/shop-item/shop-item.component').then(m => m.ShopItemComponent), title: "Shop Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Cart", loadComponent: () => import('./Pages/Student/Ecommerce/cart/cart.component').then(m => m.CartComponent), title: "Cart", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Order", loadComponent: () => import('./Pages/Student/Ecommerce/order/order.component').then(m => m.OrderComponent), title: "Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Order History", loadComponent: () => import('./Pages/Employee/E-Commerce/order-history/order-history.component').then(m => m.OrderHistoryComponent), title: "Order History", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Order/:id", loadComponent: () => import('./Pages/Student/Ecommerce/order-items/order-items.component').then(m => m.OrderItemsComponent), title: "Order Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Stocking", loadComponent: () => import('./Pages/Employee/Inventory/stocking/stocking.component').then(m => m.StockingComponent), title: "Stocking", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Stocking/Create", loadComponent: () => import('./Pages/Employee/Inventory/stocking-details/stocking-details.component').then(m => m.StockingDetailsComponent), title: "Stocking Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Stocking/Edit/:id", loadComponent: () => import('./Pages/Employee/Inventory/stocking-details/stocking-details.component').then(m => m.StockingDetailsComponent), title: "Stocking Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Names In Class", loadComponent: () => import('./Pages/Employee/Registration/Reports/students-names-in-class/students-names-in-class.component').then(m => m.StudentsNamesInClassComponent), title: "Students' Names In Class", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Information", loadComponent: () => import('./Pages/Employee/Registration/Reports/student-information/student-information.component').then(m => m.StudentInformationComponent), title: "StudentInformation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Proof Registration And Success Form", loadComponent: () => import('./Pages/Employee/Registration/Reports/proof-registration-and-success-form-report/proof-registration-and-success-form-report.component').then(m => m.ProofRegistrationAndSuccessFormReportComponent), title: "ProofRegistrationAndSuccessForm", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Proof Registration", loadComponent: () => import('./Pages/Employee/Registration/Reports/proof-registration-report/proof-registration-report.component').then(m => m.ProofRegistrationReportComponent), title: "ProofRegistration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Students Information Form Report", loadComponent: () => import('./Pages/Employee/Registration/Reports/students-information-form-report/students-information-form-report.component').then(m => m.StudentsInformationFormReportComponent), title: "StudentsInformationFormReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Academic Sequential Report", loadComponent: () => import('./Pages/Employee/Registration/Reports/academic-sequential-report/academic-sequential-report.component').then(m => m.AcademicSequentialReportComponent), title: "AcademicSequentialReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Transferred  From Kindergarten Report", loadComponent: () => import('./Pages/Employee/Registration/Reports/transfered-from-kindergarten-report/transfered-from-kindergarten-report.component').then(m => m.TransferedFromKindergartenReportComponent), title: "TransferedFromKindergartenReport", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Template", loadComponent: () => import('./Pages/Employee/LMS/template/template.component').then(m => m.TemplateComponent), title: "Template", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Inventory Transaction Report', loadComponent: () => import('./Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master/invoice-report-master.component').then(m => m.InventoryTransactionReportComponent), title: 'Inventory Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'inventory' } },
            { path: 'Sales Transaction Report', loadComponent: () => import('./Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master/invoice-report-master.component').then(m => m.InventoryTransactionReportComponent), title: 'Sales Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'sales' } },
            { path: 'Purchase Transaction Report', loadComponent: () => import('./Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master/invoice-report-master.component').then(m => m.InventoryTransactionReportComponent), title: 'Purchase Transaction Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'purchase' } },
            { path: 'Inventory Transaction Detailed Report', loadComponent: () => import('./Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master-detailed/invoice-report-master-detailed.component').then(m => m.InvoiceReportMasterDetailedComponent), title: 'Inventory Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'inventory' } },
            { path: 'Sales Transaction Detailed Report', loadComponent: () => import('./Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master-detailed/invoice-report-master-detailed.component').then(m => m.InvoiceReportMasterDetailedComponent), title: 'Sales Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'sales' } },
            { path: 'Purchase Transaction Detailed Report', loadComponent: () => import('./Pages/Employee/Inventory/Report/inventory-invoice-report/invoice-report-master-detailed/invoice-report-master-detailed.component').then(m => m.InvoiceReportMasterDetailedComponent), title: 'Purchase Transaction Report Detailed', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'purchase' } },
            { path: "Book Correction", loadComponent: () => import('./Pages/Employee/LMS/book-correction/book-correction.component').then(m => m.BookCorrectionComponent), title: "BookCorrectionComponent", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Evaluation", loadComponent: () => import('./Pages/Employee/LMS/evaluation/evaluation.component').then(m => m.EvaluationComponent), title: "Evaluation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Evaluation Report", loadComponent: () => import('./Pages/Employee/LMS/reports/evaluation-report/evaluation-report.component').then(m => m.EvaluationReportComponent), title: "Evaluation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Teacher Evaluation Report", loadComponent: () => import('./Pages/Employee/LMS/reports/teacher-evaluation-report/teacher-evaluation-report.component').then(m => m.TeacherEvaluationReportComponent), title: "Teacher Evaluation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "EvaluationTemplateGroup/:id", loadComponent: () => import('./Pages/Employee/LMS/evaluation-template-group/evaluation-template-group.component').then(m => m.EvaluationTemplateGroupComponent), title: "EvaluationTemplateGroup", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "EvaluationTemplateGroupQuestion/:id", loadComponent: () => import('./Pages/Employee/LMS/evaluation-template-group-question/evaluation-template-group-question.component').then(m => m.EvaluationTemplateGroupQuestionComponent), title: "EvaluationTemplateGroup", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Received Evaluations", loadComponent: () => import('./Pages/Employee/LMS/evaluation-feedback/evaluation-feedback.component').then(m => m.EvaluationFeedbackComponent), title: "Received Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Created Evaluations", loadComponent: () => import('./Pages/Employee/LMS/evaluation-feedback/evaluation-feedback.component').then(m => m.EvaluationFeedbackComponent), title: "Created Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Received Evaluations/:id", loadComponent: () => import('./Pages/Employee/LMS/evaluation-employee-answer/evaluation-employee-answer.component').then(m => m.EvaluationEmployeeAnswerComponent), title: "Received Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Created Evaluations/:id", loadComponent: () => import('./Pages/Employee/LMS/evaluation-employee-answer/evaluation-employee-answer.component').then(m => m.EvaluationEmployeeAnswerComponent), title: "Created Evaluations", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Medal", loadComponent: () => import('./Pages/Employee/LMS/medal/medal.component').then(m => m.MedalComponent), title: "Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Activity Types", loadComponent: () => import('./Pages/Employee/LMS/lesson-activity-type/lesson-activity-type.component').then(m => m.LessonActivityTypeComponent), title: "Lesson Activity Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Resources Types", loadComponent: () => import('./Pages/Employee/LMS/lesson-resources-type/lesson-resources-type.component').then(m => m.LessonResourcesTypeComponent), title: "Lesson Resource Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Medal", loadComponent: () => import('./Pages/Employee/LMS/student-medal/student-medal.component').then(m => m.StudentMedalComponent), title: "Student Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lessons", loadComponent: () => import('./Pages/Employee/LMS/lesson/lesson.component').then(m => m.LessonComponent), title: "Lesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Daily Performance", loadComponent: () => import('./Pages/Employee/LMS/daily-performance/daily-performance.component').then(m => m.DailyPerformanceComponent), title: "Daily Performance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Performance Type", loadComponent: () => import('./Pages/Employee/LMS/performance-type/performance-type.component').then(m => m.PerformanceTypeComponent), title: "Performance Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Activity/:id", loadComponent: () => import('./Pages/Employee/LMS/lesson-activity/lesson-activity.component').then(m => m.LessonActivityComponent), title: "Lesson Activity", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Resource/:id", loadComponent: () => import('./Pages/Employee/LMS/lesson-resource/lesson-resource.component').then(m => m.LessonResourceComponent), title: "Lesson Resource", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Lesson Live", loadComponent: () => import('./Pages/Employee/LMS/lesson-live/lesson-live.component').then(m => m.LessonLiveComponent), title: "Lesson Live", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Zatca Devices", loadComponent: () => import('./Pages/Employee/Zatca/zatca-devices/zatca-devices.component').then(m => m.ZatcaDevicesComponent), title: "Zatca Devices", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Zatca Electronic-Invoice", loadComponent: () => import('./Pages/Employee/Zatca-ETA/electronic-invoice/electronic-invoice.component').then(m => m.ElectronicInvoiceComponent), title: "Zatca Electronic Invoice", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'zatca' } },
            { path: "ETA Electronic-Invoice", loadComponent: () => import('./Pages/Employee/Zatca-ETA/electronic-invoice/electronic-invoice.component').then(m => m.ElectronicInvoiceComponent), title: "ETA Electronic Invoice", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'eta' } },
            { path: "Zatca Electronic-Invoice/:id", loadComponent: () => import('./Pages/Employee/Zatca-ETA/electronic-invoice-detail/electronic-invoice-detail.component').then(m => m.ElectronicInvoiceDetailComponent), title: "ZATCA Invoice Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'zatca' } },
            { path: "ETA Electronic-Invoice/:id", loadComponent: () => import('./Pages/Employee/Zatca-ETA/electronic-invoice-detail/electronic-invoice-detail.component').then(m => m.ElectronicInvoiceDetailComponent), title: "ETA Invoice Details", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { system: 'eta' } },
            { path: "Tax Issuer", loadComponent: () => import('./Pages/Employee/ETA/tax-issuer/tax-issuer.component').then(m => m.TaxIssuerComponent), title: "Tax Issuer", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Zatca School Configuration", loadComponent: () => import('./Pages/Employee/Zatca-ETA/school-configuration/school-configuration.component').then(m => m.SchoolConfigurationComponent), title: "Zatca School Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "ETA School Configuration", loadComponent: () => import('./Pages/Employee/Zatca-ETA/school-configuration/school-configuration.component').then(m => m.SchoolConfigurationComponent), title: "ETA School Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Point Of Sale", loadComponent: () => import('./Pages/Employee/ETA/pos/pos.component').then(m => m.POSComponent), title: "Point Of Sale", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Certificate Issuer", loadComponent: () => import('./Pages/Employee/ETA/certificates-issuer/certificates-issuer.component').then(m => m.CertificatesIssuerComponent), title: "Certificate Issuer", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Weight Types", loadComponent: () => import('./Pages/Employee/LMS/weight-type/weight-type.component').then(m => m.WeightTypeComponent), title: "Weight Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom Students/:id", loadComponent: () => import('./Pages/Employee/LMS/classroom-students/classroom-students.component').then(m => m.ClassroomStudentsComponent), title: "Classroom Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Classroom Subject/:id", loadComponent: () => import('./Pages/Employee/LMS/classroom-subjects/classroom-subjects.component').then(m => m.ClassroomSubjectsComponent), title: "Classroom Subject", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Question Bank", loadComponent: () => import('./Pages/Employee/LMS/question-bank/question-bank.component').then(m => m.QuestionBankComponent), title: "Question Bank", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Subject Teacher/:id", loadComponent: () => import('./Pages/Employee/Administrator/subject-teacher/subject-teacher.component').then(m => m.SubjectTeacherComponent), title: "Subject Teacher", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Subject Co-Teacher/:id", loadComponent: () => import('./Pages/Employee/Administrator/subject-co-teacher/subject-co-teacher.component').then(m => m.SubjectCoTeacherComponent), title: "Subject Co-Teacher", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student", loadComponent: () => import('./Pages/Employee/Administrator/students/students.component').then(m => m.StudentsComponent), title: "Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student/Create", loadComponent: () => import('./Pages/Employee/Registration/registration-form/registration-form.component').then(m => m.RegistrationFormComponent), title: "Create Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student/Edit/:RegisterationFormParentId/:StudentId", loadComponent: () => import('./Pages/Employee/Registration/registration-form/registration-form.component').then(m => m.RegistrationFormComponent), title: "Edit Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student/:Id", loadComponent: () => import('./Pages/Employee/Registration/registration-confirmation-details/registration-confirmation-details.component').then(m => m.RegistrationConfirmationDetailsComponent), title: "Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Enter Daily Performance", loadComponent: () => import('./Pages/Employee/LMS/daily-performance-master/daily-performance-master.component').then(m => m.DailyPerformanceMasterComponent), title: "Daily Performance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Daily Performance/:id", loadComponent: () => import('./Pages/Employee/LMS/daily-performance-view/daily-performance-view.component').then(m => m.DailyPerformanceViewComponent), title: "Daily Performance View", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Daily Performance Report", loadComponent: () => import('./Pages/Employee/LMS/reports/daily-preformance-report/daily-preformance-report.component').then(m => m.DailyPreformanceReportComponent), title: "Daily Performance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'student' } },
            { path: "Classroom Daily Performance Report", loadComponent: () => import('./Pages/Employee/LMS/reports/daily-preformance-report/daily-preformance-report.component').then(m => m.DailyPreformanceReportComponent), title: "Classroom Daily Performance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'classroom' } },
            { path: "Assignment", loadComponent: () => import('./Pages/Employee/LMS/assignment/assignment.component').then(m => m.AssignmentComponent), title: "Assignment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Assignment Report", loadComponent: () => import('./Pages/Employee/LMS/reports/assignment-report/assignment-report.component').then(m => m.AssignmentReportComponent), title: "Assignment Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Assignment/:id", loadComponent: () => import('./Pages/Employee/LMS/assignment/assignment-edit/assignment-edit.component').then(m => m.AssignmentEditComponent), title: "Assignment Edit", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Average Cost Calculation', loadComponent: () => import('./Pages/Employee/Inventory/Report/report-item-card/average-cost-calc/average-cost-calc/average-cost-calc.component').then(m => m.AverageCostCalcComponent), title: 'Average Cost Calculator', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: "Item Card Report", loadComponent: () => import('./Pages/Employee/Inventory/Report/report-item-card/item-card/report-item-card.component').then(m => m.ReportItemCardComponent), title: "Item Card Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { showAverage: false } },
            { path: "Item Card Report With Average", loadComponent: () => import('./Pages/Employee/Inventory/Report/report-item-card/item-card/report-item-card.component').then(m => m.ReportItemCardComponent), title: "Item Card Report With Average", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { showAverage: true } },
            { path: "Assignment Student/:id", loadComponent: () => import('./Pages/Employee/LMS/assignment-student/assignment-student.component').then(m => m.AssignmentStudentComponent), title: "AssignmentStudent", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Assignment Student Answer/:id", loadComponent: () => import('./Pages/Employee/LMS/assignment-detail/assignment-detail.component').then(m => m.AssignmentDetailComponent), title: "Assignment Detail", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance", loadComponent: () => import('./Pages/Employee/Maintenance/maintenance/maintenance.component').then(m => m.MaintenanceComponent), title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance Report", loadComponent: () => import('./Pages/Employee/Maintenance/Reports/maintenance-report/maintenance-report.component').then(m => m.MaintenanceReportComponent), title: "Maintenance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance Companies", loadComponent: () => import('./Pages/Employee/Maintenance/maintenance-companies/maintenance-companies.component').then(m => m.MaintenanceCompaniesComponent), title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance Employees", loadComponent: () => import('./Pages/Employee/Maintenance/maintenance-employees/maintenance-employees.component').then(m => m.MaintenanceEmployeesComponent), title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Maintenance Items", loadComponent: () => import('./Pages/Employee/Maintenance/maintenance-items/maintenance-items.component').then(m => m.MaintenanceItemsComponent), title: "Maintenance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Fees Activation Report", loadComponent: () => import('./Pages/Employee/Accounting/Report/fees-activation-report/fees-activation-report.component').then(m => m.FeesActivationReportComponent), title: "Fees Activation Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Receivable Report", loadComponent: () => import('./Pages/Employee/Accounting/Report/accountig-reports/accountig-reports.component').then(m => m.AccountigReportsComponent), title: "Receivable Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Payable Report", loadComponent: () => import('./Pages/Employee/Accounting/Report/accountig-reports/accountig-reports.component').then(m => m.AccountigReportsComponent), title: "Payable Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Installment Deduction Report", loadComponent: () => import('./Pages/Employee/Accounting/Report/accountig-reports/accountig-reports.component').then(m => m.AccountigReportsComponent), title: "Installment Deduction Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Entries Report", loadComponent: () => import('./Pages/Employee/Accounting/Report/accountig-reports/accountig-reports.component').then(m => m.AccountigReportsComponent), title: "Accounting Entries Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Constraints Report", loadComponent: () => import('./Pages/Employee/Accounting/Report/accountig-constraints/accountig-constraints.component').then(m => m.AccountigConstraintsComponent), title: "Accounting Constraints Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Accounting Configuration", loadComponent: () => import('./Pages/Employee/Accounting/accountig-configuration/accountig-configuration.component').then(m => m.AccountigConfigurationComponent), title: "Accounting Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Time Table', loadComponent: () => import('./Pages/Employee/LMS/time-table/time-table.component').then(m => m.TimeTableComponent), title: 'Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Time Table/:id', loadComponent: () => import('./Pages/Employee/LMS/time-table-view/time-table-view.component').then(m => m.TimeTableViewComponent), title: 'Time Table View', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Time Table Replace/:id', loadComponent: () => import('./Pages/Employee/LMS/time-table-replace/time-table-replace.component').then(m => m.TimeTableReplaceComponent), title: 'Time Table Replace', canActivate: [noNavigateWithoutLoginGuard], },
            { path: 'Duty Table', loadComponent: () => import('./Pages/Employee/LMS/duty/duty.component').then(m => m.DutyComponent), title: 'Duty Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Registered Employee', loadComponent: () => import('./Pages/Employee/Administrator/registered-employee/registered-employee.component').then(m => m.RegisteredEmployeeComponent), title: 'Registered Employee', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Registered Employee/:id', loadComponent: () => import('./Pages/Employee/Administrator/registered-employee-view/registered-employee-view.component').then(m => m.RegisteredEmployeeViewComponent), title: 'Registered Employee', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Announcement', loadComponent: () => import('./Pages/Employee/Administrator/announcement/announcement.component').then(m => m.AnnouncementComponent), title: 'Announcement', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Store Items Balance', loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/store-balance-report/store-balance-report.component').then(m => m.StoreBalanceReportComponent), title: 'Store Items Balance', data: { reportType: 'QuantityOnly', title: 'Store Balance - Quantity Only' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Store Items Balance with Purchase', loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/store-balance-report/store-balance-report.component').then(m => m.StoreBalanceReportComponent), title: 'Store Items Balance with Purchase', data: { reportType: 'PurchasePrice', title: 'Store Balance - Purchase Price' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Store Items Balance with Sales', loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/store-balance-report/store-balance-report.component').then(m => m.StoreBalanceReportComponent), title: 'Store Items Balance with Sales', data: { reportType: 'SalesPrice', title: 'Store Balance - Sales Price' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Store Items Balance with Average Cost', loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/store-balance-report/store-balance-report.component').then(m => m.StoreBalanceReportComponent), title: 'Store Items Balance with Average Cost', data: { reportType: 'Cost', title: 'Store Balance - Cost' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Store Limited Items', loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/store-balance-report/store-balance-report.component').then(m => m.StoreBalanceReportComponent), title: 'Store Limited Items', data: { reportType: 'ItemsUnderLimit', title: 'Store Balance - Items Under Limit' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "All Stores Item Balance", loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/all-store-balance/all-store-balance.component').then(m => m.AllStoresBalanceReportComponent), title: "All Stores Quantity Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'QuantityOnly' } },
            { path: "All Stores Item Balance with Purchase", loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/all-store-balance/all-store-balance.component').then(m => m.AllStoresBalanceReportComponent), title: "All Stores Purchase Price Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'PurchasePrice' } },
            { path: "All Stores Item Balance with Sales", loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/all-store-balance/all-store-balance.component').then(m => m.AllStoresBalanceReportComponent), title: "All Stores Sales Price Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'SalesPrice' } },
            { path: "All Stores Item Balance with Average Cost", loadComponent: () => import('./Pages/Employee/Inventory/Report/store-balance-report/all-store-balance/all-store-balance.component').then(m => m.AllStoresBalanceReportComponent), title: "All Stores Cost Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'Cost' } },
            { path: 'Discussion Room', loadComponent: () => import('./Pages/Employee/LMS/discussion-room/discussion-room.component').then(m => m.DiscussionRoomComponent), title: 'Discussion Room', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'violation', loadComponent: () => import('./Pages/Employee/Violation/violation/violation.component').then(m => m.ViolationComponent), title: 'Violation', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'violation/:id', loadComponent: () => import('./Pages/Employee/Violation/violation-view/violation-view.component').then(m => m.ViolationViewComponent), title: 'Violation', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'violation Report', loadComponent: () => import('./Pages/Employee/Violation/Reports/violation-report/violation-report.component').then(m => m.ViolationReportComponent), title: 'Violation Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Notification', loadComponent: () => import('./Pages/Employee/Communication/notification/notification.component').then(m => m.NotificationComponent), title: 'Notification', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Remedial Classes', loadComponent: () => import('./Pages/Employee/LMS/remedial-classroom/remedial-classroom.component').then(m => m.RemedialClassroomComponent), title: 'Remedial Classroom', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Remedial Classes/:id', loadComponent: () => import('./Pages/Employee/LMS/remedial-classroom-student/remedial-classroom-student.component').then(m => m.RemedialClassroomStudentComponent), title: 'Remedial Classroom', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Remedial TimeTable', loadComponent: () => import('./Pages/Employee/LMS/remedial-time-table/remedial-time-table.component').then(m => m.RemedialTimeTableComponent), title: 'Remedial Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Remedial TimeTable/:id', loadComponent: () => import('./Pages/Employee/LMS/remedial-time-table-view/remedial-time-table-view.component').then(m => m.RemedialTimeTableViewComponent), title: 'Remedial Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Conduct Level', loadComponent: () => import('./Pages/Employee/SocialWorker/conduct-level/conduct-level.component').then(m => m.ConductLevelComponent), title: 'Conduct Level', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Procedure Types', loadComponent: () => import('./Pages/Employee/SocialWorker/procedure-type/procedure-type.component').then(m => m.ProcedureTypeComponent), title: 'Procedure Type', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Conduct Types', loadComponent: () => import('./Pages/Employee/SocialWorker/conduct-type/conduct-type.component').then(m => m.ConductTypeComponent), title: 'Conduct Type', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Conducts', loadComponent: () => import('./Pages/Employee/SocialWorker/conduct/conduct.component').then(m => m.ConductComponent), title: 'Conduct', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: "Conducts/:id", loadComponent: () => import('./Pages/Employee/SocialWorker/conduct-add-edit/conduct-add-edit.component').then(m => m.ConductAddEditComponent), title: "Conduct", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Conducts/Create", loadComponent: () => import('./Pages/Employee/SocialWorker/conduct-add-edit/conduct-add-edit.component').then(m => m.ConductAddEditComponent), title: "Conduct", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: 'Conducts Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/conduct-report/conduct-report.component').then(m => m.ConductReportComponent), title: 'Conduct Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
            { path: 'Attendance Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/attendance-report/attendance-report.component').then(m => m.AttendanceReportComponent), title: 'Attendance Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
            { path: 'Student Issue Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/student-issue-report/student-issue-report.component').then(m => m.StudentIssueReportComponent), title: 'Student Issue Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
            { path: 'Certificate To Student Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/certificate-student-report/certificate-student-report.component').then(m => m.CertificateStudentReportComponent), title: 'Certificate To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
            { path: 'Medal To Student Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/student-medal-report/student-medal-report.component').then(m => m.StudentMedalReportComponent), title: 'Medal To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
            { path: 'Account Balance Report', loadComponent: () => import('./Pages/Employee/Accounting/Report/account-balance/account-balance.component').then(m => m.AccountBalanceComponent), title: 'Account Balance Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Account Subledger Report', loadComponent: () => import('./Pages/Employee/Accounting/Report/accounting-subledger/accounting-subledger.component').then(m => m.AccountingSubledgerComponent), title: 'Account Subledger Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], },
            { path: 'Account Statement Report', loadComponent: () => import('./Pages/Employee/Accounting/Report/accounting-statement-report/accounting-statement-report.component').then(m => m.AccountingStatementReportComponent), title: 'Account Statement Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard], data: { reportType: 'employee' } },
            { path: "Supplier Statement", loadComponent: () => import('./Pages/Employee/Accounting/Report/account-statement/account-statements.component').then(m => m.AccountStatementsComponent), title: "Supplier Statement", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Safe Statement", loadComponent: () => import('./Pages/Employee/Accounting/Report/account-statement/account-statements.component').then(m => m.AccountStatementsComponent), title: "Safe Statement", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bank Statement", loadComponent: () => import('./Pages/Employee/Accounting/Report/account-statement/account-statements.component').then(m => m.AccountStatementsComponent), title: "Bank Statement", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Issues Types", loadComponent: () => import('./Pages/Employee/SocialWorker/issues-type/issues-type.component').then(m => m.IssuesTypeComponent), title: "Issue Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Student Issues", loadComponent: () => import('./Pages/Employee/SocialWorker/student-issues/student-issues.component').then(m => m.StudentIssuesComponent), title: "Student Issues", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Medal Types", loadComponent: () => import('./Pages/Employee/SocialWorker/social-worker-medal/social-worker-medal.component').then(m => m.SocialWorkerMedalComponent), title: "Social Worker Medal", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Certificate Types", loadComponent: () => import('./Pages/Employee/SocialWorker/certificate-type/certificate-type.component').then(m => m.CertificateTypeComponent), title: "Certificate Type", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Add Certificate To Student", loadComponent: () => import('./Pages/Employee/SocialWorker/student-certificate/student-certificate.component').then(m => m.StudentCertificateComponent), title: "Student Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Add Medal To Student", loadComponent: () => import('./Pages/Employee/SocialWorker/social-worker-medal-student/social-worker-medal-student.component').then(m => m.SocialWorkerMedalStudentComponent), title: "Social Worker Student", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Attendance", loadComponent: () => import('./Pages/Employee/SocialWorker/attendance/attendance.component').then(m => m.AttendanceComponent), title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Attendance/:id", loadComponent: () => import('./Pages/Employee/SocialWorker/attendance-student/attendance-student.component').then(m => m.AttendanceStudentComponent), title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Attendance/Create", loadComponent: () => import('./Pages/Employee/SocialWorker/attendance-student/attendance-student.component').then(m => m.AttendanceStudentComponent), title: "Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Horizontal Meeting", loadComponent: () => import('./Pages/Employee/SocialWorker/horizontal-meeting/horizontal-meeting.component').then(m => m.HorizontalMeetingComponent), title: "Horizontal Meeting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Parent Meeting", loadComponent: () => import('./Pages/Employee/SocialWorker/parent-meeting/parent-meeting.component').then(m => m.ParentMeetingComponent), title: "Parent Meeting", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Appoinment", loadComponent: () => import('./Pages/Employee/SocialWorker/appointment/appointment.component').then(m => m.AppointmentComponent), title: "Appoinment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Appoinment/:id", loadComponent: () => import('./Pages/Employee/SocialWorker/appointment-parent/appointment-parent.component').then(m => m.AppointmentParentComponent), title: "Appoinment", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Direct Mark", loadComponent: () => import('./Pages/Employee/LMS/direct-mark/direct-mark.component').then(m => m.DirectMarkComponent), title: "Direct Mark", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Direct Mark/:id", loadComponent: () => import('./Pages/Employee/LMS/direct-mark-student/direct-mark-student.component').then(m => m.DirectMarkStudentComponent), title: "Direct Mark", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Certificate", loadComponent: () => import('./Pages/Employee/LMS/certificate/certificate.component').then(m => m.CertificateComponent), title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Official Holidays", loadComponent: () => import('./Pages/Employee/HR/official-holidays/official-holidays.component').then(m => m.OfficialHolidaysComponent), title: "Official Holidays", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Vacation Types", loadComponent: () => import('./Pages/Employee/HR/vacation-types/vacation-types.component').then(m => m.VacationTypesComponent), title: "Vacation Types", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Loans", loadComponent: () => import('./Pages/Employee/HR/loans/loans.component').then(m => m.LoansComponent), title: "Loans", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Loans Report", loadComponent: () => import('./Pages/Employee/HR/Reports/loans-report/loans-report.component').then(m => m.LoansReportComponent), title: "Loans Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bonus", loadComponent: () => import('./Pages/Employee/HR/bonus/bonus.component').then(m => m.BonusComponent), title: "Bonus", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Bonus Report", loadComponent: () => import('./Pages/Employee/HR/Reports/bonus-report/bonus-report.component').then(m => m.BonusReportComponent), title: "Bonus Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Deduction", loadComponent: () => import('./Pages/Employee/HR/deduction/deduction.component').then(m => m.DeductionComponent), title: "Deduction", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Deduction Report", loadComponent: () => import('./Pages/Employee/HR/Reports/deduction-report/deduction-report.component').then(m => m.DeductionReportComponent), title: "Deduction Reports", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Leave Request", loadComponent: () => import('./Pages/Employee/HR/leave-request/leave-request.component').then(m => m.LeaveRequestComponent), title: "Leave Request", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Leave Request Report", loadComponent: () => import('./Pages/Employee/HR/Reports/leave-request-report/leave-request-report.component').then(m => m.LeaveRequestReportComponent), title: "Leave Request Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Permissions Groups", loadComponent: () => import('./Pages/Employee/Archiving/permission-group/permission-group.component').then(m => m.PermissionGroupComponent), title: "Permissions Groups", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Permissions Group Employee/:id", loadComponent: () => import('./Pages/Employee/Archiving/permission-group-employee/permission-group-employee.component').then(m => m.PermissionGroupEmployeeComponent), title: "Permissions Group Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Permissions Group Archiving/:id", loadComponent: () => import('./Pages/Employee/Archiving/permission-group-details/permission-group-details.component').then(m => m.PermissionGroupDetailsComponent), title: "Permissions Group Archiving", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Archiving", loadComponent: () => import('./Pages/Employee/Archiving/archiving/archiving.component').then(m => m.ArchivingComponent), title: "Archiving", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Vacation Employee", loadComponent: () => import('./Pages/Employee/HR/vacation-employee/vacation-employee.component').then(m => m.VacationEmployeeComponent), title: "Vacation Employee", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Vacation Report", loadComponent: () => import('./Pages/Employee/HR/Reports/vacation-employee-report/vacation-employee-report.component').then(m => m.VacationEmployeeReportComponent), title: "Vacation Employee Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Location", loadComponent: () => import('./Pages/Employee/HR/location/location.component').then(m => m.LocationComponent), title: "Location", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee Job Report", loadComponent: () => import('./Pages/Employee/HR/Reports/employee-job-report/employee-job-report.component').then(m => m.EmployeeJobReportComponent), title: "Employee Job Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Edit Attendance", loadComponent: () => import('./Pages/Employee/HR/employee-clocks/employee-clocks.component').then(m => m.EmployeeClocksComponent), title: "Edit Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Salary Configuration", loadComponent: () => import('./Pages/Employee/HR/salary-configuration/salary-configuration.component').then(m => m.SalaryConfigurationComponent), title: "Salary Configuration", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Salary Calculation", loadComponent: () => import('./Pages/Employee/HR/salary-calculation/salary-calculation.component').then(m => m.SalaryCalculationComponent), title: "Salary Calculation", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Employee Salary Detailed Report", loadComponent: () => import('./Pages/Employee/HR/employee-salary-detailed/employee-salary-detailed.component').then(m => m.EmployeeSalaryDetailedComponent), title: "Employee Salary Detailed", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "HR Attendance Report", loadComponent: () => import('./Pages/Employee/HR/Reports/attendance-report/attendance-report.component').then(m => m.AttendanceReportComponent), title: "HR Attendance Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Salary Summary Report", loadComponent: () => import('./Pages/Employee/HR/Reports/salary-summary/salary-summary.component').then(m => m.SalarySummaryComponent), title: "Salary Summary", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Hr Employees Report", loadComponent: () => import('./Pages/Employee/HR/Reports/hr-employee-report/hr-employee-report.component').then(m => m.HrEmployeeReportComponent), title: "Hr Employees Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "My Attendance", loadComponent: () => import('./Pages/Employee/HR/Reports/attendance-report-by-token/attendance-report-by-token.component').then(m => m.AttendanceReportByTokenComponent), title: "My Attendance", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "My Salary Summary", loadComponent: () => import('./Pages/Employee/HR/Reports/salary-summary-token/salary-summary-token.component').then(m => m.SalarySummaryTokenComponent), title: "My Salary Summary", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "My Salary Detailed", loadComponent: () => import('./Pages/Employee/HR/employee-salary-detailed-by-token/employee-salary-detailed-by-token.component').then(m => m.EmployeeSalaryDetailedByTokenComponent), title: "My Salary Detailed", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Loans Status", loadComponent: () => import('./Pages/Employee/HR/Reports/loans-status/loans-status.component').then(m => m.LoansStatusComponent), title: "Loans Status", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Upgrade Students", loadComponent: () => import('./Pages/Employee/LMS/upgrade-student/upgrade-student.component').then(m => m.UpgradeStudentComponent), title: "Upgrade Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
            { path: "Failed Students", loadComponent: () => import('./Pages/Employee/LMS/failed-student/failed-student.component').then(m => m.FailedStudentComponent), title: "Failed Students", canActivate: [noNavigateWithoutLoginGuard, navigateIfHaveSettingPageGuard] },
        ]
    },
    {
        path: "Parent",
        loadComponent: () => import('./Pages/Layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        title: "Parent Home",
        canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard],
        children: [
            { path: "", loadComponent: () => import('./Pages/Parent/home-parent/home-parent.component').then(m => m.HomeParentComponent), title: "ParentHome", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Admission Test", loadComponent: () => import('./Pages/Parent/RegistrationModule/admission-test-parent/admission-test-parent.component').then(m => m.AdmissionTestParentComponent), title: "Admission Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Test/:registerationFormParentID/:TestId", loadComponent: () => import('./Pages/Parent/RegistrationModule/registraion-test/registraion-test.component').then(m => m.RegistraionTestComponent), title: "Test", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Registration Form", loadComponent: () => import('./Pages/Employee/Registration/registration-form/registration-form.component').then(m => m.RegistrationFormComponent), title: "Registration Form", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Interview Registration", loadComponent: () => import('./Pages/Parent/interview-registration/interview-registration.component').then(m => m.InterviewRegistrationComponent), title: "Interview Registration", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Medical History", loadComponent: () => import('./Pages/Parent/clinic/medical-history/medical-history-table/medical-history-table.component').then(m => m.ParentMedicalHistoryComponent), title: "Medical History", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Certificate", loadComponent: () => import('./Pages/Employee/LMS/certificate/certificate.component').then(m => m.CertificateComponent), title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: 'Student Issue Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/student-issue-report/student-issue-report.component').then(m => m.StudentIssueReportComponent), title: 'Student Issue Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' } },
            { path: "Student Daily Performance Report", loadComponent: () => import('./Pages/Employee/LMS/reports/daily-preformance-report/daily-preformance-report.component').then(m => m.DailyPreformanceReportComponent), title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' } },
            { path: 'Conducts Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/conduct-report/conduct-report.component').then(m => m.ConductReportComponent), title: 'Conduct Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' } },
            { path: 'Attendance Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/attendance-report/attendance-report.component').then(m => m.AttendanceReportComponent), title: 'Attendance Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' } },
            { path: 'Student Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/certificate-student-report/certificate-student-report.component').then(m => m.CertificateStudentReportComponent), title: 'Certificate To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' } },
            { path: 'Students Medal', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/student-medal-report/student-medal-report.component').then(m => m.StudentMedalReportComponent), title: 'Medal To Student Report', canActivate: [noNavigateWithoutLoginGuard], data: { reportType: 'parent' } },
            { path: "Lessons", loadComponent: () => import('./Pages/Parent/LMS/parent-lesson/parent-lesson.component').then(m => m.ParentLessonComponent), title: "Lesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' } },
            { path: 'Account Statement', loadComponent: () => import('./Pages/Employee/Accounting/Report/accounting-statement-report/accounting-statement-report.component').then(m => m.AccountingStatementReportComponent), title: 'Account Statement Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' } },
            { path: "Medical Report", loadComponent: () => import('./Pages/Employee/Clinic/medical-report/medical-report/medical-report.component').then(m => m.MedicalReportComponent), title: "Medical Report", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard], data: { reportType: 'parent' } },
            { path: 'Medical Report/parent/:id',loadComponent: () => import('./Pages/Employee/Clinic/medical-report/view-report/view-report.component').then(m => m.ViewReportComponent), title: 'Medical Report By Parent', data: { reportType: 'parent' ,UserType :'parent' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: 'Medical Report/doctor/:id', loadComponent: () => import('./Pages/Employee/Clinic/medical-report/view-report/view-report.component').then(m => m.ViewReportComponent), title: 'Medical Report By Doctor', data: { reportType: 'doctor' ,UserType :'parent' }, canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "The Shop", loadComponent: () => import('./Pages/Student/Ecommerce/shop/shop.component').then(m => m.ShopComponent), title: "Shop", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "The Shop/:id", loadComponent: () => import('./Pages/Student/Ecommerce/shop-item/shop-item.component').then(m => m.ShopItemComponent), title: "Shop Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Cart", loadComponent: () => import('./Pages/Student/Ecommerce/cart/cart.component').then(m => m.CartComponent), title: "Cart", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Order", loadComponent: () => import('./Pages/Student/Ecommerce/order/order.component').then(m => m.OrderComponent), title: "Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Order/:id", loadComponent: () => import('./Pages/Student/Ecommerce/order-items/order-items.component').then(m => m.OrderItemsComponent), title: "Order Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Appointment", loadComponent: () => import('./Pages/Parent/LMS/parent-appointment/parent-appointment.component').then(m => m.ParentAppointmentComponent), title: "Appointment", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },
            { path: "Meetings", loadComponent: () => import('./Pages/Parent/LMS/parent-meeting/parent-meeting.component').then(m => m.ParentMeetingComponent), title: "Meetings", canActivate: [noNavigateWithoutLoginGuard, navigateIfParentGuard] },

        ]
    },
    {
        path: "Student", 
        loadComponent: () => import('./Pages/Layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        title: "Subject",
        canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard],
        children: [
            { path: "", redirectTo: "Subject", pathMatch: "full" },
            { path: "The Shop", loadComponent: () => import('./Pages/Student/Ecommerce/shop/shop.component').then(m => m.ShopComponent), title: "Shop", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "The Shop/:id", loadComponent: () => import('./Pages/Student/Ecommerce/shop-item/shop-item.component').then(m => m.ShopItemComponent), title: "Shop Item", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "Cart", loadComponent: () => import('./Pages/Student/Ecommerce/cart/cart.component').then(m => m.CartComponent), title: "Cart", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "Order", loadComponent: () => import('./Pages/Student/Ecommerce/order/order.component').then(m => m.OrderComponent), title: "Order", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "Order/:id", loadComponent: () => import('./Pages/Student/Ecommerce/order-items/order-items.component').then(m => m.OrderItemsComponent), title: "Order Items", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "Lesson Live", loadComponent: () => import('./Pages/Student/LMS/student-lesson-live/student-lesson-live.component').then(m => m.StudentLessonLiveComponent), title: "Lesson Live", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "Assignment/:id", loadComponent: () => import('./Pages/Student/LMS/assignment-student/assignment-student.component').then(m => m.AssignmentStudentComponent), title: "Assignment", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "Subject", loadComponent: () => import('./Pages/Student/LMS/subject/subject.component').then(m => m.SubjectComponent), title: "Subject", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },            { path: "SubjectWeeks/:id", loadComponent: () => import('./Pages/Student/LMS/subject-weeks/subject-weeks.component').then(m => m.SubjectWeeksComponent), title: "SubjectWeeks", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "SubjectWeeksLesson/:SubjectId/:WeekId", loadComponent: () => import('./Pages/Student/LMS/subject-week-lesson/subject-week-lesson.component').then(m => m.SubjectWeekLessonComponent), title: "SubjectWeeksLesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "SubjectResources/:SubjectId", loadComponent: () => import('./Pages/Student/LMS/subject-resources/subject-resources.component').then(m => m.SubjectResourcesComponent), title: "SubjectResources", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "SubjectLive/:SubjectId", loadComponent: () => import('./Pages/Student/LMS/subject-lesson-live/subject-lesson-live.component').then(m => m.SubjectLessonLiveComponent), title: "SubjectResources", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "SubjectAssignment/:SubjectId", loadComponent: () => import('./Pages/Student/LMS/subject-assignment/subject-assignment.component').then(m => m.SubjectAssignmentComponent), title: "SubjectAssignment", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "AssignmentView/:AssignmentStudentId", loadComponent: () => import('./Pages/Student/LMS/student-assignment-view/student-assignment-view.component').then(m => m.StudentAssignmentViewComponent), title: "AssignmentView", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: "Student Certificate", loadComponent: () => import('./Pages/Employee/LMS/certificate/certificate.component').then(m => m.CertificateComponent), title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] },
            { path: 'Certificate To Student Report', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/certificate-student-report/certificate-student-report.component').then(m => m.CertificateStudentReportComponent), title: 'Certificate To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard], data: { reportType: 'student' } },
            { path: "Lessons", loadComponent: () => import('./Pages/Parent/LMS/parent-lesson/parent-lesson.component').then(m => m.ParentLessonComponent), title: "Lesson", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard], data: { reportType: 'student' } },
            { path: 'Students Medal', loadComponent: () => import('./Pages/Employee/SocialWorker/Reports/student-medal-report/student-medal-report.component').then(m => m.StudentMedalReportComponent), title: 'Medal To Student Report', canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard], data: { reportType: 'student' } },
            { path: 'Time Table', loadComponent: () => import('./Pages/Student/time-table-student/time-table-student.component').then(m => m.TimeTableStudentComponent), title: 'Time Table', canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard], data: { reportType: 'student' } },
            // { path: "Certificate", loadComponent: () => import('./Pages/Employee/LMS/certificate/certificate.component').then(m => m.CertificateComponent), title: "Certificate", canActivate: [noNavigateWithoutLoginGuard, navigateIfStudentGuard] }, 

            { path: "Discussion Room", loadComponent: () => import('./Pages/Student/LMS/discussion-room/discussion-room.component').then(m => m.DiscussionRoomComponent), title: "Discussion Room", canActivate: [] },

        ]
    },
    {
        path: "Octa",
        loadComponent: () => import('./Pages/Layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        title: "Octa Home",
        canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard],
        children: [
            { path: "", redirectTo: "Domains", pathMatch: "full" },
            { path: "Domains", loadComponent: () => import('./Pages/Octa/domains/domains.component').then(m => m.DomainsComponent), title: "Domains", canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard] },
            { path: "School Types", loadComponent: () => import('./Pages/Octa/school-type/school-type.component').then(m => m.SchoolTypeComponent), title: "School Types", canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard] },
            { path: "School", loadComponent: () => import('./Pages/Octa/school/school.component').then(m => m.SchoolComponent), title: "Schools", canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard] },
            { path: "Account", loadComponent: () => import('./Pages/Octa/account/account.component').then(m => m.AccountComponent), title: "Accounts", canActivate: [noNavigateWithoutOctaLoginGuard, navigateIfOctaGuard] },
        ]
    },
    {
        path: "CommunicationModule", 
        loadComponent: () => import('./Pages/Layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        title: "Communication",
        canActivate: [noNavigateWithoutLoginGuard],
        children: [
            { path: "My Notifications", loadComponent: () => import('./Pages/Communication/my-notification/my-notification.component').then(m => m.MyNotificationComponent), title: "Notifications", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "My Requests", loadComponent: () => import('./Pages/Communication/my-requests/my-requests.component').then(m => m.MyRequestsComponent), title: "Requests", canActivate: [noNavigateWithoutLoginGuard] },
            { path: "My Messages", loadComponent: () => import('./Pages/Communication/my-messages/my-messages.component').then(m => m.MyMessagesComponent), title: "Messages", canActivate: [noNavigateWithoutLoginGuard] },
        ]
    },

    { path: '**', redirectTo: '/' }
];