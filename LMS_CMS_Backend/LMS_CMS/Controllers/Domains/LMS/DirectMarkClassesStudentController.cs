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
    public class DirectMarkClassesStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public DirectMarkClassesStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////
        
        [HttpGet("GetByDirectMarkId/{DirectMarkId}/{ClassId}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Semester" }
        )]
        public async Task<IActionResult> GetAsync(long DirectMarkId, long ClassId, [FromQuery] int pageNumber = 1,[FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            DirectMark directMark =await Unit_Of_Work.directMark_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == DirectMarkId,
                    query => query.Include(d => d.Subject),
                    query => query.Include(d => d.Subject.Grade));

            if (directMark == null)
            {
                return NotFound();
            }

            // Count total records for pagination metadata
            int totalRecords = await Unit_Of_Work.directMarkClassesStudent_Repository
                .CountAsync(sem => sem.IsDeleted != true && sem.DirectMarkID == DirectMarkId && sem.StudentClassroom.ClassID== ClassId);

            if (totalRecords == 0)
                return NotFound();

            // Fetch paginated records with includes
            List<DirectMarkClassesStudent> DirectMarkClassesStudents = await Unit_Of_Work.directMarkClassesStudent_Repository
                .Select_All_With_IncludesById_Pagination<DirectMarkClassesStudent>(
                    sem => sem.IsDeleted != true && sem.DirectMarkID == DirectMarkId && sem.StudentClassroom.ClassID == ClassId,
                    query => query.Include(emp => emp.StudentClassroom)
                                  .ThenInclude(a => a.Student),
                    query => query.Include(emp => emp.DirectMark)
                )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (DirectMarkClassesStudents == null || DirectMarkClassesStudents.Count == 0)
                return NotFound();

            // Map to DTO
            List<DirectMarkClassesStudentGetDTO> DTO = mapper.Map<List<DirectMarkClassesStudentGetDTO>>(DirectMarkClassesStudents);
            DirectMarkGetDTO DirectMarkDTO = mapper.Map<DirectMarkGetDTO>(directMark);

            // Build pagination metadata
            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new
            {
                Data = DTO,
                DirectMark = DirectMarkDTO,
                Pagination = paginationMetadata
            });
        }

        /////////////////


        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Academic Years" }
        )]
        public IActionResult Edit(DirectMarkClassesStudentEditDTO NewDirectMarkClassesStudent)
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

            DirectMarkClassesStudent directMarkClassesStudent = Unit_Of_Work.directMarkClassesStudent_Repository.First_Or_Default(s => s.ID == NewDirectMarkClassesStudent.ID);
            if(directMarkClassesStudent == null)
            {
                return NotFound("No DirectMarkClassesStudent with this ID");
            }
            directMarkClassesStudent.Degree= NewDirectMarkClassesStudent.Degree;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            directMarkClassesStudent.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                directMarkClassesStudent.UpdatedByOctaId = userId;
                if (directMarkClassesStudent.UpdatedByUserId != null)
                {
                    directMarkClassesStudent.UpdatedByUserId = null;
                }

            }
            else if (userTypeClaim == "employee")
            {
                directMarkClassesStudent.UpdatedByUserId = userId;
                if (directMarkClassesStudent.UpdatedByOctaId != null)
                {
                    directMarkClassesStudent.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.directMarkClassesStudent_Repository.Update(directMarkClassesStudent);
            Unit_Of_Work.SaveChanges();

            return Ok(NewDirectMarkClassesStudent);

        }
    }
}
