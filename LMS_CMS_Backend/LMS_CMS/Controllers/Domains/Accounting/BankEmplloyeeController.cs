using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class BankEmplloyeeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public BankEmplloyeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet("GetByBankID/{bankID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Bank" }
        )]
        public IActionResult GetByBankID(long bankID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Bank bank = Unit_Of_Work.bank_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == bankID);
            if (bank == null)
            {
                return BadRequest("No Bank With this ID");
            }

            List<BankEmployee> bankEmployees = Unit_Of_Work.bankEmployee_Repository.FindBy(
                    f => f.IsDeleted != true && f.BankID == bankID);

            if (bankEmployees == null || bankEmployees.Count == 0)
            {
                return NotFound();
            }

            List<BankEmployeeGetDTO> bankEmployeesDTO = mapper.Map<List<BankEmployeeGetDTO>>(bankEmployees);

            return Ok(bankEmployeesDTO);
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Bank" }
        )]
        public IActionResult Add(BankEmployeeAddDTO NewBankEmployee)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewBankEmployee == null)
            {
                return BadRequest("Bank Employee cannot be null");
            }

            Bank bank = Unit_Of_Work.bank_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewBankEmployee.BankID);
            if (bank == null)
            {
                return BadRequest("No Bank With this ID");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewBankEmployee.EmployeeID);
            if (employee == null)
            {
                return BadRequest("No Employee With this ID");
            }

            BankEmployee bankEmployee = mapper.Map<BankEmployee>(NewBankEmployee);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            bankEmployee.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                bankEmployee.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                bankEmployee.InsertedByUserId = userId;
            }

            Unit_Of_Work.bankEmployee_Repository.Add(bankEmployee);
            Unit_Of_Work.SaveChanges();
            return Ok();
        } 

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Bank" }
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

            if (id == 0)
            {
                return BadRequest("Enter Bank Employee ID");
            }

            BankEmployee bankEmployee = Unit_Of_Work.bankEmployee_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (bankEmployee == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Bank", roleId, userId, bankEmployee);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            bankEmployee.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            bankEmployee.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                bankEmployee.DeletedByOctaId = userId;
                if (bankEmployee.DeletedByUserId != null)
                {
                    bankEmployee.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                bankEmployee.DeletedByUserId = userId;
                if (bankEmployee.DeletedByOctaId != null)
                {
                    bankEmployee.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.bankEmployee_Repository.Update(bankEmployee);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
