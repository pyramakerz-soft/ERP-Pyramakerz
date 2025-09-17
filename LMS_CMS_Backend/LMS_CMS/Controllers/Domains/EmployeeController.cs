using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.BusModule;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Octa;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Reflection;
using System.Text.RegularExpressions;


namespace LMS_CMS_PL.Controllers.Domains
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly UOW _Unit_Of_Work_Octa;
        private readonly CheckPageAccessService _checkPageAccessService;

        public EmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, UOW Unit_Of_Work, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _Unit_Of_Work_Octa = Unit_Of_Work;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Employee" }
        )]
        public async Task<IActionResult> GetAsync()
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
            List<Employee> Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(
                    sem => sem.IsDeleted != true,
                    query => query.Include(emp => emp.BusCompany),
                    query => query.Include(emp => emp.EmployeeType),
                    query => query.Include(emp => emp.Role));

            if (Employees == null || Employees.Count == 0)
            {
                return NotFound();
            }

            List<Employee_GetDTO> EmployeesDTO = mapper.Map<List<Employee_GetDTO>>(Employees);
            foreach (var employeeDTO in EmployeesDTO)
            {
                List<EmployeeAttachment> employeeAttachments = Unit_Of_Work.employeeAttachment_Repository.FindBy(s => s.EmployeeID == employeeDTO.ID);
                List<EmployeeAttachmentDTO> filesDTO = mapper.Map<List<EmployeeAttachmentDTO>>(employeeAttachments);
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (filesDTO != null)
                {
                    employeeDTO.Files = filesDTO;
                    foreach (var file in filesDTO)
                    {
                        if (!string.IsNullOrEmpty(file.Link))
                        {
                            file.Link = $"{serverUrl}{file.Link.Replace("\\", "/")}";
                        }
                    }
                }
                else
                employeeDTO.Files = new List<EmployeeAttachmentDTO>();


                List<Floor> floors = Unit_Of_Work.floor_Repository.FindBy(s => s.FloorMonitorID == employeeDTO.ID && s.IsDeleted != true);

                if (floors != null && floors.Any())
                    employeeDTO.FloorsSelected = floors.Select(v => v.ID).ToList();
                else
                    employeeDTO.FloorsSelected = new List<long>();


                List<SubjectSupervisor> subjectSupervisors = Unit_Of_Work.subjectSupervisor_Repository
                   .FindBy(s => s.EmployeeID == employeeDTO.ID && s.IsDeleted != true);

                var subjectIds = subjectSupervisors.Select(ss => ss.SubjectID).ToList();

                List<Subject> subjects = Unit_Of_Work.subject_Repository
                    .FindBy(s => subjectIds.Contains(s.ID) && s.IsDeleted != true);


                if (subjects != null && subjects.Any())
                    employeeDTO.SubjectSelected = subjects.Select(v => v.ID).ToList();
                else
                    employeeDTO.SubjectSelected = new List<long>();


                List<GradeSupervisor> gradeSupervisors = Unit_Of_Work.gradeSupervisor_Repository
                  .FindBy(s => s.EmployeeID == employeeDTO.ID && s.IsDeleted != true);

                var gradeIds = gradeSupervisors.Select(ss => ss.GradeID).ToList();

                List<Grade> grades = Unit_Of_Work.grade_Repository
                    .FindBy(s => gradeIds.Contains(s.ID) && s.IsDeleted != true);

                if (grades != null && grades.Any())
                    employeeDTO.GradeSelected = grades.Select(v => v.ID).ToList();
                else
                    employeeDTO.GradeSelected = new List<long>();

                // Get current month and year
                var currentDate = DateTime.UtcNow;
                var currentMonth = currentDate.Month;
                var currentYear = currentDate.Year;

                // Filter leave requests for the current month only
                List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository
                    .FindBy(l => l.EmployeeID == employeeDTO.ID
                              && l.IsDeleted != true
                              && l.Date.Month == currentMonth
                              && l.Date.Year == currentYear);

                // Sum up hours and minutes
                var allHours = leaveRequests.Sum(l => l.Hours);
                var allMinutes = leaveRequests.Sum(l => l.Minutes);

                // Convert total minutes into hours and remaining minutes
                allHours += allMinutes / 60;
                allMinutes = allMinutes % 60;

                // Convert hours and minutes to decimal (e.g., 4.5 for 4 hours 30 minutes)
                employeeDTO.MonthlyLeaveRequestUsed = allHours + (allMinutes / 60.0m);

            }

            return Ok(EmployeesDTO);
        }

        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByTypeId/{TypeId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Employee" }
        )]
        public async Task<IActionResult> GetByTypeIDAsync(long TypeId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            EmployeeType type = Unit_Of_Work.employeeType_Repository.Select_By_Id(TypeId);
            if (type == null)
            {
                return NotFound("No Type with this Id");
            }
            List<Employee> employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(
                    sem => sem.IsDeleted != true && sem.EmployeeTypeID == TypeId,
                    query => query.Include(emp => emp.BusCompany),
                    query => query.Include(emp => emp.EmployeeType),
                    query => query.Include(emp => emp.Role));

            if (employees == null || employees.Count == 0)
            {
                return NotFound("There is no employees with this type");
            }

            List<Employee_GetDTO> employeeDTOs = mapper.Map<List<Employee_GetDTO>>(employees);
            foreach (var employeeDTO in employeeDTOs)
            {
                List<EmployeeAttachment> employeeAttachments = Unit_Of_Work.employeeAttachment_Repository.FindBy(s => s.EmployeeID == employeeDTO.ID);
                List<EmployeeAttachmentDTO> filesDTO = mapper.Map<List<EmployeeAttachmentDTO>>(employeeAttachments);
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (filesDTO != null)
                {
                    employeeDTO.Files = filesDTO;
                    foreach (var file in filesDTO)
                    {
                        if (!string.IsNullOrEmpty(file.Link))
                        {
                            file.Link = $"{serverUrl}{file.Link.Replace("\\", "/")}";
                        }
                    }
                }
                else
                    employeeDTO.Files = new List<EmployeeAttachmentDTO>();

            }

            return Ok(employeeDTOs);
        }
        
        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByDepartmentId/{DepartmentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Employee" }
        )]
        public IActionResult GetByDepartmentId(long DepartmentId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            Department department = Unit_Of_Work.department_Repository.Select_By_Id(DepartmentId);
            if (department == null)
            {
                return NotFound("No Department with this Id");
            }
            List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(
                    sem => sem.IsDeleted != true && sem.DepartmentID == DepartmentId);

            if (employees == null || employees.Count == 0)
            {
                return NotFound("There is no employees in this department");
            }

            List<Employee_GetDTO> employeeDTOs = mapper.Map<List<Employee_GetDTO>>(employees); 

            return Ok(employeeDTOs);
        }

        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetWhoCanAcceptRequestsFromEmployeeByDepartmentId/{DepartmentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
        )]
        public IActionResult GetWhoCanAcceptRequestsFromEmployeeByDepartmentId(long DepartmentId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            Department department = Unit_Of_Work.department_Repository.Select_By_Id(DepartmentId);
            if (department == null)
            {
                return NotFound("No Department with this Id");
            }
            List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(
                    sem => sem.IsDeleted != true && sem.DepartmentID == DepartmentId && sem.CanReceiveRequest == true);

            if (employees == null || employees.Count == 0)
            {
                return NotFound("There is no employees in this department that can accept requests");
            }

            List<Employee_GetDTO> employeeDTOs = mapper.Map<List<Employee_GetDTO>>(employees); 

            return Ok(employeeDTOs);
        }
        
        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetWhoCanAcceptRequestsFromParentAndStudentByDepartmentId/{DepartmentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult GetWhoCanAcceptRequestsFromParentAndStudentByDepartmentId(long DepartmentId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            Department department = Unit_Of_Work.department_Repository.Select_By_Id(DepartmentId);
            if (department == null)
            {
                return NotFound("No Department with this Id");
            }
            List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(
                    sem => sem.IsDeleted != true && sem.DepartmentID == DepartmentId && sem.CanReceiveRequestFromParent == true);

            if (employees == null || employees.Count == 0)
            {
                return NotFound("There is no employees in this department that can accept requests");
            }

            List<Employee_GetDTO> employeeDTOs = mapper.Map<List<Employee_GetDTO>>(employees); 

            return Ok(employeeDTOs);
        }
        
        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetWhoCanAcceptMessagesFromParentAndStudentByDepartmentId/{DepartmentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult GetWhoCanAcceptMessagesFromParentAndStudentByDepartmentId(long DepartmentId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            Department department = Unit_Of_Work.department_Repository.Select_By_Id(DepartmentId);
            if (department == null)
            {
                return NotFound("No Department with this Id");
            }
            List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(
                    sem => sem.IsDeleted != true && sem.DepartmentID == DepartmentId && sem.CanReceiveMessageFromParent == true);

            if (employees == null || employees.Count == 0)
            {
                return NotFound("There is no employees in this department that can accept messages");
            }

            List<Employee_GetDTO> employeeDTOs = mapper.Map<List<Employee_GetDTO>>(employees); 

            return Ok(employeeDTOs);
        }

        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId/{SubjectId}/{StudentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentIdAsync(long SubjectId, long StudentId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == SubjectId);
            if (subject == null)
            {
                return NotFound("No Subject with this Id");
            }
            
            Student student = Unit_Of_Work.student_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == StudentId);
            if (student == null)
            {
                return NotFound("No student with this Id");
            } 

            List<long> teacherIDs = new List<long>();

            // Get student current grade
            StudentGrade studentGrade = Unit_Of_Work.studentGrade_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.Grade.IsDeleted != true && d.Grade.Section.IsDeleted != true && d.AcademicYear.IsDeleted != true && d.AcademicYear.School.IsDeleted != true
                && d.AcademicYear.IsActive == true && d.StudentID == StudentId);

            if (studentGrade != null)
            {
                // Get his classroom
                StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(
                    d => d.IsDeleted != true && d.Classroom.IsDeleted != true && d.Classroom.AcademicYear.IsDeleted != true && d.Classroom.AcademicYear.IsActive == true
                    && d.StudentID == StudentId && d.Classroom.GradeID == studentGrade.GradeID);

                if (studentClassroom != null)
                {
                    StudentClassroomSubject studentClassroomSubject = Unit_Of_Work.studentClassroomSubject_Repository.First_Or_Default(
                        d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID && d.Subject.IsDeleted != true && d.Hide == false && d.SubjectID == SubjectId);

                    if (studentClassroomSubject != null)
                    {
                        ClassroomSubject classroomSubject = await Unit_Of_Work.classroomSubject_Repository.FindByIncludesAsync(
                            d => d.IsDeleted != true && d.ClassroomID == studentClassroom.ClassID && d.SubjectID == SubjectId && d.Hide == false,
                            query => query.Include(d => d.Teacher)
                            );

                        if (classroomSubject != null)
                        {
                            if(classroomSubject.TeacherID != null && classroomSubject.Teacher.IsDeleted != true)
                            {
                                teacherIDs.Add(classroomSubject.TeacherID.Value);
                            }
                             
                            List<ClassroomSubjectCoTeacher> classroomSubjectCoTeachers = Unit_Of_Work.classroomSubjectCoTeacher_Repository.FindBy(
                            d => d.ClassroomSubjectID == classroomSubject.ID && d.IsDeleted != true && d.CoTeacher.IsDeleted != true
                            );
                            if (classroomSubjectCoTeachers != null && classroomSubjectCoTeachers.Count != 0)
                            {
                                teacherIDs.AddRange(classroomSubjectCoTeachers.Select(ct => ct.CoTeacherID));
                            }
                        }
                    } 
                }
            }

            List<RemedialClassroomStudent> remedialClassroomStudents = await Unit_Of_Work.remedialClassroomStudent_Repository.Select_All_With_IncludesById<RemedialClassroomStudent>(
                d => d.IsDeleted != true && d.RemedialClassroom.IsDeleted != true && d.RemedialClassroom.Subject.IsDeleted != true && d.RemedialClassroom.AcademicYear.IsDeleted != true
                && d.RemedialClassroom.AcademicYear.School.IsDeleted != true && d.RemedialClassroom.Subject.Grade.IsDeleted != true && d.RemedialClassroom.Subject.Grade.Section.IsDeleted != true
                && d.RemedialClassroom.AcademicYear.IsActive == true && d.StudentID == StudentId && d.RemedialClassroom.SubjectID == SubjectId,
                query => query.Include(d => d.RemedialClassroom)
                );

            if (remedialClassroomStudents != null && remedialClassroomStudents.Count != 0)
            {
                teacherIDs.AddRange(remedialClassroomStudents.Select(ct => ct.RemedialClassroom.TeacherID));
            }

            if (teacherIDs == null || teacherIDs.Count == 0)
            {
                return NotFound("There are no teachers for this student and subject");
            }

            teacherIDs = teacherIDs.Distinct().ToList();

            List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(d => d.IsDeleted != true && teacherIDs.Contains(d.ID));

            List<Employee_GetDTO> employeeDTOs = mapper.Map<List<Employee_GetDTO>>(employees);

            return Ok(employeeDTOs);
        }

        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetMyData")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> GetByIDAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            Employee employee = await Unit_Of_Work.employee_Repository.FindByIncludesAsync(
                    emp => emp.IsDeleted != true && emp.ID == userId,
                    query => query.Include(emp => emp.BusCompany),
                    query => query.Include(emp => emp.EmployeeType),
                    query => query.Include(emp => emp.Role));

            if (employee == null || employee.IsDeleted == true)
            {
                return NotFound("No employee found");
            }

            Employee_GetDTO employeeDTO = mapper.Map<Employee_GetDTO>(employee);  
              
            return Ok(employeeDTO); 
        }
        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{empId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Employee" }
        )]
        public async Task<IActionResult> GetByIDAsync(long empId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Employee employee = await Unit_Of_Work.employee_Repository.FindByIncludesAsync(
                    emp => emp.IsDeleted != true && emp.ID == empId,
                    query => query.Include(emp => emp.BusCompany),
                    query => query.Include(emp => emp.EmployeeType),
                    query => query.Include(emp => emp.Role));

            if (employee == null || employee.IsDeleted == true)
            {
                return NotFound("No employee found");
            }

            Employee_GetDTO employeeDTO = mapper.Map<Employee_GetDTO>(employee);
            List<EmployeeAttachment> employeeAttachments = Unit_Of_Work.employeeAttachment_Repository.FindBy(s => s.EmployeeID == employeeDTO.ID &&s.IsDeleted!=true);
            List<EmployeeAttachmentDTO> filesDTO = mapper.Map<List<EmployeeAttachmentDTO>>(employeeAttachments);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (filesDTO != null)
            {
                employeeDTO.Files = filesDTO;
                foreach (var file in filesDTO)
                {
                    if (!string.IsNullOrEmpty(file.Link))
                    {
                        file.Link = $"{serverUrl}{file.Link.Replace("\\", "/")}";
                    }
                }
            }
            else
                employeeDTO.Files = new List<EmployeeAttachmentDTO>();

            ////////

            List<Floor> floors = Unit_Of_Work.floor_Repository.FindBy(s => s.FloorMonitorID == employeeDTO.ID && s.IsDeleted != true);

            if (floors != null && floors.Any())
                employeeDTO.FloorsSelected = floors.Select(v => v.ID).ToList();
            else
                employeeDTO.FloorsSelected = new List<long>();

            List<SubjectSupervisor> subjectSupervisors = Unit_Of_Work.subjectSupervisor_Repository
                   .FindBy(s => s.EmployeeID == employeeDTO.ID && s.IsDeleted != true);

            var subjectIds = subjectSupervisors.Select(ss => ss.SubjectID).ToList();

            List<Subject> subjects = Unit_Of_Work.subject_Repository
                .FindBy(s => subjectIds.Contains(s.ID) && s.IsDeleted != true);


            if (subjects != null && subjects.Any())
                employeeDTO.SubjectSelected = subjects.Select(v => v.ID).ToList();
            else
                employeeDTO.SubjectSelected = new List<long>();


            List<GradeSupervisor> gradeSupervisors = Unit_Of_Work.gradeSupervisor_Repository
              .FindBy(s => s.EmployeeID == employeeDTO.ID && s.IsDeleted != true);

            var gradeIds = gradeSupervisors.Select(ss => ss.GradeID).ToList();

            List<Grade> grades = Unit_Of_Work.grade_Repository
                .FindBy(s => gradeIds.Contains(s.ID) && s.IsDeleted != true);

            if (grades != null && grades.Any())
                employeeDTO.GradeSelected = grades.Select(v => v.ID).ToList();
            else
                employeeDTO.GradeSelected = new List<long>();


            List<EmployeeLocation> employeeLocations = Unit_Of_Work.employeeLocation_Repository
              .FindBy(s => s.EmployeeID == employeeDTO.ID && s.IsDeleted != true);

            var locationIds = employeeLocations.Select(ss => ss.LocationID).ToList();

            List<Location> locations = Unit_Of_Work.location_Repository
                .FindBy(s => locationIds.Contains(s.ID) && s.IsDeleted != true);

            if (locations != null && locations.Any())
                employeeDTO.LocationSelected = locations.Select(v => v.ID).ToList();
            else
                employeeDTO.LocationSelected = new List<long>();

            return Ok(employeeDTO); 
        }
        private string GetMimeType(string filePath)
        {
            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filePath, out var mimeType))
            {
                mimeType = "application/octet-stream"; // Default MIME type
            }
            return mimeType;
        }

        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("getInfoByToken")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> GetByTokenAsync()
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

            long empId = long.Parse(userIdClaim);

            Employee employee = await Unit_Of_Work.employee_Repository.FindByIncludesAsync(
                    emp => emp.IsDeleted != true && emp.ID == empId,
                    query => query.Include(emp => emp.BusCompany),
                    query => query.Include(emp => emp.EmployeeType),
                    query => query.Include(emp => emp.Role));

            if (employee == null || employee.IsDeleted == true)
            {
                return NotFound("No employee found");
            }

            Employee_GetDTO employeeDTO = mapper.Map<Employee_GetDTO>(employee);

            List<EmployeeLocation> employeeLocations = Unit_Of_Work.employeeLocation_Repository
              .FindBy(s => s.EmployeeID == employeeDTO.ID && s.IsDeleted != true);

            var locationIds = employeeLocations.Select(ss => ss.LocationID).ToList();

            List<Location> locations = Unit_Of_Work.location_Repository
                .FindBy(s => locationIds.Contains(s.ID) && s.IsDeleted != true);

            employeeDTO.Locations = mapper.Map<List<LocationGetDTO>>(locations);

            EmployeeClocks lastClock = Unit_Of_Work.employeeClocks_Repository
              .FindBy(e => e.IsDeleted != true && e.EmployeeID == employee.ID)
              .OrderByDescending(e => e.Date)
              .ThenByDescending(e => e.ClockIn)
              .FirstOrDefault();

            employeeDTO.IsClockedIn = lastClock != null && lastClock.ClockOut == null;

            return Ok(employeeDTO);
        }

        ///////////////////////////////////////////////////////////////////////////////////////


        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Employee Create" }
        )]
        public async Task<IActionResult> Add([FromForm] EmployeeAddDTO NewEmployee, [FromForm] List<EmployeeAttachmentAddDTO> files)
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
            if (NewEmployee == null)
            {
                return BadRequest("Employee data is required.");
            }

            //Validation
            string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (NewEmployee.Email != null && !Regex.IsMatch(NewEmployee.Email, pattern))
            {
                return BadRequest("Email Is Not Valid");
            } 
            if (NewEmployee.EmployeeTypeID == 2)
            {
                if (NewEmployee.LicenseNumber == null)
                    return BadRequest("License Number Is Required");
                if (NewEmployee.ExpireDate == null)
                    return BadRequest("Expire Date Is Required");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.User_Name == NewEmployee.User_Name);
            if (employee != null)
            {
                return BadRequest("This User Name Already Exist");
            }
            Employee CheckEmail = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.Email == NewEmployee.Email);
            if (CheckEmail != null)
            {
                return BadRequest("This Email Already Exist");
            }
            if (NewEmployee.BusCompanyID != null && NewEmployee.BusCompanyID != 0)
            {
                BusCompany bus = Unit_Of_Work.busCompany_Repository.First_Or_Default(b => b.ID == NewEmployee.BusCompanyID && b.IsDeleted != true);
                if (bus == null)
                {
                    return BadRequest("this bus company doesn't exist");
                }
            }
            else
            {
                NewEmployee.BusCompanyID = null;
            }
            if (NewEmployee.EmployeeTypeID != 0 && NewEmployee.EmployeeTypeID != null)
            {
                EmployeeType empType = Unit_Of_Work.employeeType_Repository.First_Or_Default(b => b.ID == NewEmployee.EmployeeTypeID);
                if (empType == null)
                {
                    return BadRequest("this Employee Type doesn't exist");
                }
            }
            else
            {
                return BadRequest("this Employee Type cannot be null");

            }
            if (NewEmployee.Role_ID != 0 && NewEmployee.Role_ID != null)
            {
                Role rolee = Unit_Of_Work.role_Repository.First_Or_Default(b => b.ID == NewEmployee.Role_ID && b.IsDeleted != true);
                if (rolee == null)
                {
                    return BadRequest("this role doesn't exist");
                }
            }
            else
            {
                return BadRequest("this role cannot be null");

            }
            ///create the object 
            if (employee == null)
            {
                employee = new Employee();
            }
            mapper.Map(NewEmployee, employee);
            employee.Password= BCrypt.Net.BCrypt.HashPassword(NewEmployee.Password);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            employee.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            employee.ConnectionStatusID = 1;
            if (userTypeClaim == "octa")
            {
                employee.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                employee.InsertedByUserId = userId;
            }

            Unit_Of_Work.employee_Repository.Add(employee);
            Unit_Of_Work.SaveChanges();

            //// Create floorMonitor
            if(NewEmployee.FloorsSelected!=null && NewEmployee.FloorsSelected.Count > 0)
            {
                foreach (var item in NewEmployee.FloorsSelected)
                {
                    Floor floor = Unit_Of_Work.floor_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (floor!=null)
                    {
                        floor.FloorMonitorID = employee.ID;
                        Unit_Of_Work.floor_Repository.Update(floor);
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Create GradeSupervisor
            if (NewEmployee.GradeSelected != null && NewEmployee.GradeSelected.Count > 0)
            {
                foreach (var item in NewEmployee.GradeSelected)
                {
                    Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (grade != null)
                    {
                       GradeSupervisor gradeSupervisor = new GradeSupervisor();
                        gradeSupervisor.GradeID = item;
                        gradeSupervisor.EmployeeID = employee.ID;
                        Unit_Of_Work.gradeSupervisor_Repository.Add(gradeSupervisor);
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Create SubjectSupervisor
            if (NewEmployee.SubjectSelected != null && NewEmployee.SubjectSelected.Count > 0)
            {
                foreach (var item in NewEmployee.SubjectSelected)
                {
                    Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (subject != null)
                    {
                        SubjectSupervisor subjectSupervisor = new SubjectSupervisor();
                        subjectSupervisor.SubjectID = item;
                        subjectSupervisor.EmployeeID = employee.ID;
                        Unit_Of_Work.subjectSupervisor_Repository.Add(subjectSupervisor);
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            ////create attachment folder
            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Attachments");
            var employeeFolder = Path.Combine(baseFolder, employee.User_Name);
            if (!Directory.Exists(employeeFolder))
            {
                Directory.CreateDirectory(employeeFolder);
            }

            if (files != null && files.Any())
            {
                foreach (var file in files)
                {
                    if (file.file.Length > 0)
                    {
                        var filePath = Path.Combine(employeeFolder, file.file.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.file.CopyToAsync(stream);
                        }
                    }
                    EmployeeAttachment uploadedFile = new EmployeeAttachment
                    {
                        EmployeeID = employee.ID,
                        Link = $"Uploads/Attachments/{employee.User_Name}/{file.file.FileName}",
                        Name = file.Name,
                    };

                    Unit_Of_Work.employeeAttachment_Repository.Add(uploadedFile);
                    Unit_Of_Work.SaveChanges();
                }
            }

            return Ok(NewEmployee);
        }

        ////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Employee Edit" }
        )]
        public async Task<IActionResult> EditAsync([FromForm] EmployeePutDTO newEmployee, [FromForm] List<EmployeeAttachmentAddDTO> files , [FromForm] List<EmployeeAttachmentAddDTO> editedFiles)
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

            if (newEmployee == null)
            {
                return BadRequest("Employee cannot be null");
            }
            Employee CheckEmail = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.Email == newEmployee.Email && e.ID!= newEmployee.ID);
            if (CheckEmail != null)
            {
                return BadRequest("This Email Already Exist");
            }
            Employee oldEmp = await Unit_Of_Work.employee_Repository.Select_By_IdAsync(newEmployee.ID);
            if (oldEmp == null)
            {
                return NotFound("Employee not found.");
            }

            if (newEmployee.BusCompanyID != null && newEmployee.BusCompanyID != 0)
            {
                BusCompany busCompany = Unit_Of_Work.busCompany_Repository.First_Or_Default(r => r.ID == newEmployee.BusCompanyID && r.IsDeleted != true);
                if (busCompany == null)
                {
                    return NotFound("There is no bus company with this ID.");
                }
            }
            else
            {
                newEmployee.BusCompanyID = null;
            }

            if (newEmployee.EmployeeTypeID != 0 && newEmployee.EmployeeTypeID != null)
            {
                EmployeeType empType = Unit_Of_Work.employeeType_Repository.First_Or_Default(b => b.ID == newEmployee.EmployeeTypeID);
                if (empType == null)
                {
                    return BadRequest("this Employee Type doesn't exist");
                }
            }
            else
            {
                return BadRequest("this Employee Type cannot be null");

            }

            if (newEmployee.Role_ID != 0 && newEmployee.Role_ID != null)
            {
                Role rolee = Unit_Of_Work.role_Repository.First_Or_Default(b => b.ID == newEmployee.Role_ID && b.IsDeleted != true);
                if (rolee == null)
                {
                    return BadRequest("this role doesn't exist");
                }
            }
            else
            {
                return BadRequest("this role cannot be null");

            }

            // Validation
            string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (newEmployee.Email != null && !Regex.IsMatch(newEmployee.Email, emailPattern))
            {
                return BadRequest("Email is not valid.");
            } 

            if (newEmployee.EmployeeTypeID == 2)
            {
                if (newEmployee.LicenseNumber == null)
                {
                    return BadRequest("License Number is required.");
                }

                if (newEmployee.ExpireDate == null)
                {
                    return BadRequest("Expire Date is required.");
                }
            }
            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Attachments");
            if (oldEmp.User_Name != newEmployee.User_Name)
            {
                var oldEmployeeFolder = Path.Combine(baseFolder, oldEmp.User_Name);
                var newEmployeeFolder = Path.Combine(baseFolder, newEmployee.User_Name);

                if (Directory.Exists(oldEmployeeFolder))
                {
                    try
                    {
                        Directory.Move(oldEmployeeFolder, newEmployeeFolder);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"An error occurred while renaming the folder: {ex.Message}");
                    }
                }
            }


            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Employee", roleId, userId, oldEmp);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            if(oldEmp.User_Name!=newEmployee.User_Name)
            {
                Employee emp2 =Unit_Of_Work.employee_Repository.First_Or_Default(e=>e.User_Name== newEmployee.User_Name);
                if(emp2 != null)
                {
                    return BadRequest("this user name already exist");
                }
            }
            mapper.Map(newEmployee, oldEmp);

            if (userTypeClaim == "octa")
            {
                oldEmp.UpdatedByOctaId = userId;
                oldEmp.UpdatedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                oldEmp.UpdatedByUserId = userId;
                oldEmp.UpdatedByOctaId = null;
            }

            oldEmp.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.employee_Repository.Update(oldEmp);
            await Unit_Of_Work.SaveChangesAsync();

            // Create new folder for employee
            var sanitizedUserName = newEmployee.User_Name.Trim();
            var employeeFolder = Path.Combine(baseFolder, sanitizedUserName);

            if (!Directory.Exists(employeeFolder))
            {
                Directory.CreateDirectory(employeeFolder);
            }

            // Handle new files
            if (files != null && files.Any())
            {
                foreach (var file in files)
                {
                    if (file.file.Length > 0)
                    {
                        var filePath = Path.Combine(employeeFolder, file.file.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.file.CopyToAsync(stream);
                        }
                    }
                    EmployeeAttachment uploadedFile = new EmployeeAttachment
                    {
                        EmployeeID = oldEmp.ID,
                        Link = $"Uploads/Attachments/{oldEmp.User_Name}/{file.file.FileName}",
                        Name = file.Name,
                    };

                    Unit_Of_Work.employeeAttachment_Repository.Add(uploadedFile);
                    Unit_Of_Work.SaveChanges();
                }
            }

            foreach (var filee in editedFiles)
            {
                var existingAttachment = await Unit_Of_Work.employeeAttachment_Repository
                    .Select_By_IdAsync(filee.ID); 

                if (existingAttachment != null)
                {
                    existingAttachment.Name = filee.Name;
                    Unit_Of_Work.employeeAttachment_Repository.Update(existingAttachment);
                }
            }

            //// Create LcationEmployee
            if (newEmployee.NewLocationSelected != null && newEmployee.NewLocationSelected.Count > 0)
            {
                foreach (var item in newEmployee.NewLocationSelected)
                {
                    Location location = Unit_Of_Work.location_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (location != null)
                    {
                        EmployeeLocation employeeLocation = Unit_Of_Work.employeeLocation_Repository.First_Or_Default(s => s.LocationID == location.ID && s.EmployeeID == oldEmp.ID && s.IsDeleted == true);
                        if (employeeLocation != null)
                        {
                            employeeLocation.IsDeleted = null;
                            Unit_Of_Work.employeeLocation_Repository.Update(employeeLocation);
                        }
                        else
                        {
                            employeeLocation = new EmployeeLocation();
                            employeeLocation.LocationID = item;
                            employeeLocation.EmployeeID = oldEmp.ID;
                            Unit_Of_Work.employeeLocation_Repository.Add(employeeLocation);
                        }
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Delete LcationEmployee
            if (newEmployee.DeletedLocationSelected != null && newEmployee.DeletedLocationSelected.Count > 0)
            {
                foreach (var item in newEmployee.DeletedLocationSelected)
                {
                    EmployeeLocation employeeLocation = Unit_Of_Work.employeeLocation_Repository.First_Or_Default(s => s.LocationID == item && s.EmployeeID == oldEmp.ID && s.IsDeleted != true);
                    if (employeeLocation != null)
                    {
                        employeeLocation.IsDeleted = true;
                        Unit_Of_Work.employeeLocation_Repository.Update(employeeLocation);
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Create floorMonitor
            if (newEmployee.NewFloorsSelected != null && newEmployee.NewFloorsSelected.Count > 0)
            {
                foreach (var item in newEmployee.NewFloorsSelected)
                {
                    Floor floor = Unit_Of_Work.floor_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (floor != null)
                    {
                        floor.FloorMonitorID = oldEmp.ID;
                        Unit_Of_Work.floor_Repository.Update(floor);
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Delete floorMonitor
            if (newEmployee.DeletedFloorsSelected != null && newEmployee.DeletedFloorsSelected.Count > 0)
            {
                foreach (var item in newEmployee.DeletedFloorsSelected)
                {
                    Floor floor = Unit_Of_Work.floor_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (floor != null)
                    {
                        floor.FloorMonitorID = null;
                        Unit_Of_Work.floor_Repository.Update(floor);
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Create GradeSupervisor
            if (newEmployee.NewGradesSelected != null && newEmployee.NewGradesSelected.Count > 0)
            {
                foreach (var item in newEmployee.NewGradesSelected)
                {
                    Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (grade != null)
                    {
                        GradeSupervisor gradeSupervisor = Unit_Of_Work.gradeSupervisor_Repository.First_Or_Default(s => s.GradeID == grade.ID && s.EmployeeID == oldEmp.ID && s.IsDeleted==true);
                        if (gradeSupervisor!=null)
                        {
                            gradeSupervisor.IsDeleted = null;
                            Unit_Of_Work.gradeSupervisor_Repository.Update(gradeSupervisor);
                        }
                        else
                        {
                            gradeSupervisor = new GradeSupervisor();
                            gradeSupervisor.GradeID = item;
                            gradeSupervisor.EmployeeID = oldEmp.ID;
                            Unit_Of_Work.gradeSupervisor_Repository.Add(gradeSupervisor);
                        }
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Delete GradeSupervisor
            if (newEmployee.DeletedGradesSelected != null && newEmployee.DeletedGradesSelected.Count > 0)
            {
                foreach (var item in newEmployee.DeletedGradesSelected)
                {
                    GradeSupervisor gradeSupervisor = Unit_Of_Work.gradeSupervisor_Repository.First_Or_Default(s => s.GradeID == item &&s.EmployeeID==oldEmp.ID && s.IsDeleted != true);
                    if (gradeSupervisor != null)
                    {
                        gradeSupervisor.IsDeleted = true;
                        Unit_Of_Work.gradeSupervisor_Repository.Update(gradeSupervisor);
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Create SubjectSupervisor
            if (newEmployee.NewSubjectsSelected != null && newEmployee.NewSubjectsSelected.Count > 0)
            {
                foreach (var item in newEmployee.NewSubjectsSelected)
                {
                    Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (subject != null)
                    {
                        SubjectSupervisor subjectSupervisor = Unit_Of_Work.subjectSupervisor_Repository.First_Or_Default(s => s.SubjectID == subject.ID && s.EmployeeID == oldEmp.ID && s.IsDeleted == true);
                        if (subjectSupervisor != null)
                        {
                            subjectSupervisor.IsDeleted = null;
                            Unit_Of_Work.subjectSupervisor_Repository.Update(subjectSupervisor);
                        }
                        else
                        {
                            subjectSupervisor = new SubjectSupervisor();
                            subjectSupervisor.SubjectID = item;
                            subjectSupervisor.EmployeeID = oldEmp.ID;
                            Unit_Of_Work.subjectSupervisor_Repository.Add(subjectSupervisor);
                        }
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            //// Delete SubjectSupervisor
            if (newEmployee.DeletedSubjectsSelected != null && newEmployee.DeletedSubjectsSelected.Count > 0)
            {
                foreach (var item in newEmployee.DeletedSubjectsSelected)
                {
                    SubjectSupervisor subjectSupervisor = Unit_Of_Work.subjectSupervisor_Repository.First_Or_Default(s => s.SubjectID == item && s.IsDeleted != true && s.EmployeeID== oldEmp.ID);
                    if (subjectSupervisor != null)
                    {
                        subjectSupervisor.IsDeleted = true;
                        Unit_Of_Work.subjectSupervisor_Repository.Update(subjectSupervisor);
                    }
                }
                Unit_Of_Work.SaveChanges();
            }
            await Unit_Of_Work.SaveChangesAsync();
            return Ok(newEmployee);
        } 

        //////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Employee" }
        )]
        public IActionResult Delete(long id)
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
            Employee employee = Unit_Of_Work.employee_Repository.Select_By_Id(id);

            if (employee == null || employee.IsDeleted == true)
            {
                return NotFound("No employee with this ID");
            }
            
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Employee", roleId, userId, employee);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            employee.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            employee.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                employee.DeletedByOctaId = userId;
                if (employee.DeletedByUserId != null)
                {
                    employee.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                employee.DeletedByUserId = userId;
                if (employee.DeletedByOctaId != null)
                {
                    employee.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.employee_Repository.Update(employee);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
        
        //////////////////////////////////////////////////////

        [HttpDelete("Suspend/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Employee" }
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

            Employee employee = Unit_Of_Work.employee_Repository.Select_By_Id(id);

            if (employee == null || employee.IsDeleted == true)
            {
                return NotFound("No employee with this ID");
            }
            
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Employee", roleId, userId, employee);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
             
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            employee.IsSuspended = !employee.IsSuspended;
            employee.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                employee.UpdatedByOctaId = userId;
                if (employee.UpdatedByUserId != null)
                {
                    employee.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                employee.UpdatedByUserId = userId;
                if (employee.UpdatedByOctaId != null)
                {
                    employee.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.employee_Repository.Update(employee);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        //////////////////////////////////////////////////////


        [HttpDelete("DeleteFiles/{id}")]
        public IActionResult DeleteFiles(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            //TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            EmployeeAttachment employeeAttachment = Unit_Of_Work.employeeAttachment_Repository.First_Or_Default(s => s.ID == id);
            Unit_Of_Work.employeeAttachment_Repository.Delete(id);
            Unit_Of_Work.SaveChanges();
            Uri uri = new Uri(employeeAttachment.Link);
            string path = uri.LocalPath; 
            string fileName = Path.GetFileName(path); 
            string directory = Path.GetDirectoryName(path); 
            string folderName = Path.GetFileName(directory);
            if (string.IsNullOrEmpty(folderName) || string.IsNullOrEmpty(fileName))
            {
                return BadRequest(new { message = "Invalid file details provided." });
            }
            if (folderName.Contains("..") || fileName.Contains(".."))
            {
                return BadRequest(new { message = "Invalid file path." });
            }

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Attachments", folderName, fileName);
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { message = "File not found." });
            }

            try
            {
                System.IO.File.Delete(filePath);
                return Ok(new { message = "File deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while deleting the file: {ex.Message}" });
            }
        }

  
        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("getByAccountingEmployee/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Employee" }
        )]
        public async Task<IActionResult> GetByAccounting(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
          
            Employee employee = await Unit_Of_Work.employee_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id,
                    query => query.Include(emp => emp.ReasonForLeavingWork),
                    query => query.Include(emp => emp.AccountNumber),
                    query => query.Include(emp => emp.Job),
                    query => query.Include(emp => emp.Department),
                    query => query.Include(emp => emp.AccountNumber),
                    query => query.Include(emp => emp.AcademicDegree));

            if (employee == null )
            {
                return NotFound("There is no employees with this id");
            }

            EmployeeAccountingGetDTO employeeDTO = mapper.Map<EmployeeAccountingGetDTO>(employee);
            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(employeeDTO.Nationality);
            if (nationality != null)
            {
                employeeDTO.NationalityName = nationality.Name;
            }

            List<EmployeeDays > days = await Unit_Of_Work.employeeDays_Repository.Select_All_With_IncludesById<EmployeeDays>(
                sem => sem.IsDeleted != true && sem.EmployeeID == id
                );

            if(days != null &&days.Count>0)
            {
              employeeDTO.Days = days.Select(day => day.DayID).ToList();

            }
            else
            {
                employeeDTO.Days =new List<long> { };
            }

            List<EmployeeStudent> students = await Unit_Of_Work.employeeStudent_Repository.Select_All_With_IncludesById<EmployeeStudent>(
               sem => sem.IsDeleted != true && sem.EmployeeID == id
               );

            if (students != null && students.Count > 0)
            {
                employeeDTO.Students = students.Select(day => day.StudentID).ToList();

            }
            else
            {
                employeeDTO.Students = new List<long> { };
            }

            List<AnnualVacationEmployee> annualVacationEmployees = await Unit_Of_Work.annualVacationEmployee_Repository.Select_All_With_IncludesById<AnnualVacationEmployee>(a => a.EmployeeID == id && a.IsDeleted != true
            , query => query.Include(emp => emp.Employee),
                query => query.Include(emp => emp.VacationTypes));

            employeeDTO.AnnualVacationEmployee = mapper.Map<List<AnnualVacationEmployeeGetDTO>>(annualVacationEmployees);

            return Ok(employeeDTO);
        }
        //////////////////////////////////////////////////////////////////////////////

        [HttpPut("EmployeeAccounting")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Employee Accounting" }
        )]
        public async Task<IActionResult> EditEmployeeAccountingAsync(EmployeeAccountingPut newEmployee)
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

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == newEmployee.ID && s.IsDeleted != true);
            if (employee == null || employee.IsDeleted == true)
            {
                return NotFound("No Employee with this ID");
            }

            if(newEmployee.NationalID != null)
            {
                Employee emp = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.NationalID == newEmployee.NationalID && d.ID != newEmployee.ID);
                if(emp != null)
                {
                    return BadRequest("This National ID already exists");
                }
            }

            if (newEmployee.AccountNumberID != 0 && newEmployee.AccountNumberID != null)
            {
                AccountingTreeChart account = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newEmployee.AccountNumberID);

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

                    if (account.LinkFileID != 10)
                    {
                        return BadRequest("Wrong Link File, it should be Asset file link");
                    }
                }
            }
            else
            {
                newEmployee.AccountNumberID = null;
            }

            if (newEmployee.AcademicDegreeID != 0 && newEmployee.AcademicDegreeID != null)
            {
                AcademicDegree academicDegree = Unit_Of_Work.academicDegree_Repository.First_Or_Default(t => t.ID == newEmployee.AcademicDegreeID);

                if (academicDegree == null)
                {
                    return NotFound("No academicDegree with this Id");
                }
            }
            else
            {
                newEmployee.AcademicDegreeID = null;
            }

            if (newEmployee.JobID != 0 && newEmployee.JobID != null)
            {

                 Job job = Unit_Of_Work.job_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newEmployee.JobID);

                if (job == null)
                {
                    return NotFound("No Job  with this Id");
                }
            }
            else
            {
                newEmployee.JobID = null;
            }

            if (newEmployee.DepartmentID != 0 && newEmployee.DepartmentID != null)
            {
                Department department = Unit_Of_Work.department_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newEmployee.DepartmentID);

                if (department == null)
                {
                    return NotFound("No department with this Id");
                }
            }
            else
            {
                newEmployee.DepartmentID = null;
            }

            if (newEmployee.ReasonOfLeavingID != 0 && newEmployee.ReasonOfLeavingID != null)
            {
                 ReasonForLeavingWork reasonForLeavingWork = Unit_Of_Work.reasonForLeavingWork_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newEmployee.ReasonOfLeavingID);

                if (reasonForLeavingWork == null)
                {
                    return NotFound("No reasonForLeavingWork with this Id");
                }

            }
            else
            {
                newEmployee.ReasonOfLeavingID = null;
            }

            if(newEmployee.Nationality!=0&& newEmployee.Nationality != null)
            {
            Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(newEmployee.Nationality);
            if (nationality == null)
            {
                return BadRequest("There is no nationality with this id");
            }

            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Employee Accounting", roleId, userId, employee);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newEmployee, employee);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            employee.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                employee.UpdatedByOctaId = userId;
                if (employee.UpdatedByUserId != null)
                {
                    employee.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                employee.UpdatedByUserId = userId;
                if (employee.UpdatedByOctaId != null)
                {
                    employee.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.employee_Repository.Update(employee);
            Unit_Of_Work.SaveChanges();


            //////delete all empDays
            List<EmployeeDays> employeeDays = await Unit_Of_Work.employeeDays_Repository.Select_All_With_IncludesById<EmployeeDays>(
                    sem => sem.EmployeeID==newEmployee.ID);

             foreach(EmployeeDays day in employeeDays)
             {
                Unit_Of_Work.employeeDays_Repository.Delete(day.ID); 
                Unit_Of_Work.SaveChanges();
             }

            if (newEmployee.Days != null &&newEmployee.Days.Count != 0)
            {
                foreach (var day in newEmployee.Days)
                {
                    if (day != 0)
                    {
                    EmployeeDays empDay = new EmployeeDays();
                    empDay.EmployeeID = newEmployee.ID;
                    empDay.DayID = day;
                    Unit_Of_Work.employeeDays_Repository.Add(empDay);
                    Unit_Of_Work.SaveChanges();
                    }
                }

            }
            //////delete all empStudents
            
            List<EmployeeStudent> employeeStudents = await Unit_Of_Work.employeeStudent_Repository.Select_All_With_IncludesById<EmployeeStudent>(
                    sem => sem.EmployeeID == newEmployee.ID);
          
            foreach (EmployeeStudent emp in employeeStudents)
            {
                Unit_Of_Work.employeeStudent_Repository.Delete(emp.ID);
                Unit_Of_Work.SaveChanges();
            }
          
            foreach (var empStudent in newEmployee.Students)
            {
                Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == empStudent && s.IsDeleted != true);
                if (student != null)
                {
                    EmployeeStudent emp = new EmployeeStudent();
                    emp.EmployeeID = newEmployee.ID;
                    emp.StudentID = empStudent;
                    Unit_Of_Work.employeeStudent_Repository.Add(emp);
                    Unit_Of_Work.SaveChanges();

                }
            }

            if (newEmployee.AnnualVacationEmployee.Count > 0)
            {
                foreach (var vacDto in newEmployee.AnnualVacationEmployee)
                {
                    var existingEntity = Unit_Of_Work.annualVacationEmployee_Repository.First_Or_Default(v => v.ID == vacDto.ID);

                    if (existingEntity != null)
                    {
                        mapper.Map(vacDto, existingEntity); // update fields in tracked entity
                        Unit_Of_Work.annualVacationEmployee_Repository.Update(existingEntity);
                        Unit_Of_Work.SaveChanges();
                    }
                }
            }


            return Ok(newEmployee);
        }
    }   
}


