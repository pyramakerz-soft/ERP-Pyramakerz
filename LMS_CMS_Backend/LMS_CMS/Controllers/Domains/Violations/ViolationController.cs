using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.Violation;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.ViolationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace LMS_CMS_PL.Controllers.Domains.Violations
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ViolationController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ViolationController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }
        ///////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "violation" }
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

            List<Violation> violations = await Unit_Of_Work.violations_Repository.Select_All_With_IncludesById<Violation>(sem => sem.IsDeleted != true,
                    query => query.Include(emp => emp.ViolationType),
                    query => query.Include(emp => emp.Employee.EmployeeType),
                    query => query.Include(emp => emp.Employee));

            if (violations == null || violations.Count == 0)
            {
                return NotFound();
            }

            List<ViolationGetDTO> violationDTOs = mapper.Map<List<ViolationGetDTO>>(violations);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var v in violationDTOs)
            {
                if (!string.IsNullOrEmpty(v.Attach))
                {
                    v.Attach = $"{serverUrl}{v.Attach.Replace("\\", "/")}";
                }
            }

            return Ok(violationDTOs);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////--77
        [HttpGet("ViolationReport")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "violation" })]
        public async Task<IActionResult> GetViolationReport(
         [FromQuery] long? employeeTypeId,[FromQuery] long? violationTypeId,
         [FromQuery] DateOnly? fromDate, [FromQuery] DateOnly? toDate)
        {

            if (!fromDate.HasValue || !toDate.HasValue)
                return BadRequest("Both FromDate and ToDate are required.");

            if (fromDate.Value > toDate.Value)
                return BadRequest("FromDate cannot be greater than ToDate.");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            IQueryable<Violation> query = Unit_Of_Work.violations_Repository.Query()
                .Include(v => v.ViolationType)
                .Include(v => v.Employee)
                    .ThenInclude(e => e.EmployeeType)
                .Where(v => !v.IsDeleted.HasValue || !v.IsDeleted.Value);


            if (employeeTypeId.HasValue)
            {
                query = query.Where(v => v.Employee.EmployeeTypeID == employeeTypeId.Value);
            }

            if (violationTypeId.HasValue)
            {
                query = query.Where(v => v.ViolationTypeID == violationTypeId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(v => v.Date >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(v => v.Date <= toDate.Value);
            }

            var violations = await query
           .OrderBy(v => v.Date)
           .ToListAsync();

            var violationReports = mapper.Map<List<ViolationReportDTO>>(violations);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var report in violationReports)
            {
                if (!string.IsNullOrEmpty(report.AttachmentUrl))
                {
                    report.AttachmentUrl = $"{serverUrl}{report.AttachmentUrl.Replace("\\", "/")}";
                }
            }
            return Ok(violationReports);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "violation" }
        )]
        public async Task<IActionResult> GetAsyncByID(long id)
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

            Violation violations = await Unit_Of_Work.violations_Repository.FindByIncludesAsync(sem => sem.IsDeleted != true && sem.ID==id,
                    query => query.Include(emp => emp.ViolationType),
                    query => query.Include(emp => emp.Employee.EmployeeType),
                    query => query.Include(emp => emp.Employee));

            if (violations == null)
            {
                return NotFound();
            }

            ViolationGetDTO violationDTOs = mapper.Map<ViolationGetDTO>(violations);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            if (!string.IsNullOrEmpty(violationDTOs.Attach))
            {
                violationDTOs.Attach = $"{serverUrl}{violationDTOs.Attach.Replace("\\", "/")}";
            }

            return Ok(violationDTOs);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "violation" }
        )]
        public async Task<IActionResult> Add([FromForm]ViolationAddDTO Newviolation)
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
            if (Newviolation == null)
            {
                return NotFound();
            }
            Violation violation = mapper.Map<Violation>(Newviolation);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            violation.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                violation.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                violation.InsertedByUserId = userId;
            }

            Unit_Of_Work.violations_Repository.Add(violation);
            Unit_Of_Work.SaveChanges();

            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Violation");
            var violationFolder = Path.Combine(baseFolder, violation.ID.ToString());
            if (!Directory.Exists(violationFolder))
            {
                Directory.CreateDirectory(violationFolder);
            }

            if (Newviolation.AttachFile != null)
            {

                var allowedMimeTypes = new[] {
                    "application/pdf",
                    "application/msword", // .doc
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                    "image/jpeg",
                    "image/png",
                };

                var contentType = Newviolation.AttachFile.ContentType;
                var fileExtension = Path.GetExtension(Newviolation.AttachFile.FileName).ToLower();

                if (!allowedMimeTypes.Contains(contentType))
                {
                    return BadRequest("Only image, PDF, or Word files are allowed.");
                }

                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" };
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("File extension is not supported.");
                } 

                if (Newviolation.AttachFile.Length > 0)
                {
                    var filePath = Path.Combine(violationFolder, Newviolation.AttachFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await Newviolation.AttachFile.CopyToAsync(stream);
                    }
                }

                violation.Attach = $"Uploads/Violation/{violation.ID.ToString()}/{Newviolation.AttachFile.FileName}";

                Unit_Of_Work.violations_Repository.Update(violation);
                Unit_Of_Work.SaveChanges();
            }

            return Ok(Newviolation);
        }
        ////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
         allowEdit: 1,
         pages: new[] { "violation" }
        )]
        public async Task<IActionResult> EditAsync([FromForm] ViolationEditDTO Newviolation)
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

            if (Newviolation == null)
            {
                return BadRequest("Violation cannot be null");
            }
            Violation violation = Unit_Of_Work.violations_Repository.First_Or_Default(v => v.ID == Newviolation.ID);
            if (violation == null)
            {
                return NotFound();
            }
            if (userTypeClaim == "employee")
            {
                Page page = Unit_Of_Work.page_Repository.First_Or_Default(page => page.en_name == "Violation Types");
                if (page != null)
                {
                    Role_Detailes roleDetails = Unit_Of_Work.role_Detailes_Repository.First_Or_Default(RD => RD.Page_ID == page.ID && RD.Role_ID == roleId);
                    if (roleDetails != null && roleDetails.Allow_Edit_For_Others == false)
                    {
                        if (violation.InsertedByUserId != userId)
                        {
                            return Unauthorized();
                        }
                    }
                }
                else
                {
                    return BadRequest("Violations page doesn't exist");
                }
            }
            ////mapper.Map<Violation>(Newviolation);
            mapper.Map(Newviolation, violation);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            violation.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                violation.UpdatedByOctaId = userId;
                if (violation.UpdatedByUserId != null)
                {
                    violation.UpdatedByUserId = null;
                }

            }
            else if (userTypeClaim == "employee")
            {
                violation.UpdatedByUserId = userId;
                if (violation.UpdatedByOctaId != null)
                {
                    violation.UpdatedByOctaId = null;
                }
            }
            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Violation");
            var violationFolder = Path.Combine(baseFolder, violation.ID.ToString());
            if (!Directory.Exists(violationFolder))
            {
                Directory.CreateDirectory(violationFolder);
            }

            if (Newviolation.AttachFile != null)
            {

                var allowedMimeTypes = new[] {
                    "application/pdf",
                    "application/msword", // .doc
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                    "image/jpeg",
                    "image/png",
                };

                var contentType = Newviolation.AttachFile.ContentType;
                var fileExtension = Path.GetExtension(Newviolation.AttachFile.FileName).ToLower();

                if (!allowedMimeTypes.Contains(contentType))
                {
                    return BadRequest("Only image, PDF, or Word files are allowed.");
                }

                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" };
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("File extension is not supported.");
                }

                if (Newviolation.AttachFile.Length > 0)
                {
                    var filePath = Path.Combine(violationFolder, Newviolation.AttachFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await Newviolation.AttachFile.CopyToAsync(stream);
                    }
                }
                violation.Attach = $"Uploads/Violation/{violation.ID.ToString()}/{Newviolation.AttachFile.FileName}";
            }

            Unit_Of_Work.violations_Repository.Update(violation);
            Unit_Of_Work.SaveChanges();
            return Ok(Newviolation);

        }

        //////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "violation" }
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
            Violation violation = Unit_Of_Work.violations_Repository.Select_By_Id(id);

            if (violation == null || violation.IsDeleted == true)
            {
                return NotFound("No Violation with this ID");
            } 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Violation Types", roleId, userId, violation);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            violation.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            violation.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                violation.DeletedByOctaId = userId;
                if (violation.DeletedByUserId != null)
                {
                    violation.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                violation.DeletedByUserId = userId;
                if (violation.DeletedByOctaId != null)
                {
                    violation.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.violations_Repository.Update(violation);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
