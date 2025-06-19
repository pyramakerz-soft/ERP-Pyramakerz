using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Octa;
using Microsoft.EntityFrameworkCore;
using Net.Pkcs11Interop.HighLevelAPI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Ess;
using System.Collections.Specialized;
using System.Data;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Security.Cryptography.Pkcs;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Web;

namespace LMS_CMS_PL.Services.ETA
{
    public static class EtaServices
    {
        private static string DllLibPath = "eps2003csp11.dll";
        private static string TokenPin = "";
        private static string apiBaseUrl = "https://api.invoicing.eta.gov.eg";
        private static string idSrvBaseUrl = "https://id.eta.gov.eg";

        private static string clientId = "";
        private static string ClientSecret = "";
        private static string ClientSecret2 = "";
        private static string deviceSerialNumber = "";

        private static string UUID = "";

        private static string access_token = "";

        public static async void GetToken(int myTokenPinId, long schoolId, UOW unitOfWork)
        {
            EtaToken etaToken = await unitOfWork.etaToken_Repository.FindByIncludesAsync(x => x.ID == myTokenPinId, query => query.Include(x => x.EtaTokenType));
            TokenPin = etaToken.PIN;

                //TokenPin
                switch (etaToken.EtaTokenTypeID)
                {
                    case 1:
                        DllLibPath = "eps2003csp11.dll";
                        break;
                    case 2:
                        DllLibPath = "SignatureP11.dll";
                        break;
                }
            //}
        }

        public static bool GenerateJsonInvoice(InventoryMaster master, UOW unitOfWork, IConfiguration config, string dateTime)
        {
            string invoices = string.Empty;

            if (master.FlagId == 11)
                invoices = Path.Combine(Directory.GetCurrentDirectory(), "Invoices/JSONInvoices");

            if (master.FlagId == 12)
                invoices = Path.Combine(Directory.GetCurrentDirectory(), "Invoices/JSONCredits");

            if (!Directory.Exists(invoices))
            {
                Directory.CreateDirectory(invoices);
            }

            char invoiceType = 'I';

            if (master.FlagId == 12)
                invoiceType = 'C';

            TaxIssuer taxIssuer = unitOfWork.taxIssuer_Repository.Select_All().FirstOrDefault();

            string version = config.GetValue<string>("ETAVersion");

            decimal totalSalesAmount = GetTotalSalesAmount(master.InventoryDetails);

            var invoiceJson = new JsonObject
            {
                ["documents"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["issuer"] = new JsonObject
                        {
                            ["address"] = new JsonObject
                            {
                                ["branchID"] = taxIssuer.BranchID,
                                ["country"] =  taxIssuer.CountryCode,
                                ["governate"] = taxIssuer.Governate,
                                ["regionCity"] = taxIssuer.RegionCity,
                                ["street"] = taxIssuer.Street,
                                ["buildingNumber"] = taxIssuer.BuildingNumber,
                                ["postalCode"] = taxIssuer.PostalCode,
                                ["floor"] = taxIssuer.Floor,
                                ["room"] = taxIssuer.Room,
                                ["landmark"] = taxIssuer.LandMark,
                                ["additionalInformation"] = taxIssuer.AdditionalInfo
                            },
                            ["type"] = taxIssuer.TypeID,
                            ["id"] = taxIssuer.ID,
                            ["name"] = taxIssuer.Name
                        },
                        ["receiver"] = new JsonObject
                        {
                            ["address"] = new JsonObject
                            {
                                ["country"] =  master.Student.CountryCode,
                                ["governate"] = master.Student.Governate,
                                ["regionCity"] = master.Student.RegionCity,
                                ["street"] = master.Student.Street,
                                ["buildingNumber"] = master.Student.BuildingNumber,
                                ["postalCode"] = master.Student.PostalCode,
                                ["floor"] = master.Student.Floor,
                                ["room"] = master.Student.Room,
                                ["landmark"] = master.Student.LandMark,
                                ["additionalInformation"] = master.Student.AdditionalInfo
                            },
                            ["type"] = master.Student.TypeID,
                            ["id"] = master.StudentID,
                            ["name"] = master.Student.ar_name
                        },
                        ["documentType"] = invoiceType.ToString(),
                        ["documentTypeVersion"] = version,
                        ["dateTimeIssued"] = dateTime,
                        ["taxpayerActivityCode"] = taxIssuer.ActivityCode,
                        ["internalID"] = master.StoreID + "_" + master.FlagId + "_" + master.InvoiceNumber,
                        ["purchaseOrderReference"] = "",
                        ["purchaseOrderDescription"] = "",
                        ["salesOrderReference"] = "",
                        ["salesOrderDescription"] = "",
                        ["proformaInvoiceNumber"] = "",
                        ["payment"] = new JsonObject
                        {
                            ["bankName"] = "",
                            ["bankAddress"] = "",
                            ["bankAccountNo"] = "",
                            ["bankAccountIBAN"] = "",
                            ["swiftCode"] = "",
                            ["terms"] = ""
                        },
                        ["delivery"] = new JsonObject
                        {
                            ["approach"] = "",
                            ["packaging"] = "",
                            ["dateValidity"] = "",
                            ["exportPort"] = "",
                            ["grossWeight"] = 0,
                            ["netWeight"] = 0,
                            ["terms"] = ""
                        },
                        ["invoiceLines"] = GenerateInvoiceLines(master.InventoryDetails),
                        ["totalDiscountAmount"] = 0,
                        ["totalSalesAmount"] = totalSalesAmount,
                        ["netAmount"] = totalSalesAmount,
                        ["taxTotals"] = "",
                        ["totalAmount"] = totalSalesAmount,
                        ["extraDiscountAmount"] = 0,
                        ["totalItemsDiscountAmount"] = 0,
                    }
                }
            };

