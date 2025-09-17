using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SafeEmployeeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SafeEmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetBySafeID/{safeID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Safe" }
        )]
        public async Task<IActionResult> GetBySafeIDAsync(long safeID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Save safe = Unit_Of_Work.save_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == safeID);
            if (safe == null)
            {
                return BadRequest("No Safe With this ID");
            }

            List<SafeEmployee> safeEmployees = await Unit_Of_Work.safeEmployee_Repository.Select_All_With_IncludesById<SafeEmployee>(
                    f => f.IsDeleted != true && f.SaveID == safeID, 
                    query => query.Include(d => d.Employee));

            if (safeEmployees == null || safeEmployees.Count == 0)
            {
                return NotFound();
            }

            List<SafeEmployeeGetDTO> safeEmployeesDTO = mapper.Map<List<SafeEmployeeGetDTO>>(safeEmployees);

            return Ok(safeEmployeesDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Safe" }
        )]
        public IActionResult Add(SafeEmployeeAddDTO NewSafeEmployee)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewSafeEmployee == null)
            {
                return BadRequest("Safe Employee cannot be null");
            }

            Save safe = Unit_Of_Work.save_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewSafeEmployee.SaveID);
            if (safe == null)
            {
                return BadRequest("No Safe With this ID");
            }

            List<SafeEmployee> safeEmployees = Unit_Of_Work.safeEmployee_Repository.FindBy(d => d.IsDeleted != true && d.SaveID == NewSafeEmployee.SaveID);
            List<long> safeEmployeeIDs = new List<long>();

            safeEmployeeIDs = safeEmployees.Select(d => d.EmployeeID).ToList();

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (long EmployeeID in NewSafeEmployee.EmployeeIDs)
            {
                Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EmployeeID);
                if (employee == null)
                {
                    return BadRequest("No Employee With this ID");
                }

                SafeEmployee safeEmployeeExist = Unit_Of_Work.safeEmployee_Repository.First_Or_Default(
                    d => d.SaveID == NewSafeEmployee.SaveID && d.EmployeeID == EmployeeID && d.IsDeleted != true);

                if (!safeEmployeeIDs.Contains(EmployeeID))
                {
                    SafeEmployee newEmp = new SafeEmployee();
                    newEmp.SaveID = NewSafeEmployee.SaveID;
                    newEmp.EmployeeID = EmployeeID;
                    newEmp.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        newEmp.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        newEmp.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.safeEmployee_Repository.Add(newEmp);
                }
            }

            List<SafeEmployee> employeesToRemove = safeEmployees
                .Where(be => !NewSafeEmployee.EmployeeIDs.Contains(be.EmployeeID))
                .ToList();

            foreach (SafeEmployee emp in employeesToRemove)
            {
                emp.IsDeleted = true;
                emp.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    emp.DeletedByOctaId = userId;
                    if (emp.DeletedByUserId != null)
                    {
                        emp.DeletedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    emp.DeletedByUserId = userId;
                    if (emp.DeletedByOctaId != null)
                    {
                        emp.DeletedByOctaId = null;
                    }
                }

                Unit_Of_Work.safeEmployee_Repository.Update(emp);
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        } 
    }
}
