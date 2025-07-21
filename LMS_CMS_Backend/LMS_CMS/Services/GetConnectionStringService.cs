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

            var dataSource = "DESKTOP-531QG4Q";

=======
            var dataSource = "DESKTOP-3BNN4KG";
>>>>>>> c7d09920fd3d03ea4e68ac0b1ec6233d3dea8b58
            var initialCatalog = domainName;

            return $"Data Source={dataSource};Initial Catalog={initialCatalog};Integrated Security = True;TrustServerCertificate=True";
        }
    }
}