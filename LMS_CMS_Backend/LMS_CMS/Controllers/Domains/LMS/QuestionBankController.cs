using AutoMapper;
using AutoMapper.Internal;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Migrations.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Linq;
using System.Linq.Expressions;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class QuestionBankController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public QuestionBankController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Question Bank" }
        )]
        public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
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
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            // Get total record count
            int totalRecords = await Unit_Of_Work.questionBank_Repository
                .CountAsync(f => f.IsDeleted != true);

            List<LMS_CMS_DAL.Models.Domains.LMS.QuestionBank> Questions;


            Questions =await Unit_Of_Work.questionBank_Repository.Select_All_With_IncludesById_Pagination<LMS_CMS_DAL.Models.Domains.LMS.QuestionBank>(
                    f => f.IsDeleted != true,
                    query => query.Include(emp => emp.BloomLevel),
                    query => query.Include(emp => emp.DokLevel),
                    query => query.Include(emp => emp.QuestionType),
                    query => query.Include(emp => emp.QuestionBankOption),
                    query => query.Include(emp => emp.Lesson.Subject),
                    query => query.Include(emp => emp.Lesson))
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

            if (Questions == null || Questions.Count == 0)
            {
                return NotFound();
            }

            List<QuestionBankGetDTO> Dto = mapper.Map<List<QuestionBankGetDTO>>(Questions);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };
            return Ok(new { Data = Dto, Pagination = paginationMetadata });

        }

        ///////////////////////////////////////////////////////////////////////////////////

        [HttpPost("GetByLessonTagType/{LessonId}/{TypeID}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             pages: new[] { "Question Bank" }
         )]
        public async Task<IActionResult> GetByTypes([FromBody] List<long> TagsId,long LessonId, long TypeID, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            // 1. Validate User Claims
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var unitOfWork = _dbContextFactory.CreateOneDbContext(HttpContext);

            // 2. Get related QuestionBank IDs from Tag IDs
            var questionTags = unitOfWork.questionBankTags_Repository.FindBy(
                s => TagsId.Contains(s.TagID) &&
                     s.QuestionBank.IsDeleted != true &&
                     s.Tag.IsDeleted != true);

            var questionBankIds = questionTags.Select(s => s.QuestionBankID).Distinct().ToList();

            // Early return if no matching question banks
            if (questionBankIds.Count == 0)
                return Ok(new { Data = new List<QuestionBankGetDTO>(), Pagination = new { TotalRecords = 0, PageSize = pageSize, CurrentPage = pageNumber, TotalPages = 0 } });

            // 3. Reusable filter
            Expression<Func<LMS_CMS_DAL.Models.Domains.LMS.QuestionBank, bool>> filter = f =>
                f.IsDeleted != true &&
                f.QuestionTypeID == TypeID &&
                f.LessonID == LessonId &&
                questionBankIds.Contains(f.ID);

            // 4. Count total records
            int totalRecords = await unitOfWork.questionBank_Repository.CountAsync(filter);

            // 5. Get paginated and included data
            var questions = await unitOfWork.questionBank_Repository
                .Select_All_With_IncludesById_Pagination<LMS_CMS_DAL.Models.Domains.LMS.QuestionBank>(
                    filter,
                    q => q.Include(e => e.BloomLevel)
                          .Include(e => e.DokLevel)
                          .Include(e => e.QuestionType)
                          .Include(e => e.QuestionBankOption)
                          .Include(e => e.Lesson.Subject)
                          .Include(e => e.Lesson))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (questions == null || !questions.Any())
                return Ok(new { Data = new List<QuestionBankGetDTO>(), Pagination = new { TotalRecords = 0, PageSize = pageSize, CurrentPage = pageNumber, TotalPages = 0 } });

            var dto = mapper.Map<List<QuestionBankGetDTO>>(questions);

            var pagination = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = dto, Pagination = pagination });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////


        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Question Bank" }
        )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            LMS_CMS_DAL.Models.Domains.LMS.QuestionBank Question;

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Question = await Unit_Of_Work.questionBank_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true&&f.ID==id,
                    query => query.Include(emp => emp.BloomLevel),
                    query => query.Include(emp => emp.DokLevel),
                    query => query.Include(emp => emp.QuestionType),
                    query => query.Include(emp => emp.QuestionBankOption),
                    query => query.Include(emp => emp.Lesson.Subject),
                    query => query.Include(emp => emp.Lesson)
                    );
            QuestionBankGetDTO Dto = mapper.Map<QuestionBankGetDTO>(Question);


            if (Question == null )
            {
                return NotFound();
            }

            List<QuestionBankTags> questionBankTags = Unit_Of_Work.questionBankTags_Repository.FindBy(s => s.QuestionBankID == id && s.IsDeleted !=true);
            Dto.QuestionBankTagsDTO = questionBankTags?.Select(s => s.TagID).ToList();

            if (Question.QuestionTypeID==2|| Question.QuestionTypeID == 3 || Question.QuestionTypeID == 5)
            {
                List<QuestionBankOption> options = Unit_Of_Work.questionBankOption_Repository.FindBy(s => s.QuestionBankID == id && s.IsDeleted != true);
                Dto.QuestionBankOptionsDTO = mapper.Map<List<QuestionBankOptionAddDTO>>(options);
            }

            if (Question.QuestionTypeID == 4)
            {
                List<SubBankQuestion> subBankQuestions = Unit_Of_Work.subBankQuestion_Repository.FindBy(s => s.QuestionBankID == id&& s.IsDeleted !=true);
                Dto.SubBankQuestionsDTO = mapper.Map<List<SubBankQuestionAddDTO>>(subBankQuestions);
            }

            return Ok(Dto);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Question Bank" }
        )]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Add([FromForm] LMS_CMS_BL.DTO.LMS.QuestionBankAddDTO NewData)

        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            //////////////////////////////////////////////////// Validation ////////////////////////////////////////////////
            
            if(NewData.DifficultyLevel>6 || NewData.DifficultyLevel < 0)
            {
                return BadRequest("DifficultyLevel Should be from 1 to 6");
            }

            if (NewData.LessonID != null)
            {
                Lesson lesson =Unit_Of_Work.lesson_Repository.First_Or_Default(l=>l.ID== NewData.LessonID);
                if (lesson == null) 
                { 
                  return BadRequest("this Lesson doesn`t exist");
                }
            }
            else
            {
                return BadRequest("this Lesson doesn`t exist");
            }

            if (NewData.BloomLevelID != null && NewData.BloomLevelID != 0)
            {
                BloomLevel bloomLevel = Unit_Of_Work.bloomLevel_Repository.First_Or_Default(l => l.ID == NewData.BloomLevelID);
                if (bloomLevel == null)
                {
                    return BadRequest("this bloomLevel doesn`t exist");
                }
            }
            else
            {
                NewData.BloomLevelID = null;
            }

            if (NewData.DokLevelID != null && NewData.DokLevelID != 0)
            {
                DokLevel dokLevel = Unit_Of_Work.dokLevel_Repository.First_Or_Default(l => l.ID == NewData.DokLevelID);
                if (dokLevel == null)
                {
                    return BadRequest("this dokLevel doesn`t exist");
                }
            }
            else
            {
                NewData.DokLevelID = null;
            }

            if (NewData.QuestionTypeID != null)
            {
                LMS_CMS_DAL.Models.Domains.LMS.QuestionBankType questionBankType = Unit_Of_Work.questionBankType_Repository.First_Or_Default(l => l.ID == NewData.QuestionTypeID);
                if (questionBankType == null)
                {
                    return BadRequest("this questionBankType doesn`t exist");
                }
            }
            else
            {
                return BadRequest("this questionBankType doesn`t exist");
            }

            if (NewData.QuestionBankTagsDTO != null && NewData.QuestionBankTagsDTO.Count > 0)
            {
                foreach (var tagId in NewData.QuestionBankTagsDTO)
                {
                    if (tagId != 0)
                    {
                        var tag = Unit_Of_Work.tag_Repository.First_Or_Default(l => l.ID == tagId);
                        if (tag == null)
                        {
                            return BadRequest($"Tag with ID {tagId} does not exist.");
                        }
                    }
                }
            }
            ////////// Validation For True False Question 

            if (NewData.QuestionTypeID == 1)
            {
                if (NewData.CorrectAnswerName != "True" && NewData.CorrectAnswerName != "False")
                {
                    return BadRequest("Correct Answer should be true or false");
                }
            }

            ////////// Validation For Mcq Question 

            if (NewData.QuestionTypeID == 2)
            {
                if (string.IsNullOrWhiteSpace(NewData.CorrectAnswerName))
                {
                    return BadRequest("Correct answer is required.");
                }

                if (NewData.QuestionBankOptionsDTO == null || NewData.QuestionBankOptionsDTO.Count == 0)
                {
                    return BadRequest("At least one option is required.");
                }

                // Check for null or empty options first
                bool anyEmptyOption = NewData.QuestionBankOptionsDTO.Any(o =>
                    string.IsNullOrWhiteSpace(o.Option));

                if (anyEmptyOption)
                {
                    return BadRequest("All options must have non-empty values.");
                }

                // Normalize all options
                var normalizedOptions = NewData.QuestionBankOptionsDTO
                    .Select(o => o.Option?.Trim().ToLower())
                    .Where(opt => !string.IsNullOrWhiteSpace(opt))
                    .ToList();

                // Check for duplicate options
                bool hasDuplicateOptions = normalizedOptions.Count != normalizedOptions.Distinct().Count();
                if (hasDuplicateOptions)
                {
                    return BadRequest("All options must be unique.");
                }

                // Check if correct answer exists among options
                string normalizedCorrectAnswer = NewData.CorrectAnswerName.Trim().ToLower();
                bool correctAnswerExists = normalizedOptions.Contains(normalizedCorrectAnswer);
                if (!correctAnswerExists)
                {
                    return BadRequest("Correct answer must match one of the provided options.");
                }
            }

            ////////// Validation For Fill in blank and Order - Sequencing Question 

            if (NewData.QuestionTypeID == 3 || NewData.QuestionTypeID == 5)
            {
                if (NewData.QuestionBankOptionsDTO == null || NewData.QuestionBankOptionsDTO.Count == 0)
                {
                    return BadRequest("At least one option is required.");
                }

                // Check for null or empty options first
                bool anyEmptyOption = NewData.QuestionBankOptionsDTO.Any(o =>
                    string.IsNullOrWhiteSpace(o.Option));

                if (anyEmptyOption)
                {
                    return BadRequest("All options must have non-empty values.");
                }

                // Normalize options
                var normalizedOptions = NewData.QuestionBankOptionsDTO
                    .Select(o => o.Option.Trim().ToLower())
                    .ToList();

                if (NewData.QuestionTypeID == 5)
                {
                    bool hasDuplicateOptions = normalizedOptions.Count != normalizedOptions.Distinct().Count();
                    if (hasDuplicateOptions)
                    {
                        return BadRequest("All options must be unique.");
                    }
                    var orders = NewData.QuestionBankOptionsDTO
                        .Select(o => o.Order)
                        .ToList();

                    // Check for null order
                    bool hasNullOrder = orders.Any(o => o == null);
                    if (hasNullOrder)
                    {
                        return BadRequest("All options must have a non-null order value.");
                    }

                    // Check for duplicate order values
                    bool hasDuplicateOrders = orders.Count != orders.Distinct().Count();
                    if (hasDuplicateOrders)
                    {
                        return BadRequest("All order values must be unique.");
                    }
                }
            }

            ////////// Validation For Drag & Drop Question 

            if (NewData.QuestionTypeID == 4)
            {
                if (NewData.SubBankQuestionsDTO == null || NewData.SubBankQuestionsDTO.Count == 0)
                {
                    return BadRequest("Sub-questions are required.");
                }

                // Check for null or empty description/answer
                bool anyEmpty = NewData.SubBankQuestionsDTO.Any(s =>
                    string.IsNullOrWhiteSpace(s.Description) || string.IsNullOrWhiteSpace(s.Answer));

                if (anyEmpty)
                {
                    return BadRequest("All sub-questions must have both a description and an answer.");
                }

                // Check uniqueness based on description
                var normalizedPairs = NewData.SubBankQuestionsDTO
                    .Select(s => $"{s.Description.Trim().ToLower()}")
                    .ToList();

                bool hasDuplicates = normalizedPairs.Count != normalizedPairs.Distinct().Count();
                if (hasDuplicates)
                {
                    return BadRequest("All sub-questions must be unique description.");
                }
            }
            //////////////////////////////////////////////////// Create ////////////////////////////////////////////////

            //////////  Create For True False and Essay Question

            LMS_CMS_DAL.Models.Domains.LMS.QuestionBank questionBank = mapper.Map<LMS_CMS_DAL.Models.Domains.LMS.QuestionBank>(NewData);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            questionBank.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                questionBank.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                questionBank.InsertedByUserId = userId;
            }

            Unit_Of_Work.questionBank_Repository.Add(questionBank);
            Unit_Of_Work.SaveChanges();

            //////////  Create For Tags

            if (NewData.QuestionBankTagsDTO != null && NewData.QuestionBankTagsDTO.Count > 0)
            {
                List<QuestionBankTags> questionBankTags = new List<QuestionBankTags>();
                foreach (int tagId in NewData.QuestionBankTagsDTO)
                {
                    if (tagId != 0)
                    {
                        QuestionBankTags tagObject = new QuestionBankTags
                        {
                            QuestionBankID = questionBank.ID,
                            TagID = tagId,
                            InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                            InsertedByOctaId = userTypeClaim == "octa" ? userId : (int?)null,
                            InsertedByUserId = userTypeClaim == "employee" ? userId : (int?)null
                        };
                        questionBankTags.Add(tagObject);
                    }
                }
                if (questionBankTags.Any())
                {
                    Unit_Of_Work.questionBankTags_Repository.AddRange(questionBankTags);
                    Unit_Of_Work.SaveChanges();
                }
            }

            //////////  Create For Mcq ,Order - Sequencing ,Fill in blank Question

            if (NewData.QuestionBankOptionsDTO != null && NewData.QuestionBankOptionsDTO.Count != 0 && (NewData.QuestionTypeID == 2 || NewData.QuestionTypeID == 3 || NewData.QuestionTypeID == 5))
            {
                List<QuestionBankOption> options = new List<QuestionBankOption>();
                long correctOption = 0;
                foreach (var item in NewData.QuestionBankOptionsDTO)
                {
                    QuestionBankOption option = new QuestionBankOption
                    {
                        QuestionBankID = questionBank.ID,
                        Order = item.Order,
                        Option = item.Option,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : (int?)null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : (int?)null
                    };
                    options.Add(option);
                }
                Unit_Of_Work.questionBankOption_Repository.AddRange(options);
                Unit_Of_Work.SaveChanges();
                var correctOptionEntity = Unit_Of_Work.questionBankOption_Repository
                    .First_Or_Default(o => o.QuestionBankID == questionBank.ID && o.Option == NewData.CorrectAnswerName);
                if (correctOptionEntity != null)
                {
                    questionBank.CorrectAnswerID = correctOptionEntity.ID;
                    Unit_Of_Work.questionBank_Repository.Update(questionBank);
                    Unit_Of_Work.SaveChanges();
                }

            }

            //////////  Create For Drag & Drop Question

            if (NewData.SubBankQuestionsDTO.Count != 0 && NewData.QuestionTypeID==4)
            {
                List<SubBankQuestion> subQuestions = new List<SubBankQuestion>();

                foreach (SubBankQuestionAddDTO item in NewData.SubBankQuestionsDTO)
                {
                    SubBankQuestion subQuestion = new SubBankQuestion
                    {
                        QuestionBankID = questionBank.ID,
                        Description = item.Description,
                        Answer = item.Answer,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : (int?)null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : (int?)null
                    };
                    subQuestions.Add(subQuestion);
                }
                Unit_Of_Work.subBankQuestion_Repository.AddRange(subQuestions);
                Unit_Of_Work.SaveChanges();
            }

            ///////////// image Create


            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/QuestonBank");
            var medalFolder = Path.Combine(baseFolder, questionBank.ID.ToString());
            if (!Directory.Exists(medalFolder))
            {
                Directory.CreateDirectory(medalFolder);
            }

            if (NewData.ImageForm != null && NewData.ImageForm.Length > 0)
            {
                var fileName = Path.GetFileName(NewData.ImageForm.FileName);
                var filePath = Path.Combine(medalFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await NewData.ImageForm.CopyToAsync(stream);
                }
                //medal.ImageLink = Path.Combine("Uploads", "Medal", medal.ID.ToString(), fileName);
                questionBank.Image = $"{Request.Scheme}://{Request.Host}/Uploads/QuestonBank/{questionBank.ID.ToString()}/{fileName}";

            }

            Unit_Of_Work.questionBank_Repository.Update(questionBank);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Question Bank" }
        )]
        public async Task<IActionResult> Edit([FromForm] QuestionBankEditDTO NewData)
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

            if (NewData == null)
            {
                return BadRequest("Medal cannot be null");
            }

            LMS_CMS_DAL.Models.Domains.LMS.QuestionBank questionBank = Unit_Of_Work.questionBank_Repository.First_Or_Default(q => q.ID == NewData.ID && q.IsDeleted!=true);
            if (questionBank == null)
                return NotFound("Question bank not found.");

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Question Bank", roleId, userId, questionBank);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
            //////////////////////////////////////////////////// Validation ////////////////////////////////////////////////

            if (NewData.DifficultyLevel != 0)
            {
                if (NewData.DifficultyLevel > 6 || NewData.DifficultyLevel < 1)
                {
                    return BadRequest("DifficultyLevel Should be from 0 to 6");
                }

            }
            if (NewData.LessonID != null)
            {
                Lesson lesson = Unit_Of_Work.lesson_Repository.First_Or_Default(l => l.ID == NewData.LessonID);
                if (lesson == null)
                {
                    return BadRequest("this Lesson doesn`t exist");
                }
            }
            else
            {
                return BadRequest("this Lesson doesn`t exist");
            }

            if (NewData.BloomLevelID != null && NewData.BloomLevelID != 0)
            {
                BloomLevel bloomLevel = Unit_Of_Work.bloomLevel_Repository.First_Or_Default(l => l.ID == NewData.BloomLevelID);
                if (bloomLevel == null)
                {
                    return BadRequest("this bloomLevel doesn`t exist");
                }
            }
            else
            {
                NewData.BloomLevelID = null;
            }

            if (NewData.DokLevelID != null && NewData.DokLevelID != 0)
            {
                DokLevel dokLevel = Unit_Of_Work.dokLevel_Repository.First_Or_Default(l => l.ID == NewData.DokLevelID);
                if (dokLevel == null)
                {
                    return BadRequest("this dokLevel doesn`t exist");
                }
            }
            else
            {
                NewData.DokLevelID = null;
            }

            if (NewData.QuestionTypeID != null)
            {
                LMS_CMS_DAL.Models.Domains.LMS.QuestionBankType questionBankType = Unit_Of_Work.questionBankType_Repository.First_Or_Default(l => l.ID == NewData.QuestionTypeID);
                if (questionBankType == null)
                {
                    return BadRequest("this questionBankType doesn`t exist");
                }
            }
            else
            {
                return BadRequest("this questionBankType doesn`t exist");
            }

            if (NewData.NewQuestionBankTagsDTO != null && NewData.NewQuestionBankTagsDTO.Count > 0)
            {
                foreach (var tagId in NewData.NewQuestionBankTagsDTO)
                {
                    if (tagId != 0)
                    {
                        var tag = Unit_Of_Work.tag_Repository.First_Or_Default(l => l.ID == tagId);
                        if (tag == null)
                        {
                            return BadRequest($"Tag with ID {tagId} does not exist.");
                        }
                    }
                }
            }
            ////////// Validation For True False Question 

            if (NewData.QuestionTypeID == 1)
            {
                if (NewData.CorrectAnswerName != "True" && NewData.CorrectAnswerName != "Fales")
                {
                    return BadRequest("Correct Answer should be True or Fales");
                }
            }

            ////////// Validation For Mcq Question 

            if (NewData.QuestionTypeID == 2)
            {
                if (string.IsNullOrWhiteSpace(NewData.CorrectAnswerName))
                {
                    return BadRequest("Correct Answer is required.");
                }

            }

            ////////// Validation That all options is not the same 

            if (NewData.QuestionTypeID == 2 || NewData.QuestionTypeID == 3 || NewData.QuestionTypeID == 5)
            {
                List<QuestionBankOption> existedOptions = Unit_Of_Work.questionBankOption_Repository
                    .FindBy(s => s.QuestionBankID == NewData.ID && s.IsDeleted != true);

                if (existedOptions != null && NewData.DeletedQuestionBankOptionsDTO != null)
                {
                    existedOptions = existedOptions
                        .Where(s => !NewData.DeletedQuestionBankOptionsDTO.Contains(s.ID))
                        .ToList();
                }

                // Apply edits to existing options
                foreach (var edited in NewData.EditedQuestionBankOptionsDTO ?? new List<QuestionBankOptionAddDTO>())
                {
                    var match = existedOptions.FirstOrDefault(o => o.ID == edited.ID);
                    if (match != null)
                    {
                        match.Option = edited.Option;
                        match.Order = edited.Order;
                    }
                }

                // Combine all options (edited + new)
                var allOptions = existedOptions
                    .Select(o => o.Option?.Trim().ToLower())
                    .Concat((NewData.NewQuestionBankOptionsDTO ?? new List<QuestionBankOptionAddDTO>())
                        .Select(n => n.Option?.Trim().ToLower()))
                    .ToList();


                // Unique order validation for type 5
                if (NewData.QuestionTypeID == 5)
                {
                    bool hasDuplicates = allOptions.Count != allOptions.Distinct().Count();
                    if (hasDuplicates)
                    {
                        return BadRequest("All options must be unique.");
                    }
                    var allOrders = existedOptions
                        .Select(o => o.Order)
                        .Concat(NewData.NewQuestionBankOptionsDTO.Select(n => n.Order))
                        .Where(o => o.HasValue)
                        .Select(o => o.Value)
                        .ToList();

                    bool hasDuplicateOrders = allOrders.Count != allOrders.Distinct().Count();
                    if (hasDuplicateOrders)
                    {
                        return BadRequest("All order values must be unique.");
                    }
                }

                // Correct answer must exist in final option list for type 2
                if (NewData.QuestionTypeID == 2)
                {
                    string? correctAnswerNormalized = NewData.CorrectAnswerName?.Trim().ToLower();
                    bool correctAnswerExists = allOptions.Any(opt =>
                        opt == correctAnswerNormalized);

                    if (!correctAnswerExists)
                    {
                        return BadRequest("Correct answer must match one of the available options.");
                    }
                }
            }

            ////////// Validation That all Sub Questions is not the same 

            if (NewData.QuestionTypeID == 4)
            {
                // 1. Get existing (not deleted) sub-questions
                List<SubBankQuestion> existedSubBankQuestion = Unit_Of_Work.subBankQuestion_Repository
                    .FindBy(s => s.QuestionBankID == NewData.ID && s.IsDeleted != true);

                if (existedSubBankQuestion != null && NewData.DeletedSubBankQuestionsDTO != null)
                {
                    existedSubBankQuestion = existedSubBankQuestion
                        .Where(s => !NewData.DeletedSubBankQuestionsDTO.Contains(s.ID))
                        .ToList();
                }

                // 2. Apply edits to existing sub-questions
                foreach (var edited in NewData.EditedSubBankQuestionsDTO ?? new List<SubBankQuestionAddDTO>())
                {
                    var match = existedSubBankQuestion.FirstOrDefault(q => q.ID == edited.ID);
                    if (match != null)
                    {
                        match.Description = edited.Description;
                        match.Answer = edited.Answer;
                    }
                }

                // 3. Combine all sub-questions: edited + new
                var allSubQuestions = existedSubBankQuestion
                    .Select(q => new { q.Description, q.Answer })
                    .Concat(NewData.NewSubBankQuestionsDTO.Select(n => new { n.Description, n.Answer }))
                    .ToList();

                // 4. Check for empty description/answer
                bool anyEmpty = allSubQuestions.Any(s =>
                    string.IsNullOrWhiteSpace(s.Description) || string.IsNullOrWhiteSpace(s.Answer));

                if (anyEmpty)
                {
                    return BadRequest("All sub-questions must have both a description and an answer.");
                }

                // 5. Check for duplicates
                var distinctPairs = allSubQuestions
                    .Select(s => $"{s.Description.Trim().ToLower()}|{s.Answer.Trim().ToLower()}")
                    .Distinct()
                    .ToList();

                if (distinctPairs.Count != allSubQuestions.Count)
                {
                    return BadRequest("Sub-questions must be unique (no duplicate description-answer pairs).");
                }
            }

            ////////////////////////////////////////////////////////////// Edit 
            var IsTypeChanged = false;
            if (NewData.QuestionTypeID != questionBank.QuestionTypeID)
            {
                 IsTypeChanged = true;
            }

            mapper.Map(NewData, questionBank);

            if (NewData.ImageForm != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/QuestonBank", NewData.ID.ToString());
                if (!Directory.Exists(baseFolder)) Directory.CreateDirectory(baseFolder);

                var fileName = Path.GetFileName(NewData.ImageForm.FileName);
                var filePath = Path.Combine(baseFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await NewData.ImageForm.CopyToAsync(stream);

                questionBank.Image = $"{Request.Scheme}://{Request.Host}/Uploads/QuestonBank/{NewData.ID.ToString()}/{fileName}";
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            questionBank.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                questionBank.UpdatedByOctaId = userId;
                if (questionBank.UpdatedByUserId != null)
                {
                    questionBank.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                questionBank.UpdatedByUserId = userId;
                if (questionBank.UpdatedByOctaId != null)
                {
                    questionBank.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.questionBank_Repository.Update(questionBank);
            Unit_Of_Work.SaveChanges();

            ///////////////////////////// Delete Data 

            // tags
            if (NewData.DeletedQuestionBankTagsDTO != null && NewData.DeletedQuestionBankTagsDTO.Count > 0)
            {
                // Get all matching QuestionBankTags entries
                List<QuestionBankTags> questionBankTags = Unit_Of_Work.questionBankTags_Repository
                    .FindBy(s => NewData.DeletedQuestionBankTagsDTO.Contains(s.TagID))
                    .ToList();

                // Delete them
                foreach (var tag in questionBankTags)
                {
                    Unit_Of_Work.questionBankTags_Repository.Delete(tag.ID);
                }

                Unit_Of_Work.SaveChanges();
            }

            // Option 
            if (NewData.DeletedQuestionBankOptionsDTO != null && NewData.DeletedQuestionBankOptionsDTO.Count > 0)
            {
                var optionsToDelete = Unit_Of_Work.questionBankOption_Repository
                    .FindBy(s => NewData.DeletedQuestionBankOptionsDTO.Contains(s.ID))
                    .ToList();

                foreach (var option in optionsToDelete)
                {
                    option.IsDeleted = true;
                    Unit_Of_Work.questionBankOption_Repository.Update(option);
                }

                Unit_Of_Work.SaveChanges();
            }

            // SubQuestion 
            if (NewData.DeletedSubBankQuestionsDTO != null && NewData.DeletedSubBankQuestionsDTO.Count > 0)
            {
                var optionsToDelete = Unit_Of_Work.subBankQuestion_Repository
                    .FindBy(s => NewData.DeletedSubBankQuestionsDTO.Contains(s.ID))
                    .ToList();

                foreach (var option in optionsToDelete)
                {
                    option.IsDeleted = true;
                    Unit_Of_Work.subBankQuestion_Repository.Update(option);
                }

                Unit_Of_Work.SaveChanges();
            }

            // if user changed Type
            if (IsTypeChanged == true)
            {
                // Step 1: Mark options as deleted instead of removing them
                var options = Unit_Of_Work.questionBankOption_Repository
                    .FindBy(o => o.QuestionBankID == NewData.ID)
                    .ToList();

                foreach (var option in options)
                {
                    option.IsDeleted = true;
                    Unit_Of_Work.questionBankOption_Repository.Update(option);
                }

                // Step 2: Mark sub-questions as deleted instead of removing them
                var subQuestions = Unit_Of_Work.subBankQuestion_Repository
                    .FindBy(sbq => sbq.QuestionBankID == NewData.ID)
                    .ToList();

                foreach (var subQuestion in subQuestions)
                {
                    subQuestion.IsDeleted = true;
                    Unit_Of_Work.subBankQuestion_Repository.Update(subQuestion);
                }

                Unit_Of_Work.SaveChanges();
            }

            /////////////////////////////////////////////////////////////////////////  ReCreate 

            //////////  Create For Tags

            if (NewData.NewQuestionBankTagsDTO != null && NewData.NewQuestionBankTagsDTO.Count > 0)
            {
                List<QuestionBankTags> questionBankTags = new List<QuestionBankTags>();
                foreach (int tagId in NewData.NewQuestionBankTagsDTO)
                {
                    if (tagId != 0)
                    {
                        QuestionBankTags tagObject = new QuestionBankTags
                        {
                            QuestionBankID = questionBank.ID,
                            TagID = tagId,
                            InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                            InsertedByOctaId = userTypeClaim == "octa" ? userId : (int?)null,
                            InsertedByUserId = userTypeClaim == "employee" ? userId : (int?)null
                        };
                        questionBankTags.Add(tagObject);
                    }
                }
                if (questionBankTags.Any())
                {
                    Unit_Of_Work.questionBankTags_Repository.AddRange(questionBankTags);
                    Unit_Of_Work.SaveChanges();
                }
            }

            //////////  Create For Mcq ,Order - Sequencing ,Fill in blank Question

            if (NewData.NewQuestionBankOptionsDTO != null && NewData.NewQuestionBankOptionsDTO.Count != 0 && (NewData.QuestionTypeID == 2 || NewData.QuestionTypeID == 3 || NewData.QuestionTypeID == 5))
            {
                List<QuestionBankOption> options = new List<QuestionBankOption>();
                long correctOption = 0;
                foreach (var item in NewData.NewQuestionBankOptionsDTO)
                {
                    QuestionBankOption option = new QuestionBankOption
                    {
                        QuestionBankID = questionBank.ID,
                        Order = item.Order,
                        Option = item.Option,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : (int?)null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : (int?)null
                    };
                    options.Add(option);
                }
                Unit_Of_Work.questionBankOption_Repository.AddRange(options);
                Unit_Of_Work.SaveChanges();
               

            }

            //////////  Create For Drag & Drop Question

            if (NewData.NewSubBankQuestionsDTO.Count != 0 && NewData.QuestionTypeID == 4)
            {
                List<SubBankQuestion> newsubQuestions = new List<SubBankQuestion>();

                foreach (SubBankQuestionAddDTO item in NewData.NewSubBankQuestionsDTO)
                {
                    SubBankQuestion subQuestion = new SubBankQuestion
                    {
                        QuestionBankID = questionBank.ID,
                        Description = item.Description,
                        Answer = item.Answer,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : (int?)null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : (int?)null
                    };
                    newsubQuestions.Add(subQuestion);
                }
                Unit_Of_Work.subBankQuestion_Repository.AddRange(newsubQuestions);
                Unit_Of_Work.SaveChanges();
            }

            /////////////////////////////////////////////////////////////////////////  Edit
            // Options
            if (NewData.EditedQuestionBankOptionsDTO != null && NewData.EditedQuestionBankOptionsDTO.Count != 0 && (NewData.QuestionTypeID == 2 || NewData.QuestionTypeID == 3 || NewData.QuestionTypeID == 5))
            {
                foreach (var item in NewData.EditedQuestionBankOptionsDTO ?? new List<QuestionBankOptionAddDTO>())
                {
                    if (item.ID != null && item.ID != 0)
                    {
                        var existingOption = Unit_Of_Work.questionBankOption_Repository.First_Or_Default(o => o.ID == item.ID);
                        if (existingOption != null)
                        {
                            existingOption.Option = item.Option;
                            existingOption.Order = item.Order;
                            existingOption.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            existingOption.InsertedByOctaId = userTypeClaim == "octa" ? userId : (int?)null;
                            existingOption.InsertedByUserId = userTypeClaim == "employee" ? userId : (int?)null;

                            Unit_Of_Work.questionBankOption_Repository.Update(existingOption);
                        }
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            if (NewData.QuestionTypeID == 2)
            {
                var correctOptionEntity = Unit_Of_Work.questionBankOption_Repository
                       .First_Or_Default(o => o.QuestionBankID == questionBank.ID && o.Option == NewData.CorrectAnswerName && questionBank.IsDeleted != true);
                if (correctOptionEntity != null)
                {
                    questionBank.CorrectAnswerID = correctOptionEntity.ID;
                    Unit_Of_Work.questionBank_Repository.Update(questionBank);
                    Unit_Of_Work.SaveChanges();
                }
                else
                {
                    return BadRequest("Correct Answer is required.");
                }
            }

            // SubQuestions
            if (NewData.EditedSubBankQuestionsDTO != null && NewData.EditedSubBankQuestionsDTO.Count != 0 && (NewData.QuestionTypeID == 4))
            {
                foreach (var item in NewData.EditedSubBankQuestionsDTO)
                {
                    if (item.ID != null && item.ID != 0)
                    {
                        var existing = Unit_Of_Work.subBankQuestion_Repository.First_Or_Default(q => q.ID == item.ID);
                        if (existing != null)
                        {
                            existing.Description = item.Description;
                            existing.Answer = item.Answer;
                            existing.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            existing.InsertedByOctaId = userTypeClaim == "octa" ? userId : (int?)null;
                            existing.InsertedByUserId = userTypeClaim == "employee" ? userId : (int?)null;

                            Unit_Of_Work.subBankQuestion_Repository.Update(existing);
                        }
                    }
                }
                Unit_Of_Work.SaveChanges();
            }

            return Ok(NewData);
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Question Bank" }
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
            LMS_CMS_DAL.Models.Domains.LMS.QuestionBank questionBank = Unit_Of_Work.questionBank_Repository.Select_By_Id(id);

            if (questionBank == null || questionBank.IsDeleted == true)
            {
                return NotFound("No Question Bank with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Question Bank", roleId, userId, questionBank);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            questionBank.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            questionBank.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                questionBank.DeletedByOctaId = userId;
                if (questionBank.DeletedByUserId != null)
                {
                    questionBank.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                questionBank.DeletedByUserId = userId;
                if (questionBank.DeletedByOctaId != null)
                {
                    questionBank.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.questionBank_Repository.Update(questionBank);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
