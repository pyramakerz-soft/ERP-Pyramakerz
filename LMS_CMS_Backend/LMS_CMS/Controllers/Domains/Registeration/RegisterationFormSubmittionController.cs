using AutoMapper;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_DAL.Models.Octa;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Registeration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class RegisterationFormSubmittionController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly UOW _Unit_Of_Work_Octa;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileUploadsService _fileService;

        public RegisterationFormSubmittionController(DbContextFactoryService dbContextFactory, IMapper mapper, UOW unit_Of_Work_Octa, CheckPageAccessService checkPageAccessService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _Unit_Of_Work_Octa = unit_Of_Work_Octa;
            _checkPageAccessService = checkPageAccessService;   
            _fileService = fileService;
        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByRegistrationParentID/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Registration Confirmation" }
        )]
        public async Task<IActionResult> GetByRegistrationParentID(long id)
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

            List<RegisterationFormSubmittion> registerationFormSubmittions = await Unit_Of_Work.registerationFormSubmittion_Repository.Select_All_With_IncludesById<RegisterationFormSubmittion>(
                    r => r.RegisterationFormParentID == id,
                    query => query.Include(emp => emp.RegisterationFormParent),
                    query => query.Include(emp => emp.CategoryField).ThenInclude(f => f.RegistrationCategory),
                    query => query.Include(emp => emp.FieldOption));

            if (registerationFormSubmittions == null || registerationFormSubmittions.Count == 0)
            {
                return NotFound();
            }
             
            foreach (var r in registerationFormSubmittions)
            {
                if (!string.IsNullOrEmpty(r.TextAnswer) && r.CategoryField.FieldTypeID == 6)
                { 
                    r.TextAnswer = _fileService.GetFileUrl(r.TextAnswer, Request, HttpContext);
                }
            }
             
            List<RegisterationFormSubmittionGetDTO> registerationFormSubmittionDTO = mapper.Map<List<RegisterationFormSubmittionGetDTO>>(registerationFormSubmittions);

            foreach (var item in registerationFormSubmittionDTO)
            {
                switch (item.CategoryFieldID)
                {
                    case 3:
                        Gender gender = Unit_Of_Work.gender_Repository.First_Or_Default(s => s.ID.ToString() == item.TextAnswer);
                        if (gender != null)
                        {
                            item.TextAnswer = gender.Name;
                            item.SelectedFieldOptionID = gender.ID;

                        }
                        break;

                    case 5:
                        Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.First_Or_Default_Octa(s => s.ID.ToString() == item.TextAnswer);
                        if (nationality != null)
                        {
                            item.TextAnswer = nationality.ID.ToString();
                            item.SelectedFieldOptionID = nationality.ID;

                        }
                        break;

                    case 7:
                        School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID.ToString() == item.TextAnswer);
                        if (school != null)
                        {
                            item.TextAnswer = school.Name;
                            item.SelectedFieldOptionID = school.ID;

                        }
                        break;

                    case 8:
                        AcademicYear year = Unit_Of_Work.academicYear_Repository.First_Or_Default(s => s.ID.ToString() == item.TextAnswer);
                        if (year != null)
                        {
                            item.TextAnswer = year.Name;
                            item.SelectedFieldOptionID = year.ID;
                        }
                        break;

                    case 9:
                        Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(s => s.ID.ToString() == item.TextAnswer);
                        if (grade != null)
                        {
                            item.TextAnswer = grade.Name;
                            item.SelectedFieldOptionID = grade.ID;
                        }
                        break;

                    default: 
                        break;
                }
            }


            return Ok(registerationFormSubmittionDTO);
        }

        //////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" }, 
          pages: new[] {"Student"}  
        )]
        public IActionResult Add(List<RegisterationFormSubmittionGetDTO> newData)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }
            foreach (var item in newData)
            {
                RegisterationFormSubmittion registerationFormSubmittion = new RegisterationFormSubmittion();

                if (item.SelectedFieldOptionID == 0) 
                {
                    item.SelectedFieldOptionID = null;
                }
                mapper.Map(item, registerationFormSubmittion);

                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                registerationFormSubmittion.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    registerationFormSubmittion.InsertedByOctaId = userId;
                }
                else if (userTypeClaim == "employee")
                {
                    registerationFormSubmittion.InsertedByUserId = userId;
                }

                Unit_Of_Work.registerationFormSubmittion_Repository.Add(registerationFormSubmittion);
                
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        //////////////////////////////////////////////////////////

        [HttpPut("ForSpacificStudent/{StudentId}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowEdit: 1,
          pages: new[] {"Student" }
         )]
        public IActionResult Edit(long StudentId ,List<RegisterationFormSubmittionGetDTO> newData)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s=>s.ID== StudentId && s.IsDeleted!= true);
            if (student == null)
            {
                return BadRequest("No Student with this ID");
            }

            RegisterationFormParent registerationFormParent = Unit_Of_Work.registerationFormParent_Repository.First_Or_Default(r => r.ID == student.RegistrationFormParentID);
            if (registerationFormParent == null)
            {
                return BadRequest("No Registration Form Parent with this ID");
            }
            
            if (userTypeClaim == "employee")
            { 
                IActionResult? accessCheckStudents = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Student", roleId, userId, registerationFormParent);
                if (accessCheckStudents != null)
                {
                    return accessCheckStudents;
                }
            }

            foreach (var item in newData)
            {
                RegisterationFormSubmittion registerationFormSubmittion = Unit_Of_Work.registerationFormSubmittion_Repository.First_Or_Default(r => r.ID == item.ID);
                if (registerationFormSubmittion == null)
                {
                    return NotFound("Registration Form Submittion Test not found");
                }
                if (item.SelectedFieldOptionID == 0)
                {
                    item.SelectedFieldOptionID = null;
                }
                mapper.Map(item, registerationFormSubmittion);

                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                registerationFormSubmittion.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    registerationFormSubmittion.UpdatedByOctaId = userId;
                    if (registerationFormSubmittion.UpdatedByUserId != null)
                    {
                        registerationFormSubmittion.UpdatedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    registerationFormSubmittion.UpdatedByUserId = userId;
                    if (registerationFormSubmittion.UpdatedByOctaId != null)
                    {
                        registerationFormSubmittion.UpdatedByOctaId = null;
                    }
                }
                Unit_Of_Work.registerationFormSubmittion_Repository.Update(registerationFormSubmittion);

                if (item.CategoryFieldID ==  1) 
                {
                    student.en_name = item.TextAnswer;
                    registerationFormParent.StudentEnName = item.TextAnswer;
                }
                if (item.CategoryFieldID == 2)
                {
                    student.ar_name = item.TextAnswer;
                    registerationFormParent.StudentArName = item.TextAnswer;
                }
                if (item.CategoryFieldID == 3)
                {
                    student.GenderId = Convert.ToInt64(item?.TextAnswer);
                }
                if (item.CategoryFieldID == 4)
                {
                    student.DateOfBirth = item.TextAnswer;
                }
                if (item.CategoryFieldID == 5)
                {
                    student.Nationality = Convert.ToInt64(item?.TextAnswer);
                }
                if (item.CategoryFieldID == 6)
                {
                    student.Religion = item.TextAnswer;
                }
                if (item.CategoryFieldID == 11)
                {
                    student.NationalID = item.TextAnswer;
                }
                if (item.CategoryFieldID == 13)
                {
                    student.PreviousSchool = item.TextAnswer;
                }
                if (item.CategoryFieldID == 12)
                {
                    student.PassportNo = item.TextAnswer;
                }
                if (item.CategoryFieldID == 22)
                {
                    student.MotherName = item.TextAnswer;
                }
                if (item.CategoryFieldID == 23)
                {
                    student.MotherPassportNo = item.TextAnswer;
                }
                if (item.CategoryFieldID == 24)
                {
                    student.MotherNationalID = item.TextAnswer;
                }
                if (item.CategoryFieldID == 25)
                {
                    student.MotherQualification = item.TextAnswer;
                }
                if (item.CategoryFieldID == 26)
                {
                    student.MotherWorkPlace = item.TextAnswer;
                }
                if (item.CategoryFieldID == 27)
                {
                    student.MotherMobile = item.TextAnswer;
                }
                if (item.CategoryFieldID == 28)
                {
                    student.MotherEmail = item.TextAnswer;
                }

            }

            Unit_Of_Work.student_Repository.Update(student);
            Unit_Of_Work.registerationFormParent_Repository.Update(registerationFormParent);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
