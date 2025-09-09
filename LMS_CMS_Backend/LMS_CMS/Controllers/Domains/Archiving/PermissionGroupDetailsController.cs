using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Archiving;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Archiving;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.Archiving
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class PermissionGroupDetailsController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public PermissionGroupDetailsController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByPermissionGroupID/{PGID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Permissions Group Archiving" }
        )]
        public IActionResult GetAsync(long PGID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            PermissionGroup permissionGroup = Unit_Of_Work.permissionGroup_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == PGID);
            if (permissionGroup == null)
            {
                return BadRequest("No Permission Group with this ID");
            }

            List<PermissionGroupDetails> permissionGroupDetails = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(
                f => f.IsDeleted != true && f.PermissionGroupID == PGID && f.PermissionGroup.IsDeleted != true && f.ArchivingTree.IsDeleted != true
                );

            if (permissionGroupDetails == null || permissionGroupDetails.Count == 0)
            {
                return NotFound();
            }

            List<PermissionGroupDetailsGetDTO> permissionGroupDetailsGetDTOs = mapper.Map<List<PermissionGroupDetailsGetDTO>>(permissionGroupDetails);

            return Ok(permissionGroupDetailsGetDTOs);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Permissions Group Archiving" }
        )]
        public async Task<IActionResult> Add(PermissionGroupDetailsAddDTO NewDetails)
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

            if (NewDetails == null)
            {
                return BadRequest("Details data is null.");
            }

            PermissionGroup permissionGroup = Unit_Of_Work.permissionGroup_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewDetails.PermissionGroupID);
            if (permissionGroup == null)
            {
                return NotFound("No Permission Group with this ID");
            }
             
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            HashSet<long> treesToKeep = new HashSet<long>();

            foreach (var item in NewDetails.ArchivingTreeDetails)
            {
                ArchivingTree archivingTree = Unit_Of_Work.archivingTree_Repository.First_Or_Default(r => r.ID == item.ArchivingTreeID && r.IsDeleted != true);
                if (archivingTree == null) { return NotFound("There is no archiving Tree with this ID."); }

                // Add current tree and all its ancestors to the keep list
                await CollectTreeAndAncestors(Unit_Of_Work, archivingTree, treesToKeep);
            }
             
            List<PermissionGroupDetails> existingPermissions = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(p => p.PermissionGroupID == NewDetails.PermissionGroupID && p.IsDeleted != true);

            foreach (PermissionGroupDetails existingPermission in existingPermissions)
            {
                if (!treesToKeep.Contains(existingPermission.ArchivingTreeID))
                {
                    existingPermission.IsDeleted = true;
                    Unit_Of_Work.permissionGroupDetails_Repository.Update(existingPermission);
                }
            }


            foreach (var item in NewDetails.ArchivingTreeDetails)
            {
                ArchivingTree archivingTree = Unit_Of_Work.archivingTree_Repository.First_Or_Default(r => r.ID == item.ArchivingTreeID && r.IsDeleted != true);
                if (archivingTree == null) { return NotFound("There is no archiving Tree with this ID."); }
                 
                await ProcessArchivingTreeAndAncestors(Unit_Of_Work, archivingTree, NewDetails.PermissionGroupID, item, userId, userTypeClaim, cairoZone);
            } 

            await Unit_Of_Work.SaveChangesAsync();
            return Ok();
        } 

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        private async Task ProcessArchivingTreeAndAncestors(UOW unitOfWork, ArchivingTree archivingTree, long permissionGroupId, ArchivingTreeDetailsDTO item, long userId, string userType, TimeZoneInfo timeZone)
        {  
            PermissionGroupDetails existingPermission = unitOfWork.permissionGroupDetails_Repository.First_Or_Default(p => p.ArchivingTreeID == archivingTree.ID && p.PermissionGroupID == permissionGroupId);

            if (existingPermission == null)
            {
                PermissionGroupDetails permissionGroupDetails = new PermissionGroupDetails
                {
                    ArchivingTreeID = archivingTree.ID,
                    PermissionGroupID = permissionGroupId,
                    Allow_Delete = item.Allow_Delete,
                    Allow_Delete_For_Others = item.Allow_Delete_For_Others,
                    InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, timeZone),
                    InsertedByOctaId = userType == "octa" ? userId : (long?)null,
                    InsertedByUserId = userType == "employee" ? userId : (long?)null
                };
                await unitOfWork.permissionGroupDetails_Repository.AddAsync(permissionGroupDetails);
            }
            else
            {
                if (existingPermission.Allow_Delete != item.Allow_Delete || existingPermission.Allow_Delete_For_Others != item.Allow_Delete_For_Others)
                {
                    existingPermission.Allow_Delete = item.Allow_Delete;
                    existingPermission.Allow_Delete_For_Others = item.Allow_Delete_For_Others;
                    unitOfWork.permissionGroupDetails_Repository.Update(existingPermission);
                }
            }
             
            if (archivingTree.ArchivingTreeParentID.HasValue)
            {
                ArchivingTree parentTree = unitOfWork.archivingTree_Repository.First_Or_Default(a => a.IsDeleted != true && a.ID == archivingTree.ArchivingTreeParentID.Value);

                if (parentTree != null)
                {
                    await ProcessArchivingTreeAndAncestors(unitOfWork, parentTree, permissionGroupId, item, userId, userType, timeZone);
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        private async Task CollectTreeAndAncestors(UOW unitOfWork, ArchivingTree archivingTree, HashSet<long> treesToKeep)
        {
            var currentTree = archivingTree;

            while (currentTree != null)
            {
                treesToKeep.Add(currentTree.ID);

                if (currentTree.ArchivingTreeParentID.HasValue)
                {
                    currentTree = unitOfWork.archivingTree_Repository.First_Or_Default(a => a.IsDeleted != true && a.ID == currentTree.ArchivingTreeParentID.Value);
                }
                else
                {
                    currentTree = null;
                }
            }
        }
    }
}
