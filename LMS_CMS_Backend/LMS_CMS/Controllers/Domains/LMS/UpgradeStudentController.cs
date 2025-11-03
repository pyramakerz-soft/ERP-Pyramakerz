using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Migrations.Octa;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class UpgradeStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public UpgradeStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public class StudentGradeSubjectAcademicYear
        {
            public long StudentID { get; set; }
            public long GradeID { get; set; }
            public long SubjectID { get; set; } 
            public long AcademicYearID { get; set; } 
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Upgrade Students" }
        )]
        public async Task<IActionResult> Upgrade(UpgradeDTO upgradeDTO)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            AcademicYear academicYearFrom = Unit_Of_Work.academicYear_Repository.First_Or_Default(
                s => s.ID == upgradeDTO.FromAcademicYearID && s.IsDeleted != true);
            if (academicYearFrom == null)
            {
                return BadRequest("This Academic Year is not found");
            }

            AcademicYear academicYearTo = Unit_Of_Work.academicYear_Repository.First_Or_Default(
                s => s.ID == upgradeDTO.ToAcademicYearID && s.IsDeleted != true);
            if (academicYearTo == null)
            {
                return BadRequest("This Academic Year is not found");
            }
             
            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.Select_All_With_IncludesById<StudentClassroom>(
                d => d.IsDeleted != true && d.Student.IsDeleted != true && d.Classroom.IsDeleted != true && d.Classroom.AcademicYearID == academicYearFrom.ID,
                query => query.Include(d => d.Classroom),
                query => query.Include(d => d.Student));

            if(studentClassrooms == null ||  !studentClassrooms.Any())
            {
                return NotFound("No Students To Upgrade");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
             
            List<StudentGradeSubjectAcademicYear> studentsFailed = new List<StudentGradeSubjectAcademicYear>();

            foreach (StudentClassroom studentClassroom in studentClassrooms)
            {
                // Get all the student subjects to see if he success in all subjects
                List<StudentClassroomSubject> studentClassroomSubjects = await Unit_Of_Work.studentClassroomSubject_Repository.Select_All_With_IncludesById<StudentClassroomSubject>(
                    d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID && d.Hide == false && d.Subject.IsDeleted != true && d.Subject.HideFromGradeReport == false,
                    query => query.Include(d => d.Subject));

                Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(d=> d.ID == studentClassroom.Classroom.GradeID);
                
                // If He Doesn't have any subjects that need to be checked so upgrade him anyway else see the assignments and direct marks
                if(studentClassroomSubjects == null || !studentClassroomSubjects.Any())
                {
                    StudentGrade student = Unit_Of_Work.studentGrade_Repository.First_Or_Default(
                        d => d.IsDeleted != true && d.StudentID == studentClassroom.StudentID && d.GradeID == grade.UpgradeToID && d.AcademicYearID == academicYearTo.ID);
                    if(student == null)
                    {
                        StudentGrade studentGrade = new StudentGrade();
                        studentGrade.GradeID = grade.UpgradeToID.Value;
                        studentGrade.AcademicYearID = academicYearTo.ID;
                        studentGrade.StudentID = studentClassroom.StudentID;

                        studentGrade.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                        if (userTypeClaim == "octa")
                        {
                            studentGrade.InsertedByOctaId = userId;
                        }
                        else if (userTypeClaim == "employee")
                        {
                            studentGrade.InsertedByUserId = userId;
                        }
                        Unit_Of_Work.studentGrade_Repository.Add(studentGrade);
                    }
                }
                else
                {
                    foreach (StudentClassroomSubject studentClassroomSubject in studentClassroomSubjects)
                    {
                        // Get all the Weight Type for this subject
                        List<SubjectWeightType> subjectWeightTypes = await Unit_Of_Work.subjectWeightType_Repository.Select_All_With_IncludesById<SubjectWeightType>(
                            s => s.SubjectID == studentClassroomSubject.SubjectID && s.IsDeleted != true && s.WeightType.IsDeleted != true,
                            query => query.Include(d => d.WeightType));

                        float TotalDegreesForOneSubject = 0f;

                        foreach (SubjectWeightType subjectWeightType in subjectWeightTypes)
                        {
                            List<Assignment> allAssignments = await Unit_Of_Work.assignment_Repository
                               .Select_All_With_IncludesById<Assignment>(
                                   d => d.IsDeleted != true &&
                                        d.SubjectWeightTypeID == subjectWeightType.WeightTypeID &&
                                        d.SubjectID == subjectWeightType.SubjectID &&
                                        d.OpenDate >= academicYearFrom.DateFrom &&
                                        d.OpenDate <= academicYearFrom.DateTo);

                            List<Assignment> myAssignments = allAssignments.Where(d => d.IsSpecificStudents == false).ToList();

                            List<Assignment> assignmentsIsSpecific = allAssignments.Where(d => d.IsSpecificStudents).ToList();
                            foreach (Assignment assignment in assignmentsIsSpecific)
                            {
                                AssignmentStudentIsSpecific assignmentStudentIsSpecific = Unit_Of_Work.assignmentStudentIsSpecific_Repository.First_Or_Default(
                                    d => d.IsDeleted != true && d.AssignmentID == assignment.ID && d.StudentClassroomID == studentClassroomSubject.StudentClassroomID);
                                if (assignmentStudentIsSpecific != null)
                                {
                                    myAssignments.Add(assignment);
                                }
                            }

                            foreach (Assignment assignment in myAssignments)
                            {
                                LMS_CMS_DAL.Models.Domains.LMS.AssignmentStudent assignmentStudent = Unit_Of_Work.assignmentStudent_Repository
                                    .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                                                           a.AssignmentID == assignment.ID &&
                                                           a.Degree != null &&
                                                           a.IsDeleted != true);

                                if (assignmentStudent != null)
                                {
                                    TotalDegreesForOneSubject += (assignmentStudent.Degree.Value/assignment.Mark);
                                }
                            }

                            List<DirectMark> directMarks = Unit_Of_Work.directMark_Repository
                                .FindBy(a => a.SubjectID == subjectWeightType.SubjectID &&
                                             a.IsDeleted != true &&
                                             a.SubjectWeightTypeID == subjectWeightType.ID &&
                                             a.Date >= academicYearFrom.DateFrom &&
                                             a.Date <= academicYearFrom.DateTo).ToList();

                            foreach (DirectMark mark in directMarks)
                            {
                                DirectMarkClassesStudent studentDirectMark = Unit_Of_Work.directMarkClassesStudent_Repository
                                    .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                                                           a.DirectMarkID == mark.ID &&
                                                           a.IsDeleted != true);

                                if (studentDirectMark?.Degree != null && mark?.Mark != null && mark.Mark > 0)
                                {
                                    TotalDegreesForOneSubject += (studentDirectMark.Degree.Value / mark.Mark);
                                }
                            }
                        }

                        if(studentClassroomSubject.Subject.PassByDegree > TotalDegreesForOneSubject * (studentClassroomSubject.Subject.TotalMark))
                        {
                            // Failed in this subject
                            StudentGradeSubjectAcademicYear failed = new StudentGradeSubjectAcademicYear();
                            failed.StudentID = studentClassroom.StudentID;
                            failed.GradeID = grade.ID;
                            failed.SubjectID = studentClassroomSubject.SubjectID;
                            failed.AcademicYearID = academicYearFrom.ID;

                            studentsFailed.Add(failed);
                        } 
                    }

                    // If He Didn't Fail at any subject so upgrade him, if not so put him in the failed table
                    List<StudentGradeSubjectAcademicYear> matchingStudent = studentsFailed.FindAll(s => s.StudentID == studentClassroom.StudentID && s.GradeID == grade.ID);

                    if (matchingStudent == null || !matchingStudent.Any())
                    {
                        StudentGrade student = Unit_Of_Work.studentGrade_Repository.First_Or_Default(
                        d => d.IsDeleted != true && d.StudentID == studentClassroom.StudentID && d.GradeID == grade.UpgradeToID && d.AcademicYearID == academicYearTo.ID);
                        if (student == null)
                        {
                            StudentGrade studentGrade = new StudentGrade();
                            studentGrade.GradeID = grade.UpgradeToID.Value;
                            studentGrade.AcademicYearID = academicYearTo.ID;
                            studentGrade.StudentID = studentClassroom.StudentID;

                            studentGrade.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            if (userTypeClaim == "octa")
                            {
                                studentGrade.InsertedByOctaId = userId;
                            }
                            else if (userTypeClaim == "employee")
                            {
                                studentGrade.InsertedByUserId = userId;
                            }
                            Unit_Of_Work.studentGrade_Repository.Add(studentGrade);
                        }
                    }
                    else
                    {
                        foreach (var item in matchingStudent)
                        {
                            FailedStudents failedStudents = Unit_Of_Work.failedStudents_Repository.First_Or_Default(
                                d => d.IsDeleted != true && d.StudentID == studentClassroom.StudentID && 
                                d.GradeID == grade.ID && d.AcademicYearID == academicYearFrom.ID && d.SubjectID == item.SubjectID);

                            if (failedStudents == null)
                            {
                                FailedStudents stu = new FailedStudents();
                                stu.GradeID = grade.ID;
                                stu.AcademicYearID = academicYearFrom.ID;
                                stu.StudentID = studentClassroom.StudentID;
                                stu.SubjectID = item.SubjectID;

                                stu.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                                if (userTypeClaim == "octa")
                                {
                                    stu.InsertedByOctaId = userId;
                                }
                                else if (userTypeClaim == "employee")
                                {
                                    stu.InsertedByUserId = userId;
                                }
                                Unit_Of_Work.failedStudents_Repository.Add(stu);
                            }
                        }
                    } 
                } 
            }
             
            Unit_Of_Work.SaveChanges();
            
            return Ok();
        }
         
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost("AfterSummerCourse")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Upgrade Students" }
        )]
        public IActionResult UpgradeAfterSummerCourse(UpgradeDTO upgradeDTO)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            AcademicYear academicYearFrom = Unit_Of_Work.academicYear_Repository.First_Or_Default(
                s => s.ID == upgradeDTO.FromAcademicYearID && s.IsDeleted != true);
            if (academicYearFrom == null)
            {
                return BadRequest("This Academic Year is not found");
            }

            AcademicYear academicYearTo = Unit_Of_Work.academicYear_Repository.First_Or_Default(
                s => s.ID == upgradeDTO.ToAcademicYearID && s.IsDeleted != true);
            if (academicYearTo == null)
            {
                return BadRequest("This Academic Year is not found");
            }
             
            List<FailedStudents> failedStudents = Unit_Of_Work.failedStudents_Repository.FindBy(
                d => d.IsDeleted != true && d.Student.IsDeleted != true && d.Grade.IsDeleted != true && d.Subject.IsDeleted != true && d.AcademicYearID == academicYearFrom.ID);

            if (failedStudents == null || !failedStudents.Any())
            {
                return NotFound("No Students To Upgrade");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            var groupedFailedStudents = failedStudents
                .GroupBy(fs => fs.StudentID)
                .ToList();
             
            foreach (var studentGroup in groupedFailedStudents)
            {
                long studentId = studentGroup.Key;
                List<long> failedSubjects = studentGroup.Select(fs => fs.SubjectID).ToList();
                bool isStudentFailInAtLeastOneSubject = false;
                long gradeId = studentGroup.First().GradeID;
                Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == gradeId);
                long academicYearId = studentGroup.First().AcademicYearID;

                foreach (long subjectID in failedSubjects)
                {
                    Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(d => d.ID == subjectID);
                    float TotalDegreesForOneSubject = 0f;

                    List<DirectMark> directMarks = Unit_Of_Work.directMark_Repository
                               .FindBy(a => a.SubjectID == subjectID &&
                                            a.IsDeleted != true &&
                                            a.IsSummerCourse == true &&
                                            a.SubjectWeightTypeID == null &&
                                            a.Date >= academicYearFrom.SummerCourseDateFrom &&
                                            a.Date <= academicYearFrom.SummerCourseDateTo).ToList();

                    foreach (DirectMark mark in directMarks)
                    {
                        DirectMarkClassesStudent studentDirectMark = Unit_Of_Work.directMarkClassesStudent_Repository
                            .First_Or_Default(a => a.StudentClassroom.StudentID == studentId &&
                                                    a.DirectMarkID == mark.ID &&
                                                    a.IsDeleted != true);

                        if (studentDirectMark?.Degree != null && mark?.Mark != null && mark.Mark > 0)
                        {
                            TotalDegreesForOneSubject += (studentDirectMark.Degree.Value / mark.Mark);
                        }
                    }

                    if (subject.PassByDegree < TotalDegreesForOneSubject * (subject.TotalMark))
                    { 
                        FailedStudents failedRecord = studentGroup.FirstOrDefault(fs => fs.SubjectID == subjectID);

                        if (failedRecord != null)
                        { 
                            failedRecord.IsDeleted = true;
                            failedRecord.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

                            if (userTypeClaim == "octa")
                                failedRecord.DeletedByOctaId = userId;
                            else if (userTypeClaim == "employee")
                                failedRecord.DeletedByUserId = userId;

                            Unit_Of_Work.failedStudents_Repository.Update(failedRecord);
                        }
                    }
                    else
                    {
                        // Failed in this subject
                        isStudentFailInAtLeastOneSubject = true;
                    }
                }

                if (isStudentFailInAtLeastOneSubject == false)
                {
                    StudentGrade student = Unit_Of_Work.studentGrade_Repository.First_Or_Default(
                    d => d.IsDeleted != true && d.StudentID == studentId && d.GradeID == grade.UpgradeToID && d.AcademicYearID == academicYearTo.ID);
                    if (student == null)
                    {
                        StudentGrade studentGrade = new StudentGrade();
                        studentGrade.GradeID = grade.UpgradeToID.Value;
                        studentGrade.AcademicYearID = academicYearTo.ID;
                        studentGrade.StudentID = studentId;

                        studentGrade.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                        if (userTypeClaim == "octa")
                        {
                            studentGrade.InsertedByOctaId = userId;
                        }
                        else if (userTypeClaim == "employee")
                        {
                            studentGrade.InsertedByUserId = userId;
                        }
                        Unit_Of_Work.studentGrade_Repository.Add(studentGrade);
                    }
                }
            } 

            Unit_Of_Work.SaveChanges(); 
             
            return Ok();
        }
    }
}
