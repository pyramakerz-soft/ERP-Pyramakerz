using AutoMapper;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
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
    public class ConductController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileValidationService _fileValidationService;
        private readonly FileUploadsService _fileService;

        public ConductController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _fileService = fileService;
        }

        ////////////////////////////////

        [HttpGet("BySchool/{SchoolId}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Conducts" }
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

            List<Conduct> conducts = await Unit_Of_Work.conduct_Repository.Select_All_With_IncludesById<Conduct>(
                    sem => sem.IsDeleted != true && sem.ConductType.SchoolID == SchoolId,
                    query => query.Include(emp => emp.ConductType).ThenInclude(a => a.School),
                    query => query.Include(emp => emp.Student),
                    query => query.Include(emp => emp.ProcedureType));


            if (conducts == null || conducts.Count == 0)
            {
                return NotFound();
            }

            List<ConductGetDTO> Dto = mapper.Map<List<ConductGetDTO>>(conducts);
             
            foreach (var item in Dto)
            {
                item.File = _fileService.GetFileUrl(item.File, Request, HttpContext);
            }

            return Ok(Dto);
        }

        ////////////////////////////////     

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Conducts" }
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

            Conduct conduct = await Unit_Of_Work.conduct_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id,
                    query => query.Include(emp => emp.Student),
                    query => query.Include(emp => emp.Classroom).ThenInclude(a => a.Grade),
                    query => query.Include(emp => emp.ConductType)
                        .ThenInclude(a => a.School),
                    query => query.Include(emp => emp.ProcedureType));

            if (conduct == null)
            {
                return NotFound();
            }

            ConductGetDTO Dto = mapper.Map<ConductGetDTO>(conduct);

            if (!string.IsNullOrEmpty(Dto.File))
            {
                Dto.File = _fileService.GetFileUrl(Dto.File, Request, HttpContext);
            }

            return Ok(Dto);
        }

        ////////////////////////////////     

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Conducts" }
        )]
        public async Task<IActionResult> Add([FromForm] ConductAddDTO NewConduct)
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
            if (NewConduct == null)
            {
                return BadRequest("Conduct is empty");
            }

            ConductType conductType = Unit_Of_Work.conductType_Repository.First_Or_Default(s => s.ID == NewConduct.ConductTypeID && s.IsDeleted != true);
            if (conductType == null)
            {
                return BadRequest("There is no conductType with this Id");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == NewConduct.StudentID && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("There is no Student with this Id");
            }

            ProcedureType procedureType = Unit_Of_Work.procedureType_Repository.First_Or_Default(s => s.ID == NewConduct.ProcedureTypeID && s.IsDeleted != true);
            if (procedureType == null)
            {
                return BadRequest("There is no procedureType with this Id");
            }

            if (NewConduct.NewFile != null)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(NewConduct.NewFile);

                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            Conduct conduct = mapper.Map<Conduct>(NewConduct);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conduct.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conduct.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                conduct.InsertedByUserId = userId;
            }

            Unit_Of_Work.conduct_Repository.Add(conduct);
            Unit_Of_Work.SaveChanges();
             
            if (NewConduct.NewFile != null)
            { 
                conduct.File = await _fileService.UploadFileAsync(NewConduct.NewFile, "SocialWorker/Conduct", conduct.ID, HttpContext);
                Unit_Of_Work.conduct_Repository.Update(conduct);
                Unit_Of_Work.SaveChanges();
            }

            return Ok(NewConduct);
        }

        ////////////////////////////////     

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Conducts" }
        )]
        public async Task<IActionResult> EditAsync([FromForm] ConductEditDTO NewConduct)
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

            if (NewConduct == null)
            {
                return BadRequest("Conduct cannot be null");
            }
            if (NewConduct.ID == null)
            {
                return BadRequest("id can not be null");
            }

            ConductType conductType = Unit_Of_Work.conductType_Repository.First_Or_Default(s => s.ID == NewConduct.ConductTypeID && s.IsDeleted != true);
            if (conductType == null)
            {
                return BadRequest("There is no conductType with this Id");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == NewConduct.StudentID && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("There is no Student with this Id");
            }

            ProcedureType procedureType = Unit_Of_Work.procedureType_Repository.First_Or_Default(s => s.ID == NewConduct.ProcedureTypeID && s.IsDeleted != true);
            if (procedureType == null)
            {
                return BadRequest("There is no procedureType with this Id");
            }

            Conduct conduct = Unit_Of_Work.conduct_Repository.First_Or_Default(s => s.ID == NewConduct.ID && s.IsDeleted != true);
            if (conduct == null)
            {
                return BadRequest("conduct not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Conducts", roleId, userId, conduct);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (NewConduct.NewFile != null)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(NewConduct.NewFile);

                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            if (NewConduct.NewFile != null)
            {
                NewConduct.File = await _fileService.ReplaceFileAsync(
                    NewConduct.NewFile,
                    conduct.File,
                    "SocialWorker/Conduct",
                    NewConduct.ID,
                    HttpContext
                );
            }
            else
            {
                NewConduct.File = conduct.File;
            }
            mapper.Map(NewConduct, conduct);
             
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conduct.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conduct.UpdatedByOctaId = userId;
                if (conduct.UpdatedByUserId != null)
                {
                    conduct.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                conduct.UpdatedByUserId = userId;
                if (conduct.UpdatedByOctaId != null)
                {
                    conduct.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.conduct_Repository.Update(conduct);
            Unit_Of_Work.SaveChanges();
            return Ok(NewConduct);
        }

        ////////////////////////////////     

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Conducts" }
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

            Conduct conduct = Unit_Of_Work.conduct_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (conduct == null)
            {
                return BadRequest("conduct not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Conducts", roleId, userId, conduct);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            conduct.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conduct.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conduct.DeletedByOctaId = userId;
                if (conduct.DeletedByUserId != null)
                {
                    conduct.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                conduct.DeletedByUserId = userId;
                if (conduct.DeletedByOctaId != null)
                {
                    conduct.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.conduct_Repository.Update(conduct);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    
        //////////////////////////////////////////////////////////////////////////////////////////--77
        [HttpGet("ConductReport")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Conducts Report" }
        )]
        public async Task<IActionResult> ConductReport(
        [FromQuery] DateOnly? FromDate,
        [FromQuery] DateOnly? ToDate,
        [FromQuery] long? SchoolId = null,
        [FromQuery] long? GradeId = null,
        [FromQuery] long? ClassroomId = null,
        [FromQuery] long? StudentId = null,
        [FromQuery] long? ConductTypeId = null,
        [FromQuery] long? ProcedureTypeId = null)
        {

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        var userClaims = HttpContext.User.Claims;
        var userIdClaim = userClaims.FirstOrDefault(c => c.Type == "id")?.Value;
        long.TryParse(userIdClaim, out long userId);
        var userTypeClaim = userClaims.FirstOrDefault(c => c.Type == "type")?.Value;

        if (userIdClaim == null || userTypeClaim == null)
        {
            return Unauthorized("User ID or Type claim not found.");
        }

        if (!FromDate.HasValue || !ToDate.HasValue)
        {
            return BadRequest("Both FromDate and ToDate are required.");
        }

        if (ToDate.Value < FromDate.Value)
        {
            return BadRequest("ToDate cannot be earlier than FromDate.");
        }

        IQueryable<Conduct> query = Unit_Of_Work.conduct_Repository.Query()
            .Where(c => c.IsDeleted != true && c.Date >= FromDate.Value && c.Date <= ToDate.Value);

        if (SchoolId.HasValue)
        {
            query = query.Where(c => c.ConductType.SchoolID == SchoolId.Value);
        }

        if (GradeId.HasValue)
        {
            query = query.Where(c => c.Classroom.GradeID == GradeId.Value);
        }

        if (ClassroomId.HasValue)
        {
            query = query.Where(c => c.ClassroomID == ClassroomId.Value);
        }

        if (StudentId.HasValue)
        {
            query = query.Where(c => c.StudentID == StudentId.Value);
        }

        if (ConductTypeId.HasValue)
        {
            query = query.Where(c => c.ConductTypeID == ConductTypeId.Value);
        }

        if (ProcedureTypeId.HasValue)
        {
            query = query.Where(c => c.ProcedureTypeID == ProcedureTypeId.Value);
        }

        var conducts = await query
            .Include(c => c.Student)
            .Include(c => c.ConductType)
            .Include(c => c.ProcedureType)
            .Include(c => c.Classroom)
                .ThenInclude(cr => cr.Grade)
                .OrderBy(c => c.Date)
            .ToListAsync();

        if (conducts == null || conducts.Count == 0)
        {
            return NotFound("No conduct records found for the specified criteria.");
        }

        var reportData = mapper.Map<List<ConductReportDTO>>(conducts);

        return Ok(reportData);

        }
    }
}