using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing.Printing;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class LoansController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public LoansController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Loans" }
         )]
        public async Task<IActionResult> GetAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            int totalRecords = await Unit_Of_Work.loans_Repository
               .CountAsync(f => f.IsDeleted != true);

            List<Loans> loans =await Unit_Of_Work.loans_Repository.Select_All_With_IncludesById_Pagination<Loans>(
                    sem => sem.IsDeleted != true,
                     query => query.Include(emp => emp.Employee),
                    query => query.Include(emp => emp.Save))
               .Skip((pageNumber - 1) * pageSize)
               .Take(pageSize)
               .ToListAsync(); 

            if (loans == null || loans.Count == 0)
            {
                return NotFound();
            }

            List<loansGetDTO> Dto = mapper.Map<List<loansGetDTO>>(loans);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = Dto, Pagination = paginationMetadata });
        }

        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Loans" }
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

            Loans loan =await Unit_Of_Work.loans_Repository.FindByIncludesAsync(sem => sem.IsDeleted != true && sem.ID == id,
                 query => query.Include(emp => emp.Employee),
                 query => query.Include(emp => emp.Save));

            if (loan == null)
            {
                return NotFound();
            }

            loansGetDTO Dto = mapper.Map<loansGetDTO>(loan);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Loans" }
         )]
        public async Task<IActionResult> Add(loansAddDTO newLoan)
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
            if (newLoan == null)
            {
                return BadRequest("Conduct is empty");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e=>e.ID==newLoan.EmployeeID);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            Save safe = Unit_Of_Work.save_Repository.First_Or_Default(e => e.ID == newLoan.SafeID);
            if (safe == null)
            {
                return BadRequest("there is no safe with this id");
            }

            Loans loan = mapper.Map<Loans>(newLoan);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            loan.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                loan.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                loan.InsertedByUserId = userId;
            }
            Unit_Of_Work.loans_Repository.Add(loan);
            Unit_Of_Work.SaveChanges();
            return Ok(newLoan);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Loans" }
       )]
        public async Task<IActionResult> EditAsync(loansAddDTO newLoan)
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

            if (newLoan == null)
            {
                return BadRequest("Conduct cannot be null");
            }
            if (newLoan.ID == null)
            {
                return BadRequest("id can not be null");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newLoan.EmployeeID);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            Save safe = Unit_Of_Work.save_Repository.First_Or_Default(e => e.ID == newLoan.SafeID);
            if (safe == null)
            {
                return BadRequest("there is no safe with this id");
            }

            Loans loans = Unit_Of_Work.loans_Repository.First_Or_Default(s => s.ID == newLoan.ID && s.IsDeleted != true);
            if (loans == null)
            {
                return BadRequest("loans not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Loans", roleId, userId, loans);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newLoan, loans);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            loans.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                loans.UpdatedByOctaId = userId;
                if (loans.UpdatedByUserId != null)
                {
                    loans.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                loans.UpdatedByUserId = userId;
                if (loans.UpdatedByOctaId != null)
                {
                    loans.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.loans_Repository.Update(loans);
            Unit_Of_Work.SaveChanges();
            return Ok(newLoan);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Loans" }
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
            Loans loan = Unit_Of_Work.loans_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (loan == null)
            {
                return BadRequest("loan not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Loans", roleId, userId, loan);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            loan.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            loan.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                loan.DeletedByOctaId = userId;
                if (loan.DeletedByUserId != null)
                {
                    loan.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                loan.DeletedByUserId = userId;
                if (loan.DeletedByOctaId != null)
                {
                    loan.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.loans_Repository.Update(loan);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
        ////////////////////////////////

        [HttpGet("LoansStatus")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Loans" , "Loans Status" }
          )]
        public async Task<IActionResult> GetLoansStatus(long EmpId)
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

            // Get all employee 
            List<LoansStatusDetailsGetDTO> loansStatusDetailsGetDTO = new List<LoansStatusDetailsGetDTO>();
            List<Employee> Allemployees = new List<Employee>();

            if (EmpId > 0)
            {
                var employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == EmpId && e.IsDeleted != true);
                if (employee == null)
                {
                    return NotFound($"Employee with ID {EmpId} not found.");
                }
                Allemployees = new List<Employee> { employee };
            }
            else
            {
                    Allemployees = Unit_Of_Work.employee_Repository.FindBy(e => e.IsDeleted != true);
            }

            foreach (var employee in Allemployees)
            {
                LoansStatusDetailsGetDTO loansStatusDetailsGetDTO1 = new LoansStatusDetailsGetDTO();
                loansStatusDetailsGetDTO1.EmployeeId = employee.ID;
                loansStatusDetailsGetDTO1.EmployeeEnName = employee.en_name;
                loansStatusDetailsGetDTO1.EmployeeArName = employee.ar_name;

                List<Loans> loans = Unit_Of_Work.loans_Repository.FindBy( sem => sem.IsDeleted != true && sem.EmployeeID == employee.ID);
                List<EmployeeLoans> employeeLoans = Unit_Of_Work.employeeLoans_Repository.FindBy( sem => sem.IsDeleted != true && sem.EmployeeId == employee.ID && sem.Loans.IsDeleted!= true);

                loansStatusDetailsGetDTO1.LoansDTO= mapper.Map<List<loansGetDTO>>(loans);
                loansStatusDetailsGetDTO1.EmployeeLoansGetDTO = mapper.Map<List<EmployeeLoansGetDTO>>(employeeLoans);

                loansStatusDetailsGetDTO1.TotalLoans = (decimal)loans.Select(a=>a.Amount).Sum();
                loansStatusDetailsGetDTO1.TotalDeducted = employeeLoans.Select(a => a.Amount).Sum();
                loansStatusDetailsGetDTO1.Remaining = loansStatusDetailsGetDTO1.TotalLoans - loansStatusDetailsGetDTO1.TotalDeducted;

                if(loans != null && loans.Count > 0)
                {
                    loansStatusDetailsGetDTO.Add(loansStatusDetailsGetDTO1);
                }
            }

            return Ok(loansStatusDetailsGetDTO);
        }

        ////////////////////////////////


        [HttpPost("report")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Loans Report" })]
        public async Task<IActionResult> GetLoansReport([FromBody] ReportRequestDto request)
        {
            if (request == null)
                return BadRequest("Invalid request.");
            if (request.DateFrom == default || request.DateTo == default)
                return BadRequest("DateFrom and DateTo are required.");

            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);
            var filterService = new EmployeeFilterService(uow);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (request == null)
                return BadRequest("Invalid request.");

            if (request.EmployeeId.HasValue && request.EmployeeId.Value > 0)
            {
                var employee = uow.employee_Repository
                    .First_Or_Default(e => e.ID == request.EmployeeId.Value && e.IsDeleted != true);

                if (employee == null)
                    return NotFound("No employee found with this ID");
            }

            if (request.JobId.HasValue && request.JobId.Value > 0)
            {
                var job = uow.job_Repository
                    .First_Or_Default(j => j.ID == request.JobId.Value && j.IsDeleted != true);

                if (job == null)
                    return NotFound("No job found with this ID");
            }

            if (request.CategoryId.HasValue && request.CategoryId.Value > 0)
            {
                var category = uow.jobCategory_Repository
                    .First_Or_Default(c => c.ID == request.CategoryId.Value && c.IsDeleted != true);

                if (category == null)
                    return NotFound("No category found with this ID");
            }

            if (request.EmployeeId > 0 && request.JobId > 0)
            {
                var employeeJob = await uow.employee_Repository.FindByIncludesAsync(
                    e => e.ID == request.EmployeeId && e.JobID == request.JobId,
                    q => q.Include(e => e.Job)
                );

                if (employeeJob == null)
                    return BadRequest("The employee does not belong to the given job.");
            }

            if (request.EmployeeId > 0 && request.CategoryId > 0)
            {
                var employeeCategory = await uow.employee_Repository.FindByIncludesAsync(
                    e => e.ID == request.EmployeeId && e.Job.JobCategoryID == request.CategoryId,
                    q => q.Include(e => e.Job)
                );

                if (employeeCategory == null)
                    return BadRequest("The employee’s job does not belong to the given category.");
            }

            if (request.JobId > 0 && request.CategoryId > 0)
            {
                var jobCategory = uow.job_Repository.First_Or_Default(
                    j => j.ID == request.JobId && j.JobCategoryID == request.CategoryId
                );

                if (jobCategory == null)
                    return BadRequest("The job does not belong to the given category.");
            }

            var employees = await filterService.GetEmployees(
                      request.CategoryId,
                      request.JobId,
                      request.EmployeeId
                  );

            if (!employees.Any())
                return NotFound("No employees found for the given filters.");


            var employeeIds = employees.Select(e => e.ID).ToList();

         
            var loans = await uow.loans_Repository.Select_All_With_IncludesById<Loans>(
                l => employeeIds.Contains(l.EmployeeID)
                     && l.Date >= request.DateFrom
                     && l.Date <= request.DateTo,
                q => q.Include(l => l.Employee).ThenInclude(e => e.Job).ThenInclude(j => j.JobCategory),
                q => q.Include(l => l.Save)
            );
            if (!loans.Any())
                return NotFound("No loans found");

            var loanDtos = mapper.Map<List<loansGetDTO>>(loans);
            var report = loanDtos
                .GroupBy(l => new { l.EmployeeID, l.EmployeeEnName, l.EmployeeArName })
                .Select(g => new LoansReportDto
                 {
                      EmployeeId = g.Key.EmployeeID,
                      EmployeeEnName = g.Key.EmployeeEnName,
                      EmployeeArName = g.Key.EmployeeArName,
                      TotalAmount = g.Sum(x => x.Amount),
                      Loans = g.ToList()
                 })
                 .ToList();

            return Ok(report); 
        }
    }
}
