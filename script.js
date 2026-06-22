
// Master list of all members
let item =[]

const API_URL = "https://script.google.com/macros/s/AKfycbz52-LM_Ebhy7pdMCCTwLCY5oGI66doJTfAUzXk7rNnypAiu30Geb0YR139mE53lUYx/exec";

async function loadName() {
    try {
        item=[];
        let response = await fetch(API_URL);

        console.log("Response:", response);

        let data = await response.json();

        console.log("Data:", data);

let nameDropdown = document.getElementById("name");
let deleteDropdown = document.getElementById("deleteName");

nameDropdown.innerHTML =
    '<option value="" selected disabled>Select Name</option>';

deleteDropdown.innerHTML =
    '<option value="" selected disabled>Select Name</option>';

        data.forEach(function(person) {
            let fullName = person.title + "." + person.name;

            item.push(fullName);
    // Add to prayer dropdown
    let option1 = document.createElement("option");

    option1.value = fullName;
    option1.text = fullName;

    nameDropdown.add(option1);


    // Add to delete dropdown
    let option2 = document.createElement("option");

    option2.value = fullName;
    option2.text = fullName;

    deleteDropdown.add(option2);
     } );

    } catch (error) {
        console.log("Error:", error);
        alert("Unable to load names");
    }
}



function toggleMenu() {

    let menu = document.getElementById("menu");
    let addBox = document.getElementById("addNameBox");
    let deleteBox = document.getElementById("deleteNameBox");

    if (menu.style.display === "block" || 
        addBox.style.display === "block" || 
        deleteBox.style.display === "block") {

        // Hide everything
        menu.style.display = "none";
        addBox.style.display = "none";
        deleteBox.style.display = "none";

    } else {

        // Show menu
        menu.style.display = "block";
    }
}


function showAddName() {

    document.getElementById("addNameBox").style.display = "block";
    document.getElementById("deleteNameBox").style.display = "none";
    document.getElementById("menu").style.display = "none";
}
async function addName() {

    let title = document.getElementById("title").value;
   let name = document.getElementById("newName").value.trim();
   if (title === "") {
    alert("Please select a title");
    return;
}

if (name === "") {
    alert("Please enter a name");
    return;
}
let newName = title + "." + name;

    if (newName === "") {
        alert("Please enter a name");
        return;
    }

    if (item.includes(newName)) {
        alert("Name already exists");
        return;
    }

try {
    let response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
            action: "addMember",
            title: title,
            name: name
        })
    });

    console.log(await response.text());

} catch (error) {
    console.log("POST Error:", error);
}

    item.push(newName);


    let option = document.createElement("option");

    option.text = newName;
    option.value = newName;


    document.getElementById("name").add(option);


    document.getElementById("newName").value = "";
document.getElementById("title").selectedIndex = 0;

    document.getElementById("addNameBox").style.display = "none";

    document.getElementById("message").innerHTML =
        "✔ " + newName + " added successfully!";
}
function showDeleteName() {

    document.getElementById("deleteNameBox").style.display = "block";
    document.getElementById("addNameBox").style.display = "none";
    document.getElementById("menu").style.display = "none";
}
async function deleteName() {

    let name = document.getElementById("deleteName").value;



    if (name === "") {
        alert("Please select a name to delete");
        return;
    }

    let confirmDelete = confirm(
        "Are you sure you want to delete " + name + "?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        let response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify({
                action: "deleteMember",
                name: name
            })
        });

        let result = await response.json();
        console.log(result);
        if (result.status === "success") {

    // Load latest names from Members sheet
    await loadName();

    document.getElementById("message").style.color = "green";

    document.getElementById("message").innerHTML =
        "✔ " + name + " deleted successfully!";
}


    } catch(error) {

        console.log(error);

        document.getElementById("message").style.color = "red";
        document.getElementById("message").innerHTML =
            "❌ Unable to delete member";

    }
}

function getFormattedDate() {

    let now = new Date();

    return now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// Save submitted data
async function saveData() {

    let name = document.getElementById("name").value;
    let slot = document.getElementById("slot").value;

    if (name === "") {
        alert("Please select a name");
        return;
    }

    if (slot === "") {
        alert("Please select a time slot");
        return;
    }

    try {

        let response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify({
                action: "submitPrayer",
                name: name,
                status: "Yes",
                slot: slot,
                date: getFormattedDate()
            })
        });
let result = await response.json();

// Duplicate submission message
if (result.status === "error") {

    document.getElementById("message").style.color = "red";

    document.getElementById("message").innerHTML =
        "❌ " + name +" has already submitted today ";

    return;
}

// Successful submission message
document.getElementById("message").style.color = "green";

document.getElementById("message").innerHTML =
    "✔ " + name + " submitted successfully!";

document.getElementById("name").selectedIndex = 0;
document.getElementById("slot").selectedIndex = 0;

    } catch(error) {

        console.log(error);

        document.getElementById("message").style.color = "red";

document.getElementById("message").innerHTML =
    "❌ Unable to submit record. Please try again.";

    }
}


async function downloadPDF() {
    try {

        let response = await fetch(API_URL + "?type=pdf");

        let result = await response.json();

        if (result.status === "success") {

            let base64 = result.pdf
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            while (base64.length % 4) {
                base64 += "=";
            }

            let byteCharacters = atob(base64);

            let byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            let blob = new Blob([byteArray], {
                type: "application/pdf"
            });

            let url = window.URL.createObjectURL(blob);

            let link = document.createElement("a");

            link.href = url;
            link.download = "Prayer_Report.pdf";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

        } else {
            alert("PDF generation failed");
        }

    } catch (error) {
        console.error("Download error:", error);
        alert("Download failed: " + error.message);
    }
}


window.onload = function() {
    loadName();
};

