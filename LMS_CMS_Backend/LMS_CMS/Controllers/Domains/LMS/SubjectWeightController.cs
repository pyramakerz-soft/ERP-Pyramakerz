using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
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
    public class SubjectWeightController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SubjectWeightController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet("GetBySubjectId/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject", "Assignment" , "Direct Mark" }
        )]
        public async Task<IActionResult> GetAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<SubjectWeightType> subjectWeightTypes = await Unit_Of_Work.subjectWeightType_Repository.Select_All_With_IncludesById<SubjectWeightType>(
                f => f.IsDeleted != true && f.SubjectID == id,
                query => query.Include(d => d.Subject),
                query => query.Include(d => d.WeightType)
                );

            if (subjectWeightTypes == null || subjectWeightTypes.Count == 0)
            {
                return NotFound();
            }

            List<SubjectWeightTypeGetDTO> subjectWeightTypesGetDTO = mapper.Map<List<SubjectWeightTypeGetDTO>>(subjectWeightTypes);

            return Ok(subjectWeightTypesGetDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Subject Weight Type ID");
            }

            SubjectWeightType subjectWeightType = await Unit_Of_Work.subjectWeightType_Repository.FindByIncludesAsync(
                t => t.IsDeleted != true && t.ID == id,
                query => query.Include(d => d.Subject),
                query => query.Include(d => d.WeightType)
                );

            if (subjectWeightType == null)
            {
                return NotFound();
            }

            SubjectWeightTypeGetDTO subjectWeightTypeGetDTO = mapper.Map<SubjectWeightTypeGetDTO>(subjectWeightType);

            return Ok(subjectWeightTypeGetDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> Add(SubjectWeightTypeAddDTO NewSubjectWeightType)
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
            if (NewSubjectWeightType == null)
            {
                return BadRequest("Subject Weight Type can not be null");
            }

            if(NewSubjectWeightType.Weight > 100)
            {
                return BadRequest("Value Can't be more than 100%");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewSubjectWeightType.SubjectID);
            if (subject == null)
            {
                return NotFound("No Subject with this ID");
            }

            WeightType weightType = Unit_Of_Work.weightType_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewSubjectWeightType.WeightTypeID);
            if (weightType == null)
            {
                return NotFound("No Weight Type with this ID");
            }

            SubjectWeightType IfsubjectWeightExist = Unit_Of_Work.subjectWeightType_Repository.First_Or_Default(s=>s.SubjectID == NewSubjectWeightType.SubjectID && s.WeightTypeID == NewSubjectWeightType.WeightTypeID && s.IsDeleted!= true);
            if(IfsubjectWeightExist != null)
            {
                return BadRequest("This Subject Already Have This WeightType");
            }

            List<SubjectWeightType> subjectWeightTypes = Unit_Of_Work.subjectWeightType_Repository.FindBy(
                f => f.IsDeleted != true && f.SubjectID == NewSubjectWeightType.SubjectID);


            if(subjectWeightTypes != null &&  subjectWeightTypes.Count > 0)
            {
                var count = 0.0;

                foreach (var item in subjectWeightTypes)
                {
                    count += item.Weight;
                }

                if(count == 100)
                {
                    return BadRequest("You Have Already total of 100%");
                }

                if(count + NewSubjectWeightType.Weight > 100)
                {
                    return BadRequest("You Exceeded 100%");
                }
            }

            SubjectWeightType subjectWeightType = mapper.Map<SubjectWeightType>(NewSubjectWeightType);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            subjectWeightType.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                subjectWeightType.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                subjectWeightType.InsertedByUserId = userId;
            }

            Unit_Of_Work.subjectWeightType_Repository.Add(subjectWeightType);
            Unit_Of_Work.SaveChanges();
            return Ok(NewSubjectWeightType);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> Edit(SubjectWeightTypePutDTO EditSubjectWeightType)
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

            if (EditSubjectWeightType == null)
            {
                return BadRequest("Subject Weight Type can not be null");
            }

            SubjectWeightType subjectWeightType = Unit_Of_Work.subjectWeightType_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EditSubjectWeightType.ID);
            if (subjectWeightType == null)
            {
                return NotFound("No Subject Weight Type with this ID");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EditSubjectWeightType.SubjectID);
            if (subject == null)
            {
                return NotFound("No Subject with this ID");
            }

            WeightType weightType = Unit_Of_Work.weightType_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EditSubjectWeightType.WeightTypeID);
            if (weightType == null)
            {
                return NotFound("No Weight Type with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Subject", roleId, userId, EditSubjectWeightType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (EditSubjectWeightType.Weight > 100)
            {
                return BadRequest("Value Can't be more than 100%");
            }

            List<SubjectWeightType> subjectWeightTypes = Unit_Of_Work.subjectWeightType_Repository.FindBy(
                f => f.IsDeleted != true && f.SubjectID == EditSubjectWeightType.SubjectID && f.ID != EditSubjectWeightType.ID);

            if (subjectWeightTypes != null && subjectWeightTypes.Count > 0)
            {
                var count = 0.0;

                foreach (var item in subjectWeightTypes)
                {
                    count += item.Weight;
                }

                if (count == 100)
                {
                    return BadRequest("You Have Already total of 100%");
                }

                if (count + EditSubjectWeightType.Weight > 100)
                {
                    return BadRequest("You Exceeded 100%");
                }
            }

            mapper.Map(EditSubjectWeightType, subjectWeightType);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            subjectWeightType.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                subjectWeightType.UpdatedByOctaId = userId;
                if (subjectWeightType.UpdatedByUserId != null)
                {
                    subjectWeightType.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                subjectWeightType.UpdatedByUserId = userId;
                if (subjectWeightType.UpdatedByOctaId != null)
                {
                    subjectWeightType.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.subjectWeightType_Repository.Update(subjectWeightType);
            Unit_Of_Work.SaveChanges();
            return Ok(EditSubjectWeightType);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Subject" }
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

            SubjectWeightType subjectWeightType = Unit_Of_Work.subjectWeightType_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);
            if (subjectWeightType == null)
            {
                return NotFound("No Subject Weight Type with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Subject", roleId, userId, subjectWeightType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            subjectWeightType.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            subjectWeightType.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                subjectWeightType.DeletedByOctaId = userId;
                if (subjectWeightType.DeletedByUserId != null)
                {
                    subjectWeightType.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                subjectWeightType.DeletedByUserId = userId;
                if (subjectWeightType.DeletedByOctaId != null)
                {
                    subjectWeightType.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.subjectWeightType_Repository.Update(subjectWeightType);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
