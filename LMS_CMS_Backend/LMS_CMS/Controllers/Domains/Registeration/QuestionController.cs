using AutoMapper;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Migrations.Domains;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using static System.Net.Mime.MediaTypeNames;

namespace LMS_CMS_PL.Controllers.Domains.Registeration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class QuestionController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public QuestionController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee"}
         ,
         pages: new[] { "Admission Test" }
         )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Question> questions = await Unit_Of_Work.question_Repository.Select_All_With_IncludesById<Question>(
                    b => b.IsDeleted != true,
                    query => query.Include(emp => emp.QuestionType),
                    query => query.Include(emp => emp.mCQQuestionOption),
                    query => query.Include(emp => emp.test),
                    query => query.Include(emp => emp.MCQQuestionOptions)
                    );

            foreach (var question in questions)
            {
                if (question.MCQQuestionOptions != null)
                {
                    question.MCQQuestionOptions = question.MCQQuestionOptions
                        .Where(opt => opt.IsDeleted != true)
                        .ToList();
                }
            }
            // Manually filter sub-collections
            foreach (var question in questions)
            {
                if (question.MCQQuestionOptions != null)
                {
                    question.MCQQuestionOptions = question.MCQQuestionOptions
                        .Where(opt => opt.IsDeleted != true)
                        .ToList();
                }
            }

            if (questions == null || questions.Count == 0)
            {
                return NotFound();
            }

            List<questionGetDTO> questionDTO = mapper.Map<List<questionGetDTO>>(questions);

            return Ok(questionDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("GetByID/{id}")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" }
         ,
         pages: new[] { "Admission Test" }
         )]
        public async Task<IActionResult> GetByID(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Question questions = await Unit_Of_Work.question_Repository.FindByIncludesAsync(
                    b => b.IsDeleted != true && b.ID == id,
                    query => query.Include(emp => emp.QuestionType),
                    query => query.Include(emp => emp.mCQQuestionOption),
                    query => query.Include(emp => emp.test),
                    query => query.Include(emp => emp.MCQQuestionOptions)
                    );

            // Manually filter sub-collections
            if (questions.MCQQuestionOptions != null)
            {
                questions.MCQQuestionOptions = questions.MCQQuestionOptions
                    .Where(opt => opt.IsDeleted != true)
                    .ToList();
            }

            if (questions == null)
            {
                return NotFound();
            }

            questionGetDTO questionDTO = mapper.Map<questionGetDTO>(questions);

            return Ok(questionDTO);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByTest/{id}")]
        [Authorize_Endpoint_(
       allowedTypes: new[] { "octa", "employee","parent" },
       pages: new[] { "Admission Test" }
       )]
        public async Task<IActionResult> GetAsyncbyId(int id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Question> questions = await Unit_Of_Work.question_Repository.Select_All_With_IncludesById<Question>(
                    b => b.IsDeleted != true &&b.TestID==id,
                    query => query.Include(emp => emp.QuestionType),
                    query => query.Include(emp => emp.mCQQuestionOption),
                    query => query.Include(emp => emp.test),
                    query => query.Include(emp => emp.MCQQuestionOptions)
                    );

            if (questions == null)
            {
                return NotFound();
            }
            // Manually filter sub-collections
            foreach (var question in questions)
            {
                if (question.MCQQuestionOptions != null)
                {
                    question.MCQQuestionOptions = question.MCQQuestionOptions
                        .Where(opt => opt.IsDeleted != true)
                        .ToList();
                }
            }

            List<questionGetDTO> questionDTO = mapper.Map<List<questionGetDTO>>(questions);

            return Ok(questionDTO);
        }
        //////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByTestGroupBy/{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" ,"parent"},
          pages: new[] { "Admission Test" }
      )]
        public async Task<IActionResult> GetAsyncbyTestId(int id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Question> questions = await Unit_Of_Work.question_Repository.Select_All_With_IncludesById<Question>(
                b => b.IsDeleted != true && b.TestID == id,
                query => query.Include(emp => emp.QuestionType)
                              .Include(emp => emp.mCQQuestionOption)
                              .Include(emp => emp.test)
                              .Include(emp => emp.MCQQuestionOptions)
            );
            // Manually filter sub-collections
            foreach (var question in questions)
            {
                if (question.MCQQuestionOptions != null)
                {
                    question.MCQQuestionOptions = question.MCQQuestionOptions
                        .Where(opt => opt.IsDeleted != true)
                        .ToList();
                }
            }

            Test test =Unit_Of_Work.test_Repository.First_Or_Default(t=>t.ID==id);
            if (questions == null || !questions.Any())
            {
                return NotFound();
            }

            // Map questions to DTO
            List<questionGetDTO> questionDTO = mapper.Map<List<questionGetDTO>>(questions);
            foreach (var question in questionDTO)
            {
                List<MCQQuestionOption> MCQQuestionOptions = Unit_Of_Work.mCQQuestionOption_Repository.FindBy(d => d.IsDeleted != true && d.Question_ID == question.ID);
                List<MCQQuestionOptionGetDto> MCQQuestionOptionGetDtos = mapper.Map<List<MCQQuestionOptionGetDto>>(MCQQuestionOptions);
                question.options = MCQQuestionOptionGetDtos;
            }
            // Group by QuestionType
            var groupedByQuestionType = questionDTO
                .GroupBy(q => new { q.QuestionTypeID, q.QuestionTypeName })
                .Select(group => new
                {
                    QuestionTypeID = group.Key.QuestionTypeID,
                    QuestionTypeName = group.Key.QuestionTypeName,
                    Questions = group.ToList() // All questions in this group
                })
                .ToList();

            var response = new
            {
                TestName = test.Title,
                groupedByQuestionType = groupedByQuestionType
            };
            return Ok(response);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Admission Test" }
        )]
        public async Task<IActionResult> Add([FromForm] QuestionAddDTO newQuestion)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newQuestion == null)
            {
                return BadRequest("test cannot be null");
            }
            QuestionType questionType = Unit_Of_Work.questionType_Repository.First_Or_Default(s => s.ID == newQuestion.QuestionTypeID);
            if (questionType == null)
            {
                return BadRequest("this Question Type not exist");
            }
           
            Test test = Unit_Of_Work.test_Repository.First_Or_Default(s => s.ID == newQuestion.TestID && s.IsDeleted != true);
            if (test == null)
            {
                return BadRequest("this Test not exist");
            }

            if (newQuestion.QuestionTypeID != 3)
            {
                if (newQuestion.options.Count == 0)
                {
                    return BadRequest("options in msq question is required");
                }
                if (newQuestion.CorrectAnswerName == "")
                {
                    return BadRequest("CorrectAnswer in msq question is required");
                }


            }
            Question question = mapper.Map<Question>(newQuestion);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            question.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                question.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                question.InsertedByUserId = userId;
            }

            Unit_Of_Work.question_Repository.Add(question);
            Unit_Of_Work.SaveChanges();

            if (newQuestion.QuestionTypeID != 3)
            {
                long correctA = 0;
                foreach (var item in newQuestion.options)
                {
                    MCQQuestionOption mCQQuestionOption=new MCQQuestionOption();
                    mCQQuestionOption.Name = item.Name;
                    mCQQuestionOption.Question_ID=question.ID;
                    mCQQuestionOption.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        mCQQuestionOption.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        mCQQuestionOption.InsertedByUserId = userId;
                    }
                   await Unit_Of_Work.mCQQuestionOption_Repository.AddAsync(mCQQuestionOption);
                   await Unit_Of_Work.SaveChangesAsync();
                    if(newQuestion.CorrectAnswerName == item.Name)
                    {
                       correctA=mCQQuestionOption.ID;
                    }

                }
                if(correctA==0) 
                {
                    return BadRequest("correct answer cannot be null");
                }

                question.CorrectAnswerID=correctA;
                Unit_Of_Work.question_Repository.Update(question);
                await Unit_Of_Work.SaveChangesAsync();
            }

            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Questions");

            if (newQuestion.ImageFile != null || newQuestion.VideoFile != null)
            {
                var questionFolder = Path.Combine(baseFolder, question.ID.ToString());

                if (!Directory.Exists(questionFolder))
                {
                    Directory.CreateDirectory(questionFolder);
                }

                if (newQuestion.ImageFile != null)
                {
                    var imagePath = Path.Combine(questionFolder, newQuestion.ImageFile.FileName);

                    using (var stream = new FileStream(imagePath, FileMode.Create))
                    {
                        newQuestion.ImageFile.CopyTo(stream);
                    }
                    //question.Image = Path.Combine("Uploads", "Questions", question.ID.ToString(), newQuestion.ImageFile.FileName);
                    question.Image = $"{Request.Scheme}://{Request.Host}/Uploads/Questions/{question.ID.ToString()}/{newQuestion.ImageFile.FileName}";
                }

                if (newQuestion.VideoFile != null)
                {
                    var videoPath = Path.Combine(questionFolder, newQuestion.VideoFile.FileName);

                    using (var stream = new FileStream(videoPath, FileMode.Create))
                    {
                        await newQuestion.VideoFile.CopyToAsync(stream);
                    }
                    //question.Video = Path.Combine("Uploads", "Questions", question.ID.ToString(), newQuestion.VideoFile.FileName);
                    question.Video = $"{Request.Scheme}://{Request.Host}/Uploads/Questions/{question.ID.ToString()}/{newQuestion.VideoFile.FileName}";
                }
            }

            Unit_Of_Work.question_Repository.Update(question);
            await Unit_Of_Work.SaveChangesAsync();

            return Ok(newQuestion);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
         allowEdit: 1,
         pages: new[] { "Admission Test" }
       )]
        public async Task<IActionResult> Edit([FromForm] QuestionEditDTO newQuestion)
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

            if (newQuestion == null)
            {
                return BadRequest("Building cannot be null");
            }

            if (newQuestion == null)
            {
                return BadRequest("test cannot be null");
            }
            Question question = Unit_Of_Work.question_Repository.First_Or_Default(q => q.ID == newQuestion.ID && q.IsDeleted != true);
            if (question == null)
            {
                return NotFound("there is no question with this id");
            }
            QuestionType questionType = Unit_Of_Work.questionType_Repository.First_Or_Default(s => s.ID == newQuestion.QuestionTypeID);
            if (questionType == null)
            {
                return BadRequest("this Question Type not exist");
            }

            Test test = Unit_Of_Work.test_Repository.First_Or_Default(s => s.ID == newQuestion.TestID && s.IsDeleted != true);
            if (test == null)
            {
                return BadRequest("this Test not exist");
            }

            if (newQuestion.QuestionTypeID != 3)
            {
                // Step 0: Fetch from DB
                List<MCQQuestionOption> Oldoptions = await Unit_Of_Work.mCQQuestionOption_Repository
                    .Select_All_With_IncludesById<MCQQuestionOption>(
                        b => b.IsDeleted != true && b.Question_ID == newQuestion.ID);

                var newOptions = newQuestion.NewOptions ?? new List<string>();
                var editedOptions = newQuestion.EditedOptions ?? new List<MCQQuestionOptionGetDto>();
                var deletedIds = newQuestion.DeletedOptions ?? new List<long>();

                // Step 1: Remove deleted options from Oldoptions
                var filteredOldOptions = Oldoptions
                    .Where(opt => !deletedIds.Contains(opt.ID))
                    .ToList();

                // Step 2: Apply edited values
                foreach (var edit in editedOptions)
                {
                    var target = filteredOldOptions.FirstOrDefault(o => o.ID == edit.ID);
                    if (target != null && !string.IsNullOrWhiteSpace(edit.Name))
                    {
                        target.Name = edit.Name.Trim();
                    }
                }

                // Step 3: Normalize all options (old + new)
                var normalizedOldOptions = filteredOldOptions
                    .Where(o => !string.IsNullOrWhiteSpace(o.Name))
                    .Select(o => o.Name.Trim())
                    .ToList();

                var normalizedNewOptions = newOptions
                    .Where(o => !string.IsNullOrWhiteSpace(o))
                    .Select(o => o.Trim())
                    .ToList();

                var allFinalOptions = normalizedOldOptions
                    .Concat(normalizedNewOptions)
                    .ToList();

                // Step 4: Ensure at least one option remains
                if (allFinalOptions.Count == 0)
                {
                    return BadRequest("At least one valid option is required.");
                }

                // Step 5: Ensure uniqueness
                if (allFinalOptions.Distinct(StringComparer.OrdinalIgnoreCase).Count() != allFinalOptions.Count)
                {
                    return BadRequest("Duplicate options are not allowed.");
                }

                // Step 6: Validate correct answer
                if (string.IsNullOrWhiteSpace(newQuestion.correctAnswerName))
                {
                    return BadRequest("Correct answer is required.");
                }

                string normalizedCorrect = newQuestion.correctAnswerName.Trim().ToLower();
                bool correctAnswerExists = allFinalOptions
                    .Any(opt => opt.ToLower() == normalizedCorrect);

                if (!correctAnswerExists)
                {
                    return BadRequest("Correct answer must match one of the available options.");
                }
            }
            else
            {
                question.CorrectAnswerID = null;
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Admission Test", roleId, userId, question);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
            if(newQuestion.QuestionTypeID != question.QuestionTypeID)
            {
                 List<MCQQuestionOption> Oldoptions = await Unit_Of_Work.mCQQuestionOption_Repository.Select_All_With_IncludesById<MCQQuestionOption>(
                        b => b.IsDeleted != true && b.Question_ID == newQuestion.ID);

                foreach (var i in Oldoptions)
                {
                    i.IsDeleted = true;
                    Unit_Of_Work.mCQQuestionOption_Repository.Update(i);
                    await Unit_Of_Work.SaveChangesAsync();
                }
            }
            mapper.Map(newQuestion, question);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            question.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                question.UpdatedByOctaId = userId;
                if (question.UpdatedByUserId != null)
                {
                    question.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                question.UpdatedByUserId = userId;
                if (question.UpdatedByOctaId != null)
                {
                    question.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.question_Repository.Update(question);
            await Unit_Of_Work.SaveChangesAsync();

            if (newQuestion.QuestionTypeID != 3) { 

                 long corectId = 0;
                if(newQuestion.NewOptions!=null && newQuestion.NewOptions.Count != 0)
                {
                    foreach (var item in newQuestion.NewOptions)
                    {
                        if (item != null &&item != "")
                        {
                            MCQQuestionOption option = new MCQQuestionOption();
                            option.Question_ID = newQuestion.ID;
                            option.Name = item;
                            option.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            if (userTypeClaim == "octa")
                            {
                                option.InsertedByOctaId = userId;
                            }
                            else if (userTypeClaim == "employee")
                            {
                                option.InsertedByUserId = userId;
                            }
                            await Unit_Of_Work.mCQQuestionOption_Repository.AddAsync(option);
                            await Unit_Of_Work.SaveChangesAsync();
                            if (item == newQuestion.correctAnswerName)
                            {
                                corectId = option.ID;
                            }
                        }
                    }
                }
                if (newQuestion.DeletedOptions!= null && newQuestion.DeletedOptions.Count!= 0)
                {
                    foreach (var item in newQuestion.DeletedOptions)
                    {
                        if (item!=null &&item != 0)
                        {
                            MCQQuestionOption option = new MCQQuestionOption();
                            option= Unit_Of_Work.mCQQuestionOption_Repository.First_Or_Default(s => s.ID == item);
                            option.IsDeleted=true;
                            option.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            if (userTypeClaim == "octa")
                            {
                                option.DeletedByOctaId = userId;
                                if (option.DeletedByUserId != null)
                                {
                                    option.DeletedByUserId = null;
                                }
                            }
                            else if (userTypeClaim == "employee")
                            {
                                option.DeletedByUserId = userId;
                                if (option.DeletedByOctaId != null)
                                {
                                    option.DeletedByOctaId = null;
                                }
                            }
                            Unit_Of_Work.mCQQuestionOption_Repository.Update(option);
                            await Unit_Of_Work.SaveChangesAsync();

                        }
                    }
                }

                if (newQuestion.EditedOptions != null && newQuestion.EditedOptions.Count != 0)
                {
                    foreach (var item in newQuestion.EditedOptions)
                    {
                        if (item != null && item.ID != 0)
                        {
                            MCQQuestionOption option = Unit_Of_Work.mCQQuestionOption_Repository.First_Or_Default(o => o.ID == item.ID);

                            if (option == null)
                                continue; // Skip if not found
                            option.Question_ID = newQuestion.ID;
                            option.Name = item.Name;
                            option.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            if (userTypeClaim == "octa")
                            {
                                option.UpdatedByOctaId = userId;
                            }
                            else if (userTypeClaim == "employee")
                            {
                                option.UpdatedByUserId = userId;
                            }
                            Unit_Of_Work.mCQQuestionOption_Repository.Update(option);
                            await Unit_Of_Work.SaveChangesAsync();
                        }
                    }
                }
                question.CorrectAnswerID = null;
            }
            else
            {
                newQuestion.correctAnswerName = null;
                question.CorrectAnswerID = null;
                question.mCQQuestionOption = null; 
            }

            ////// image
            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Questions");

            if (newQuestion.ImageFile != null || newQuestion.VideoFile != null)
            {
                var questionFolder = Path.Combine(baseFolder, question.ID.ToString());
                if (Directory.Exists(questionFolder))
                {
                    var files = Directory.GetFiles(questionFolder);

                    foreach (var file in files)
                    {
                        System.IO.File.Delete(file);
                    }
                }

                if (!Directory.Exists(questionFolder))
                {
                    Directory.CreateDirectory(questionFolder);
                }

                if (newQuestion.ImageFile != null)
                {
                    var imagePath = Path.Combine(questionFolder, newQuestion.ImageFile.FileName);

                    using (var stream = new FileStream(imagePath, FileMode.Create))
                    {
                        newQuestion.ImageFile.CopyTo(stream);
                    }
                    question.Image = $"{Request.Scheme}://{Request.Host}/Uploads/Questions/{question.ID.ToString()}/{newQuestion.ImageFile.FileName}";
                }

                // Save VideoFile if provided
                if (newQuestion.VideoFile != null)
                {
                    var videoPath = Path.Combine(questionFolder, newQuestion.VideoFile.FileName);

                    using (var stream = new FileStream(videoPath, FileMode.Create))
                    {
                        newQuestion.VideoFile.CopyTo(stream);
                    }
                    question.Video = $"{Request.Scheme}://{Request.Host}/Uploads/Questions/{question.ID.ToString()}/{newQuestion.VideoFile.FileName}";
                }
            }
            if (newQuestion.QuestionTypeID != 3 && newQuestion.correctAnswerName!= null)
            {
                var Correctoptions = Unit_Of_Work.mCQQuestionOption_Repository
                    .First_Or_Default(b => b.IsDeleted != true && b.Question_ID == newQuestion.ID &&b.Name==newQuestion.correctAnswerName);
                if (Correctoptions != null) 
                {
                    question.CorrectAnswerID = Correctoptions.ID;
                }
                else
                {
                    question.CorrectAnswerID = null;
                }

            }

            Unit_Of_Work.question_Repository.Update(question);
            await Unit_Of_Work.SaveChangesAsync();
            return Ok();
        }
        //////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        allowDelete: 1,
       pages: new[] { "Admission Test" }
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

            if (id == 0)
            {
                return BadRequest("Enter Category ID");
            }

            Question question = Unit_Of_Work.question_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);


            if (question == null)
            {
                return NotFound();
            } 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Admission Test", roleId, userId, question);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            question.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            question.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                question.DeletedByOctaId = userId;
                if (question.DeletedByUserId != null)
                {
                    question.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                question.DeletedByUserId = userId;
                if (question.DeletedByOctaId != null)
                {
                    question.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.question_Repository.Update(question);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
