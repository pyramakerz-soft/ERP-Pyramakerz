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
using Microsoft.EntityFrameworkCore;

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
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByEmployeeID/{EmpId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Bank", "Receivable", "Payable" }
        )]
        public async Task<IActionResult> GetByEmployeeID(long EmpId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EmpId);
            if (employee == null)
            {
                return BadRequest("No employee With this ID");
            }

            List<BankEmployee> bankEmployees = await Unit_Of_Work.bankEmployee_Repository.Select_All_With_IncludesById<BankEmployee>(
                               f => f.IsDeleted != true && f.EmployeeID == EmpId,
                               query => query.Include(d => d.Bank),
                               query => query.Include(d => d.Employee));

            if (bankEmployees == null || bankEmployees.Count == 0)
            {
                return NotFound();
            }

            List<BankEmployeeGetDTO> bankEmployeesDTO = mapper.Map<List<BankEmployeeGetDTO>>(bankEmployees);

            return Ok(bankEmployeesDTO);
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByBankID/{bankID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Bank" }
        )]
        public async Task<IActionResult> GetByBankIDAsync(long bankID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Bank bank = Unit_Of_Work.bank_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == bankID);
            if (bank == null)
            {
                return BadRequest("No Bank With this ID");
            }
             
            List<BankEmployee> bankEmployees = await Unit_Of_Work.bankEmployee_Repository.Select_All_With_IncludesById<BankEmployee>(
                   f => f.IsDeleted != true && f.BankID == bankID,
                   query => query.Include(d => d.Employee));

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

            List<BankEmployee> bankEmployees = Unit_Of_Work.bankEmployee_Repository.FindBy(d => d.IsDeleted != true && d.BankID == NewBankEmployee.BankID);
            List<long> bankEmployeeIDs = new List<long>();

            bankEmployeeIDs = bankEmployees.Select(d => d.EmployeeID).ToList();

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (long EmployeeID in NewBankEmployee.EmployeeIDs)
            {
                Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EmployeeID);
                if (employee == null)
                {
                    return BadRequest("No Employee With this ID");
                }

                BankEmployee bankEmployeeExist = Unit_Of_Work.bankEmployee_Repository.First_Or_Default(
                    d => d.BankID == NewBankEmployee.BankID && d.EmployeeID == EmployeeID && d.IsDeleted != true);

                if (!bankEmployeeIDs.Contains(EmployeeID))
                {
                    BankEmployee newEmp = new BankEmployee();
                    newEmp.BankID = NewBankEmployee.BankID;
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

                    Unit_Of_Work.bankEmployee_Repository.Add(newEmp);
                }
            }

            List<BankEmployee> employeesToRemove = bankEmployees
                .Where(be => !NewBankEmployee.EmployeeIDs.Contains(be.EmployeeID))
                .ToList();

            foreach (BankEmployee emp in employeesToRemove)
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

                Unit_Of_Work.bankEmployee_Repository.Update(emp);
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        }  
    }
}
