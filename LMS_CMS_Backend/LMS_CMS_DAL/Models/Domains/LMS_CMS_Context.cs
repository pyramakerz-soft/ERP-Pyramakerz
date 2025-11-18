using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.AccountingModule.Reports;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.Archiving;
using LMS_CMS_DAL.Models.Domains.BusModule;
using LMS_CMS_DAL.Models.Domains.ClinicModule;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains.ECommerce;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.MaintenanceModule;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_DAL.Models.Domains.ViolationModule;
using LMS_CMS_DAL.Models.Domains.Zatca;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace LMS_CMS_DAL.Models.Domains
{
    public partial class LMS_CMS_Context : DbContext
    {
        public DbSet<Parent> Parent { get; set; }
        public DbSet<Student> Student { get; set; }
        public DbSet<Employee> Employee { get; set; }
        public DbSet<Role> Role { get; set; }
        public DbSet<School> School { get; set; }
        public DbSet<Page> Page { get; set; }
        public DbSet<Role_Detailes> Role_Detailes { get; set; }
        public DbSet<EmployeeType> EmployeeType { get; set; }
        public DbSet<AcademicYear> AcademicYear { get; set; }
        public DbSet<Semester> Semester { get; set; }
        public DbSet<BusType> BusType { get; set; }
        public DbSet<BusDistrict> BusDistrict { get; set; }
        public DbSet<BusStatus> BusStatus { get; set; }
        public DbSet<BusCategory> BusCategory { get; set; }
        public DbSet<BusCompany> BusCompany { get; set; }
        public DbSet<Bus> Bus { get; set; }
        public DbSet<BusStudent> BusStudent { get; set; }
        //public DbSet<StudentAcademicYear> StudentAcademicYear { get; set; }
        public DbSet<Grade> Grade { get; set; }
        public DbSet<EmployeeAttachment> EmployeeAttachment { get; set; }
        public DbSet<Violation> Violation { get; set; }
        public DbSet<ViolationType> ViolationType { get; set; }
        public DbSet<EmployeeTypeViolation> EmployeeTypeViolation { get; set; }
        public DbSet<Subject> Subject { get; set; }
        public DbSet<SubjectCategory> SubjectCategory { get; set; }
        public DbSet<Floor> Floor { get; set; }
        public DbSet<Building> Building { get; set; }
        public DbSet<Section> Section { get; set; }
        public DbSet<Classroom> Classroom { get; set; }
        public DbSet<SchoolType> SchoolType { get; set; }
        public DbSet<RegisterationFormTestAnswer> RegisterationFormTestAnswer { get; set; }
        public DbSet<QuestionType> QuestionType { get; set; }
        public DbSet<MCQQuestionOption> MCQQuestionOption { get; set; }
        public DbSet<Question> Question { get; set; }
        public DbSet<Test> Test { get; set; }
        public DbSet<TestState> TestState { get; set; }
        public DbSet<InterviewTime> InterviewTime { get; set; }
        public DbSet<RegisterationFormInterview> RegisterationFormInterview { get; set; }
        public DbSet<FieldOption> FieldOption { get; set; }
        public DbSet<FieldType> FieldType { get; set; }
        public DbSet<CategoryField> CategoryField { get; set; }
        public DbSet<RegistrationCategory> RegistrationCategory { get; set; }
        public DbSet<RegisterationFormTest> RegisterationFormTest { get; set; }
        public DbSet<RegistrationForm> RegistrationForm  { get; set; }
        public DbSet<RegisterationFormSubmittion> RegisterationFormSubmittion { get; set; }
        public DbSet<RegisterationFormParent> RegisterationFormParent { get; set; }
        public DbSet<RegisterationFormState> RegisterationFormState { get; set; }
        public DbSet<InterviewState> InterViewState { get; set; }
        public DbSet<RegistrationFormCategory> RegistrationFormCategory { get; set; }
        public DbSet<EndType> EndTypes { get; set; }
        public DbSet<AccountingEntriesDocType> AccountingEntriesDocTypes { get; set; }
        public DbSet<MotionType> MotionTypes { get; set; }
        public DbSet<SubType> SubTypes { get; set; }
        public DbSet<AccountingTreeChart> AccountingTreeCharts { get; set; }
        public DbSet<Credit> Credits { get; set; }
        public DbSet<Debit> Debits { get; set; }
        public DbSet<Income> Incomes { get; set; }
        public DbSet<Outcome> Outcomes { get; set; }
        public DbSet<Save> Saves { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<TuitionFeesType> TuitionFeesTypes { get; set; }
        public DbSet<TuitionDiscountType> TuitionDiscountTypes { get; set; }
        public DbSet<Bank> Banks { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<AcademicDegree> AcademicDegrees { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobCategory> JobCategories { get; set; }
        public DbSet<ReasonForLeavingWork> ReasonsForLeavingWork { get; set; }
        public DbSet<Days> Days { get; set; }
        public DbSet<EmployeeDays> EmployeeDays { get; set; }
        public DbSet<LinkFile> LinkFile { get; set; }
        public DbSet<EmployeeStudent> EmployeeStudent { get; set; }
        public DbSet<ReceivableDocType> ReceivableDocType { get; set; }
        public DbSet<PayableDocType> PayableDocType { get; set; }
        public DbSet<ReceivableMaster> ReceivableMaster { get; set; }
        public DbSet<PayableMaster> PayableMaster { get; set; }
        public DbSet<ReceivableDetails> ReceivableDetails { get; set; }
        public DbSet<PayableDetails> PayableDetails { get; set; }
        public DbSet<AccountingEntriesMaster> AccountingEntriesMaster { get; set; }
        public DbSet<AccountingEntriesDetails> AccountingEntriesDetails { get; set; }
        public DbSet<InstallmentDeductionMaster> InstallmentDeductionMaster { get; set; }
        public DbSet<InstallmentDeductionDetails> InstallmentDeductionDetails { get; set; }
        public DbSet<FeesActivation> FeesActivation { get; set; }
        public DbSet<Gender> Gender { get; set; }
        public DbSet<InventorySubCategories> InventorySubCategories { get; set; }
        public DbSet<InventoryCategories> InventoryCategories { get; set; }
        public DbSet<StoreCategories> StoreCategories { get; set; }
        public DbSet<Store> Store { get; set; }
        public DbSet<ShopItemSize> ShopItemSize { get; set; }
        public DbSet<ShopItemColor> ShopItemColor { get; set; }
        public DbSet<ShopItem> ShopItem { get; set; }
        public DbSet<SalesItemAttachment> SalesItemAttachment { get; set; }
        public DbSet<InventoryDetails> InventoryDetails { get; set; }
        public DbSet<InventoryMaster> InventoryMaster { get; set; }
        public DbSet<InventoryFlags> InventoryFlags { get; set; } 
        public DbSet<HygieneType> HygieneTypes { get; set; }
        public DbSet<Diagnosis> Diagnoses { get; set; }
        public DbSet<Drug> Drugs { get; set; }
        public DbSet<HygieneForm> HygieneForms { get; set; }
        public DbSet<StudentHygieneTypes> StudentHygieneTypes { get; set; }
        public DbSet<StudentHygienes> StudentHygiens { get; set; }
        public DbSet<Dose> Dose { get; set; }
        public DbSet<FollowUp> FollowUps { get; set; }
        public DbSet<FollowUpDrug> FollowUpDrugs { get; set; }
        public DbSet<MedicalHistory> MedicalHistories { get; set; } 
        public DbSet<Cart> Cart { get; set; }
        public DbSet<OrderState> OrderState { get; set; }
        public DbSet<Order> Order { get; set; }
        public DbSet<Cart_ShopItem> Cart_ShopItem { get; set; }
        public DbSet<Stocking> Stocking { get; set; }
        public DbSet<StockingDetails> StockingDetails { get; set; }
        public DbSet<EvaluationTemplate> EvaluationTemplate { get; set; }
        public DbSet<EvaluationTemplateGroup> EvaluationTemplateGroup { get; set; }
        public DbSet<EvaluationTemplateGroupQuestion> EvaluationTemplateGroupQuestion { get; set; }
        public DbSet<EvaluationBookCorrection> EvaluationBookCorrection { get; set; }
        public DbSet<EvaluationEmployeeStudentBookCorrection> EvaluationEmployeeStudentBookCorrection { get; set; }
        public DbSet<EvaluationEmployee> EvaluationEmployee { get; set; }
        public DbSet<EvaluationEmployeeQuestion> EvaluationEmployeeQuestion { get; set; }
        public DbSet<BloomLevel> BloomLevel { get; set; }
        public DbSet<DokLevel> DokLevel { get; set; } 
        public DbSet<Tag> Tag { get; set; }
        public DbSet<WeightType> WeightType { get; set; }
        public DbSet<LessonResourceType> LessonResourceType { get; set; }
        public DbSet<LessonActivityType> LessonActivityType { get; set; }
        public DbSet<PerformanceType> PerformanceType { get; set; }
        public DbSet<Medal> Medal { get; set; }
        public DbSet<LessonLive> LessonLive { get; set; }
        public DbSet<LessonActivity> LessonActivity { get; set; }
        public DbSet<LessonResourceClassroom> LessonResourceClassroom { get; set; }
        public DbSet<LessonResource> LessonResource { get; set; }
        public DbSet<LessonTag> LessonTag { get; set; }
        public DbSet<SemesterWorkingWeek> SemesterWorkingWeek { get; set; }
        public DbSet<Lesson> Lesson { get; set; }
        public DbSet<SubjectWeightType> SubjectWeightType { get; set; }
        public DbSet<StudentPerformance> StudentPerformance { get; set; }
        public DbSet<StudentMedal> StudentMedal { get; set; }
        public DbSet<SchoolPCs> SchoolPCs { get; set; }
        public DbSet<DailyPerformance> DailyPerformance { get; set; }
        public DbSet<QuestionBank> QuestionBank { get; set; }
        public DbSet<QuestionBankTags> QuestionBankTags { get; set; }
        public DbSet<QuestionBankOption> QuestionBankOption { get; set; }
        public DbSet<SubBankQuestion> SubBankQuestion { get; set; }
        public DbSet<LMS.QuestionBankType> QuestionBankType { get; set; }
        public DbSet<TaxIssuer> TaxIssuers { get; set; }
        public DbSet<TaxCustomer> TaxCustomer { get; set; }
        public DbSet<TaxUnitType> TaxUnitType { get; set; }
        public DbSet<EtaTokenType> EtaTokenType { get; set; }
        public DbSet<SubjectResource> SubjectResource { get; set; }
        public DbSet<CertificatesIssuerName> CertificatesIssuerNames { get; set; }
        public DbSet<ClassroomSubject> ClassroomSubject { get; set; }
        public DbSet<ClassroomSubjectCoTeacher> ClassroomSubjectCoTeacher { get; set; }
        public DbSet<SubjectSupervisor> SubjectSupervisor { get; set; }
        public DbSet<GradeSupervisor> GradeSupervisor { get; set; }
        public DbSet<StudentClassroomSubject> StudentClassroomSubject { get; set; }
        public DbSet<AssignmentType> AssignmentType { get; set; }
        public DbSet<Assignment> Assignment { get; set; }
        public DbSet<AssignmentStudent> AssignmentStudent { get; set; }
        public DbSet<AssignmentStudentIsSpecific> AssignmentStudentIsSpecific { get; set; }
        public DbSet<AssignmentQuestion> AssignmentQuestion { get; set; }
        public DbSet<DirectMarkClassesStudent> DirectMarkClassesStudent { get; set; }
        public DbSet<AssignmentStudentQuestion> AssignmentStudentQuestion { get; set; }
        public DbSet<ETAPOS> ETAPOS { get; set; }
        public DbSet<AssignmentStudentQuestionAnswerOption> AssignmentStudentQuestionAnswerOption { get; set; }
        public DbSet<DailyPerformanceMaster> DailyPerformanceMaster { get; set; }
        public DbSet<TimeTable> TimeTable { get; set; }
        public DbSet<TimeTableClassroom> TimeTableClassroom { get; set; }
        public DbSet<TimeTableSession> TimeTableSession { get; set; }
        public DbSet<TimeTableSubject> TimeTableSubject { get; set; }
        public DbSet<AccountingConfigs> AccountingConfigs { get; set; }
        public DbSet<RegisteredEmployee> RegisteredEmployee { get; set; }
        public DbSet<Announcement> Announcement { get; set; }
        public DbSet<AnnouncementSharedTo> AnnouncementSharedTo { get; set; }
        public DbSet<UserType> UserType { get; set; }
        public DbSet<DiscussionRoom> DiscussionRoom { get; set; }
        public DbSet<DiscussionRoomStudentClassroom> DiscussionRoomStudentClassroom { get; set; }
        public DbSet<Duty> Duty { get; set; }
        public DbSet<Notification> Notification { get; set; }
        public DbSet<NotificationSharedTo> NotificationSharedTo { get; set; }
        public DbSet<RemedialClassroom> RemedialClassroom { get; set; }
        public DbSet<RemedialClassroomStudent> RemedialClassroomStudent { get; set; }
        public DbSet<RemedialTimeTable> RemedialTimeTable { get; set; }
        public DbSet<RemedialTimeTableDay> RemedialTimeTableDay { get; set; }
        public DbSet<RemedialTimeTableClasses> RemedialTimeTableClasses { get; set; }
        public DbSet<ChatMessage> ChatMessage { get; set; }
        public DbSet<ChatMessageAttachment> ChatMessageAttachment { get; set; }
        public DbSet<Request> Request { get; set; }
        public DbSet<ConductLevel> ConductLevel { get; set; }
        public DbSet<ConductType> ConductType { get; set; }
        public DbSet<ConductTypeSection> ConductTypeSection { get; set; }
        public DbSet<ProcedureType> ProcedureType { get; set; }
        public DbSet<Conduct> Conduct { get; set; }
        public DbSet<Attendance> Attendance { get; set; }
        public DbSet<AttendanceStudent> AttendanceStudent { get; set; }
        public DbSet<IssuesType> IssuesType { get; set; }
        public DbSet<StudentIssue> StudentIssue { get; set; }
        public DbSet<SocialWorkerMedal> SocialWorkerMedal { get; set; }
        public DbSet<CertificateType> CertificateType { get; set; }
        public DbSet<SocialWorkerMedalStudent> SocialWorkerMedalStudent { get; set; }
        public DbSet<CertificateStudent> CertificateStudent { get; set; }
        public DbSet<HorizontalMeeting> HorizontalMeeting { get; set; }
        public DbSet<ParentMeeting> ParentMeeting { get; set; }
        public DbSet<Appointment> Appointment { get; set; }
        public DbSet<AppointmentStatus> AppointmentStatus { get; set; }
        public DbSet<AppointmentParent> AppointmentParent { get; set; }
        public DbSet<AppointmentGrade> AppointmentGrade { get; set; }
        public DbSet<DirectMark> DirectMark { get; set; }
        public DbSet<DirectMarkClasses> DirectMarkClasses { get; set; }

        // Maintenance Module
        public DbSet<MaintenanceItem> MaintenanceItems { get; set; }
        public DbSet<MaintenanceCompany> MaintenanceCompanies { get; set; }
        public DbSet<MaintenanceEmployee> MaintenanceEmployees { get; set; }
        public DbSet<Maintenance> Maintenances { get; set; }


        public DbSet<Bonus> Bonus { get; set; }
        public DbSet<BonusType> BonusType { get; set; }
        public DbSet<Deduction> Deduction { get; set; }
        public DbSet<DeductionType> DeductionType { get; set; }
        public DbSet<LeaveRequest> LeaveRequest { get; set; }
        public DbSet<Loans> Loans { get; set; }
        public DbSet<OfficialHolidays> OfficialHolidays { get; set; }
        public DbSet<VacationEmployee> VacationEmployee { get; set; }
        public DbSet<VacationTypes> VacationTypes { get; set; }
        public DbSet<ConnectionStatus> ConnectionStatus { get; set; }
        public DbSet<ArchivingTree> ArchivingTree{ get; set; }
        public DbSet<PermissionGroup> PermissionGroup { get; set; }
        public DbSet<PermissionGroupDetails> PermissionGroupDetails { get; set; }
        public DbSet<PermissionGroupEmployee> PermissionGroupEmployee { get; set; }
        public DbSet<AnnualVacationEmployee> AnnualVacationEmployee { get; set; }
        public DbSet<EmployeeClocks> EmployeeClocks { get; set; }
        public DbSet<Location> Location { get; set; }
        public DbSet<EmployeeLocation> EmployeeLocation { get; set; }
        public DbSet<SalaryConfigration> SalaryConfigration { get; set; }
        public DbSet<BankEmployee> BankEmployee { get; set; }
        public DbSet<SafeEmployee> SafeEmployee { get; set; }
        public DbSet<RefreshTokens> RefreshTokens { get; set; }
        public DbSet<DayStatus> DayStatus { get; set; }
        public DbSet<MonthlyAttendance> MonthlyAttendance { get; set; }
        public DbSet<SalaryHistory> SalaryHistory { get; set; }
        public DbSet<EmployeeLoans> EmployeeLoans { get; set; } 
        public DbSet<EmployeeLoans> FailedStudents { get; set; } 


        public LMS_CMS_Context(DbContextOptions<LMS_CMS_Context> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ///////////////////////// Unique Values: /////////////////////////
            modelBuilder.Entity<Parent>()
                .HasIndex(p => p.Email)
                .IsUnique();

            modelBuilder.Entity<Parent>()
                .HasIndex(p => p.User_Name)
                .IsUnique();

            modelBuilder.Entity<Role>()
               .HasIndex(p => p.Name)
               .IsUnique();

            modelBuilder.Entity<Student>()
                .HasIndex(p => p.Email)
                .IsUnique();
            modelBuilder.Entity<Student>()
                .HasIndex(p => p.User_Name)
                .IsUnique();

            modelBuilder.Entity<Employee>()
                .HasIndex(p => p.User_Name)
                .IsUnique();
            
            modelBuilder.Entity<Employee>()
                .HasIndex(p => p.Email)
                .IsUnique();

            modelBuilder.Entity<EmployeeType>()
                .HasIndex(p => p.Name)
                .IsUnique();

            modelBuilder.Entity<TestState>()
               .HasIndex(p => p.Name)
               .IsUnique();

            modelBuilder.Entity<InterviewState>()
               .HasIndex(p => p.Name)
               .IsUnique();

            modelBuilder.Entity<RegisterationFormState>()
               .HasIndex(p => p.Name)
               .IsUnique();
            
            modelBuilder.Entity<ShopItem>()
               .HasIndex(p => p.BarCode)
               .IsUnique();

            modelBuilder.Entity<OrderState>()
               .HasIndex(p => p.Name)
               .IsUnique();
            
            modelBuilder.Entity<UserType>()
               .HasIndex(p => p.Title)
               .IsUnique();
            
            modelBuilder.Entity<RegisteredEmployee>()
               .HasIndex(p => p.User_Name)
               .IsUnique();
            
            modelBuilder.Entity<RegisteredEmployee>()
               .HasIndex(p => p.Email)
               .IsUnique();

            ///////////////////////// No Identity: /////////////////////////

            modelBuilder.Entity<Page>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<EmployeeType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<SchoolType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<FieldType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<QuestionType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<QuestionBankType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<InterviewState>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<TestState>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<RegisterationFormState>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<AccountingTreeChart>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<Days>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<SubType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<MotionType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<EndType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<AcademicDegree>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<LinkFile>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<Gender>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<InventoryFlags>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<OrderState>()
                .Property(p => p.ID)
                .ValueGeneratedNever(); 
            
            modelBuilder.Entity<BloomLevel>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<DokLevel>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<AssignmentType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();
            
            modelBuilder.Entity<UserType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<AppointmentStatus>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<BonusType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<DeductionType>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<SalaryConfigration>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            modelBuilder.Entity<DayStatus>()
                .Property(p => p.ID)
                .ValueGeneratedNever();

            ///////////////////////// OnDelete: /////////////////////////
            modelBuilder.Entity<Page>()
                 .HasOne(p => p.Parent)
                 .WithMany(p => p.ChildPages)
                 .HasForeignKey(p => p.Page_ID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                 .HasOne(p => p.Role)
                 .WithMany(p => p.Employess)
                 .HasForeignKey(p => p.Role_ID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                 .HasOne(p => p.EmployeeType)
                 .WithMany(p => p.Employees)
                 .HasForeignKey(p => p.EmployeeTypeID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                 .HasOne(p => p.BusCompany)
                 .WithMany(p => p.Employees)
                 .HasForeignKey(p => p.BusCompanyID)
                 .OnDelete(DeleteBehavior.Restrict);
             
            modelBuilder.Entity<Employee>()
                 .HasOne(p => p.ReasonForLeavingWork)
                 .WithMany(p => p.Employees)
                 .HasForeignKey(p => p.ReasonOfLeavingID)
                 .OnDelete(DeleteBehavior.Restrict);
             
            modelBuilder.Entity<Employee>()
                 .HasOne(p => p.AccountNumber)
                 .WithMany(p => p.Employees)
                 .HasForeignKey(p => p.AccountNumberID)
                 .OnDelete(DeleteBehavior.Restrict);
             
            modelBuilder.Entity<Employee>()
                 .HasOne(p => p.Department)
                 .WithMany(p => p.Employees)
                 .HasForeignKey(p => p.DepartmentID)
                 .OnDelete(DeleteBehavior.Restrict);
             
            modelBuilder.Entity<Employee>()
                 .HasOne(p => p.Job)
                 .WithMany(p => p.Employees)
                 .HasForeignKey(p => p.JobID)
                 .OnDelete(DeleteBehavior.Restrict);
             
            modelBuilder.Entity<Employee>()
                 .HasOne(p => p.AcademicDegree)
                 .WithMany(p => p.Employees)
                 .HasForeignKey(p => p.AcademicDegreeID)
                 .OnDelete(DeleteBehavior.Restrict);
             
            modelBuilder.Entity<Role_Detailes>()
                 .HasOne(p => p.Role)
                 .WithMany(p => p.Role_Detailes)
                 .HasForeignKey(p => p.Role_ID)
                 .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Role_Detailes>()
                 .HasOne(p => p.Page)
                 .WithMany(p => p.Role_Detailes)
                 .HasForeignKey(p => p.Page_ID)
                 .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Student>()
                 .HasOne(p => p.Parent)
                 .WithMany(p => p.Students)
                 .HasForeignKey(p => p.Parent_Id)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Student>()
                 .HasOne(p => p.Gender)
                 .WithMany(p => p.Students)
                 .HasForeignKey(p => p.GenderId)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Student>()
                 .HasOne(p => p.AccountNumber)
                 .WithMany(p => p.Students)
                 .HasForeignKey(p => p.AccountNumberID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AcademicYear>()
                 .HasOne(p => p.School)
                 .WithMany(p => p.AcademicYears)
                 .HasForeignKey(p => p.SchoolID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Semester>()
                 .HasOne(p => p.AcademicYear)
                 .WithMany(p => p.Semesters)
                 .HasForeignKey(p => p.AcademicYearID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bus>()
                 .HasOne(p => p.BusType)
                 .WithMany(p => p.Buses)
                 .HasForeignKey(p => p.BusTypeID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bus>()
                 .HasOne(p => p.BusDistrict)
                 .WithMany(p => p.Buses)
                 .HasForeignKey(p => p.BusDistrictID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bus>()
                 .HasOne(p => p.BusStatus)
                 .WithMany(p => p.Buses)
                 .HasForeignKey(p => p.BusStatusID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bus>()
                 .HasOne(p => p.Driver)
                 .WithMany(p => p.DrivenBuses)
                 .HasForeignKey(p => p.DriverID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bus>()
                 .HasOne(p => p.DriverAssistant)
                 .WithMany(p => p.DriverAssistant)
                 .HasForeignKey(p => p.DriverAssistantID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bus>()
                 .HasOne(p => p.BusCompany)
                 .WithMany(p => p.Buses)
                 .HasForeignKey(p => p.BusCompanyID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BusStudent>()
                 .HasOne(p => p.Bus)
                 .WithMany(p => p.BusStudents)
                 .HasForeignKey(p => p.BusID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BusStudent>()
                 .HasOne(p => p.Student)
                 .WithMany(p => p.BusStudents)
                 .HasForeignKey(p => p.StudentID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BusStudent>()
                 .HasOne(p => p.BusCategory)
                 .WithMany(p => p.BusStudents)
                 .HasForeignKey(p => p.BusCategoryID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BusStudent>()
                 .HasOne(p => p.Semester)
                 .WithMany(p => p.BusStudents)
                 .HasForeignKey(p => p.SemseterID)
                 .OnDelete(DeleteBehavior.Restrict);
             
            //modelBuilder.Entity<StudentAcademicYear>()
            //     .HasOne(p => p.Student)
            //     .WithMany(p => p.StudentAcademicYears)
            //     .HasForeignKey(p => p.StudentID)
            //     .OnDelete(DeleteBehavior.Restrict);

            //modelBuilder.Entity<StudentAcademicYear>()
            //     .HasOne(p => p.School)
            //     .WithMany(p => p.StudentAcademicYears)
            //     .HasForeignKey(p => p.SchoolID)
            //     .OnDelete(DeleteBehavior.Restrict);

            //modelBuilder.Entity<StudentAcademicYear>()
            //     .HasOne(p => p.Classroom)
            //     .WithMany(p => p.StudentAcademicYears)
            //     .HasForeignKey(p => p.ClassID)
            //     .OnDelete(DeleteBehavior.Restrict);

            //modelBuilder.Entity<StudentAcademicYear>()
            //     .HasOne(p => p.Grade)
            //     .WithMany(p => p.StudentAcademicYears)
            //     .HasForeignKey(p => p.GradeID)
            //     .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentClassroom>()
                 .HasOne(p => p.Classroom)
                 .WithMany(p => p.StudentClassrooms)
                 .HasForeignKey(p => p.ClassID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentClassroom>()
                 .HasOne(p => p.Student)
                 .WithMany(p => p.StudentClassrooms)
                 .HasForeignKey(p => p.StudentID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentGrade>()
                 .HasOne(p => p.Student)
                 .WithMany(p => p.StudentGrades)
                 .HasForeignKey(p => p.StudentID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentGrade>()
                 .HasOne(p => p.Grade)
                 .WithMany(p => p.StudentGrades)
                 .HasForeignKey(p => p.GradeID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentGrade>()
                 .HasOne(p => p.AcademicYear)
                 .WithMany(p => p.StudentGrades)
                 .HasForeignKey(p => p.AcademicYearID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Subject>()
                 .HasOne(p => p.Grade)
                 .WithMany(p => p.Subjects)
                 .HasForeignKey(p => p.GradeID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Subject>()
                 .HasOne(p => p.SubjectCategory)
                 .WithMany(p => p.Subjects)
                 .HasForeignKey(p => p.SubjectCategoryID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ClassroomSubject>()
                 .HasOne(p => p.Teacher)
                 .WithMany(p => p.ClassroomSubjects)
                 .HasForeignKey(p => p.TeacherID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ClassroomSubject>()
                 .HasOne(p => p.Subject)
                 .WithMany(p => p.ClassroomSubjects)
                 .HasForeignKey(p => p.SubjectID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ClassroomSubject>()
                 .HasOne(p => p.Classroom)
                 .WithMany(p => p.ClassroomSubjects)
                 .HasForeignKey(p => p.ClassroomID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ClassroomSubjectCoTeacher>()
                 .HasOne(p => p.CoTeacher)
                 .WithMany(p => p.ClassroomSubjectCoTeachers)
                 .HasForeignKey(p => p.CoTeacherID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ClassroomSubjectCoTeacher>()
                 .HasOne(p => p.ClassroomSubject)
                 .WithMany(p => p.ClassroomSubjectCoTeachers)
                 .HasForeignKey(p => p.ClassroomSubjectID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Floor>()
                 .HasOne(p => p.building)
                 .WithMany(p => p.Floors)
                 .HasForeignKey(p => p.buildingID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Building>()
                 .HasOne(p => p.school)
                 .WithMany(p => p.Buildings)
                 .HasForeignKey(p => p.SchoolID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Section>()
                 .HasOne(p => p.school)
                 .WithMany(p => p.Sections)
                 .HasForeignKey(p => p.SchoolID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Grade>()
                 .HasOne(p => p.Section)
                 .WithMany(p => p.Grades)
                 .HasForeignKey(p => p.SectionID)
                 .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Grade>()
                 .HasOne(p => p.UpgradeTo)
                 .WithMany(p => p.UpgradeTos)
                 .HasForeignKey(p => p.UpgradeToID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Classroom>()
                 .HasOne(p => p.Grade)
                 .WithMany(p => p.Classrooms)
                 .HasForeignKey(p => p.GradeID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Classroom>()
                 .HasOne(p => p.Floor)
                 .WithMany(p => p.Classrooms)
                 .HasForeignKey(p => p.FloorID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Classroom>()
                 .HasOne(p => p.HomeroomTeacher)
                 .WithMany(p => p.HomeroomTeacherClassrooms)
                 .HasForeignKey(p => p.HomeroomTeacherID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Semester>()
                 .HasOne(p => p.AcademicYear)
                 .WithMany(p => p.Semesters)
                 .HasForeignKey(p => p.AcademicYearID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<School>()
                 .HasOne(p => p.SchoolType)
                 .WithMany(p => p.Schools)
                 .HasForeignKey(p => p.SchoolTypeID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Floor>()
                .HasOne(f => f.floorMonitor) 
                .WithMany(e => e.Floors) 
                .HasForeignKey(f => f.FloorMonitorID) 
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                .HasMany(e => e.EmployeeAttachments)
                .WithOne(ea => ea.Employee)
                .HasForeignKey(ea => ea.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormTest>()
                .HasOne(p => p.RegisterationFormParent)
                .WithMany(p => p.RegisterationFormTests)
                .HasForeignKey(p => p.RegisterationFormParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormTest>()
                .HasOne(p => p.TestState)
                .WithMany(p => p.RegisterationFormTests)
                .HasForeignKey(p => p.StateID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormTest>()
                .HasOne(p => p.Test)
                .WithMany(p => p.RegisterationFormTests)
                .HasForeignKey(p => p.TestID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormTestAnswer>()
                .HasOne(p => p.RegisterationFormParent)
                .WithMany(p => p.RegisterationFormTestAnswers)
                .HasForeignKey(p => p.RegisterationFormParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormTestAnswer>()
                .HasOne(p => p.Question)
                .WithMany(p => p.RegisterationFormTestAnswers)
                .HasForeignKey(p => p.QuestionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormTestAnswer>()
                .HasOne(p => p.MCQQuestionOption)
                .WithMany(p => p.RegisterationFormTestAnswers)
                .HasForeignKey(p => p.AnswerID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MCQQuestionOption>()
                .HasOne(p => p.Question)
                .WithMany(p => p.MCQQuestionOptions)
                .HasForeignKey(p => p.Question_ID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Question>()
                .HasOne(p => p.QuestionType)
                .WithMany(p => p.Questions)
                .HasForeignKey(p => p.QuestionTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Question>()
                .HasOne(p => p.mCQQuestionOption)
                .WithMany(p => p.Questions)
                .HasForeignKey(p => p.CorrectAnswerID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Question>()
                .HasOne(p => p.test)
                .WithMany(p => p.Questions)
                .HasForeignKey(p => p.TestID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Test>()
                .HasOne(p => p.academicYear)
                .WithMany(p => p.Tests)
                .HasForeignKey(p => p.AcademicYearID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Test>()
                .HasOne(p => p.subject)
                .WithMany(p => p.Tests)
                .HasForeignKey(p => p.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Test>()
                .HasOne(p => p.Grade)
                .WithMany(p => p.Tests)
                .HasForeignKey(p => p.GradeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormInterview>()
                .HasOne(p => p.InterviewState)
                .WithMany(p => p.RegisterationFormInterviews)
                .HasForeignKey(p => p.InterviewStateID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormInterview>()
                .HasOne(p => p.RegisterationFormParent)
                .WithMany(p => p.RegisterationFormInterviews)
                .HasForeignKey(p => p.RegisterationFormParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormInterview>()
                .HasOne(p => p.InterviewTime)
                .WithMany(p => p.RegisterationFormInterviews)
                .HasForeignKey(p => p.InterviewTimeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InterviewTime>()
                .HasOne(p => p.AcademicYear)
                .WithMany(p => p.InterviewTimes)
                .HasForeignKey(p => p.AcademicYearID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FieldOption>()
                .HasOne(p => p.CategoryField)
                .WithMany(p => p.FieldOptions)
                .HasForeignKey(p => p.CategoryFieldID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CategoryField>()
                .HasOne(p => p.FieldType)
                .WithMany(p => p.CategoryFields)
                .HasForeignKey(p => p.FieldTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CategoryField>()
                .HasOne(p => p.RegistrationCategory)
                .WithMany(p => p.CategoryFields)
                .HasForeignKey(p => p.RegistrationCategoryID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<RegistrationFormCategory>()
                .HasOne(p => p.RegistrationForm)
                .WithMany(p => p.RegistrationFormCategories)
                .HasForeignKey(p => p.RegistrationFormID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<RegistrationFormCategory>()
                .HasOne(p => p.RegistrationCategory)
                .WithMany(p => p.RegistrationFormCategories)
                .HasForeignKey(p => p.RegistrationCategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormSubmittion>()
                .HasOne(p => p.RegisterationFormParent)
                .WithMany(p => p.RegisterationFormSubmittions)
                .HasForeignKey(p => p.RegisterationFormParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormSubmittion>()
                .HasOne(p => p.CategoryField)
                .WithMany(p => p.RegisterationFormSubmittions)
                .HasForeignKey(p => p.CategoryFieldID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormSubmittion>()
                .HasOne(p => p.FieldOption)
                .WithMany(p => p.RegisterationFormSubmittions)
                .HasForeignKey(p => p.SelectedFieldOptionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormParent>()
                .HasOne(p => p.RegisterationFormState)
                .WithMany(p => p.RegisterationFormParents)
                .HasForeignKey(p => p.RegisterationFormStateID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormParent>()
                .HasOne(p => p.Parent)
                .WithMany(p => p.RegisterationFormParents)
                .HasForeignKey(p => p.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RegisterationFormParent>()
                .HasOne(p => p.RegistrationForm)
                .WithMany(p => p.RegisterationFormParents)
                .HasForeignKey(p => p.RegistrationFormID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EmployeeDays>()
                .HasOne(p => p.Employee)
                .WithMany(p => p.EmployeeDays)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EmployeeDays>()
                .HasOne(p => p.Day)
                .WithMany(p => p.EmployeeDays)
                .HasForeignKey(p => p.DayID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Job>()
                .HasOne(p => p.JobCategory)
                .WithMany(p => p.Jobs)
                .HasForeignKey(p => p.JobCategoryID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Supplier>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.Suppliers)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Bank>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.Banks)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<TuitionDiscountType>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.TuitionDiscountTypes)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<TuitionFeesType>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.TuitionFeesTypes)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Asset>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.Assets)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Save>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.Saves)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Outcome>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.Outcomes)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Income>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.Incomes)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Debit>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.Debits)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Credit>()
                .HasOne(p => p.AccountNumber)
                .WithMany(p => p.Credits)
                .HasForeignKey(p => p.AccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AccountingTreeChart>()
                .HasOne(p => p.SubType)
                .WithMany(p => p.AccountingTreeCharts)
                .HasForeignKey(p => p.SubTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AccountingTreeChart>()
                .HasOne(p => p.EndType)
                .WithMany(p => p.AccountingTreeCharts)
                .HasForeignKey(p => p.EndTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AccountingTreeChart>()
                .HasOne(p => p.Parent)
                .WithMany(p => p.ChildAccountingTreeCharts)
                .HasForeignKey(p => p.MainAccountNumberID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AccountingTreeChart>()
                .HasOne(p => p.LinkFile)
                .WithMany(p => p.AccountingTreeCharts)
                .HasForeignKey(p => p.LinkFileID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeStudent>()
                .HasOne(p => p.employee)
                .WithMany(p => p.EmployeeStudents)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeStudent>()
                .HasOne(p => p.Student)
                .WithMany(p => p.EmployeeStudents)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LinkFile>()
                .HasOne(p => p.MotionType)
                .WithMany(p => p.LinkFiles)
                .HasForeignKey(p => p.MotionTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<FeesActivation>()
                .HasOne(p => p.Student)
                .WithMany(p => p.FeesActivations)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<FeesActivation>()
                .HasOne(p => p.TuitionFeesType)
                .WithMany(p => p.FeesActivations)
                .HasForeignKey(p => p.FeeTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<FeesActivation>()
                .HasOne(p => p.TuitionDiscountType)
                .WithMany(p => p.FeesActivations)
                .HasForeignKey(p => p.FeeDiscountTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InstallmentDeductionDetails>()
                .HasOne(p => p.TuitionFeesType)
                .WithMany(p => p.InstallmentDeductionDetails)
                .HasForeignKey(p => p.FeeTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InstallmentDeductionDetails>()
                .HasOne(p => p.InstallmentDeductionMaster)
                .WithMany(p => p.InstallmentDeductionDetails)
                .HasForeignKey(p => p.InstallmentDeductionMasterID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InstallmentDeductionMaster>()
                .HasOne(p => p.Employee)
                .WithMany(p => p.InstallmentDeductionMasters)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InstallmentDeductionMaster>()
                .HasOne(p => p.Student)
                .WithMany(p => p.InstallmentDeductionMasters)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AccountingEntriesMaster>()
                .HasOne(p => p.AccountingEntriesDocType)
                .WithMany(p => p.AccountingEntriesMasters)
                .HasForeignKey(p => p.AccountingEntriesDocTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AccountingEntriesDetails>()
                .HasOne(p => p.AccountingTreeChart)
                .WithMany(p => p.AccountingEntriesDetails)
                .HasForeignKey(p => p.AccountingTreeChartID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AccountingEntriesDetails>()
                .HasOne(p => p.AccountingEntriesMaster)
                .WithMany(p => p.AccountingEntriesDetails)
                .HasForeignKey(p => p.AccountingEntriesMasterID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PayableMaster>()
                .HasOne(p => p.LinkFile)
                .WithMany(p => p.PayableMaster)
                .HasForeignKey(p => p.LinkFileID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PayableMaster>()
                .HasOne(p => p.PayableDocType)
                .WithMany(p => p.PayableMaster)
                .HasForeignKey(p => p.PayableDocTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PayableDetails>()
                .HasOne(p => p.LinkFile)
                .WithMany(p => p.PayableDetails)
                .HasForeignKey(p => p.LinkFileID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PayableDetails>()
                .HasOne(p => p.PayableMaster)
                .WithMany(p => p.PayableDetails)
                .HasForeignKey(p => p.PayableMasterID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ReceivableMaster>()
                .HasOne(p => p.LinkFile)
                .WithMany(p => p.ReceivableMasters)
                .HasForeignKey(p => p.LinkFileID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ReceivableMaster>()
                .HasOne(p => p.ReceivableDocType)
                .WithMany(p => p.ReceivableMasters)
                .HasForeignKey(p => p.ReceivableDocTypesID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ReceivableDetails>()
                .HasOne(p => p.LinkFile)
                .WithMany(p => p.ReceivableDetails)
                .HasForeignKey(p => p.LinkFileID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ReceivableDetails>()
                .HasOne(p => p.ReceivableMaster)
                .WithMany(p => p.ReceivableDetails)
                .HasForeignKey(p => p.ReceivableMasterID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InventorySubCategories>()
                .HasOne(p => p.InventoryCategories)
                .WithMany(p => p.InventorySubCategories)
                .HasForeignKey(p => p.InventoryCategoriesID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StoreCategories>()
                .HasOne(p => p.InventoryCategories)
                .WithMany(p => p.StoreCategories)
                .HasForeignKey(p => p.InventoryCategoriesID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StoreCategories>()
                .HasOne(p => p.Store)
                .WithMany(p => p.StoreCategories)
                .HasForeignKey(p => p.StoreID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ShopItemSize>()
                .HasOne(p => p.ShopItem)
                .WithMany(p => p.ShopItemSize)
                .HasForeignKey(p => p.ShopItemID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ShopItemColor>()
                .HasOne(p => p.ShopItem)
                .WithMany(p => p.ShopItemColor)
                .HasForeignKey(p => p.ShopItemID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<SalesItemAttachment>()
                .HasOne(p => p.InventoryDetails)
                .WithMany(p => p.SalesItemAttachment)
                .HasForeignKey(p => p.InventoryDetailsID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InventoryDetails>()
                .HasOne(p => p.ShopItem)
                .WithMany(p => p.InventoryDetails)
                .HasForeignKey(p => p.ShopItemID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InventoryDetails>()
                .HasOne(p => p.InventoryMaster)
                .WithMany(p => p.InventoryDetails)
                .HasForeignKey(p => p.InventoryMasterId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InventoryMaster>()
                .HasOne(p => p.Store)
                .WithMany(p => p.InventoryMasters)
                .HasForeignKey(p => p.StoreID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InventoryMaster>()
                .HasOne(p => p.Student)
                .WithMany(p => p.InventoryMaster)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InventoryMaster>()
                .HasOne(p => p.Save)
                .WithMany(p => p.InventoryMasters)
                .HasForeignKey(p => p.SaveID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InventoryMaster>()
                .HasOne(p => p.Bank)
                .WithMany(p => p.InventoryMasters)
                .HasForeignKey(p => p.BankID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InventoryMaster>()
                .HasOne(p => p.Supplier)
                .WithMany(p => p.InventoryMasters)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InventoryMaster>()
                .HasOne(p => p.StoreToTransform)
                .WithMany(p => p.InventoryMastersStoreToTransform)
                .HasForeignKey(p => p.StoreToTransformId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShopItem>()
                .HasOne(p => p.Gender)
                .WithMany(p => p.ShopItem)
                .HasForeignKey(p => p.GenderID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ShopItem>()
                .HasOne(p => p.InventorySubCategories)
                .WithMany(p => p.ShopItem)
                .HasForeignKey(p => p.InventorySubCategoriesID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ShopItem>()
                .HasOne(p => p.School)
                .WithMany(p => p.ShopItem)
                .HasForeignKey(p => p.SchoolID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ShopItem>()
                .HasOne(p => p.Grade)
                .WithMany(p => p.ShopItem)
                .HasForeignKey(p => p.GradeID)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<InventoryMaster>()
                .HasOne(p => p.InventoryFlags)
                .WithMany(p => p.InventoryMaster)
                .HasForeignKey(p => p.FlagId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<Cart>()
                .HasOne(p => p.Student)
                .WithMany(p => p.Carts)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Cart_ShopItem>()
                .HasOne(p => p.Cart)
                .WithMany(p => p.Cart_ShopItems)
                .HasForeignKey(p => p.CartID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Cart_ShopItem>()
                .HasOne(p => p.ShopItem)
                .WithMany(p => p.Cart_ShopItems)
                .HasForeignKey(p => p.ShopItemID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Cart_ShopItem>()
                .HasOne(p => p.ShopItemColor)
                .WithMany(p => p.Cart_ShopItems)
                .HasForeignKey(p => p.ShopItemColorID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Cart_ShopItem>()
                .HasOne(p => p.ShopItemSize)
                .WithMany(p => p.Cart_ShopItems)
                .HasForeignKey(p => p.ShopItemSizeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(p => p.OrderState)
                .WithMany(p => p.Orders)
                .HasForeignKey(p => p.OrderStateID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(p => p.Student)
                .WithMany(p => p.Orders)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(p => p.Cart)
                .WithMany(p => p.Orders)
                .HasForeignKey(p => p.CartID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockingDetails>()
                .HasOne(p => p.ShopItem)
                .WithMany(p => p.StockingDetails)
                .HasForeignKey(p => p.ShopItemID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockingDetails>()
                .HasOne(p => p.Stocking)
                .WithMany(p => p.StockingDetails)
                .HasForeignKey(p => p.StockingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Stocking>()
                .HasOne(p => p.Store)
                .WithMany(p => p.Stocking)
                .HasForeignKey(p => p.StoreID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Stocking>()
                .HasOne(p => p.School)
                .WithMany(p => p.Stocking)
                .HasForeignKey(p => p.SchoolId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Stocking>()
                .HasOne(p => p.SchoolPCs)
                .WithMany(p => p.Stocking)
                .HasForeignKey(p => p.SchoolPCId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EvaluationTemplateGroup>()
                .HasOne(p => p.EvaluationTemplate)
                .WithMany(p => p.EvaluationTemplateGroups)
                .HasForeignKey(p => p.EvaluationTemplateID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationTemplateGroupQuestion>()
                .HasOne(p => p.EvaluationTemplateGroup)
                .WithMany(p => p.EvaluationTemplateGroupQuestions)
                .HasForeignKey(p => p.EvaluationTemplateGroupID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationEmployee>()
                .HasOne(p => p.Evaluated)
                .WithMany(p => p.EvaluatedEmployees)
                .HasForeignKey(p => p.EvaluatedID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationEmployee>()
                .HasOne(p => p.Evaluator)
                .WithMany(p => p.EvaluatorEmployees)
                .HasForeignKey(p => p.EvaluatorID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationEmployee>()
                .HasOne(p => p.EvaluationTemplate)
                .WithMany(p => p.EvaluationEmployees)
                .HasForeignKey(p => p.EvaluationTemplateID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationEmployee>()
                .HasOne(p => p.Classroom)
                .WithMany(p => p.EvaluationEmployees)
                .HasForeignKey(p => p.ClassroomID)
                .OnDelete(DeleteBehavior.Restrict);
             
            modelBuilder.Entity<EvaluationEmployeeQuestion>()
                .HasOne(p => p.EvaluationEmployee)
                .WithMany(p => p.EvaluationEmployeeQuestions)
                .HasForeignKey(p => p.EvaluationEmployeeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationEmployeeQuestion>()
                .HasOne(p => p.EvaluationTemplateGroupQuestion)
                .WithMany(p => p.EvaluationEmployeeQuestions)
                .HasForeignKey(p => p.EvaluationTemplateGroupQuestionID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationEmployeeStudentBookCorrection>()
                .HasOne(p => p.Student)
                .WithMany(p => p.EvaluationEmployeeStudentBookCorrections)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationEmployeeStudentBookCorrection>()
                .HasOne(p => p.EvaluationBookCorrection)
                .WithMany(p => p.EvaluationEmployeeStudentBookCorrections)
                .HasForeignKey(p => p.EvaluationBookCorrectionID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EvaluationEmployeeStudentBookCorrection>()
                .HasOne(p => p.EvaluationEmployee)
                .WithMany(p => p.EvaluationEmployeeStudentBookCorrections)
                .HasForeignKey(p => p.EvaluationEmployeeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonLive>()
                .HasOne(p => p.WeekDay)
                .WithMany(p => p.LessonLives)
                .HasForeignKey(p => p.WeekDayID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonLive>()
                .HasOne(p => p.Classroom)
                .WithMany(p => p.LessonLives)
                .HasForeignKey(p => p.ClassroomID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonLive>()
                .HasOne(p => p.Subject)
                .WithMany(p => p.LessonLives)
                .HasForeignKey(p => p.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonActivity>()
                .HasOne(p => p.Lesson)
                .WithMany(p => p.LessonActivities)
                .HasForeignKey(p => p.LessonID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonActivity>()
                .HasOne(p => p.LessonActivityType)
                .WithMany(p => p.LessonActivities)
                .HasForeignKey(p => p.LessonActivityTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonResourceClassroom>()
                .HasOne(p => p.Classroom)
                .WithMany(p => p.LessonResourceClassrooms)
                .HasForeignKey(p => p.ClassroomID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonResourceClassroom>()
                .HasOne(p => p.LessonResource)
                .WithMany(p => p.LessonResourceClassrooms)
                .HasForeignKey(p => p.LessonResourceID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonResource>()
                .HasOne(p => p.LessonResourceType)
                .WithMany(p => p.LessonResources)
                .HasForeignKey(p => p.LessonResourceTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonResource>()
                .HasOne(p => p.Lesson)
                .WithMany(p => p.LessonResources)
                .HasForeignKey(p => p.LessonID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonTag>()
                .HasOne(p => p.Lesson)
                .WithMany(p => p.LessonTags)
                .HasForeignKey(p => p.LessonID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<LessonTag>()
                .HasOne(p => p.Tag)
                .WithMany(p => p.LessonTags)
                .HasForeignKey(p => p.TagID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<SemesterWorkingWeek>()
                .HasOne(p => p.Semester)
                .WithMany(p => p.SemesterWorkingWeeks)
                .HasForeignKey(p => p.SemesterID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<School>()
                .HasOne(p => p.WeekStartDay)
                .WithMany(p => p.StartDaySchool)
                .HasForeignKey(p => p.WeekStartDayID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<School>()
                .HasOne(p => p.WeekEndDay)
                .WithMany(p => p.EndDaySchool)
                .HasForeignKey(p => p.WeekEndDayID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Lesson>()
                .HasOne(p => p.Subject)
                .WithMany(p => p.Lessons)
                .HasForeignKey(p => p.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Lesson>()
                .HasOne(p => p.SemesterWorkingWeek)
                .WithMany(p => p.Lessons)
                .HasForeignKey(p => p.SemesterWorkingWeekID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<SubjectWeightType>()
                .HasOne(p => p.WeightType)
                .WithMany(p => p.SubjectWeightTypes)
                .HasForeignKey(p => p.WeightTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<SubjectWeightType>()
                .HasOne(p => p.Subject)
                .WithMany(p => p.SubjectWeightTypes)
                .HasForeignKey(p => p.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubjectResource>()
                .HasOne(p => p.Subject)
                .WithMany(p => p.SubjectResources)
                .HasForeignKey(p => p.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentMedal>()
                .HasOne(p => p.Student)
                .WithMany(p => p.StudentMedals)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentMedal>()
                .HasOne(p => p.Medal)
                .WithMany(p => p.StudentMedals)
                .HasForeignKey(p => p.MedalID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentPerformance>()
                .HasOne(p => p.PerformanceType)
                .WithMany(p => p.StudentPerformances)
                .HasForeignKey(p => p.PerformanceTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DailyPerformance>()
                .HasOne(p => p.DailyPerformanceMaster)
                .WithMany(p => p.DailyPerformances)
                .HasForeignKey(p => p.DailyPerformanceMasterID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DailyPerformance>()
              .HasOne(p => p.Student)
              .WithMany(p => p.DailyPerformance)
              .HasForeignKey(p => p.StudentID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentPerformance>()
                .HasOne(p => p.DailyPerformance)
                .WithMany(p => p.StudentPerformance)
                .HasForeignKey(p => p.DailyPerformanceID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DailyPerformanceMaster>()
                .HasOne(p => p.Subject)
                .WithMany(p => p.DailyPerformanceMaster)
                .HasForeignKey(p => p.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DailyPerformanceMaster>()
                .HasOne(p => p.Classroom)
                .WithMany(p => p.DailyPerformanceMaster)
                .HasForeignKey(p => p.ClassroomID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionBank>()
                .HasOne(p => p.Lesson)
                .WithMany(p => p.QuestionBanks)
                .HasForeignKey(p => p.LessonID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionBank>()
                .HasOne(p => p.DokLevel)
                .WithMany(p => p.QuestionBanks)
                .HasForeignKey(p => p.DokLevelID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionBank>()
                .HasOne(p => p.BloomLevel)
                .WithMany(p => p.QuestionBanks)
                .HasForeignKey(p => p.BloomLevelID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionBank>()
                .HasOne(p => p.QuestionType)
                .WithMany(p => p.QuestionBanks)
                .HasForeignKey(p => p.QuestionTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InventoryDetails>()
                .HasOne(p => p.Sales)
                .WithMany(p => p.SaleReturns)
                .HasForeignKey(p => p.SalesId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionBank>()
                .HasOne(p => p.QuestionBankOption)
                .WithMany(p => p.QuestionBanks)
                .HasForeignKey(p => p.CorrectAnswerID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionBankTags>()
                .HasOne(p => p.QuestionBank)
                .WithMany(p => p.QuestionBankTags)
                .HasForeignKey(p => p.QuestionBankID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionBankTags>()
                .HasOne(p => p.Tag)
                .WithMany(p => p.QuestionBankTags)
                .HasForeignKey(p => p.TagID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionBankOption>()
                .HasOne(p => p.QuestionBank)
                .WithMany(p => p.QuestionBankOptions)
                .HasForeignKey(p => p.QuestionBankID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubBankQuestion>()
                .HasOne(p => p.QuestionBank)
                .WithMany(p => p.SubBankQuestions)
                .HasForeignKey(p => p.QuestionBankID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubjectSupervisor>()
              .HasOne(p => p.Employee)
              .WithMany(p => p.SubjectSupervisors)
              .HasForeignKey(p => p.EmployeeID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubjectSupervisor>()
              .HasOne(p => p.Subject)
              .WithMany(p => p.SubjectSupervisors)
              .HasForeignKey(p => p.SubjectID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GradeSupervisor>()
              .HasOne(p => p.Grade)
              .WithMany(p => p.GradeSupervisors)
              .HasForeignKey(p => p.GradeID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GradeSupervisor>()
              .HasOne(p => p.Employee)
              .WithMany(p => p.GradeSupervisors)
              .HasForeignKey(p => p.EmployeeID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentClassroomSubject>()
              .HasOne(p => p.StudentClassroom)
              .WithMany(p => p.StudentClassroomSubjects)
              .HasForeignKey(p => p.StudentClassroomID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<StudentClassroomSubject>()
              .HasOne(p => p.Subject)
              .WithMany(p => p.StudentClassroomSubjects)
              .HasForeignKey(p => p.SubjectID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Assignment>()
              .HasOne(p => p.Subject)
              .WithMany(p => p.Assignments)
              .HasForeignKey(p => p.SubjectID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Assignment>()
              .HasOne(p => p.AssignmentType)
              .WithMany(p => p.Assignments)
              .HasForeignKey(p => p.AssignmentTypeID)
              .OnDelete(DeleteBehavior.Restrict); 
            
            modelBuilder.Entity<Assignment>()
              .HasOne(p => p.SubjectWeightType)
              .WithMany(p => p.Assignments)
              .HasForeignKey(p => p.SubjectWeightTypeID)
              .OnDelete(DeleteBehavior.Restrict); 
            
            modelBuilder.Entity<Assignment>()
              .HasOne(p => p.AcademicYear)
              .WithMany(p => p.Assignments)
              .HasForeignKey(p => p.AcademicYearID)
              .OnDelete(DeleteBehavior.Restrict); 
            
            modelBuilder.Entity<AssignmentStudent>()
              .HasOne(p => p.StudentClassroom)
              .WithMany(p => p.AssignmentStudents)
              .HasForeignKey(p => p.StudentClassroomID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AssignmentStudent>()
              .HasOne(p => p.Assignment)
              .WithMany(p => p.AssignmentStudents)
              .HasForeignKey(p => p.AssignmentID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AssignmentStudentIsSpecific>()
              .HasOne(p => p.StudentClassroom)
              .WithMany(p => p.AssignmentStudentIsSpecifics)
              .HasForeignKey(p => p.StudentClassroomID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AssignmentStudentIsSpecific>()
              .HasOne(p => p.Assignment)
              .WithMany(p => p.AssignmentStudentIsSpecifics)
              .HasForeignKey(p => p.AssignmentID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AssignmentQuestion>()
              .HasOne(p => p.Assignment)
              .WithMany(p => p.AssignmentQuestions)
              .HasForeignKey(p => p.AssignmentID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AssignmentQuestion>()
              .HasOne(p => p.QuestionBank)
              .WithMany(p => p.AssignmentQuestions)
              .HasForeignKey(p => p.QuestionBankID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<DirectMarkClassesStudent>()
              .HasOne(p => p.DirectMark)
              .WithMany(p => p.DirectMarkClassesStudent)
              .HasForeignKey(p => p.DirectMarkID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<DirectMarkClassesStudent>()
              .HasOne(p => p.StudentClassroom)
              .WithMany(p => p.DirectMarkClassesStudent)
              .HasForeignKey(p => p.StudentClassroomID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AssignmentStudentQuestion>()
              .HasOne(p => p.AssignmentStudent)
              .WithMany(p => p.AssignmentStudentQuestions)
              .HasForeignKey(p => p.AssignmentStudentID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AssignmentStudentQuestionAnswerOption>()
              .HasOne(p => p.AssignmentStudentQuestion)
              .WithMany(p => p.AssignmentStudentQuestionAnswerOption)
              .HasForeignKey(p => p.AssignmentStudentQuestionID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AssignmentStudentQuestionAnswerOption>()
              .HasOne(p => p.SubBankQuestion)
              .WithMany(p => p.AssignmentStudentQuestionAnswerOption)
              .HasForeignKey(p => p.SubBankQuestionID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AssignmentStudentQuestionAnswerOption>()
              .HasOne(p => p.QuestionBankOption)
              .WithMany(p => p.AssignmentStudentQuestionAnswerOption)
              .HasForeignKey(p => p.SelectedOpionID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTable>()
              .HasOne(p => p.AcademicYear)
              .WithMany(p => p.TimeTables)
              .HasForeignKey(p => p.AcademicYearID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTableClassroom>()
              .HasOne(p => p.TimeTable)
              .WithMany(p => p.TimeTableClassrooms)
              .HasForeignKey(p => p.TimeTableID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTableClassroom>()
              .HasOne(p => p.Classroom)
              .WithMany(p => p.TimeTableClassrooms)
              .HasForeignKey(p => p.ClassroomID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTableSession>()
              .HasOne(p => p.TimeTableClassroom)
              .WithMany(p => p.TimeTableSessions)
              .HasForeignKey(p => p.TimeTableClassroomID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTableSubject>()
              .HasOne(p => p.TimeTableSession)
              .WithMany(p => p.TimeTableSubjects)
              .HasForeignKey(p => p.TimeTableSessionID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTableSubject>()
              .HasOne(p => p.Subject)
              .WithMany(p => p.TimeTableSubjects)
              .HasForeignKey(p => p.SubjectID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTableSubject>()
              .HasOne(p => p.Teacher)
              .WithMany(p => p.TimeTableSubjects)
              .HasForeignKey(p => p.TeacherID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTableClassroom>()
              .HasOne(p => p.Day)
              .WithMany(p => p.TimeTableClassrooms)
              .HasForeignKey(p => p.DayId)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AccountingConfigs>()
              .HasOne(p => p.Sales)
              .WithMany(p => p.AccountingConfigurationsSales)
              .HasForeignKey(p => p.SalesID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AccountingConfigs>()
              .HasOne(p => p.SalesReturn)
              .WithMany(p => p.AccountingConfigurationsSalesReturns)
              .HasForeignKey(p => p.SalesReturnID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AccountingConfigs>()
              .HasOne(p => p.Purchase)
              .WithMany(p => p.AccountingConfigurationsPurchases)
              .HasForeignKey(p => p.PurchaseID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AccountingConfigs>()
              .HasOne(p => p.PurchaseReturn)
              .WithMany(p => p.AccountingConfigurationsPurchasesReturns)
              .HasForeignKey(p => p.PurchaseReturnID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AnnouncementSharedTo>()
               .HasOne(p => p.Announcement)
              .WithMany(p => p.AnnouncementSharedTos)
              .HasForeignKey(p => p.AnnouncementID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<AnnouncementSharedTo>()
               .HasOne(p => p.UserType)
              .WithMany(p => p.AnnouncementSharedTos)
              .HasForeignKey(p => p.UserTypeID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<DiscussionRoomStudentClassroom>()
               .HasOne(p => p.DiscussionRoom)
              .WithMany(p => p.DiscussionRoomStudentClassrooms)
              .HasForeignKey(p => p.DiscussionRoomID)
              .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<DiscussionRoomStudentClassroom>()
               .HasOne(p => p.StudentClassroom)
              .WithMany(p => p.DiscussionRoomStudentClassrooms)
              .HasForeignKey(p => p.StudentClassroomID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Duty>()
                .HasOne(p => p.TimeTableSession)
                .WithMany(p => p.Duties)
                .HasForeignKey(p => p.TimeTableSessionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Duty>()
                .HasOne(p => p.Teacher)
                .WithMany(p => p.Duties)
                .HasForeignKey(p => p.TeacherID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<NotificationSharedTo>()
                .HasOne(p => p.UserType)
                .WithMany(p => p.NotificationSharedTos)
                .HasForeignKey(p => p.UserTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Notification>()
                .HasOne(p => p.UserType)
                .WithMany(p => p.Notifications)
                .HasForeignKey(p => p.UserTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<NotificationSharedTo>()
                .HasOne(p => p.Notification)
                .WithMany(p => p.NotificationSharedTos)
                .HasForeignKey(p => p.NotificationID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DiscussionRoom>()
                .HasOne(p => p.School)
                .WithMany(p => p.DiscussionRooms)
                .HasForeignKey(p => p.SchoolID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeTypeViolation>()
                .HasOne(p => p.ViolationType)
                .WithMany(p => p.EmployeeTypeViolations)
                .HasForeignKey(p => p.ViolationTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeTypeViolation>()
                .HasOne(p => p.EmployeeType)
                .WithMany(p => p.EmployeeTypeViolations)
                .HasForeignKey(p => p.EmployeeTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Violation>()
                .HasOne(p => p.Employee)
                .WithMany(p => p.Violations)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Violation>()
                .HasOne(p => p.ViolationType)
                .WithMany(p => p.Violations)
                .HasForeignKey(p => p.ViolationTypeID)
                .OnDelete(DeleteBehavior.Restrict);



            modelBuilder.Entity<RemedialClassroom>()
                .HasOne(p => p.AcademicYear)
                .WithMany(p => p.RemedialClassrooms)
                .HasForeignKey(p => p.AcademicYearID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialClassroom>()
                .HasOne(p => p.Subject)
                .WithMany(p => p.RemedialClassrooms)
                .HasForeignKey(p => p.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialClassroom>()
                .HasOne(p => p.Teacher)
                .WithMany(p => p.RemedialClassrooms)
                .HasForeignKey(p => p.TeacherID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialClassroomStudent>()
                .HasOne(p => p.RemedialClassroom)
                .WithMany(p => p.RemedialClassroomStudents)
                .HasForeignKey(p => p.RemedialClassroomID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialClassroomStudent>()
                .HasOne(p => p.Student)
                .WithMany(p => p.RemedialClassroomStudents)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialTimeTable>()
                .HasOne(p => p.AcademicYear)
                .WithMany(p => p.RemedialTimeTables)
                .HasForeignKey(p => p.AcademicYearID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialTimeTableDay>()
                .HasOne(p => p.RemedialTimeTable)
                .WithMany(p => p.RemedialTimeTableDays)
                .HasForeignKey(p => p.RemedialTimeTableID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialTimeTableDay>()
                .HasOne(p => p.Day)
                .WithMany(p => p.RemedialTimeTableDays)
                .HasForeignKey(p => p.DayId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialTimeTableClasses>()
                .HasOne(p => p.RemedialTimeTableDay)
                .WithMany(p => p.RemedialTimeTableClasses)
                .HasForeignKey(p => p.RemedialTimeTableDayId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialTimeTableClasses>()
                .HasOne(p => p.RemedialClassroom)
                .WithMany(p => p.RemedialTimeTableClasses)
                .HasForeignKey(p => p.RemedialClassroomID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ChatMessageAttachment>()
                .HasOne(p => p.ChatMessage)
                .WithMany(p => p.ChatMessageAttachments)
                .HasForeignKey(p => p.ChatMessageID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ChatMessage>()
                .HasOne(p => p.ReceiverUserType)
                .WithMany(p => p.ReceiverChatMessages)
                .HasForeignKey(p => p.ReceiverUserTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ChatMessage>()
                .HasOne(p => p.SenderUserType)
                .WithMany(p => p.SenderChatMessages)
                .HasForeignKey(p => p.SenderUserTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Request>()
                .HasOne(p => p.ReceiverUserType)
                .WithMany(p => p.ReceiverRequests)
                .HasForeignKey(p => p.ReceiverUserTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Request>()
                .HasOne(p => p.SenderUserType)
                .WithMany(p => p.SenderRequests)
                .HasForeignKey(p => p.SenderUserTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Attendance>()
                .HasOne(p => p.AcademicYear)
                .WithMany(p => p.Attendances)
                .HasForeignKey(p => p.AcademicYearID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Attendance>()
                .HasOne(p => p.Classroom)
                .WithMany(p => p.Attendances)
                .HasForeignKey(p => p.ClassroomID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AttendanceStudent>()
                .HasOne(p => p.Student)
                .WithMany(p => p.AttendanceStudents)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AttendanceStudent>()
                .HasOne(p => p.Attendance)
                .WithMany(p => p.AttendanceStudents)
                .HasForeignKey(p => p.AttendanceID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conduct>()
                .HasOne(p => p.Student)
                .WithMany(p => p.Conduct)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conduct>()
                .HasOne(p => p.ConductType)
                .WithMany(p => p.Conduct)
                .HasForeignKey(p => p.ConductTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conduct>()
                .HasOne(p => p.ProcedureType)
                .WithMany(p => p.Conduct)
                .HasForeignKey(p => p.ProcedureTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conduct>()
                .HasOne(p => p.Classroom)
                .WithMany(p => p.Conduct)
                .HasForeignKey(p => p.ClassroomID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConductType>()
                .HasOne(p => p.ConductLevel)
                .WithMany(p => p.ConductTypes)
                .HasForeignKey(p => p.ConductLevelID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConductType>()
                .HasOne(p => p.School)
                .WithMany(p => p.ConductTypes)
                .HasForeignKey(p => p.SchoolID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConductTypeSection>()
                .HasOne(p => p.ConductType)
                .WithMany(p => p.ConductTypeSections)
                .HasForeignKey(p => p.ConductTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConductTypeSection>()
                .HasOne(p => p.Section)
                .WithMany(p => p.ConductTypeSections)
                .HasForeignKey(p => p.SectionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentIssue>()
                .HasOne(p => p.Student)
                .WithMany(p => p.StudentIssues)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentIssue>()
                .HasOne(p => p.Classroom)
                .WithMany(p => p.StudentIssues)
                .HasForeignKey(p => p.ClassroomID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SocialWorkerMedalStudent>()
                .HasOne(p => p.Student)
                .WithMany(p => p.SocialWorkerMedalStudent)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SocialWorkerMedalStudent>()
                .HasOne(p => p.SocialWorkerMedal)
                .WithMany(p => p.SocialWorkerMedalStudent)
                .HasForeignKey(p => p.SocialWorkerMedalID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CertificateStudent>()
                .HasOne(p => p.Student)
                .WithMany(p => p.CertificateStudent)
                .HasForeignKey(p => p.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CertificateStudent>()
                .HasOne(p => p.CertificateType)
                .WithMany(p => p.CertificateStudent)
                .HasForeignKey(p => p.CertificateTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(p => p.School)
                .WithMany(p => p.Appointments)
                .HasForeignKey(p => p.SchoolID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppointmentParent>()
                .HasOne(p => p.Parent)
                .WithMany(p => p.AppointmentParents)
                .HasForeignKey(p => p.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppointmentParent>()
                .HasOne(p => p.Appointment)
                .WithMany(p => p.AppointmentParents)
                .HasForeignKey(p => p.AppointmentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppointmentGrade>()
                .HasOne(p => p.Grade)
                .WithMany(p => p.AppointmentGrades)
                .HasForeignKey(p => p.GradeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppointmentGrade>()
                .HasOne(p => p.Appointment)
                .WithMany(p => p.AppointmentGrades)
                .HasForeignKey(p => p.AppointmentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bonus>()
                .HasOne(p => p.Employee)
                .WithMany(p => p.Bonus)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bonus>()
                .HasOne(p => p.BonusType)
                .WithMany(p => p.Bonus)
                .HasForeignKey(p => p.BonusTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Deduction>()
                .HasOne(p => p.Employee)
                .WithMany(p => p.Deduction)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Deduction>()
                .HasOne(p => p.DeductionType)
                .WithMany(p => p.Deduction)
                .HasForeignKey(p => p.DeductionTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LeaveRequest>()
                .HasOne(p => p.Employee)
                .WithMany(p => p.LeaveRequest)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Loans>()
                .HasOne(p => p.Employee)
                .WithMany(p => p.Loans)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Loans>()
                .HasOne(p => p.Save)
                .WithMany(p => p.Loans)
                .HasForeignKey(p => p.SafeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VacationEmployee>()
                .HasOne(p => p.Employee)
                .WithMany(p => p.VacationEmployee)
                .HasForeignKey(p => p.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VacationEmployee>()
                .HasOne(p => p.VacationTypes)
                .WithMany(p => p.VacationEmployee)
                .HasForeignKey(p => p.VacationTypesID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DirectMark>()
                .HasOne(p => p.Subject)
                .WithMany(p => p.DirectMarks)
                .HasForeignKey(p => p.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DirectMark>()
                .HasOne(p => p.SubjectWeightType)
                .WithMany(p => p.DirectMarks)
                .HasForeignKey(p => p.SubjectWeightTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DirectMark>()
              .HasOne(p => p.AcademicYear)
              .WithMany(p => p.DirectMarks)
              .HasForeignKey(p => p.AcademicYearID)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DirectMarkClasses>()
                .HasOne(p => p.DirectMark)
                .WithMany(p => p.DirectMarkClasses)
                .HasForeignKey(p => p.DirectMarkID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DirectMarkClasses>()
                .HasOne(p => p.Classroom)
                .WithMany(p => p.DirectMarkClasses)
                .HasForeignKey(p => p.ClassroomID)
                .OnDelete(DeleteBehavior.Restrict);

            // Maintenance Module
            modelBuilder.Entity<MaintenanceEmployee>()
                 .HasOne(me => me.Employee)
                 .WithMany(me => me.MaintenanceEmployees)
                 .HasForeignKey(me => me.EmployeeID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Maintenance>()
               .HasOne(m => m.Item)
               .WithMany(m => m.Maintenances)
               .HasForeignKey(m => m.ItemID)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Maintenance>()
                .HasOne(m => m.MaintenanceEmployee)
                .WithMany(m => m.Maintenances)
                .HasForeignKey(m => m.MaintenanceEmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Maintenance>()
                .HasOne(m => m.Company)
                .WithMany(m => m.Maintenances)
                .HasForeignKey(m => m.CompanyID)
                .OnDelete(DeleteBehavior.Restrict);

            
            modelBuilder.Entity<Employee>()
                .HasOne(m => m.ConnectionStatus)
                .WithMany(m => m.Employees)
                .HasForeignKey(m => m.ConnectionStatusID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Student>()
                .HasOne(m => m.ConnectionStatus)
                .WithMany(m => m.Students)
                .HasForeignKey(m => m.ConnectionStatusID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Parent>()
                .HasOne(m => m.ConnectionStatus)
                .WithMany(m => m.Parents)
                .HasForeignKey(m => m.ConnectionStatusID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ArchivingTree>()
                .HasOne(m => m.ArchivingTreeParent)
                .WithMany(m => m.ChildArchivingTrees)
                .HasForeignKey(m => m.ArchivingTreeParentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PermissionGroupEmployee>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.PermissionGroupEmployees)
                .HasForeignKey(m => m.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PermissionGroupEmployee>()
                .HasOne(m => m.PermissionGroup)
                .WithMany(m => m.PermissionGroupEmployees)
                .HasForeignKey(m => m.PermissionGroupID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PermissionGroupDetails>()
                .HasOne(m => m.ArchivingTree)
                .WithMany(m => m.PermissionGroupDetails)
                .HasForeignKey(m => m.ArchivingTreeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PermissionGroupDetails>()
                .HasOne(m => m.PermissionGroup)
                .WithMany(m => m.PermissionGroupDetails)
                .HasForeignKey(m => m.PermissionGroupID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AnnualVacationEmployee>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.AnnualVacationEmployee)
                .HasForeignKey(m => m.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AnnualVacationEmployee>()
                .HasOne(m => m.VacationTypes)
                .WithMany(m => m.AnnualVacationEmployee)
                .HasForeignKey(m => m.VacationTypesID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeClocks>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.EmployeeClocks)
                .HasForeignKey(m => m.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeClocks>()
                .HasOne(m => m.Location)
                .WithMany(m => m.EmployeeClocks)
                .HasForeignKey(m => m.LocationID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeLocation>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.EmployeeLocation)
                .HasForeignKey(m => m.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeLocation>()
                .HasOne(m => m.Location)
                .WithMany(m => m.EmployeeLocation)
                .HasForeignKey(m => m.LocationID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BankEmployee>()
                .HasOne(m => m.Bank)
                .WithMany(m => m.BankEmployees)
                .HasForeignKey(m => m.BankID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<BankEmployee>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.BankEmployees)
                .HasForeignKey(m => m.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<SafeEmployee>()
                .HasOne(m => m.Save)
                .WithMany(m => m.SafeEmployee)
                .HasForeignKey(m => m.SaveID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<SafeEmployee>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.SafeEmployee)
                .HasForeignKey(m => m.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<RefreshTokens>()
                .HasOne(m => m.UserType)
                .WithMany(m => m.RefreshTokens)
                .HasForeignKey(m => m.UserTypeID)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<MonthlyAttendance>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.MonthlyAttendance)
                .HasForeignKey(m => m.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MonthlyAttendance>()
                .HasOne(m => m.DayStatus)
                .WithMany(m => m.MonthlyAttendance)
                .HasForeignKey(m => m.DayStatusId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SalaryHistory>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.SalaryHistory)
                .HasForeignKey(m => m.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeLoans>()
                .HasOne(m => m.Employee)
                .WithMany(m => m.EmployeeLoans)
                .HasForeignKey(m => m.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeLoans>()
                .HasOne(m => m.Loans)
                .WithMany(m => m.EmployeeLoans)
                .HasForeignKey(m => m.loanId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<FailedStudents>()
                .HasOne(m => m.Student)
                .WithMany(m => m.FailedStudents)
                .HasForeignKey(m => m.StudentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<FailedStudents>()
                .HasOne(m => m.Grade)
                .WithMany(m => m.FailedStudents)
                .HasForeignKey(m => m.GradeID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<FailedStudents>()
                .HasOne(m => m.Subject)
                .WithMany(m => m.FailedStudents)
                .HasForeignKey(m => m.SubjectID)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<FailedStudents>()
                .HasOne(m => m.AcademicYear)
                .WithMany(m => m.FailedStudents)
                .HasForeignKey(m => m.AcademicYearID)
                .OnDelete(DeleteBehavior.Restrict); 



            ///////////////////////// Exception: /////////////////////////
            modelBuilder.Entity<Bus>()
                .HasOne(b => b.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(b => b.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Floor>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()  
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeDays>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()  
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Student>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()  
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<EmployeeStudent>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()  
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InstallmentDeductionMaster>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()  
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Classroom>()
                .HasOne(c => c.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(c => c.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict); // Optional
            
            modelBuilder.Entity<EvaluationEmployee>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()  
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict); 
            
            modelBuilder.Entity<ClassroomSubject>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()  
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict); 
            
            modelBuilder.Entity<ClassroomSubjectCoTeacher>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()  
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<SubjectSupervisor>()
               .HasOne(f => f.DeletedByEmployee)
               .WithMany()
               .HasForeignKey(f => f.DeletedByUserId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GradeSupervisor>()
                .HasOne(f => f.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(f => f.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeTableSubject>()
                .HasOne(f => f.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(f => f.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Duty>()
                .HasOne(f => f.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(f => f.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Violation>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany() 
                .HasForeignKey(v => v.DeletedByUserId) 
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedialClassroom>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MaintenanceEmployee>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<Bonus>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Deduction>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LeaveRequest>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Loans>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VacationEmployee>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Maintenance>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PermissionGroupEmployee>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AnnualVacationEmployee>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeClocks>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeLocation>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Location>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<BankEmployee>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<SafeEmployee>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MonthlyAttendance>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SalaryHistory>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmployeeLoans>()
                .HasOne(v => v.DeletedByEmployee)
                .WithMany()
                .HasForeignKey(v => v.DeletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);


            ///////////////////////// Optional ID According to other field: /////////////////////////  
            modelBuilder.Entity<ReceivableMaster>()
                .Ignore(r => r.Bank)
                .Ignore(r => r.Save);

            modelBuilder.Entity<PayableMaster>()
                .Ignore(r => r.Bank)
                .Ignore(r => r.Save);

            modelBuilder.Entity<ReceivableDetails>()
               .Ignore(r => r.Bank)
               .Ignore(r => r.Credit)
               .Ignore(r => r.Debit)
               .Ignore(r => r.Income)
               .Ignore(r => r.Outcome)
               .Ignore(r => r.Asset)
               .Ignore(r => r.TuitionFeesType)
               .Ignore(r => r.TuitionDiscountType)
               .Ignore(r => r.Supplier)
               .Ignore(r => r.Employee)
               .Ignore(r => r.Student)
               .Ignore(r => r.Save);

            modelBuilder.Entity<PayableDetails>()
               .Ignore(r => r.Bank)
               .Ignore(r => r.Credit)
               .Ignore(r => r.Debit)
               .Ignore(r => r.Income)
               .Ignore(r => r.Outcome)
               .Ignore(r => r.Asset)
               .Ignore(r => r.TuitionFeesType)
               .Ignore(r => r.TuitionDiscountType)
               .Ignore(r => r.Supplier)
               .Ignore(r => r.Employee)
               .Ignore(r => r.Student)
               .Ignore(r => r.Save);

            modelBuilder.Entity<AccountingEntriesDetails>()
               .Ignore(r => r.Bank)
               .Ignore(r => r.Credit)
               .Ignore(r => r.Debit)
               .Ignore(r => r.Income)
               .Ignore(r => r.Outcome)
               .Ignore(r => r.Asset)
               .Ignore(r => r.TuitionFeesType)
               .Ignore(r => r.TuitionDiscountType)
               .Ignore(r => r.Supplier)
               .Ignore(r => r.Employee)
               .Ignore(r => r.Student)
               .Ignore(r => r.Save);

            modelBuilder.Entity<AccountingEntriesReport>()
                .HasNoKey().ToView(null);

            ///////////// Models without keys and views /////////////
            modelBuilder.Entity<CountResult>()
                .HasNoKey().ToView(null);

            modelBuilder.Entity<TotalResult>()
                .HasNoKey().ToView(null);

            modelBuilder.Entity<DailyTotalResult>()
                .HasNoKey().ToView(null);

            modelBuilder.Entity<AccountBalanceReport>()
                .HasNoKey().ToView(null);

            modelBuilder.Entity<AccountStatementReport>()
                .HasNoKey().ToView(null);

            modelBuilder.Entity<AccountTotals>()
                .HasNoKey().ToView(null);

            ///////////// Adding Indexes /////////////
            ///
            modelBuilder.Entity<AccountingEntriesMaster>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_EntriesMaster_IsDeleted");

            modelBuilder.Entity<AccountingEntriesMaster>()
                .HasIndex(e => e.Date)
                .HasDatabaseName("IX_EntriesMaster_Date");

            modelBuilder.Entity<AccountingEntriesDetails>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_EntriesDetails_IsDeleted");

            modelBuilder.Entity<InventoryMaster>()
                .HasIndex(e => e.Date)
                .HasDatabaseName("IX_InventoryMaster_Date");

            modelBuilder.Entity<InventoryMaster>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_InventoryMaster_IsDeleted");

            modelBuilder.Entity<InventoryDetails>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_InventoryDetails_IsDeleted");

            modelBuilder.Entity<Supplier>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_Supplier_IsDeleted");

            modelBuilder.Entity<PayableMaster>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_PayableMaster_IsDeleted");

            modelBuilder.Entity<PayableMaster>()
                .HasIndex(e => e.LinkFileID)
                .HasDatabaseName("IX_PayableMaster_LinkFileID");

            modelBuilder.Entity<PayableMaster>()
                .HasIndex(e => e.BankOrSaveID)
                .HasDatabaseName("IX_PayableMaster_BankOrSaveID");

            modelBuilder.Entity<PayableMaster>()
                .HasIndex(e => e.Date)
                .HasDatabaseName("IX_PayableMaster_Date");

            modelBuilder.Entity<PayableDetails>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_PayableDetails_IsDeleted");

            modelBuilder.Entity<PayableDetails>()
                .HasIndex(e => e.LinkFileTypeID)
                .HasDatabaseName("IX_PayableDetails_LinkFileTypeID");

            modelBuilder.Entity<ReceivableMaster>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_ReceivableMaster_IsDeleted");

            modelBuilder.Entity<ReceivableMaster>()
                .HasIndex(e => e.LinkFileID)
                .HasDatabaseName("IX_ReceivableMaster_LinkFileID");

            modelBuilder.Entity<ReceivableMaster>()
                .HasIndex(e => e.BankOrSaveID)
                .HasDatabaseName("IX_ReceivableMaster_BankOrSaveID");

            modelBuilder.Entity<ReceivableMaster>()
                .HasIndex(e => e.Date)
                .HasDatabaseName("IX_ReceivableMaster_Date");

            modelBuilder.Entity<ReceivableDetails>()
                .HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_ReceivableDetails_IsDeleted");

            modelBuilder.Entity<ReceivableDetails>()
                .HasIndex(e => e.LinkFileTypeID)
                .HasDatabaseName("IX_ReceivableDetails_LinkFileTypeID"); 
        }
    }
}