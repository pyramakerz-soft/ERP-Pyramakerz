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
    public class AppointmentParentController : ControllerBase
    {

        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AppointmentParentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet("ByParent/{ParentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" , "parent" },
            pages: new[] { "Appoinment" }
        )]
        public async Task<IActionResult> GetByParent(long ParentId)
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

            List<AppointmentParent> appointmentParents = await Unit_Of_Work.appointmentParent_Repository.Select_All_With_IncludesById<AppointmentParent>(
                    sem => sem.IsDeleted != true && sem.ParentID == ParentId,
                    query => query.Include(emp => emp.Appointment),
                    query => query.Include(emp => emp.InsertedByEmployee),
                    query => query.Include(emp => emp.AppointmentStatus)
                    );

            if (appointmentParents == null || appointmentParents.Count == 0)
            {
                return NotFound();
            }

            List<AppointmentParentGetDTO> Dto = mapper.Map<List<AppointmentParentGetDTO>>(appointmentParents);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" , "parent" },
          allowEdit: 1,
          pages: new[] { "Appoinment" }
        )]
        public async Task<IActionResult> EditAsync(AppointmentParentGetDTO NewAppointment)
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

            AppointmentParent appointment = Unit_Of_Work.appointmentParent_Repository.First_Or_Default(s => s.ID == NewAppointment.ID && s.IsDeleted != true);
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

            await Unit_Of_Work.SaveChangesAsync();

            Unit_Of_Work.appointmentParent_Repository.Update(appointment);
            Unit_Of_Work.SaveChanges();
            return Ok(NewAppointment);
        }

    }
}
