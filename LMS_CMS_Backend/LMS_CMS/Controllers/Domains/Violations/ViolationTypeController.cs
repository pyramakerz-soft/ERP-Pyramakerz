using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Violation;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Migrations.Octa;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.ViolationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace LMS_CMS_PL.Controllers.Domains.Violations
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ViolationTypeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ViolationTypeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByEmployeeType/{EmployeeTypeId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Violation Types" , "violation Report" }
        )]
        public async Task<IActionResult> GetByEmployeeTypeAsync(long EmployeeTypeId)
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

            List<ViolationType> violationTypess =new List<ViolationType>();

            if (EmployeeTypeId == 0)
            {
                violationTypess = await Unit_Of_Work.violationType_Repository.Select_All_With_IncludesById<ViolationType>(
                    sem => sem.IsDeleted != true);

                if (violationTypess == null || violationTypess.Count == 0)
                {
                    return NotFound();
                }
            }
            else
            {

                List<EmployeeTypeViolation> employeeTypeViolations = await Unit_Of_Work.employeeTypeViolation_Repository
                            .Select_All_With_IncludesById<EmployeeTypeViolation>(e => e.EmployeeTypeID == EmployeeTypeId && e.IsDeleted != true,
                            query => query.Include(emp => emp.EmployeeType));

                List<long> violationTypeIds = employeeTypeViolations.Select(s=>s.ViolationTypeID).ToList();

                violationTypess = await Unit_Of_Work.violationType_Repository.Select_All_With_IncludesById<ViolationType>(
                    sem => sem.IsDeleted != true && violationTypeIds.Contains(sem.ID));

                if (violationTypess == null || violationTypess.Count == 0)
                {
                    return NotFound();
                }

            }
            List<ViolationTypeGetDTO> violationDTOs = mapper.Map<List<ViolationTypeGetDTO>>(violationTypess);

            foreach (var item in violationDTOs)
            {
                List<EmployeeTypeViolation> employeeTypeViolation= await Unit_Of_Work.employeeTypeViolation_Repository
                    .Select_All_With_IncludesById<EmployeeTypeViolation>(e => e.ViolationTypeID == item.ID && e.IsDeleted != true,
                    query => query.Include(emp => emp.EmployeeType));

                item.employeeTypes = mapper.Map<List<EmployeeTypeGetDTO>>(employeeTypeViolation);
            }

            return Ok(violationDTOs);
        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Violation Types" }
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

            ViolationType violation = await Unit_Of_Work.violationType_Repository.FindByIncludesAsync(
                sem => sem.IsDeleted != true && sem.ID == id);

            if (violation == null)
            {
                return NotFound();
            }

            ViolationTypeGetDTO violationDTO = mapper.Map<ViolationTypeGetDTO>(violation);


            List<EmployeeTypeViolation> employeeTypeViolations = await Unit_Of_Work.employeeTypeViolation_Repository
                .Select_All_With_IncludesById<EmployeeTypeViolation>(e => e.ViolationTypeID == violationDTO.ID && e.IsDeleted != true,
                query => query.Include(emp => emp.EmployeeType));

            violationDTO.employeeTypes = mapper.Map<List<EmployeeTypeGetDTO>>(employeeTypeViolations);
            return Ok(violationDTO);
        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Violation Types" }
        )]
        public async Task<IActionResult> Add(ViolationTypeAddDTO Newviolation)
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
            //if (Newviolation.Name == null)
            //{
            //    return BadRequest("the name cannot be null");
            //}
            //ViolationType violationType = Unit_Of_Work.violationType_Repository.First_Or_Default(s=>s.Name == Newviolation.Name);   
            //if (violationType != null)
            //{
            //    return BadRequest("the name Alreade Exist");
            //}
            ViolationType violationType = new ViolationType();
            violationType = mapper.Map<ViolationType>(Newviolation);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            violationType.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                violationType.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                violationType.InsertedByUserId = userId;
            }

            Unit_Of_Work.violationType_Repository.Add(violationType);
            Unit_Of_Work.SaveChanges();

            foreach (var item in Newviolation.EmployeeTypeIds)
            {
                EmployeeTypeViolation employeeTypeViolation = new EmployeeTypeViolation();
                employeeTypeViolation.ViolationTypeID = violationType.ID;
                employeeTypeViolation.EmployeeTypeID = item;
                Unit_Of_Work.employeeTypeViolation_Repository.Add(employeeTypeViolation);

            }
            Unit_Of_Work.SaveChanges();

            return Ok(Newviolation);
        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
         allowEdit: 1,
         pages: new[] { "Violation Types"}
        )]
        public async Task<IActionResult> EditAsync(ViolationTypeEditDTO Newviolation)
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
            if (Newviolation.Name == null)
            {
                return BadRequest("the name cannot be null");
            }
            ViolationType violationType = Unit_Of_Work.violationType_Repository.First_Or_Default(v => v.ID == Newviolation.ID);
            if (violationType == null)
            {
                return NotFound();
            }

            //if(Newviolation.Name != violationType.Name)
            //{
            //    ViolationType violationTypeCheckOnName = Unit_Of_Work.violationType_Repository.First_Or_Default(s => s.ID != Newviolation.ID && s.Name == Newviolation.Name);
            //    if (violationTypeCheckOnName != null)
            //    {
            //        return BadRequest("the name Alreade Exist");
            //    }
            //}

            if (userTypeClaim == "employee")
            {
                Page page = Unit_Of_Work.page_Repository.First_Or_Default(page => page.en_name == "Violation Types");
                if (page != null)
                {
                    Role_Detailes roleDetails = Unit_Of_Work.role_Detailes_Repository.First_Or_Default(RD => RD.Page_ID == page.ID && RD.Role_ID == roleId);
                    if (roleDetails != null && roleDetails.Allow_Edit_For_Others == false)
                    {
                        if (violationType.InsertedByUserId != userId)
                        {
                            return Unauthorized();
                        }
                    }
                }
                else
                {
                    return BadRequest("Violation Types page doesn't exist");
                }
            }
            ////mapper.Map<Violation>(Newviolation);
            mapper.Map(Newviolation, violationType);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            violationType.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                violationType.UpdatedByOctaId = userId;
                if (violationType.UpdatedByUserId != null)
                {
                    violationType.UpdatedByUserId = null;
                }

            }
            else if (userTypeClaim == "employee")
            {
                violationType.UpdatedByUserId = userId;
                if (violationType.UpdatedByOctaId != null)
                {
                    violationType.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.violationType_Repository.Update(violationType);
            Unit_Of_Work.SaveChanges();

            List<EmployeeTypeViolation> employeeTypeViolations = await Unit_Of_Work.employeeTypeViolation_Repository
               .Select_All_With_IncludesById<EmployeeTypeViolation>(e => e.ViolationTypeID == violationType.ID && e.IsDeleted!= true,
               query => query.Include(emp => emp.EmployeeType));

            List<long> existedEmployeeTypeIds = employeeTypeViolations.Select(d => d.EmployeeTypeID ?? 0).Where(id => id > 0).ToList();
            List<long> updatedEmployeeTypeIds = Newviolation.EmployeeTypeIds?.ToList() ?? new();

            var deletedEmployeeTypeIds = existedEmployeeTypeIds.Except(updatedEmployeeTypeIds).ToList();
            var newEmployeeTypeIds = updatedEmployeeTypeIds.Except(existedEmployeeTypeIds).ToList();

            // Delete removed employee type relations
            foreach (var deletedId in deletedEmployeeTypeIds)
            {
                var relation = employeeTypeViolations.FirstOrDefault(r => r.EmployeeTypeID == deletedId);
                if (relation != null)
                {
                    relation.IsDeleted = true;
                    Unit_Of_Work.employeeTypeViolation_Repository.Update(relation);
                }
            }

            // Add new employee type relations
            foreach (var newId in newEmployeeTypeIds)
            {
                EmployeeTypeViolation newRelation = new()
                {
                    ViolationTypeID = violationType.ID,
                    EmployeeTypeID = newId
                };
                Unit_Of_Work.employeeTypeViolation_Repository.Add(newRelation);
            }

            await Unit_Of_Work.SaveChangesAsync();


            return Ok(Newviolation);

        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Violation Types" }
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
            ViolationType violationType = Unit_Of_Work.violationType_Repository.Select_By_Id(id);

            if (violationType == null || violationType.IsDeleted == true)
            {
                return NotFound("No Violation with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Violation Types", roleId, userId, violationType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            violationType.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            violationType.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                violationType.DeletedByOctaId = userId;
                if (violationType.DeletedByUserId != null)
                {
                    violationType.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                violationType.DeletedByUserId = userId;
                if (violationType.DeletedByOctaId != null)
                {
                    violationType.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.violationType_Repository.Update(violationType);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
