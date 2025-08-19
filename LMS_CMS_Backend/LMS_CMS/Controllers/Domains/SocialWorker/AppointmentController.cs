using AutoMapper;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_DAL.Models.Domains.ViolationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        public AppointmentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////
        
        [HttpGet("BySchoolId/{SchoolId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Lesson Resources Types" }
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

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Lesson Resources Types" }
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

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Lesson Resources Types" }
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

                Unit_Of_Work.appointmentGrade_Repository.Add(appointmentGrade);
                Unit_Of_Work.SaveChanges();
            }

            return Ok(NewAppointment);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowEdit: 1,
          pages: new[] { "Lesson Resources Types" }
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
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Lesson Resources Types", roleId, userId, appointment);
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
          pages: new[] { "Lesson Resources Types" }
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
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Lesson Resources Types", roleId, userId, appointment);
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
