using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.Archiving;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Archiving;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace LMS_CMS_PL.Controllers.Domains.Archiving
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ArchivingTreeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileValidationService _fileValidationService;

        public ArchivingTreeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        private List<ArchivingTreeGetDTO> BuildHierarchy(List<ArchivingTree> archivingTrees, long? parentId = null)
        {
            string serverUrl = $"{Request.Scheme}://{Request.Host}/"; 

            return archivingTrees
                .Where(ac => ac.ArchivingTreeParentID == parentId)
                .Select(ac => new ArchivingTreeGetDTO
                {
                    ID = ac.ID,
                    Name = ac.Name,
                    FileLink = !string.IsNullOrEmpty(ac.FileLink) ? $"{serverUrl}{ac.FileLink.Replace("\\", "/")}" : "",
                    ArchivingTreeParentID = ac.ArchivingTreeParentID,
                    InsertedByUserId = ac.InsertedByUserId ?? 0, 
                    Children = BuildHierarchy(archivingTrees, ac.ID)
                }).ToList();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Archiving" }
        )]
        public async Task<IActionResult> GetAll()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<ArchivingTree> archivingTrees = await Unit_Of_Work.archivingTree_Repository.Select_All_With_IncludesById<ArchivingTree>(
                    f => f.IsDeleted != true,
                    query => query.Include(ac => ac.ArchivingTreeParent)
                    );

            if (archivingTrees == null || archivingTrees.Count == 0)
            {
                return NotFound();
            }

            List<ArchivingTreeGetDTO> archivingTreesDTO = BuildHierarchy(archivingTrees);

            return Ok(archivingTreesDTO);
        }

        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Archiving" }
        )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Account Tree Chart ID");
            }

            ArchivingTree archivingTree = await Unit_Of_Work.archivingTree_Repository.FindByIncludesAsync(
                    acc => acc.IsDeleted != true && acc.ID == id,
                    query => query.Include(ac => ac.ArchivingTreeParent)
                    );

            if (archivingTree == null)
            {
                return NotFound();
            }

            List<ArchivingTree> FirstChildrenForArchivingTrees = Unit_Of_Work.archivingTree_Repository.FindBy(
                    acc => acc.IsDeleted != true && acc.ArchivingTreeParentID == id);

            ArchivingTreeGetDTO accountingTreeChartGetDTO = mapper.Map<ArchivingTreeGetDTO>(archivingTree); 
             
            if(FirstChildrenForArchivingTrees != null && FirstChildrenForArchivingTrees.Count != 0)
            {
                List<ArchivingTreeGetDTO> FirstChildrenForArchivingTreesDTO = mapper.Map<List<ArchivingTreeGetDTO>>(FirstChildrenForArchivingTrees);
                accountingTreeChartGetDTO.Children = FirstChildrenForArchivingTreesDTO;
            }

            if(accountingTreeChartGetDTO.FileLink != null)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                accountingTreeChartGetDTO.FileLink = $"{serverUrl}{accountingTreeChartGetDTO.FileLink.Replace("\\", "/")}";
            }

            return Ok(accountingTreeChartGetDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Archiving" }
        )]
        public async Task<IActionResult> AddAsync([FromForm] ArchivingAddDTO NewArchiving)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewArchiving == null)
            {
                return BadRequest("Archiving tree cannot be null");
            } 

            if(NewArchiving.ArchivingTreeParentID != null && NewArchiving.ArchivingTreeParentID != 0)
            {
                ArchivingTree archivingTreeExist = Unit_Of_Work.archivingTree_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == NewArchiving.ArchivingTreeParentID);
                if (archivingTreeExist == null)
                {
                    return NotFound("No Archiving with this ID");
                }
            }
            else
            {
                NewArchiving.ArchivingTreeParentID = null;
            } 

            if (NewArchiving.FileFile != null)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(NewArchiving.FileFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            ArchivingTree archivingTree = mapper.Map<ArchivingTree>(NewArchiving);
             
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            archivingTree.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                archivingTree.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                archivingTree.InsertedByUserId = userId;
            }

            Unit_Of_Work.archivingTree_Repository.Add(archivingTree);
            Unit_Of_Work.SaveChanges();

            if (NewArchiving.FileFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Archiving");
                var archiveFolder = Path.Combine(baseFolder, archivingTree.ID.ToString());
                if (!Directory.Exists(archiveFolder))
                {
                    Directory.CreateDirectory(archiveFolder);
                }

                if (NewArchiving.FileFile.Length > 0)
                {
                    var filePath = Path.Combine(archiveFolder, NewArchiving.FileFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewArchiving.FileFile.CopyToAsync(stream);
                    }
                }

                archivingTree.FileLink = Path.Combine("Uploads", "Request", archivingTree.ID.ToString(), NewArchiving.FileFile.FileName);
                Unit_Of_Work.archivingTree_Repository.Update(archivingTree);
            }
            Unit_Of_Work.SaveChanges();

            return Ok();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Archiving" }
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

            ArchivingTree archivingTreeExist = Unit_Of_Work.archivingTree_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);
            if (archivingTreeExist == null)
            {
                return NotFound("No Archiving with this ID");
            }
             
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Archiving", roleId, userId, archivingTreeExist);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            archivingTreeExist.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            archivingTreeExist.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                archivingTreeExist.DeletedByOctaId = userId;
                if (archivingTreeExist.DeletedByUserId != null)
                {
                    archivingTreeExist.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                archivingTreeExist.DeletedByUserId = userId;
                if (archivingTreeExist.DeletedByOctaId != null)
                {
                    archivingTreeExist.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.archivingTree_Repository.Update(archivingTreeExist);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
