using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.DTO.Archiving;
using LMS_CMS_BL.DTO.Bus;
using LMS_CMS_BL.DTO.Clinic;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.DTO.ECommerce;
using LMS_CMS_BL.DTO.ETA;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.Maintenance;
using LMS_CMS_BL.DTO.Octa;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.DTO.Violation;
using LMS_CMS_BL.DTO.Zatca;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
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
using LMS_CMS_DAL.Models.Octa;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.Config
{
    public class AutoMapConfig : Profile
    {
        private readonly LMS_CMS_Context _context;

        public AutoMapConfig(LMS_CMS_Context context)
        {
            _context = context;
        }
        public AutoMapConfig()
        {
            CreateMap<LMS_CMS_DAL.Models.Domains.Page, Page_AddDTO>();
            CreateMap<Page_AddDTO,  LMS_CMS_DAL.Models.Domains.Page > ();

            CreateMap <LMS_CMS_DAL.Models.Domains.Page, Page_GetDTO >();
            CreateMap<Bus, Bus_GetDTO>()
                .ForMember(dest => dest.BusTypeName, opt => opt.MapFrom(src => src.BusType.Name))
                .ForMember(dest => dest.BusDistrictName, opt => opt.MapFrom(src => src.BusDistrict.Name))
                .ForMember(dest => dest.BusStatusName, opt => opt.MapFrom(src => src.BusStatus.Name))
                .ForMember(dest => dest.DriverName, opt => opt.MapFrom(src => src.Driver.en_name))
                .ForMember(dest => dest.DriverAssistantName, opt => opt.MapFrom(src => src.DriverAssistant.en_name))
                .ForMember(dest => dest.BusCompanyName, opt => opt.MapFrom(src => src.BusCompany.Name));
            CreateMap<Bus_AddDTO, Bus>();
            CreateMap<Bus_PutDTO, Bus>();

            CreateMap<BusStudent, BusStudentGetDTO>()
                .ForMember(dest => dest.BusName, opt => opt.MapFrom(src => src.Bus.Name))
                .ForMember(dest => dest.StudentID, opt => opt.MapFrom(src => src.Student.ID))
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.BusCategoryName, opt => opt.MapFrom(src => src.BusCategory.Name))
                .ForMember(dest => dest.SemseterName, opt => opt.MapFrom(src => src.Semester.Name))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.Semester.AcademicYear.School.ID))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.Semester.AcademicYear.School.Name))
                .ForMember(dest => dest.StudentAcademicYear, opt => opt.MapFrom(src => src.Semester.AcademicYear.Name));

            CreateMap<BusStudent_AddDTO, BusStudent>();
            CreateMap<BusStudent_PutDTO, BusStudent>();

            CreateMap<BusType, BusTypeGetDTO>();
            CreateMap<BusTypeGetDTO, BusType>();
            CreateMap<BusType, BusTypeAddDTO>();
            CreateMap<BusTypeAddDTO, BusType>();
            CreateMap<BusTypeEditDTO, BusType>();
            CreateMap<BusType, BusTypeEditDTO>();



            CreateMap<BusDistrict, BusDistrictAddDTO>();
            CreateMap<BusDistrictAddDTO, BusDistrict>();
            CreateMap<BusDistrict, BusDistrictGetDTO>();
            CreateMap<BusDistrictGetDTO, BusDistrict>();
            CreateMap<BusDistrictEditDTO, BusDistrict>();
            CreateMap<BusDistrict, BusDistrictEditDTO>();


            CreateMap<BusCategory, BusCatigoryAddDTO>();
            CreateMap<BusCatigoryAddDTO, BusCategory>();
            CreateMap<BusCategory, BusCatigoryGetDTO>();
            CreateMap<BusCatigoryGetDTO, BusCategory>();
            CreateMap<BusCategory, BusCategoryEditDTO>();
            CreateMap<BusCategoryEditDTO, BusCategory>();

            CreateMap<BusStatus, BusStatusAddDTO>();
            CreateMap<BusStatusAddDTO, BusStatus>();
            CreateMap<BusStatus, BusStatusGetDTO>();
            CreateMap<BusStatusGetDTO, BusStatus>();
            CreateMap<BusStatus, BusStatusEditDTO>();
            CreateMap<BusStatusEditDTO, BusStatus>();

            CreateMap<BusCompany, BusCompanyAddDTO>();
            CreateMap<BusCompanyAddDTO, BusCompany>();
            CreateMap<BusCompany, BusCompanyGetDTO>();
            CreateMap<BusCompanyGetDTO, BusCompany>();
            CreateMap<BusCompany, BusCompanyEditDTO>();
            CreateMap<BusCompanyEditDTO, BusCompany>();

            CreateMap<Employee, Employee_GetDTO>()
                .ForMember(dest => dest.Role_Name, opt => opt.MapFrom(src => src.Role.Name))
                .ForMember(dest => dest.Role_ID, opt => opt.MapFrom(src => src.Role.ID))
                .ForMember(dest => dest.EmployeeTypeName, opt => opt.MapFrom(src => src.EmployeeType.Name))
                .ForMember(dest => dest.EmployeeTypeID, opt => opt.MapFrom(src => src.EmployeeType.ID))
                .ForMember(dest => dest.BusCompanyID, opt => opt.MapFrom(src => src.BusCompany.ID))
                .ForMember(dest => dest.BusCompanyName, opt => opt.MapFrom(src => src.BusCompany.Name));

            CreateMap<Employee, EmployeeAddDTO>()
               .ForMember(dest => dest.Role_ID, opt => opt.MapFrom(src => src.Role.ID))
               .ForMember(dest => dest.EmployeeTypeID, opt => opt.MapFrom(src => src.EmployeeType.ID))
               .ForMember(dest => dest.BusCompanyID, opt => opt.MapFrom(src => src.BusCompany.ID));
            CreateMap<EmployeeAddDTO, Employee>();

            CreateMap<Employee, EmployeePutDTO>()
              .ForMember(dest => dest.Role_ID, opt => opt.MapFrom(src => src.Role.ID))
              .ForMember(dest => dest.EmployeeTypeID, opt => opt.MapFrom(src => src.EmployeeType.ID))
              .ForMember(dest => dest.BusCompanyID, opt => opt.MapFrom(src => src.BusCompany.ID));
            CreateMap<EmployeePutDTO, Employee>();

            CreateMap<Parent, ParentGetDTO>();
            CreateMap<ParentGetDTO, Parent>();

            CreateMap<Student, StudentGetDTO>()
              .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name))
              .ForMember(dest => dest.GuardianName, opt => opt.MapFrom(src => src.Parent.en_name))
              .ForMember(dest => dest.GuardianPassportNo, opt => opt.MapFrom(src => src.Parent.PassportNo))
              .ForMember(dest => dest.GuardianPassportExpireDate, opt => opt.MapFrom(src => src.Parent.PassportNoExpiredDate))
              .ForMember(dest => dest.GuardianNationalID, opt => opt.MapFrom(src => src.Parent.NationalID))
              .ForMember(dest => dest.GuardianNationalIDExpiredDate, opt => opt.MapFrom(src => src.Parent.NationalIDExpiredDate))
              .ForMember(dest => dest.GuardianQualification, opt => opt.MapFrom(src => src.Parent.Qualification))
              .ForMember(dest => dest.GuardianWorkPlace, opt => opt.MapFrom(src => src.Parent.WorkPlace))
              .ForMember(dest => dest.GuardianEmail, opt => opt.MapFrom(src => src.Parent.Email))
              .ForMember(dest => dest.GuardianProfession, opt => opt.MapFrom(src => src.Parent.Profession))
              .ForMember(dest => dest.StartAcademicYearName, opt => opt.MapFrom(src => src.StartAcademicYear.Name))
              .ForMember(dest => dest.GenderName, opt => opt.MapFrom(src => src.Gender.Name));
            CreateMap<StudentGetDTO, Student>();


            CreateMap<LMS_CMS_DAL.Models.Octa.Page, Page_GetDTO>();
            CreateMap<Page_GetDTO, LMS_CMS_DAL.Models.Octa.Page>();

            CreateMap<AcademicYear, AcademicYearGet>()
              .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.School.Name))
              .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.School.ID));
            CreateMap<AcademicYearGet, AcademicYear>();

            CreateMap<AcademicYear, AcademicYearAddDTO>()
              .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.School.ID));
            CreateMap<AcademicYearAddDTO, AcademicYear>();
            CreateMap<AcademicYear, AcademicYearEditDTO>()
              .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.School.ID));
            CreateMap<AcademicYearEditDTO, AcademicYear>();


            CreateMap<School, School_GetDTO>()
                 .ForMember(dest => dest.SchoolTypeName, opt => opt.MapFrom(src => src.SchoolType.Name))
                 .ForMember(dest => dest.SchoolTypeID, opt => opt.MapFrom(src => src.SchoolType.ID)); 
            CreateMap<SchoolAddDTO, School>(); 
            CreateMap<SchoolEditDTO, School>();
            CreateMap<SchoolEditOctaDTO, School>();
            CreateMap<SchoolEditZatcaDTO, School>();
            CreateMap<SchoolEditEtaDTO, School>();

            CreateMap<EmployeeTypeViolation, EmployeeTypeViolationGetDTO>();
            CreateMap<EmployeeTypeViolation, EmployeeTypeViolationAddDTO>();
            CreateMap<EmployeeTypeViolationAddDTO, EmployeeTypeViolation>();

            CreateMap<EmployeeTypeViolation, EmployeeTypeGetDTO>();
            CreateMap<EmployeeTypeGetDTO, EmployeeTypeViolation>();

            CreateMap<EmployeeTypeViolation, EmployeeTypeGetDTO>()
                 .ForMember(dest => dest.EmpTypeVId, opt => opt.MapFrom(src => src.ID))
                .ForMember(dest => dest.ID, opt => opt.MapFrom(src => src.EmployeeType.ID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.EmployeeType.Name));
            CreateMap<EmployeeTypeGetDTO, EmployeeTypeViolation>();


            CreateMap<ViolationType, ViolationTypeGetDTO>();
            CreateMap<ViolationTypeGetDTO, ViolationType>();
            CreateMap<ViolationTypeAddDTO, ViolationType>();
            CreateMap<ViolationTypeEditDTO, ViolationType>();

            CreateMap<Violation, ViolationGetDTO>()
                 .ForMember(dest => dest.EmployeeTypeId, opt => opt.MapFrom(src => src.Employee.EmployeeTypeID))
                 .ForMember(dest => dest.EmployeeTypeName, opt => opt.MapFrom(src => src.Employee.EmployeeType.Name))
                 .ForMember(dest => dest.ViolationTypeName, opt => opt.MapFrom(src => src.ViolationType.Name))
                 .ForMember(dest => dest.EmployeeEnglishName, opt => opt.MapFrom(src => src.Employee.en_name))
                 .ForMember(dest => dest.EmployeeArabicName, opt => opt.MapFrom(src => src.Employee.ar_name));
            CreateMap<ViolationAddDTO, Violation>();
            CreateMap<ViolationEditDTO, Violation>();

            // Add this mapping to AutoMapConfig.cs inside the CreateMap section--77
            CreateMap<Violation, ViolationReportDTO>()
                .ForMember(dest => dest.ViolationType, opt => opt.MapFrom(src => src.ViolationType.Name))
                .ForMember(dest => dest.EmployeeType, opt => opt.MapFrom(src => src.Employee.EmployeeType.Name))
                .ForMember(dest => dest.EmployeeEnglishName, opt => opt.MapFrom(src => src.Employee.en_name))
                .ForMember(dest => dest.EmployeeArabicName, opt => opt.MapFrom(src => src.Employee.ar_name))
                .ForMember(dest => dest.AttachmentUrl, opt => opt.MapFrom(src => src.Attach));
            //--77

            CreateMap<Building, BuildingGetDTO>()
               .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.school.ID))
               .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.school.Name));
            CreateMap<BuildingAddDTO, Building>();
            CreateMap<BuildingPutDTO, Building>();

            CreateMap<Semester, Semester_GetDTO>()
               .ForMember(dest => dest.AcademicYearID, opt => opt.MapFrom(src => src.AcademicYear.ID))
               .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name));
            CreateMap<Semester_GetDTO, Semester>();

            CreateMap<Semester, SemesterAddDTO>()
              .ForMember(dest => dest.AcademicYearID, opt => opt.MapFrom(src => src.AcademicYear.ID));
            CreateMap<SemesterAddDTO, Semester>();

            CreateMap<Semester, SemesterEditDTO>()
              .ForMember(dest => dest.AcademicYearID, opt => opt.MapFrom(src => src.AcademicYear.ID));
            CreateMap<SemesterEditDTO, Semester>();

            CreateMap<Floor, FloorGetDTO>()
               .ForMember(dest => dest.BuildingID, opt => opt.MapFrom(src => src.building.ID))
               .ForMember(dest => dest.BuildingName, opt => opt.MapFrom(src => src.building.Name))
               .ForMember(dest => dest.FloorMonitorID, opt => opt.MapFrom(src => src.floorMonitor.ID))
               .ForMember(dest => dest.FloorMonitorName, opt => opt.MapFrom(src => src.floorMonitor.en_name));
            CreateMap<FloorAddDTO, Floor>();
            CreateMap<FloorPutDTO, Floor>();

            CreateMap<SubjectCategory, SubjectCategoryGetDTO>();
            CreateMap<SubjectCategoryAddDTO, SubjectCategory>();
            CreateMap<SubjectCategoryPutDTO, SubjectCategory>();
 
            CreateMap<EmployeeAttachment, EmployeeAttachmentDTO>();
            CreateMap<EmployeeAttachmentDTO, EmployeeAttachment>();

            CreateMap<Subject, SubjectGetDTO>()
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Grade.Name))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.Grade.Section.school.Name))
                .ForMember(dest => dest.SectionName, opt => opt.MapFrom(src => src.Grade.Section.Name))
                .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Grade.ID))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.Grade.Section.school.ID))
                .ForMember(dest => dest.SectionID, opt => opt.MapFrom(src => src.Grade.Section.ID))
                .ForMember(dest => dest.SubjectCategoryID, opt => opt.MapFrom(src => src.SubjectCategory.ID))
                .ForMember(dest => dest.SubjectCategoryName, opt => opt.MapFrom(src => src.SubjectCategory.Name));
            CreateMap<SubjectAddDTO, Subject>();
            CreateMap<SubjectPutDTO, Subject>();


            CreateMap<Role, RolesGetDTO>();
            CreateMap<RolesGetDTO, Role>(); 

            CreateMap<Grade , GradeAddDTO>()
                .ForMember(dest => dest.SectionID, opt => opt.MapFrom(src => src.Section.ID));
            CreateMap<GradeAddDTO, Grade>();

            CreateMap<Grade, GradeEditDTO>()
               .ForMember(dest => dest.SectionID, opt => opt.MapFrom(src => src.Section.ID));
            CreateMap<GradeEditDTO, Grade>();

            CreateMap<Grade, GradeGetDTO>()
                .ForMember(dest => dest.SectionName, opt => opt.MapFrom(src => src.Section.Name))
                .ForMember(dest => dest.SectionID, opt => opt.MapFrom(src => src.Section.ID));
            CreateMap<GradeGetDTO, Grade>();

            CreateMap<Section, SectionGetDTO>()
               .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.school.ID))
               .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.school.Name));
            CreateMap<SectionGetDTO, Section>();

            CreateMap<Section, SectionAddDTO>()
               .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.school.ID));
            CreateMap<SectionAddDTO, Section>();


            CreateMap<Section, SectionEditDTO>()
               .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.school.ID));
            CreateMap<SectionEditDTO, Section>();

            CreateMap<Classroom, ClassroomGetDTO>()
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Grade.Name))
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.AcademicYear.SchoolID))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.AcademicYear.School.Name))
                .ForMember(dest => dest.SectionID, opt => opt.MapFrom(src => src.Grade.SectionID))
                .ForMember(dest => dest.SectionName, opt => opt.MapFrom(src => src.Grade.Section.Name))
                .ForMember(dest => dest.BuildingID, opt => opt.MapFrom(src => src.Floor.buildingID))
                .ForMember(dest => dest.BuildingName, opt => opt.MapFrom(src => src.Floor.building.Name)) 
                .ForMember(dest => dest.HomeroomTeacherName, opt => opt.MapFrom(src => src.HomeroomTeacher != null ? src.HomeroomTeacher.en_name : null))
                .ForMember(dest => dest.FloorName, opt => opt.MapFrom(src => src.Floor.Name));
            CreateMap<ClassroomAddDTO, Classroom>();
            CreateMap<Classroom, ClassroomAddDTO>();
            CreateMap<ClassroomPutDTO, Classroom>();

            CreateMap<DTO.Octa.SchoolTypeAddDTO, LMS_CMS_DAL.Models.Octa.SchoolType>();
            CreateMap<SchoolTypePutDTO, LMS_CMS_DAL.Models.Octa.SchoolType>();
            CreateMap<SchoolTypePutDTO, LMS_CMS_DAL.Models.Domains.LMS.SchoolType>();

            CreateMap<Domain, DomainGetDTO>();

            CreateMap<EmployeeType, EmployeeTypeGetDTO>();
            CreateMap<EmployeeTypeGetDTO, EmployeeType>();

            CreateMap<Octa, OctaGetDTO>();
            CreateMap<OctaAddDTO, Octa>();
            CreateMap<OctaPutDTO, Octa>();

            CreateMap<RegistrationCategory, RegistrationCategoryGetDTO>();
            CreateMap<RegistrationCategoryAddDTO, RegistrationCategory>();
            CreateMap<RegistrationCategoryEditDTO, RegistrationCategory>();


            CreateMap<CategoryField, CategoryFieldGetDTO>()
                .ForMember(dest => dest.FieldTypeID, opt => opt.MapFrom(src => src.FieldType.ID))
                .ForMember(dest => dest.FieldTypeName, opt => opt.MapFrom(src => src.FieldType.Name))
                .ForMember(dest => dest.Options, opt => opt.MapFrom(src => src.FieldOptions));
            CreateMap<CategoryFieldAddDTO, CategoryField>();
            CreateMap<CategoryFieldEditDTO, CategoryField>();

            CreateMap<FieldType, FieldTypeGetDTO>();
            CreateMap<QuestionType, FieldTypeGetDTO>();


            CreateMap<FieldOption, FieldOptionGetDTO>()
               .ForMember(dest => dest.CategoryFieldID, opt => opt.MapFrom(src => src.CategoryField.ID))
               .ForMember(dest => dest.CategoryFieldName, opt => opt.MapFrom(src => src.CategoryField.EnName));

            CreateMap<Test, TestGetDTO>()
                 .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Grade.Name))
                 .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.academicYear.Name))
                 .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.subject.en_name))
                 .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.academicYear.School.ID))
                 .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.academicYear.School.Name));

            CreateMap<TestAddDTO, Test>();
            CreateMap<TestEditDTO, Test>();

            CreateMap<MCQQuestionOption, MCQQuestionOptionGetDto>();
            CreateMap<Question, questionGetDTO>()
               .ForMember(dest => dest.CorrectAnswerName, opt => opt.MapFrom(src => src.mCQQuestionOption.Name))
               .ForMember(dest => dest.QuestionTypeName, opt => opt.MapFrom(src => src.QuestionType.Name))
               .ForMember(dest => dest.TestName, opt => opt.MapFrom(src => src.test.Title))
               .ForMember(dest => dest.options, opt => opt.MapFrom(src => src.MCQQuestionOptions));

            CreateMap<QuestionAddDTO, Question>();
            CreateMap<QuestionEditDTO, Question>();


            CreateMap<RegisterationFormParent, RegisterationFormParentGetDTO>()
               .ForMember(dest => dest.RegisterationFormStateName, opt => opt.MapFrom(src => src.RegisterationFormState.Name))
               .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Parent.en_name))
               .ForMember(dest => dest.RegistrationFormName, opt => opt.MapFrom(src => src.RegistrationForm.Name));

            CreateMap<RegisterationFormSubmittionGetDTO ,RegisterationFormSubmittion>();
            CreateMap<RegisterationFormSubmittion, RegisterationFormSubmittionGetDTO>()
              .ForMember(dest => dest.RegistrationFormParentName, opt => opt.MapFrom(src => src.RegisterationFormParent.StudentName))
              .ForMember(dest => dest.CategoryFieldName, opt => opt.MapFrom(src => src.CategoryField.EnName))
              .ForMember(dest => dest.CategoryFieldOrderInForm, opt => opt.MapFrom(src => src.CategoryField.OrderInForm))
              .ForMember(dest => dest.RegistrationCategoryID, opt => opt.MapFrom(src => src.CategoryField.RegistrationCategory.ID))
              .ForMember(dest => dest.RegistrationCategoryName, opt => opt.MapFrom(src => src.CategoryField.RegistrationCategory.EnName))
              .ForMember(dest => dest.RegistrationCategoryOrderInForm, opt => opt.MapFrom(src => src.CategoryField.RegistrationCategory.OrderInForm))
              .ForMember(dest => dest.SelectedFieldOptionName, opt => opt.MapFrom(src => src.FieldOption.Name));

            CreateMap<RegisterationFormParentPutDTO, RegisterationFormParent>();

            CreateMap<InterviewTime, InterviewTimeTableGetDTO>()
               .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name));
            CreateMap<InterviewTimeTablePutDTO, InterviewTime>();

            CreateMap<RegisterationFormInterview, RegisterationFormInterviewGetDTO>()
               .ForMember(dest => dest.InterviewStateName, opt => opt.MapFrom(src => src.InterviewState.Name))
               .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.RegisterationFormParent.StudentName))
               .ForMember(dest => dest.StudentEnName, opt => opt.MapFrom(src => src.RegisterationFormParent.StudentEnName))
               .ForMember(dest => dest.StudentArName, opt => opt.MapFrom(src => src.RegisterationFormParent.StudentArName))
               .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.RegisterationFormParent.Phone))
               .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.RegisterationFormParent.Email))
               .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.RegisterationFormParent.GradeID))
               .ForMember(dest => dest.InterviewTimeDate, opt => opt.MapFrom(src => src.InterviewTime.Date));
            CreateMap<RegistrationFormInterviewPutDTO, RegisterationFormInterview>();
            CreateMap<RegistrationFormInterviewPutByParentDTO, RegisterationFormInterview>();
            CreateMap<RegisterationFormInterviewAddDTO, RegisterationFormInterview>();

            CreateMap<RegisterationFormParent, RegistrationFormParentIncludeRegistrationFormInterviewGetDTO>()
               .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Parent.en_name))
               .ForMember(dest => dest.RegistrationFormName, opt => opt.MapFrom(src => src.RegistrationForm.Name));
       
            CreateMap<RegisterationFormTest, RegisterationFormTestGetDTO>()
              .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.RegisterationFormParent.StudentName))
              .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.TestState.Name))
              .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Test.subject.en_name))
              .ForMember(dest => dest.TotalMark, opt => opt.MapFrom(src => src.Test.TotalMark))
              .ForMember(dest => dest.TestName, opt => opt.MapFrom(src => src.Test.Title));

            CreateMap<RegisterationFormTestEditDTO, RegisterationFormTest>();

            CreateMap<RegisterationFormTestAnswer, RegisterationFormTestAnswerGetDTO>()
              .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.RegisterationFormParent.StudentName))
              .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Question.Description))
              .ForMember(dest => dest.Video, opt => opt.MapFrom(src => src.Question.Video))
              .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.Question.Image))
              .ForMember(dest => dest.CorrectAnswerID, opt => opt.MapFrom(src => src.Question.CorrectAnswerID))
              .ForMember(dest => dest.CorrectAnswerName, opt => opt.MapFrom(src => src.Question.mCQQuestionOption.Name))
              .ForMember(dest => dest.QuestionTypeID, opt => opt.MapFrom(src => src.Question.QuestionType.ID))
              .ForMember(dest => dest.QuestionTypeName, opt => opt.MapFrom(src => src.Question.QuestionType.Name))
              .ForMember(dest => dest.QuestionTypeID, opt => opt.MapFrom(src => src.Question.QuestionType.ID))
              .ForMember(dest => dest.AnswerName, opt => opt.MapFrom(src => src.MCQQuestionOption.Name));

            CreateMap<MCQQuestionOption, MCQQuestionOptionGetDto>();

            CreateMap<RegisterationFormTestAnswerAddDTO, RegisterationFormTestAnswer>();

            CreateMap<RegisterationFormState, RegistrationFormStateGetDTO>();
            CreateMap<InterviewState, InterviewStateGetDTO>();

            CreateMap<ParentDTO, Parent>();

            CreateMap<Department, DepartmentGetDTO>();
            CreateMap<DepartmentGetDTO, Department>();
            CreateMap<DepartmentAddDto, Department>();

            CreateMap<JobCategory, JobCategoryGetDto>();
            CreateMap<JobCategoryGetDto, JobCategory>();
            CreateMap<JobCategoryAddDto, JobCategory>();

            CreateMap<AcademicDegree, AcademicDegreeGetDTO>();
            CreateMap<AcademicDegreeGetDTO, AcademicDegree>();
            CreateMap<AcademicDegreeAddDTO, AcademicDegree>();

            CreateMap<ReasonForLeavingWork, ReasonsForLeavingWorkGetDTO>();
            CreateMap<ReasonsForLeavingWorkGetDTO, ReasonForLeavingWork>();
            CreateMap<ReasonsForLeavingWorkAddDTO, ReasonForLeavingWork>();

            CreateMap<AccountingEntriesDocType, AccountingEntriesDocTypeGetDTO>();
            CreateMap<AccountingEntriesDocTypeGetDTO, AccountingEntriesDocType>();
            CreateMap<AccountingEntriesDocTypesAddDto, AccountingEntriesDocType>();

            CreateMap<Job, JobGetDTO>()
              .ForMember(dest => dest.JobCategoryName, opt => opt.MapFrom(src => src.JobCategory.Name));
            CreateMap<JobGetDTO, Job>();
            CreateMap<JobAddDto, Job>();
             
            CreateMap<Debit, DebitGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<DebitAddDTO, Debit>();
            CreateMap<DebitPutDTO, Debit>();

            CreateMap<Credit, CreditGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<CreditAddDTO, Credit>();
            CreateMap<CreditPutDTO, Credit>();

            CreateMap<Save, SaveGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<SaveAddDTO, Save>();
            CreateMap<SavePutDTO, Save>();

            CreateMap<Income, IncomeGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<IncomeAddDTO, Income>();
            CreateMap<IncomePutDTO, Income>();

            CreateMap<Outcome, OutcomeGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<OutcomeAddDTO, Outcome>();
            CreateMap<OutcomePutDTO, Outcome>();

            CreateMap<Asset, AssetGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<AssetAddDTO, Asset>();
            CreateMap<AssetPutDTO, Asset>();

            CreateMap<TuitionFeesType, TuitionFeesTypeGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<TuitionFeesTypeAddDTO, TuitionFeesType>();
            CreateMap<TuitionFeesTypePutDTO, TuitionFeesType>();

            CreateMap<Supplier, SupplierGetDTO>()
               .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<SupplierAddDTO, Supplier>();
            CreateMap<SupplierGetDTO, Supplier>();

            CreateMap<Bank, BankGetDTO>()
               .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<BankAddDto, Bank>();
            CreateMap<BankGetDTO, Bank>();

            CreateMap<TuitionDiscountType, TuitionDiscountTypeGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name));
            CreateMap<TuitionDiscountTypePutDTO, TuitionDiscountType>();
            CreateMap<TuitionDiscountTypeAddDTO, TuitionDiscountType>();

            CreateMap<AccountingTreeChartAddDTO, AccountingTreeChart>();
            
            CreateMap<AccountingTreeChart, AccountingTreeChartGetDTO>()
                .ForMember(dest => dest.MainAccountNumberName, opt => opt.MapFrom(src => src.Parent.Name))
                .ForMember(dest => dest.EndTypeName, opt => opt.MapFrom(src => src.EndType.Name))
                .ForMember(dest => dest.LinkFileName, opt => opt.MapFrom(src => src.LinkFile.Name))
                .ForMember(dest => dest.SubTypeName, opt => opt.MapFrom(src => src.SubType.Name))
                .ForMember(dest => dest.MotionTypeName, opt => opt.MapFrom(src => src.MotionType.Name))
                ;

            CreateMap<EmployeeAccountingPut, Employee>();
            CreateMap<Employee, EmployeeAccountingGetDTO>()
                .ForMember(dest => dest.AccountNumberName, opt => opt.MapFrom(src => src.AccountNumber.Name))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
                .ForMember(dest => dest.JobName, opt => opt.MapFrom(src => src.Job.Name))
                .ForMember(dest => dest.JobCategoryID, opt => opt.MapFrom(src => src.Job.JobCategoryID))
                .ForMember(dest => dest.ReasonForLeavingWork, opt => opt.MapFrom(src => src.ReasonForLeavingWork.Name)) 
                .ForMember(dest => dest.AcademicDegreeName, opt => opt.MapFrom(src => src.AcademicDegree.Name));

            CreateMap<Country, CountriesGetDTO>();
            CreateMap<Nationality, NationalityGetDTO>();
            CreateMap<Days, DayGetDTO>();
            CreateMap<ReasonForLeavingWork, ReasonForLeavingWorkGetDTO>();
            CreateMap<AccountingStudentPutDTO, Student>();


            CreateMap<SubType, SubTypeGetDTO>();
            CreateMap<MotionType, MotionTypeGetDTO1>();
            CreateMap<EndType, EndTypeGetDTO>();
            CreateMap<LinkFile, LinkFileGetDTO>();

            CreateMap<EmployeeStudent, EmployeeStudentGetDTO>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.employee.en_name))
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.en_name));
            CreateMap<EmployeeStudentAddDTO, EmployeeStudent>();

            CreateMap<ReceivableDocType, ReceivableDocTypeGetDTO>();
            CreateMap<ReceivableDocTypePutDTO, ReceivableDocType>();
            CreateMap<ReceivableDocTypeAddDTO, ReceivableDocType>();
 
            CreateMap<FeesActivation, FeesActivationGetDTO>()
                .ForMember(dest => dest.FeeActivationID, opt => opt.MapFrom(src => src.ID))
                .ForMember(dest => dest.FeeTypeName, opt => opt.MapFrom(src => src.TuitionFeesType.Name))
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name))
                .ForMember(dest => dest.FeeDiscountTypeName, opt => opt.MapFrom(src => src.TuitionDiscountType.Name));
            CreateMap<FeesActivationAdddDTO, FeesActivation>();
            CreateMap<FeesActivationGetDTO, FeesActivation>();


            CreateMap<InstallmentDeductionMaster, InstallmentDeductionMasterGetDTO>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.en_name))
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.en_name));
            CreateMap<InstallmentDeductionMasterGetDTO, InstallmentDeductionMaster>();
            CreateMap<InstallmentDeductionMasterAddDTO, InstallmentDeductionMaster>();

            CreateMap<InstallmentDeductionDetails, InstallmentDeductionDetailsGetDTO>()
               .ForMember(dest => dest.FeeTypeName, opt => opt.MapFrom(src => src.TuitionFeesType.Name));
            CreateMap<InstallmentDeductionDetailsGetDTO, InstallmentDeductionDetails>();
            CreateMap<InstallmentDeductionDetailsAddDTO, InstallmentDeductionDetails>();

            CreateMap<PayableDocType, PayableDocTypeGetDTO>();
            CreateMap<PayableDocTypePutDTO, PayableDocType>();
            CreateMap<PayableDocTypeAddDTO, PayableDocType>();

            CreateMap<ReceivableMaster, ReceivableMasterGetDTO>()
                .ForMember(dest => dest.ReceivableDocTypesName, opt => opt.MapFrom(src => src.ReceivableDocType.Name))
                .ForMember(dest => dest.LinkFileName, opt => opt.MapFrom(src => src.LinkFile.Name))
                .ForMember(dest => dest.BankOrSaveName, opt => opt.Ignore()); 
            CreateMap<ReceivableMasterAddDTO, ReceivableMaster>();
            CreateMap<ReceivablePutDTO, ReceivableMaster>();

            CreateMap<PayableMaster, PayableMasterGetDTO>()
                .ForMember(dest => dest.PayableDocTypesName, opt => opt.MapFrom(src => src.PayableDocType.Name))
                .ForMember(dest => dest.LinkFileName, opt => opt.MapFrom(src => src.LinkFile.Name))
                .ForMember(dest => dest.BankOrSaveName, opt => opt.Ignore()); 
            CreateMap<PayableMasterAddDTO, PayableMaster>();
            CreateMap<PayableMasterPutDTO, PayableMaster>();

            CreateMap<AccountingEntriesMaster, AccountingEntriesMasterGetDTO>()
                .ForMember(dest => dest.AccountingEntriesDocTypeName, opt => opt.MapFrom(src => src.AccountingEntriesDocType.Name));
            CreateMap<AccountingEntriesMasterPutDTO, AccountingEntriesMaster>();
            CreateMap<AccountingEntriesMasterAddDTO, AccountingEntriesMaster>();

            CreateMap<ReceivableDetails, ReceivableDetailsGetDTO>();
            CreateMap<ReceivableDetailsAddDTO, ReceivableDetails>();
            CreateMap<ReceivableDetailsPutDTO, ReceivableDetails>();
            
            CreateMap<PayableDetails, PayableDetailsGetDTO>();
            CreateMap<PayableDetailsAddDTO, PayableDetails>();
            CreateMap<PayableDetailsPutDTO, PayableDetails>();

            CreateMap<AccountingEntriesDetails, AccountingEntriesDetailsGetDTO>()
                .ForMember(dest => dest.AccountingTreeChartName, opt => opt.MapFrom(src => src.AccountingTreeChart.Name));
            CreateMap<AccountingEntriesDetailsAddDTO, AccountingEntriesDetails>();
            CreateMap<AccountingEntriesDetailsPutDTO, AccountingEntriesDetails>();
            //CreateMap<StudentAcademicYear, StudentAcademicYearGetDTO>()
            //   .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Grade.Name))
            //   .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.School.Name))
            //   .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.User_Name))
            //   .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.Classroom.Name))
            //   .ForMember(dest => dest.SectionId, opt => opt.MapFrom(src => src.Grade.Section.ID))
            //   .ForMember(dest => dest.SectionName, opt => opt.MapFrom(src => src.Grade.Section.Name));

            CreateMap<Store, InventoryStoreGetDTO>();
            CreateMap<InventoryStoreAddDTO, Store>();
            CreateMap<StoreCategoriesEditDTO, Store>();
            CreateMap<StoreCategories, InventoryCategoriesGetDto>()
               .ForMember(dest => dest.ID, opt => opt.MapFrom(src => src.InventoryCategories.ID))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.InventoryCategories.Name));


            CreateMap<InventoryCategories, InventoryCategoriesGetDto>();
            CreateMap<InventoryCategoriesAddDTO, InventoryCategories>();
            CreateMap<InventoryCategoriesPutDTO, InventoryCategories>();
            CreateMap<StoreCategories, InventoryCategoriesGetDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.InventoryCategories.Name))
                .ForMember(dest => dest.ID, opt => opt.MapFrom(src => src.InventoryCategories.ID));


            CreateMap<InventorySubCategories, InventorySubCategoriesGetDTO>()
                .ForMember(dest => dest.InventoryCategoriesName, opt => opt.MapFrom(src => src.InventoryCategories.Name));
            CreateMap<InventorySubCategoriesAddDTO, InventorySubCategories>();
            CreateMap<InventorySubCategoriesPutDTO, InventorySubCategories>();

            CreateMap<ShopItem, ShopItemGetDTO>()
                .ForMember(dest => dest.GenderName, opt => opt.MapFrom(src => src.Gender.Name)) 
                .ForMember(dest => dest.InventorySubCategoriesName, opt => opt.MapFrom(src => src.InventorySubCategories.Name)) 
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.School.Name)) 
                .ForMember(dest => dest.InventoryCategoriesID, opt => opt.MapFrom(src => src.InventorySubCategories.InventoryCategoriesID)) 
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Grade.Name));
            CreateMap<ShopItemAddDTO, ShopItem>();
            CreateMap<ShopItemPutDTO, ShopItem>();

            CreateMap<ShopItemColor, ShopItemColorGetDTO>()
                .ForMember(dest => dest.ShopItemName, opt => opt.MapFrom(src => src.ShopItem.EnName));
            CreateMap<ShopItemColorAddDTO, ShopItemColor>();

            CreateMap<ShopItemSize, ShopItemSizeGetDTO>()
                .ForMember(dest => dest.ShopItemName, opt => opt.MapFrom(src => src.ShopItem.EnName));
            CreateMap<ShopItemSizeAddDTO, ShopItemSize>();


            CreateMap<InventoryMaster, InventoryMasterGetDTO>()  
                 .ForMember(dest => dest.SaveName, opt => opt.MapFrom(src => src.Save != null ? src.Save.Name : null))
                 .ForMember(dest => dest.BankName, opt => opt.MapFrom(src => src.Bank != null ? src.Bank.Name : null))
                 .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.School.Name))
                 .ForMember(dest => dest.SchoolPCName, opt => opt.MapFrom(src => src.SchoolPCs.PCName))
                 .ForMember(dest => dest.FlagArName, opt => opt.MapFrom(src => src.InventoryFlags.arName))
                 .ForMember(dest => dest.FlagEnName, opt => opt.MapFrom(src => src.InventoryFlags.enName))
                 .ForMember(dest => dest.FlagArTitle, opt => opt.MapFrom(src => src.InventoryFlags.ar_Title))
                 .ForMember(dest => dest.FlagEnTitle, opt => opt.MapFrom(src => src.InventoryFlags.en_Title))
                 .ForMember(dest => dest.FlagValue, opt => opt.MapFrom(src => src.InventoryFlags.FlagValue))
                 .ForMember(dest => dest.ItemInOut, opt => opt.MapFrom(src => src.InventoryFlags.ItemInOut ))
                 .ForMember(dest => dest.StoreName, opt => opt.MapFrom(src => src.Store != null ? src.Store.Name : null))
                 .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student != null ? src.Student.en_name : null))
                 .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier != null ? src.Supplier.Name : null))
                 .ForMember(dest => dest.QrImage, opt => opt.MapFrom(src => Convert.ToBase64String(src.QrImage)));

            CreateMap<InventoryMasterAddDTO, InventoryMaster>()
                       .ForMember(dest => dest.InventoryDetails, opt => opt.MapFrom(src => src.InventoryDetails));
            CreateMap<InventoryDetailsAddDTO, InventoryDetails>();
            CreateMap<InventoryMasterEditDTO, InventoryMaster>();

            CreateMap<InventoryDetails, InventoryDetailsGetDTO>()
                .ForMember(dest => dest.BarCode, opt => opt.MapFrom(src => src.ShopItem.BarCode))
                .ForMember(dest => dest.ShopItemName, opt => opt.MapFrom(src => src.ShopItem.EnName))
                .ForMember(dest => dest.InvoiceNumber, opt => opt.MapFrom(src => src.InventoryMaster.InvoiceNumber))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.ShopItem.InventorySubCategories.InventoryCategoriesID))
                .ForMember(dest => dest.SubCategoryId, opt => opt.MapFrom(src => src.ShopItem.InventorySubCategoriesID));

            CreateMap<InventoryDetailsGetDTO, InventoryDetails>();
            CreateMap<Gender, GenderGetDTO>();
            CreateMap<InventoryDetailsPutDTO, InventoryDetails>();

            CreateMap<InventoryFlags, InventoryFlagGetDTO>();
            CreateMap<Cart_ShopItem, Cart_ShopItemGetDTO>()
                .ForMember(dest => dest.ShopItemEnName, opt => opt.MapFrom(src => src.ShopItem.EnName))
                .ForMember(dest => dest.ShopItemArName, opt => opt.MapFrom(src => src.ShopItem.ArName))
                .ForMember(dest => dest.ShopItemLimit, opt => opt.MapFrom(src => src.ShopItem.Limit))
                .ForMember(dest => dest.SalesPrice, opt => opt.MapFrom(src => src.ShopItem.SalesPrice))
                .ForMember(dest => dest.VATForForeign, opt => opt.MapFrom(src => src.ShopItem.VATForForeign))
                .ForMember(dest => dest.MainImage, opt => opt.MapFrom(src => src.ShopItem.MainImage))
                .ForMember(dest => dest.ShopItemSizeName, opt => opt.MapFrom(src => src.ShopItemSize.Name))
                .ForMember(dest => dest.ShopItemColorName, opt => opt.MapFrom(src => src.ShopItemColor.Name));

            CreateMap<Cart, CartGetDTO>();

            CreateMap<HygieneTypeAddDTO, HygieneType>();
            CreateMap<HygieneType, HygieneTypeGetDTO>()
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<HygieneTypePutDTO, HygieneType>();

            CreateMap<DiagnosisAddDTO, Diagnosis>();
            CreateMap<Diagnosis, DiagnosisGetDTO>()
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<DiagnosisPutDTO, Diagnosis>();

            CreateMap<DrugAddDTO, Drug>();
            CreateMap<Drug, DrugGetDTO>()
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<DrugPutDTO, Drug>();

            CreateMap<DoseAddDTO, Dose>();
            CreateMap<Dose, DoseGetDTO>()
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<DosePutDTO, Dose>();

            CreateMap<HygieneFormAddDTO, HygieneForm>();
            CreateMap<HygieneForm, HygieneFormGetDTO>()
                .ForMember(dest => dest.School, opt => opt.MapFrom(src => src.School.Name))
                .ForMember(dest => dest.Grade, opt => opt.MapFrom(src => src.Grade.Name))
                .ForMember(dest => dest.ClassRoom, opt => opt.MapFrom(src => src.Classroom.Name))
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<HygieneFormPutDTO, HygieneForm>()
                .ForMember(dest => dest.StudentHygieneTypes, opt => opt.Ignore());

            CreateMap<StudentHygieneTypes, StudentHygieneTypesGetDTO>()
                .ForMember(dest => dest.Student, opt => opt.MapFrom(src => src.Student.en_name));
            CreateMap<StudentHygieneTypesAddDTO, StudentHygieneTypes>(); 

            CreateMap<FollowUpAddDTO, FollowUp>();
            CreateMap<FollowUp, FollowUpGetDTO>()
                .ForMember(dest => dest.School, opt => opt.MapFrom(src => src.School.Name))
                .ForMember(dest => dest.Grade, opt => opt.MapFrom(src => src.Grade.Name))
                .ForMember(dest => dest.Classroom, opt => opt.MapFrom(src => src.Classroom.Name))
                .ForMember(dest => dest.Student, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.Diagnosis, opt => opt.MapFrom(src => src.Diagnosis.Name))
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<FollowUpPutDTO, FollowUp>();

            CreateMap<FollowUpDrugAddDTO, FollowUpDrug>();
            CreateMap<FollowUpDrug, FollowUpDrugGetDTO>()
                .ForMember(dest => dest.Drug, opt => opt.MapFrom(src => src.Drug.Name))
                .ForMember(dest => dest.Dose, opt => opt.MapFrom(src => src.Dose.DoseTimes))
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<FollowUpDrugPutDTO, FollowUpDrug>();

            CreateMap<MedicalHistoryAddByDoctorDTO, MedicalHistory>();
            CreateMap<MedicalHistory, MedicalHistoryGetByDoctorDTO>()
                .ForMember(dest => dest.School, opt => opt.MapFrom(src => src.School.Name))
                .ForMember(dest => dest.Grade, opt => opt.MapFrom(src => src.Grade.Name))
                .ForMember(dest => dest.ClassRoom, opt => opt.MapFrom(src => src.Classroom.Name))
                .ForMember(dest => dest.Student, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));

            CreateMap<MedicalHistoryPutByDoctorDTO, MedicalHistory>();

            CreateMap<MedicalHistoryAddByParentDTO, MedicalHistory>();
            CreateMap<MedicalHistory, MedicalHistoryGetByParentDTO>()
                .ForMember(dest => dest.School, opt => opt.MapFrom(src => src.School.Name))
                .ForMember(dest => dest.Grade, opt => opt.MapFrom(src => src.Grade.Name))
                .ForMember(dest => dest.ClassRoom, opt => opt.MapFrom(src => src.Classroom.Name))
                .ForMember(dest => dest.Student, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByParent.en_name));
            CreateMap<MedicalHistoryPutByParentDTO, MedicalHistory>();

            CreateMap<Order, OrderGetDTO>()
                .ForMember(dest => dest.OrderStateName, opt => opt.MapFrom(src => src.OrderState.Name));

            CreateMap<OrderState, OrderStateGetDTO>();

            CreateMap<CartShopItemAddDTO, Cart_ShopItem>();
            CreateMap<CartShopItemPutDTO, Cart_ShopItem>();

            CreateMap<StockingDetails, StockingDetailsGetDto>()
                .ForMember(dest => dest.BarCode, opt => opt.MapFrom(src => src.ShopItem.BarCode))
                .ForMember(dest => dest.ShopItemName, opt => opt.MapFrom(src => src.ShopItem.EnName));
            CreateMap<StockingDetailsGetDto, StockingDetails>();
            CreateMap<StockingDetailsAddDto, StockingDetails>();

            CreateMap<Stocking, StockingGetDto>()
                 .ForMember(dest => dest.StoreName, opt => opt.MapFrom(src => src.Store != null ? src.Store.Name : null));
            CreateMap<StockingAddDTO, Stocking>();
            CreateMap<StockingGetDto, Stocking>();

            CreateMap<EvaluationTemplate, EvaluationTemplateGetDTO>();
            CreateMap<EvaluationTemplateAddDTO, EvaluationTemplate>();
            CreateMap<EvaluationTemplateEditDTO, EvaluationTemplate>();

            CreateMap<EvaluationTemplateGroup, EvaluationTemplateGroupDTO>();
            CreateMap<EvaluationTemplateGroupAddDTO, EvaluationTemplateGroup>();
            CreateMap<EvaluationTemplateGroupEditDTO, EvaluationTemplateGroup>();

            CreateMap<EvaluationTemplateGroupQuestion, EvaluationTemplateGroupQuestionGetDTO>();
            CreateMap<EvaluationTemplateGroupQuestionEditDTO, EvaluationTemplateGroupQuestion>();
            CreateMap<EvaluationTemplateGroupQuestionAddDTO, EvaluationTemplateGroupQuestion>();


            CreateMap<EvaluationBookCorrection, EvaluationBookCorrectionGetDTO>();
            CreateMap<EvaluationBookCorrectionAddDTO, EvaluationBookCorrection>();
            CreateMap<EvaluationBookCorrectionEditDTO, EvaluationBookCorrection>();

            CreateMap<EvaluationEmployeeStudentBookCorrectionAddDTO, EvaluationEmployeeStudentBookCorrection>();
            CreateMap<EvaluationEmployeeQuestionAddDTO, EvaluationEmployeeQuestion>();
            CreateMap<EvaluationEmployeeAddDTO, EvaluationEmployee>();

            CreateMap<EvaluationEmployee, EvaluationEmployeeGetDTO>()
                 .ForMember(dest => dest.EvaluatorArabicName, opt => opt.MapFrom(src => src.Evaluator.ar_name))
                 .ForMember(dest => dest.EvaluatorEnglishName, opt => opt.MapFrom(src => src.Evaluator.en_name))
                 .ForMember(dest => dest.EvaluatedArabicName, opt => opt.MapFrom(src => src.Evaluated.ar_name))
                 .ForMember(dest => dest.EvaluatedEnglishName, opt => opt.MapFrom(src => src.Evaluated.en_name))
                 .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name))
                 .ForMember(dest => dest.EvaluationTemplateArabicTitle, opt => opt.MapFrom(src => src.EvaluationTemplate.ArabicTitle))
                 .ForMember(dest => dest.EvaluationTemplateEnglishTitle, opt => opt.MapFrom(src => src.EvaluationTemplate.EnglishTitle));
            
            CreateMap<EvaluationEmployee, EvaluationEmployeeWithQuestionsGetDTO>()
                 .ForMember(dest => dest.EvaluatorArabicName, opt => opt.MapFrom(src => src.Evaluator.ar_name))
                 .ForMember(dest => dest.EvaluatorEnglishName, opt => opt.MapFrom(src => src.Evaluator.en_name))
                 .ForMember(dest => dest.EvaluatedArabicName, opt => opt.MapFrom(src => src.Evaluated.ar_name))
                 .ForMember(dest => dest.EvaluatedEnglishName, opt => opt.MapFrom(src => src.Evaluated.en_name))
                 .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name))
                 .ForMember(dest => dest.EvaluationTemplateArabicTitle, opt => opt.MapFrom(src => src.EvaluationTemplate.ArabicTitle))
                 .ForMember(dest => dest.EvaluationTemplateEnglishTitle, opt => opt.MapFrom(src => src.EvaluationTemplate.EnglishTitle));

            CreateMap<EvaluationEmployeeStudentBookCorrection, EvaluationEmployeeStudentBookCorrectionsGetDTO>()
                 .ForMember(dest => dest.StudentArabicName, opt => opt.MapFrom(src => src.Student.ar_name))
                 .ForMember(dest => dest.StudentEnglishName, opt => opt.MapFrom(src => src.Student.en_name))
                 .ForMember(dest => dest.EvaluationBookCorrectionEnglishName, opt => opt.MapFrom(src => src.EvaluationBookCorrection.EnglishName))
                 .ForMember(dest => dest.EvaluationBookCorrectionArabicName, opt => opt.MapFrom(src => src.EvaluationBookCorrection.ArabicName));

            CreateMap<EvaluationEmployeeQuestion, EvaluationEmployeeQuestionGetDTO>()
                 .ForMember(dest => dest.QuestionArabicTitle, opt => opt.MapFrom(src => src.EvaluationTemplateGroupQuestion.ArabicTitle))
                 .ForMember(dest => dest.QuestionEnglishTitle, opt => opt.MapFrom(src => src.EvaluationTemplateGroupQuestion.EnglishTitle));

            CreateMap<EvaluationTemplateGroup, EvaluationEmployeeQuestionGroupGetDTO>();

            CreateMap<SchoolPCsAddDTO, SchoolPCs>();
            CreateMap<SchoolPCsPutDTO, SchoolPCs>();
            CreateMap<SchoolPCs, SchoolPCsGetDTO>()
                .ForMember(dest => dest.School, opt => opt.MapFrom(src => src.School.Name));

            CreateMap<Medal, MedalGetDTO>();
            CreateMap<MedalAddDto, Medal>();
            CreateMap<MedalEditDTO, Medal>();

            CreateMap<LessonActivityType, LessonActivityTypeGetDTO>();
            CreateMap<LessonActivityTypeAddDTO, LessonActivityType>();
            CreateMap<LessonActivityTypeEditDto, LessonActivityType>();

            CreateMap<LessonResourceType, LessonResourceTypeGetDTo>();
            CreateMap<LessonResourceTypeAddDTO, LessonResourceType>();
            CreateMap<LessonResourceTypeEditDTO, LessonResourceType>();

            CreateMap<PerformanceType, PerformanceTypeGetDTO>();
            CreateMap<PerformanceTypeAddDTO, PerformanceType>();
            CreateMap<PerformanceTypeEditDTO, PerformanceType>();

            CreateMap<StudentPerformance, StudentPerformanceAddDTO>();

            CreateMap<LessonLive, LessonLiveGetDTO>()
                 .ForMember(dest => dest.WeekDayName, opt => opt.MapFrom(src => src.WeekDay.Name))
                 .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
                 .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name))
                 .ForMember(dest => dest.AcademicYearID, opt => opt.MapFrom(src => src.Classroom.AcademicYearID))
                 .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name));

            CreateMap<LessonLiveAddDTO, LessonLive>();
            CreateMap<LessonLivePutDTO, LessonLive>();

            CreateMap<Lesson, LessonGetDTO>() 
                 .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
                 .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name))
                 .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Subject.GradeID))
                 .ForMember(dest => dest.SemesterWorkingWeekEnglishName, opt => opt.MapFrom(src => src.SemesterWorkingWeek.EnglishName))
                 .ForMember(dest => dest.SemesterWorkingWeekArabicName, opt => opt.MapFrom(src => src.SemesterWorkingWeek.ArabicName))
                 .ForMember(dest => dest.AcademicYearID, opt => opt.MapFrom(src => src.SemesterWorkingWeek.Semester.AcademicYearID))
                 .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.SemesterWorkingWeek.Semester.AcademicYear.SchoolID))
                 .ForMember(dest => dest.SemesterID, opt => opt.MapFrom(src => src.SemesterWorkingWeek.SemesterID));
            CreateMap<LessonAddDTO, Lesson>();
            CreateMap<LessonPutDTO, Lesson>();

            CreateMap<Tag, TagGetDTO>();
            CreateMap<Tag, TagGetDTO>();

            CreateMap<LessonActivity, LessonActivityGetDTO>()
                 .ForMember(dest => dest.LessonEnglishTitle, opt => opt.MapFrom(src => src.Lesson.EnglishTitle))
                 .ForMember(dest => dest.LessonArabicTitle, opt => opt.MapFrom(src => src.Lesson.ArabicTitle))
                 .ForMember(dest => dest.LessonActivityTypeEnglishName, opt => opt.MapFrom(src => src.LessonActivityType.EnglishName)) 
                 .ForMember(dest => dest.LessonActivityTypeArabicName, opt => opt.MapFrom(src => src.LessonActivityType.ArabicName));
            CreateMap<LessonActivityAddDTO, LessonActivity>();
            CreateMap<LessonActivityPutDTO, LessonActivity>();

            CreateMap<StudentPerformance, StudentPerformanceGetDTO>()
                 .ForMember(dest => dest.PerformanceTypeName, opt => opt.MapFrom(src => src.PerformanceType.EnglishName));

            CreateMap<StudentPerformanceAddDTO, StudentPerformance>();

            CreateMap<StudentMedal, StudentMedalGetDTO>()
                 .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.en_name))
                 .ForMember(dest => dest.MedalName, opt => opt.MapFrom(src => src.Medal.EnglishName))
                 .ForMember(dest => dest.InsertedByUserName, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name))
                 .ForMember(dest => dest.ImageLink, opt => opt.MapFrom(src => src.Medal.ImageLink));

            CreateMap<StudentMedalAddDTO, StudentMedal>();

            CreateMap<LessonResource, LessonResourceGetDTO>()
                 .ForMember(dest => dest.LessonEnglishTitle, opt => opt.MapFrom(src => src.Lesson.EnglishTitle))
                 .ForMember(dest => dest.LessonArabicTitle, opt => opt.MapFrom(src => src.Lesson.ArabicTitle))
                 .ForMember(dest => dest.LessonResourceTypeEnglishName, opt => opt.MapFrom(src => src.LessonResourceType.EnglishName))
                 .ForMember(dest => dest.LessonResourceTypeArabicName, opt => opt.MapFrom(src => src.LessonResourceType.ArabicName));
            CreateMap<LessonResourceAddDTO, LessonResource>();
            CreateMap<LessonResourcePutDTO, LessonResource>();

            CreateMap<SemesterWorkingWeek, SemesterWorkingWeekGetDTO>()
               .ForMember(dest => dest.SemesterName, opt => opt.MapFrom(src => src.Semester.Name));
            CreateMap<SemesterWorkingWeekAddDTO, SemesterWorkingWeek>();
            CreateMap<SemesterWorkingWeekPutDTO, SemesterWorkingWeek>();

            CreateMap<DailyPerformanceMaster, DailyPerformanceMasterGetDTO>()
                .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Subject.en_name))
                .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name))
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Subject.Grade.Name));
            CreateMap<DailyPerformanceMasterAddDTO, DailyPerformanceMaster>();
            CreateMap<DailyPerformanceAddDTO, DailyPerformance>();
            CreateMap<DailyPerformance, DailyPerformanceGetDTO>()
               .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.en_name));

            CreateMap<QuestionBank, QuestionBankGetDTO>()
                 .ForMember(dest => dest.LessonName, opt => opt.MapFrom(src => src.Lesson.EnglishTitle))
                 .ForMember(dest => dest.SubjectID, opt => opt.MapFrom(src => src.Lesson.SubjectID))
                 .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Lesson.Subject.en_name))
                 .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.Lesson.Subject.Grade.Section.SchoolID))
                 .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.Lesson.Subject.Grade.Section.school.Name))
                 .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Lesson.Subject.GradeID))
                 .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Lesson.Subject.Grade.Name))
                 .ForMember(dest => dest.BloomLevelName, opt => opt.MapFrom(src => src.BloomLevel.EnglishName))
                 .ForMember(dest => dest.DokLevelName, opt => opt.MapFrom(src => src.DokLevel.EnglishName))
                 .ForMember(dest => dest.QuestionBankOptionsDTO, opt => opt.MapFrom(src => src.QuestionBankOptions))
                 .ForMember(dest => dest.SubBankQuestionsDTO, opt => opt.MapFrom(src => src.SubBankQuestions))
                 .ForMember(dest => dest.QuestionTypeName, opt => opt.MapFrom(src => src.QuestionType.Name));
            CreateMap<QuestionBankEditDTO, QuestionBank>();
            CreateMap<DTO.LMS.QuestionBankAddDTO, QuestionBank>();

            CreateMap<QuestionBankOptionAddDTO, QuestionBankOption>();
            CreateMap<QuestionBankOption, QuestionBankOptionAddDTO>();
            CreateMap<SubBankQuestion, SubBankQuestionAddDTO>();
            CreateMap<SubBankQuestionAddDTO, SubBankQuestion>();

            CreateMap<BloomLevel, BloomLevelGetDTO>();
            CreateMap<DokLevel, DokLevelGetDTO>();
            CreateMap<QuestionBankType, QuestionBankTypeGetDTO>();

            CreateMap<TaxIssuer, TaxIssuerGetDTO>()
                .ForMember(dest => dest.TaxType, opt => opt.MapFrom(src => src.TaxCustomer.Type))
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<TaxIssuerAddDTO, TaxIssuer>();
            CreateMap<TaxIssuerEditDTO, TaxIssuer>();

            CreateMap<WeightType, WeightTypeGetDTO>(); 
            CreateMap<WeightTypeAddDTO, WeightType>(); 
            CreateMap<WeightTypePutDTO, WeightType>(); 

            CreateMap<SubjectWeightType, SubjectWeightTypeGetDTO>()
                .ForMember(dest => dest.WeightTypeEnglishName, opt => opt.MapFrom(src => src.WeightType.EnglishName))
                .ForMember(dest => dest.WeightTypeArabicName, opt => opt.MapFrom(src => src.WeightType.ArabicName))
                .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
                .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name));

            CreateMap<SubjectWeightTypeAddDTO, SubjectWeightType>(); 
            CreateMap<SubjectWeightTypePutDTO, SubjectWeightType>(); 

            CreateMap<SubjectResource, SubjectResourceGetDTO>() 
                .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
                .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name));

            CreateMap<SubjectResourceAddDTO, SubjectResource>();

            CreateMap<CertificatesIssuerName, CertificatesIssuerNameGetDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name));
            CreateMap<CertificatesIssuerNameAddDTO, CertificatesIssuerName>();
            CreateMap<CertificatesIssuerNameEditDTO, CertificatesIssuerName>();

            CreateMap<ClassroomSubject, ClassroomSubjectGetDTO>()
                .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
                .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name))
                .ForMember(dest => dest.TeacherEnglishName, opt => opt.MapFrom(src => src.Teacher.en_name))
                .ForMember(dest => dest.TeacherArabicName, opt => opt.MapFrom(src => src.Teacher.ar_name));
            CreateMap<ClassroomSubjectPutDTO, ClassroomSubject>();
            CreateMap<ClassroomSubjectHidePutDTO, ClassroomSubject>();

            CreateMap<ClassroomSubjectCoTeacher, ClassroomSubjectCoTeacherGetDTO>() 
                .ForMember(dest => dest.CoTeacherEnglishName, opt => opt.MapFrom(src => src.CoTeacher.en_name))
                .ForMember(dest => dest.CoTeacherArabicName, opt => opt.MapFrom(src => src.CoTeacher.ar_name));

            CreateMap<StudentClassroom, StudentClassroomGetDTO>()
                .ForMember(dest => dest.StudentEnglishName, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.StudentArabicName, opt => opt.MapFrom(src => src.Student.ar_name)) 
                .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.Classroom.Name));
            CreateMap<StudentClassroomAddDTO, StudentClassroom>();
            CreateMap<StudentClassroomPutDTO, StudentClassroom>();

            CreateMap<StudentClassroomSubjectHidePutDTO, StudentClassroomSubject>();
            CreateMap<StudentClassroomSubject, StudentClassroomSubjectGetDTO>()
                .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
                .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name));

            CreateMap<Assignment, AssignmentGetDTO>()
               .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.Subject.Grade.Section.SchoolID))
               .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.Subject.Grade.Section.school.Name))
               .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Subject.GradeID))
               .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Subject.Grade.Name))
               .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
               .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name))
               .ForMember(dest => dest.SubjectWeightTypeEnglishName, opt => opt.MapFrom(src => src.SubjectWeightType.WeightType.EnglishName))
               .ForMember(dest => dest.SubjectWeightTypeArabicName, opt => opt.MapFrom(src => src.SubjectWeightType.WeightType.ArabicName))
               .ForMember(dest => dest.AssignmentTypeEnglishName, opt => opt.MapFrom(src => src.AssignmentType.EnglishName))
               .ForMember(dest => dest.InsertedByUserName, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name))
               .ForMember(dest => dest.AssignmentQuestions, opt => opt.MapFrom(src => src.AssignmentQuestions))
               .ForMember(dest => dest.AssignmentTypeArabicName, opt => opt.MapFrom(src => src.AssignmentType.ArabicName));
            CreateMap<AssignmentAddDTO, Assignment>();
            CreateMap<AssignmentPutDTO, Assignment>(); 

            CreateMap<AssignmentStudent, AssignmentStudentGetDTO>()
               .ForMember(dest => dest.OpenDate, opt => opt.MapFrom(src => src.Assignment.OpenDate))
               .ForMember(dest => dest.CutOfDate, opt => opt.MapFrom(src => src.Assignment.CutOfDate))
               .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => src.Assignment.DueDate))
               .ForMember(dest => dest.ClassroomID, opt => opt.MapFrom(src => src.StudentClassroom.ClassID))
               .ForMember(dest => dest.AssignmentDegree, opt => opt.MapFrom(src => src.Assignment.Mark))
               .ForMember(dest => dest.SubjectId, opt => opt.MapFrom(src => src.Assignment.SubjectID))
               .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Assignment.Subject.en_name))
               .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.StudentClassroom.Classroom.Name))
               .ForMember(dest => dest.AssignmentTypeID, opt => opt.MapFrom(src => src.Assignment.AssignmentTypeID))
               .ForMember(dest => dest.StudentEnglishName, opt => opt.MapFrom(src => src.StudentClassroom.Student.en_name))
               .ForMember(dest => dest.StudentArabicName, opt => opt.MapFrom(src => src.StudentClassroom.Student.ar_name))
               .ForMember(dest => dest.StudentID, opt => opt.MapFrom(src => src.StudentClassroom.StudentID));

            CreateMap<AssignmentStudentQuestion, AssignmentStudentQuestionGetDTO>()
                .ForMember(dest => dest.QuestionMark, opt => opt.MapFrom(src => src.QuestionBank.Mark))
                .ForMember(dest => dest.QuestionDesc, opt => opt.MapFrom(src => src.QuestionBank.Description))
                .ForMember(dest => dest.QuestionTypeID, opt => opt.MapFrom(src => src.QuestionBank.QuestionTypeID))
                .ForMember(dest => dest.QuestionCorrectAnswerID, opt => opt.MapFrom(src => src.QuestionBank.CorrectAnswerID))
                .ForMember(dest => dest.QuestionCorrectAnswerName, opt => opt.MapFrom(src => src.QuestionBank.CorrectAnswerName))
                .ForMember(dest => dest.QuestionTypeName, opt => opt.MapFrom(src => src.QuestionBank.QuestionType.Name))
                .ForMember(dest => dest.QuestionImage, opt => opt.MapFrom(src => src.QuestionBank.Image))
                .ForMember(dest => dest.QuestionBankOptions, opt => opt.MapFrom(src => src.QuestionBank.QuestionBankOptions))
                .ForMember(dest => dest.SubBankQuestion, opt => opt.MapFrom(src => src.QuestionBank.SubBankQuestions))
                .ForMember(dest => dest.AssignmentStudentQuestionAnswerOption, opt => opt.MapFrom(src => src.AssignmentStudentQuestionAnswerOption));
            CreateMap<AssignmentStudentQuestionAnswerOption, AssignmentStudentQuestionAnswerOptionGetDTO>();

            CreateMap<AssignmentQuestion, AssignmentQuestionGetDTO>();
            CreateMap<AssignmentType, AssignmentTypeGetDTO>();

            CreateMap<AssignmentStudentAddDTO, AssignmentStudent>();
            CreateMap<AssignmentStudentQuestionAddDTO, AssignmentStudentQuestion>();
            CreateMap<AssignmentStudentQuestionAnswerOptionAddDTO, AssignmentStudentQuestionAnswerOption>();

            CreateMap<Assignment, AssignmentForStudentGetDTO>()
               .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
               .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name))
               .ForMember(dest => dest.SubjectWeightTypeEnglishName, opt => opt.MapFrom(src => src.SubjectWeightType.WeightType.EnglishName))
               .ForMember(dest => dest.SubjectWeightTypeArabicName, opt => opt.MapFrom(src => src.SubjectWeightType.WeightType.ArabicName))
               .ForMember(dest => dest.AssignmentTypeEnglishName, opt => opt.MapFrom(src => src.AssignmentType.EnglishName))
               .ForMember(dest => dest.AssignmentTypeArabicName, opt => opt.MapFrom(src => src.AssignmentType.ArabicName));
            
            CreateMap<AssignmentStudentIsSpecific, AssignmentStudentIsSpecificGetDTO>()
               .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.StudentClassroom.Classroom.Name))
               .ForMember(dest => dest.ClassroomID, opt => opt.MapFrom(src => src.StudentClassroom.ClassID))
               .ForMember(dest => dest.StudentID, opt => opt.MapFrom(src => src.StudentClassroom.StudentID))
               .ForMember(dest => dest.StudentArabicName, opt => opt.MapFrom(src => src.StudentClassroom.Student.en_name))
               .ForMember(dest => dest.StudentEnglishName, opt => opt.MapFrom(src => src.StudentClassroom.Student.ar_name));

            CreateMap<AssignmentStudent, AssignmentForStudentGetDTO>()
               .ForMember(dest => dest.SubjectID, opt => opt.MapFrom(src => src.Assignment.SubjectID))
               .ForMember(dest => dest.SubjectWeightTypeID, opt => opt.MapFrom(src => src.Assignment.SubjectWeightTypeID))
               .ForMember(dest => dest.AssignmentTypeID, opt => opt.MapFrom(src => src.Assignment.AssignmentTypeID))
               .ForMember(dest => dest.AssignmentEnglishName, opt => opt.MapFrom(src => src.Assignment.EnglishName))
               .ForMember(dest => dest.AssignmentArabicName, opt => opt.MapFrom(src => src.Assignment.ArabicName))
               .ForMember(dest => dest.AssignmentDegree, opt => opt.MapFrom(src => src.Assignment.Mark))
               .ForMember(dest => dest.OpenDate, opt => opt.MapFrom(src => src.Assignment.OpenDate))
               .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => src.Assignment.DueDate))
               .ForMember(dest => dest.CutOfDate, opt => opt.MapFrom(src => src.Assignment.CutOfDate))
               .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Assignment.Subject.en_name))
               .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Assignment.Subject.ar_name))
               .ForMember(dest => dest.SubjectWeightTypeEnglishName, opt => opt.MapFrom(src => src.Assignment.SubjectWeightType.WeightType.EnglishName))
               .ForMember(dest => dest.SubjectWeightTypeArabicName, opt => opt.MapFrom(src => src.Assignment.SubjectWeightType.WeightType.ArabicName))
               .ForMember(dest => dest.AssignmentTypeEnglishName, opt => opt.MapFrom(src => src.Assignment.AssignmentType.EnglishName))
               .ForMember(dest => dest.IsVisibleToStudent, opt => opt.MapFrom(src => src.Assignment.IsVisibleToStudent))
               .ForMember(dest => dest.InsertedByUserName, opt => opt.MapFrom(src => src.Assignment.InsertedByEmployee.en_name))
               .ForMember(dest => dest.AssignmentTypeArabicName, opt => opt.MapFrom(src => src.Assignment.AssignmentType.ArabicName));

            // In AutoMapConfig.cs, add mappings if needed for basic properties (custom logic will handle counts in the controller)-77
            CreateMap<Assignment, AssignmentReportDTO>()
                .ForMember(dest => dest.AssignmentName, opt => opt.MapFrom(src => src.EnglishName))
                .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Subject.en_name))
             
                .ForMember(dest => dest.AttendanceNumber, opt => opt.Ignore())
                .ForMember(dest => dest.NumberSuccessful, opt => opt.Ignore())
                .ForMember(dest => dest.NumberFailed, opt => opt.Ignore());
            //-77
            CreateMap<POSAddDTO, ETAPOS>();
            CreateMap<POSEditDTO, ETAPOS>();
            CreateMap<ETAPOS, POSGetDTO>()
                .ForMember(dest => dest.en_name, opt => opt.MapFrom(x => x.InsertedByEmployee.en_name));

            CreateMap<TaxCustomer, TaxCustomerGetDTO>();

            CreateMap<TimeTableAddDTO, TimeTable>();
            CreateMap<TimeTableGetDTO, TimeTable>();
            CreateMap<TimeTable, TimeTableGetDTO>()
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name));
            CreateMap<TimeTableClassroom,TimeTableClassroomGetDTO>()
                .ForMember(dest => dest.TimeTableName, opt => opt.MapFrom(src => src.TimeTable.Name))
                .ForMember(dest => dest.DayName, opt => opt.MapFrom(src => src.Day.Name))
                .ForMember(dest => dest.GradeId, opt => opt.MapFrom(src => src.Classroom.GradeID))
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Classroom.Grade.Name))
                .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name));
            CreateMap<TimeTableSession ,TimeTableSessionGetDto>();
            CreateMap<TimeTableSubject, TimeTableSubjectGetDto>()
                .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Subject.en_name))
                .ForMember(dest => dest.TeacherName, opt => opt.MapFrom(src => src.Teacher.en_name));
 
            CreateMap<AccountingConfigs, AccountingConfigsGetDTO>()
                .ForMember(dest => dest.Sales, opt => opt.MapFrom(src => src.Sales != null ? src.Sales.Name : null))
                .ForMember(dest => dest.SalesReturn, opt => opt.MapFrom(src => src.SalesReturn != null ? src.SalesReturn.Name : null))
                .ForMember(dest => dest.Purchase, opt => opt.MapFrom(src => src.Purchase != null ? src.Purchase.Name : null))
                .ForMember(dest => dest.PurchaseReturn, opt => opt.MapFrom(src => src.PurchaseReturn != null ? src.PurchaseReturn.Name : null));
            CreateMap<AccountingConfigsEditDTO, AccountingConfigs>();

            CreateMap<UserType, UserTypeGetDTO>();

            CreateMap<Announcement, AnnouncementGetDTO>();
            CreateMap<AnnouncementAddDTO, Announcement>();
            CreateMap<AnnouncementPutDTO, Announcement>();

            CreateMap<AnnouncementSharedTo, AnnouncementSharedToGetDTO>()
                .ForMember(dest => dest.UserTypeTitle, opt => opt.MapFrom(src => src.UserType.Title));

            CreateMap<DiscussionRoom, DiscussionRoomGetDTO>();
            CreateMap<DiscussionRoomAdd, DiscussionRoom>();
            CreateMap<DiscussionRoomPutDTO, DiscussionRoom>();

            CreateMap<DiscussionRoomStudentClassroom, DiscussionRoomStudentClassroomGetDTO>();

            CreateMap<RegisteredEmployee, RegisteredEmployeeGetDTO>(); 
            CreateMap<RegisteredEmployeeAddDTO, RegisteredEmployee>(); 

            CreateMap<DutyAddDto, Duty>();
            CreateMap<Duty, DutyGetDto>()
                .ForMember(dest => dest.TeacherEnName, opt => opt.MapFrom(src => src.Teacher.en_name))
                .ForMember(dest => dest.TeacherArName, opt => opt.MapFrom(src => src.Teacher.ar_name))
                .ForMember(dest => dest.Period, opt => opt.MapFrom(src => src.TimeTableSession.PeriodIndex))
                .ForMember(dest => dest.ClassID, opt => opt.MapFrom(src => src.TimeTableSession.TimeTableClassroom.Classroom.ID))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.TimeTableSession.TimeTableClassroom.Classroom.AcademicYear.SchoolID))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.TimeTableSession.TimeTableClassroom.Classroom.AcademicYear.School.Name))
                .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.TimeTableSession.TimeTableClassroom.Classroom.Name));
            CreateMap<DutyEditDTO, Duty>();

            CreateMap<Notification, NotificationGetDTO>()
                .ForMember(dest => dest.UserTypeName, opt => opt.MapFrom(src => src.UserType.Title));
            CreateMap<NotificationAddDTO, Notification>();

            CreateMap<NotificationSharedTo, NotificationSharedToGetDTO>()
                .ForMember(dest => dest.ImageLink, opt => opt.MapFrom(src => src.Notification.ImageLink))
                .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.Notification.Text))
                .ForMember(dest => dest.Link, opt => opt.MapFrom(src => src.Notification.Link))
                .ForMember(dest => dest.InsertedAt, opt => opt.MapFrom(src => src.InsertedAt))
                .ForMember(dest => dest.InsertedByUserName, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name))
                .ForMember(dest => dest.IsAllowDismiss, opt => opt.MapFrom(src => src.Notification.IsAllowDismiss));

            CreateMap<RemedialClassroomStudent, RemedialClassroomStudentGetDTO>()
                .ForMember(dest => dest.RemedialClassroomName, opt => opt.MapFrom(src => src.RemedialClassroom.Name))
                .ForMember(dest => dest.StudentEnName, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.StudentArName, opt => opt.MapFrom(src => src.Student.ar_name));

            CreateMap<RemedialClassroomAddDTO, RemedialClassroom>();
            CreateMap<RemedialClassroom, RemedialClassRoomGetDTO>()
                .ForMember(dest => dest.TeacherArName, opt => opt.MapFrom(src => src.Teacher.ar_name))
                .ForMember(dest => dest.TeacherEnName, opt => opt.MapFrom(src => src.Teacher.en_name))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.AcademicYear.SchoolID))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.AcademicYear.School.Name))
                .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Subject.GradeID))
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Subject.Grade.Name))
                .ForMember(dest => dest.RemedialClassroomStudents, opt =>opt.MapFrom(src => src.RemedialClassroomStudents.Where(s => s.IsDeleted != true)))
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name))
                .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
                .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name));
            CreateMap<RemedialClassroomEditDTOcs, RemedialClassroom>();

            CreateMap<RemedialTimeTableClasses, RemedialTimeTableClassesGetDTO>()
                .ForMember(dest => dest.RemedialClassroomName, opt => opt.MapFrom(src => src.RemedialClassroom.Name))
                .ForMember(dest => dest.NumberOfSession, opt => opt.MapFrom(src => src.RemedialClassroom.NumberOfSession))
                .ForMember(dest => dest.SubjecEntName, opt => opt.MapFrom(src => src.RemedialClassroom.Subject.en_name))
                .ForMember(dest => dest.SubjectArName, opt => opt.MapFrom(src => src.RemedialClassroom.Subject.ar_name))
                .ForMember(dest => dest.TeacherEnName, opt => opt.MapFrom(src => src.RemedialClassroom.Teacher.en_name))
                .ForMember(dest => dest.TeacherArName, opt => opt.MapFrom(src => src.RemedialClassroom.Teacher.ar_name))
                .ForMember(dest => dest.SubjectID, opt => opt.MapFrom(src => src.RemedialClassroom.SubjectID))
                .ForMember(dest => dest.TeacherID, opt => opt.MapFrom(src => src.RemedialClassroom.TeacherID))
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.RemedialClassroom.Subject.Grade.Name))
                .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.RemedialClassroom.Subject.GradeID))
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.RemedialClassroom.AcademicYear.Name));

            CreateMap<RemedialTimeTableAddDTO, RemedialTimeTable>();
            CreateMap<RemedialTimeTable, RemedialTimeTableGetDTO>()
                .ForMember(dest => dest.MaximumPeriodCountRemedials, opt => opt.MapFrom(src => src.AcademicYear.School.MaximumPeriodCountRemedials))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.AcademicYear.SchoolID))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.AcademicYear.School.Name))
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name));
            CreateMap<RemedialTimeTableDay, RemedialTimeTableDayGetDTO>();

            CreateMap<ConductLevel, GonductLevelGetDTO>();
            CreateMap<ConductLevelAddDTO, ConductLevel>();

            CreateMap<Conduct, ConductGetDTO>()
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.ConductType.School.Name))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.ConductType.School.ID))
                .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Classroom.GradeID))
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Classroom.Grade.Name))
                .ForMember(dest => dest.ConductTypeEnName, opt => opt.MapFrom(src => src.ConductType.en_name))
                .ForMember(dest => dest.ConductTypeArName, opt => opt.MapFrom(src => src.ConductType.ar_name))
                .ForMember(dest => dest.ProcedureTypeName, opt => opt.MapFrom(src => src.ProcedureType.Name))
                .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name))
                .ForMember(dest => dest.StudentArName, opt => opt.MapFrom(src => src.Student.ar_name))
                .ForMember(dest => dest.StudentEnName, opt => opt.MapFrom(src => src.Student.en_name));

            CreateMap<ConductAddDTO, Conduct>();
            CreateMap<ConductEditDTO, Conduct>();

            CreateMap<ConductTypeSection, ConductTypeSectionGetDTO>();

            CreateMap<ConductType, ConductTypeGetDTO>()
                .ForMember(dest => dest.ConductTypeSections, opt => opt.MapFrom(src => src.ConductTypeSections));

            CreateMap<ConductTypeAddDTO, ConductType>();
            CreateMap<ConductTypeEditDTO, ConductType>();
            // New mapping for ConductReportDTO--77
            CreateMap<Conduct, ConductReportDTO>()
           .ForMember(dest => dest.StudentArName, opt => opt.MapFrom(src => src.Student.ar_name))
            .ForMember(dest => dest.StudentEnName, opt => opt.MapFrom(src => src.Student.en_name))
            .ForMember(dest => dest.ConductType, opt => opt.MapFrom(src => new ConductTypeReportDTO
            {
                ID = src.ConductType.ID,
                Name = src.ConductType.en_name ?? src.ConductType.ar_name
            }))
            .ForMember(dest => dest.ProcedureType, opt => opt.MapFrom(src => new ProcedureTypeReportDTO
            {
                ID = src.ProcedureType.ID,
                Name = src.ProcedureType.Name 
            }));
            //--77

            CreateMap<ProcedureType, ProcedureTypeGetDTO>();
            CreateMap<ProcedureTypeAddDTO, ProcedureType>();

            CreateMap<Request, RequestGetDTO>()
                .ForMember(dest => dest.SenderUserTypeName, opt => opt.MapFrom(src => src.SenderUserType.Title))
                .ForMember(dest => dest.ReceiverUserTypeName, opt => opt.MapFrom(src => src.ReceiverUserType.Title));
            
            CreateMap<ChatMessage, ChatGetDTO>()
                .ForMember(dest => dest.SenderUserTypeName, opt => opt.MapFrom(src => src.SenderUserType.Title))
                .ForMember(dest => dest.ReceiverUserTypeName, opt => opt.MapFrom(src => src.ReceiverUserType.Title));

            CreateMap<ChatMessageAttachment, ChatMessageAttachmentGetDTO>();
            
            CreateMap<IssuesType, IssueTypeGetDTO>();
            CreateMap<IssueTypeAddDTO, IssuesType>();


            CreateMap<StudentIssue, StudentIssueGetDTO>()
                .ForMember(dest => dest.StudentArName, opt => opt.MapFrom(src => src.Student.ar_name))
                .ForMember(dest => dest.StudentEnName, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name))
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Classroom.Grade.Name))
                .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Classroom.GradeID))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.Classroom.Grade.Section.SchoolID))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.Classroom.Grade.Section.school.Name));
            CreateMap<StudentIssueAddDTO, StudentIssue>();
            CreateMap<StudentIssueEditDTO, StudentIssue>();

            // New mapping for StudentIssueReportDTO
            CreateMap<StudentIssue, StudentIssueReportDTO>()
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.en_name ?? src.Student.ar_name))
                .ForMember(dest => dest.IssuesType, opt => opt.MapFrom(src => new IssuesTypeDTO
                {
                    ID = src.IssuesType.ID,
                    Name = src.IssuesType.Name
                }));

            CreateMap<SocialWorkerMedal, SocialWorkerMedalGetDTO>();
            CreateMap<SocialWorkerMedalAddDTO, SocialWorkerMedal>();
            CreateMap<SocialWorkerMedalEditDTO, SocialWorkerMedal>();

            CreateMap<CertificateType, CertificateTypeGetDTO>();
            CreateMap<CertificateTypeAddDTO, CertificateType>();
            CreateMap<CertificateTypeEditDTO, CertificateType>();

            CreateMap<SocialWorkerMedalStudent, SocialWorkerMedalStudentGetDTO>()
                .ForMember(dest => dest.InsertedByUserName, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name))
                .ForMember(dest => dest.StudentArName, opt => opt.MapFrom(src => src.Student.ar_name))
                .ForMember(dest => dest.StudentEnName, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.SocialWorkerMedalName, opt => opt.MapFrom(src => src.SocialWorkerMedal.Name))
                .ForMember(dest => dest.SocialWorkerMedalFile, opt => opt.MapFrom(src => src.SocialWorkerMedal.File));
            CreateMap<SocialWorkerMedalStudentAddDTO, SocialWorkerMedalStudent>();

            CreateMap<CertificateStudent, CertificateTypeStudentGet>()
                .ForMember(dest => dest.InsertedByUserName, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name))
                .ForMember(dest => dest.TopSpace, opt => opt.MapFrom(src => src.CertificateType.TopSpace))
                .ForMember(dest => dest.LeftSpace, opt => opt.MapFrom(src => src.CertificateType.LeftSpace))
                .ForMember(dest => dest.StudentArName, opt => opt.MapFrom(src => src.Student.ar_name))
                .ForMember(dest => dest.StudentEnName, opt => opt.MapFrom(src => src.Student.en_name))
                .ForMember(dest => dest.CertificateTypeName, opt => opt.MapFrom(src => src.CertificateType.Name))
                .ForMember(dest => dest.CertificateTypeFile, opt => opt.MapFrom(src => src.CertificateType.File));
            CreateMap<CertificateTypeStudentAddDTO, CertificateStudent>();

            // New mapping for SocialWorkerMedalStudentReportDTO
            CreateMap<SocialWorkerMedalStudent, SocialWorkerMedalStudentReportDTO>()
                .ForMember(dest => dest.Medal, opt => opt.MapFrom(src => src.SocialWorkerMedalID))
                .ForMember(dest => dest.MedalName, opt => opt.MapFrom(src => src.SocialWorkerMedal.Name))
                .ForMember(dest => dest.AddedAt, opt => opt.MapFrom(src => src.InsertedAt))
                .ForMember(dest => dest.AddedBy, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name ?? src.InsertedByEmployee.ar_name));



            // New mapping for CertificateStudentReportDTO--77
            CreateMap<CertificateStudent, CertificateStudentReportDTO>()
                .ForMember(dest => dest.CertificateTypeID, opt => opt.MapFrom(src => src.CertificateTypeID))
                .ForMember(dest => dest.CertificateTypeName, opt => opt.MapFrom(src => src.CertificateType.Name))
                .ForMember(dest => dest.AddedAt, opt => opt.MapFrom(src => src.InsertedAt))
                .ForMember(dest => dest.AddedBy, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name ?? src.InsertedByEmployee.ar_name));
            //--77

            CreateMap<AttendanceStudent, AttendanceStudentGetDTO>()
              .ForMember(dest => dest.StudentArName, opt => opt.MapFrom(src => src.Student.ar_name))
              .ForMember(dest => dest.StudentEnName, opt => opt.MapFrom(src => src.Student.en_name));
            CreateMap<AttendanceStudentAddDTO, AttendanceStudent>();
            CreateMap<AttendanceStudentEditDTO, AttendanceStudent>();

            CreateMap<Attendance, AttendanceGetDTO>()
                .ForMember(dest => dest.InsertedByUserId, opt => opt.MapFrom(src => src.InsertedByEmployee.en_name))
                .ForMember(dest => dest.AttendanceStudents, opt => opt.MapFrom(src => src.AttendanceStudents))
                .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name))
                .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Classroom.GradeID))
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Classroom.Grade.Name))
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.AcademicYear.SchoolID))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.AcademicYear.School.Name));
            CreateMap<AttendanceAddDTO, Attendance>();
            CreateMap<AttendanceEditDTO, Attendance>();

            // New mapping for AttendanceReportDTO
            CreateMap<AttendanceStudent, AttendanceReportDTO>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Attendance.Date))
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.en_name ?? src.Student.ar_name))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Note));
            //--77


            CreateMap<ParentMeeting, ParentMeetingGetDTO>();
            CreateMap<ParentMeetingAddDTO, ParentMeeting>();

            CreateMap<HorizontalMeeting, HorizontalMeetingGetDTO>();
            CreateMap<HorizontalMeetingAddDTO, HorizontalMeeting>();


            CreateMap<AppointmentGrade, AppointmentGradeGetDTO>()
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Grade.Name))
                .ForMember(dest => dest.AppointmentTitle, opt => opt.MapFrom(src => src.Appointment.Title));

            CreateMap<AppointmentParent, AppointmentParentGetDTO>()
                .ForMember(dest => dest.ParentEnName, opt => opt.MapFrom(src => src.Parent.en_name))
                .ForMember(dest => dest.ParentArName, opt => opt.MapFrom(src => src.Parent.ar_name))
                .ForMember(dest => dest.AppointmentTitle, opt => opt.MapFrom(src => src.Appointment.Title));

            CreateMap<Appointment, AppointmentGetDTO>()
                .ForMember(dest => dest.AppointmentParents, opt => opt.MapFrom(src => src.AppointmentParents))
                .ForMember(dest => dest.AppointmentGrades, opt => opt.MapFrom(src => src.AppointmentGrades))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.School.ID))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.School.Name));
            CreateMap<AppointmentAddDTO, Appointment>();
            CreateMap<AppointmentEditDTO, Appointment>();

            CreateMap<OfficialHolidays, OfficialHolidaysGetDTO>();
            CreateMap<OfficialHolidaysAddDTO, OfficialHolidays>();

            CreateMap<VacationTypes, VacationTypesGetDTO>();
            CreateMap<VacationTypesAddDTO, VacationTypes>();

            CreateMap<Loans, loansGetDTO>()
                .ForMember(dest => dest.SaveName, opt => opt.MapFrom(src => src.Save.Name))
                .ForMember(dest => dest.EmployeeArName, opt => opt.MapFrom(src => src.Employee.ar_name))
                .ForMember(dest => dest.EmployeeEnName, opt => opt.MapFrom(src => src.Employee.en_name));
            CreateMap<loansAddDTO, Loans>();

            CreateMap<BounsType, BounsTypeGetDTO>();
            CreateMap<DeductionType, DeductionTypeGetDTO>();

            CreateMap<LeaveRequest, leaveRequestsGetDTO>()
                .ForMember(dest => dest.MonthlyLeaveRequestBalance, opt => opt.MapFrom(src => src.Employee.MonthlyLeaveRequestBalance))
                .ForMember(dest => dest.EmployeeArName, opt => opt.MapFrom(src => src.Employee.ar_name))
                .ForMember(dest => dest.EmployeeEnName, opt => opt.MapFrom(src => src.Employee.en_name));
            CreateMap<leaveRequestsAddDTO, LeaveRequest>();

            CreateMap<Bouns, BounsGetDTO>()
                .ForMember(dest => dest.BounsTypeName, opt => opt.MapFrom(src => src.BounsType.Name))
                .ForMember(dest => dest.EmployeeArName, opt => opt.MapFrom(src => src.Employee.ar_name))
                .ForMember(dest => dest.EmployeeEnName, opt => opt.MapFrom(src => src.Employee.en_name));
            CreateMap<BounsAddDTO, Bouns>();

            CreateMap<Deduction, DeductionGetDTO>()
                .ForMember(dest => dest.DeductionTypeName, opt => opt.MapFrom(src => src.DeductionType.Name))
                .ForMember(dest => dest.EmployeeArName, opt => opt.MapFrom(src => src.Employee.ar_name))
                .ForMember(dest => dest.EmployeeEnName, opt => opt.MapFrom(src => src.Employee.en_name));
            CreateMap<DeductionAddDTO, Deduction>();

            CreateMap<DirectMarkClasses, DirectMarkClassesGetDTO>()
                .ForMember(dest => dest.DirectMarkEnglishName, opt => opt.MapFrom(src => src.DirectMark.EnglishName))
                .ForMember(dest => dest.DirectMarkArabicName, opt => opt.MapFrom(src => src.DirectMark.ArabicName))
                .ForMember(dest => dest.ClassroomName, opt => opt.MapFrom(src => src.Classroom.Name));
            CreateMap<DirectMarkClassesStudent, DirectMarkClassesStudentGetDTO>()
                .ForMember(dest => dest.DirectMarkEnglishName, opt => opt.MapFrom(src => src.DirectMark.EnglishName))
                .ForMember(dest => dest.DirectMarkArabicName, opt => opt.MapFrom(src => src.DirectMark.ArabicName))
                .ForMember(dest => dest.StudentEnglishName, opt => opt.MapFrom(src => src.StudentClassroom.Student.en_name))
                .ForMember(dest => dest.StudentArabicName, opt => opt.MapFrom(src => src.StudentClassroom.Student.ar_name))
                .ForMember(dest => dest.StudentID, opt => opt.MapFrom(src => src.StudentClassroom.StudentID));

            CreateMap<DirectMark, DirectMarkGetDTO>()
                .ForMember(dest => dest.SubjectEnglishName, opt => opt.MapFrom(src => src.Subject.en_name))
                .ForMember(dest => dest.SubjectArabicName, opt => opt.MapFrom(src => src.Subject.ar_name))
                .ForMember(dest => dest.GradeID, opt => opt.MapFrom(src => src.Subject.GradeID))
                .ForMember(dest => dest.GradeName, opt => opt.MapFrom(src => src.Subject.Grade.Name))
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.Subject.Grade.Section.school.Name))
                .ForMember(dest => dest.SchoolID, opt => opt.MapFrom(src => src.Subject.Grade.Section.school.ID))
                .ForMember(dest => dest.SubjectWeightTypeEnglishName, opt => opt.MapFrom(src => src.SubjectWeightType.WeightType.EnglishName))
                .ForMember(dest => dest.SubjectWeightTypeArabicName, opt => opt.MapFrom(src => src.SubjectWeightType.WeightType.ArabicName));
            CreateMap<DirectMarkAddDTO, DirectMark>();
            CreateMap<DirectMarkEditDTO, DirectMark>();

            // Maintenance

            CreateMap<MaintenanceItemAddDTO, MaintenanceItem>();
            CreateMap<MaintenanceItemEditDTO, MaintenanceItem>(); 
            CreateMap<MaintenanceItem, MaintenanceItemGetDTO>();

            CreateMap<MaintenanceCompany, MaintenanceCompanyGetDto>();

            CreateMap<MaintenanceCompanyAddDto, MaintenanceCompany>();

            CreateMap<MaintenanceCompanyEditDto, MaintenanceCompany>();
             
            CreateMap<MaintenanceEmployee, MaintenanceEmployeeGetDto>()
                .ForMember(dest => dest.En_Name, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.en_name : null))
                .ForMember(dest => dest.Ar_Name, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.ar_name : null));

            CreateMap<MaintenanceEmployeeAddDto, MaintenanceEmployee>();


            CreateMap<Maintenance, MaintenanceGetDto>()
                .ForMember(dest => dest.ItemEnglishName, opt => opt.MapFrom(src => src.Item.En_Name))
                .ForMember(dest => dest.ItemArabicName, opt => opt.MapFrom(src => src.Item.Ar_Name))
                .ForMember(dest => dest.CompanyEnglishName, opt => opt.MapFrom(src => src.Company.En_Name))
                .ForMember(dest => dest.CompanyArabicName, opt => opt.MapFrom(src => src.Company.Ar_Name))
                .ForMember(dest => dest.EmployeeEnglishName, opt => opt.MapFrom(src => src.MaintenanceEmployee.Employee.en_name))
                .ForMember(dest => dest.EmployeeArabicName, opt => opt.MapFrom(src => src.MaintenanceEmployee.Employee.ar_name));
                       
            CreateMap<MaintenanceAddDto, Maintenance>();
            CreateMap<MaintenanceEditDto, Maintenance>();
              
            CreateMap<ConnectionStatus, ConnectionStatusGetDTO>();

            CreateMap<ArchivingTree, ArchivingTreeGetDTO>();
            CreateMap<ArchivingAddDTO, ArchivingTree>();

            CreateMap<PermissionGroup, PermissionGroupGetDTO>();
            CreateMap<PermissionGroupAddDTO, PermissionGroup>();
            CreateMap<PermissionGroupPutDTO, PermissionGroup>();

            CreateMap<PermissionGroupEmployee, PermissionGroupEmployeeGetDTO>()
                .ForMember(dest => dest.EmployeeEnglishName, opt => opt.MapFrom(src => src.Employee.en_name))
                .ForMember(dest => dest.EmployeeArabicName, opt => opt.MapFrom(src => src.Employee.ar_name));
            CreateMap<PermissionGroupEmployeeAddDTO, PermissionGroupEmployee>();

            CreateMap<PermissionGroupDetails, PermissionGroupDetailsGetDTO>();

            CreateMap<AnnualVacationEmployee, AnnualVacationEmployeeGetDTO>()
                .ForMember(dest => dest.VacationTypeName, opt => opt.MapFrom(src => src.VacationTypes.Name))
                .ForMember(dest => dest.EmployeeEnName, opt => opt.MapFrom(src => src.Employee.en_name))
                .ForMember(dest => dest.EmployeeArName, opt => opt.MapFrom(src => src.Employee.ar_name));
            CreateMap<AnnualVacationEmployeeEditDTO, AnnualVacationEmployee>();

            CreateMap<VacationEmployee, VacationEmployeeGetDTO>()
                .ForMember(dest => dest.VacationTypesName, opt => opt.MapFrom(src => src.VacationTypes.Name))
                .ForMember(dest => dest.EmployeeEnName, opt => opt.MapFrom(src => src.Employee.en_name))
                .ForMember(dest => dest.EmployeeArName, opt => opt.MapFrom(src => src.Employee.ar_name));
            CreateMap<VacationEmployeeAddDTO, VacationEmployee>();

            CreateMap<Location, LocationGetDTO>();
            CreateMap<LocationAddDTO, Location>();

            CreateMap<EmployeeClocks, EmployeeClocksGetDTO>();
            CreateMap<EmployeeClocksAddDTO, EmployeeClocks>();

            CreateMap<BankEmployee, BankEmployeeGetDTO>()
                .ForMember(dest => dest.EmployeeEnglishName, opt => opt.MapFrom(src => src.Employee.en_name))
                .ForMember(dest => dest.EmployeeArabicName, opt => opt.MapFrom(src => src.Employee.ar_name));

            CreateMap<SafeEmployee, SafeEmployeeGetDTO>()
                .ForMember(dest => dest.EmployeeEnglishName, opt => opt.MapFrom(src => src.Employee.en_name))
                .ForMember(dest => dest.EmployeeArabicName, opt => opt.MapFrom(src => src.Employee.ar_name));
        }
    } 
}
    
