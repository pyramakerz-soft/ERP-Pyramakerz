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

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Upgrade Student" }
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

            if (upgradeDTO.IsUpgradeAfterSummerCourse)
            {
                if (academicYearFrom.SummerCourseDateFrom == null || academicYearFrom.SummerCourseDateTo == null)
                {
                    return BadRequest("This Academic Year Doesn't have Summer Course Date");
                }
            }
             
            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.Select_All_With_IncludesById<StudentClassroom>(
                d => d.IsDeleted != true && d.Student.IsDeleted != true && d.Classroom.IsDeleted != true && d.Classroom.AcademicYearID == academicYearFrom.ID,
                query => query.Include(d => d.Classroom),
                query => query.Include(d => d.Student));

            if(studentClassrooms == null ||  studentClassrooms.Count() == 0)
            {
                return NotFound("No Students To Upgrade");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (StudentClassroom studentClassroom in studentClassrooms)
            {
                // Get all the student subjects to see if he success in all subjects
                List<StudentClassroomSubject> studentClassroomSubjects = await Unit_Of_Work.studentClassroomSubject_Repository.Select_All_With_IncludesById<StudentClassroomSubject>(
                    d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID && d.Hide == false && d.Subject.IsDeleted != true && d.Subject.HideFromGradeReport == false,
                    query => query.Include(d => d.Subject));

                Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(d=> d.ID == studentClassroom.Classroom.GradeID);
                
                // If He Doesn't have any subjects that need to be checked so upgrade him anyway else see the assignments and direct marks
                if(studentClassroomSubjects == null || studentClassroomSubjects.Count() == 0)
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
                                if (assignmentsIsSpecific != null)
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
                                             a.SubjectWeightTypeID == subjectWeightType.WeightTypeID &&
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
                        } 
                    }
                    //foreach (var subjectId in subjectIds)
                    //{
                    //    var subject = Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == subjectId && s.IsDeleted != true);
                    //    if (subject == null) continue;

                    //    var subjectTotalMark = new CertificateSubjectTotalMark();
                    //    subjectTotalMark.SubjectID = subject.ID;
                    //    subjectTotalMark.SubjectEn_name = subject.en_name;
                    //    subjectTotalMark.SubjectAr_name = subject.ar_name;
                    //    subjectTotalMark.Degree = 0;
                    //    subjectTotalMark.Mark = 0;

                    //    // Weight types for this subject
                    //    List<SubjectWeightType> subjectWeightTypes = await Unit_Of_Work.subjectWeightType_Repository.Select_All_With_IncludesById<SubjectWeightType>(s => s.SubjectID == subjectId && s.IsDeleted != true && s.WeightType.IsDeleted != true,
                    //            query => query.Include(d => d.WeightType));

                    //    foreach (var swt in subjectWeightTypes)
                    //    {
                    //        float sumPercentageDegree = 0;

                    //        // Get Assignments for this subject & weight type
                    //        var specificAssignments = await Unit_Of_Work.assignmentStudentIsSpecific_Repository
                    //            .Select_All_With_IncludesById<AssignmentStudentIsSpecific>(
                    //                d => d.IsDeleted != true &&
                    //                     d.StudentClassroomID == studentClassroom.ID &&
                    //                     d.Assignment != null &&
                    //                     d.Assignment.IsDeleted != true &&
                    //                     d.Assignment.SubjectID == subject.ID &&
                    //                     d.Assignment.SubjectWeightTypeID == swt.WeightTypeID &&
                    //                d.Assignment.OpenDate >= DateFrom &&
                    //                     d.Assignment.OpenDate <= DateTo);

                    //        var normalAssignments = await Unit_Of_Work.assignment_Repository
                    //            .Select_All_With_IncludesById<Assignment>(
                    //                d => d.IsDeleted != true &&
                    //                     d.SubjectID == subject.ID &&
                    //                     !d.IsSpecificStudents &&
                    //                d.OpenDate >= DateFrom &&
                    //                     d.OpenDate <= DateTo);

                    //        var allAssignments = specificAssignments
                    //            .Where(a => a.Assignment != null)
                    //            .Select(a => a.Assignment)
                    //            .Concat(normalAssignments)
                    //            .Where(a => a != null)
                    //            .GroupBy(a => a.ID)
                    //            .Select(g => g.First())
                    //            .ToList();

                    //        // Sum assignment marks
                    //        foreach (var assignment in allAssignments.Where(a => a != null))
                    //        {
                    //            var assignmentStudent = Unit_Of_Work.assignmentStudent_Repository
                    //                .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                    //                                       a.AssignmentID == assignment.ID &&
                    //                                       a.Degree != null &&
                    //                                       a.IsDeleted != true);

                    //            if (assignmentStudent?.Degree != null && assignment?.Mark != null && assignment.Mark > 0)
                    //            {
                    //                sumPercentageDegree += ((float)assignmentStudent.Degree / assignment.Mark);
                    //            }
                    //        }

                    //        // Get direct marks
                    //        var directMarks = Unit_Of_Work.directMark_Repository
                    //            .FindBy(a => a.SubjectID == subjectId &&
                    //                         a.IsDeleted != true &&
                    //                         a.SubjectWeightTypeID == swt.WeightTypeID &&
                    //            a.Date >= DateFrom &&
                    //                         a.Date <= DateTo).ToList();

                    //        foreach (var mark in directMarks)
                    //        {
                    //            var studentDirectMark = Unit_Of_Work.directMarkClassesStudent_Repository
                    //                .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                    //                                       a.DirectMarkID == mark.ID &&
                    //                                       a.IsDeleted != true);

                    //            if (studentDirectMark?.Degree != null && mark?.Mark != null && mark.Mark > 0)
                    //            {
                    //                sumPercentageDegree += ((float)studentDirectMark.Degree / mark.Mark);
                    //            }
                    //        }

                    //        int totalItems = directMarks.Count + allAssignments.Count;
                    //        float avgDegree = totalItems > 0 ? (sumPercentageDegree / totalItems) * swt.Weight : 0;


                    //        var certificateSubjectObject = new CertificateSubject();
                    //        certificateSubjectObject.Mark = swt.Weight;

                    //        float weight = avgDegree;
                    //        int integerPart = (int)Math.Floor(weight);
                    //        float decimalPart = weight - integerPart;

                    //        if (decimalPart > 0.5)
                    //        {
                    //            certificateSubjectObject.Degree = integerPart + 1;
                    //        }
                    //        else if (decimalPart < 0.5)
                    //        {
                    //            certificateSubjectObject.Degree = integerPart;
                    //        }
                    //        else // decimalPart == 0.5
                    //        {
                    //            certificateSubjectObject.Degree = integerPart + 0.5f;
                    //        }
                    //        //certificateSubjectObject.Degree = avgDegree;

                    //        certificateSubjectObject.WeightTypeArName = swt.WeightType.ArabicName;
                    //        certificateSubjectObject.WeightTypeEnName = swt.WeightType.EnglishName;
                    //        certificateSubjectObject.WeightTypeId = swt.WeightType.ID;
                    //        certificateSubjectObject.SubjectID = subject.ID;
                    //        certificateSubjectObject.SubjectAr_name = subject.ar_name;
                    //        certificateSubjectObject.SubjectEn_name = subject.en_name;

                    //        certificateSubjects.Add(certificateSubjectObject);
                    //        subjectTotalMark.Mark += certificateSubjectObject.Mark;
                    //        subjectTotalMark.Degree += certificateSubjectObject.Degree;
                    //    }
                    //    certificateSubjectTotalMark.Add(subjectTotalMark);
                    //}

                    //foreach (var percentage in certificateSubjectTotalMark)
                    //{
                    //    if (percentage.Mark == 0)
                    //        percentage.Percentage = 0;
                    //    else
                    //        percentage.Percentage = (percentage.Degree / percentage.Mark) * 100;
                    //}
                } 
            }
             
            Unit_Of_Work.SaveChanges();
            
            return Ok();
        }
    }
}
