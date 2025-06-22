using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
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

        [HttpGet("GetById/{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" }
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
                              .ThenInclude(sc => sc.AssignmentQuestions),
                query => query.Include(e => e.StudentClassroom)
                              .ThenInclude(sc => sc.Student),
                query => query.Include(e => e.StudentClassroom)
                              .ThenInclude(sc => sc.Classroom),
                query => query.Include(e => e.AssignmentStudentQuestions)
                              .ThenInclude(q => q.AssignmentStudentQuestionAnswerOption) // Include answer options
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

        //[HttpPut]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" }
        //    //,
        //    //allowEdit: 1,
        //    //pages: new[] { "Admission Test" }
        //)]
        //public async Task<IActionResult> EditAsync(AssignmentStudentEditDTO newData)
        //{
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
        //    long.TryParse(userIdClaim, out long userId);
        //    var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
        //    var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        //    long.TryParse(userRoleClaim, out long roleId);

        //    if (userIdClaim == null || userTypeClaim == null)
        //    {
        //        return Unauthorized("User ID, Type claim not found.");
        //    }

        //    if (newData == null)
        //    {
        //        return BadRequest("Building cannot be null");
        //    }

        //    //if (userTypeClaim == "employee")
        //    //{
        //    //    IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Admission Test", roleId, userId, test);
        //    //    if (accessCheck != null)
        //    //    {
        //    //        return accessCheck;
        //    //    }
        //    //}

        //    AssignmentStudent assignmentStudent = await Unit_Of_Work.assignmentStudent_Repository.FindByIncludesAsync(
        //        s => s.ID == newData.ID && s.IsDeleted != true,
        //        query => query.Include(e => e.Assignment)
        //                      .ThenInclude(sc => sc.AssignmentQuestions),
        //        query => query.Include(e => e.StudentClassroom)
        //                      .ThenInclude(sc => sc.Student),
        //        query => query.Include(e => e.StudentClassroom)
        //                      .ThenInclude(sc => sc.Classroom),
        //        query => query.Include(e => e.AssignmentStudentQuestions)
        //                      .ThenInclude(q => q.AssignmentStudentQuestionAnswerOption) // Include answer options
        //    );

        //    //mapper.Map(newData, test);
        //    //TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
        //    //test.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
        //    //if (userTypeClaim == "octa")
        //    //{
        //    //    test.UpdatedByOctaId = userId;
        //    //    if (test.UpdatedByUserId != null)
        //    //    {
        //    //        test.UpdatedByUserId = null;
        //    //    }
        //    //}
        //    //else if (userTypeClaim == "employee")
        //    //{
        //    //    test.UpdatedByUserId = userId;
        //    //    if (test.UpdatedByOctaId != null)
        //    //    {
        //    //        test.UpdatedByOctaId = null;
        //    //    }
        //    //}

        //    //Unit_Of_Work.test_Repository.Update(test);
        //    Unit_Of_Work.SaveChanges();
        //    return Ok();
        //}


    }
}
