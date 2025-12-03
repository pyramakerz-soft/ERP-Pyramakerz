using AutoMapper;
using LMS_CMS_BL.DTO.Clinic;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ClinicModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.FileValidations;
using LMS_CMS_PL.Services.S3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Clinic
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicalHistoryController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;
        private readonly FileImageValidationService _fileImageValidationService;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileUploadsService _fileService;

        public MedicalHistoryController(DbContextFactoryService dbContextFactory, IMapper mapper, FileImageValidationService fileImageValidationService, CheckPageAccessService checkPageAccessService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
            _fileImageValidationService = fileImageValidationService;
            _checkPageAccessService = checkPageAccessService;
            _fileService = fileService;
        }

        #region Get By Doctor
        [HttpGet("GetByDoctor")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" , "parent" },
            pages: new[] { "Medical History" }
        )]
        public async Task<IActionResult> GetByDoctor()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            List<MedicalHistory> medicalHistories = await Unit_Of_Work.medicalHistory_Repository.Select_All_With_IncludesById<MedicalHistory>(
                    d => d.IsDeleted != true && 
                    (d.InsertedByUserId != null && d.InsertedByUserId != 0) &&
                    (d.InsertedByParentID == null || d.InsertedByParentID == 0),
                    query => query.Include(h => h.Classroom),
                    query => query.Include(h => h.School),
                    query => query.Include(h => h.Grade),
                    query => query.Include(h => h.Student),
                    query => query.Include(x => x.InsertedByEmployee)
                );

            if (medicalHistories == null || medicalHistories.Count == 0)
            {
                return NotFound();
            }

            List<MedicalHistoryGetByDoctorDTO> medicalHistoryGetDTO = _mapper.Map<List<MedicalHistoryGetByDoctorDTO>>(medicalHistories);
             
            foreach (var medicalHistory in medicalHistoryGetDTO)
            { 
                medicalHistory.FirstReport = _fileService.GetFileUrl(medicalHistory.FirstReport, Request, HttpContext);
                medicalHistory.SecReport = _fileService.GetFileUrl(medicalHistory.SecReport, Request, HttpContext);
            }

            return Ok(medicalHistoryGetDTO);
        }
        #endregion

        #region Get By Parent
        [HttpGet("GetByParent")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent" },
            pages: new[] { "Medical History" }
        )]
        public async Task<IActionResult> GetByParent()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            List<MedicalHistory> medicalHistories = await Unit_Of_Work.medicalHistory_Repository.Select_All_With_IncludesById<MedicalHistory>(
                m => m.IsDeleted != true && 
                (m.InsertedByParentID != null && m.InsertedByParentID != 0) && 
                (m.InsertedByUserId == null || m.InsertedByUserId == 0),
                query => query.Include(x => x.InsertedByParent));

            if (medicalHistories == null || medicalHistories.Count == 0)
            {
                return NotFound();
            }

            List<MedicalHistoryGetByParentDTO> medicalHistoryGetDTO = _mapper.Map<List<MedicalHistoryGetByParentDTO>>(medicalHistories);
             
            foreach (var medicalHistory in medicalHistoryGetDTO)
            {
                medicalHistory.FirstReport = _fileService.GetFileUrl(medicalHistory.FirstReport, Request, HttpContext);
                medicalHistory.SecReport = _fileService.GetFileUrl(medicalHistory.SecReport, Request, HttpContext);
            }

            return Ok(medicalHistoryGetDTO);
        }
        #endregion

        #region Get By ID By Doctor
        [HttpGet("GetByIdByDoctor/id")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" ,"parent"},
            pages: new[] { "Medical History" }
        )]
        public async Task<IActionResult> GetByIdByDoctorAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            MedicalHistory medicalHistory = await Unit_Of_Work.medicalHistory_Repository.FindByIncludesAsync(
                    m => m.IsDeleted != true && 
                    m.Id == id &&
                    (m.InsertedByUserId != null || m.InsertedByUserId != 0), 
                    query => query.Include(m => m.School),
                    query => query.Include(m => m.Grade),
                    query => query.Include(m => m.Classroom),
                    query => query.Include(m => m.Student),
                    query => query.Include(x => x.InsertedByEmployee)
            );

            if (medicalHistory == null || medicalHistory.IsDeleted == true)
            {
                return NotFound("No Medical History With this ID");
            }

            MedicalHistoryGetByDoctorDTO medicalHistoryGetDTO = _mapper.Map<MedicalHistoryGetByDoctorDTO>(medicalHistory);
             
            medicalHistoryGetDTO.FirstReport = _fileService.GetFileUrl(medicalHistory.FirstReport, Request, HttpContext);
            medicalHistoryGetDTO.SecReport = _fileService.GetFileUrl(medicalHistory.SecReport, Request, HttpContext); 

            return Ok(medicalHistoryGetDTO);
        }
        #endregion

        #region Get By ID By Parent
        [HttpGet("GetByIdByParent/id")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent" },
            pages: new[] { "Medical History" }
        )]
        public async Task<IActionResult> GetByIdByParentAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            MedicalHistory medicalHistory = await Unit_Of_Work.medicalHistory_Repository.FindByIncludesAsync(
                x => x.Id == id &&
                x.IsDeleted != true &&
                (x.InsertedByParentID != null || x.InsertedByParentID != 0),
                query => query.Include(m => m.School),
                query => query.Include(m => m.Grade),
                query => query.Include(m => m.Classroom),
                query => query.Include(m => m.Student),
                query => query.Include(x => x.InsertedByParent)
            );

            if (medicalHistory == null)
            {
                return NotFound("No Medical History With this ID");
            }

            MedicalHistoryGetByParentDTO dto = _mapper.Map<MedicalHistoryGetByParentDTO>(medicalHistory);
             
            dto.FirstReport = _fileService.GetFileUrl(medicalHistory.FirstReport, Request, HttpContext);
            dto.SecReport = _fileService.GetFileUrl(medicalHistory.SecReport, Request, HttpContext);

            return Ok(dto);
        }
        #endregion

        #region Add By Doctor
        [HttpPost("AddByDoctor")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medical History" }
        )]
        public async Task<IActionResult> AddByDoctorAsync([FromForm] MedicalHistoryAddByDoctorDTO historyAddDTO)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (historyAddDTO == null)
            {
                return BadRequest("Medical History cannot be null");
            }

            School school = await Unit_Of_Work.school_Repository.Select_By_IdAsync(historyAddDTO.SchoolId);

            if (school == null || school.IsDeleted == true)
            {
                return NotFound("No School With this ID");
            }

            Grade grade = await Unit_Of_Work.grade_Repository.Select_By_IdAsync(historyAddDTO.GradeId);

            if (grade == null || grade.IsDeleted == true)
            {
                return NotFound("No Grade With this ID");
            }

            Classroom classroom = await Unit_Of_Work.classroom_Repository.Select_By_IdAsync(historyAddDTO.ClassRoomID);

            if (classroom == null || classroom.IsDeleted == true)
            {
                return NotFound("No Classroom With this ID");
            }

            Student student = await Unit_Of_Work.student_Repository.Select_By_IdAsync(historyAddDTO.StudentId);

            if (student == null || student.IsDeleted == true)
            {
                return NotFound("No Student With this ID");
            }

            if (historyAddDTO.FirstReport != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(historyAddDTO.FirstReport);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }
            if (historyAddDTO.SecReport != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(historyAddDTO.SecReport);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            MedicalHistory medicalHistory = _mapper.Map<MedicalHistory>(historyAddDTO);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medicalHistory.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                medicalHistory.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                medicalHistory.InsertedByUserId = userId;
            }

            Unit_Of_Work.medicalHistory_Repository.Add(medicalHistory);

            Unit_Of_Work.SaveChanges();

            if (historyAddDTO.FirstReport != null)
            {
                medicalHistory.FirstReport = await _fileService.UploadFileAsync(historyAddDTO.FirstReport, "Clinic/MedicalHistories/FirstReport", medicalHistory.Id, HttpContext);
                medicalHistory.Attached += 1;
            }
            if (historyAddDTO.SecReport != null)
            {
                medicalHistory.SecReport = await _fileService.UploadFileAsync(historyAddDTO.SecReport, "Clinic/MedicalHistories/SecondReport", medicalHistory.Id, HttpContext);
                medicalHistory.Attached += 1;
            }

            Unit_Of_Work.medicalHistory_Repository.Update(medicalHistory);
            Unit_Of_Work.SaveChanges();
             
            return Ok(historyAddDTO);
        }
        #endregion

        #region Add By Parent
        [HttpPost("AddByParent")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent" },
            pages: new[] { "Medical History" }
        )]
        public async Task<IActionResult> AddByParentAsync([FromForm] MedicalHistoryAddByParentDTO historyAddDTO)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (historyAddDTO == null)
            {
                return BadRequest("Medical History cannot be null");
            }

            Student student = await Unit_Of_Work.student_Repository.FindByIncludesAsync(
                x => x.ID == historyAddDTO.StudentId && 
                x.IsDeleted != true, 
                query => query.Include(x => x.StartAcademicYear));

            if (student == null)
            {
                return NotFound("No Student Found");
            }

            StudentGrade grade = Unit_Of_Work.studentGrade_Repository.First_Or_Default(
                x => x.StudentID == historyAddDTO.StudentId && 
                x.IsDeleted != true);

            if (grade == null)
            {
                return NotFound("No Grade Found");
            }

            School school = await Unit_Of_Work.school_Repository.Select_By_IdAsync(student.StartAcademicYear.SchoolID);

            if (school == null || school.IsDeleted == true)
            {
                return NotFound("No School found");
            }

            StudentClassroom classroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(
                x => x.StudentID == historyAddDTO.StudentId && 
                x.IsDeleted != true);

            if (classroom == null)
            {
                return NotFound("No Classroom found");
            }

            if (historyAddDTO.FirstReport != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(historyAddDTO.FirstReport);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }
            if (historyAddDTO.SecReport != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(historyAddDTO.SecReport);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            MedicalHistory medicalHistory = _mapper.Map<MedicalHistory>(historyAddDTO);
             
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medicalHistory.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if ( userTypeClaim == "parent")
            {
                medicalHistory.InsertedByParentID = userId;
            }

            medicalHistory.SchoolId = school.ID;
            medicalHistory.GradeId = grade.GradeID;
            medicalHistory.ClassRoomID = classroom.ClassID;

            Unit_Of_Work.medicalHistory_Repository.Add(medicalHistory);
            Unit_Of_Work.SaveChanges();

            if (historyAddDTO.FirstReport != null)
            {
                medicalHistory.FirstReport = await _fileService.UploadFileAsync(historyAddDTO.FirstReport, "Clinic/MedicalHistories/FirstReport", medicalHistory.Id, HttpContext);
                medicalHistory.Attached += 1;
            }
            if (historyAddDTO.SecReport != null)
            {
                medicalHistory.SecReport = await _fileService.UploadFileAsync(historyAddDTO.SecReport, "Clinic/MedicalHistories/SecondReport", medicalHistory.Id, HttpContext);
                medicalHistory.Attached += 1;
            }

            Unit_Of_Work.medicalHistory_Repository.Update(medicalHistory);
            Unit_Of_Work.SaveChanges();

            return Ok(historyAddDTO);
        }
        #endregion

        #region Update By Doctor
        [HttpPut("UpdateByDoctorAsync")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medical History" }
        )]
        public async Task<IActionResult> UpdateByDoctorAsync([FromForm] MedicalHistoryPutByDoctorDTO historyPutDTO)
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

            if (historyPutDTO == null)
            {
                return BadRequest("Medical History cannot be null");
            }

            MedicalHistory medicalHistory = await Unit_Of_Work.medicalHistory_Repository.Select_By_IdAsync(historyPutDTO.Id);

            if (medicalHistory == null || medicalHistory.IsDeleted == true)
            {
                return NotFound("No Medical History with this ID");
            }

            School school = await Unit_Of_Work.school_Repository.Select_By_IdAsync(historyPutDTO.SchoolId);

            if (school == null || school.IsDeleted == true)
            {
                return NotFound("No School with this ID");
            }

            Grade grade = await Unit_Of_Work.grade_Repository.Select_By_IdAsync(historyPutDTO.GradeId);

            if (grade == null || grade.IsDeleted == true)
            {
                return NotFound("No Grade with this ID");
            }

            Classroom classroom = await Unit_Of_Work.classroom_Repository.Select_By_IdAsync(historyPutDTO.ClassRoomID);

            if (classroom == null || classroom.IsDeleted == true)
            {
                return NotFound("No Classroom with this ID");
            }

            Student student = await Unit_Of_Work.student_Repository.Select_By_IdAsync(historyPutDTO.StudentId);

            if (student == null || student.IsDeleted == true)
            {
                return NotFound("No Student with this ID");
            }

            if (historyPutDTO.FirstReportFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(historyPutDTO.FirstReportFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }
            if (historyPutDTO.FirstReportFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(historyPutDTO.FirstReportFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            string firstReportExists = medicalHistory.FirstReport;
            string secondReportExists = medicalHistory.SecReport; 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Medical History", roleId, userId, medicalHistory);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (historyPutDTO.FirstReportFile != null)
            {
                historyPutDTO.FirstReport = await _fileService.ReplaceFileAsync(
                    historyPutDTO.FirstReportFile,
                    firstReportExists,
                    "Clinic/MedicalHistories/FirstReport",
                    medicalHistory.Id,
                    HttpContext
                );
            }
            else
            {
                historyPutDTO.FirstReport = firstReportExists;
            }

            if (historyPutDTO.SecReportFile != null)
            {
                historyPutDTO.SecReport = await _fileService.ReplaceFileAsync(
                    historyPutDTO.SecReportFile,
                    secondReportExists,
                    "Clinic/MedicalHistories/SecondReport",
                    medicalHistory.Id,
                    HttpContext
                );
            }
            else
            {
                historyPutDTO.SecReport = secondReportExists;
            }
             
            _mapper.Map(historyPutDTO, medicalHistory);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medicalHistory.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                medicalHistory.UpdatedByOctaId = userId;
                if (medicalHistory.UpdatedByUserId != null)
                {
                    medicalHistory.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                medicalHistory.UpdatedByUserId = userId;
                if (medicalHistory.UpdatedByOctaId != null)
                {
                    medicalHistory.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.medicalHistory_Repository.Update(medicalHistory);
            Unit_Of_Work.SaveChanges();

            return Ok(historyPutDTO);
        }
        #endregion

        #region Update By Parent
        [HttpPut("UpdateByParentAsync")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent" },
            pages: new[] { "Medical History" }
        )]
        public async Task<IActionResult> UpdateByParentAsync([FromForm] MedicalHistoryPutByParentDTO historyPutDTO)
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

            if (historyPutDTO == null)
            {
                return BadRequest("Medical History cannot be null");
            }

            MedicalHistory medicalHistory = await Unit_Of_Work.medicalHistory_Repository.Select_By_IdAsync(historyPutDTO.Id);

            if (medicalHistory == null || medicalHistory.IsDeleted == true)
            {
                return NotFound("No Medical History with this ID");
            }

            string firstReportExists = medicalHistory.FirstReport;
            string secondReportExists = medicalHistory.SecReport; 

            if (userTypeClaim == "parent")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Medical History", roleId, userId, medicalHistory);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (historyPutDTO.FirstReportFile != null)
            {
                historyPutDTO.FirstReport = await _fileService.ReplaceFileAsync(
                    historyPutDTO.FirstReportFile,
                    firstReportExists,
                    "Clinic/MedicalHistories/FirstReport",
                    medicalHistory.Id,
                    HttpContext
                );
            }
            else
            {
                historyPutDTO.FirstReport = firstReportExists;
            }

            if (historyPutDTO.SecReportFile != null)
            {
                historyPutDTO.SecReport = await _fileService.ReplaceFileAsync(
                    historyPutDTO.SecReportFile,
                    secondReportExists,
                    "Clinic/MedicalHistories/SecondReport",
                    medicalHistory.Id,
                    HttpContext
                );
            }
            else
            {
                historyPutDTO.SecReport = secondReportExists;
            }
             
            _mapper.Map(historyPutDTO, medicalHistory);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medicalHistory.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            
            if (userTypeClaim == "parent")
            {
                medicalHistory.UpdatedByParentID = userId;
            }

            Unit_Of_Work.medicalHistory_Repository.Update(medicalHistory);
            Unit_Of_Work.SaveChanges();

            return Ok(historyPutDTO);
        }
        #endregion

        #region Delete
        [HttpDelete("id")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent" },
            pages: new[] { "Medical History" }
        )]
        public IActionResult DeleteAsync(long id)
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

            MedicalHistory medicalHistory = Unit_Of_Work.medicalHistory_Repository.First_Or_Default(m => m.IsDeleted != true && m.Id == id);
            if (medicalHistory == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Medical History", roleId, userId, medicalHistory);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
            else if (userTypeClaim == "parent")
            {

                if (medicalHistory.InsertedByParentID != userId)
                {
                    return Forbid("You can only delete medical history records that you created.");
                }
            }


            medicalHistory.IsDeleted = true;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medicalHistory.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                medicalHistory.DeletedByOctaId = userId;
                if (medicalHistory.DeletedByUserId != null)
                {
                    medicalHistory.DeletedByUserId = null;
                }
                if (medicalHistory.DeletedByParentID != null)
                {
                    medicalHistory.DeletedByParentID = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                medicalHistory.DeletedByUserId = userId;
                if (medicalHistory.DeletedByOctaId != null)
                {
                    medicalHistory.DeletedByOctaId = null;
                }
                if (medicalHistory.DeletedByParentID != null)
                {
                    medicalHistory.DeletedByParentID = null;
                }
            }
            else if (userTypeClaim == "parent")
            {
                medicalHistory.DeletedByParentID = userId;
                if (medicalHistory.DeletedByOctaId != null)
                {
                    medicalHistory.DeletedByOctaId = null;
                }
                if (medicalHistory.DeletedByUserId != null)
                {
                    medicalHistory.DeletedByUserId = null;
                }
            }

            Unit_Of_Work.medicalHistory_Repository.Update(medicalHistory);
            Unit_Of_Work.SaveChanges();

            return Ok("Medical History Deleted Successfully");
        }
        #endregion
    }
}
