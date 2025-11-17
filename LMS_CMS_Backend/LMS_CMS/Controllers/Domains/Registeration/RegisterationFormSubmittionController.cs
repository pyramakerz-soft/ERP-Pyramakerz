using AutoMapper;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_DAL.Models.Octa;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.S3;
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
        private readonly CreateStudentService _createStudentService;
        private readonly FileValidationService _fileValidationService;
        private readonly FileUploadsService _fileService;

        public RegisterationFormSubmittionController(DbContextFactoryService dbContextFactory, IMapper mapper, UOW unit_Of_Work_Octa, CheckPageAccessService checkPageAccessService , FileValidationService fileValidationService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _Unit_Of_Work_Octa = unit_Of_Work_Octa;
            _fileValidationService = fileValidationService;
            _checkPageAccessService = checkPageAccessService;   
            _fileService = fileService;
        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByRegistrationParentID/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Registration Confirmation", "Student" }
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
                            item.TextAnswer = nationality.Name;
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

        [HttpPut("{StudentId}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowEdit: 1,
          pages: new[] {"Student" }
         )]
        public async Task<IActionResult> EditAsync(long StudentId, [FromForm] List<RegisterationFormSubmittionGetDTO> newData, [FromForm] List<RegisterationFormSubmittionForFiles> filesFieldCat = null)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

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
                switch (item.CategoryFieldID)
                {
                    case 3:
                        if(item.SelectedFieldOptionID == null)
                        {
                          item.TextAnswer = item.TextAnswer.ToString();  // gender when edit it return from front text number and  option = null
                        }
                        else
                        {
                            item.TextAnswer = item.SelectedFieldOptionID.ToString();
                            item.SelectedFieldOptionID = null;
                        }

                        break;

                    case 5:
                        if (item.SelectedFieldOptionID == null)
                        {
                            item.TextAnswer = item.TextAnswer.ToString();  // gender when edit it return from front text number and  option = null
                        }
                        else
                        {
                            item.TextAnswer = item.SelectedFieldOptionID.ToString();
                            item.SelectedFieldOptionID = null;
                        }
                        break;

                    case 7:
                        item.TextAnswer = item.SelectedFieldOptionID.ToString();
                        item.SelectedFieldOptionID = null;

                        break;

                    case 8:
                        item.TextAnswer = item.SelectedFieldOptionID.ToString();
                        item.SelectedFieldOptionID = null;

                        break;

                    case 9:
                        item.TextAnswer = item.SelectedFieldOptionID.ToString();
                        item.SelectedFieldOptionID = null;

                        break;

                    default:
                        break;
                }
            }

            string ParentEmail = newData.FirstOrDefault(s => s.CategoryFieldID == 21)?.TextAnswer ?? string.Empty;

            string MotherEmail = newData.FirstOrDefault(s => s.CategoryFieldID == 28)?.TextAnswer ?? string.Empty;

            string StudentName = newData.FirstOrDefault(s => s.CategoryFieldID == 1)?.TextAnswer ?? string.Empty;

            string StudentArName = newData.FirstOrDefault(s => s.CategoryFieldID == 2)?.TextAnswer ?? string.Empty;

            string Phone = newData.FirstOrDefault(s => s.CategoryFieldID == 20)?.TextAnswer ?? string.Empty;

            string GradeID = newData.FirstOrDefault(s => s.CategoryFieldID == 9)?.TextAnswer ?? string.Empty;

            string SchoolID = newData.FirstOrDefault(s => s.CategoryFieldID == 7)?.TextAnswer ?? string.Empty;

            string AcademicYearID = newData.FirstOrDefault(s => s.CategoryFieldID == 8)?.TextAnswer ?? string.Empty;

            if (ParentEmail != string.Empty)
            {
                try
                {
                    var mailAddress = new System.Net.Mail.MailAddress(ParentEmail);
                    if (mailAddress.Address != ParentEmail)
                    {
                        return BadRequest("Invalid Guardian's email Format");
                    }
                }
                catch
                {
                    return BadRequest("Invalid Guardian's email Format");
                }
            }

            if (MotherEmail != string.Empty)
            {
                try
                {
                    var mailAddress = new System.Net.Mail.MailAddress(MotherEmail);
                    if (mailAddress.Address != MotherEmail)
                    {
                        return BadRequest("Invalid Mother's email Format");
                    }
                }
                catch
                {
                    return BadRequest("Invalid Mother's email Format");
                }
            }
           

            if (GradeID != string.Empty)
            {
                Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(s => s.ID == long.Parse(GradeID) && s.IsDeleted != true);
                if (grade == null)
                {
                    return NotFound("There is no Grade with this ID");
                }
            }

            if (SchoolID != string.Empty)
            {
                School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == long.Parse(SchoolID) && s.IsDeleted != true);
                if (school == null)
                {
                    return NotFound("There is no School with this ID");
                }
            }

            if (AcademicYearID != string.Empty)
            {
                AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(s => s.ID == long.Parse(AcademicYearID) && s.IsDeleted != true);
                if (academicYear == null)
                {
                    return NotFound("There is no Academic Year with this ID");
                }
            }

            long parentID = 0;
            Parent parent = Unit_Of_Work.parent_Repository.First_Or_Default(s => s.Email == ParentEmail && s.IsDeleted != true);
            if (parent != null)
            {
                parentID = parent.ID;
            }


            if (filesFieldCat != null)
            {
                foreach (var file in filesFieldCat)
                {
                    if (file.SelectedFile != null)
                    {
                        string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(file.SelectedFile);
                        if (returnFileInput != null)
                        {
                            return BadRequest(returnFileInput);
                        }
                    }
                }
            }

            registerationFormParent.StudentName = $"{StudentName.Replace(" ", "_")}_{registerationFormParent.ID}";
            registerationFormParent.StudentEnName = StudentName;
            registerationFormParent.StudentArName = StudentArName;
            registerationFormParent.Phone = Phone;
            registerationFormParent.GradeID = GradeID.ToString();
            registerationFormParent.Email = ParentEmail;
            registerationFormParent.AcademicYearID = AcademicYearID.ToString();
            registerationFormParent.RegisterationFormStateID = 1;// Pending
            registerationFormParent.ParentID = parentID != 0 ? parentID : (long?)null;

            if (userTypeClaim == "octa")
            {
                registerationFormParent.UpdatedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                registerationFormParent.UpdatedByUserId = userId;
            }

            Unit_Of_Work.registerationFormParent_Repository.Update(registerationFormParent); 
            Unit_Of_Work.SaveChanges();

            ////////////////////////////////////////////////////////////////
            
            for (int i = 0; i < newData.Count; i++)
            {
                CategoryField categoryField = Unit_Of_Work.categoryField_Repository.First_Or_Default(s => s.ID == newData[i].CategoryFieldID && s.IsDeleted != true);
                if (categoryField == null)
                {
                    return NotFound("There is no Category Field with this ID");
                }

                if (categoryField.IsMandatory)
                {
                    bool isThereAFile = false;
                    if (filesFieldCat != null)
                    {
                        for (int j = 0; j < filesFieldCat.Count; j++)
                        {
                            if (filesFieldCat[j].SelectedFile.Length > 0)
                            {
                                if (filesFieldCat[j].CategoryFieldID == newData[i].CategoryFieldID)
                                {
                                    isThereAFile = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (newData[i].SelectedFieldOptionID == null && newData[i].TextAnswer == null && !isThereAFile)
                    {
                        return BadRequest($"Field {categoryField.EnName} is required");
                    }
                }

                if (newData[i].SelectedFieldOptionID != null)
                {
                    FieldOption fieldOption = Unit_Of_Work.fieldOption_Repository.First_Or_Default(s => s.ID == newData[i].SelectedFieldOptionID && s.IsDeleted != true);
                    if (fieldOption == null)
                    {
                        return NotFound("There is no Field Option with this ID" + newData[i].SelectedFieldOptionID + newData[i].TextAnswer);
                    }
                }
            }

            ////////////////////////////////////////////////////////////////
              
            if (filesFieldCat != null)
            {
                for (int j = 0; j < filesFieldCat.Count; j++)
                {
                    if (filesFieldCat[j].SelectedFile.Length > 0)
                    {
                        var fileLink = await _fileService.UploadFileAsync(filesFieldCat[j].SelectedFile,
                            $"Registration/RegistrationForm/{registerationFormParent.RegistrationFormID.ToString()}/{student.RegistrationFormParentID.ToString()}",
                            filesFieldCat[j].CategoryFieldID, HttpContext);

                        RegisterationFormSubmittion registerationFormSubmittion = Unit_Of_Work.registerationFormSubmittion_Repository.First_Or_Default(
                            s => s.CategoryFieldID == filesFieldCat[j].CategoryFieldID && s.RegisterationFormParentID == student.RegistrationFormParentID);

                        if (registerationFormSubmittion != null)
                        {
                            await _fileService.DeleteFileAsync(
                                registerationFormSubmittion.TextAnswer,
                                $"Registration/RegistrationForm/{registerationFormParent.RegistrationFormID.ToString()}/{student.RegistrationFormParentID.ToString()}",
                                filesFieldCat[j].CategoryFieldID,
                                HttpContext
                            );

                            if (userTypeClaim == "octa")
                            {
                                registerationFormSubmittion.UpdatedByOctaId = userId;
                                registerationFormSubmittion.UpdatedByUserId = null;
                            }
                            else if (userTypeClaim == "employee")
                            {
                                registerationFormSubmittion.UpdatedByUserId = userId;
                                registerationFormSubmittion.UpdatedByOctaId = null;
                            }
                            registerationFormSubmittion.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            registerationFormSubmittion.TextAnswer = fileLink;
                            Unit_Of_Work.registerationFormSubmittion_Repository.Update(registerationFormSubmittion);
                            Unit_Of_Work.SaveChanges();

                        }
                        else
                        {
                            registerationFormSubmittion = new RegisterationFormSubmittion
                            {
                                RegisterationFormParentID = student.RegistrationFormParentID.Value,
                                CategoryFieldID = filesFieldCat[j].CategoryFieldID,
                                SelectedFieldOptionID = null,
                                TextAnswer = fileLink,
                                InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                                IsDeleted = true
                            };
                            if (userTypeClaim == "octa")
                            {
                                registerationFormSubmittion.InsertedByOctaId = userId;
                            }
                            else if (userTypeClaim == "employee")
                            {
                                registerationFormSubmittion.InsertedByUserId = userId;
                            }
                            Unit_Of_Work.registerationFormSubmittion_Repository.Add(registerationFormSubmittion);
                            Unit_Of_Work.SaveChanges();
                        }
                    }
                }
            }

            foreach (var group in newData.GroupBy(x => x.CategoryFieldID))
            {
                CategoryField categoryField = Unit_Of_Work.categoryField_Repository.First_Or_Default(
                    d => d.IsDeleted != true && d.ID == group.Key);
                
                if (categoryField == null)
                    continue;

                if(categoryField.FieldTypeID == 4)
                {
                    List<long> newOptionIds = group
                        .Where(x => x.SelectedFieldOptionID.HasValue)
                        .Select(x => x.SelectedFieldOptionID!.Value)
                        .Distinct()
                        .ToList();
                    
                    List<RegisterationFormSubmittion> existingSubmissions = Unit_Of_Work.registerationFormSubmittion_Repository.FindBy(
                        r => r.RegisterationFormParentID == student.RegistrationFormParentID && r.CategoryFieldID == group.Key)
                        .ToList();

                    List<long> existingOptionIds = existingSubmissions
                    .Where(r => r.SelectedFieldOptionID.HasValue)
                    .Select(r => r.SelectedFieldOptionID!.Value)
                    .ToList();

                    List<long> optionsToAdd = newOptionIds.Except(existingOptionIds).ToList();

                    foreach (var optionId in optionsToAdd)
                    {
                        var newSubmission = new RegisterationFormSubmittion
                        {
                            RegisterationFormParentID = student.RegistrationFormParentID.Value,
                            CategoryFieldID = group.Key,
                            SelectedFieldOptionID = optionId,
                            InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                            IsDeleted = true
                        };

                        if (userTypeClaim == "octa")
                            newSubmission.InsertedByOctaId = userId;
                        else if (userTypeClaim == "employee")
                            newSubmission.InsertedByUserId = userId;

                        Unit_Of_Work.registerationFormSubmittion_Repository.Add(newSubmission);
                    }

                    var optionsToDelete = existingOptionIds.Except(newOptionIds).ToList();

                    foreach (var submission in existingSubmissions.Where(s => s.SelectedFieldOptionID.HasValue && optionsToDelete.Contains(s.SelectedFieldOptionID.Value)))
                    { 
                        Unit_Of_Work.registerationFormSubmittion_Repository.Delete(submission.ID);
                    }

                    continue;
                }
            }

            foreach (var item in newData)
            {
                CategoryField categoryField = Unit_Of_Work.categoryField_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == item.CategoryFieldID);
                if (categoryField.FieldTypeID != 6 && categoryField.FieldTypeID != 4)
                {
                    RegisterationFormSubmittion registerationFormSubmittion = Unit_Of_Work.registerationFormSubmittion_Repository.First_Or_Default(
                        r => r.RegisterationFormParentID == student.RegistrationFormParentID && r.CategoryFieldID == item.CategoryFieldID);
                    if (registerationFormSubmittion == null) // new submission
                    {
                        registerationFormSubmittion = new RegisterationFormSubmittion
                        {
                            RegisterationFormParentID = student.RegistrationFormParentID.Value,
                            CategoryFieldID = item.CategoryFieldID,
                            SelectedFieldOptionID = item.SelectedFieldOptionID != null ? item.SelectedFieldOptionID : (long?)null,
                            TextAnswer = item.TextAnswer != null ? item.TextAnswer : null,
                            InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                            IsDeleted = true
                        };
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
                    else // edit
                    { 
                        registerationFormSubmittion.RegisterationFormParentID = student.RegistrationFormParentID.Value;
                        registerationFormSubmittion.CategoryFieldID = item.CategoryFieldID;
                        registerationFormSubmittion.SelectedFieldOptionID = item.SelectedFieldOptionID != null ? item.SelectedFieldOptionID : (long?)null;
                        registerationFormSubmittion.TextAnswer = item.TextAnswer != null ? item.TextAnswer : null;
                     
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
                    } 
                } 

                //////////////////////////Edit Student//////////////////////////////////////
                 
                if (item.CategoryFieldID == 3)
                {
                    if (!string.IsNullOrWhiteSpace(item.TextAnswer))
                    {
                        if (long.TryParse(item.TextAnswer, out long genderId))
                        {
                            var gender = Unit_Of_Work.gender_Repository.First_Or_Default(g => g.ID == genderId);
                            if (gender == null)
                            {
                                return BadRequest($"Invalid Gender ID: {item.SelectedFieldOptionID} : {item.TextAnswer}");
                            }
                            student.GenderId = genderId;
                        }
                        else
                        {
                            return BadRequest($"Invalid Gender ID format: {item.TextAnswer}");
                        }
                    } 
                }
                if (item.CategoryFieldID == 4)
                {
                    student.DateOfBirth = item.TextAnswer;
                }
                if (item.CategoryFieldID == 5)
                {
                    if (!string.IsNullOrWhiteSpace(item.TextAnswer))
                    {
                        if (long.TryParse(item.TextAnswer, out long nationalityId))
                        {
                            student.Nationality = nationalityId;
                        }
                        else
                        {
                            return BadRequest($"Invalid Nationality ID format: {item.TextAnswer}");
                        }
                    }
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

            student.en_name = StudentName;
            student.ar_name = StudentArName;
            student.User_Name = $"{StudentName.Replace(" ", "_")}_{registerationFormParent.ID}"; 
            student.Parent_Id = parentID != 0 ? parentID : (long?)null;

            Unit_Of_Work.student_Repository.Update(student); 
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