            string serialize0 = Serialize(JObject.Parse(invoiceJson.ToJsonString()));
            string signWithCMS0 = SignWithCMS(Encoding.UTF8.GetBytes(serialize0), unitOfWork);

            if (string.IsNullOrEmpty(signWithCMS0))
            {
                return false;
            }

            string json = invoiceJson.ToJsonString();

            string signedJson = "{\"documents\": [" + json.Substring(0, json.Length - 1) + ",\"signatures\": [{\"signatureType\": \"I\",\"value\": \"" + signWithCMS0 + "\"}]}]}";

            File.WriteAllText(Path.Combine(invoices, $"{master.StoreID}_{master.FlagId}_{master.InvoiceNumber}.json"), JsonObject.Parse(signedJson)?.ToJsonString((new JsonSerializerOptions
            {
                WriteIndented = true
            })));

            return true;
        }

        private static JsonArray GenerateInvoiceLines(IEnumerable<InventoryDetails> items)
        {
            var array = new JsonArray();
            foreach (var item in items)
            {
                array.Add(CreateInvoiceLine(item));
            }
            return array;
        }

        private static JsonObject CreateInvoiceLine(InventoryDetails item)
        {
            return new JsonObject
            {
                ["description"] = $"{item.ShopItem.EnName} - {item.ShopItem.ArName}",
                ["itemType"] = item.ShopItem.ItemCode.StartsWith("EG")? "EGS": "GS1",
                ["itemCode"] = item.ShopItem.ItemCode,
                ["unitType"] = item.ShopItem.UnitType,
                ["quantity"] = item.Quantity,
                ["internalCode"] = item.ID,
                ["salesTotal"] = item.TotalPrice,
                ["total"] = item.TotalPrice,
                ["valueDifference"] = 0.00,
                ["totalTaxableFees"] = 0,
                ["netTotal"] = item.TotalPrice,
                ["itemsDiscount"] = 0,
                ["unitValue"] = new JsonObject
                {
                    ["currencySold"] = "EGP",
                    ["amountEGP"] = item.TotalPrice
                },
                ["discount"] = new JsonObject
                {
                    ["rate"] = 0,
                    ["amount"] = 0
                },
                ["taxableItems"] = new JsonArray
                {
                }
            };
        }

