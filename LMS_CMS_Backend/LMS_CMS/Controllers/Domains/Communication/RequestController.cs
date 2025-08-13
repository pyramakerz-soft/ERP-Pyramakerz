using AutoMapper;
using LMS_CMS_PL.Services.SignalR;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_DAL.Models.Domains.LMS;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace LMS_CMS_PL.Controllers.Domains.Communication
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class RequestController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileValidationService _fileValidationService;
        private readonly UserTreeService _userTreeService; 

        public RequestController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService, UserTreeService userTreeService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _userTreeService = userTreeService; 
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        private (string EnglishName, string ArabicName) GetUserNames(UOW unitOfWork, long userId, long userTypeId)
        {
            string englishName = string.Empty;
            string arabicName = string.Empty;

            switch (userTypeId)
            {
                case 1: 
                    Employee employee = unitOfWork.employee_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (employee != null)
                    {
                        englishName = employee.en_name;
                        arabicName = employee.ar_name;
                    }
                    break;

                case 2: 
                    Student student = unitOfWork.student_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (student != null)
                    {
                        englishName = student.en_name;
                        arabicName = student.ar_name;
                    }
                    break;

                case 3: 
                    Parent parent = unitOfWork.parent_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (parent != null)
                    {
                        englishName = parent.en_name;
                        arabicName = parent.ar_name;
                    }
                    break; 

                default:
                    throw new ArgumentException("Invalid user type ID");
            }

            return (englishName, arabicName);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByUserID")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<Request> requests = await Unit_Of_Work.request_Repository.Select_All_With_IncludesById<Request>(
                    f => f.IsDeleted != true &&
                    ((f.SenderID == userId && f.SenderUserTypeID == userTypeID) 
                    || (f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID) 
                    || (f.TransfereeID == userId && userTypeID == 1)),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType)
                    );

            if (requests == null || requests.Count == 0)
            {
                return NotFound();
            }

            requests = requests.OrderByDescending(d => d.InsertedAt).ToList();

            List<RequestGetDTO> requestsGetDTO = mapper.Map<List<RequestGetDTO>>(requests);

            foreach (var request in requestsGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(request.FileLink))
                {
                    request.FileLink = $"{serverUrl}{request.FileLink.Replace("\\", "/")}";
                }

                (request.SenderEnglishName, request.SenderArabicName) = GetUserNames(Unit_Of_Work, request.SenderID, request.SenderUserTypeID);
                (request.ReceiverEnglishName, request.ReceiverArabicName) = GetUserNames(Unit_Of_Work, request.ReceiverID, request.ReceiverUserTypeID);
                if (request.TransfereeID != null && request.TransfereeID != 0)
                {
                    (request.TransfereeEnglishName, request.TransfereeArabicName) = GetUserNames(Unit_Of_Work, request.TransfereeID.Value, 1);
                }
            }

            return Ok(requestsGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByUserIDFirst5")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDFirst5()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<Request> requests = await Unit_Of_Work.request_Repository.Select_All_With_IncludesById<Request>(
                    f => f.IsDeleted != true &&
                    ((f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID)
                    || (f.TransfereeID == userId && userTypeID == 1)),
                    query => query.Include(d => d.ReceiverUserType)
                    );

            requests = requests
                .OrderByDescending(d => d.InsertedAt)
                .Take(5)
                .ToList();

            if (requests == null || requests.Count == 0)
            {
                return NotFound();
            } 

            List<RequestGetDTO> requestsGetDTO = mapper.Map<List<RequestGetDTO>>(requests);

            foreach (var request in requestsGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(request.FileLink))
                {
                    request.FileLink = $"{serverUrl}{request.FileLink.Replace("\\", "/")}";
                }
                 
                (request.ReceiverEnglishName, request.ReceiverArabicName) = GetUserNames(Unit_Of_Work, request.ReceiverID, request.ReceiverUserTypeID);
                if (request.TransfereeID != null && request.TransfereeID != 0)
                {
                    (request.TransfereeEnglishName, request.TransfereeArabicName) = GetUserNames(Unit_Of_Work, request.TransfereeID.Value, 1);
                }
            }

            return Ok(requestsGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByUserIDAndRequestID/{requestID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDAndRequestID(long requestID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            Request request = await Unit_Of_Work.request_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == requestID &&
                    ((f.SenderID == userId && f.SenderUserTypeID == userTypeID)
                    || (f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID)
                    || (f.TransfereeID == userId && userTypeID == 1)),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType)
                    ); 

            if (request == null)
            {
                return NotFound();
            }
             
            RequestGetDTO requestGetDTO = mapper.Map<RequestGetDTO>(request);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(requestGetDTO.FileLink))
            {
                requestGetDTO.FileLink = $"{serverUrl}{requestGetDTO.FileLink.Replace("\\", "/")}";
            }

            (requestGetDTO.SenderEnglishName, requestGetDTO.SenderArabicName) = GetUserNames(Unit_Of_Work, request.SenderID, requestGetDTO.SenderUserTypeID);
            (requestGetDTO.ReceiverEnglishName, requestGetDTO.ReceiverArabicName) = GetUserNames(Unit_Of_Work, request.ReceiverID, requestGetDTO.ReceiverUserTypeID);
            if (requestGetDTO.TransfereeID != null && requestGetDTO.TransfereeID != 0)
            {
                (requestGetDTO.TransfereeEnglishName, requestGetDTO.TransfereeArabicName) = GetUserNames(Unit_Of_Work, requestGetDTO.TransfereeID.Value, 1);
            }

            if (request.ReceiverID == userId && request.ReceiverUserTypeID == userTypeID)
            {
                request.SeenOrNot = true;
            }
            
            if (request.TransfereeID == userId && userTypeID == 1)
            {
                request.SeenOrNotByTransferee = true;
            }
 
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            request.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.request_Repository.Update(request);

            Unit_Of_Work.SaveChanges();

            return Ok(requestGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("UnSeenRequestCount")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult UnSeenRequestCount()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<Request> requests = Unit_Of_Work.request_Repository.FindBy(
                    f => f.IsDeleted != true && ((!f.SeenOrNot && f.ReceiverID == userId) || (!f.SeenOrNotByTransferee && userTypeID == 1 && f.TransfereeID == userId)) && f.ReceiverUserTypeID == userTypeID);

            return Ok(requests.Count);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("AcceptOrDecline/{requestID}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee"}
        )]
        public IActionResult AcceptOrDecline(long requestID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            Request request = Unit_Of_Work.request_Repository.First_Or_Default(
                    f => f.IsDeleted != true  && f.ID == requestID 
                    && ((f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID) || (f.TransfereeID == userId && userTypeID == 1)));

            if (request == null)
            {
                return NotFound();
            }

            if (request.ReceiverID == userId && request.ReceiverUserTypeID == userTypeID)
            {
                request.SeenOrNot = true;
            }

            if (request.TransfereeID == userId && userTypeID == 1)
            {
                request.SeenOrNotByTransferee = true;
            }
            request.ApprovedOrNot = true; 
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            request.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.request_Repository.Update(request);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("Forward")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee"}
        )]
        public IActionResult Forward(ForwardRequestDTO forwardRequestDTO)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            Employee employeeToForwardTo = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == forwardRequestDTO.ForwardToID && d.IsDeleted != true);
            if (employeeToForwardTo == null)
            {
                return NotFound("No Employee with this ID");
            }

            Request request = Unit_Of_Work.request_Repository.First_Or_Default(
                    f => f.IsDeleted != true  && f.ID == forwardRequestDTO.RequestID
                    && ((f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID) || (f.TransfereeID == userId && userTypeID == 1))
                    );

            if (request == null)
            {
                return NotFound("You don't have any request with this ID");
            }
            
            if (request.ApprovedOrNot != null)
            {
                return BadRequest("You can't forward the request after you approve or decline it");
            }
            
            if (request.ReceiverID == userId && forwardRequestDTO.ForwardToID == userId)
            {
                return BadRequest("You can't forward the request to yourself");
            }

            if (request.TransfereeID == userId && forwardRequestDTO.ForwardToID == request.ReceiverID)
            {
                return BadRequest("You can't forward the request back to this user");
            }

            request.SeenOrNot = true;
            request.ForwardedOrNot = true; 
            request.TransfereeID = forwardRequestDTO.ForwardToID; 
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            request.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.request_Repository.Update(request);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> AddAsync(RequestAddDTO NewRequest)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            long userTypeID = userTypeClaim switch
            {
                "employee" => 1,
                "student" => 2,
                "parent" => 3
            };

            if (NewRequest == null)
            {
                return BadRequest("Request cannot be null");
            }

            UserType userType = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewRequest.ReceiverUserTypeID);
            if (userType == null)
            {
                return BadRequest("No User Type With this ID");
            }

            if (NewRequest.FileFile == null && NewRequest.Message == null && NewRequest.Link == null)
            {
                return BadRequest("You have to choose one element atleast to appear");
            }

            if (NewRequest.ReceiverUserTypeID == 2 || NewRequest.ReceiverUserTypeID == 3)
            {
                return BadRequest("You Can't Send Requests To This User Type");
            }

            List<long> targetUserIds;
            try
            {
                targetUserIds = _userTreeService.GetUsersAccordingToTree(Unit_Of_Work, NewRequest.ReceiverUserTypeID, NewRequest.UserFilters);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            if(userTypeID == 1 && NewRequest.ReceiverUserTypeID == 1)
            {
                targetUserIds = targetUserIds.Where(id => id != userId).ToList();
            }

            if(targetUserIds.Count == 0)
            {
                return NotFound("No Users To Request From");
            }

            if (NewRequest.FileFile != null)
            {
                string returnFileInput = _fileValidationService.ValidateFile(NewRequest.FileFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                } 
            } 

            if (userTypeID == 1 && NewRequest.ReceiverUserTypeID == 1)
            {
                List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(d => d.IsDeleted != true && d.CanReceiveRequest == true);
                if(employees.Count == 0)
                {
                    return NotFound("No eligible employees available to receive requests");
                }

                List<long> employeeIDs = employees.Select(y => y.ID).ToList();

                targetUserIds = targetUserIds.Where(id => employeeIDs.Contains(id)).ToList();
                if (targetUserIds.Count == 0)
                {
                    return NotFound("None of the specified users are eligible to receive requests");
                }
            }
            else if ((userTypeID == 2 || userTypeID == 3) && NewRequest.ReceiverUserTypeID == 1)
            {
                if(targetUserIds.Count > 1)
                {
                    return BadRequest("You can only request from one teacher at a time");
                }
                
                if (userTypeID == 3 && (NewRequest.StudentID == null || NewRequest.StudentID == 0))
                {
                    return BadRequest("You must select a student");
                }

                long studentId = userTypeID == 2 ? userId : NewRequest.StudentID.Value;

                Employee emp = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == targetUserIds[0]);
                if (emp?.CanReceiveRequestFromParent != true)
                {
                    var teacherIDs = await GetValidTeacherIdsForStudent(studentId, Unit_Of_Work);

                    if (teacherIDs.Count == 0 || !teacherIDs.Contains(targetUserIds[0]))
                    {
                        return BadRequest("You can only send requests to your current teachers");
                    }
                }
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (long receiverID in targetUserIds)
            {  
                Request request = new Request();
                request.Message = NewRequest.Message;
                request.Link = NewRequest.Link;
                request.SenderID = userId;
                request.ReceiverID = receiverID;
                request.SenderUserTypeID = userTypeID;
                request.ReceiverUserTypeID = NewRequest.ReceiverUserTypeID;
                request.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

                Unit_Of_Work.request_Repository.Add(request);
                Unit_Of_Work.SaveChanges();

                if (NewRequest.FileFile != null)
                { 
                    var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Request");
                    var requestFolder = Path.Combine(baseFolder,request.ID.ToString());
                    if (!Directory.Exists(requestFolder))
                    {
                        Directory.CreateDirectory(requestFolder);
                    }

                    if (NewRequest.FileFile.Length > 0)
                    {
                        var filePath = Path.Combine(requestFolder, NewRequest.FileFile.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await NewRequest.FileFile.CopyToAsync(stream);
                        }
                    }

                    request.FileLink = Path.Combine("Uploads", "Request", request.ID.ToString(), NewRequest.FileFile.FileName);
                    Unit_Of_Work.request_Repository.Update(request);
                } 
            }

            Unit_Of_Work.SaveChanges();

            // run the function that tell the user that there are changes and in front end it will change the count and also refresh the requests if i am in the requests page

            return Ok();
        }

        private async Task<List<long>> GetValidTeacherIdsForStudent(long studentId, UOW Unit_Of_Work)
        { 
            List<long> teacherIDs = new List<long>();

            // Get student current grade
            StudentGrade studentGrade = Unit_Of_Work.studentGrade_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.Grade.IsDeleted != true && d.Grade.Section.IsDeleted != true && d.AcademicYear.IsDeleted != true && d.AcademicYear.School.IsDeleted != true
                && d.AcademicYear.IsActive == true && d.StudentID == studentId); 

            if (studentGrade != null)
            {
                // Get his classroom
                StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(
                    d => d.IsDeleted != true && d.Classroom.IsDeleted != true && d.Classroom.AcademicYear.IsDeleted != true && d.Classroom.AcademicYear.IsActive == true
                    && d.StudentID == studentId && d.Classroom.GradeID == studentGrade.GradeID); 

                if(studentClassroom != null)
                {
                    // Get His subjects
                    List<StudentClassroomSubject> studentClassroomSubjects = Unit_Of_Work.studentClassroomSubject_Repository.FindBy(
                        d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID && d.Subject.IsDeleted != true && d.Hide == false);

                    if (studentClassroomSubjects != null && studentClassroomSubjects.Count > 0 )
                    {
                        List<long> subjectIDs = studentClassroomSubjects.Select(y => y.SubjectID).ToList(); 

                        // Get his class subjects 
                        List<ClassroomSubject> classroomSubjects = Unit_Of_Work.classroomSubject_Repository.FindBy(
                            d => d.ClassroomID == studentClassroom.ClassID && subjectIDs.Contains(d.SubjectID) && d.IsDeleted != true && d.Hide == false && d.TeacherID != null && d.Teacher.IsDeleted != true
                            );

                        if (classroomSubjects != null && classroomSubjects.Count > 0)
                        {
                            teacherIDs = classroomSubjects.Where(cs => cs.TeacherID != null).Select(y => y.TeacherID.Value).ToList();
                            
                            foreach (var item in classroomSubjects)
                            {
                                List<ClassroomSubjectCoTeacher> classroomSubjectCoTeachers = Unit_Of_Work.classroomSubjectCoTeacher_Repository.FindBy(
                                d => d.ClassroomSubjectID == item.ID && d.IsDeleted != true && d.CoTeacher.IsDeleted != true
                                );
                                if (classroomSubjectCoTeachers != null && classroomSubjectCoTeachers.Count != 0)
                                {
                                    teacherIDs.AddRange(classroomSubjectCoTeachers.Select(ct => ct.CoTeacherID));
                                }
                            }
                        }
                    }
                }
            }
             
            List<RemedialClassroomStudent> remedialClassroomStudents = await Unit_Of_Work.remedialClassroomStudent_Repository.Select_All_With_IncludesById<RemedialClassroomStudent>(
                d => d.IsDeleted != true && d.RemedialClassroom.IsDeleted != true && d.RemedialClassroom.Subject.IsDeleted != true && d.RemedialClassroom.AcademicYear.IsDeleted != true
                && d.RemedialClassroom.AcademicYear.School.IsDeleted != true && d.RemedialClassroom.Subject.Grade.IsDeleted != true && d.RemedialClassroom.Subject.Grade.Section.IsDeleted != true
                && d.RemedialClassroom.AcademicYear.IsActive == true && d.StudentID == studentId,
                query => query.Include(d => d.RemedialClassroom)
                );
            if (remedialClassroomStudents != null && remedialClassroomStudents.Count != 0)
            {
                teacherIDs.AddRange(remedialClassroomStudents.Select(ct => ct.RemedialClassroom.TeacherID));
            }

            return teacherIDs.Distinct().ToList(); 
        }
    }
}
