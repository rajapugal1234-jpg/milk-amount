
// ==========================================
// MILK ACCOUNT MANAGER PRO
// COMPLETE JAVASCRIPT
// ==========================================

"use strict";

// ==========================================
// BASIC SETTINGS
// ==========================================

const MILK_RATE = 45;

const MEMBERS_KEY = "milkManager_members_v1";
const RECORDS_KEY = "milkManager_records_v1";


// ==========================================
// LOAD SAVED DATA
// ==========================================

function loadJSON(key, fallback) {

    try {

        const value = JSON.parse(localStorage.getItem(key));

        return Array.isArray(value) ? value : fallback;

    } catch {

        return fallback;

    }

}

let members = loadJSON(MEMBERS_KEY, []);
let records = loadJSON(RECORDS_KEY, []);

let selectedDate = todayString();

let calendarMonth = new Date();

let editingRecordId = null;


// ==========================================
// HTML ELEMENTS
// ==========================================

const $ = id => document.getElementById(id);

const el = {

    todayDate: $("todayDate"),

    memberCount: $("memberCount"),

    selectedMilk: $("selectedMilk"),

    selectedAmount: $("selectedAmount"),

    memberForm: $("memberForm"),

    memberName: $("memberName"),

    memberList: $("memberList"),

    calendar: $("calendar"),

    calendarMonth: $("calendarMonth"),

    prevMonth: $("prevMonth"),

    nextMonth: $("nextMonth"),

    selectedDateTitle: $("selectedDateTitle"),

    entryModeText: $("entryModeText"),

    dateTag: $("dateTag"),

    entryForm: $("entryForm"),

    memberSelect: $("memberSelect"),

    quantity: $("quantity"),

    amount: $("amount"),

    saveEntry: $("saveEntry"),

    recordsTitle: $("recordsTitle"),

    entryCount: $("entryCount"),

    dailyRecords: $("dailyRecords"),

    reportMonth: $("reportMonth"),

    monthlyReport: $("monthlyReport"),

    grandTotal: $("grandTotal"),

    exportBtn: $("exportBtn"),

    printBtn: $("printBtn")

};


// ==========================================
// DATE FUNCTIONS
// ==========================================

function todayString() {

    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

}


function formatDate(value) {

    return new Date(value + "T00:00:00").toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function money(value) {

    return "₹" + Number(value || 0).toFixed(2);

}


function makeId() {

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8);

}


// ==========================================
// SAVE DATA TO BROWSER
// ==========================================

function saveData() {

    localStorage.setItem(
        MEMBERS_KEY,
        JSON.stringify(members)
    );

    localStorage.setItem(
        RECORDS_KEY,
        JSON.stringify(records)
    );

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    }[char]));

}


// ==========================================
// QUANTITY OPTIONS
// ==========================================

function buildQuantityOptions() {

    el.quantity.innerHTML = `
        <option value="0">No Milk</option>
    `;

    for (let ml = 100; ml <= 5000; ml += 100) {

        const option = document.createElement("option");

        option.value = String(ml);

        option.textContent = ml >= 1000
            ? `${(ml / 1000).toFixed(1)} L`
            : `${ml} ml`;

        el.quantity.appendChild(option);

    }

}


// ==========================================
// AUTOMATIC AMOUNT CALCULATION
// ==========================================

function calculateAmount() {

    const ml = Number(el.quantity.value || 0);

    const total = (ml / 1000) * MILK_RATE;

    el.amount.value = total.toFixed(2);

    el.selectedMilk.textContent =
        (ml / 1000).toFixed(2) + " L";

    el.selectedAmount.textContent = money(total);

}


// ==========================================
// MEMBER MANAGEMENT
// ==========================================

