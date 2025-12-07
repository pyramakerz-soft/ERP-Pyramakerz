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
using LMS_CMS_PL.Services.S3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Linq;
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
        private readonly FileUploadsService _fileService;

        public ArchivingTreeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _fileService = fileService;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        private List<ArchivingTreeGetDTO> BuildHierarchy(List<ArchivingTree> allArchivingTrees, List<long> ArchivingTreeIDs, long? parentId = null)
        {
            string serverUrl = $"{Request.Scheme}://{Request.Host}/"; 

            return allArchivingTrees
                .Where(ac => ac.ArchivingTreeParentID == parentId && (ac.FileLink == "" || ac.FileLink == null) && ArchivingTreeIDs.Contains(ac.ID))
                .Select(ac => new ArchivingTreeGetDTO
                {
                    ID = ac.ID,
                    Name = ac.Name,
                    FileLink = _fileService.GetFileUrl(ac.FileLink, Request, HttpContext), 
                    ArchivingTreeParentID = ac.ArchivingTreeParentID,
                    InsertedByUserId = ac.InsertedByUserId ?? 0, 
                    Children = BuildHierarchy(allArchivingTrees, ArchivingTreeIDs, ac.ID)
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
             
            List<long> ArchivingTreeIDs = new List<long>();
             
            List<ArchivingTree> allArchivingTrees = await Unit_Of_Work.archivingTree_Repository.Select_All_With_IncludesById<ArchivingTree>(
                f => f.IsDeleted != true && (f.FileLink == "" || f.FileLink == null),
                query => query.Include(ac => ac.ArchivingTreeParent),
                query => query.Include(ac => ac.ChildArchivingTrees)
                );
             
            if (allArchivingTrees == null || allArchivingTrees.Count == 0 || !allArchivingTrees.Any())
            {
                return NotFound();
            }

            ArchivingTreeIDs = allArchivingTrees.Select(d => d.ID).ToList();

            List<ArchivingTreeGetDTO> archivingTreesDTO = BuildHierarchy(allArchivingTrees, ArchivingTreeIDs);

            return Ok(archivingTreesDTO);
        }
        
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetAllPerUser")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Archiving" }
        )]
        public async Task<IActionResult> GetAllPerUser()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            List<PermissionGroupEmployee> permissionGroupsEmployee = Unit_Of_Work.permissionGroupEmployee_Repository.FindBy(
                d => d.IsDeleted != true && d.EmployeeID == userId && d.PermissionGroup.IsDeleted != true);
            if (permissionGroupsEmployee == null || !permissionGroupsEmployee.Any())
            {
                return NotFound();
            }

            List<long> permissionGroupIDs = permissionGroupsEmployee.Select(d => d.PermissionGroupID).ToList();
            List<long> ArchivingTreeIDs = new List<long>();

            foreach (var id in permissionGroupIDs)
            {
                List<PermissionGroupDetails> permissionGroupDetails = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(
                    d => d.IsDeleted != true && d.PermissionGroupID == id && d.ArchivingTree.IsDeleted != true);   
                if (permissionGroupDetails != null)
                {
                    ArchivingTreeIDs.AddRange(permissionGroupDetails.Select(d=>d.ArchivingTreeID).ToList());
                }
            }

            if(ArchivingTreeIDs.Count == 0)
            {
                return NotFound();
            }

            ArchivingTreeIDs = ArchivingTreeIDs.Distinct().ToList();

            ArchivingTree archivingTreeContent = Unit_Of_Work.archivingTree_Repository.First_Or_Default(
                   acc => acc.IsDeleted != true && acc.Name == "Content"
                   );

            List<ArchivingTree> allArchivingTrees = await Unit_Of_Work.archivingTree_Repository.Select_All_With_IncludesById<ArchivingTree>(
                f => f.IsDeleted != true && ArchivingTreeIDs.Contains(f.ID),
                query => query.Include(ac => ac.ArchivingTreeParent),
                query => query.Include(ac => ac.ChildArchivingTrees)
                );
             
            if (allArchivingTrees == null || allArchivingTrees.Count == 0 || !allArchivingTrees.Any())
            {
                return NotFound();
            }

            List<ArchivingTreeGetDTO> archivingTreesDTO = BuildHierarchy(allArchivingTrees, ArchivingTreeIDs, archivingTreeContent.ID);

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
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

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

            List<PermissionGroupEmployee> permissionGroupsEmployee = Unit_Of_Work.permissionGroupEmployee_Repository.FindBy(
                d => d.IsDeleted != true && d.EmployeeID == userId && d.PermissionGroup.IsDeleted != true);
            if (permissionGroupsEmployee == null || !permissionGroupsEmployee.Any())
            {
                return BadRequest("You Don't have access on this item");
            }

            List<long> permissionGroupIDs = permissionGroupsEmployee.Select(d => d.PermissionGroupID).ToList();
            List<long> ArchivingTreeIDs = new List<long>();

            foreach (var permId in permissionGroupIDs)
            {
                List<PermissionGroupDetails> permissionGroupDetails = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(
                    d => d.IsDeleted != true && d.PermissionGroupID == permId && d.ArchivingTree.IsDeleted != true);
                if (permissionGroupDetails != null)
                {
                    ArchivingTreeIDs.AddRange(permissionGroupDetails.Select(d => d.ArchivingTreeID).ToList());
                }
            }

            if (ArchivingTreeIDs.Count == 0)
            {
                return BadRequest("You Don't have access on this item");
            }

            ArchivingTreeIDs = ArchivingTreeIDs.Distinct().ToList();

            if (!ArchivingTreeIDs.Contains(id))
            {
                return BadRequest("You Don't have access on this item");
            }
             
            List<ArchivingTree> FirstChildrenForArchivingTrees = Unit_Of_Work.archivingTree_Repository.FindBy(
                    acc => acc.IsDeleted != true && acc.ArchivingTreeParentID == id && ArchivingTreeIDs.Contains(acc.ID));

            ArchivingTreeGetDTO accountingTreeChartGetDTO = mapper.Map<ArchivingTreeGetDTO>(archivingTree); 
             
            if(FirstChildrenForArchivingTrees != null && FirstChildrenForArchivingTrees.Count != 0)
            {
                List<ArchivingTreeGetDTO> FirstChildrenForArchivingTreesDTO = mapper.Map<List<ArchivingTreeGetDTO>>(FirstChildrenForArchivingTrees);
                accountingTreeChartGetDTO.Children = FirstChildrenForArchivingTreesDTO;
            }

            if(accountingTreeChartGetDTO.FileLink != null)
            { 
                accountingTreeChartGetDTO.FileLink = _fileService.GetFileUrl(accountingTreeChartGetDTO.FileLink, Request, HttpContext);
            }

            if (accountingTreeChartGetDTO.Children.Count > 0)
            {
                foreach(var child in accountingTreeChartGetDTO.Children)
                {
                    if (child.FileLink != null)
                    { 
                        child.FileLink = _fileService.GetFileUrl(child.FileLink, Request, HttpContext);
                    }
                }
            }

            return Ok(accountingTreeChartGetDTO);
        }
        
        ///////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetContent")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Archiving" }
        )]
        public async Task<IActionResult> GetContent()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
             
            ArchivingTree archivingTree = await Unit_Of_Work.archivingTree_Repository.FindByIncludesAsync(
                    acc => acc.IsDeleted != true && acc.Name == "Content",
                    query => query.Include(ac => ac.ArchivingTreeParent)
                    );

            if (archivingTree == null)
            {
                return NotFound();
            }

            List<PermissionGroupEmployee> permissionGroupsEmployee = Unit_Of_Work.permissionGroupEmployee_Repository.FindBy(
                d => d.IsDeleted != true && d.EmployeeID == userId && d.PermissionGroup.IsDeleted != true);
            if (permissionGroupsEmployee == null || !permissionGroupsEmployee.Any())
            {
                return BadRequest("You Don't have access on this item");
            }

            List<long> permissionGroupIDs = permissionGroupsEmployee.Select(d => d.PermissionGroupID).ToList();
            List<long> ArchivingTreeIDs = new List<long>();

            foreach (var permId in permissionGroupIDs)
            {
                List<PermissionGroupDetails> permissionGroupDetails = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(
                    d => d.IsDeleted != true && d.PermissionGroupID == permId && d.ArchivingTree.IsDeleted != true);
                if (permissionGroupDetails != null)
                {
                    ArchivingTreeIDs.AddRange(permissionGroupDetails.Select(d => d.ArchivingTreeID).ToList());
                }
            }

            if (ArchivingTreeIDs.Count == 0)
            {
                return BadRequest("You Don't have access on this item");
            }

            ArchivingTreeIDs = ArchivingTreeIDs.Distinct().ToList();

            if (!ArchivingTreeIDs.Contains(archivingTree.ID))
            {
                return BadRequest("You Don't have access on this item");
            }
             
            List<ArchivingTree> FirstChildrenForArchivingTrees = Unit_Of_Work.archivingTree_Repository.FindBy(
                    acc => acc.IsDeleted != true && acc.ArchivingTreeParentID == archivingTree.ID && ArchivingTreeIDs.Contains(acc.ID));

            ArchivingTreeGetDTO accountingTreeChartGetDTO = mapper.Map<ArchivingTreeGetDTO>(archivingTree); 
             
            if(FirstChildrenForArchivingTrees != null && FirstChildrenForArchivingTrees.Count != 0)
            {
                List<ArchivingTreeGetDTO> FirstChildrenForArchivingTreesDTO = mapper.Map<List<ArchivingTreeGetDTO>>(FirstChildrenForArchivingTrees);
                accountingTreeChartGetDTO.Children = FirstChildrenForArchivingTreesDTO;
            }

            if(accountingTreeChartGetDTO.FileLink != null)
            { 
                accountingTreeChartGetDTO.FileLink = _fileService.GetFileUrl(accountingTreeChartGetDTO.FileLink, Request, HttpContext);
            }

            if (accountingTreeChartGetDTO.Children.Count > 0)
            {
                foreach (var child in accountingTreeChartGetDTO.Children)
                {
                    if (child.FileLink != null)
                    { 
                        child.FileLink = _fileService.GetFileUrl(child.FileLink, Request, HttpContext);
                    }
                }
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

                if(archivingTreeExist.FileLink != null)
                {
                    return BadRequest("This is not a folder");
                }
            }
            else
            {
                ArchivingTree archivingTreeContent = Unit_Of_Work.archivingTree_Repository.First_Or_Default(t => t.IsDeleted != true && t.Name == "Content");
                if (archivingTreeContent != null)
                { 
                    NewArchiving.ArchivingTreeParentID = archivingTreeContent.ID;
                }
                else
                {
                     NewArchiving.ArchivingTreeParentID = null;
                }
            }


            List<PermissionGroupEmployee> permissionGroupsEmployee = Unit_Of_Work.permissionGroupEmployee_Repository.FindBy(
               d => d.IsDeleted != true && d.EmployeeID == userId && d.PermissionGroup.IsDeleted != true);
            if (permissionGroupsEmployee == null || !permissionGroupsEmployee.Any())
            {
                return BadRequest("You Don't have access on this Archiving Folder");
            }

            List<long> permissionGroupIDs = permissionGroupsEmployee.Select(d => d.PermissionGroupID).ToList();
            List<long> ArchivingTreeIDs = new List<long>();

            foreach (var permId in permissionGroupIDs)
            {
                List<PermissionGroupDetails> permissionGroupDetails = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(
                    d => d.IsDeleted != true && d.PermissionGroupID == permId && d.ArchivingTree.IsDeleted != true);
                if (permissionGroupDetails != null)
                {
                    ArchivingTreeIDs.AddRange(permissionGroupDetails.Select(d => d.ArchivingTreeID).ToList());
                }
            }

            if (ArchivingTreeIDs.Count == 0)
            {
                return BadRequest("You Don't have access on this Archiving Folder");
            }

            ArchivingTreeIDs = ArchivingTreeIDs.Distinct().ToList();

            if (!ArchivingTreeIDs.Contains(NewArchiving.ArchivingTreeParentID.Value))
            {
                return BadRequest("You Don't have access on this Archiving Folder");
            }

            if (NewArchiving.Name == "Content" || NewArchiving.Name == "content")
            {
                return BadRequest("Choose another name");
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
                archivingTree.FileLink = await _fileService.UploadFileAsync(NewArchiving.FileFile, "Archiving/Archiving", archivingTree.ID, HttpContext);
                Unit_Of_Work.archivingTree_Repository.Update(archivingTree);
            }

            foreach (var permId in permissionGroupIDs)
            {
                PermissionGroupDetails permissionGroupDetail = Unit_Of_Work.permissionGroupDetails_Repository.First_Or_Default(
                    d => d.IsDeleted != true && d.PermissionGroupID == permId && d.ArchivingTreeID == NewArchiving.ArchivingTreeParentID && d.ArchivingTree.IsDeleted != true);
                if (permissionGroupDetail != null)
                {
                    PermissionGroupDetails permissionGroupDetailsNew = new PermissionGroupDetails();
                    permissionGroupDetailsNew.PermissionGroupID = permissionGroupDetail.PermissionGroupID;
                    permissionGroupDetailsNew.Allow_Delete = permissionGroupDetail.Allow_Delete;
                    permissionGroupDetailsNew.Allow_Delete_For_Others = permissionGroupDetail.Allow_Delete_For_Others;
                    permissionGroupDetailsNew.ArchivingTreeID = archivingTree.ID;

                    permissionGroupDetailsNew.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        permissionGroupDetailsNew.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        permissionGroupDetailsNew.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.permissionGroupDetails_Repository.Add(permissionGroupDetailsNew);
                    Unit_Of_Work.SaveChanges();
                }
            } 

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

            if(archivingTreeExist.Name == "Content")
            {
                return BadRequest("You can't delete this");
            }
            List<PermissionGroupEmployee> permissionGroupsEmployee = Unit_Of_Work.permissionGroupEmployee_Repository.FindBy(
                d => d.IsDeleted != true && d.EmployeeID == userId && d.PermissionGroup.IsDeleted != true);
            if (permissionGroupsEmployee == null || !permissionGroupsEmployee.Any())
            {
                return BadRequest("You Don't have access on this item");
            }

            List<long> permissionGroupIDs = permissionGroupsEmployee.Select(d => d.PermissionGroupID).ToList();
            List<long> ArchivingTreeIDs = new List<long>();

            foreach (var permId in permissionGroupIDs)
            {
                List<PermissionGroupDetails> permissionGroupDetails = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(
                    d => d.IsDeleted != true && d.PermissionGroupID == permId && d.ArchivingTree.IsDeleted != true);
                if (permissionGroupDetails != null)
                {
                    ArchivingTreeIDs.AddRange(permissionGroupDetails.Select(d => d.ArchivingTreeID).ToList());
                }
            }

            if (ArchivingTreeIDs.Count == 0)
            {
                return BadRequest("You Don't have access on this item");
            }

            ArchivingTreeIDs = ArchivingTreeIDs.Distinct().ToList();

            if (!ArchivingTreeIDs.Contains(id))
            {
                return BadRequest("You Don't have access on this item");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Archiving", roleId, userId, archivingTreeExist);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
             
            List<long> permissionGroupIDsForUser = new List<long>();
            permissionGroupIDsForUser = permissionGroupsEmployee.Select(d => d.PermissionGroupID).ToList();

            bool hasDeletePermission = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(d => d.IsDeleted != true && permissionGroupIDsForUser.Contains(d.PermissionGroupID) && d.ArchivingTreeID == id)
                .Any(permissionGroupDetail =>
                    permissionGroupDetail.Allow_Delete == true && (
                    permissionGroupDetail.Allow_Delete_For_Others == true ||
                    (permissionGroupDetail.Allow_Delete_For_Others == false &&
                        permissionGroupDetail.InsertedByUserId == userId)));

            if (!hasDeletePermission)
            {
                return BadRequest("You don't have permission to delete this");
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

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1, 
            pages: new[] { "Archiving" } 
        )]

        public async Task<IActionResult> Update(ArchivingEditDTO newArchive)
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
             
            if (newArchive.ID == 0)
            {
                return BadRequest("Enter Archiving Tree ID");
            }
            if (string.IsNullOrWhiteSpace(newArchive.Name))
            {
                return BadRequest("Name cannot be empty");
            }
            if (newArchive.Name.Trim().ToLower() == "content")
            {
                return BadRequest("Choose another name");
            }

            ArchivingTree archivingTree =  Unit_Of_Work.archivingTree_Repository
                   .First_Or_Default(t => t.IsDeleted != true && t.ID == newArchive.ID);

            if (archivingTree == null)
            {
                return NotFound("No Archiving with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Archiving", roleId, userId, archivingTree);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (archivingTree.Name == "Content")
            {
                return BadRequest("You can't rename this");
            }

            archivingTree.Name = newArchive.Name.Trim();
            archivingTree.UpdatedAt = DateTime.UtcNow;
            if (userTypeClaim == "octa")
            {
                archivingTree.UpdatedByOctaId = userId;
            }
            else {
                archivingTree.UpdatedByUserId = userId;
            }
            Unit_Of_Work.archivingTree_Repository.Update(archivingTree);
            Unit_Of_Work.SaveChanges();

            return Ok();


        }
    }
}
