namespace LMS_CMS_PL.Services
{
    public class GetConnectionStringService
    {

        //public string BuildConnectionString(string domainName)
        //{ 
        //    var dataSource = "octa-db.cxg0g2422n2v.us-east-1.rds.amazonaws.com,1433";
        //    var initialCatalog = domainName; 
        //    var userId = "admin";
        //    var password = "PyraDev1*";
        //    var trustServerCertificate = "TrustServerCertificate=True";

        //    return $"Data Source={dataSource};Initial Catalog={initialCatalog};User ID={userId};Password={password};{trustServerCertificate}";
        //}

        public string BuildConnectionString(string domainName)
        {
<<<<<<< HEAD
//<<<<<<< HEAD
            var dataSource = "DESKTOP-531QG4Q";
//=======
//            var dataSource = "DESKTOP-3BNN4KG";
//>>>>>>> 59ad349a82c973b8ec5591da38d6084132b3ca35
=======

            var dataSource = ".";
>>>>>>> 700fb9b7c365717caf14c3e5ad2a4231166da721
            var initialCatalog = domainName;

            return $"Data Source={dataSource};Initial Catalog={initialCatalog};Integrated Security = True;TrustServerCertificate=True";
        }
    }
}