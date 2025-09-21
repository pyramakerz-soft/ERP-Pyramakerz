using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Administration;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Services
{
    public class EmployeeFilterService
    {

        private readonly UOW _uow;

        public EmployeeFilterService(UOW uow)
        {
            _uow = uow;
        }

        public async Task<List<Employee>> GetEmployees(long? categoryId, long? jobId, long? employeeId)
        {

            if (employeeId.HasValue) 
            {
                return await _uow.employee_Repository.Select_All_With_IncludesById<Employee>(
                    e => e.ID == employeeId.Value && e.IsDeleted != true,
                    q => q.Include(e => e.Job).ThenInclude(j => j.JobCategory)
                );
            }
            else if (jobId.HasValue) 
            {
                return await _uow.employee_Repository.Select_All_With_IncludesById<Employee>(
                    e => e.JobID == jobId.Value && e.IsDeleted != true,
                    q => q.Include(e => e.Job).ThenInclude(j => j.JobCategory)
                );
            }
            else if (categoryId.HasValue) 
            {
                return await _uow.employee_Repository.Select_All_With_IncludesById<Employee>(
                    e => e.Job.JobCategoryID == categoryId.Value && e.IsDeleted != true,
                    q => q.Include(e => e.Job).ThenInclude(j => j.JobCategory)
                );
            }
            return await _uow.employee_Repository.Select_All_With_IncludesById<Employee>(
                e => e.IsDeleted != true,
                q => q.Include(e => e.Job).ThenInclude(j => j.JobCategory)
            );
        }
    }
}
