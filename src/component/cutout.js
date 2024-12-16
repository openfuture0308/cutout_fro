import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css"; // Ensure this is imported
import { registerAllModules } from "handsontable/registry";
import axios from "axios";
import { HyperFormula } from "hyperformula";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { download } from "../utiles/download";

registerAllModules();

export const CutOut = () => {
  const [data, setData] = useState([]);
  const [plantName, SetPlantName] = useState("Select Plant");
  const [isUpdatable, SetIsUpdatable] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    SetPlantName("Select Plant");
  }, [data]);

  const hyperformulaInstance = HyperFormula.buildEmpty({
    licenseKey: "internal-use-in-handsontable",
  });
  // const generateColumnHeaders = (numColumns) => {
  //   const headers = [];
  //   for (let i = 0; i < numColumns; i++) {
  //     let columnHeader = "";
  //     let index = i;
  //     while (index >= 0) {
  //       columnHeader = String.fromCharCode((index % 26) + 65) + columnHeader;
  //       index = Math.floor(index / 26) - 1;
  //     }
  //     headers.push(columnHeader);
  //   }
  //   return headers;
  // };

  const handleChangeOnPlant = (e) => {
    SetPlantName(e.target.value);
  };
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name); // Save the file name
      // Proceed with your upload logic
    }
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });

        // Get the first sheet
        const sheetName =
          workbook.SheetNames.length > 1
            ? workbook.SheetNames[1]
            : workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Ensure data has 52 columns by padding empty values
        const paddedData = jsonData.map((row) => {
          const newRow = [...row];
          while (newRow.length < 52) {
            newRow.push(null);
          }
          return newRow;
        });
        setData(paddedData);
        SetIsUpdatable(0);
      };
      reader.readAsBinaryString(file);
    }
  };

  const uploadExcel = () => {
    if (plantName === "Select Plant") {
      toast.error("You didn't select the correct Plant Name!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return;
    } else {
      // Convert data back to worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      // Convert workbook to binary and create a Blob
      const workbookBinary = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const workbookBlob = new Blob([workbookBinary], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      var formData = new FormData();
      formData.append("cutout", workbookBlob, "cutout.xlsx"); // Provide a filename
      formData.append("plant_name", plantName);
      axios
        .post(`/api/cutout/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (typeof res.data.msg == "string") {
            toast.error("You already uploaded this data!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: true,
            });
            return 0;
          }
          setData(res.data.msg);
          SetIsUpdatable(1);

          toast.success(
            "You uploaded this data successfully! Please check your uploaded result",
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
            }
          );
        })
        .catch((error) => {
          console.error(error);
          toast.error("Something was wrong data!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          });
        });
    }
  };

  const updateExcel = () => {
    if (isUpdatable !== 2) {
      toast.error("You didn't anything change!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return 0;
    } else {
      console.log(data);
      axios
        .put(`/api/cutout/`, { data: data })
        .then((res) => {
          toast.success("Your data was updated successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          });
          SetIsUpdatable(1);
        })
        .catch((error) => {
          console.error(error);
          toast.error("Something was wrong!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          });
          SetIsUpdatable(1);
        });
    }
  };
  return (
    <div style={{ padding: "20px" }}>
      {data.length > 0 ? (
        <>
          <ToastContainer />
          <div
            style={{
              marginTop: "20px",
              height: "500px",
              overflow: "auto", // Enables scrolling
              border: "1px solid #ddd",
            }}
          >
            <HotTable
              licenseKey="non-commercial-and-evaluation" // Free license
              data={data}
              colHeaders={true}
              rowHeaders={true}
              filters={true}
              dropdownMenu={true}
              multiColumnSorting={true}
              width="100%"
              height="100%"
              manualColumnResize={true} // Enable column resizing
              formulas={{
                engine: hyperformulaInstance,
              }}
              afterChange={(changes) => {
                if (changes) {
                  const updatedData = [...data];
                  changes.forEach(([row, col, oldValue, newValue]) => {
                    updatedData[row][col] = newValue;
                  });
                  setData(updatedData);
                  if (isUpdatable > 0) {
                    SetIsUpdatable(2);
                  }
                }
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "20px",
            }}
          >
            {/* Group for the first three items */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Left-aligned File Input Button (taking up half the width) */}
              <div
                className="input-group"
                style={{ flex: "0 0 50%", height: "38px" }}
              >
                <label
                  className="input-group-text btn btn-primary"
                  htmlFor="fileInput"
                >
                  Choose 1aCutOut File
                </label>
                <input
                  type="file"
                  id="fileInput"
                  className="form-control"
                  style={{ display: "none" }} // Hide the default file input
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                />
                <div
                  className="form-control"
                  style={{
                    height: "38px",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {selectedFileName || "No file chosen"}
                </div>
              </div>

              {/* Right-aligned Buttons and Select Dropdown */}
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <button
                  className="btn btn-primary btn-md"
                  style={{ height: "38px" }}
                  onClick={uploadExcel}
                >
                  Create
                </button>
                <select
                  value={plantName}
                  onChange={handleChangeOnPlant}
                  className="form-select"
                  style={{ height: "38px" }}
                >
                  <option value="Select Plant">Select Plant</option>
                  <option value="CPM">CPM</option>
                  <option value="BMP">BMP</option>
                  <option value="PFF">PFF</option>
                  <option value="BVY">BVY</option>
                  <option value="LNTZ">LNTZ</option>
                </select>
                <button
                  className="btn btn-success btn-md"
                  style={{ height: "38px" }}
                  onClick={updateExcel}
                >
                  Update
                </button>
              </div>
            </div>

            {/* Download button */}
            <button
              className="btn btn-danger"
              style={{ height: "38px", marginLeft: "10px" }} // Matching height and margin
              onClick={() => download(data)}
            >
              Download
            </button>
          </div>
        </>
      ) : (
        <div className="input-group mb-3">
          <label
            className="input-group-text btn btn-primary"
            htmlFor="fileInput"
          >
            Choose File
          </label>
          <input
            type="file"
            id="fileInput"
            className="form-control"
            style={{ display: "none" }} // Hide the default file input
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <div className="form-control" style={{ pointerEvents: "none" }}>
            {selectedFileName || "No file chosen"}
          </div>
        </div>
      )}
    </div>
  );
};
