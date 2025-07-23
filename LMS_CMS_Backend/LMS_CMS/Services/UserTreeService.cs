using AutoMapper;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;

namespace LMS_CMS_PL.Services
{
    public class UserTreeService
    {
        IMapper mapper;
        public UserTreeService(IMapper mapper)
        {
            this.mapper = mapper;
        }
        public List<long> GetUsersAccordingToTree(UOW Unit_Of_Work, long userTypeID, UserFilter? filterList)
        {
            List<long> users = new List<long>();
            
            UserType userType = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == userTypeID);
            if(userType == null)
            {
                throw new Exception("No User Type with this Id");
            } 

            if(userTypeID == 1) // employee
            {
            } else if (userTypeID == 2) // student
            {

            } else if (userTypeID == 3) // parent
            {
                List<Parent> parents = Unit_Of_Work.parent_Repository.FindBy(d => d.IsDeleted != true);
                users = parents.Select(p => p.ID).ToList();

            } 

            return users;
        }
    }
}
