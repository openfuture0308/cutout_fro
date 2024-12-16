import * as XLSX from "xlsx";

export const download = (data) => {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const workbookBinary = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const workbookBlob = new Blob([workbookBinary], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const downloadExcel = (blob, filename) => {
    const blobURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobURL);
  };

  downloadExcel(workbookBlob, "MyExcelFile.xlsx");
};