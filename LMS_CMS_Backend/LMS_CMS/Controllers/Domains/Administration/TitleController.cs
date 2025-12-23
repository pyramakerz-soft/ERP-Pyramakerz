using AutoMapper;
using LMS_CMS_BL.DTO.Administration; 
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Administration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class TitleController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public TitleController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////////////////////////////////////////// GET: api/with-domain/Title
 
        [HttpGet]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee", "student" })]
        public async Task<IActionResult> GetAsync() 
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Title> titles = await Unit_Of_Work.title_Repository.Select_All_With_IncludesById<Title>(
                b => b.IsDeleted != true ,
                q => q.Include(b => b.Department));

            if (titles == null || titles.Count == 0)
            {
                return NotFound();
            }
            List<TitleGetDto> titleGetDtos = mapper.Map<List<TitleGetDto>>(titles);
            return Ok(titleGetDtos);
         
        }

        //////////////////////////////////////////////////////////////////////////// GET: api/with-domain/Title/5
      
        [HttpGet("{id}")]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Title" })]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            if (id == 0)
                return NotFound();


            var title = Unit_Of_Work.title_Repository.First_Or_Default(
                t => t.ID == id && t.IsDeleted != true && t.ID == id);

            if (title == null)
                return NotFound();

           TitleGetDto titleGetDto = mapper.Map<TitleGetDto>(title);
            return Ok(titleGetDto);
        }

        //////////////////////////////////////////////////////////////////////// GET: api/with-domain/Title/ByDepartment/{departmentId}
        [HttpGet("ByDepartment/{departmentId}")]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee", "student" })]
        public async Task<IActionResult> GetByDepartmentIdAsync(long departmentId)
        {
            if (departmentId <= 0)
                return BadRequest("Invalid Department ID");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            // تحقق إن القسم موجود ومش محذوف
            var departmentExists =  Unit_Of_Work.department_Repository.First_Or_Default(d => d.ID == departmentId && d.IsDeleted != true);

            if (departmentExists == null)
                return NotFound("Department not found");

            // جلب العناوين الخاصة بالقسم ده فقط
            List<Title> titles = await Unit_Of_Work.title_Repository.Select_All_With_IncludesById<Title>(
                b => b.IsDeleted != true && b.DepartmentID == departmentId,
                q => q.Include(b => b.Department));

            List<TitleGetDto> titleGetDtos = mapper.Map<List<TitleGetDto>>(titles);
            return Ok(titleGetDtos);
        }

        /////////////////////////////////////////////////////////////////////////// POST: api/with-domain/Title

        [HttpPost]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Title" })]
        public IActionResult Add(TitleAddDto newTitleDto)
        {
            if (newTitleDto == null)
                return BadRequest("Title data is required");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);


            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            var dept = Unit_Of_Work.department_Repository.First_Or_Default(d => d.ID == newTitleDto.DepartmentID && d.IsDeleted != true);
            if (dept == null)
                return BadRequest("Invalid Department ID");

            var title = mapper.Map<Title>(newTitleDto);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            title.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
                title.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee")
                title.InsertedByUserId = userId;

            Unit_Of_Work.title_Repository.Add(title);
            Unit_Of_Work.SaveChanges();

            var result = mapper.Map<TitleGetDto>(title);
            return Ok(result);
        }

        /////////////////////////////////////////////////////////////////////////////////////// PUT: api/with-domain/Title
      
        [HttpPut]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" },allowEdit: 1, pages: new[] { "Title" })]
        public IActionResult Edit(TitleGetDto updatedTitleDto)
        {
            if (updatedTitleDto == null)
                return BadRequest("Title data is required");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var roleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(roleClaim, out long roleId);

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
                return Unauthorized("User claims not found");

            var title = Unit_Of_Work.title_Repository.First_Or_Default(t => t.ID == updatedTitleDto.ID && t.IsDeleted != true);
            if (title == null)
                return NotFound();

            // لو غير القسم، تحقق منه
            if (title.DepartmentID != updatedTitleDto.DepartmentID)
            {
                var dept = Unit_Of_Work.department_Repository.First_Or_Default(d => d.ID == updatedTitleDto.DepartmentID && d.IsDeleted != true);
                if (dept == null)
                    return BadRequest("Invalid Department ID");
            }

            //if (userTypeClaim == "employee")
            //{
            //    var deptForAccess = Unit_Of_Work.department_Repository.First_Or_Default(d => d.ID == updatedTitleDto.DepartmentID);
            //    IActionResult? access = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Title", roleId, userId, deptForAccess);
            //    if (access != null) return access;
            //}

            mapper.Map(updatedTitleDto, title);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            title.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                title.UpdatedByOctaId = userId;
                title.UpdatedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                title.UpdatedByUserId = userId;
                title.UpdatedByOctaId = null;
            }

            Unit_Of_Work.title_Repository.Update(title);
            Unit_Of_Work.SaveChanges();

            return Ok(updatedTitleDto);
        }

        /////////////////////////////////////////////////////////////////////////////////////// DELETE: api/with-domain/Title/5
   
        [HttpDelete("{id}")]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowDelete: 1, pages: new[] { "Department" })]
        public IActionResult Delete(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var roleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(roleClaim, out long roleId);

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
                return Unauthorized("User claims not found");

            var title = Unit_Of_Work.title_Repository.First_Or_Default(
               t => t.ID == id && t.IsDeleted != true);
 

            if (title == null)
                return NotFound();

            //if (userTypeClaim == "employee")
            //{
            //    IActionResult? access = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "department", roleId, userId, title.Department);
            //    if (access != null) return access;
            //}

            title.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            title.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                title.DeletedByOctaId = userId;
                title.DeletedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                title.DeletedByUserId = userId;
                title.DeletedByOctaId = null;
            }

            Unit_Of_Work.title_Repository.Update(title);
            Unit_Of_Work.SaveChanges();
          
            return Ok();
        }
    }
}