function renderMembers() {

    el.memberList.innerHTML = "";

    el.memberCount.textContent = members.length;


    if (members.length === 0) {

        el.memberList.innerHTML = `
            <p class="empty-message">
                No members added yet.
            </p>
        `;

    }


    members.forEach(member => {

        const chip = document.createElement("div");

        chip.className = "member-chip";

        chip.innerHTML = `
            <span>${escapeHTML(member.name)}</span>
        `;


        const remove = document.createElement("button");

        remove.type = "button";

        remove.className = "remove-member";

        remove.textContent = "×";

        remove.title = "Remove member";


        remove.addEventListener("click", function () {

            deleteMember(member.id);

        });


        chip.appendChild(remove);

        el.memberList.appendChild(chip);

    });


    // Update member dropdown

    el.memberSelect.innerHTML = `
        <option value="">Select Member</option>
    `;


    members.forEach(member => {

        const option = document.createElement("option");

        option.value = member.id;

        option.textContent = member.name;

        el.memberSelect.appendChild(option);

    });

}


// ==========================================
// ADD MEMBER
// ==========================================

function addMember(event) {

    event.preventDefault();

    const name = el.memberName.value.trim();

    if (!name) {

        alert("Please enter member name!");

        return;

    }


    const alreadyExists = members.some(member =>

        member.name.toLowerCase() === name.toLowerCase()

    );


    if (alreadyExists) {

        alert("This member already exists!");

        return;

    }


    members.push({

        id: makeId(),

        name: name

    });


    saveData();

    el.memberName.value = "";

    renderMembers();

    renderMonthlyReport();

}


// ==========================================
// DELETE MEMBER
// ==========================================

function deleteMember(id) {

    const member = members.find(m => m.id === id);

    if (!member) return;


    const confirmDelete = confirm(
        `Delete ${member.name} from member list? Past records will remain.`
    );


    if (!confirmDelete) return;


    members = members.filter(m => m.id !== id);

    saveData();

    renderMembers();

    renderDailyRecords();

    renderMonthlyReport();

}


// ==========================================
// CALENDAR
// ==========================================

function renderCalendar() {

    el.calendar.innerHTML = "";


    const year = calendarMonth.getFullYear();

    const month = calendarMonth.getMonth();


    el.calendarMonth.textContent =

        calendarMonth.toLocaleDateString("en-IN", {

            month: "long",

            year: "numeric"

        });


    // Weekday headings

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

        .forEach(day => {

            const heading = document.createElement("div");

            heading.className = "weekday";

            heading.textContent = day;

            el.calendar.appendChild(heading);

        });


    const firstWeekday = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();


    // Empty spaces

    for (let i = 0; i < firstWeekday; i++) {

        const blank = document.createElement("div");

        blank.className = "calendar-day empty";

        el.calendar.appendChild(blank);

    }


    // Calendar dates

    for (let day = 1; day <= daysInMonth; day++) {

        const date =

            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const dayRecords = records.filter(record =>

            record.date === date

        );


        const total = dayRecords.reduce(

            (sum, record) => sum + Number(record.amount || 0),

            0

        );


        const button = document.createElement("button");

        button.type = "button";

        button.className = "calendar-day";


        if (date === selectedDate) {

            button.classList.add("active");

        }


        if (dayRecords.length > 0) {

            button.classList.add("has-entry");

        }


        button.innerHTML = `

            <span class="day-number">${day}</span>

            ${
                dayRecords.length > 0
                    ? `<small>${money(total)}</small>`
                    : ""
            }

        `;


        // Future dates disabled

        if (date > todayString()) {

            button.disabled = true;

            button.title = "Future dates are not available";

        } else {

            // Current and previous dates selectable

            button.addEventListener("click", function () {

                selectedDate = date;

                cancelEdit();

                renderCalendar();

                renderDailyRecords();

            });

        }


        el.calendar.appendChild(button);

    }

}


// ==========================================
// PREVIOUS MONTH
// ==========================================

function goPreviousMonth() {

    calendarMonth = new Date(

        calendarMonth.getFullYear(),

        calendarMonth.getMonth() - 1,

        1

    );

    renderCalendar();

}


// ==========================================
// NEXT MONTH
// ==========================================

function goNextMonth() {

    const nextMonthDate = new Date(

        calendarMonth.getFullYear(),

        calendarMonth.getMonth() + 1,

        1

    );


    const currentMonth = new Date(

        new Date().getFullYear(),

        new Date().getMonth(),

        1

    );


    // Don't move calendar beyond current month

    if (nextMonthDate > currentMonth) {

        alert("Future month is not available.");

        return;

    }


    calendarMonth = nextMonthDate;

    renderCalendar();

}


