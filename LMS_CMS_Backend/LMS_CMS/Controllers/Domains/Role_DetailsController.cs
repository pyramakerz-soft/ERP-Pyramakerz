using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Ocsp;

namespace LMS_CMS_PL.Controllers.Domains
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class Role_DetailsController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;


        public Role_DetailsController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
        }

        [HttpGet("CheckPageAccess")]
        public IActionResult CheckPageAccess([FromQuery] long roleId, [FromQuery] string pageName)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Page page = Unit_Of_Work.page_Repository.First_Or_Default(d => d.en_name == pageName);
            if (page == null)
            {
                return BadRequest("No Page with this ID");
            }

            Role role = Unit_Of_Work.role_Repository.First_Or_Default(d => d.ID == roleId && d.IsDeleted != true);
            if (role == null)
            {
                return BadRequest("No Role with this ID");
            }

            Role_Detailes role_Detaile = Unit_Of_Work.role_Detailes_Repository.First_Or_Default(d => d.IsDeleted != true && d.Page_ID == page.ID && d.Role_ID == roleId);
            if (role_Detaile == null)
            {
                return BadRequest("You don't have access to this page");
            }
            else
            {
                return Ok();
            }
        }

        [HttpGet("Get_With_RoleID_Group_By/{roleId}")]
        public async Task<IActionResult> Get_With_RoleID_Group_By(long roleId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var roleDetailsList = await Unit_Of_Work.role_Detailes_Repository.Database().Role_Detailes
                .Where(rd => rd.IsDeleted != true && rd.Role_ID== roleId)
                .Include(rd => rd.Page)  // Include the related Page entity
                .ThenInclude(p => p.ChildPages) // Include the child pages
                .OrderBy(rd => rd.Page.Order)
                .ToListAsync();

            if (roleDetailsList == null || !roleDetailsList.Any())
            {
                return NotFound("No pages found for the specified role.");
            }

            // Convert roleDetailsList to a dictionary for fast lookup by Page_ID
            var roleDetails = roleDetailsList
                .GroupBy(rd => rd.Page_ID)
                .ToDictionary(g => g.Key, g => g.First());

            // Group role details by parent page
            var parentPages = roleDetailsList
                .Where(rd => rd.Page.Page_ID == null && rd.IsDeleted != true)  // Only root-level pages
                .GroupBy(rd => rd.Page.ID) // Group by parent page ID to avoid duplication
                .Select(group => new Role_Details_GetDTO
                {
                    ID = group.Key,
                    en_name = group.First().Page.en_name,
                    ar_name = group.First().Page.ar_name,
                    enDisplayName_name = group.First().Page.enDisplayName_name,
                    arDisplayName_name = group.First().Page.arDisplayName_name,
                    IsDisplay = group.First().Page.IsDisplay,
                    Page_ID = group.First().Page.Page_ID,
                    order = group.First().Page.Order,
                    Allow_Edit = group.First().Allow_Edit,
                    Allow_Delete = group.First().Allow_Delete,
                    Allow_Edit_For_Others = group.First().Allow_Edit_For_Others,
                    Allow_Delete_For_Others = group.First().Allow_Delete_For_Others,
                    Children = GetChildPagesRecursive(group.First().Page, roleDetails) // Use the optimized recursive method
                })
                .OrderBy(p => p.order) // ✅ Order parent pages by order
                .ToList();

            return Ok(parentPages);
        }

        private List<Role_Details_GetDTO> GetChildPagesRecursive(Page parentPage, Dictionary<long, Role_Detailes> roleDetails)
        {
            // Recursively fetch children and their nested children
            return parentPage.ChildPages
                .Where(child => roleDetails.ContainsKey(child.ID)) // Ensure child exists in Role_Details
                .OrderBy(child => child.Order) // ✅ Order children by Order
                .Select(child => new Role_Details_GetDTO
                {
                    ID = child.ID,
                    en_name = child.en_name,
                    ar_name = child.ar_name,
                    enDisplayName_name = child.enDisplayName_name,
                    arDisplayName_name = child.arDisplayName_name,
                    order = child.Order,
                    IsDisplay = child.IsDisplay,
                    Page_ID = child.Page_ID,
                    Allow_Edit = roleDetails[child.ID].Allow_Edit,
                    Allow_Delete = roleDetails[child.ID].Allow_Delete,
                    Allow_Edit_For_Others = roleDetails[child.ID].Allow_Edit_For_Others,
                    Allow_Delete_For_Others = roleDetails[child.ID].Allow_Delete_For_Others,
                    Children = GetChildPagesRecursive(child, roleDetails) // Recursively get children
                })
                .ToList();
        }

        [HttpGet("Get_All_With_Group_By")]
        public async Task<IActionResult> Get_All_With_Group_By()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var roleDetailsList = await Unit_Of_Work.role_Detailes_Repository.Database().Role_Detailes
                .Where(rd => rd.IsDeleted != true)
                .Include(rd => rd.Page)  // Include the related Page entity
                .ThenInclude(p => p.ChildPages) // Include the child pages
                .ToListAsync();

            if (roleDetailsList == null || !roleDetailsList.Any())
            {
                return NotFound("No pages found for the specified role.");
            }

            // Convert roleDetailsList to a dictionary for fast lookup by Page_ID
            var roleDetails = roleDetailsList
                .GroupBy(rd => rd.Page_ID)
                .ToDictionary(g => g.Key, g => g.First());

            // Group role details by parent page
            var parentPages = roleDetailsList
                .Where(rd => rd.Page.Page_ID == null && rd.IsDeleted != true)  // Only root-level pages
                .GroupBy(rd => rd.Page.ID) // Group by parent page ID to avoid duplication
                .Select(group => new Role_Details_GetDTO
                {
                    ID = group.Key,
                    en_name = group.First().Page.en_name,
                    ar_name = group.First().Page.ar_name,
                    enDisplayName_name = group.First().Page.enDisplayName_name,
                    arDisplayName_name = group.First().Page.arDisplayName_name,
                    IsDisplay = group.First().Page.IsDisplay,
                    Page_ID = group.First().Page.Page_ID,
                    order = group.First().Page.Order,
                    Allow_Edit = group.First().Allow_Edit,
                    Allow_Delete = group.First().Allow_Delete,
                    Allow_Edit_For_Others = group.First().Allow_Edit_For_Others,
                    Allow_Delete_For_Others = group.First().Allow_Delete_For_Others,
                    Children = GetChildPagesRecursive(group.First().Page, roleDetails) // Use the optimized recursive method
                })
                .ToList();

            return Ok(parentPages);
        }

        [HttpGet("GetPagesNameForSearch")]
        [Authorize_Endpoint_(
            allowedTypes: new[] {"employee" }
        )]
        public async Task<IActionResult> GetPagesNameForSearch()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext); 
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            Employee emp = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
            if(emp == null)
            {
                return BadRequest("No Employee with this ID");
            }
             
            List<Role_Detailes> role_Detailes = await Unit_Of_Work.role_Detailes_Repository.Select_All_With_IncludesById<Role_Detailes>(
                d => d.IsDeleted != true && d.Role_ID == emp.Role_ID && d.Page.IsDisplay == true,
                query => query.Include(d => d.Page)
                );

            List<string> pages = new List<string>();

            foreach (var item in role_Detailes)
            {
                List<Page> children = Unit_Of_Work.page_Repository.FindBy(d => d.Page_ID == item.Page_ID); 
                if(children == null || children.Count == 0)
                {
                    pages.Add(item.Page.en_name);
                }
            }

            return Ok(pages);
        }
    }
}
