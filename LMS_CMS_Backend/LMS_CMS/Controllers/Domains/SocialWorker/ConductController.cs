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

        public ConductController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Lesson Resources Types" }
        )]
        public IActionResult Get()
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

            List<Conduct> conducts = Unit_Of_Work.conduct_Repository.FindBy(t => t.IsDeleted != true);

            if (conducts == null || conducts.Count == 0)
            {
                return NotFound();
            }

            List<ConductGetDTO> Dto = mapper.Map<List<ConductGetDTO>>(conducts);

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

            Conduct conduct = Unit_Of_Work.conduct_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (conduct == null)
            {
                return NotFound();
            }

            ConductGetDTO Dto = mapper.Map<ConductGetDTO>(conduct);

            return Ok(Dto);
        }

        ////////////////////////////////     

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Lesson Resources Types" }
        )]
        public async Task<IActionResult> Add([FromForm]ConductAddDTO NewConduct)
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

            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Conduct");
            var ConductFolder = Path.Combine(baseFolder, conduct.ID.ToString());
            if (!Directory.Exists(ConductFolder))
            {
                Directory.CreateDirectory(ConductFolder);
            }

            if (NewConduct.NewFile != null)
            {
                if (NewConduct.NewFile.Length > 0)
                {
                    var filePath = Path.Combine(ConductFolder, NewConduct.NewFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewConduct.NewFile.CopyToAsync(stream);
                    }
                }
                conduct.File = Path.Combine("Uploads", "Conduct", conduct.ID.ToString(), NewConduct.NewFile.FileName);
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
            pages: new[] { "Lesson Resources Types" }
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
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Lesson Resources Types", roleId, userId, conduct);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewConduct, conduct);

            if (NewConduct.NewFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Conduct");
                var ConductFolder = Path.Combine(baseFolder, conduct.ID.ToString());
                if (!Directory.Exists(ConductFolder))
                {
                    Directory.CreateDirectory(ConductFolder);
                }
                if (NewConduct.NewFile.Length > 0)
                {
                    var filePath = Path.Combine(ConductFolder, NewConduct.NewFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewConduct.NewFile.CopyToAsync(stream);
                    }
                }
                conduct.File = Path.Combine("Uploads", "Conduct", conduct.ID.ToString(), NewConduct.NewFile.FileName);
            }


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

            Conduct conduct = Unit_Of_Work.conduct_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (conduct == null)
            {
                return BadRequest("conduct not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Lesson Resources Types", roleId, userId, conduct);
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
    }
}