// ==========================================
// DAILY RECORDS
// ==========================================

function renderDailyRecords() {

    el.selectedDateTitle.textContent = formatDate(selectedDate);

    el.recordsTitle.textContent =
        "Entries - " + formatDate(selectedDate);

    el.dateTag.textContent = selectedDate;


    const dayRecords = records.filter(record =>

        record.date === selectedDate

    );


    el.entryCount.textContent =
        dayRecords.length + " Entries";


    const totalMl = dayRecords.reduce(

        (sum, record) => sum + Number(record.quantityMl || 0),

        0

    );


    const totalAmount = dayRecords.reduce(

        (sum, record) => sum + Number(record.amount || 0),

        0

    );


    el.selectedMilk.textContent =
        (totalMl / 1000).toFixed(2) + " L";

    el.selectedAmount.textContent = money(totalAmount);


    el.dailyRecords.innerHTML = "";


    if (dayRecords.length === 0) {

        el.dailyRecords.innerHTML = `

            <tr>

                <td colspan="4" class="empty-message">

                    No entries for this date.

                </td>

            </tr>

        `;

        return;

    }


    dayRecords.forEach(record => {

        const member = members.find(m =>

            m.id === record.memberId

        );


        const name = member
            ? member.name
            : "Removed member";


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHTML(name)}</td>

            <td>
                ${(Number(record.quantityMl) / 1000).toFixed(2)} L
            </td>

            <td>${money(record.amount)}</td>

            <td>

                <button
                    type="button"
                    class="edit-btn"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-btn"
                >
                    Delete
                </button>

            </td>

        `;


        row.querySelector(".edit-btn")

            .addEventListener("click", function () {

                editRecord(record.id);

            });


        row.querySelector(".delete-btn")

            .addEventListener("click", function () {

                deleteRecord(record.id);

            });


        el.dailyRecords.appendChild(row);

    });

}


// ==========================================
// SAVE DAILY MILK ENTRY
// ==========================================

function saveEntry(event) {

    event.preventDefault();


    const memberId = el.memberSelect.value;

    const quantityMl = Number(el.quantity.value || 0);


    if (!memberId) {

        alert("Please select a member!");

        return;

    }


    const duplicate = records.find(record =>

        record.date === selectedDate &&

        record.memberId === memberId &&

        record.id !== editingRecordId

    );


    if (duplicate) {

        alert(
            "This member already has an entry for this date. Please edit the existing entry."
        );

        return;

    }


    const entryData = {

        memberId: memberId,

        date: selectedDate,

        quantityMl: quantityMl,

        amount: (quantityMl / 1000) * MILK_RATE

    };


    if (editingRecordId) {

        const index = records.findIndex(record =>

            record.id === editingRecordId

        );


        if (index !== -1) {

            records[index] = {

                ...records[index],

                ...entryData

            };

        }

    } else {

        records.push({

            id: makeId(),

            ...entryData

        });

    }


    saveData();

    cancelEdit();

    renderCalendar();

    renderDailyRecords();

    renderMonthlyReport();


    alert("Milk entry saved successfully!");

}


// ==========================================
// EDIT ENTRY
// ==========================================

function editRecord(id) {

    const record = records.find(r => r.id === id);

    if (!record) return;


    selectedDate = record.date;

    editingRecordId = id;


    el.memberSelect.value = record.memberId;

    el.quantity.value = String(record.quantityMl);


    el.entryModeText.textContent = "Edit Existing Entry";

    el.saveEntry.textContent = "Update Entry";


    calculateAmount();

    renderCalendar();

    renderDailyRecords();


    el.entryForm.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


// ==========================================
// CANCEL EDIT
// ==========================================

function cancelEdit() {

    editingRecordId = null;

    el.entryForm.reset();

    el.entryModeText.textContent = "Add New Entry";

    el.saveEntry.textContent = "Save Entry";

    calculateAmount();

}


// ==========================================
// DELETE ENTRY
// ==========================================

function deleteRecord(id) {

    const confirmDelete = confirm(

        "Are you sure you want to delete this milk entry?"

    );


    if (!confirmDelete) return;


    records = records.filter(record =>

        record.id !== id

    );


    if (editingRecordId === id) {

        cancelEdit();

    }


    saveData();

    renderCalendar();

    renderDailyRecords();

    renderMonthlyReport();

}


// ==========================================
// MONTHLY REPORT
// ==========================================

function renderMonthlyReport() {

    const month = el.reportMonth.value;

    el.monthlyReport.innerHTML = "";


    if (!month) return;


    let grandTotal = 0;


    if (members.length === 0) {

        el.monthlyReport.innerHTML = `

            <tr>

                <td colspan="4" class="empty-message">

                    No members added yet.

                </td>

            </tr>

        `;

    }


    members.forEach(member => {


        const memberRecords = records.filter(record =>

            record.memberId === member.id &&

            record.date.startsWith(month)

        );


        const totalMl = memberRecords.reduce(

            (sum, record) =>

                sum + Number(record.quantityMl || 0),

            0

        );


        const totalAmount = memberRecords.reduce(

            (sum, record) =>

                sum + Number(record.amount || 0),

            0

        );


        grandTotal += totalAmount;


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHTML(member.name)}</td>

            <td>
                ${(totalMl / 1000).toFixed(2)} L
            </td>

            <td>
                ${memberRecords.length}
            </td>

            <td>
                ${money(totalAmount)}
            </td>

        `;


        el.monthlyReport.appendChild(row);

    });


    el.grandTotal.textContent = money(grandTotal);

}


