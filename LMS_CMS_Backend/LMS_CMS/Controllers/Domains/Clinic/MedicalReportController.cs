using AutoMapper;
using LMS_CMS_BL.DTO.Clinic;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ClinicModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Clinic
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicalReportController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;

        public MedicalReportController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
        }

        #region get All Medical History By Parent
        [HttpGet("GetAllMHByParent")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent" },
            pages: new[] { "Medical Report" }
        )]
        public async Task<IActionResult> GetAllMHByParent(long studentId, long schoolId, long gradeId, long classId)
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

            Student? student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentId && s.IsDeleted != true);
            if (student == null)
                return NotFound("Student not found.");

            School? school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == schoolId && s.IsDeleted != true);
            if (school == null)
                return NotFound("School not found.");

            Grade? grade = Unit_Of_Work.grade_Repository.First_Or_Default(g => g.ID == gradeId && g.IsDeleted != true);
            if (grade == null)
                return NotFound("Grade not found.");

            Classroom? classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(c => c.ID == classId && c.IsDeleted != true);
            if (classroom == null)
                return NotFound("Classroom not found.");

            List<MedicalHistory> medicalHistory = await Unit_Of_Work.medicalHistory_Repository
                .Select_All_With_IncludesById<MedicalHistory>(
                t => t.IsDeleted != true && 
                t.StudentId == studentId &&
                t.SchoolId == schoolId &&
                t.GradeId == gradeId &&
                t.ClassRoomID == classId &&
                (t.InsertedByParentID != null && t.InsertedByParentID != 0) &&
                (t.InsertedByUserId == null || t.InsertedByUserId == 0),
                query => query.Include(x => x.Student),
                query => query.Include(x => x.School),
                query => query.Include(x => x.Grade),
                query => query.Include(x => x.Classroom),
                query => query.Include(x => x.InsertedByParent));
            
            if (medicalHistory == null || medicalHistory.Count == 0)
            {
                return NotFound();
            }
            
            List<MedicalHistoryGetByParentDTO> MedicalHistoryDto = _mapper.Map<List<MedicalHistoryGetByParentDTO>>(medicalHistory);

            return Ok(MedicalHistoryDto);
        }
        #endregion

        #region get All Medical History By Doctor
        [HttpGet("GetAllMHByDoctor")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medical Report" }
        )]
        public async Task<IActionResult> GetAllMHByDoctor(long studentId, long schoolId, long gradeId, long classId)
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

            Student? student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentId && s.IsDeleted != true);
            if (student == null)
                return NotFound("Student not found.");

            School? school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == schoolId && s.IsDeleted != true);
            if (school == null)
                return NotFound("School not found.");

            Grade? grade = Unit_Of_Work.grade_Repository.First_Or_Default(g => g.ID == gradeId && g.IsDeleted != true);
            if (grade == null)
                return NotFound("Grade not found.");

            Classroom? classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(c => c.ID == classId && c.IsDeleted != true);
            if (classroom == null)
                return NotFound("Classroom not found.");

            List<MedicalHistory> medicalHistory = await Unit_Of_Work.medicalHistory_Repository
                .Select_All_With_IncludesById<MedicalHistory>(
                t => t.IsDeleted != true && 
                t.StudentId == studentId &&
                t.SchoolId == schoolId &&
                t.GradeId == gradeId &&
                t.ClassRoomID == classId &&
                (t.InsertedByUserId != null && t.InsertedByUserId != 0) &&
                (t.InsertedByParentID == null || t.InsertedByParentID == 0),
                query => query.Include(x => x.Student),
                query => query.Include(x => x.School),
                query => query.Include(x => x.Grade),
                query => query.Include(x => x.Classroom),
                query => query.Include(x => x.InsertedByEmployee));

            if (medicalHistory == null || medicalHistory.Count == 0)
            {
                return NotFound();
            }

            List<MedicalHistoryGetByDoctorDTO> MedicalHistoryDto = _mapper.Map<List<MedicalHistoryGetByDoctorDTO>>(medicalHistory);
            return Ok(MedicalHistoryDto);
        }
        #endregion

        #region get All Hygienes Forms
        [HttpGet("GetAllHygienesForms")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medical Report" }
        )]
        public async Task<IActionResult> GetAllHygienesForms(long studentId, long schoolId, long gradeId, long classId)
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

            Student? student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentId && s.IsDeleted != true);
            if (student == null)
                return NotFound("Student not found.");

            School? school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == schoolId && s.IsDeleted != true);
            if (school == null)
                return NotFound("School not found.");

            Grade? grade = Unit_Of_Work.grade_Repository.First_Or_Default(g => g.ID == gradeId && g.IsDeleted != true);
            if (grade == null)
                return NotFound("Grade not found.");

            Classroom? classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(c => c.ID == classId && c.IsDeleted != true);
            if (classroom == null)
                return NotFound("Classroom not found.");

            List<HygieneForm> hygieneForms = await Unit_Of_Work.hygieneForm_Repository
                .Select_All_With_IncludesById<HygieneForm>(
                    d => d.IsDeleted != true &&
                    d.SchoolId == schoolId &&
                    d.GradeId == gradeId &&
                    d.ClassRoomID == classId,
                    query => query.Include(h => h.Classroom),
                    query => query.Include(h => h.School),
                    query => query.Include(h => h.Grade),
                    query => query.Include(x => x.InsertedByEmployee),
                    query => query.Include(h => h.StudentHygieneTypes).ThenInclude(h => h.HygieneTypes)
                );

            if (hygieneForms == null || hygieneForms.Count == 0)
            {
                return NotFound("No hygiene forms found");
            }
            
            List<HygieneFormGetDTO> hygieneFormsDto = _mapper.Map<List<HygieneFormGetDTO>>(hygieneForms);

            return Ok(hygieneFormsDto);
        }
        #endregion

        #region get All FollowUps
        [HttpGet("GetAllFollowUps")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medical Report" }
        )]
        public async Task<IActionResult> GetAllFollowUps(long studentId, long schoolId, long gradeId, long classId)
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

            Student? student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentId && s.IsDeleted != true);
            if (student == null)
                return NotFound("Student not found.");

            School? school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == schoolId && s.IsDeleted != true);
            if (school == null)
                return NotFound("School not found.");

            Grade? grade = Unit_Of_Work.grade_Repository.First_Or_Default(g => g.ID == gradeId && g.IsDeleted != true);
            if (grade == null)
                return NotFound("Grade not found.");

            Classroom? classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(c => c.ID == classId && c.IsDeleted != true);
            if (classroom == null)
                return NotFound("Classroom not found.");

            List<FollowUp> followUps = await Unit_Of_Work.followUp_Repository
                .Select_All_With_IncludesById<FollowUp>(
                    d => d.IsDeleted != true &&
                    d.StudentId == studentId &&
                    d.SchoolId == schoolId &&
                    d.GradeId == gradeId &&
                    d.ClassroomId == classId,
                    query => query.Include(f => f.FollowUpDrugs)
                        .ThenInclude(x => x.Drug)
                        .Include(f => f.FollowUpDrugs)
                        .ThenInclude(x => x.Dose),
                    query => query.Include(f => f.School),
                    query => query.Include(f => f.Grade),
                    query => query.Include(f => f.Classroom),
                    query => query.Include(f => f.Student),
                    query => query.Include(f => f.Diagnosis),
                    query => query.Include(x => x.InsertedByEmployee)
                );
            
            if (followUps == null || followUps.Count == 0)
            {
                return NotFound();
            }

            List<FollowUpGetDTO> followUpsDto = _mapper.Map<List<FollowUpGetDTO>>(followUps);

            return Ok(followUpsDto);
        }
        #endregion



        /////////////////////    for parent   /////////////////////

        #region get All Medical History By Parent
        [HttpGet("GetAllMHByParentByStudentId/{studentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "parent" },
            pages: new[] { "Medical Report" }
        )]
        public async Task<IActionResult> GetAllMHByParentByStudentId(long studentId)
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

            Student? student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentId && s.IsDeleted != true);
            if (student == null)
                return NotFound("Student not found.");


            List<MedicalHistory> medicalHistory = await Unit_Of_Work.medicalHistory_Repository
                .Select_All_With_IncludesById<MedicalHistory>(
                t => t.IsDeleted != true &&
                t.StudentId == studentId &&
                (t.InsertedByParentID != null && t.InsertedByParentID != 0) &&
                (t.InsertedByUserId == null || t.InsertedByUserId == 0),
                query => query.Include(x => x.Student),
                query => query.Include(x => x.School),
                query => query.Include(x => x.Grade),
                query => query.Include(x => x.Classroom),
                query => query.Include(x => x.InsertedByParent));

            if (medicalHistory == null || medicalHistory.Count == 0)
            {
                return NotFound();
            }

            List<MedicalHistoryGetByParentDTO> MedicalHistoryDto = _mapper.Map<List<MedicalHistoryGetByParentDTO>>(medicalHistory);

            return Ok(MedicalHistoryDto);
        }
        #endregion

        #region get All Medical History By Doctor
        [HttpGet("GetAllMHByDoctorByStudentId/{studentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "parent" },
            pages: new[] { "Medical Report" }
        )]
        public async Task<IActionResult> GetAllMHByDoctorByStudentId(long studentId)
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

            Student? student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentId && s.IsDeleted != true);
            if (student == null)
                return NotFound("Student not found.");

            List<MedicalHistory> medicalHistory = await Unit_Of_Work.medicalHistory_Repository
                .Select_All_With_IncludesById<MedicalHistory>(
                t => t.IsDeleted != true &&
                t.StudentId == studentId &&
                (t.InsertedByUserId != null && t.InsertedByUserId != 0) &&
                (t.InsertedByParentID == null || t.InsertedByParentID == 0),
                query => query.Include(x => x.Student),
                query => query.Include(x => x.School),
                query => query.Include(x => x.Grade),
                query => query.Include(x => x.Classroom),
                query => query.Include(x => x.InsertedByEmployee));

            if (medicalHistory == null || medicalHistory.Count == 0)
            {
                return NotFound();
            }

            List<MedicalHistoryGetByDoctorDTO> MedicalHistoryDto = _mapper.Map<List<MedicalHistoryGetByDoctorDTO>>(medicalHistory);
            return Ok(MedicalHistoryDto);
        }
        #endregion

        #region get All Hygienes Forms
        [HttpGet("GetAllHygienesFormsByStudentId/{studentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "parent" },
            pages: new[] { "Medical Report" }
        )]
        public async Task<IActionResult> GetAllHygienesFormsByStudentId(long studentId)
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

            Student? student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentId && s.IsDeleted != true);
            if (student == null)
                return NotFound("Student not found.");

            List<HygieneForm> hygieneForms = await Unit_Of_Work.hygieneForm_Repository
                .Select_All_With_IncludesById<HygieneForm>(
                    d => d.IsDeleted != true ,
                    query => query.Include(h => h.Classroom),
                    query => query.Include(h => h.School),
                    query => query.Include(h => h.Grade),
                    query => query.Include(x => x.InsertedByEmployee),
                    query => query.Include(h => h.StudentHygieneTypes).ThenInclude(h => h.HygieneTypes)
                );

            if (hygieneForms == null || hygieneForms.Count == 0)
            {
                return NotFound("No hygiene forms found");
            }

            List<HygieneFormGetDTO> hygieneFormsDto = _mapper.Map<List<HygieneFormGetDTO>>(hygieneForms);

            return Ok(hygieneFormsDto);
        }
        #endregion

        #region get All FollowUps
        [HttpGet("GetAllFollowUpsByStudentId/{studentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "parent" },
            pages: new[] { "Medical Report" }
        )]
        public async Task<IActionResult> GetAllFollowUpsByStudentId(long studentId)
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

            Student? student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentId && s.IsDeleted != true);
            if (student == null)
                return NotFound("Student not found.");

            List<FollowUp> followUps = await Unit_Of_Work.followUp_Repository
                .Select_All_With_IncludesById<FollowUp>(
                    d => d.IsDeleted != true &&
                    d.StudentId == studentId ,
                    query => query.Include(f => f.FollowUpDrugs)
                        .ThenInclude(x => x.Drug)
                        .Include(f => f.FollowUpDrugs)
                        .ThenInclude(x => x.Dose),
                    query => query.Include(f => f.School),
                    query => query.Include(f => f.Grade),
                    query => query.Include(f => f.Classroom),
                    query => query.Include(f => f.Student),
                    query => query.Include(f => f.Diagnosis),
                    query => query.Include(x => x.InsertedByEmployee)
                );

            if (followUps == null || followUps.Count == 0)
            {
                return NotFound();
            }

            List<FollowUpGetDTO> followUpsDto = _mapper.Map<List<FollowUpGetDTO>>(followUps);

            return Ok(followUpsDto);
        }
        #endregion
    }
}
