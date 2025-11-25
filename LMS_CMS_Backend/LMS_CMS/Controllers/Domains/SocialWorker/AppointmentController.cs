using Amazon.S3;
using AutoMapper;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_DAL.Models.Domains.ViolationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.S3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing.Printing;

namespace LMS_CMS_PL.Controllers.Domains.SocialWorker
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly SendNotificationService _sendNotificationService;
        private readonly IConfiguration _configuration;
        private readonly DomainService _domainService;

        public AppointmentController(DbContextFactoryService dbContextFactory, IMapper mapper, DomainService domainService ,SendNotificationService sendNotificationService, CheckPageAccessService checkPageAccessService , IConfiguration configuration)
        {
            _dbContextFactory = dbContextFactory;
            _configuration = configuration;
            this.mapper = mapper;
            _sendNotificationService = sendNotificationService;
            _domainService = domainService;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////
        
        [HttpGet("BySchoolId/{SchoolId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Appoinment" }
        )]
        public async Task<IActionResult> GetBySchool(long SchoolId)
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

            List<Appointment> appointments =await Unit_Of_Work.appointment_Repository.Select_All_With_IncludesById<Appointment>(
                    sem => sem.IsDeleted != true && sem.SchoolID == SchoolId,
                    query => query.Include(emp => emp.School),
                    query => query.Include(emp => emp.AppointmentGrades.Where(a=>a.IsDeleted!= true && a.Grade.IsDeleted!= true)).ThenInclude(a => a.Grade),
                    query => query.Include(emp => emp.AppointmentParents).ThenInclude(a => a.Parent));

            if (appointments == null || appointments.Count == 0)
            {
                return NotFound();
            }

            List<AppointmentGetDTO> Dto = mapper.Map<List<AppointmentGetDTO>>(appointments);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("BySchoolIdWithPaggination/{SchoolId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Appoinment" }
        )]
        public async Task<IActionResult> GetBySchoolWithPaggination(long SchoolId , [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            int totalRecords = await Unit_Of_Work.appointment_Repository
            .CountAsync(sem => sem.IsDeleted != true && sem.SchoolID == SchoolId);

            List<Appointment> appointments = await Unit_Of_Work.appointment_Repository.Select_All_With_IncludesById_Pagination<Appointment>(
                    sem => sem.IsDeleted != true && sem.SchoolID == SchoolId,
                    query => query.Include(emp => emp.School),
                    query => query.Include(emp => emp.AppointmentGrades.Where(a => a.IsDeleted != true && a.Grade.IsDeleted != true)).ThenInclude(a => a.Grade),
                    query => query.Include(emp => emp.AppointmentParents).ThenInclude(a => a.Parent))
                   .Skip((pageNumber - 1) * pageSize)
                   .Take(pageSize)
                   .ToListAsync();

            if (appointments == null || appointments.Count == 0)
            {
                return NotFound();
            }

            List<AppointmentGetDTO> Dto = mapper.Map<List<AppointmentGetDTO>>(appointments);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = Dto, Pagination = paginationMetadata });
        }

        ////////////////////////////////
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Appoinment" }
         )]
        public async Task<IActionResult> GetById(long id)
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

            Appointment appointment = await Unit_Of_Work.appointment_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id,
                    query => query.Include(emp => emp.School),
                    query => query.Include(emp => emp.AppointmentGrades.Where(a => a.IsDeleted != true && a.Grade.IsDeleted != true)).ThenInclude(a => a.Grade),
                    query => query.Include(emp => emp.AppointmentParents.Where(a => a.IsDeleted != true && a.Parent.IsDeleted != true)).ThenInclude(a => a.Parent));

            if (appointment == null)
            {
                return NotFound();
            }

            AppointmentGetDTO Dto = mapper.Map<AppointmentGetDTO>(appointment);
            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("GetByIdWithPaggination/{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Appoinment" }
       )]
        public async Task<IActionResult> GetByIdWithPaggination(long id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            // ✅ Count all parents for this appointment (entire dataset, not paged)
            int totalRecords = await Unit_Of_Work.appointmentParent_Repository
                .CountAsync(f => f.IsDeleted != true && f.AppointmentID == id);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Appointment appointment = Unit_Of_Work.appointment_Repository.First_Or_Default(
                sem => sem.IsDeleted != true && sem.ID == id);

            if (appointment == null)
            {
                return NotFound();
            }

            // ✅ Get paginated data
            List<AppointmentParent> appointmentParents = await Unit_Of_Work.appointmentParent_Repository
                .Select_All_With_IncludesById_Pagination<AppointmentParent>(
                    t => t.IsDeleted != true && t.AppointmentID == id,
                    query => query.Include(Master => Master.Appointment),
                    query => query.Include(Master => Master.Parent),
                    query => query.Include(Master => Master.AppointmentStatus)
                )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            AppointmentGetDTO app = mapper.Map<AppointmentGetDTO>(appointment);

            List<AppointmentParentGetDTO> Dto = mapper.Map<List<AppointmentParentGetDTO>>(appointmentParents);

            // ✅ Get ALL statuses
            List<AppointmentStatus> appointmentStatuses = Unit_Of_Work.appointmentStatus_Repository
                .FindBy(a => a.IsDeleted != true);

            // ✅ Get counts for the ENTIRE dataset (not just the page)
            var allAppointmentParents = await Unit_Of_Work.appointmentParent_Repository
                .Select_All_With_IncludesById_Pagination<AppointmentParent>(
                    t => t.IsDeleted != true && t.AppointmentID == id,
                    query => query.Include(x => x.AppointmentStatus)
                )
                .ToListAsync();

            // ✅ Build counts including statuses with 0
            var statusCounts = appointmentStatuses
                .Select(status => new {
                    StatusID = status.ID,
                    StatusName = status.Name,
                    Count = allAppointmentParents.Count(p => p.AppointmentStatusID == status.ID)
                })
                .ToList();

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Appointment = app, Data = Dto, Pagination = paginationMetadata, StatusCounts = statusCounts });
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Appoinment" }
         )]
        public async Task<IActionResult> Add(AppointmentAddDTO NewAppointment)
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
            if (NewAppointment == null)
            {
                return BadRequest("Appointment is empty");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == NewAppointment.SchoolID && s.IsDeleted != true);
            if (school == null)
            {
                return BadRequest("There is no school with this Id");
            }

            Appointment appointment = mapper.Map<Appointment>(NewAppointment);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            appointment.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                appointment.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                appointment.InsertedByUserId = userId;
            }

            Unit_Of_Work.appointment_Repository.Add(appointment);
            Unit_Of_Work.SaveChanges();

            foreach (var gradeId in NewAppointment.GradeIds)
            {
                var appointmentGrade = new AppointmentGrade();
                appointmentGrade.GradeID = gradeId;
                appointmentGrade.AppointmentID = appointment.ID;

                if (userTypeClaim == "octa")
                {
                    appointmentGrade.InsertedByOctaId = userId;
                }
                else if (userTypeClaim == "employee")
                {
                    appointmentGrade.InsertedByUserId = userId;
                }

                Unit_Of_Work.appointmentGrade_Repository.Add(appointmentGrade);
                Unit_Of_Work.SaveChanges();
            }

            /////////////////////////////// parent Appointment
            List<long> ParentIds =new List<long>();

            foreach (var item in NewAppointment.GradeIds)
            {
                /// 1) get all parents That has student 
                List<StudentGrade> studentGrades = await Unit_Of_Work.studentGrade_Repository.Select_All_With_IncludesById<StudentGrade>(s => s.GradeID == item && s.Grade.IsDeleted != true && s.AcademicYear.IsActive == true);
                List<long> studentIds = studentGrades.Select(s=>s.StudentID).Distinct().ToList();

                List<Student> students = Unit_Of_Work.student_Repository.FindBy(s => s.IsDeleted != true && studentIds.Contains(s.ID));
                foreach (var student in students)
                {
                    if(student.Parent_Id != null)
                    {
                        ParentIds.Add(student.Parent_Id.Value);
                    }
                }
            }
            ParentIds = ParentIds.Distinct().ToList();
            foreach (var ParentId in ParentIds)
            {
                var appointmentParent = new AppointmentParent();
                appointmentParent.ParentID = ParentId;
                appointmentParent.AppointmentID = appointment.ID;
                appointmentParent.AppointmentStatusID = 1;

                if (userTypeClaim == "octa")
                {
                    appointmentParent.InsertedByOctaId = userId;
                }
                else if (userTypeClaim == "employee")
                {
                    appointmentParent.InsertedByUserId = userId;
                }

                Unit_Of_Work.appointmentParent_Repository.Add(appointmentParent);
                Unit_Of_Work.SaveChanges();

                //
                var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();
                string serverUrl = "";

                bool isProduction = _configuration.GetValue<bool>("IsProduction");

                if (isProduction)
                {
                    var domain = _domainService.GetDomain(HttpContext);
                    string subDomain = HttpContext.Request.Headers["Domain-Name"].ToString();   
                    string protocol = HttpContext.Request.Scheme; 
                    serverUrl = $"{protocol}://{subDomain}.{domain}/Parent/Appointment";

                }
                else
                {
                    serverUrl = $"http://localhost:4200/Parent/Appointment";
                }

                await _sendNotificationService.SendNotificationAsync(Unit_Of_Work, "A new appointment has been scheduled for your child. Tap the link to check the appointment details.", serverUrl, 3, ParentId, domainName);

            }

            return Ok(NewAppointment);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowEdit: 1,
          pages: new[] { "Appoinment" }
        )]
        public async Task<IActionResult> EditAsync(AppointmentEditDTO NewAppointment)
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

            if (NewAppointment == null)
            {
                return BadRequest("NewAppointment cannot be null");
            }
            if (NewAppointment.ID == null)
            {
                return BadRequest("id can not be null");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == NewAppointment.SchoolID && s.IsDeleted != true);
            if (school == null)
            {
                return BadRequest("There is no school with this Id");
            }

            Appointment appointment = Unit_Of_Work.appointment_Repository.First_Or_Default(s => s.ID == NewAppointment.ID && s.IsDeleted != true);
            if (appointment == null)
            {
                return BadRequest("appointment not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Appoinment", roleId, userId, appointment);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewAppointment, appointment);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            appointment.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                appointment.UpdatedByOctaId = userId;
                if (appointment.UpdatedByUserId != null)
                {
                    appointment.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                appointment.UpdatedByUserId = userId;
                if (appointment.UpdatedByOctaId != null)
                {
                    appointment.UpdatedByOctaId = null;
                }
            }


            List<AppointmentGrade> appointmentGrades = await Unit_Of_Work.appointmentGrade_Repository
            .Select_All_With_IncludesById<EmployeeTypeViolation>(e => e.AppointmentID == NewAppointment.ID && e.IsDeleted != true,
             query => query.Include(emp => emp.Grade));

            List<long> existedAppointmentGradesIds = appointmentGrades.Select(d => d.GradeID).Where(id => id > 0).ToList();
            List<long> updatedAppointmentGradesIds = NewAppointment.GradeIds?.ToList() ?? new();

            var deletedAppointmentGradeIds = existedAppointmentGradesIds.Except(updatedAppointmentGradesIds).ToList();
            var newAppointmentGradeIds = updatedAppointmentGradesIds.Except(existedAppointmentGradesIds).ToList();

            // Delete removed grades relations
            foreach (var deletedId in deletedAppointmentGradeIds)
            {
                var relation = appointmentGrades.FirstOrDefault(r => r.GradeID == deletedId);
                if (relation != null)
                {
                    relation.IsDeleted = true;
                    Unit_Of_Work.appointmentGrade_Repository.Update(relation);

                    //delete all parent that have children in this grade
                    List<StudentGrade> studentGrades = await Unit_Of_Work.studentGrade_Repository.Select_All_With_IncludesById<StudentGrade>(s => s.GradeID == deletedId && s.Grade.IsDeleted != true && s.AcademicYear.IsActive == true);
                    List<long> studentIds = studentGrades.Select(s => s.StudentID).Distinct().ToList();

                    List<Student> students = Unit_Of_Work.student_Repository.FindBy(s => s.IsDeleted != true && studentIds.Contains(s.ID));
                    foreach (var student in students)
                    {
                        if (student.Parent_Id != null)
                        {
                            AppointmentParent appointmentParent = Unit_Of_Work.appointmentParent_Repository.First_Or_Default(a=>a.ParentID == student.Parent_Id && a.AppointmentID == NewAppointment.ID);
                            if(appointmentParent != null)
                            {
                                appointmentParent.IsDeleted = true;
                                Unit_Of_Work.appointmentParent_Repository.Update(appointmentParent);
                            }
                        }
                    }
                }
            }

            // Add new grades relations
            foreach (var newId in newAppointmentGradeIds)
            {
                AppointmentGrade newRelation = new()
                {
                    AppointmentID = appointment.ID,
                    GradeID = newId
                };
                Unit_Of_Work.appointmentGrade_Repository.Add(newRelation);
                List<long> ParentIds = new List<long>();

                /// 1) get all parents That has student 
                List<StudentGrade> studentGrades = await Unit_Of_Work.studentGrade_Repository.Select_All_With_IncludesById<StudentGrade>(s => s.GradeID == newId && s.Grade.IsDeleted != true && s.AcademicYear.IsActive == true);
                List<long> studentIds = studentGrades.Select(s => s.StudentID).Distinct().ToList();

                List<Student> students = Unit_Of_Work.student_Repository.FindBy(s => s.IsDeleted != true && studentIds.Contains(s.ID));
                foreach (var student in students)
                {
                    if (student.Parent_Id != null)
                    {
                        ParentIds.Add(student.Parent_Id.Value);
                    }
                }
                ParentIds = ParentIds.Distinct().ToList();

                foreach (var ParentId in ParentIds)
                {
                    var appointmentParent = new AppointmentParent();
                    appointmentParent.ParentID = ParentId;
                    appointmentParent.AppointmentID = appointment.ID;
                    appointmentParent.AppointmentStatusID = 1;

                    if (userTypeClaim == "octa")
                    {
                        appointmentParent.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        appointmentParent.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.appointmentParent_Repository.Add(appointmentParent);
                    Unit_Of_Work.SaveChanges();

                    //
                    var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();
                    string serverUrl = "";

                    bool isProduction = _configuration.GetValue<bool>("IsProduction");

                    if (isProduction)
                    {
                        var domain = _domainService.GetDomain(HttpContext);
                        string subDomain = HttpContext.Request.Headers["Domain-Name"].ToString();
                        string fullPath = $"{_configuration["AWS:Folder"]}{domain}/{subDomain}/Parent/Appointment";

                        AmazonS3Client s3Client = new AmazonS3Client();
                        S3Service s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");
                        //serverUrl = s3Service.GetFileUrl(fullPath, _configuration);

                        serverUrl = $"{subDomain}.{domain}/Parent/Appointment";
                        Console.WriteLine("----------------------------------------------------------------------------------------------------");
                        Console.WriteLine(serverUrl, domain, subDomain);
                    }
                    else
                    {
                        serverUrl = $"http://localhost:4200/Parent/Appointment";

                    }

                    await _sendNotificationService.SendNotificationAsync(Unit_Of_Work, "A new appointment has been scheduled for your child. Tap to view link to check the appointment details.", serverUrl, 3, ParentId, domainName);

                }
            }
            await Unit_Of_Work.SaveChangesAsync();

            Unit_Of_Work.appointment_Repository.Update(appointment);
            Unit_Of_Work.SaveChanges();
            return Ok(NewAppointment);
        }

        ////////////////////////////////     

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Appoinment" }
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

            Appointment appointment = Unit_Of_Work.appointment_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (appointment == null)
            {
                return BadRequest("appointment not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Appoinment", roleId, userId, appointment);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            appointment.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            appointment.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                appointment.DeletedByOctaId = userId;
                if (appointment.DeletedByUserId != null)
                {
                    appointment.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                appointment.DeletedByUserId = userId;
                if (appointment.DeletedByOctaId != null)
                {
                    appointment.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.appointment_Repository.Update(appointment);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
