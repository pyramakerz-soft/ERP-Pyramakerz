using AutoMapper;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.Administration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    public class AppointmentDocumentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AppointmentDocumentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////////////////////////////////////////////////////////////////////// GET: api/with-domain/AppointmentDocument
        [HttpGet]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee", "parent", "student" })]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<AppointmentDocument> documents = await Unit_Of_Work.appointmentDocument_Repository
                .Select_All_With_IncludesById<AppointmentDocument>(d => d.IsDeleted != true);

            if (documents == null || documents.Count == 0)
            {
                return NotFound();
            }

            List<AppointmentDocumentGetDTO> dtos = mapper.Map<List<AppointmentDocumentGetDTO>>(documents);
            return Ok(dtos);
        }

        ///////////////////////////////////////////////////////////////////////////////// GET: api/with-domain/AppointmentDocument/ID
        [HttpGet("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Appointment Documents" })]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            AppointmentDocument document = Unit_Of_Work.appointmentDocument_Repository
                .First_Or_Default(d => d.Id == id && d.IsDeleted != true);

            if (document == null)
            {
                return NotFound();
            }

            AppointmentDocumentGetDTO dto = mapper.Map<AppointmentDocumentGetDTO>(document);
            return Ok(dto);
        }

        ///////////////////////////////////////////////////////////////////////////////// POST: api/with-domain/AppointmentDocument
        [HttpPost]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Appointment Documents" })]
        public IActionResult Add(AppointmentDocumentAddDTO newDocumentDto)
        {
            if (newDocumentDto == null)
            {
                return BadRequest("Document data cannot be null");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            AppointmentDocument document = mapper.Map<AppointmentDocument>(newDocumentDto);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            document.AppointmentDate = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            document.InsertedAt = document.AppointmentDate;

            if (userTypeClaim == "octa")
            {
                document.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                document.InsertedByUserId = userId;
            }

            Unit_Of_Work.appointmentDocument_Repository.Add(document);
            Unit_Of_Work.SaveChanges();

            return Ok(mapper.Map<AppointmentDocumentGetDTO>(document));
        }

        //////////////////////////////////////////////////////////////////////////////////////// PUT: api/with-domain/AppointmentDocument
       
        [HttpPut]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowEdit: 1, pages: new[] { "Appointment Documents" })]
        public IActionResult Edit(AppointmentDocumentGetDTO updatedDocumentDto)
        {
            if (updatedDocumentDto == null)
            {
                return BadRequest("Document data cannot be null");
            }
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            AppointmentDocument document = Unit_Of_Work.appointmentDocument_Repository
                .First_Or_Default(d => d.Id == updatedDocumentDto.Id && d.IsDeleted != true);

            if (document == null)
            {
                return NotFound("There is no document with this id");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Appointment Documents", roleId, userId, document);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(updatedDocumentDto, document);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            document.AppointmentDate = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            document.UpdatedAt = document.AppointmentDate;

            if (userTypeClaim == "octa")
            {
                document.UpdatedByOctaId = userId;
                document.UpdatedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                document.UpdatedByUserId = userId;
                document.UpdatedByOctaId = null;
            }

            Unit_Of_Work.appointmentDocument_Repository.Update(document);
            Unit_Of_Work.SaveChanges();

            return Ok(updatedDocumentDto);
        }

        ///////////////////////////////////////////////////////////////////////////////////// DELETE: api/with-domain/AppointmentDocument/5
        [HttpDelete("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowDelete: 1, pages: new[] { "Appointment Documents" })]
        public IActionResult Delete(int id)
        {
            if (id == 0)
            {
                return BadRequest("Enter valid Document ID");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            AppointmentDocument document = Unit_Of_Work.appointmentDocument_Repository
                .First_Or_Default(d => d.Id == id && d.IsDeleted != true);

            if (document == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Appointment Documents", roleId, userId, document);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            document.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            document.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                document.DeletedByOctaId = userId;
                document.DeletedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                document.DeletedByUserId = userId;
                document.DeletedByOctaId = null;
            }

            Unit_Of_Work.appointmentDocument_Repository.Update(document);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }
    }
}
