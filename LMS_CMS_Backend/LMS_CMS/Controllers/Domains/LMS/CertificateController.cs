 using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Utilities;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class CertificateController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public CertificateController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////

        [HttpGet("ByStudentId/{SchoolId}/{ClassId}/{StudentId}/{DateFrom}/{DateTo}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] {"octa", "employee", "student", "parent" },
            pages: new[] { "Certificate" }
        )]
        public async Task<IActionResult> GetById(long SchoolId, long ClassId, long StudentId, DateOnly DateFrom, DateOnly DateTo, bool? IsSummerCourse)
        {
            try
            {
                var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

                // Check if student exists
                Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == StudentId && s.IsDeleted != true);
                if (student == null)
                    return BadRequest("There is no student with this ID");
                 
                List<SubjectGetDTO> SubjectDTO = new List<SubjectGetDTO>();

                List<CertificateSubject> certificateSubjects = new List<CertificateSubject>(); // The Data Fill In cell
                List<CertificateSubjectTotalMark> certificateSubjectTotalMark = new List<CertificateSubjectTotalMark>(); // total marks in last column

                List<long> subjectIds = new List<long>();
                List<WeightTypeGetDTO> WeightTypeDTO = new List<WeightTypeGetDTO>();

                StudentClassroom studentClassroom;

                if (IsSummerCourse == null || IsSummerCourse == false)
                {
                    // Get classroom for this student
                    studentClassroom = Unit_Of_Work.studentClassroom_Repository
                        .First_Or_Default(s => s.StudentID == StudentId &&
                                                s.IsDeleted != true &&
                                                s.Classroom != null &&
                                                s.ClassID == ClassId &&
                                                s.Classroom.IsDeleted != true &&
                                                s.Classroom.AcademicYear != null &&
                                                s.Classroom.AcademicYear.DateFrom <= DateFrom &&
                                                s.Classroom.AcademicYear.DateTo >= DateTo &&
                                                s.Classroom.AcademicYear.SchoolID == SchoolId);

                    if (studentClassroom == null)
                        return BadRequest("This student is not enrolled in a classroom for the current academic year.");

                    // All Subjects for this student
                    List<StudentClassroomSubject> studentClassroomSubjects = await Unit_Of_Work.studentClassroomSubject_Repository
                        .Select_All_With_IncludesById<StudentClassroomSubject>(
                            f => f.IsDeleted != true && f.StudentClassroomID == studentClassroom.ID && f.Subject.IsDeleted != true
                            && f.Subject.HideFromGradeReport == false && !f.Hide, 
                            query => query.Include(d => d.Subject));

                    if (studentClassroomSubjects == null || !studentClassroomSubjects.Any())
                        return NotFound("No subjects found for this student.");

                    subjectIds = studentClassroomSubjects.Select(s => s.SubjectID).Distinct().ToList();
                    List<Subject> subjects = studentClassroomSubjects.Select(s => s.Subject).Distinct().ToList();
                    
                    SubjectDTO = mapper.Map<List<SubjectGetDTO>>(subjects);  // first column

                    // All Weight types for this subject
                    List<SubjectWeightType> AllsubjectWeightTypes = await Unit_Of_Work.subjectWeightType_Repository
                        .Select_All_With_IncludesById<SubjectWeightType>(s => subjectIds.Contains(s.SubjectID) && s.IsDeleted != true && s.WeightType.IsDeleted != true,
                            query => query.Include(d => d.WeightType));

                    if(AllsubjectWeightTypes == null || !AllsubjectWeightTypes.Any())
                    {
                        return NotFound();
                    }
                     
                    List<WeightType> AllWeightType = AllsubjectWeightTypes.Select(s => s.WeightType).Distinct().ToList(); 
                    WeightTypeDTO = mapper.Map<List<WeightTypeGetDTO>>(AllWeightType);     //Header
                }
                else
                {
                    // Get classroom for this student
                    studentClassroom = Unit_Of_Work.studentClassroom_Repository
                        .First_Or_Default(s => s.StudentID == StudentId &&
                                                s.IsDeleted != true &&
                                                s.Classroom != null &&
                                                s.ClassID == ClassId &&
                                                s.Classroom.IsDeleted != true &&
                                                s.Classroom.AcademicYear != null &&
                                                s.Classroom.AcademicYear.SummerCourseDateFrom <= DateFrom &&
                                                s.Classroom.AcademicYear.SummerCourseDateTo >= DateTo &&
                                                s.Classroom.AcademicYear.SchoolID == SchoolId);

                    if (studentClassroom == null)
                        return BadRequest("This student is not enrolled in a classroom for the current academic year.");

                    List<DirectMarkClassesStudent> directMarkClassesStudents = await Unit_Of_Work.directMarkClassesStudent_Repository.Select_All_With_IncludesById<DirectMarkClassesStudent>(
                        d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID &&
                        d.DirectMark.Subject.HideFromGradeReport == false &&
                        d.DirectMark.IsDeleted != true && d.DirectMark.IsSummerCourse == true && d.DirectMark.Date >= DateFrom && d.DirectMark.Date <= DateTo,
                        query => query.Include(d => d.DirectMark).ThenInclude(d => d.Subject)
                        );

                    if (directMarkClassesStudents == null || !directMarkClassesStudents.Any())
                    {
                        return NotFound();
                    }

                    subjectIds = directMarkClassesStudents.Select(s => s.DirectMark.SubjectID).Distinct().ToList(); 
                    List<Subject> subjects = directMarkClassesStudents.Select(s => s.DirectMark.Subject).Distinct().ToList();

                    SubjectDTO = mapper.Map<List<SubjectGetDTO>>(subjects);  // first column 
                }

                SubjectDTO = SubjectDTO.OrderBy(d => d.OrderInCertificate).ToList();

                foreach (long subjectId in subjectIds)
                {
                    Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == subjectId && s.IsDeleted != true);
                    if (subject == null) continue;

                    // Cell For the last column
                    CertificateSubjectTotalMark subjectTotalMark = new CertificateSubjectTotalMark();
                    subjectTotalMark.SubjectID = subject.ID;
                    subjectTotalMark.SubjectEn_name = subject.en_name;
                    subjectTotalMark.SubjectAr_name = subject.ar_name;
                    subjectTotalMark.Degree = 0;
                    subjectTotalMark.Mark = subject.TotalMark;

                    if (IsSummerCourse == null || IsSummerCourse == false)
                    { 
                        // Weight types for this subject
                        List<SubjectWeightType> subjectWeightTypes = await Unit_Of_Work.subjectWeightType_Repository.Select_All_With_IncludesById<SubjectWeightType>(
                            s => s.SubjectID == subjectId && s.IsDeleted != true && s.WeightType.IsDeleted != true,
                                query => query.Include(d => d.WeightType));

                        foreach (var swt in subjectWeightTypes)
                        {
                            float sumDegree = 0;
                            float sumMark = 0;

                            // Get Assignments for this subject & weight type
                            List<AssignmentStudentIsSpecific> specificAssignments = await Unit_Of_Work.assignmentStudentIsSpecific_Repository
                                .Select_All_With_IncludesById<AssignmentStudentIsSpecific>(
                                    d => d.IsDeleted != true &&
                                         d.StudentClassroomID == studentClassroom.ID &&
                                         d.Assignment != null &&
                                         d.Assignment.IsDeleted != true &&
                                         d.Assignment.SubjectID == subject.ID && 
                                         d.Assignment.SubjectWeightTypeID == swt.ID &&
                                         d.Assignment.OpenDate >= DateFrom &&
                                         d.Assignment.OpenDate <= DateTo);

                            List<Assignment> normalAssignments = await Unit_Of_Work.assignment_Repository
                                .Select_All_With_IncludesById<Assignment>(
                                    d => d.IsDeleted != true &&
                                         d.SubjectID == subject.ID &&
                                         d.SubjectWeightTypeID == swt.ID &&
                                         !d.IsSpecificStudents && 
                                         d.OpenDate >= DateFrom &&
                                         d.OpenDate <= DateTo);

                            List<Assignment> allAssignments = specificAssignments
                                .Where(a => a.Assignment != null)
                                .Select(a => a.Assignment)
                                .Concat(normalAssignments)
                                .Where(a => a != null)
                                .GroupBy(a => a.ID)
                                .Select(g => g.First())
                                .ToList();

                            // Sum assignment marks
                            foreach (Assignment assignment in allAssignments.Where(a => a != null))
                            {
                                AssignmentStudent assignmentStudent = Unit_Of_Work.assignmentStudent_Repository
                                    .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                                                           a.AssignmentID == assignment.ID &&
                                                           a.Degree != null &&
                                                           a.IsDeleted != true);

                                // If student has no record or degree is null => 0 mark
                                float studentDegree = assignmentStudent?.Degree ?? 0;
                                //sumPercentageDegree += (studentDegree / assignment.Mark); 
                                sumDegree += studentDegree;
                                sumMark += assignment.Mark;
                            }

                            // Get direct marks
                            List<DirectMark> directMarks = Unit_Of_Work.directMark_Repository
                                .FindBy(a => a.SubjectID == subjectId &&
                                             a.IsDeleted != true &&
                                             a.SubjectWeightTypeID == swt.ID && 
                                             a.Date >= DateFrom &&
                                             a.Date <= DateTo).ToList();

                            foreach (DirectMark mark in directMarks)
                            {
                               DirectMarkClassesStudent studentDirectMark = Unit_Of_Work.directMarkClassesStudent_Repository
                                    .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                                                           a.DirectMarkID == mark.ID &&
                                                           a.IsDeleted != true);

                                //sumPercentageDegree += (studentDirectMark.Degree / mark.Mark);
                                //sumDegree += (float)studentDirectMark.Degree;
                                if (studentDirectMark?.Degree != null)
                                    sumDegree += (float)studentDirectMark.Degree;
                                sumMark += mark.Mark;
                            }

                            // Student's degree in this subject weight type
                            float weightSubjectDegreeForThisType = (swt.Weight * subject.TotalMark) / 100;
                            float studentDegreeInWeightType = 0;
                            if (sumMark > 0)
                            {
                                studentDegreeInWeightType = (sumDegree / sumMark) * weightSubjectDegreeForThisType;
                            }
                            //float studentDegreeInWeightType = (sumDegree / sumMark) * weightSubjectDegreeForThisType;

                            CertificateSubject certificateSubjectObject = new CertificateSubject();
                            certificateSubjectObject.Mark = weightSubjectDegreeForThisType;

                            float fractional = studentDegreeInWeightType - (int)studentDegreeInWeightType;

                            if (fractional > 0.5f)
                                certificateSubjectObject.Degree = (float)Math.Ceiling(studentDegreeInWeightType);
                            else if (fractional < 0.5f)
                                certificateSubjectObject.Degree = (float)Math.Floor(studentDegreeInWeightType);
                            else
                                certificateSubjectObject.Degree = studentDegreeInWeightType;
                             
                            certificateSubjectObject.WeightTypeArName = swt.WeightType.ArabicName;
                            certificateSubjectObject.WeightTypeEnName = swt.WeightType.EnglishName;
                            certificateSubjectObject.WeightTypeId = swt.WeightType.ID;
                            certificateSubjectObject.SubjectID = subject.ID;
                            certificateSubjectObject.SubjectAr_name = subject.ar_name;
                            certificateSubjectObject.SubjectEn_name = subject.en_name;

                            certificateSubjects.Add(certificateSubjectObject); 
                            subjectTotalMark.Degree += certificateSubjectObject.Degree;
                        }

                        certificateSubjectTotalMark.Add(subjectTotalMark);
                        
                        //foreach (var percentage in certificateSubjectTotalMark)
                        //{
                        //    if (percentage.Mark == 0)
                        //        percentage.Percentage = 0;
                        //    else
                        //        percentage.Percentage = (percentage.Degree / percentage.Mark) * 100;
                        //}
                        foreach (var percentage in certificateSubjectTotalMark)
                        {
                            if (percentage.Mark > 0)
                                percentage.Percentage = (percentage.Degree / percentage.Mark) * 100;
                            else
                                percentage.Percentage = 0;
                        }
                    }
                    else
                    { 
                        float sumDegree = 0;
                        float sumMark = 0;

                        //// Get direct marks
                        List<DirectMark> directMarks = Unit_Of_Work.directMark_Repository
                            .FindBy(a => a.SubjectID == subjectId &&
                                         a.IsDeleted != true &&
                                         a.IsSummerCourse == true &&
                                         a.Date >= DateFrom &&
                                         a.Date <= DateTo).ToList();

                        foreach (DirectMark mark in directMarks)
                        { 
                            DirectMarkClassesStudent studentDirectMark = Unit_Of_Work.directMarkClassesStudent_Repository
                                .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                                                       a.DirectMarkID == mark.ID &&
                                                       a.IsDeleted != true);

                            if (studentDirectMark?.Degree != null)
                            {
                                //sumPercentageDegree += studentDirectMark.Degree.Value / mark.Mark;
                                //sumDegree += (float)studentDirectMark.Degree;
                                if (studentDirectMark?.Degree != null)
                                    sumDegree += (float)studentDirectMark.Degree;
                                sumMark += mark.Mark;
                            }
                        }
                        float studentDegreeInWeightType = 0;
                        if (sumMark > 0)
                        {
                            studentDegreeInWeightType = (sumDegree / sumMark) * subject.TotalMark;
                        }
                        //float studentDegreeInWeightType = (sumDegree / sumMark) * subject.TotalMark;

                        CertificateSubject certificateSubjectObject = new CertificateSubject();
                        certificateSubjectObject.Mark = subject.TotalMark;

                        float fractional = studentDegreeInWeightType - (int)studentDegreeInWeightType;

                        if (fractional > 0.5f)
                            certificateSubjectObject.Degree = (float)Math.Ceiling(studentDegreeInWeightType);
                        else if (fractional < 0.5f)
                            certificateSubjectObject.Degree = (float)Math.Floor(studentDegreeInWeightType);
                        else
                            certificateSubjectObject.Degree = studentDegreeInWeightType;
                         
                        certificateSubjectObject.SubjectID = subject.ID;
                        certificateSubjectObject.SubjectAr_name = subject.ar_name;
                        certificateSubjectObject.SubjectEn_name = subject.en_name;

                        certificateSubjects.Add(certificateSubjectObject); 

                        subjectTotalMark.Degree = studentDegreeInWeightType;
                        certificateSubjectTotalMark.Add(subjectTotalMark);

                        //foreach (var percentage in certificateSubjectTotalMark)
                        //{
                        //    if (percentage.Mark == 0)
                        //        percentage.Percentage = 0;
                        //    else
                        //        percentage.Percentage = (percentage.Degree / percentage.Mark) * 100;
                        //}
                        foreach (var percentage in certificateSubjectTotalMark)
                        {
                            if (percentage.Mark > 0)
                                percentage.Percentage = (percentage.Degree / percentage.Mark) * 100;
                            else
                                percentage.Percentage = 0;
                        }
                    }
                }

                return Ok(new { SubjectDTO = SubjectDTO, Header = WeightTypeDTO, cells = certificateSubjects, LastColumn = certificateSubjectTotalMark });
            }
            catch (Exception ex)
            {
                Console.WriteLine(new { error = ex.Message, stack = ex.StackTrace });
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
            }

        }

    }
}
