using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.BusModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.S3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace LMS_CMS_PL.Controllers.Domains.Administration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    public class RegisteredEmployeeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly IamNotRobot _iamNotRobotService;
        private readonly FileValidationService _fileValidationService;
        private readonly FileUploadsService _fileService;

        public RegisteredEmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, IamNotRobot iamNotRobotService , FileValidationService fileValidationService, FileUploadsService fileService)
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
        [Authorize]
        public async Task<IActionResult> Get()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<RegisteredEmployee> registeredEmployees = await Unit_Of_Work.registeredEmployee_Repository.Select_All_With_IncludesById<RegisteredEmployee>(
               sem => sem.IsHRScreened == false,
               query => query.Include(emp => emp.Department),
               query => query.Include(emp => emp.InterviewState));


            if (!registeredEmployees.Any())
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
        [Authorize]
        public IActionResult GetByID(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            RegisteredEmployee registeredEmployee = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(
                    f => f.IsHRScreened == false && f.ID == id);

            if (registeredEmployee == null)
            {
                return NotFound();
            }

            RegisteredEmployeeGetDTO registeredEmployeeGetDTO = mapper.Map<RegisteredEmployeeGetDTO>(registeredEmployee);

            return Ok(registeredEmployeeGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        //[HttpPost] 
        //public async Task<IActionResult> Add([FromForm] RegisteredEmployeeAddDTO dto,[FromForm] List<EmployeeAttachmentAddDTO> files)
        //{
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    var userClaims = HttpContext.User.Claims;
        //    var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
        //    long.TryParse(userIdClaim, out long userId);
        //    var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

        //    if (userIdClaim == null || userTypeClaim == null)
        //    {
        //        return Unauthorized("User ID or Type claim not found.");
        //    }
        //    if (dto == null)
        //    {
        //        return BadRequest("Employee data is required.");
        //    }

        //    string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        //    if (!Regex.IsMatch(dto.Email, pattern))
        //    {
        //        return BadRequest("Email Is Not Valid");
        //    }


        //    RegisteredEmployee CheckEmailFromRegistered = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(e => e.Email == dto.Email);
        //    if (CheckEmailFromRegistered != null)
        //    {
        //        return BadRequest("This Email Already Exist");
        //    }


        //    Employee CheckEmail = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.Email == dto.Email);
        //    if (CheckEmail != null)
        //    {
        //        return BadRequest("This Email Already Exist");
        //    }

        //    RegisteredEmployee employee = mapper.Map<RegisteredEmployee>(dto);


        //    Unit_Of_Work.registeredEmployee_Repository.Add(employee);
        //    Unit_Of_Work.SaveChanges();

        //    return Ok();
        //}

        //////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost]
        public async Task<IActionResult> Add(
            [FromForm] RegisteredEmployeeAddDTO dto,
            [FromForm] List<EmployeeAttachmentAddDTO> files)
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

            if (dto == null)
            {
                return BadRequest("Employee data is required.");
            }

            string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (string.IsNullOrWhiteSpace(dto.Email) || !Regex.IsMatch(dto.Email, pattern))
            {
                return BadRequest("This Email Already Exist");
            }

            RegisteredEmployee CheckEmailFromRegistered = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(e => e.Email == dto.Email);
            if (CheckEmailFromRegistered != null)
            {
                return BadRequest("This Email Already Exist");
            }

            if (files == null || files.Count == 0)
            {
                return BadRequest("At least one file must be uploaded (such as a CV).");
            }

            foreach (var file in files)
            {
                if (file.file == null || file.file.Length == 0)
                {
                    return BadRequest($"file '{file.Name}' empty.");
                }

                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(file.file);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            // === Mapping وإضافة المتقدم ===
            RegisteredEmployee registeredEmployee = mapper.Map<RegisteredEmployee>(dto);

            registeredEmployee.ApplicationDate = DateTime.Now;
            registeredEmployee.EnterDate = DateTime.Now;
            registeredEmployee.IsHRScreened = false;
            registeredEmployee.IsAccepted = null;

            Unit_Of_Work.registeredEmployee_Repository.Add(registeredEmployee);
            await Unit_Of_Work.SaveChangesAsync(); 
      
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                string validationResult = await _fileValidationService.ValidateFileWithTimeoutAsync(dto.ProfileImage);
                if (validationResult != null)
                {
                    return BadRequest($"Error in profile picture: {validationResult}");
                }

                string profileImagePath = await _fileService.UploadFileAsync(
                    dto.ProfileImage,
                    "Administration/RegisteredEmployee/ProfileImages",  // مسار الصور
                    registeredEmployee.ID,
                    HttpContext);

                var profileAttachment = new EmployeeAttachment
                {
                    RegisteredEmployeeID = registeredEmployee.ID,
                    Name = "الصورة الشخصية",
                    Link = profileImagePath,
                   
                };

                Unit_Of_Work.employeeAttachment_Repository.Add(profileAttachment);
            }

            // === رفع الملفات الأخرى (إجباري) ===
            foreach (var file in files)
            {
                string filePath = await _fileService.UploadFileAsync(
                    file.file,
                    "Administration/RegisteredEmployee/Attachments",  
                    registeredEmployee.ID,
                    HttpContext);

                var attachment = new EmployeeAttachment
                {
                    RegisteredEmployeeID = registeredEmployee.ID,
                    Name = file.Name ?? file.file.FileName,
                    Link = filePath,
                };

                Unit_Of_Work.employeeAttachment_Repository.Add(attachment);
            }

            await Unit_Of_Work.SaveChangesAsync();

            return Ok(new { Message = "The applicant has been successfully added with the attachments.", ID = registeredEmployee.ID });
        }
        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Registered Employee" }
        )]
        public async Task<IActionResult> Edit(RegisteredEmployeeEditDTO EditRegistrationEmployee)
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
            if (EditRegistrationEmployee == null)
            {
                return BadRequest("Employee data is required.");
            }
             
            string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (!Regex.IsMatch(EditRegistrationEmployee.Email, pattern))
            {
                return BadRequest("Email Is Not Valid");
            }

            RegisteredEmployee registeredExist = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(e => e.ID == EditRegistrationEmployee.ID);
            if (registeredExist == null)
            {
                return BadRequest("This Registered Employee doesn't Exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Registered Employee", roleId, userId, registeredExist);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            //RegisteredEmployee registered = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(e => e.User_Name == EditRegistrationEmployee.User_Name && e.ID != EditRegistrationEmployee.ID);
            //if (registered != null)
            //{
            //    return BadRequest("This User Name Already Exist");
            //}

            RegisteredEmployee CheckEmailFromRegistered = Unit_Of_Work.registeredEmployee_Repository.First_Or_Default(e => e.Email == EditRegistrationEmployee.Email && e.ID != EditRegistrationEmployee.ID);
            if (CheckEmailFromRegistered != null)
            {
                return BadRequest("This Email Already Exist");
            }
            
            Employee employeeExists = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.User_Name == EditRegistrationEmployee.User_Name);
            if (employeeExists != null)
            {
                return BadRequest("This User Name Already Exist");
            }
            
            Employee CheckEmail = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.Email == EditRegistrationEmployee.Email);
            if (CheckEmail != null)
            {
                return BadRequest("This Email Already Exist");
            }

            mapper.Map(EditRegistrationEmployee, registeredExist);
             
            Unit_Of_Work.registeredEmployee_Repository.Update(registeredExist);
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
        [Authorize]
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
        [Authorize]
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

            //Employee employeeExists = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.User_Name == registeredEmployee.User_Name);
            //if (employeeExists != null)
            //{
            //    return BadRequest("This User Name Already Exist Please Change It");
            //}

            Employee CheckEmail = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.Email == registeredEmployee.Email);
            if (CheckEmail != null)
            {
                return BadRequest("This Email Already Exist Please Change It");
            }

            registeredEmployee.IsAccepted = true;
            Unit_Of_Work.registeredEmployee_Repository.Update(registeredEmployee);

            Employee employee = new Employee();
            //employee.User_Name = registeredEmployee.User_Name;
            employee.en_name = registeredEmployee.en_name;
            employee.ar_name = registeredEmployee.ar_name;
            //employee.Password = registeredEmployee.Password;
            employee.Mobile = registeredEmployee.Mobile;
            //employee.Phone = registeredEmployee.Phone;
            employee.Email = registeredEmployee.Email;
            //employee.Address = registeredEmployee.Address;
            employee.Role_ID = acceptedEmployeeDto.RoleID;
            employee.EmployeeTypeID = acceptedEmployeeDto.EmployeeTypeID;
            employee.ConnectionStatusID = 1;

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
