import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from 'jspdf';

const RecentAccessDoors = ({ accessRecords, companyName }) => {
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredRecords, setFilteredRecords] = useState(accessRecords);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const currentRecords = filteredRecords.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  // Auto filter records when date is selected
  const handleDateChange = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);
  
    if (!selected) {
      setFilteredRecords(accessRecords); // Reset to all records
      setCurrentPage(0);
      return;
    }
  
    const selectedDay = new Date(selected);
    const filtered = accessRecords.filter((record) => {
      const entryDate = new Date(record.entryTime);
      return entryDate.toDateString() === selectedDay.toDateString();
    });
  
    setFilteredRecords(filtered);
    setCurrentPage(0);
  };  

  const handleGenerateReport = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
  
    if (filteredRecords.length === 0) {
      toast.error('No records found for selected date');
      return;
    }
  
    // Create the jsPDF instance with A4 size
    const doc = new jsPDF('landscape', 'mm', 'a4'); // 'portrait' is the default orientation, and 'a4' is the page size
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
  
    // Header
    doc.setFontSize(24);
    const companyText = companyName || "Unknown Company";
    const textWidth = doc.getTextWidth(companyText);
    doc.setTextColor(0, 0, 255);
    doc.setFont("helvetica", "bold");
    doc.text(companyText, (pageWidth - textWidth) / 2, 20);
  
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text("Access Records Report", 20, 30);
  
    // Calculate X position for "Date: {selectedDate}" to appear on the right side
    const titleWidth = doc.getTextWidth("Access Records Report");
    const dateX = pageWidth - doc.getTextWidth(`Date: ${selectedDate}`); // Right-aligned with some padding
    doc.setFontSize(12);
    doc.text(`Date: ${selectedDate}`, dateX, 30);
  
    // Table headers
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 45, 260, 10, 'F');
    doc.text("Door Code", 20, 50);
    doc.text("Room Name", 50, 50);
    doc.text("Location", 90, 50);
    doc.text("User", 130, 50);
    doc.text("Entry Time", 170, 50);
    doc.text("Exit Time", 220, 50);
  
    // Table rows
    let rowY = 60;
    filteredRecords.forEach((record, index) => {
      doc.setFillColor(index % 2 === 0 ? 255 : 245, 245, 245);
      doc.rect(20, rowY, 260, 10, 'F');
  
      doc.text(record.doorCode, 20, rowY + 5);
      doc.text(record.roomName, 50, rowY + 5);
      doc.text(record.location, 90, rowY + 5);
      doc.text(record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Unknown User', 130, rowY + 5);
      doc.text(new Date(record.entryTime).toLocaleString(), 170, rowY + 5);
      doc.text(record.exitTime ? new Date(record.exitTime).toLocaleString() : 'Still in the room', 220, rowY + 5);
  
      rowY += 12;
    });
  
    // Footer
    doc.setFontSize(10);
    const footerY = rowY + 10;
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, footerY);
  
    // Add "SecurePass AI" to bottom-right corner
    const footerText = "SecurePass AI";
    const footerTextWidth = doc.getTextWidth(footerText);
    const footerTextX = pageWidth - footerTextWidth - 20; // Right-aligned with some padding
    doc.setFontSize(10);
    doc.text(footerText, footerTextX, footerY);
  
    // Save the generated PDF
    doc.save("Access_Records_Report.pdf");
    toast.success('Report Generated');
  };
  
  return (
    <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
      <ToastContainer />
      <div className="flex justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold dark:text-slate-100 mb-4">Recent Access</h2>

        <div className="flex items-center gap-2">
          <label className="text-slate-600 dark:text-slate-300">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border dark:border-none px-4 py-2 rounded dark:bg-slate-700 dark:text-slate-300"
          />
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Table */}
      <div>
        <table className="w-full mt-4 bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="text-left bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-slate-400">
              <th className="p-4">Door Code</th>
              <th className="p-4">Room Name</th>
              <th className="p-4">Location</th>
              <th className="p-4">User</th>
              <th className="p-4">Entry Time</th>
              <th className="p-4">Exit Time</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((record, index) => (
                <tr key={index} className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.doorCode}</td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.roomName}</td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.location}</td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                    {record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Unknown User'}
                  </td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">{new Date(record.entryTime).toLocaleString()}</td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.exitTime ? new Date(record.exitTime).toLocaleString() : 'Still in the room'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-slate-500 dark:text-slate-300">
                  No access records found for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded ${currentPage === 0 ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed' : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'}`}
        >
          Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(index)}
              className={`px-3 py-1 rounded ${currentPage === index ? 'bg-blue-700 dark:bg-slate-800 text-white' : 'bg-gray-200 dark:bg-slate-500 dark:text-gray-100 text-gray-600 hover:bg-gray-300'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded ${currentPage === totalPages - 1 ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed' : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RecentAccessDoors;
