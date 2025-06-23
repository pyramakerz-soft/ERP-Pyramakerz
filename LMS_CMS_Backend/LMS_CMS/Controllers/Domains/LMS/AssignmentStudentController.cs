using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AssignmentStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////////////////////////////////

        [HttpGet("GetByAssignmentIDClassID/{Aid}/{CiD}")]
        [Authorize_Endpoint_(
              allowedTypes: new[] { "octa", "employee" }
              //,
              //pages: new[] { "Assignment" }
          )]
        public async Task<IActionResult> GetByAssignmentIDClassID(long Aid, long CiD, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

            // Get total record count
            int totalRecords = await Unit_Of_Work.assignmentStudent_Repository
                .CountAsync(s => s.IsDeleted != true && s.AssignmentID == Aid && s.StudentClassroom.ClassID == CiD);

            List<AssignmentStudent> assignmentStudents = await Unit_Of_Work.assignmentStudent_Repository.Select_All_With_IncludesById_Pagination<AssignmentStudent>(s => s.AssignmentID == Aid && s.IsDeleted != true && s.StudentClassroom.ClassID == CiD,
                query => query.Include(e => e.StudentClassroom).ThenInclude(t => t.Student),
                query => query.Include(e => e.StudentClassroom.Classroom),
                query => query.Include(e => e.Assignment)
                ).Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (assignmentStudents == null || assignmentStudents.Count == 0)
            {
                return NotFound();
            }

            List<AssignmentStudentGetDTO> DTO = mapper.Map<List<AssignmentStudentGetDTO>>(assignmentStudents);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var item in DTO)
            {
                if (item.AssignmentTypeID == 1)
                {
                    if (!string.IsNullOrEmpty(item.LinkFile))
                    {
                        item.LinkFile = $"{serverUrl}{item.LinkFile.Replace("\\", "/")}";
                    }
                }
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTO, Pagination = paginationMetadata });

        }
        /////////////////////////////////////////////

        [HttpGet("GetByAssignmentId/{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" , "student" }
         //,
         //pages: new[] { "Assignment" }
         )]
        public async Task<IActionResult> GetByAssignmentId(long id)
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

            Assignment assignment = await Unit_Of_Work.assignment_Repository.FindByIncludesAsync(
                 s => s.ID == id && s.IsDeleted != true,

                 query => query.Include(e => e.AssignmentQuestions)
                         .ThenInclude(aq => aq.QuestionBank),

                 query => query.Include(e => e.AssignmentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.QuestionBankOptions),

                 query => query.Include(e => e.AssignmentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.QuestionType),

                 query => query.Include(e => e.AssignmentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.SubBankQuestions) 
             );

            if (assignment == null)
            {
                return NotFound();
            }

            AssignmentGetDTO DTO = mapper.Map<AssignmentGetDTO>(assignment);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            if (DTO.AssignmentTypeID == 1)
            {
                if (!string.IsNullOrEmpty(DTO.LinkFile))
                {
                    DTO.LinkFile = $"{serverUrl}{DTO.LinkFile.Replace("\\", "/")}";
                }
            }

            return Ok(DTO);
        }
        /////////////////////////////////////////////

        [HttpGet("GetById/{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee", "student" }
         //,
         //pages: new[] { "Assignment" }
         )]
        public async Task<IActionResult> GetByID(long id)
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

            AssignmentStudent assignmentStudent = await Unit_Of_Work.assignmentStudent_Repository.FindByIncludesAsync(
                 s => s.ID == id && s.IsDeleted != true,

                 query => query.Include(e => e.Assignment)
                     .ThenInclude(a => a.AssignmentQuestions)
                         .ThenInclude(aq => aq.QuestionBank),

                 query => query.Include(e => e.StudentClassroom)
                     .ThenInclude(sc => sc.Student),

                 query => query.Include(e => e.StudentClassroom)
                     .ThenInclude(sc => sc.Classroom),

                 query => query.Include(e => e.AssignmentStudentQuestions)
                     .ThenInclude(q => q.AssignmentStudentQuestionAnswerOption),

                 query => query.Include(e => e.AssignmentStudentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.QuestionBankOptions),

                 query => query.Include(e => e.AssignmentStudentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.QuestionType),

                 query => query.Include(e => e.AssignmentStudentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.SubBankQuestions) // ✅ This ensures subBankQuestion is populated
             );


            if (assignmentStudent == null)
            {
                return NotFound();
            }

            AssignmentStudentGetDTO DTO = mapper.Map<AssignmentStudentGetDTO>(assignmentStudent);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            if (DTO.AssignmentTypeID == 1)
            {
                if (!string.IsNullOrEmpty(DTO.LinkFile))
                {
                    DTO.LinkFile = $"{serverUrl}{DTO.LinkFile.Replace("\\", "/")}";
                }
            }

            return Ok(DTO);
        }


        /////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" }
          //,
          //pages: new[] { "Book Correction" }
      )]
        public async Task<IActionResult> Add([FromForm] AssignmentStudentAddDTO newData)
        {

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (newData == null)
                return BadRequest("Answers are empty");
            // Get user info
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            if (userIdClaim == null || userTypeClaim == null || !long.TryParse(userIdClaim, out long userId))
                return Unauthorized("Invalid user claims.");

            // Get all valid assignment questions
            var assignmentQuestions = Unit_Of_Work.assignmentQuestion_Repository
                .FindBy(s => s.AssignmentID == newData.AssignmentID && s.Assignment.IsDeleted !=true && s.QuestionBank.IsDeleted != true);

            var validQuestionIds = assignmentQuestions.Select(q => q.QuestionBankID).ToHashSet();

            // Filter only valid student answers
            var validAnswers = newData.AssignmentStudentQuestions
                .Where(a => validQuestionIds.Contains(a.QuestionBankID))
                .ToList();

            // Identify unanswered questions
            var unansweredQuestionIds = validQuestionIds
                .Except(validAnswers.Select(a => a.QuestionBankID))
                .ToList();

            foreach (var item in unansweredQuestionIds)
            {
                var answerOption = new AssignmentStudentQuestionAnswerOptionAddDTO
                {
                    Order = 0,
                    Answer = ""
                };

                var unansweredQuestion = new AssignmentStudentQuestionAddDTO
                {
                    QuestionBankID = item,
                    Answer = "",
                    AssignmentStudentQuestionAnswerOption = new List<AssignmentStudentQuestionAnswerOptionAddDTO> { answerOption }
                };

                newData.AssignmentStudentQuestions.Add(unansweredQuestion); 
            }

            // Map the main entity
            var assignmentStudent = mapper.Map<AssignmentStudent>(newData);


            // Set inserted timestamps and user
            var cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            assignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
                assignmentStudent.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee")
                assignmentStudent.InsertedByUserId = userId;

            Unit_Of_Work.assignmentStudent_Repository.Add(assignmentStudent);
            Unit_Of_Work.SaveChanges();
             

            return Ok();
        }

        /////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> EditAsync(AssignmentStudentEditDTO newData)
        {
            if (newData == null)
                return BadRequest("Data cannot be null.");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userId == 0 || string.IsNullOrEmpty(userTypeClaim))
                return Unauthorized("User ID or type is invalid.");

            var unitOfWork = _dbContextFactory.CreateOneDbContext(HttpContext);

            var assignmentStudent = await unitOfWork.assignmentStudent_Repository.FindByIncludesAsync(
                s => s.ID == newData.ID && s.IsDeleted != true,
                q => q.Include(e => e.Assignment)
                      .ThenInclude(a => a.AssignmentQuestions)
                          .ThenInclude(aq => aq.QuestionBank),
                q => q.Include(e => e.AssignmentStudentQuestions)
                      .ThenInclude(sq => sq.QuestionBank)
            );

            if (assignmentStudent == null)
                return NotFound("Assignment student not found.");

            var assignmentQuestions = assignmentStudent.Assignment.AssignmentQuestions.ToList();

            // Step 1: Save the new marks
            foreach (var questionDto in newData.AssignmentStudentQuestions)
            {
                var studentQuestion = assignmentStudent.AssignmentStudentQuestions
                    .FirstOrDefault(q => q.ID == questionDto.ID);

                if (studentQuestion != null)
                {
                    studentQuestion.Mark = questionDto.Mark;
                }
            }

            // Step 2: Validate and calculate degree
            double totalQuestionMarks = 0;
            double totalStudentMarks = 0;

            foreach (var studentQuestion in assignmentStudent.AssignmentStudentQuestions)
            {
                var questionBank = studentQuestion.QuestionBank;
                if (questionBank == null)
                    return BadRequest($"Question bank not found for student question ID {studentQuestion.ID}");

                double maxMark = questionBank.Mark;

                if (studentQuestion.Mark > maxMark)
                    return BadRequest($"Mark for question ID {studentQuestion.ID} cannot exceed {maxMark}");

                totalQuestionMarks += maxMark;
                totalStudentMarks += studentQuestion.Mark;
            }

            var assignmentDegree = assignmentStudent.Assignment.Mark;
            assignmentStudent.Degree = totalQuestionMarks > 0
                   ? (float)((totalStudentMarks * assignmentDegree) / totalQuestionMarks)
                   : 0;

            /// If He Submit After DueDate 
            if (assignmentStudent.InsertedAt.HasValue && assignmentStudent.InsertedAt.Value > assignmentStudent.Assignment.CutOfDate.ToDateTime(TimeOnly.MinValue))
            {
                double penaltyRatio = assignmentStudent.Assignment.Subject.AssignmentCutOffDatePercentage;

                if (penaltyRatio > 0 && penaltyRatio <= 1)
                {
                    assignmentStudent.Degree -= (float)(assignmentStudent.Degree * penaltyRatio);
                }
            }
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            assignmentStudent.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                assignmentStudent.UpdatedByOctaId = userId;
                if (assignmentStudent.UpdatedByUserId != null)
                {
                    assignmentStudent.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                assignmentStudent.UpdatedByUserId = userId;
                if (assignmentStudent.UpdatedByOctaId != null)
                {
                    assignmentStudent.UpdatedByOctaId = null;
                }
            }
            unitOfWork.assignmentStudent_Repository.Update(assignmentStudent);
            await unitOfWork.SaveChangesAsync();

            return Ok();
        }
    }
}
