using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.BusModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace LMS_CMS_PL.Controllers.Domains.Administration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class RegisteredEmployeeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly IamNotRobot _iamNotRobotService;

        public RegisteredEmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, IamNotRobot iamNotRobotService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _iamNotRobotService = iamNotRobotService;
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Registered Employee" }
        )]
        public IActionResult Get()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<RegisteredEmployee> registeredEmployees = Unit_Of_Work.registeredEmployee_Repository.FindBy(
                    f => f.IsAccepted == null);

            if (registeredEmployees == null || registeredEmployees.Count == 0)
            {
                return NotFound();
            }

            List<RegisteredEmployeeGetDTO> registeredEmployeesGetDTO = mapper.Map<List<RegisteredEmployeeGetDTO>>(registeredEmployees);

            return Ok(registeredEmployeesGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Registered Employee" }
        )]
        public IActionResult GetByID(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            RegisteredEmployee registeredEmployee = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(
                    f => f.IsAccepted == null && f.ID == id);

            if (registeredEmployee == null)
            {
                return NotFound();
            }

            RegisteredEmployeeGetDTO registeredEmployeeGetDTO = mapper.Map<RegisteredEmployeeGetDTO>(registeredEmployee);

            return Ok(registeredEmployeeGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Registered Employee" }
        )]
        public async Task<IActionResult> Add(RegisteredEmployeeAddDTO NewRegistrationEmployee)
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
            if (NewRegistrationEmployee == null)
            {
                return BadRequest("Employee data is required.");
            }

            bool isValidCaptcha = await _iamNotRobotService.VerifyRecaptcha(NewRegistrationEmployee.RecaptchaToken);
            if (!isValidCaptcha)
            {
                return BadRequest("You must confirm you are not a robot.");
            }

            string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (!Regex.IsMatch(NewRegistrationEmployee.Email, pattern))
            {
                return BadRequest("Email Is Not Valid");
            }

            RegisteredEmployee registered = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(e => e.User_Name == NewRegistrationEmployee.User_Name);
            if (registered != null)
            {
                return BadRequest("This User Name Already Exist");
            }

            RegisteredEmployee CheckEmailFromRegistered = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(e => e.Email == NewRegistrationEmployee.Email);
            if (CheckEmailFromRegistered != null)
            {
                return BadRequest("This Email Already Exist");
            }
            
            Employee employeeExists = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.User_Name == NewRegistrationEmployee.User_Name);
            if (employeeExists != null)
            {
                return BadRequest("This User Name Already Exist");
            }
            
            Employee CheckEmail = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.Email == NewRegistrationEmployee.Email);
            if (CheckEmail != null)
            {
                return BadRequest("This Email Already Exist");
            }

            RegisteredEmployee employee = mapper.Map<RegisteredEmployee>(NewRegistrationEmployee);
             
            employee.Password = BCrypt.Net.BCrypt.HashPassword(NewRegistrationEmployee.Password); 

            Unit_Of_Work.registeredEmployee_Repository.Add(employee);
            Unit_Of_Work.SaveChanges();
                
            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("Reject/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Registered Employee" }
        )]
        public async Task<IActionResult> Reject(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

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
                return BadRequest("Registered Employee ID cannot be null");
            }

            RegisteredEmployee registeredEmployee = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(t => t.IsAccepted == null);

            if (registeredEmployee == null)
            {
                return NotFound();
            } 
              
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Registered Employee", roleId, userId, registeredEmployee);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            } 
             
            registeredEmployee.IsAccepted = false; 
            Unit_Of_Work.registeredEmployee_Repository.Update(registeredEmployee);
             
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("Accept")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Registered Employee" }
        )]
        public async Task<IActionResult> Accept(RegistrationEmployeeAcceptDTO acceptedEmployeeDto)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (acceptedEmployeeDto == null)
            {
                return BadRequest("Registered Employee cannot be null");
            }

            RegisteredEmployee registeredEmployee = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(t => t.IsAccepted == null && t.ID == acceptedEmployeeDto.ID);

            if (registeredEmployee == null)
            {
                return NotFound();
            }

            Role role = Unit_Of_Work.role_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == acceptedEmployeeDto.RoleID);

            if (registeredEmployee == null)
            {
                return NotFound();
            }

            EmployeeType employeeType= Unit_Of_Work.employeeType_Repository.First_Or_Default(t => t.ID == acceptedEmployeeDto.EmployeeTypeID);

            if (employeeType == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Registered Employee", roleId, userId, registeredEmployee);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            registeredEmployee.IsAccepted = true;
            Unit_Of_Work.registeredEmployee_Repository.Update(registeredEmployee);

            Employee employee = new Employee();
            employee.User_Name = registeredEmployee.User_Name;
            employee.en_name = registeredEmployee.en_name;
            employee.ar_name = registeredEmployee.ar_name;
            employee.Password = registeredEmployee.Password;
            employee.Mobile = registeredEmployee.Mobile;
            employee.Phone = registeredEmployee.Phone;
            employee.Email = registeredEmployee.Email;
            employee.Address = registeredEmployee.Address;
            employee.Role_ID = acceptedEmployeeDto.RoleID;
            employee.EmployeeTypeID = acceptedEmployeeDto.EmployeeTypeID;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            employee.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                employee.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                employee.InsertedByUserId = userId;
            }

            Unit_Of_Work.employee_Repository.Add(employee);

            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
