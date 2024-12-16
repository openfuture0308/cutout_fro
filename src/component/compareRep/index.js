import React, { useState } from "react";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";
import axios from "axios";
import { HyperFormula } from "hyperformula";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { download } from "../../utiles/download";

registerAllModules();

const standarzation = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensures 2 digits for month
  const day = date.getDate().toString().padStart(2, "0"); // Ensures 2 digits for day
  const year = date.getFullYear();
  const formattedDate = `${month}-${day}-${year}`;
  return formattedDate;
};

export const CompareReport = () => {
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const hyperformulaInstance = HyperFormula.buildEmpty({
    licenseKey: "internal-use-in-handsontable",
  });

  const getReport = (e) => {
    e.preventDefault();
    const fDate = new Date(fromDate);
    const eDate = new Date(endDate);
    if (fDate >= eDate) {
      toast.error("You didn't set the correct date range!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return;
    }
    axios
      .post(`/api/plant_compare/`, {
        start_date: standarzation(fDate),
        end_date: standarzation(eDate),
      })
      .then((res) => {
        toast.success("You get report successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
        });
        setData(res.data.msg);
      })
      .catch((error) => {
        toast.error("Confirm period!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
        });
        console.log(error);
      });
  };

  return (
    <div>
      <ToastContainer />
      <div className="d-flex align-items-center mt-4 ms-4">
        <button className="btn btn-primary me-3" onClick={getReport}>
          Make Report
        </button>
        <p className="mb-0">From:</p>
        <DatePicker
          selected={fromDate}
          onChange={(date) => setFromDate(date)}
          className="form-control ml-2 mr-2"
          dateFormat="MM-dd-yyyy" // Format as required
        />
        <p className="mb-0">To:</p>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          className="form-control mr-0"
          dateFormat="MM-dd-yyyy" // Format as required
        />
      </div>
      {data.length > 0 && (
        <>
          <div
            style={{
              marginTop: "20px",
              height: "500px",
              overflow: "auto", // Enables scrolling
              border: "1px solid #ddd",
            }}
          >
            <HotTable
              style={{ zIndex: -1 }}
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
                }
              }}
            />
          </div>
        </>
      )}
      <button
        className="btn btn-danger mt-4 ms-4"
        onClick={() => download(data)}
      >
        Download Report
      </button>
    </div>
  );
};
