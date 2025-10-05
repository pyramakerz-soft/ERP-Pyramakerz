using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.Bus;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Octa;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc; 
using Microsoft.EntityFrameworkCore; 
using System.Linq.Expressions;
using System.Runtime.InteropServices;
using LMS_CMS_DAL.Models.Domains.BusModule;
using System.Linq;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_BL.DTO;

namespace LMS_CMS_PL.Controllers.Domains
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class StudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly UOW _Unit_Of_Work_Octa;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly SchoolHeaderService _schoolHeaderService;

        public StudentController(DbContextFactoryService dbContextFactory, IMapper mapper, UOW Unit_Of_Work, CheckPageAccessService checkPageAccessService, SchoolHeaderService schoolHeaderService)
        {

            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _Unit_Of_Work_Octa = Unit_Of_Work;
            _checkPageAccessService = checkPageAccessService;
            _schoolHeaderService = schoolHeaderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Student> students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(
                query => query.IsDeleted != true,
                query => query.Include(stu => stu.AccountNumber),
                query => query.Include(stu => stu.AccountNumber),

                query => query.Include(stu => stu.Gender));

            if (students == null || students.Count == 0)
            {
                return NotFound("No Student found");
            }

            List<StudentGetDTO> StudentDTO = mapper.Map<List<StudentGetDTO>>(students);
            foreach (var item in StudentDTO)
            {
                Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(item.Nationality);
                if (nationality != null)
                {
                    item.NationalityEnName = nationality.Name;
                    item.NationalityArName = nationality.ArName;
                }

                StudentGrade studentGrade =await Unit_Of_Work.studentGrade_Repository.FindByIncludesAsync(
                    s => s.StudentID == item.ID && s.IsDeleted != true && s.AcademicYear != null && s.AcademicYear.IsActive == true ,
                    s => s.Include(stu => stu.Grade) ,
                    s => s.Include(stu => stu.AcademicYear)
                    );

                if (studentGrade != null)
                {
                    if (studentGrade.Grade != null)
                        item.CurrentGradeName = studentGrade.Grade.Name;

                    if (studentGrade.AcademicYear != null)
                        item.CurrentAcademicYear = studentGrade.AcademicYear.Name;
                }

            }
            return Ok(StudentDTO);
        }

        [HttpGet("SearchBySchoolId/{SchoolId}")]
        public async Task<IActionResult> SearchStudents(long SchoolId ,string keyword, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

             var studentClassrooms = Unit_Of_Work.studentClassroom_Repository
                .SelectQuery<StudentClassroom>(
                    sc => sc.IsDeleted != true
                        && sc.Classroom.AcademicYear.SchoolID == SchoolId
                        && sc.Student.User_Name.Contains(keyword)
                        && sc.Student.IsDeleted != true
                        && sc.Classroom.IsDeleted != true
                )
                .Include(sc => sc.Student);

            //// Build query with optional filter
            //var query = Unit_Of_Work.student_Repository
            //    .SelectQuery<Student>(s => s.IsDeleted != true && s.User_Name.Contains(keyword))
            //    .Include(s => s.AccountNumber)
            //    .Include(s => s.Gender)
            //    .OrderBy(s => s.en_name); // You can change to ar_name or Id if needed

            // Get total count for pagination info (optional)
            var query = studentClassrooms.Select(sa => sa.Student).ToList();


            int totalRecords = query.Count();

            // Apply pagination
            var pagedStudents = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            // Check for results
            if (pagedStudents == null || pagedStudents.Count == 0)
            {
                return NotFound("No students found");
            }

            // Map to DTO
            var studentDTOs = mapper.Map<List<StudentGetDTO>>(pagedStudents);

            // Add nationality info
            foreach (var item in studentDTOs)
            {
                var nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(item.Nationality);
                if (nationality != null)
                {
                    item.NationalityEnName = nationality.Name;
                    item.NationalityArName = nationality.ArName;
                }
            }

            // Return with optional pagination info
            return Ok(new
            {
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Students = studentDTOs
            });
        }


        [HttpGet("{Id}")]
        public async Task<IActionResult> GetByIDAsync(long Id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Student student = await Unit_Of_Work.student_Repository.FindByIncludesAsync(
                query => query.IsDeleted != true && query.ID == Id,
                query => query.Include(stu => stu.Gender),
                query => query.Include(stu => stu.AccountNumber));

            if (student == null || student.IsDeleted == true)
            {
                return NotFound("No Student found");
            }

            StudentGetDTO StudentDTO = mapper.Map<StudentGetDTO>(student);
            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(StudentDTO.Nationality);
            if (nationality != null)
            {
                StudentDTO.NationalityEnName = nationality.Name;
                StudentDTO.NationalityArName = nationality.ArName;
            }


            return Ok(StudentDTO);
        }


        [HttpGet("Get_By_ClassID/{Id}")]
        public async Task<IActionResult> GetByClassID(long Id)
        {
            if (Id == 0)
            {
                return BadRequest("ID can't e null");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Classroom cls = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.ID == Id && d.IsDeleted != true);
            if (cls == null)
            {
                return NotFound("No Class with this Id");
            }

            //List<StudentAcademicYear> studentAcademicYears = await Unit_Of_Work.studentAcademicYear_Repository.Select_All_With_IncludesById<StudentAcademicYear>(
            //    query => query.IsDeleted != true && query.ClassID == Id,
            //    query => query.Include(stu => stu.Student)
            //);

            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.Select_All_With_IncludesById<StudentClassroom>(
                query => query.IsDeleted != true && query.ClassID == Id && query.Student.IsDeleted != true && query.Classroom.AcademicYear.IsActive == true,
                query => query.Include(stu => stu.Student)
            );

            if (studentClassrooms == null || studentClassrooms.Count == 0)
            {
                return NotFound("No students found.");
            }

            List<Student> students = studentClassrooms.Select(sa => sa.Student).ToList();
            List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(students);

            return Ok(studentDTOs);
        }

        /////
        [HttpGet("GetByClassIDAndThoseWhoWishesToUseSchoolTransportation/{Id}")]
        public async Task<IActionResult> GetByClassIDAndThoseWhoWishesToUseSchoolTransportation(long Id)
        {
            if (Id == 0)
            {
                return BadRequest("ID can't e null");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Classroom cls = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.ID == Id && d.IsDeleted != true);
            if (cls == null)
            {
                return NotFound("No Class with this Id");
            }

            //List<StudentAcademicYear> studentAcademicYears = await Unit_Of_Work.studentAcademicYear_Repository.Select_All_With_IncludesById<StudentAcademicYear>(
            //    query => query.IsDeleted != true && query.ClassID == Id,
            //    query => query.Include(stu => stu.Student)
            //);

            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.Select_All_With_IncludesById<StudentClassroom>(
                query => query.IsDeleted != true && query.ClassID == Id && query.Student.IsDeleted!= true,
                query => query.Include(stu => stu.Student)
            );

            if (studentClassrooms == null || studentClassrooms.Count == 0)
            {
                return NotFound("No students found.");
            }

            List<Student> students = studentClassrooms.Select(sa => sa.Student).ToList();

            List<Student> filteredStudents = new List<Student>();
            foreach (var student in students)
            {
                RegisterationFormSubmittion registerationFormSubmittion = Unit_Of_Work.registerationFormSubmittion_Repository.First_Or_Default
                    (d => d.CategoryFieldID == 14 && d.RegisterationFormParentID == student.RegistrationFormParentID);
                if (registerationFormSubmittion != null && registerationFormSubmittion.TextAnswer == "true")
                {
                    filteredStudents.Add(student);
                }
            }

            List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(filteredStudents);

            return Ok(studentDTOs);
        }

        /////

        [HttpGet("Get_By_SchoolID/{Id}")]
        public async Task<IActionResult> GetBySchoolID(long Id)
        {
            if (Id == 0)
            {
                return BadRequest("ID can't e null");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            School cls = Unit_Of_Work.school_Repository.First_Or_Default(d => d.ID == Id && d.IsDeleted != true);
            if (cls == null)
            {
                return NotFound("No School with this Id");
            }

            //List<StudentAcademicYear> studentAcademicYears = await Unit_Of_Work.studentAcademicYear_Repository.Select_All_With_IncludesById<StudentAcademicYear>(
            //    query => query.IsDeleted != true && query.SchoolID == Id,
            //    query => query.Include(stu => stu.Student)
            //);

            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.Select_All_With_IncludesById<StudentClassroom>(
                query => query.IsDeleted != true && query.Classroom.AcademicYear.SchoolID == Id && query.Student.IsDeleted != true && query.Classroom.IsDeleted != true,
                query => query.Include(stu => stu.Student)
            );

            if (studentClassrooms == null || studentClassrooms.Count == 0)
            {
                return NotFound("No students found.");
            }

            List<Student> students = studentClassrooms.Select(sa => sa.Student).ToList();
            List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(students);

            return Ok(studentDTOs);
        }
        
        /////

        [HttpGet("Get_By_ParentID/{Id}")]
        public IActionResult Get_By_ParentID(long Id)
        {
            if (Id == 0)
            {
                return BadRequest("ID can't e null");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Parent parent = Unit_Of_Work.parent_Repository.First_Or_Default(d => d.ID == Id && d.IsDeleted != true);
            if (parent == null)
            {
                return NotFound("No parent with this Id");
            } 

            List<Student> students = Unit_Of_Work.student_Repository.FindBy(query => query.IsDeleted != true && query.Parent_Id == Id);

            if (students == null || students.Count == 0)
            {
                return NotFound("No students found.");
            }
             
            List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(students);

            return Ok(studentDTOs);
        }

        /////

        [HttpGet("GetByAcademicYearID/{Id}")]
        public async Task<IActionResult> GetByAcademicYearID(long Id)
        {
            if (Id == 0)
            {
                return BadRequest("ID can't be null");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            AcademicYear year = Unit_Of_Work.academicYear_Repository.First_Or_Default(d => d.ID == Id && d.IsDeleted != true);
            if (year == null)
            {
                return NotFound("No Academic Year with this Id");
            }

            List<Classroom> classes = Unit_Of_Work.classroom_Repository.FindBy(d => d.IsDeleted != true && d.AcademicYearID == Id);
            if (classes == null)
            {
                return NotFound("No Classes with this Id");
            }

            List<Student> students = new List<Student>();

            for (int i = 0; i < classes.Count; i++)
            {
                List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.Select_All_With_IncludesById<StudentClassroom>(
                    query => query.IsDeleted != true && query.ClassID == classes[i].ID,
                    query => query.Include(stu => stu.Student)
                );

                for (int j = 0; j < studentClassrooms.Count; j++)
                {
                    // Add check to ensure student is not deleted and not already in the list
                    if (studentClassrooms[j].Student != null &&
                        studentClassrooms[j].Student.IsDeleted != true &&
                        !students.Contains(studentClassrooms[j].Student))
                    {
                        students.Add(studentClassrooms[j].Student);
                    }
                }
            }

            if (students == null || students.Count == 0)
            {
                return NotFound("No students found.");
            }

            List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(students);

            return Ok(studentDTOs);
        }
        //  /////

        [HttpGet("GetBySchoolGradeClassID")]
        public async Task<IActionResult> GetBySchoolGradeClassID([FromQuery] long schoolId, [FromQuery] long gradeId, [FromQuery] long classId)
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

            if (schoolId == null || schoolId == 0)
            {
                return BadRequest("School Id can't be null");
            }

            if (gradeId == null || gradeId == 0)
            {
                return BadRequest("Grade Id can't be null");
            }

            if (classId == null || classId == 0)
            {
                return BadRequest("Class Id can't be null");
            }

            Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.ID == gradeId
                );
            if (grade == null)
            {
                return NotFound("No Grade with this Id");
            }

            Classroom cls = Unit_Of_Work.classroom_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.ID == classId
                );
            if (cls == null)
            {
                return NotFound("No Class with this Id");
            }
            
            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository
                .Select_All_With_IncludesById<StudentClassroom>(
                    s => s.IsDeleted != true && s.ClassID == classId && s.Classroom.AcademicYear.SchoolID == schoolId,
                    query => query.Include(stu => stu.Student)
                      .ThenInclude(stu => stu.Gender)
                      .Include(sc => sc.Classroom)
                );

            if (studentClassrooms == null || studentClassrooms.Count == 0)
            {
                return NotFound("No students in the class found.");
            }

            studentClassrooms = studentClassrooms
                .Where(s => s.Student != null && s.Student.IsDeleted != true && s.Classroom != null && s.Classroom.IsDeleted!= true)
                .ToList();

            List<StudentGrade> studentGrades = await Unit_Of_Work.studentGrade_Repository
                .Select_All_With_IncludesById<StudentGrade>(
                    s => s.IsDeleted != true && s.GradeID == gradeId && s.AcademicYear.SchoolID == schoolId,
                    query => query.Include(stu => stu.Student)
                      .ThenInclude(stu => stu.Gender)
                );

            if (studentGrades == null || studentGrades.Count == 0)
            {
                return NotFound("No students in the grade found.");
            }

            studentGrades = studentGrades
               .Where(s => s.Student != null && s.Student.IsDeleted != true && s.Grade != null && s.Grade.IsDeleted != true)
               .ToList();

            var classroomStudentIds = studentClassrooms.Select(sc => sc.StudentID).ToHashSet();
            var gradeStudentIds = studentGrades.Select(sg => sg.StudentID).ToHashSet(); 
            var commonStudentIds = classroomStudentIds.Intersect(gradeStudentIds).ToHashSet(); 

            var totalStudents = studentClassrooms
                .Where(sc => commonStudentIds.Contains(sc.StudentID))
                .ToList();
             
            List<Student> students = totalStudents.Select(sc => sc.Student).ToList();

            List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(students);

            for (int i = 0; i < studentDTOs.Count; i++)
            {
                Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(studentDTOs[i].Nationality);
                if (nationality != null)
                {
                    studentDTOs[i].NationalityEnName = nationality.Name;
                    studentDTOs[i].NationalityArName = nationality.ArName;
                }
            }

            ClassroomGetDTO classsDTO = mapper.Map<ClassroomGetDTO>(cls);

            string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? "Egypt Standard Time"
                : "Africa/Cairo";

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            School_GetDTO schoolDTO = _schoolHeaderService.GetSchoolHeader(Unit_Of_Work, schoolId, Request);

            return Ok(new
            {
                Students = studentDTOs,
                StudentsCount = studentDTOs.Count,
                School = schoolDTO,
                Class = classsDTO,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            });
        }

        /////

        [HttpGet("GetStudentByYearID")]
        public async Task<IActionResult> GetStudentByYearID([FromQuery] long yearId, [FromQuery] long stuId, [FromQuery] long schoolId)
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

            if (yearId == null || yearId == 0)
            {
                return BadRequest("Year Id can't be null");
            }

            if (stuId == null || stuId == 0)
            {
                return BadRequest("Student Id can't be null");
            }

            if (schoolId == null || schoolId == 0)
            {
                return BadRequest("School Id can't be null");
            }

            Student student = await Unit_Of_Work.student_Repository.FindByIncludesAsync(
                 query => query.IsDeleted != true && query.ID == stuId,
                 query => query.Include(stu => stu.Gender),
                 query => query.Include(stu => stu.RegistrationFormParent),
                 query => query.Include(stu => stu.Parent));

            if (student == null)
            {
                return NotFound("No Student with this Id");
            }

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.ID == yearId
                );
            if (academicYear == null)
            {
                return NotFound("No Academic Year with this Id");
            }

            List<Classroom> classrooms = Unit_Of_Work.classroom_Repository.FindBy(d => d.IsDeleted != true && d.AcademicYearID == yearId);

            if (classrooms == null || classrooms.Count == 0)
            {
                return NotFound("No Classes found.");
            }

            long clsID = 0;
            for (int i = 0; i < classrooms.Count; i++)
            {
                //StudentAcademicYear stuAY = Unit_Of_Work.studentAcademicYear_Repository.First_Or_Default(d => d.IsDeleted != true && d.ClassID == classrooms[i].ID && d.StudentID == stuId);
                StudentClassroom stuAY = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ClassID == classrooms[i].ID && d.StudentID == stuId);
                
                if (stuAY != null)
                {
                    clsID = stuAY.ClassID;
                }
            }

            Classroom cls = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == clsID);

            ClassroomGetDTO classDTO = mapper.Map<ClassroomGetDTO>(cls);

            StudentGetDTO studentDTO = mapper.Map<StudentGetDTO>(student);
            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(studentDTO.Nationality);

            if (nationality != null)
            {
                studentDTO.NationalityEnName = nationality.Name;
                studentDTO.NationalityArName = nationality.ArName;
            }

            string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? "Egypt Standard Time"
                : "Africa/Cairo";

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            School_GetDTO schoolDTO = _schoolHeaderService.GetSchoolHeader(Unit_Of_Work, schoolId, Request);

            return Ok(new
            {
                Student = studentDTO,
                School = schoolDTO,
                Class = classDTO,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            });
        }

        /////

        [HttpGet("GetStudentProofRegistrationAndSuccessForm")]
        public async Task<IActionResult> GetStudentProofRegistrationAndSuccessForm([FromQuery] long yearId, [FromQuery] long stuId, [FromQuery] long schoolId)
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

            if (yearId == null || yearId == 0)
            {
                return BadRequest("Year Id can't be null");
            }

            if (stuId == null || stuId == 0)
            {
                return BadRequest("Student Id can't be null");
            }

            if (schoolId == null || schoolId == 0)
            {
                return BadRequest("School Id can't be null");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(
                 query => query.IsDeleted != true && query.ID == stuId);

            if (student == null)
            {
                return NotFound("No Student with this Id");
            }

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.ID == yearId
                );
            if (academicYear == null)
            {
                return NotFound("No Academic Year with this Id");
            }

            List<Classroom> classroomsTo = await Unit_Of_Work.classroom_Repository.Select_All_With_IncludesById<Classroom>(
                query => query.IsDeleted != true && query.AcademicYearID == yearId,
                query => query.Include(d => d.AcademicYear),
                query => query.Include(d => d.Grade));

            if (classroomsTo == null || classroomsTo.Count == 0)
            {
                return NotFound("No Classes found.");
            }

            long clsToID = 0;
            for (int i = 0; i < classroomsTo.Count; i++)
            {
                //StudentAcademicYear stuAY = Unit_Of_Work.studentAcademicYear_Repository.First_Or_Default(d => d.IsDeleted != true && d.ClassID == classroomsTo[i].ID && d.StudentID == stuId);
                StudentClassroom stuAY = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ClassID == classroomsTo[i].ID && d.StudentID == stuId);

                if (stuAY != null)
                {
                    clsToID = stuAY.ClassID;
                }
            }

            Classroom clsTo = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == clsToID);

            ClassroomGetDTO classToDTO = mapper.Map<ClassroomGetDTO>(clsTo);

            List<Classroom> classroomsFrom = await Unit_Of_Work.classroom_Repository.Select_All_With_IncludesById<Classroom>(
                query => query.IsDeleted != true,
                query => query.Include(d => d.AcademicYear),
                query => query.Include(d => d.Grade));

            if (classroomsFrom == null || classroomsFrom.Count == 0)
            {
                return NotFound("No Classes found.");
            }

            classroomsFrom = classroomsFrom.OrderBy(c => c.AcademicYear.DateFrom).ToList();

            List<Classroom> classroomsFilteredFrom = new List<Classroom>();
            for (int i = 0; i < classroomsFrom.Count; i++)
            {
                //StudentAcademicYear stuAY = Unit_Of_Work.studentAcademicYear_Repository.First_Or_Default(d => d.IsDeleted != true && d.ClassID == classroomsFrom[i].ID && d.StudentID == stuId);
                StudentClassroom stuAY = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ClassID == classroomsFrom[i].ID && d.StudentID == stuId);

                if (stuAY != null)
                {
                    classroomsFilteredFrom.Add(classroomsFrom[i]);
                }
            }

            List<ClassroomGetDTO> classFromDTOs = mapper.Map<List<ClassroomGetDTO>>(classroomsFilteredFrom);

            StudentGetDTO studentDTO = mapper.Map<StudentGetDTO>(student);
            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(studentDTO.Nationality);

            if (nationality != null)
            {
                studentDTO.NationalityEnName = nationality.Name;
                studentDTO.NationalityArName = nationality.ArName;
            }

            string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? "Egypt Standard Time"
                : "Africa/Cairo";

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            School_GetDTO schoolDTO = _schoolHeaderService.GetSchoolHeader(Unit_Of_Work, schoolId, Request);

            return Ok(new
            {
                Student = studentDTO,
                School = schoolDTO,
                ClassFrom = classFromDTOs[0],
                ClassTo = classToDTO,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            });
        }

        /////

        [HttpGet("GetStudentProofRegistration")]
        public async Task<IActionResult> GetStudentProofRegistration([FromQuery] long yearId, [FromQuery] long stuId, [FromQuery] long schoolId)
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

            if (yearId == null || yearId == 0)
            {
                return BadRequest("Year Id can't be null");
            }

            if (stuId == null || stuId == 0)
            {
                return BadRequest("Student Id can't be null");
            }

            if (schoolId == null || schoolId == 0)
            {
                return BadRequest("School Id can't be null");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(
                 query => query.IsDeleted != true && query.ID == stuId);

            if (student == null)
            {
                return NotFound("No Student with this Id");
            }

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.ID == yearId
                );
            if (academicYear == null)
            {
                return NotFound("No Academic Year with this Id");
            }

            List<Classroom> classrooms = await Unit_Of_Work.classroom_Repository.Select_All_With_IncludesById<Classroom>(
                query => query.IsDeleted != true && query.AcademicYearID == yearId,
                query => query.Include(d => d.AcademicYear),
                query => query.Include(d => d.Grade));

            if (classrooms == null || classrooms.Count == 0)
            {
                return NotFound("No Classes found.");
            }

            long clsID = 0;
            for (int i = 0; i < classrooms.Count; i++)
            {
                //StudentAcademicYear stuAY = Unit_Of_Work.studentAcademicYear_Repository.First_Or_Default(d => d.IsDeleted != true && d.ClassID == classrooms[i].ID && d.StudentID == stuId);
                StudentClassroom stuAY = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ClassID == classrooms[i].ID && d.StudentID == stuId);

                if (stuAY != null)
                {
                    clsID = stuAY.ClassID;
                }
            }

            Classroom cls = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == clsID);

            ClassroomGetDTO classDTO = mapper.Map<ClassroomGetDTO>(cls);

            StudentGetDTO studentDTO = mapper.Map<StudentGetDTO>(student);
            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(studentDTO.Nationality);

            if (nationality != null)
            {
                studentDTO.NationalityEnName = nationality.Name;
                studentDTO.NationalityArName = nationality.ArName;
            }

            string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? "Egypt Standard Time"
                : "Africa/Cairo";

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            School_GetDTO schoolDTO = _schoolHeaderService.GetSchoolHeader(Unit_Of_Work, schoolId, Request);

            return Ok(new
            {
                Student = studentDTO,
                School = schoolDTO,
                Class = classDTO,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            });
        }

        /////

        [HttpGet("GetByClassIDReport")]
        public async Task<IActionResult> GetByClassID([FromQuery] long schoolId, [FromQuery] long classId)
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

            if (schoolId == null || schoolId == 0)
            {
                return BadRequest("School Id can't be null");
            }

            if (classId == null || classId == 0)
            {
                return BadRequest("Class Id can't be null");
            }

            Classroom cls = Unit_Of_Work.classroom_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.ID == classId
                );
            if (cls == null)
            {
                return NotFound("No Class with this Id");
            }


            //List<StudentAcademicYear> studentAcademicYears = await Unit_Of_Work.studentAcademicYear_Repository
            //    .Select_All_With_IncludesById<StudentAcademicYear>(
            //        s => s.IsDeleted != true && s.ClassID == classId && s.SchoolID == schoolId,
            //        query => query.Include(stu => stu.Student)
            //          .ThenInclude(stu => stu.Gender)
            //    );

            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository
                .Select_All_With_IncludesById<StudentClassroom>(
                    s => s.IsDeleted != true && s.ClassID == classId && s.Classroom.AcademicYear.SchoolID == schoolId,
                    query => query.Include(stu => stu.Student)
                      .ThenInclude(stu => stu.Gender)
                );


            if (studentClassrooms == null || studentClassrooms.Count == 0)
            {
                return NotFound("No students found.");
            }

            List<Student> students = studentClassrooms.Select(sa => sa.Student).ToList();
            List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(students);

            for (int i = 0; i < studentDTOs.Count; i++)
            {
                Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(studentDTOs[i].Nationality);
                if (nationality != null)
                {
                    studentDTOs[i].NationalityEnName = nationality.Name;
                    studentDTOs[i].NationalityArName = nationality.ArName;
                }

                List<BusStudent> busStudents = await Unit_Of_Work.busStudent_Repository.Select_All_With_IncludesById<BusStudent>(
                   query => query.IsDeleted != true && query.Semester.AcademicYearID == cls.AcademicYearID && query.Semester.IsCurrent == true,
                   query => query.Include(d => d.BusCategory),
                   query => query.Include(d => d.Semester));

                if (busStudents.Count == 0)
                {
                    studentDTOs[i].IsRegisteredToBus = null;
                }
                else
                {
                    busStudents = busStudents.OrderBy(c => c.Semester.DateFrom).ToList();
                    studentDTOs[i].IsRegisteredToBus = $"Yes / {busStudents[busStudents.Count - 1].BusCategory.Name}";
                }
            }


            string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? "Egypt Standard Time"
                : "Africa/Cairo";

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            School_GetDTO schoolDTO = _schoolHeaderService.GetSchoolHeader(Unit_Of_Work, schoolId, Request);

            return Ok(new
            {
                Students = studentDTOs,
                School = schoolDTO,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            });
        }

        /////

        [HttpGet("AcademicSequentialReport")]
        public async Task<IActionResult> AcademicSequentialReport([FromQuery] long stuId, [FromQuery] long schoolId)
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

            if (stuId == null || stuId == 0)
            {
                return BadRequest("Student Id can't be null");
            }

            if (schoolId == null || schoolId == 0)
            {
                return BadRequest("School Id can't be null");
            }

            Student student = await Unit_Of_Work.student_Repository.FindByIncludesAsync(
                 query => query.IsDeleted != true && query.ID == stuId,
                 query => query.Include(stu => stu.Gender),
                 query => query.Include(stu => stu.Parent));

            if (student == null)
            {
                return NotFound("No Student with this Id");
            }

            //List<StudentAcademicYear> StudentAcademicYear = await Unit_Of_Work.studentAcademicYear_Repository.Select_All_With_IncludesById<StudentAcademicYear>(
            //     query => query.IsDeleted != true && query.StudentID == stuId && query.SchoolID == schoolId,
            //     query => query.Include(stu => stu.Grade),
            //     query => query.Include(stu => stu.Classroom).ThenInclude(d => d.AcademicYear));
            
            List<StudentGrade> StudentGrade = await Unit_Of_Work.studentGrade_Repository.Select_All_With_IncludesById<StudentGrade>(
                 query => query.IsDeleted != true && query.StudentID == stuId && query.AcademicYear.SchoolID == schoolId,
                 query => query.Include(stu => stu.Grade),
                 query => query.Include(stu => stu.AcademicYear));

            if (StudentGrade == null)
            {
                return NotFound("No Student Grade With This Student ID");
            }

            List<GradeWithAcademicYearGetDTO> gradeWithAcYears = new List<GradeWithAcademicYearGetDTO>();

            string currentGradeName = "";

            for (int i = 0; i < StudentGrade.Count; i++)
            {
                GradeWithAcademicYearGetDTO data = new GradeWithAcademicYearGetDTO();
                data.GradeID = StudentGrade[i].GradeID;
                data.GradeName = StudentGrade[i].Grade.Name;
                data.AcademicYearID = StudentGrade[i].AcademicYearID;
                data.AcademicYearName = StudentGrade[i].AcademicYear.Name;
                gradeWithAcYears.Add(data);

                if (StudentGrade[i].AcademicYear.IsActive == true)
                {
                    currentGradeName = StudentGrade[i].Grade.Name;
                }
            }

            StudentGetDTO studentDTO = mapper.Map<StudentGetDTO>(student);
            studentDTO.CurrentGradeName = currentGradeName;

            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(studentDTO.Nationality);

            if (nationality != null)
            {
                studentDTO.NationalityEnName = nationality.Name;
                studentDTO.NationalityArName = nationality.ArName;
            }

            string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? "Egypt Standard Time"
                : "Africa/Cairo";

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            School_GetDTO schoolDTO = _schoolHeaderService.GetSchoolHeader(Unit_Of_Work, schoolId, Request);

            return Ok(new
            {
                Student = studentDTO,
                School = schoolDTO,
                Grades = gradeWithAcYears,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            });
        }

        //////

        [HttpGet("TransferedFromKindergartenReport")]
        public async Task<IActionResult> TransferedFromKindergartenReport([FromQuery] long stuId, [FromQuery] long schoolId)
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

            if (stuId == null || stuId == 0)
            {
                return BadRequest("Student Id can't be null");
            }

            if (schoolId == null || schoolId == 0)
            {
                return BadRequest("School Id can't be null");
            }

            Student student = await Unit_Of_Work.student_Repository.FindByIncludesAsync(
                 query => query.IsDeleted != true && query.ID == stuId,
                 query => query.Include(stu => stu.Gender),
                 query => query.Include(stu => stu.Parent));

            if (student == null)
            {
                return NotFound("No Student with this Id");
            }

            //List<StudentAcademicYear> StudentAcademicYear = await Unit_Of_Work.studentAcademicYear_Repository.Select_All_With_IncludesById<StudentAcademicYear>(
            //     query => query.IsDeleted != true && query.StudentID == stuId && query.SchoolID == schoolId,
            //     query => query.Include(stu => stu.Grade),
            //     query => query.Include(stu => stu.Classroom).ThenInclude(d => d.AcademicYear));

            List<StudentGrade> StudentGrade = await Unit_Of_Work.studentGrade_Repository.Select_All_With_IncludesById<StudentGrade>(
                 query => query.IsDeleted != true && query.StudentID == stuId && query.AcademicYear.SchoolID == schoolId,
                 query => query.Include(stu => stu.Grade),
                 query => query.Include(stu => stu.AcademicYear));


            if (StudentGrade == null)
            {
                return NotFound("No Student Grade With This Student ID");
            }

            string currentGradeName = "";
            string CurrentAcademicYear = "";

            for (int i = 0; i < StudentGrade.Count; i++)
            {
                if (StudentGrade[i].AcademicYear.IsActive == true)
                {
                    currentGradeName = StudentGrade[i].Grade.Name;
                    CurrentAcademicYear = StudentGrade[i].AcademicYear.Name;
                }
            }

            StudentGetDTO studentDTO = mapper.Map<StudentGetDTO>(student);
            studentDTO.CurrentGradeName = currentGradeName;
            studentDTO.CurrentAcademicYear = CurrentAcademicYear;

            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(studentDTO.Nationality);

            if (nationality != null)
            {
                studentDTO.NationalityEnName = nationality.Name;
                studentDTO.NationalityArName = nationality.ArName;
            }

            string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? "Egypt Standard Time"
                : "Africa/Cairo";

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            School_GetDTO schoolDTO = _schoolHeaderService.GetSchoolHeader(Unit_Of_Work, schoolId, Request);

            return Ok(new
            {
                Student = studentDTO,
                School = schoolDTO,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            });
        }

        //////

        [HttpPut("StudentAccounting")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Student Edit Accounting" }
        )]
        public async Task<IActionResult> EditStudentAccountingAsync(AccountingStudentPutDTO newStudent)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == newStudent.ID && s.IsDeleted != true);
            if (student == null || student.IsDeleted == true)
            {
                return NotFound("No student with this ID");
            }

            if (newStudent.Email != null)
            {
                Student studentCheckEnail = Unit_Of_Work.student_Repository.First_Or_Default(s => s.Email == newStudent.Email && s.ID!=newStudent.ID );
                if (studentCheckEnail != null)
                {
                    return NotFound("This Email Already Taken");
                }
            }

            if (newStudent.AccountNumberID != null && newStudent.AccountNumberID!=0)
            {
                AccountingTreeChart account = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newStudent.AccountNumberID);

                if (account == null)
                {
                    return NotFound("No Account chart with this Id");
                }
                else
                {
                    if (account.SubTypeID == 1)
                    {
                        return BadRequest("You can't use main account, only sub account");
                    }

                    if (account.LinkFileID != 13)
                    {
                        return BadRequest("Wrong Link File, it should be Asset file link");
                    }
                }
            }
            else
            {
                newStudent.AccountNumberID = null;

            }


            if (newStudent.Nationality != 0 && newStudent.Nationality != null)
            {
                Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(newStudent.Nationality);
                if (nationality == null)
                {
                    return BadRequest("There is no nationality with this id");
                }

            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Student Edit Accounting", roleId, userId, student);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newStudent, student);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            student.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                student.UpdatedByOctaId = userId;
                if (student.UpdatedByUserId != null)
                {
                    student.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                student.UpdatedByUserId = userId;
                if (student.UpdatedByOctaId != null)
                {
                    student.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.student_Repository.Update(student);
            Unit_Of_Work.SaveChanges();
            return Ok(newStudent);
        }

        ////

        [HttpGet("SearchByNationalID/{NationalID}")]
        public async Task<IActionResult> GetByNationalityAsync(string NationalID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Student student = await Unit_Of_Work.student_Repository.FindByIncludesAsync(
                query => query.IsDeleted != true && query.NationalID == NationalID,
                query => query.Include(stu => stu.Gender),
                query => query.Include(stu => stu.AccountNumber));

            if (student == null || student.IsDeleted == true)
            {
                return NotFound("No Student found");
            }

            StudentGetDTO StudentDTO = mapper.Map<StudentGetDTO>(student);
            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(StudentDTO.Nationality);
            if (nationality != null)
            {
                StudentDTO.NationalityEnName = nationality.Name;
                StudentDTO.NationalityArName = nationality.ArName;
            }


            return Ok(StudentDTO);
        }

        ////

        [HttpGet("SearchByMultiParameters")]
        public async Task<IActionResult> SearchByMultiParameters([FromQuery] MultiParametersForStudentDTO parameters, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            
            List<Student> students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(
                s => s.IsDeleted != true,
                query => query.Include(Income => Income.Gender),
                query => query.Include(Income => Income.StudentGrades).ThenInclude(g => g.Grade),
                query => query.Include(Income => Income.StudentGrades).ThenInclude(g => g.AcademicYear),
                query => query.Include(Income => Income.StudentClassrooms).ThenInclude(c => c.Classroom)
                );

            if (parameters.ID.HasValue)
                students = students.Where(s => s.ID == parameters.ID.Value).ToList();

            if (!string.IsNullOrWhiteSpace(parameters.Name))
            {
                var name = parameters.Name.ToLower();
                students = students.Where(s =>
                    (s.en_name != null && s.en_name.ToLower().Contains(name)) ||
                    (s.ar_name != null && s.ar_name.ToLower().Contains(name))
                ).ToList();
            }

            if (!string.IsNullOrWhiteSpace(parameters.NationalID))
                students = students.Where(s => s.NationalID == parameters.NationalID && s.IsDeleted != true).ToList();
             
            if (parameters.AcademicYearID.HasValue)
                students = students.Where(s => s.StudentGrades.Any(g => g.AcademicYearID == parameters.AcademicYearID.Value && g.IsDeleted != true)).ToList();

            if (parameters.GradeID.HasValue)
                students = students.Where(s => s.StudentGrades.Any(g => g.GradeID == parameters.GradeID.Value && g.IsDeleted != true)).ToList();

            if (parameters.ClassroomID.HasValue)
                students = students.Where(s => s.StudentClassrooms.Any(c => c.ClassID == parameters.ClassroomID.Value && c.IsDeleted != true)).ToList();

            int totalRecords = students.Count;
             
            var finalStudents = students
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            if (finalStudents == null || finalStudents.Count == 0)
            {
                return NotFound("No students found");
            }

            //List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(finalStudents);
            var studentDTOs = finalStudents
                .Select(student =>
                { 
                    var dto = mapper.Map<StudentGetDTO>(student);

                    // Manually assign conditional fields
                    if (parameters.AcademicYearID.HasValue)
                    {
                        dto.AcademicYearName = student.StudentGrades
                            .FirstOrDefault(g => g.AcademicYearID == parameters.AcademicYearID.Value && g.IsDeleted != true)?.AcademicYear?.Name;
                    }
                    else
                    {
                        dto.AcademicYearName = student.StudentGrades
                            .Where(g => g.AcademicYear != null && g.AcademicYear.IsActive && g.AcademicYear.IsDeleted != true)
                            .OrderByDescending(g => g.AcademicYearID)
                            .Select(g => g.AcademicYear.Name)
                            .FirstOrDefault();
                    }

                    if (parameters.GradeID.HasValue)
                    {
                        dto.GradeName = student.StudentGrades
                            .FirstOrDefault(g => g.GradeID == parameters.GradeID.Value && g.IsDeleted != true)?.Grade?.Name;
                    }
                    else
                    {
                        if (parameters.AcademicYearID.HasValue)
                        {
                            dto.GradeName = student.StudentGrades
                            .FirstOrDefault(g => g.AcademicYearID == parameters.AcademicYearID.Value && g.IsDeleted != true)?.Grade?.Name;
                        }
                        else
                        {
                            dto.GradeName = student.StudentGrades
                                .Where(g => g.AcademicYear != null && g.AcademicYear.IsActive && g.AcademicYear.IsDeleted != true)
                                .OrderByDescending(g => g.GradeID)
                                .Select(g => g.Grade.Name)
                                .FirstOrDefault();
                        }
                    }

                    if (parameters.ClassroomID.HasValue)
                    {
                        dto.ClassName = student.StudentClassrooms
                            .FirstOrDefault(c => c.ClassID == parameters.ClassroomID.Value && c.IsDeleted != true)?.Classroom?.Name;
                    }
                    else
                    {
                        if (parameters.AcademicYearID.HasValue)
                        {
                            if (parameters.GradeID.HasValue)
                            {
                                dto.ClassName = student.StudentClassrooms
                                    .FirstOrDefault(c =>
                                        c.Classroom.AcademicYearID == parameters.AcademicYearID.Value &&
                                        c.Classroom.GradeID == parameters.GradeID.Value &&
                                        c.IsDeleted != true
                                    )?.Classroom?.Name;
                            }
                            else
                            {
                                dto.ClassName = student.StudentClassrooms
                                    .FirstOrDefault(c =>
                                        c.Classroom.AcademicYearID == parameters.AcademicYearID.Value &&
                                        c.IsDeleted != true
                                    )?.Classroom?.Name;
                            }
                        }
                        else
                        {
                            dto.ClassName = student.StudentClassrooms
                                .Where(c => c.Classroom?.AcademicYear != null &&
                                            c.Classroom.AcademicYear.IsActive && c.Classroom.AcademicYear.IsDeleted != true)
                                .OrderByDescending(c => c.ClassID)
                                .Select(c => c.Classroom.Name)
                                .FirstOrDefault();
                        }
                    }

                    return dto;
                })
                .ToList();

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = studentDTOs, Pagination = paginationMetadata }); 
        }

        ////

        [HttpDelete("{ID}")]
        public async Task<IActionResult> Delete(long ID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }
            Student student = await Unit_Of_Work.student_Repository.FindByIncludesAsync(
                query => query.IsDeleted != true && query.ID == ID,
                query => query.Include(stu => stu.AccountNumber));

            if (student == null || student.IsDeleted == true)
            {
                return NotFound("No Student found");
            }

            //if (userTypeClaim == "employee")
            //{
            //    IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Student", roleId, userId, student);
            //    if (accessCheck != null)
            //    {
            //        return accessCheck;
            //    }
            //}

            student.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            student.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                student.DeletedByOctaId = userId;
                if (student.DeletedByUserId != null)
                {
                    student.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                student.DeletedByUserId = userId;
                if (student.DeletedByOctaId != null)
                {
                    student.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.student_Repository.Update(student);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }

        //////////////////////////////////////////////////////

        [HttpDelete("Suspend/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Student" }
        )]
        public IActionResult Suspend(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (id == null)
            {
                return BadRequest("id cannot be null");
            }

            Student stud = Unit_Of_Work.student_Repository.Select_By_Id(id);

            if (stud == null || stud.IsDeleted == true)
            {
                return NotFound("No Student with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Student", roleId, userId, stud);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            stud.IsSuspended = !stud.IsSuspended;
            stud.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                stud.UpdatedByOctaId = userId;
                if (stud.UpdatedByUserId != null)
                {
                    stud.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                stud.UpdatedByUserId = userId;
                if (stud.UpdatedByOctaId != null)
                {
                    stud.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.student_Repository.Update(stud);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
