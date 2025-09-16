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
using System;

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
                 
                treesToKeep.Add(item.ArchivingTreeID);

                PermissionGroupDetails existingPermission = Unit_Of_Work.permissionGroupDetails_Repository.First_Or_Default(p => p.ArchivingTreeID == archivingTree.ID && p.PermissionGroupID == NewDetails.PermissionGroupID && p.IsDeleted != true);

                if (existingPermission == null)
                {
                    PermissionGroupDetails permissionGroupDetails = new PermissionGroupDetails
                    {
                        ArchivingTreeID = item.ArchivingTreeID,
                        PermissionGroupID = NewDetails.PermissionGroupID,
                        Allow_Delete = item.Allow_Delete,
                        Allow_Delete_For_Others = item.Allow_Delete_For_Others,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : (long?)null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : (long?)null
                    };
                    await Unit_Of_Work.permissionGroupDetails_Repository.AddAsync(permissionGroupDetails);

                    List<ArchivingTree> fileArchivingTree = Unit_Of_Work.archivingTree_Repository.FindBy(
                        d => d.IsDeleted != true && d.ArchivingTreeParentID == item.ArchivingTreeID && d.FileLink != null && d.FileLink != "");
                    if (fileArchivingTree.Count > 0)
                    {
                        foreach (var file in fileArchivingTree)
                        {
                            treesToKeep.Add(file.ID);

                            PermissionGroupDetails existingFilePermission = Unit_Of_Work.permissionGroupDetails_Repository.First_Or_Default(
                                p => p.ArchivingTreeID == file.ID && p.PermissionGroupID == NewDetails.PermissionGroupID && p.IsDeleted != true);
                            if (existingPermission == null)
                            {
                                PermissionGroupDetails permissionFileGroupDetails = new PermissionGroupDetails
                                {
                                    ArchivingTreeID = file.ID,
                                    PermissionGroupID = NewDetails.PermissionGroupID,
                                    Allow_Delete = item.Allow_Delete,
                                    Allow_Delete_For_Others = item.Allow_Delete_For_Others,
                                    InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                                    InsertedByOctaId = userTypeClaim == "octa" ? userId : (long?)null,
                                    InsertedByUserId = userTypeClaim == "employee" ? userId : (long?)null
                                };
                                await Unit_Of_Work.permissionGroupDetails_Repository.AddAsync(permissionFileGroupDetails);
                            }
                            else
                            {
                                if (existingFilePermission.Allow_Delete != item.Allow_Delete || existingFilePermission.Allow_Delete_For_Others != item.Allow_Delete_For_Others)
                                {
                                    existingFilePermission.Allow_Delete = item.Allow_Delete;
                                    existingFilePermission.Allow_Delete_For_Others = item.Allow_Delete_For_Others;
                                    Unit_Of_Work.permissionGroupDetails_Repository.Update(existingFilePermission);
                                }
                            }
                        }
                    }
                }
                else
                {
                    if (existingPermission.Allow_Delete != item.Allow_Delete || existingPermission.Allow_Delete_For_Others != item.Allow_Delete_For_Others)
                    {
                        existingPermission.Allow_Delete = item.Allow_Delete;
                        existingPermission.Allow_Delete_For_Others = item.Allow_Delete_For_Others;
                        Unit_Of_Work.permissionGroupDetails_Repository.Update(existingPermission);

                        List<ArchivingTree> fileArchivingTree = Unit_Of_Work.archivingTree_Repository.FindBy(
                            d => d.IsDeleted != true && d.ArchivingTreeParentID == existingPermission.ArchivingTreeID && d.FileLink != null && d.FileLink != "");
                        if (fileArchivingTree.Count > 0)
                        {
                            foreach (var file in fileArchivingTree)
                            {
                                treesToKeep.Add(file.ID);

                                PermissionGroupDetails existingFilePermission = Unit_Of_Work.permissionGroupDetails_Repository.First_Or_Default(
                                    p => p.ArchivingTreeID == file.ID && p.PermissionGroupID == NewDetails.PermissionGroupID && p.IsDeleted != true);
                                if (existingPermission == null)
                                {
                                    PermissionGroupDetails permissionFileGroupDetails = new PermissionGroupDetails
                                    {
                                        ArchivingTreeID = file.ID,
                                        PermissionGroupID = NewDetails.PermissionGroupID,
                                        Allow_Delete = item.Allow_Delete,
                                        Allow_Delete_For_Others = item.Allow_Delete_For_Others,
                                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                                        InsertedByOctaId = userTypeClaim == "octa" ? userId : (long?)null,
                                        InsertedByUserId = userTypeClaim == "employee" ? userId : (long?)null
                                    };
                                    await Unit_Of_Work.permissionGroupDetails_Repository.AddAsync(permissionFileGroupDetails);
                                }
                                else
                                {
                                    if (existingFilePermission.Allow_Delete != item.Allow_Delete || existingFilePermission.Allow_Delete_For_Others != item.Allow_Delete_For_Others)
                                    {
                                        existingFilePermission.Allow_Delete = item.Allow_Delete;
                                        existingFilePermission.Allow_Delete_For_Others = item.Allow_Delete_For_Others;
                                        Unit_Of_Work.permissionGroupDetails_Repository.Update(existingFilePermission);
                                    }
                                }
                            }
                        }
                    }
                }

            }

            await Unit_Of_Work.SaveChangesAsync();

            List<PermissionGroupDetails> existingPermissions = Unit_Of_Work.permissionGroupDetails_Repository.FindBy(p => p.PermissionGroupID == NewDetails.PermissionGroupID && p.IsDeleted != true);

            foreach (PermissionGroupDetails existingPermission in existingPermissions)
            {
                if (!treesToKeep.Contains(existingPermission.ArchivingTreeID))
                {
                    existingPermission.IsDeleted = true;
                    Unit_Of_Work.permissionGroupDetails_Repository.Update(existingPermission);
                }
            } 

            await Unit_Of_Work.SaveChangesAsync();
            return Ok();
        }  
    }
}