// ==========================================
// DOWNLOAD CSV REPORT
// ==========================================

function downloadCSV() {

    const month = el.reportMonth.value;


    if (!month) {

        alert("Please select a month!");

        return;

    }


    const monthRecords = records.filter(record =>

        record.date.startsWith(month)

    );


    if (monthRecords.length === 0) {

        alert("No records available for this month!");

        return;

    }


    const rows = [

        ["Date", "Member", "Quantity (L)", "Amount (INR)"]

    ];


    monthRecords.forEach(record => {

        const member = members.find(m =>

            m.id === record.memberId

        );


        rows.push([

            record.date,

            member ? member.name : "Removed member",

            (Number(record.quantityMl) / 1000).toFixed(2),

            Number(record.amount).toFixed(2)

        ]);

    });


    const csv = rows.map(row =>

        row.map(value =>

            `"${String(value).replace(/"/g, '""')}"`

        ).join(",")

    ).join("\r\n");


    const blob = new Blob(

        ["\uFEFF" + csv],

        { type: "text/csv;charset=utf-8;" }

    );


    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");


    link.href = url;

    link.download = `Milk-Report-${month}.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);

}


// ==========================================
// PRINT REPORT
// ==========================================

function printReport() {

    window.print();

}


// ==========================================
// EVENT LISTENERS
// ==========================================

// Add member

el.memberForm.addEventListener(

    "submit",

    addMember

);


// Quantity calculation

el.quantity.addEventListener(

    "change",

    calculateAmount

);


// Save entry

el.entryForm.addEventListener(

    "submit",

    saveEntry

);


// Previous month

el.prevMonth.addEventListener(

    "click",

    goPreviousMonth

);


// Next month

el.nextMonth.addEventListener(

    "click",

    goNextMonth

);


// Monthly report

el.reportMonth.addEventListener(

    "change",

    renderMonthlyReport

);


// CSV download

el.exportBtn.addEventListener(

    "click",

    downloadCSV

);


// Print report

el.printBtn.addEventListener(

    "click",

    printReport

);


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

function initializeApp() {

    // Current date

    el.todayDate.textContent = formatDate(todayString());


    // Current month report

    el.reportMonth.value = todayString().slice(0, 7);


    // Build quantity dropdown

    buildQuantityOptions();


    // Display members

    renderMembers();


    // Calculate default amount

    calculateAmount();


    // Display calendar

    renderCalendar();


    // Display daily entries

    renderDailyRecords();


    // Display monthly report

    renderMonthlyReport();

}


// START APP

initializeApp();


// ==========================================
// END OF SCRIPT
// ==========================================
