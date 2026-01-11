using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using System.Text.RegularExpressions;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataImportController : ControllerBase
    {
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            string fileName = file.FileName.ToLower();
            bool isExcel = fileName.EndsWith(".xlsx") || fileName.EndsWith(".xls");
            bool isCsv = fileName.EndsWith(".csv");

            if (!isExcel && !isCsv)
                return BadRequest(new { message = "Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed" });

            try
            {
                if (isExcel)
                {
                    return await ProcessExcelFile(file);
                }
                else
                {
                    return await ProcessCsvFile(file);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error processing file: {ex.Message}" });
            }
        }

        private async Task<IActionResult> ProcessExcelFile(IFormFile file)
        {
            // Set the EPPlus license context
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[0];

            if (worksheet.Dimension == null)
                return BadRequest(new { message = "Excel file is empty" });

            var rows = new List<Dictionary<string, object>>();
            var headers = new List<string>();

            // Read headers from the first row
            for (int col = 1; col <= worksheet.Dimension.End.Column; col++)
            {
                var headerValue = worksheet.Cells[1, col].Value?.ToString() ?? $"Column_{col}";
                headers.Add(headerValue);
            }

            // Read data from rows 2 onwards
            for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
            {
                var rowData = new Dictionary<string, object>();
                for (int col = 1; col <= worksheet.Dimension.End.Column; col++)
                {
                    var cellValue = worksheet.Cells[row, col].Value;
                    rowData[headers[col - 1]] = cellValue ?? "";
                }
                rows.Add(rowData);
            }

            return Ok(new
            {
                headers = headers,
                data = rows,
                totalRows = rows.Count
            });
        }

        private async Task<IActionResult> ProcessCsvFile(IFormFile file)
        {
            var rows = new List<Dictionary<string, object>>();
            var headers = new List<string>();

            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                // Read header line (first row)
                string? headerLine = await reader.ReadLineAsync();
                if (string.IsNullOrEmpty(headerLine))
                    return BadRequest(new { message = "CSV file is empty" });

                // Parse headers - handle quoted values and commas within quotes
                headers = ParseCsvLine(headerLine);

                // Read data rows
                string? dataLine;
                while ((dataLine = await reader.ReadLineAsync()) != null)
                {
                    if (string.IsNullOrWhiteSpace(dataLine))
                        continue;

                    var values = ParseCsvLine(dataLine);
                    var rowData = new Dictionary<string, object>();

                    // Map values to headers
                    for (int i = 0; i < headers.Count; i++)
                    {
                        rowData[headers[i]] = i < values.Count ? values[i] : "";
                    }

                    rows.Add(rowData);
                }
            }

            return Ok(new
            {
                headers = headers,
                data = rows,
                totalRows = rows.Count
            });
        }

        private List<string> ParseCsvLine(string line)
        {
            var values = new List<string>();
            var currentValue = new System.Text.StringBuilder();
            bool insideQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    if (insideQuotes && i + 1 < line.Length && line[i + 1] == '"')
                    {
                        // Escaped quote
                        currentValue.Append('"');
                        i++;
                    }
                    else
                    {
                        // Toggle quote state
                        insideQuotes = !insideQuotes;
                    }
                }
                else if (c == ',' && !insideQuotes)
                {
                    // End of field
                    values.Add(currentValue.ToString().Trim());
                    currentValue.Clear();
                }
                else
                {
                    currentValue.Append(c);
                }
            }

            // Add the last value
            values.Add(currentValue.ToString().Trim());

            return values;
        }
    }
}
