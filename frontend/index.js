document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch data from the backend
    const response = await fetch("http://localhost:3001/data");
    const data = await response.json();
    let filteredData = [...data]; // Copy original data for filtering

    // DOM Elements
    const leaderboardBody = document.getElementById("leaderboard-body");
    const sectionFilter = document.getElementById("section-filter");
    const pinnedRow = document.getElementById("pinned-row");

    // Function to pin a row at the top
    const pinRow = (row) => {
      if (row) {
        row.style.position = "sticky";
        row.style.top = "0";
        row.style.backgroundColor = "white";
        row.style.zIndex = "1";
      }
    };

    // Call pinRow for the pinned-row element
    pinRow(pinnedRow);

    // Scroll behavior for pinned row
    pinnedRow?.addEventListener("click", () => {
      window.scrollTo(0, 1);
    });

    // Function to compare rows and identify differences
    function compareRows(row1, row2) {
      const columns = [
        "rank",
        "rollNumber",
        "name",
        "section",
        "totalSolved",
        "easy",
        "medium",
        "hard",
      ];
      const differences = [];

      columns.forEach((column) => {
        if (row1[column] !== row2[column]) {
          differences.push({
            column,
            value1: row1[column],
            value2: row2[column],
          });
        }
      });

      return differences;
    }

    // Populate the section filter dropdown
    const populateSectionFilter = () => {
      const sections = [
        ...new Set(data.map((student) => student.section || "N/A")),
      ].sort();

      sectionFilter.innerHTML = '<option value="all">All Sections</option>';
      sections.forEach((section) => {
        const option = document.createElement("option");
        option.value = section;
        option.textContent = section;
        sectionFilter.appendChild(option);
      });
    };

    // Export leaderboard data to CSV
    const exportToCSV = (data) => {
      const headers = [
        "Rank",
        "Roll Number",
        "Name",
        "Section",
        "Total Solved",
        "Easy",
        "Medium",
        "Hard",
        "LeetCode URL",
      ];
      const csvRows = data.map((student, index) => {
        return [
          index + 1,
          student.roll,
          student.name,
          student.section || "N/A",
          student.totalSolved || "N/A",
          student.easySolved || "N/A",
          student.mediumSolved || "N/A",
          student.hardSolved || "N/A",
          student.url,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "leaderboard.csv");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Render leaderboard data in the table
    const renderLeaderboard = (sortedData) => {
      leaderboardBody.innerHTML = "";
      sortedData.forEach((student, index) => {
        const row = document.createElement("tr");
        row.classList.add("border-b", "border-gray-700");
        row.innerHTML = `
          <td class="p-4">${index + 1}</td>
          <td class="p-4">${student.roll}</td>
          <td class="p-4">
            ${
              student.url.startsWith("https://leetcode.com/u/")
                ? `<a href="${student.url}" target="_blank" class="text-blue-400">${student.name}</a>`
                : `<div class="text-red-500">${student.name}</div>`
            }
          </td>
          <td class="p-4">${student.section || "N/A"}</td>
          <td class="p-4">${student.totalSolved || "N/A"}</td>
          <td class="p-4 text-green-400">${student.easySolved || "N/A"}</td>
          <td class="p-4 text-yellow-400">${student.mediumSolved || "N/A"}</td>
          <td class="p-4 text-red-400">${student.hardSolved || "N/A"}</td>
        `;
        leaderboardBody.appendChild(row);
      });
    };

    // Filter leaderboard data by section
    const filterData = (section) => {
      filteredData =
        section === "all"
          ? [...data]
          : data.filter((student) => (student.section || "N/A") === section);
      renderLeaderboard(filteredData);
    };

    // Sort leaderboard data by specified field
    const sortData = (data, field, direction, isNumeric = false) => {
      return data.sort((a, b) => {
        const valA = a[field] || (isNumeric ? 0 : "Z");
        const valB = b[field] || (isNumeric ? 0 : "Z");
        if (isNumeric) {
          return direction === "desc" ? valB - valA : valA - valB;
        } else {
          return direction === "desc"
            ? valB.toString().localeCompare(valA.toString())
            : valA.toString().localeCompare(valB.toString());
        }
      });
    };

    // Initialize the leaderboard
    populateSectionFilter();
    renderLeaderboard(data);

    // Event listeners
    sectionFilter.addEventListener("change", (e) => {
      filterData(e.target.value);
    });

    document.getElementById("export-btn").addEventListener("click", () => {
      exportToCSV(filteredData); // Export only filtered data
    });

    document.getElementById("sort-total").addEventListener("click", () => {
      const direction = totalSolvedDirection === "desc" ? "asc" : "desc";
      totalSolvedDirection = direction;
      const sortedData = sortData(filteredData, "totalSolved", direction, true);
      renderLeaderboard(sortedData);
    });

    // Additional sorting event listeners go here...
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