        public static List<Country> GetCountries(UOW unitofWork)
        {
            List<Country> countries = unitofWork.country_Repository.Select_All();
            return countries;
        }

        private static decimal GetTotalSalesAmount(IEnumerable<InventoryDetails> items)
        {
            decimal total = 0;
            foreach (var item in items)
            {
                total += item.TotalPrice;
            }
            return total;
        }

        public static string Serialize(JObject request)
        {
            return SerializeToken(request);
        }

        public static string SerializeToken(JToken request)
        {
            string serialized = "";

            if (request.Parent == null)
            {
                return SerializeToken(request.First);
            }
            else
            {
                if (request.Type == JTokenType.Property)
                {
                    string name = ((JProperty)request).Name.ToUpper();
                    serialized += "\"" + name + "\"";

                    foreach (var prop in request)
                    {
                        switch (prop.Type)
                        {
                            case JTokenType.Object:
                                serialized += SerializeToken(prop);
                                break;
                            case JTokenType.Boolean:
                            case JTokenType.Integer:
                                serialized += "\"" + prop.Value<string>() + "\"";
                                break;
                            case JTokenType.Float:
                                serialized += name == "RATE"
                                    ? "\"" + Dec2(prop.Value<string>()) + "\""
                                    : "\"" + Dec5(prop.Value<string>()) + "\"";
                                break;
                            case JTokenType.Date:
                                serialized += "\"" + ToStrDateTimeFormated(prop.Value<DateTime>()).Replace(" ", "T") + "Z\"";
                                break;
                            case JTokenType.String:
                                serialized += JsonConvert.ToString(prop.Value<string>());
                                break;
                            case JTokenType.Array:
                                foreach (var item in prop.Children())
                                {
                                    serialized += "\"" + ((JProperty)request).Name.ToUpper() + "\"";
                                    if (item.HasValues)
                                    {
                                        serialized += SerializeToken(item);
                                    }
                                    else
                                    {
                                        serialized += "\"" + item.Value<string>() + "\"";
                                    }
                                }
                                break;
                        }
                    }
                }
            }

            if (request.Type == JTokenType.Object)
            {
                foreach (var prop in request.Children())
                {
                    if (prop.Type == JTokenType.Object || prop.Type == JTokenType.Property)
                    {
                        serialized += SerializeToken(prop);
                    }
                }
            }

            return serialized;
        }

        public static string ToStrDateTimeFormated(DateTime dd)
        {
            return dd.ToString("yyyy-MM-dd HH:mm:ss");
        }

