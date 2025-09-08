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
            var dataSource = ".";
=======
            var dataSource = "SW-02\\SQLEXPRESS";
>>>>>>> d2cc08e6be6a716eea9573f329a66eaf7ac21744
            var initialCatalog = domainName;

            return $"Data Source={dataSource};Initial Catalog={initialCatalog};Integrated Security = True;TrustServerCertificate=True";
        }
    }
}