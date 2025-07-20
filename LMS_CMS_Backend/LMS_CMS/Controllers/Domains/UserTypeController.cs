using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class UserTypeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper; 

        public UserTypeController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper; 
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
        )]
        public IActionResult GetAll()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<UserType> userTypes = Unit_Of_Work.userType_Repository.Select_All();

            if (userTypes == null || userTypes.Count == 0)
            {
                return NotFound();
            }

            List<UserTypeGetDTO> userTypesGetDTO = mapper.Map<List<UserTypeGetDTO>>(userTypes);

            return Ok(userTypesGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

    }
}