        public static string Login(School school)
        {
            try
            {
                var outgoingQueryString = System.Web.HttpUtility.ParseQueryString(string.Empty);
                outgoingQueryString.Add("grant_type", "client_credentials");
                outgoingQueryString.Add("client_id", school.ClientID);
                outgoingQueryString.Add("client_secret", school.SecretNumber1);
                outgoingQueryString.Add("scope", "InvoicingAPI");

                byte[] jsonDataBytes = Encoding.ASCII.GetBytes(outgoingQueryString.ToString());

                string result = PostRequest(new Uri(idSrvBaseUrl + "/connect/token"), jsonDataBytes, "application/x-www-form-urlencoded", "POST");

                var json = JsonConvert.DeserializeObject<dynamic>(result);
                access_token = json.access_token;

                return access_token;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public static string PostRequest(Uri uri, byte[] jsonDataBytes, string contentType, string method, string? accessToken = "")
        {
            try
            {
                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                string response;
                WebRequest request = WebRequest.Create(uri);
                request.ContentLength = jsonDataBytes.Length;
                request.ContentType = contentType;
                request.Method = method;
                request.Headers.Add(HttpRequestHeader.Authorization, "Bearer " + accessToken);

                using (Stream requestStream = request.GetRequestStream())
                {
                    requestStream.Write(jsonDataBytes, 0, jsonDataBytes.Length);
                    requestStream.Close();

                    using (Stream responseStream = request.GetResponse().GetResponseStream())
                    using (StreamReader reader = new StreamReader(responseStream))
                    {
                        response = reader.ReadToEnd();
                    }
                }
                return response;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public static string PostRequest(Uri uri, string jsonData, string contentType, string method, string? accessToken = "")
        {
            try
            {
                string response;
                WebRequest request = WebRequest.Create(uri);
                request.ContentLength = System.Text.Encoding.UTF8.GetByteCount(jsonData);
                request.ContentType = contentType;
                request.Method = method;
                request.Headers.Add(HttpRequestHeader.Authorization, "Bearer " + accessToken);

                using (StreamWriter requestStream = new StreamWriter(request.GetRequestStream()))
                {
                    requestStream.Write(jsonData);
                }

                using (HttpWebResponse httpResponse = (HttpWebResponse)request.GetResponse())
                using (StreamReader streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    response = streamReader.ReadToEnd();
                }

                return response;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        private static string PutRequest(string uri, string postData)
        {
            var client = new HttpClient();
            HttpResponseMessage response;

            try
            {
                client.BaseAddress = new Uri(apiBaseUrl);
                var byteArray = Encoding.UTF8.GetBytes(postData);

                using (HttpContent httpContent = new StringContent(postData))
                {
                    httpContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", access_token);

                    response = client.PutAsync(uri, httpContent).Result;
                    return response.Content.ReadAsStringAsync().Result;
                }
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        private static string GetRequest(string requestUrl)
        {
            try
            {
                var request = WebRequest.Create(requestUrl) as HttpWebRequest;
                request.Method = "GET";
                request.Headers.Add(HttpRequestHeader.Authorization, "Bearer " + access_token);
                request.ContentLength = 0;

                string responseContent = "";
                using (var response = request.GetResponse() as HttpWebResponse)
                using (var reader = new StreamReader(response.GetResponseStream()))
                {
                    responseContent = reader.ReadToEnd();
                }

                return responseContent;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public static string AuthenticatePOS(UOW unitOfWork, int _POSID)
        {
            try
            {
                ETAPOS pos = unitOfWork.pos_Repository.Select_By_Id(_POSID);

                if (pos == null)
                {
                    return "POS is not found";
                }

                deviceSerialNumber = pos.deviceSerialNumber;
                clientId = pos.ClientID.ToString();
                ClientSecret = pos.ClientSecret.ToString();
                ClientSecret2 = pos.ClientSecret2.ToString();

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(new Uri(idSrvBaseUrl + "/connect/token"));
                request.Method = "POST";
                request.ContentType = "application/x-www-form-urlencoded";

                // Add headers
                request.Headers.Add("posserial", deviceSerialNumber);
                request.Headers.Add("pososversion", "Windows");

                NameValueCollection outgoingQueryString = HttpUtility.ParseQueryString(string.Empty);
                outgoingQueryString.Add("grant_type", "client_credentials");
                outgoingQueryString.Add("client_id", clientId);
                outgoingQueryString.Add("client_secret", ClientSecret);

                byte[] jsonDataBytes = new ASCIIEncoding().GetBytes(outgoingQueryString.ToString());

                using (Stream stream = request.GetRequestStream())
                {
                    stream.Write(jsonDataBytes, 0, jsonDataBytes.Length);
                }

                WebResponse response = request.GetResponse();

                using (Stream dataStream = response.GetResponseStream())
                using (StreamReader reader = new StreamReader(dataStream))
                {
                    string responseFromServer = reader.ReadToEnd();
                    access_token = JsonConvert.DeserializeObject<dynamic>(responseFromServer)["access_token"];
                }

                response.Close();
                return access_token;
            }
            catch (Exception ex)
            {
                return(ex.Message);
            }
        }

        public static string receiptsubmissions(UOW unitOfWork, InventoryMaster master, long salesInvoiceId, bool getUUID = false)
        {
            string uuid = "";
            try
            {
                string totalSales = GetTotalSalesAmount(master.InventoryDetails).ToString();
                string itemData = "";

                string CurrencySign = "EGP";

                decimal totalTaxAmount = 0;

                string documentType = "S";
                string ReturnString = "";

                if (master.FlagId == 12)
                {
                    documentType = "R";
                    if (salesInvoiceId != 0)
                        uuid = unitOfWork.inventoryMaster_Repository.First_Or_Default(x => x.ID == salesInvoiceId)?.uuid;
                    else
                        return "Please enter the slaes invoice ID";

                    ReturnString = """referenceUUID"":""" + uuid + @""",";
                }

                decimal Weight = 0;
                decimal MyTotal = 0;

                foreach (var item in master.InventoryDetails)
                {
                    MyTotal += Convert.ToDecimal(Dec5(item.TotalPrice.ToString()));

                    itemData += $@"{{
                    ""internalCode"": ""{item.ID}"",
                    ""description"": ""{item.ShopItem.EnName.ToString().Replace("*", "X")}"",
                    ""itemType"": ""{(item.ShopItem.ItemCode.ToString().StartsWith("EG") ? "EGS" : "GS1")}"",
                    ""itemCode"": ""{item.ShopItem.ItemCode}"",
                    ""unitType"": ""{item.ShopItem.UnitType}"",
                    ""quantity"": {item.Quantity},
                    ""unitPrice"": {Dec5(item.Price.ToString())},
                    ""netSale"": {Dec5(item.TotalPrice.ToString())},
                    ""totalSale"": {Dec5(item.Price.ToString())},
                    ""total"": {Dec5(item.TotalPrice.ToString())},
                    ""taxableItems"": [";

                    itemData = itemData.TrimEnd(',') + "]},";
                }

                itemData = itemData.TrimEnd(',');

                string dateTimeIssued = DateTime.Now.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ");

                string json = $@"
                {{
                    ""header"": {{
                        ""dateTimeIssued"": ""{dateTimeIssued}"",
                        ""receiptNumber"": ""{master.StoreID}_{master.FlagId}_{master?.InvoiceNumber}"",
                        ""uuid"": ""{uuid}"",
                        {ReturnString}
                        ""previousUUID"": """",
                        ""referenceOldUUID"": """",
                        ""currency"": ""{CurrencySign}"",
                        ""exchangeRate"": 0
                    }},
                    ""documentType"": {{
                        ""receiptType"": ""{documentType}"",
                        ""typeVersion"": ""1.2""
                    }},
                    ""seller"": {{
                        ""branchAddress"": {{
                            ""country"": ""{master.TaxIssuer?.CountryCode}"",
                            ""governate"": ""{master.TaxIssuer?.Governate}"",
                            ""regionCity"": ""{master.TaxIssuer?.RegionCity}"",
                            ""street"": ""{master.TaxIssuer?.Street}"",
                            ""buildingNumber"": ""{master.TaxIssuer?.BuildingNumber}"",
                            ""postalCode"": ""{master.TaxIssuer?.PostalCode}"",
                            ""floor"": ""{master.TaxIssuer?.Floor}"",
                            ""room"": ""{master.TaxIssuer?.Room}"",
                            ""landmark"": ""{master.TaxIssuer?.LandMark}"",
                            ""additionalInformation"": ""{master.TaxIssuer?.AdditionalInfo}""
                        }},
                        ""rin"": ""{master.TaxIssuer?.ID}"",
                        ""companyTradeName"": ""{master.TaxIssuer?.Name}"",
                        ""branchCode"": ""{master.TaxIssuer?.BranchID}"",
                        ""activityCode"": ""{master.TaxIssuer?.ActivityCode}"",
                        ""deviceSerialNumber"": ""{deviceSerialNumber}""
                    }},
                    ""buyer"": {{
                        ""type"": ""{master.Student.TypeID}"",
                        ""id"": ""{master.Student.ID}"",
                        ""name"": ""{master.Student.ar_name}"",
                        ""mobileNumber"": ""{master.Student.Phone}"",
                        ""paymentNumber"": ""{master.Student.NationalID}""
                    }},
                    ""itemData"": [{itemData}],
                    ""totalSales"": {Dec5(totalSales)},
                    ""totalCommercialDiscount"": {Dec5("0")},
                    ""totalItemsDiscount"": {Dec5("0")},
                    ""netAmount"": {Dec5(totalSales)},
                    ""totalAmount"": {Dec5(totalSales)},
                    ""taxTotals"": """",
                    ""paymentMethod"": ""C""
                }}";

                string serialize0 = Serialize(JObject.Parse(JsonNode.Parse(json).ToJsonString()));

                using (SHA256 sha256 = SHA256.Create())
                {
                    byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(serialize0));
                    uuid = string.Concat(hashBytes.Select(b => b.ToString("x2")));
                }

                master.uuid = uuid;

                unitOfWork.inventoryMaster_Repository.Update(master);
                unitOfWork.SaveChanges();

                if (getUUID)
                {
                    return $"http://invoicing.eta.gov.eg/receipts/search/{uuid}/share/{dateTimeIssued}#Total:{Dec2(Convert.ToDecimal(master.Total).ToString() + totalTaxAmount)},IssuerRIN:{master.TaxIssuer?.ID}";
                }

                json = json.Replace(@"""uuid"": """"", $@"""uuid"": ""{uuid}""");
                byte[] jsonDataBytes = Encoding.UTF8.GetBytes($@"{{""receipts"": [{json.TrimEnd('}')}]}}");

                string result = PostRequest(new Uri(apiBaseUrl + "/api/v1/receiptsubmissions"), jsonDataBytes, "application/json", "POST");

                if (string.IsNullOrEmpty(result))
                {
                    master.IsValid = 0;
                    master.Status = "Failed";

                    unitOfWork.inventoryMaster_Repository.Update(master);
                    unitOfWork.SaveChanges();

                    return "Failed to submit receipt.";
                }

                dynamic result0 = JsonConvert.DeserializeObject(result);

                if (result0?.acceptedDocuments != null && result0?.acceptedDocuments.Count > 0)
                {

                    master.IsValid = 1;
                    master.Status = "Valid";
                    master.ShareLongId = result0?.acceptedDocuments[0].longId;
                    master.EtaInsertedDate = DateTime.Parse(dateTimeIssued);

                    unitOfWork.inventoryMaster_Repository.Update(master);
                    unitOfWork.SaveChanges();
                }

                if (result0?.rejectedDocuments != null && result0?.rejectedDocuments.Count > 0)
                {
                    StringBuilder msg = new();
                    foreach (var detail in result0?.rejectedDocuments[0]?.error?.details)
                    {
                        msg.Append($"{detail.propertyPath} - {detail.message}\r\n");
                    }

                    master.ETAErrorMsg = msg.ToString();

                    unitOfWork.inventoryMaster_Repository.Update(master);
                    unitOfWork.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                return ex.Message;
            }

            return "";
        }

        private static string Dec2(string value)
        {
            return string.Format("{0:0.00}", Convert.ToDecimal(value));
        }

        private static string Dec5(string value)
        {
            return string.Format("{0:0.00000}", Convert.ToDecimal(value));
        }

        private static string SignWithCMS(byte[] data, UOW unitOfWork)
        {
            try
            {
                var factories = new Pkcs11InteropFactories();
                var pkcs11Library = factories.Pkcs11LibraryFactory.LoadPkcs11Library(factories, DllLibPath, Net.Pkcs11Interop.Common.AppType.MultiThreaded);

                var slot = pkcs11Library.GetSlotList(Net.Pkcs11Interop.Common.SlotsType.WithTokenPresent).FirstOrDefault();
                if (slot == null)
                {
                    return "No slots found";
                }

                var session = slot.OpenSession(Net.Pkcs11Interop.Common.SessionType.ReadWrite);
                try
                {
                    session.Login(Net.Pkcs11Interop.Common.CKU.CKU_USER, Encoding.UTF8.GetBytes(TokenPin));
                }
                catch { }

                var certAttributes = new List<IObjectAttribute>
                {
                    session.Factories.ObjectAttributeFactory.Create(Net.Pkcs11Interop.Common.CKA.CKA_CLASS, Net.Pkcs11Interop.Common.CKO.CKO_CERTIFICATE),
                    session.Factories.ObjectAttributeFactory.Create(Net.Pkcs11Interop.Common.CKA.CKA_TOKEN, true),
                    session.Factories.ObjectAttributeFactory.Create(Net.Pkcs11Interop.Common.CKA.CKA_CERTIFICATE_TYPE, Net.Pkcs11Interop.Common.CKC.CKC_X_509)
                };

                var certificate = session.FindAllObjects(certAttributes).FirstOrDefault();
                if (certificate == null)
                {
                    return "Certificate not found";
                }

                var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
                store.Open(OpenFlags.MaxAllowed);

                var foundCerts = new X509Certificate2Collection();
                var certsIssuerNames = unitOfWork.certificatesIssuerName_Repository.FindBy(x => x.IsDeleted != true);

                foreach (var cert in certsIssuerNames)
                {
                    foundCerts = store.Certificates.Find(X509FindType.FindByIssuerName, cert.Name, true);
                    if (foundCerts.Count > 0) break;
                }

                if (foundCerts.Count == 0)
                {
                    return "No Device Detected";
                }

                var certForSigning = foundCerts[0];
                store.Close();

                var content = new ContentInfo(new Oid("1.2.840.113549.1.7.5"), data);
                var cms = new SignedCms(content, true);

                var bouncyCertificate = new EssCertIDv2(
                    new Org.BouncyCastle.Asn1.X509.AlgorithmIdentifier(new DerObjectIdentifier("1.2.840.113549.1.9.16.2.47")),
                    HashBytes(certForSigning.RawData)
                );
                var signerCertV2 = new SigningCertificateV2(new[] { bouncyCertificate });

                var signer = new CmsSigner(certForSigning)
                {
                    DigestAlgorithm = new Oid("2.16.840.1.101.3.4.2.1")
                };
                signer.SignedAttributes.Add(new Pkcs9SigningTime(DateTime.UtcNow));
                signer.SignedAttributes.Add(new AsnEncodedData(
                    new Oid("1.2.840.113549.1.9.16.2.47"),
                    signerCertV2.GetEncoded()
                ));

                cms.ComputeSignature(signer);
                var output = cms.Encode();
                return Convert.ToBase64String(output);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public static byte[] HashBytes(byte[] input)
        {
            using (var sha = SHA256.Create())
            {
                return sha.ComputeHash(input);
            }
        }
    }

    //Public uuidUrl As String = "https://invoicing.eta.gov.eg/receipts/details/"
    //Public printUrl As String = "https://invoicing.eta.gov.eg/receipts/details/print/"
    //Public apiBaseUrl As String = "https://api.invoicing.eta.gov.eg"
    //Public idSrvBaseUrl As String = "https://id.eta.gov.eg"
    //Public receiptsSearch As String = "http://invoicing.eta.gov.eg/receipts/search/"
}
