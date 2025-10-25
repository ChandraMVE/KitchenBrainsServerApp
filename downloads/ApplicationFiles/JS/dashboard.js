/* -------------------- GLOBAL ARRAY DATA START -------------------- */
const allRecipes = [];
const allRecipesVegetable = [];
const allRecipesPoultry = [];
const allRecipesMeat = [];
const allRecipesSeafood = [];
const allRecipesBreakFast = [];
const allRecipesLunch = [];
const allRecipesDinner = [];
const allRecipesLateNight = [];
const homeScreenTiles = [];
const CurrentDisplayingRecipes = [];
const allUserGroups = [];
const addNewRecipe = {
    "AlarmOnOff": [1, 1, 1, 1, 1],
    "AlarmPattern": [1, 2, 3, 4, 5],
    "AlarmVolume": [1, 2, 3, 4, 5],
    "AutoCancel": [false, false, false, false, false],
    "BatchCompleted": 0,
    "BatchNo": 0,
    "CurrentTime": 0,
    "DailyCount": 0,
    "DeltaSum": [1, 1, 1, 1, 1],
    "ImageName": "./food/NoInfo-R.png",
    "MaxBatchCount": 4,
    "MonthlyCount": 0,
    "PrepMoreEnabled": false,
    "ProcedureImageName": "./ProImages/NoInfo-R.png",
    "ProductCount": 0,
    "ProductGroup": 0,
    "ProductName": "New Recipe",
    "ProductSequenceNum": 0,
    "ProductSerialNo": -1,
    "ProductType": 0,
    "ProductUserGroup": 0,
    "ReceivedFromStation": 255,
    "StageAction": ["", "", "", "", ""],
    "StageCompleted": 0,
    "StageImageName": ["", "", "", "", ""],
    "StageTime": [0, 0, 0, 0, 0],
    "TimeDecrement": [1, 1, 1, 1, 1],
    "TimeFormat": 0,
    "TotalActiveStages": 0,
    "TotalTime": 0,
    "WeeklyCount": 0,
    "popupDisplayed": false
};
/*
let alerts = [{ AlertMessageText: "Sanitize your hands",ImageName: "./food/Daco_5159465.png",StartTime: 300,EndTime: 300,AlertInterval: 10,BeepPattern: 1,VolumeLevel: 4,MessageAlerted:0,WarningEnabled:1,nextTriggerTime: 300},{ AlertMessageText: "Clean the pan",ImageName: "./food/clean_pan.png",StartTime: 290,EndTime: 300,AlertInterval: 65,BeepPattern: 1,VolumeLevel: 4,MessageAlerted:0,WarningEnabled:0,nextTriggerTime: 300}
];
 */
let editingIndex = null;
/* -------------------- GLOBAL ARRAY DATA END -------------------- */

/* -------------------- GLOBAL STATE VARIABLES START -------------------- */
let TransferSuccessful = false;
let currentlyEditingDayPart = null; // ✅ define globally
let autoDayPartChanged = false; // 🔹 Track if user changed toggle
let currentPageScreen = "home"; // This can come from URL, state, etc.
let dropdownTimeout; // global auto-close timer
let originalMaxBatchCount = 1;
let selectedImageFile = null; // store chosen file until Save
let selectedAlertImageFile = null; // store chosen file until Save
let selectedAlertImageFileName = null;
let selectedAlertImageFileUrl = null;
let proimageselectedImageFile = null;
let proimageselectedImageFilePreview = null;
let productNameChanged = false;
let productImageChanged = false;
let recipesPerPage = 9;
let currentPage = 1;
let totalPages = Math.ceil(CurrentDisplayingRecipes.length / recipesPerPage);
let currentRecipe = null;
let currentRecipeProductType = 0;
let currentStageIndex = 0; // 0..4
const groupColors = ['#27AC41', '#EFF763', '#F40D13', '#7881F8'];
const groupColorMap = {
    0: '#27AC41',
    1: '#EFF763',
    2: '#F40D13',
    3: '#7881F8'
};
// User group data
const COLORS = [
    "rgb(43, 180, 143)",
    "rgb(175, 113, 72)",
    "rgb(170, 50, 50)",
    "rgb(175, 106, 109)",
    "rgb(148, 65, 148)",
    "rgb(0, 187, 255)",
    "rgb(175, 141, 215)",
    "rgb(60, 89, 242)",
    "rgb(67, 153, 57)",
    "rgb(155, 206, 85)",
    "rgb(190, 50, 183)",
    "rgb(255, 109, 12)",
    "rgb(232, 57, 140)",
    "rgb(149, 62, 74)",
    "rgb(119, 0, 170)",
    "rgb(41, 133, 129)"
];

// Auto DayPart toggle handling
const checkboxstatus = document.getElementById('autoDayPartsEnabled');

const addUserModal = document.getElementById("addUserModal");
const addUserBtn = document.getElementById("addUserBtn");
const confirmUserBtn = document.getElementById("confirmUserBtn");
const cancelUserBtn = document.getElementById("cancelUserBtn");

const userNameInput = document.getElementById("userNameInput");
const userGroupContainer = document.getElementById("userGroupContainer");

let users = [];
let selectedUserIndex = null; // track which user is selected
let selectedColor = null; // stores picked swatch color

const daypartsmaping = {
    breakfast: 1,
    lunch: 2,
    dinner: 4,
    lateNight: 8
};
const groupMap = {
    vegetable: 0,
    poultry: 1,
    meat: 2,
    seafood: 3
};

// Keep stage images in arrays
let stageImageFiles = {}; // actual File objects (per stage index)
let stageImageFileNames = {}; // only file names (per stage index)
/* -------------------- GLOBAL STATE VARIABLES END -------------------- */

/* -------------------- UTILITY FUNCTIONS START -------------------- */
function formatTime(seconds) {
    if (seconds === null || isNaN(seconds) || seconds < 0)
        return '00:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        // If hours are present, ignore seconds and show HH:MM
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } else {
        // Otherwise show MM:SS
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
}

function formatTime1(seconds) {
    if (seconds === null || isNaN(seconds) || seconds < 0)
        return '00:00:00';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseTimeString(str) {
    if (!str)
        return 0;
    const parts = String(str).trim().split(':');
    if (parts.length === 1) {
        const m = Number(parts[0]) || 0;
        return m * 60;
    }
    const m = Number(parts[0]) || 0;
    const s = Number(parts[1]) || 0;
    return m * 60 + s;
}
function getBorderColor(group) {
    switch (group) {
    case 0:
        return 'green';
    case 1:
        return 'yellow';
    case 2:
        return 'red';
    case 3:
        return 'blue';
    default:
        return 'green';
    }
}
function getGroupColor(group) {
    return groupColorMap[group] || '#008000';
}
/* -------------------- UTILITY FUNCTIONS END -------------------- */

/* -------------------- HOME RENDER FUNCTIONS START -------------------- */
function renderRecipeTiles(page, RecipesArray, newarray) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = '';
    const start = (page - 1) * recipesPerPage;
    const end = start + recipesPerPage;

    // Update CurrentDisplayingRecipes when new filter is applied
    if (newarray) {
        CurrentDisplayingRecipes.length = 0; // clear array
        CurrentDisplayingRecipes.push(...RecipesArray);
    }

    const recipesToDisplay = CurrentDisplayingRecipes.slice(start, end);

    // Render actual recipes
    recipesToDisplay.forEach((recipe) => {
        let downloadedfilename = document.getElementById('stationname').innerText
            .trim()
            .replace(/\s+/g, "_"); // replace spaces with "_"

        let imagePath = `${recipe.ImageName}`.replace(
                "./",
`/${downloadedfilename}/TcpTTProductExportPC/`);
        let imagePath1 = `/external-files/${imagePath}`;
        imagePath1 = imagePath1.replace(/ /g, '%20'); // handle spaces

        const tile = document.createElement('div');
        tile.className = `tile ${getBorderColor(recipe.ProductType)}`;
        tile.innerHTML = `
	<img src="${imagePath1}" alt="${recipe.ProductName}">
	<div class="tile-details">
	<div class="label">${recipe.ProductName}</div>
	<div class="time">${formatTime(recipe.TotalTime)}</div>
	</div>
	`;
        //  Create stage boxes container
        const boxContainer = document.createElement('div');
        boxContainer.className = 'stage-boxes';

        // Determine how many stage boxes to display
        const stageCountForDisplay = recipe.TotalActiveStages;

        for (let i = 0; i < stageCountForDisplay; i++) {
            const box = document.createElement('div');
            box.className = 'stage-box';
            boxContainer.appendChild(box);
        }

        //  Append stage boxes inside the tile details
        tile.querySelector('.tile-details').appendChild(boxContainer);

        tile.addEventListener('click', () => openRecipeEditor(recipe));
        grid.appendChild(tile);
    });

    // Add placeholder tiles if less than 9 per page
    const emptySlots = recipesPerPage - recipesToDisplay.length;
    for (let i = 0; i < emptySlots; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = "tile placeholder"; // same size, no content
        grid.appendChild(placeholder);
    }

    // Update pagination info
    totalPages = Math.ceil(CurrentDisplayingRecipes.length / recipesPerPage);
    document.getElementById('pageInfo').textContent =
`${page}/${Math.max(totalPages, 1)}`;
}
/* -------------------- HOME RENDER FUNCTIONS END -------------------- */

document.getElementById('AddNewRecipebtn').addEventListener('click', () => {
    document.getElementById("groupModal").style.display = "none";
    openRecipeEditor(addNewRecipe);
});

document.getElementById('vegetableGroup').addEventListener('click', () => {
    document.getElementById("groupModal").style.display = "none";
   // renderRecipeTiles(currentPage, allRecipesVegetable, true); // filter tiles to show new image
   setDropdownSelection(foodDropdown, "vegetable", FilterRecipes);
});
document.getElementById('poultryGroup').addEventListener('click', () => {
    document.getElementById("groupModal").style.display = "none";
	setDropdownSelection(foodDropdown, "poultry", FilterRecipes);
   // renderRecipeTiles(currentPage, allRecipesPoultry, true); // filter tiles to show new image
});
document.getElementById('meatGroup').addEventListener('click', () => {
    document.getElementById("groupModal").style.display = "none";
	setDropdownSelection(foodDropdown, "meat", FilterRecipes);
    //renderRecipeTiles(currentPage, allRecipesMeat, true); // filter tiles to show new image
});
document.getElementById('seaFoodGroup').addEventListener('click', () => {
    document.getElementById("groupModal").style.display = "none";
	setDropdownSelection(foodDropdown, "seafood", FilterRecipes);
   // renderRecipeTiles(currentPage, allRecipesSeafood, true); // filter tiles to show new image
});

/* -------------------- EDITOR RENDER FUNCTIONS START -------------------- */
function openRecipeEditor(recipe) {

    if (currentPageScreen === "home") {
        return;
    }
    currentRecipe = recipe;
    currentStageIndex = 0;
    let downloadedfilename = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_"); // replace one or more spaces with "_"
    let imagePath = `${recipe.ImageName}`.replace(
            "./",
`/${downloadedfilename}/TcpTTProductExportPC/`);
    let imagePath1 = `/external-files/${imagePath}`;
    const fileName = imagePath1.split(/[/\\]/).pop();
    fetch(imagePath1)
    .then(function (response) {
        return response.blob();
    })
    .then(function (blob) {
        selectedImageFile = new File([blob], fileName, {
            type: blob.type
        });

        // Example: Show image preview
        const preview = document.getElementById("preview");
    })
    .catch(function (error) {
        console.error("Error loading image:",  error);
            
    });

    imagePath1 = imagePath1.replace(/ /g, '%20'); // for remove spaces
    document.getElementById('recipeNameButton').textContent = recipe.ProductName;
    document.getElementById('recipeNameButton').style.backgroundColor = getGroupColor(recipe.ProductType);
    document.getElementById('imageButton').style.backgroundImage = `url('${imagePath1}')`;
    document.getElementById('prepMoreCheckbox').checked = !!recipe.PrepMoreEnabled;
currentRecipeProductType = recipe.ProductType;
    let proimagePath = `${recipe.ProcedureImageName}`.replace(
            "./",
`/${downloadedfilename}/TcpTTProductExportPC/`);
    let proimagePath1 = `/external-files/${proimagePath}`;
    const proimagefileName = proimagePath1.split(/[/\\]/).pop();
    fetch(proimagePath1)
    .then(function (response) {
        return response.blob();
    })
    .then(function (blob) {
        proimageselectedImageFile = new File([blob], proimagefileName, {
            type: blob.type
        });

        document.getElementById('currentBuildImage').style.backgroundImage = `url('${proimagePath1}')`;
        document.getElementById('BuildimageButton').style.backgroundImage = "none";

    })
    .catch(function (error) {
        console.error("Error loading image:",  error);
            
    });

    const divContent1 = document.getElementById('content1');
    let htmlContent = `<div class="table-wrapper">
							<table style="width:80%;">
								<thead>
									<tr>
										<th>St No</th>
										<th>Stage</br>Action</th>
									<th>Time</th>
									<th>Delta</br>Sum</th>
								<th>Auto</br>Cancel</th>
							<th>Stage</br>Picture</th>
						</tr>
						</thead>
						<tbody id="recipeEditorBody"/>`;

    const totalStages = 5;
    stageImageFiles = {};
    stageImageFileNames = {};
    for (let i = 0; i < totalStages; i++) {
        let action = (recipe.StageAction && recipe.StageAction[i]) || "";
        let time = formatTime1((recipe.StageTime && recipe.StageTime[i]) || 0);
        let deltaSum = (recipe.DeltaSum && Number(recipe.DeltaSum[i])) || 0;
        let autoCancel = (recipe.AutoCancel && recipe.AutoCancel[i]) || false;
        // Stage image logic
        let downloadedfilename = document.getElementById('stationname').innerText
            .trim()
            .replace(/\s+/g, "_"); // replace spaces with "_"
        let stageImagePath = recipe.StageImageName[i] || "";
        let btnClass = 'green-pic-btn';
        let styleAttr = "";
        if (stageImagePath && stageImagePath.trim() !== "") {
            // Convert "./" to external-files path like your main image
            let fullPath = stageImagePath.replace("./", `/${downloadedfilename}/TcpTTProductExportPC/`);
            fullPath = `/external-files/${fullPath}`.replace(/ /g, '%20'); // encode spaces

            // Update class and style for preview
            btnClass = 'green-pic-btn has-image';
            styleAttr = `style="background-image: url('${fullPath}');"`;

            // Fetch file to keep for saving
            fetch(fullPath)
            .then(response => response.blob())
            .then(blob => {
                const fileName = fullPath.split(/[/\\]/).pop();
                stageImageFiles[i] = new File([blob], fileName, {
                    type: blob.type
                });
                stageImageFileNames[i] = fileName;
            })
            .catch(err => console.error("Error loading stage image:", err));
        }

        htmlContent += `<tr>
						<td>${i + 1}</td>
						<td>
							<input type="text" class="editable action-input" value="${action}" maxlength="20"/>
							<td>
								<input type="text" class="editable time-input" value="${time}" maxlength="9"/>
								<td>
									<button class="toggle-btn" data-type="delta" data-state="${deltaSum}">
										<img src="${deltaSum === 1 ? '/external-files/ApplicationFiles/IMAGES/KB_icons/no-delta-sum-01-02.png' :
										'/external-files/ApplicationFiles/IMAGES/KB_icons/no-delta-sum-01.png'}" alt="Delta Sum" class="toggle-icon" style="margin-right:8px;"/>
										<span class="toggle-text">${deltaSum === 1 ? "ON" : "OFF"}</span>
									</button>
								</td>
								<td>
									<button class="toggle-btn" data-type="autocancel" data-state="${autoCancel}">
										<img src="${autoCancel ? '/external-files/ApplicationFiles/IMAGES/KB_icons/touch-01-01.png' : 
										'/external-files/ApplicationFiles/IMAGES/KB_icons/touch-02.png'}" alt="Auto Cancel" class="toggle-icon" style="margin-right:8px;"/>
										<span class="toggle-text">${autoCancel ? "ON" : "OFF"}</span>
									</button>
								</td>
								<td>
									<button class="${btnClass}" data-stage-index="${i}" ${styleAttr}>
									<span class="btn-text">stage image</span>
								</button>
								<input type="file" accept="image/*" style="display:none;" data-stage-index="${i}" class="stage-image-input"/>
							</td>
						</tr>`;
    }

    htmlContent += `</table>`;

    // Single color toggle button
    const groupColor = getGroupColor(recipe.ProductType);
    htmlContent += `<table style="width:20%;">
						<thead>
							<tr>
								<th>Group</br>Name</th>
							</tr>
						</thead>
					<tbody id="recipeEditorBody1"/>`;

    // Map numeric to group
    const groupMapReverse = ["vegetable", "poultry", "meat", "seafood"];
    const defaultGroup = groupMapReverse[recipe.ProductType];

    // Generate the HTML row with default selection applied
    htmlContent += `<tr>
					  <td style="text-align:center;">
						<div class="dropdown-container1">
						  <button class="Product-Type-button product-type-${defaultGroup}" onclick="toggleProductTypeDropdown(this, event)" >
							<img src="/external-files/ApplicationFiles/IMAGES/KB_icons/FoodGroup.png" alt="Food Group">
						  </button>
						  <ul class="dropdown-menu1">
							<li data-group="vegetable" ${defaultGroup === "vegetable" ? "class='selected'" : ""} onclick="selectGroup('vegetable', this)">Vegetable</li>
							<li data-group="poultry" ${defaultGroup === "poultry" ? "class='selected'" : ""} onclick="selectGroup('poultry', this)">Poultry</li>
							<li data-group="meat" ${defaultGroup === "meat" ? "class='selected'" : ""} onclick="selectGroup('meat', this)">Meat</li>
							<li data-group="seafood" ${defaultGroup === "seafood" ? "class='selected'" : ""} onclick="selectGroup('seafood', this)">Seafood</li>
						  </ul>
						</div>
					  </td>
					</tr>`;

    htmlContent += `<tr>
					<td class="icon-column" style="text-align:left; padding-top:25px;">
						<label class="containercheckbox">BreakFast<input type="checkbox" id="breakfast">
								<span class="checkmarkbox"/>
							</label>
						</br>
						<label class="containercheckbox">Lunch<input type="checkbox" id="lunch">
								<span class="checkmarkbox"/>
							</label>
						</br>
						<label class="containercheckbox">Dinner<input type="checkbox" id="dinner">
								<span class="checkmarkbox"/>
							</label>
						</br>
						<label class="containercheckbox">Late night<input type="checkbox" id="lateNight">
								<span class="checkmarkbox"/>
							</label>
						</td>
					</tr>`;

    htmlContent += `</table>
	</div>`;
    divContent1.innerHTML = htmlContent;
    updateCheckboxesDayparts(recipe);

    const divContent2 = document.getElementById('content2');
    htmlContent = `<table>
						<thead>
							<tr>
								<th>St No</th>
								<th>Stage</br>Action</th>
							<th>Time</th>
							<th>Count</th>
							<th>Alarm</th>
							<th>Pattern</th>
							<th>Volume</th>
						</tr>
					</thead>
					<tbody id="recipeEditorBody3"/>`;
    for (let i = 0; i < totalStages; i++) {
        let action = (recipe.StageAction && recipe.StageAction[i]) || "";
        let time = formatTime1((recipe.StageTime && recipe.StageTime[i]) || 0);
        let timeDecrement = (recipe.TimeDecrement && Number(recipe.TimeDecrement[i])) || 0;
        let alarmOn = (recipe.AlarmOnOff && Number(recipe.AlarmOnOff[i])) || 0;
        let pattern = (recipe.AlarmPattern && Number(recipe.AlarmPattern[i])) || 1;
        let volume = (recipe.AlarmVolume && Number(recipe.AlarmVolume[i])) || 1;

        // Use the pattern value to set the correct initial image
        let patternImageSrc;
        switch (pattern) {
        case 1:
            patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L1-01.png';
            break;
        case 2:
            patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L2-01.png';
            break;
        case 3:
            patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L3-01.png';
            break;
        case 4:
            patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L4-01.png';
            break;
        case 5:
            patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L5-01.png';
            break;
        default:
            patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L1-01.png';
            break;
        }

        // Use the volume value to set the correct initial image
        let volumeImageSrc;
        switch (volume) {
        case 1:
            volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-01-01.png';
            break;
        case 2:
            volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-02-01.png';
            break;
        case 3:
            volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-03-01.png';
            break;
        case 4:
            volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-04-01.png';
            break;
        case 5:
            volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-05-01.png';
            break;
        default:
            volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-01-01.png';
            break;
        }

        htmlContent += `<tr>
							<td>${i + 1}</td>
								<td>
								<input type="text" class="editable action-input" value="${action}" id="stageAction" maxlength="20"/>
								<td>
									<input type="text" class="editable time-input" value="${time}" maxlength="9"/>
									<td>
										<button class="toggle-btn" data-type="timeDecrementincrement" data-state="${timeDecrement}">
											<img src="${timeDecrement === 1 ? '/external-files/ApplicationFiles/IMAGES/KB_icons/down-arrow.png' :
											'/external-files/ApplicationFiles/IMAGES/KB_icons/up-arrow.png'}" alt="timeDecrementincrement" class="toggle-icon" />
										</button>
									</td>
									<td>
										<button class="toggle-btn" data-type="alarm" data-state="${alarmOn}">
											<img src="${alarmOn === 1 ? '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-01.png' :
											'/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-02-01.png'}" alt="Alarm" class="toggle-icon" style="margin-right:8px;"/>
											<span class="toggle-text">${alarmOn === 1 ?"ON":"OFF"}</span>
										</button>
									</td>
									<td>
										<button class="toggle-btn" data-type="pattern" data-state="${pattern}">
											<img src="${patternImageSrc}" alt="Pattern" class="toggle-icon" style="margin-right:8px;"/>
											<span class="toggle-text">${pattern}</span>
										</button>
									</td>
									<td>
										<button class="toggle-btn" data-type="volume" data-state="${volume}">
											<img src="${volumeImageSrc}" alt="Volume" class="toggle-icon" style="margin-right:8px;"/>
											<span class="toggle-text">${volume}</span>
										</button>
									</td>
						</tr>`;
    }
    htmlContent += `</table>`;
    divContent2.innerHTML = htmlContent;
    // now that the DOM is ready, attach listeners
    setupStageSync();
    document.getElementById('recipeEditorModal').style.display = 'flex';
}
/* -------------------- EDITOR RENDER FUNCTIONS START -------------------- */

// Function to trigger the settings
function changesettingscreen() {
    currentPageScreen = "settings";
    const buttons = document.querySelectorAll(".topbar-button");

    buttons.forEach(btn => btn.classList.remove("selected")); // remove any previous selection screen button

    if (currentPageScreen === "home") {
        document.getElementById("home").classList.add("selected");
    } else if (currentPageScreen === "settings") {
        document.getElementById("setting").classList.add("selected");
    }
    openSettingsModal();
}
// Function to trigger the settings
function changehomescreen() {
    currentPageScreen = "home";
    const buttons = document.querySelectorAll(".topbar-button");

    buttons.forEach(btn => btn.classList.remove("selected")); // remove any previous selection screen button

    if (currentPageScreen === "home") {
        document.getElementById("home").classList.add("selected");
    } else if (currentPageScreen === "settings") {
        document.getElementById("setting").classList.add("selected");
    }
}

function openSettingsModal() {
    document.getElementById("settingsModal").style.display = "flex";
}
function openRecipSettingsModal() {
    renderUsers();
    document.getElementById("groupModal").style.display = "flex";
}
function closeSettingsModal() {
    document.getElementById("settingsModal").style.display = "none";
    changehomescreen();
}

// Show modal on Add User button
addUserBtn.addEventListener("click", () => {
    // ✅ Check limit before opening modal
    if (allUserGroups.length >= 5) {
        alert("Maximum 5 User Groups are allowed!");
        return;
    }

    addUserModal.style.display = "flex";
    renderColorGrid();
    userNameInput.value = "";
    selectedColor = null; // reset color selection
    document.querySelectorAll(".color-swatch").forEach(el => el.classList.remove("selected"));
    userNameInput.focus();
});

// Continue editing recipe (close modal)
continueRecipeEdit.addEventListener("click", () => {
    document.getElementById("groupModal").style.display = "none";
});

// Confirm Add User Group
confirmUserBtn.addEventListener("click", () => {
    const name = userNameInput.value.trim();

    // ✅ Check again before adding
    if (allUserGroups.length >= 5) {
        alert("You can only create up to 5 User Groups!");
        addUserModal.style.display = "none";
        return;
    }

    if (name && selectedColor) {
        allUserGroups.push({
            UserGroupName: name,
            UserGroupColor: selectedColor + ";",
            UserGroupImage: ":/Images/folder.png" // default icon
        });

        renderUsers();
        addUserModal.style.display = "none";
    } else {
        alert("Please enter a user name and select a color!");
    }
    saveUserGroupFile();
});

// Cancel Add User
cancelUserBtn.addEventListener("click", () => {
    addUserModal.style.display = "none";
});

// Delete selected user group
document.getElementById("deleteUserBtn").addEventListener("click", () => {
    if (selectedUserIndex !== null) {
        const selectedGroup = allUserGroups[selectedUserIndex];
        showConfirm(`Are you sure you want to Delete UserGroup "${selectedGroup.UserGroupName}" ?`, function (confirmed) {
            if (!confirmed) {
                selectedUserIndex = null;
                return;
            }

            allUserGroups.splice(selectedUserIndex, 1);
            selectedUserIndex = null;
            renderUsers();
            saveUserGroupFile();
        });
    } else {
        alert("Please select a user group to delete!");
    }
});

// Render available color palette
function renderColorGrid() {
    const colorGrid = document.getElementById("colorGrid");
    colorGrid.innerHTML = "";

    COLORS.forEach(color => {
        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = color;

        swatch.addEventListener("click", () => {
            document.querySelectorAll(".color-swatch").forEach(el => el.classList.remove("selected"));
            swatch.classList.add("selected");
            selectedColor = color;
        });

        colorGrid.appendChild(swatch);
    });
}

// Render all user groups as buttons
function renderUsers() {
    const userGroupContainer = document.getElementById("userGroupContainer");
    userGroupContainer.innerHTML = "";

    const maxBtns = 5; // max buttons per row
    const btnWidth = `${Math.floor(100 / maxBtns) - 2}%`; // width in % with gap adjustment

    allUserGroups.forEach((group, index) => {
        const btn = document.createElement("button");
        btn.className = "user-btn";
        btn.style.width = btnWidth;
        btn.style.height = "100px"; // fixed height

        // Apply color
        let groupColor = (group.UserGroupColor || "rgb(120,120,120)").trim();
        if (groupColor.endsWith(";"))
            groupColor = groupColor.slice(0, -1);
        btn.style.backgroundColor = groupColor;

        // Image
        const img = document.createElement("img");
        let groupimagePath = (group.UserGroupImage || "").trim();
        if (groupimagePath.startsWith(":/Images/")) {
            groupimagePath = groupimagePath.replace(
                    ":/Images",
`external-files/ApplicationFiles/IMAGES/KB_icons`);
        } else if (!groupimagePath.startsWith("/")) {
            groupimagePath = `external-files/${downloadedfilename}/TcpTTProductExportPC/${groupimagePath}`;
        }
        if (!groupimagePath)
            groupimagePath = "external-files/ApplicationFiles/IMAGES/folder.png";
        if (!groupimagePath.startsWith("/"))
            groupimagePath = "/" + groupimagePath;
        img.src = groupimagePath;
        img.alt = group.UserGroupName || "Group";
        img.className = "user-group-icon";

        // Label
        const label = document.createElement("span");
        label.textContent = group.UserGroupName || "Unnamed";
        label.className = "user-label";

        // Combine
        btn.appendChild(img);
        btn.appendChild(label);

        // Highlight selected
        if (index === selectedUserIndex)
            btn.classList.add("selected");

        // Click
        btn.addEventListener("click", () => {
            selectedUserIndex = index;
            renderUsers();
        });

        userGroupContainer.appendChild(btn);
    });
}

document.getElementById("closeDayPartsBtn").addEventListener("click", () => {
    document.getElementById("dayPartsModal").style.display = "none";
    document.getElementById("settingsModal").style.display = "flex";
});

document.getElementById("closeDimTimerBtn").addEventListener("click", () => {
    document.getElementById("dimTimerModal").style.display = "none";
    document.getElementById("settingsModal").style.display = "flex";
});

/* -------------------- EDITOR HELPERS START -------------------- */

// Function to handle the recipe name change
function updateRecipeName() {
    if (!currentRecipe)
        return;
    let newName = document.getElementById('recipeNameButton').textContent.trim();

    // Sanitize and validate the new name
    if (newName === "") {
        newName = "Untitled Recipe";
        document.getElementById('recipeNameButton').textContent = newName;
    }

    // Update the current recipe object
    currentRecipe.ProductName = newName;

    // Re-render the tiles to show the updated name on the main screen
    renderRecipeTiles(currentPage, allRecipes, false);
}
/*
function toggleProductTypeDropdown(button) {

let menu = button.nextElementSibling;
if (!menu) return;

if (!menu.classList.contains("show")) {
// Move dropdown to body to escape overflow
document.body.appendChild(menu);
const rect = button.getBoundingClientRect();
menu.style.position = "absolute";
menu.style.top = (rect.bottom + window.scrollY) + "px";
menu.style.left = (rect.left + window.scrollX) + "px";
menu.classList.add("show");
} else {
menu.classList.remove("show");
}
}
 */
/*
function toggleProductTypeDropdown(button) {

let menu = button.nextElementSibling;
if (!menu) return;

// Close other dropdowns
document.querySelectorAll('.dropdown-menu1.show').forEach(m => {
if (m !== menu) {
m.classList.remove('show');
if (m.originalParent) m.originalParent.appendChild(m);
}
});

if (!menu.classList.contains("show")) {
// Save original parent once
if (!menu.originalParent) menu.originalParent = menu.parentElement;

// Move to body so it's not clipped by table
document.body.appendChild(menu);

const rect = button.getBoundingClientRect();
menu.style.position = "absolute";
menu.style.top = (rect.bottom + window.scrollY) + "px";
menu.style.left = (rect.left + window.scrollX) + "px";
menu.style.minWidth = button.offsetWidth + "px";

// Highlight previously selected item
const currentClass = [...button.classList].find(c => c.startsWith("product-type-"));
if (currentClass) {
const group = currentClass.replace("product-type-", "");
menu.querySelectorAll("li").forEach(li => {
li.classList.toggle("selected", li.dataset.group === group);
});
}

menu.classList.add("show");
} else {
// Already open → close it
menu.classList.remove("show");
if (menu.originalParent) menu.originalParent.appendChild(menu);
}
}

function selectGroup(group, liElement) {
const menu = liElement.closest(".dropdown-menu1");
if (!menu) return;

const button = menu.originalParent.querySelector("button");

// Update button color
button.classList.remove(
"product-type-vegetable",
"product-type-poultry",
"product-type-meat",
"product-type-seafood"
);
button.classList.add(`product-type-${group}`);
// Store numeric value in single recipe.ProductType
currentRecipeProductType = groupMap[group];
document.getElementById('recipeNameButton').style.backgroundColor = getGroupColor(currentRecipeProductType);
if (currentRecipeProductType === 1) {
document.getElementById('recipeNameButton').style.color = "black"; // lowercase 'color'
}else{
document.getElementById('recipeNameButton').style.color = "white"; // lowercase 'color'
}
// Highlight the selected <li>
menu.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
liElement.classList.add("selected");

// Close dropdown
menu.classList.remove("show");
if (menu.originalParent) menu.originalParent.appendChild(menu);
}

// Close dropdown if clicked outside
document.addEventListener("click", (e) => {
if (!e.target.closest('.dropdown-container1') && !e.target.closest('.dropdown-menu1')) {
document.querySelectorAll('.dropdown-menu1.show').forEach(menu => {
menu.classList.remove('show');
if (menu.originalParent) menu.originalParent.appendChild(menu);
});
}
});
 */

function toggleProductTypeDropdown(button) {
    let menu = button.nextElementSibling;
    if (!menu)
        return;

    // Close other dropdowns
    document.querySelectorAll('.dropdown-menu1.show').forEach(m => {
        if (m !== menu) {
            m.classList.remove('show');
            if (m.originalParent)
                m.originalParent.appendChild(m);
        }
    });

    if (!menu.classList.contains("show")) {
        // Save original parent once
        if (!menu.originalParent)
            menu.originalParent = menu.parentElement;

        // Move to body so it's not clipped by table
        document.body.appendChild(menu);

        const rect = button.getBoundingClientRect();
        menu.style.position = "absolute";
        menu.style.top = (rect.bottom + window.scrollY) + "px";
        menu.style.left = (rect.left + window.scrollX) + "px";
        menu.style.minWidth = button.offsetWidth + "px";

        // Highlight previously selected item
        const currentClass = [...button.classList].find(c => c.startsWith("product-type-"));
        if (currentClass) {
            const group = currentClass.replace("product-type-", "");
            menu.querySelectorAll("li").forEach(li => {
                li.classList.toggle("selected", li.dataset.group === group);
            });
        }

        menu.classList.add("show");

        // 🔥 Auto-close after 5 seconds
        clearTimeout(dropdownTimeout);
        dropdownTimeout = setTimeout(() => {
            if (menu.classList.contains("show")) {
                menu.classList.remove("show");
                if (menu.originalParent)
                    menu.originalParent.appendChild(menu);
            }
        }, 5000);

    } else {
        // Already open → close it
        menu.classList.remove("show");
        if (menu.originalParent)
            menu.originalParent.appendChild(menu);
        clearTimeout(dropdownTimeout);
    }
}

function selectGroup(group, liElement) {
    const menu = liElement.closest(".dropdown-menu1");
    if (!menu)
        return;

    const button = menu.originalParent.querySelector("button");

    // Update button color
    button.classList.remove(
        "product-type-vegetable",
        "product-type-poultry",
        "product-type-meat",
        "product-type-seafood");
    button.classList.add(`product-type-${group}`);

    // Store numeric value in single recipe.ProductType
    currentRecipeProductType = groupMap[group];
    document.getElementById('recipeNameButton').style.backgroundColor = getGroupColor(currentRecipeProductType);
    if (currentRecipeProductType === 1) {
        document.getElementById('recipeNameButton').style.color = "black";
    } else {
        document.getElementById('recipeNameButton').style.color = "white";
    }

    // Highlight the selected <li>
    menu.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
    liElement.classList.add("selected");

    // Close dropdown
    menu.classList.remove("show");
    if (menu.originalParent)
        menu.originalParent.appendChild(menu);

    // Clear timer when user selects
    clearTimeout(dropdownTimeout);
}

// Close dropdown if clicked outside
document.addEventListener("click", (e) => {
    if (!e.target.closest('.dropdown-container1') && !e.target.closest('.dropdown-menu1')) {
        document.querySelectorAll('.dropdown-menu1.show').forEach(menu => {
            menu.classList.remove('show');
            if (menu.originalParent)
                menu.originalParent.appendChild(menu);
        });
        clearTimeout(dropdownTimeout);
    }
});

function updateCheckboxesDayparts(recipesdayparts) {
    for (const [id, mask] of Object.entries(daypartsmaping)) {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = !!(recipesdayparts.ProductGroup & mask);
        }
    }
}

function getDaypartsBitmask() {

    let productGroup = 0;
    for (const [id, mask] of Object.entries(daypartsmaping)) {
        if (document.getElementById(id).checked) {
            productGroup |= mask;
        }
    }
    return productGroup;
}

//page1 and page 2 syncup
function setupStageSync() {
    const tbody1 = document.getElementById('recipeEditorBody');
    const tbody2 = document.getElementById('recipeEditorBody3');

    if (!tbody1 || !tbody2) {
        console.warn("Recipe editor tables not found in DOM.");
        return;
    }

    const rows1 = tbody1.querySelectorAll("tr");
    const rows2 = tbody2.querySelectorAll("tr");

    rows1.forEach((row1, i) => {
        const input1Action = row1.querySelector(".action-input");
        const input1Time = row1.querySelector(".time-input");

        const row2 = rows2[i];
        if (!row2)
            return;

        const input2Action = row2.querySelector(".action-input");
        const input2Time = row2.querySelector(".time-input");

        // --- StageAction Sync ---
        if (input1Action && input2Action) {
            input1Action.oninput = () => {
                const newVal = input1Action.value.trim();
                if (newVal !== input2Action.value.trim()) {
                    input2Action.value = newVal;
                }
            };

            input2Action.oninput = () => {
                const newVal = input2Action.value.trim();
                if (newVal !== input1Action.value.trim()) {
                    input1Action.value = newVal;
                }
            };
        }

        // --- StageTime Sync ---
        if (input1Time && input2Time) {
            input1Time.oninput = () => {
                const newVal = input1Time.value.trim();
                if (newVal !== input2Time.value.trim()) {
                    input2Time.value = newVal;
                }
            };

            input2Time.oninput = () => {
                const newVal = input2Time.value.trim();
                if (newVal !== input1Time.value.trim()) {
                    input1Time.value = newVal;
                }
            };
        }
    });
}

function collectRecipeData() {
    const recipe = {
        ...currentRecipe
    }; // clone the current recipe object
    recipe.ProductGroup = getDaypartsBitmask();
    recipe.ProductName = document.getElementById("recipeNameButton").textContent;
    recipe.PrepMoreEnabled = document.getElementById("prepMoreCheckbox").checked;
    recipe.ProductType = currentRecipeProductType;
    recipe.StageAction = [];
    recipe.StageTime = [];
    recipe.DeltaSum = [];
    recipe.AutoCancel = [];
    recipe.TotalTime = 0;
    recipe.TotalActiveStages = 0;
    // Page 1 table
    document.querySelectorAll("#recipeEditorBody tr").forEach((row, i) => {
        const action = row.querySelector(".action-input")?.value || "";
        const time = row.querySelector(".time-input")?.value || "00:00:00";
        const deltaBtn = row.querySelector("[data-type='delta']");
        const autoBtn = row.querySelector("[data-type='autocancel']");
        const imgBtn = row.querySelector(".green-pic-btn");

        recipe.StageAction[i] = action;
        recipe.StageTime[i] = parseTimeToSeconds(time);
        recipe.DeltaSum[i] = deltaBtn ? parseInt(deltaBtn.dataset.state) : 0;
        recipe.AutoCancel[i] = autoBtn ? autoBtn.dataset.state === "true" : false;

    });

    // Page 2 table
    recipe.TimeDecrement = [];
    recipe.AlarmOnOff = [];
    recipe.AlarmPattern = [];
    recipe.AlarmVolume = [];

    document.querySelectorAll("#recipeEditorBody3 tr").forEach((row, i) => {
        const action = row.querySelector(".action-input")?.value || "";
        const time = row.querySelector(".time-input")?.value || "00:00:00";
        const alarmBtn = row.querySelector("[data-type='alarm']");
        const patternBtn = row.querySelector("[data-type='pattern']");
        const volumeBtn = row.querySelector("[data-type='volume']");
        const timeDecrement = row.querySelector("[data-type='timeDecrementincrement']");

        recipe.StageAction[i] = action; // overwrite if changed in page2
        recipe.StageTime[i] = parseTimeToSeconds(time);
        recipe.TimeDecrement[i] = timeDecrement ? parseInt(timeDecrement.dataset.state) : 1; // you can extend with up/down count
        recipe.AlarmOnOff[i] = alarmBtn ? parseInt(alarmBtn.dataset.state) : 0;
        recipe.AlarmPattern[i] = patternBtn ? parseInt(patternBtn.dataset.state) : 1;
        recipe.AlarmVolume[i] = volumeBtn ? parseInt(volumeBtn.dataset.state) : 1;
    });
   for (let k = 0; k < recipe.StageTime.length; k++) {
    let stage = recipe.StageTime[k];

    // Stop if stage time is invalid
    if (stage <= 0)
        break;

    // Check if adding this stage exceeds the limit
    if (recipe.TotalTime + stage > 359999) {
        // Trim this stage so total time is exactly 359999
        recipe.StageTime[k] = 359999 - recipe.TotalTime;
        recipe.TotalTime = 359999;
        recipe.TotalActiveStages++;
        break;
    }

    // Otherwise, include this stage fully
    recipe.TotalTime += stage;
    recipe.TotalActiveStages++;
}

// Set remaining stages (after limit) to 0
for (let j = recipe.TotalActiveStages; j < recipe.StageTime.length; j++) {
    recipe.StageTime[j] = 0;
}

    return recipe;
}

function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number);

    if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        // Only seconds
        return parts[0];
    }
    return 0;
}


let dropdownTimeoutHomepage;

// --- Food Group Dropdown ---
const foodButton = document.getElementById("foodGroupButton");
const foodDropdown = document.getElementById("foodGroupDropdown");

const foodGroups = [{
        name: "Vegetables",
        group: "vegetable"
    }, {
        name: "Poultry",
        group: "poultry"
    }, {
        name: "Seafood",
        group: "seafood"
    }, {
        name: "Meat",
        group: "meat"
    }, {
        name: "All",
        group: "all"
    }
];

foodGroups.forEach(fg => {
    const li = document.createElement("li");
    li.textContent = fg.name;
    li.dataset.group = fg.group;
    li.addEventListener("click", () => selectDropdownItem(foodDropdown, fg.group, li, FilterRecipes));
    foodDropdown.appendChild(li);
});

// --- Day Parts Dropdown ---
const dayButton = document.getElementById("dayPartsButton");
const dayDropdown = document.getElementById("dayPartsDropdown");

const dayParts = [{
        name: "BREAKFAST",
        group: "BREAKFAST"
    }, {
        name: "LUNCH",
        group: "LUNCH"
    }, {
        name: "DINNER",
        group: "DINNER"
    }, {
        name: "LATENIGHT",
        group: "LATENIGHT"
    }, {
        name: "ALL",
        group: "ALL"
    }
];

dayParts.forEach(dp => {
    const li = document.createElement("li");
    li.textContent = dp.name;
    li.dataset.group = dp.group;
    li.addEventListener("click", () => selectDropdownItem(dayDropdown, dp.group, li, FilterRecipesDayParts));
    dayDropdown.appendChild(li);
});

// --- Unified dropdown toggle function ---
function toggleDropdown(dropdown) {
  //  if (dropdown === dayDropdown && deviceSettings["Auto DayPart Enabled"] === "1" || deviceSettings["Auto DayPart Enabled"] === 1)
	//{
	//	dayDropdown.disabled;
    //    return; // prevent open if disabled
	//}
    // Close all other dropdowns
    document.querySelectorAll(".dropmenu1.show").forEach(d => {
        if (d !== dropdown)
            d.classList.remove("show");
    });

    // Toggle current dropdown
    if (!dropdown.classList.contains("show")) {
        dropdown.classList.add("show");

        // Auto-close after 5 seconds
        clearTimeout(dropdownTimeoutHomepage);
        dropdownTimeoutHomepage = setTimeout(() => {
            dropdown.classList.remove("show");
        }, 5000);

    } else {
        dropdown.classList.remove("show");
        clearTimeout(dropdownTimeoutHomepage);
    }
}

// --- Toggle events for buttons ---
foodButton.addEventListener("click", e => {
    e.stopPropagation();
    toggleDropdown(foodDropdown);
});
dayButton.addEventListener("click", e => {
    e.stopPropagation();
    toggleDropdown(dayDropdown);
});

// --- Selection logic ---
function selectDropdownItem(dropdown, group, liElement, callback) {
    // Remove previous selection
    dropdown.querySelectorAll("li").forEach(li => li.classList.remove("selected"));

    // Highlight selected
    liElement.classList.add("selected");

    // Callback function (filter recipes)
    callback(group);

    // Close dropdown
    dropdown.classList.remove("show");
    clearTimeout(dropdownTimeoutHomepage);

    // Update button color if Food Group
    if (dropdown.id === "foodGroupDropdown") {
        const button = document.getElementById("foodGroupButton");
        button.classList.remove("food-group-vegetable", "food-group-poultry", "food-group-meat", "food-group-seafood", "food-group-all");
        button.classList.add(`food-group-${group}`);
    }
}


function setDropdownSelection(dropdown, group, callback) {
  const li = Array.from(dropdown.querySelectorAll("li")).find(li => li.dataset.group === group);
  if (li) selectDropdownItem(dropdown, group, li, callback);
}

function clearDropdownSelection(dropdown) {
  dropdown.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
}


// --- Close dropdowns when clicking outside ---
window.addEventListener("click", () => {
    document.querySelectorAll(".dropmenu1.show").forEach(drop => drop.classList.remove("show"));
    clearTimeout(dropdownTimeoutHomepage);
});

function FilterRecipes(recipegroup) {
	clearDropdownSelection(dayDropdown);    // clears all day part selections
    currentPage = 1;
    if (recipegroup == 'vegetable') {
        renderRecipeTiles(currentPage, allRecipesVegetable, true); // filter tiles to show new image
    } else if (recipegroup == 'poultry') {
        renderRecipeTiles(currentPage, allRecipesPoultry, true); // filter tiles to show new image
    } else if (recipegroup == 'meat') {
        renderRecipeTiles(currentPage, allRecipesMeat, true); // filter tiles to show new image
    } else if (recipegroup == 'seafood') {
        renderRecipeTiles(currentPage, allRecipesSeafood, true); // filter tiles to show new image
    } else if (recipegroup == 'all') {
        renderRecipeTiles(currentPage, allRecipes, true); // filter tiles to show new image
    }

}

function FilterRecipesDayParts(recipegroup) {
	clearDropdownSelection(foodDropdown);   // clears all food group selections
    currentPage = 1;
    if (recipegroup == 'BREAKFAST') {
        renderRecipeTiles(currentPage, allRecipesBreakFast, true); // filter tiles to show new image
    } else if (recipegroup == 'LUNCH') {
        renderRecipeTiles(currentPage, allRecipesLunch, true); // filter tiles to show new image
    } else if (recipegroup == 'DINNER') {
        renderRecipeTiles(currentPage, allRecipesDinner, true); // filter tiles to show new image
    } else if (recipegroup == 'LATENIGHT') {
        renderRecipeTiles(currentPage, allRecipesLateNight, true); // filter tiles to show new image
    } else if (recipegroup == 'ALL') {
        renderRecipeTiles(currentPage, allRecipes, true); // filter tiles to show new image
    }
}

// Function to trigger the file input click
function changeImage() {
    document.getElementById('imageInput').click();
}
// Function to trigger the file input click
function changeBuildImage() {
    document.getElementById('BuildimageUploadInput').click();
}
/* -------------------- EDITOR HELPERS END-------------------- */

/* -------------------- Event Listeners -------------------- */
document.addEventListener('DOMContentLoaded', () => {

    const stationElem = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");

    // update every second
    setInterval(updateTime, 1000);
    updateTime(); // initial call


    /* -------------------- Load Recipe JSON START-------------------- */
    var xhr = new XMLHttpRequest();
    //xhr.open('GET', `/external-files/${stationElem}/TcpTTProductExportPC/fonts/RecipeDatabase1.json`, true); // Path to your JSON file

    var url = `/external-files/${stationElem}/TcpTTProductExportPC/fonts/RecipeDatabase1.json`;

    // Append a timestamp (unique each request)
    url += "?t=" + new Date().getTime();

    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var content = JSON.parse(xhr.responseText);
                if (Array.isArray(content)) {
                    allRecipes.push(...content);
                    totalPages = Math.ceil(allRecipes.length / recipesPerPage);
                    currentPage = 1;

                    renderRecipeTiles(currentPage, allRecipes, true);
                    for (let i = 0; i < allRecipes.length; i++) {

                        if (allRecipes[i].ProductType === 0) {
                            allRecipesVegetable.push(allRecipes[i]); // push instead of index assignment
                        } else if (allRecipes[i].ProductType === 1) {
                            allRecipesPoultry.push(allRecipes[i]);
                        } else if (allRecipes[i].ProductType === 2) {
                            allRecipesMeat.push(allRecipes[i]);
                        } else if (allRecipes[i].ProductType === 3) {
                            allRecipesSeafood.push(allRecipes[i]);
                        }
                        if (allRecipes[i].ProductGroup & 1)
                            allRecipesBreakFast.push(allRecipes[i]);
                        if (allRecipes[i].ProductGroup & 2)
                            allRecipesLunch.push(allRecipes[i]);
                        if (allRecipes[i].ProductGroup & 4)
                            allRecipesDinner.push(allRecipes[i]);
                        if (allRecipes[i].ProductGroup & 8)
                            allRecipesLateNight.push(allRecipes[i]);

                    }
                }
            } catch (e) {
                alert('Error parsing JSON:', e);
            }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            alert('Error loading JSON:', xhr.status, xhr.statusText);
        }
    };
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.send();
    /* -------------------- Load Recipe JSON END--------------------------- */

    // Call this after recipes are loaded (or immediately on DOM load)
    loadAlertsFile(); // alerts loading

    loadDeviceSettingsFile(); //device cofigs

    loadUserGroupFile(); // user groups

    loadDayPartsFile(); // day parts


    /* --------------Screen  Pagination Buttons START---------------------- */

    const buttons = document.querySelectorAll(".topbar-button");

    buttons.forEach(btn => btn.classList.remove("selected")); // remove any previous selection screen button

    if (currentPageScreen === "home") {
        document.getElementById("home").classList.add("selected");
    } else if (currentPageScreen === "settings") {
        document.getElementById("setting").classList.add("selected");
    }
    document.getElementById('home').addEventListener('click', changehomescreen);
    document.getElementById('setting').addEventListener('click', changesettingscreen);
    document.getElementById('cancelSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('RecipeEditButton').addEventListener('click', () => {
        document.getElementById("settingsModal").style.display = "none";
        openRecipSettingsModal();
    });

    document.getElementById('DisplaySettings').addEventListener('click', () => {
        document.getElementById("settingsModal").style.display = "none";
        displayModal.style.display = "flex";
        currentbrightness = (deviceSettings["Brightness"] || "0") * 10;
        updateProgressbrightnessprogressBar();
    });
    document.getElementById('VolumeandSoundSettings').addEventListener("click", () => {
        document.getElementById("settingsModal").style.display = "none";
        document.getElementById("volumeSoundsModal").style.display = "flex";
        currentvolume = (deviceSettings["Master Volume"] || "0") * 10;
        updateProgress();
    });
	setDropdownSelection(foodDropdown, "all", FilterRecipes);
	
    document.getElementById('openDayPartsBtn')?.addEventListener("click", () => {
        document.getElementById("settingsModal").style.display = "none";
        const menuItems = document.querySelectorAll('.dayparts-menu .menu-item');

        // 👉 1. Clear ALL active states first
        menuItems.forEach(btn => btn.classList.remove('active'));

        // 👉 2. Set default active daypart (BREAKFAST)
        const defaultItem = Array.from(menuItems).find(
                item => item.textContent.trim().toUpperCase() === "BREAKFAST");
        if (defaultItem) {
            defaultItem.classList.add('active');
            currentlyEditingDayPart = "BREAKFAST";
            renderDayParts(allDayParts["BREAKFAST"]);
        }

        // 👉 3. Remove any existing old event listeners before adding new ones
        menuItems.forEach(item => {
            // Clone node trick removes all previous listeners
            const newItem = item.cloneNode(true);
            item.replaceWith(newItem);

            // Add fresh listener
            newItem.addEventListener('click', () => {
               const result = saveCurrentDayPartToArray();

				if (result === true) {
					console.log("DayPart saved successfully!");
				} else {
					alert(result); // show the returned error message
					//return;
				}


                // Switch active
                const allItems = document.querySelectorAll('.dayparts-menu .menu-item');
                allItems.forEach(btn => btn.classList.remove('active'));
                newItem.classList.add('active');

                // Update editing
                const daypartName = newItem.textContent.trim().toUpperCase();
                currentlyEditingDayPart = daypartName;

                // Render selected times
                renderDayParts(allDayParts[daypartName]);
            });
        });

          // Restore state from settings
			const value = deviceSettings?.["Auto DayPart Enabled"];
			checkboxstatus.checked = value == 1 || value === "1"; // both 1 and "1" supported

			// Track changes
			checkboxstatus.addEventListener('change', () => {
				autoDayPartChanged = true;
				console.log("Auto DayPart changed:", checkboxstatus.checked);
			});


        document.getElementById("dayPartsModal").style.display = "flex";
    });

    document.getElementById('openDimTimerBtn').addEventListener("click", () => {
        document.getElementById("settingsModal").style.display = "none";
        document.getElementById("dimTimerModal").style.display = "flex";
        // Update timer and brightness
        document.getElementById('dimTimerValue').textContent = deviceSettings["Dim Timer"] || "0";
        document.getElementById('dimBrightnessValue').textContent = 7 - (deviceSettings["DimBrightness"] || "0");

    });

    document.getElementById('alertsBtn').addEventListener("click", () => {
        document.getElementById("settingsModal").style.display = "none";
        renderAlertList();
        document.getElementById("alertListModal").style.display = "flex";
    });

    /* --------------Screen  Pagination Buttons END---------------------- */

    /* --------------RECIPE  Pagination Buttons START---------------------- */
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderRecipeTiles(currentPage, CurrentDisplayingRecipes, false);
        }
    });
    document.getElementById('nextPageBtn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderRecipeTiles(currentPage, CurrentDisplayingRecipes, false);
        }
    });

    /* --------------RECIPE  Pagination Buttons END---------------------- */

    /* --------------------RECIPE Modal Buttons START -------------------- */
    document.getElementById('closeButton').addEventListener('click', () => {
        document.getElementById('recipeEditorModal').style.display = 'none';
    });

    document.getElementById('cancelEditorButton').addEventListener('click', () => {
        document.getElementById('recipeEditorModal').style.display = 'none';

    });

    document.getElementById('saveEditorButton').addEventListener('click', saveRecipe);

    document.getElementById('deleteRecipeBtn').addEventListener('click', deleteCurrentRecipe);

    const recipeNameBtn = document.getElementById('recipeNameButton');

    recipeNameBtn.addEventListener('keypress', function (e) {
        if (this.innerText.length >= 20) {
            e.preventDefault(); // block extra characters
        }
    });

    //recipeNameBtn.addEventListener('blur', updateRecipeName);


    document.getElementById('imageButton').addEventListener('click', changeImage);
    document.getElementById('BuildimageButton').addEventListener('click', changeBuildImage);

    // New event listener for the editable recipe name div
    document.getElementById('recipeNameButton').addEventListener('blur', updateRecipeName);
    // Event listener for the new image file input
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    // Event listener for the new image file input
    document.getElementById('BuildimageUploadInput').addEventListener('change', handleBuildImageUpload);

    /* --------------------RECIPE Modal Buttons END -------------------- */

    /* -------------------- Max Batch Count Modal START------------------ */
    document.getElementById('maxBatchBtn').addEventListener('click', () => {
        if (currentRecipe) {
            originalMaxBatchCount = currentRecipe.MaxBatchCount || 0;
            document.getElementById('batch-count').textContent = originalMaxBatchCount.toString().padStart(2, '0');
            document.getElementById('maxBatchCountPopup').style.display = 'flex';
        }
    });

    document.getElementById('btn-ok').addEventListener('click', () => {
        const newCount = parseInt(document.getElementById('batch-count').textContent, 10);
        if (currentRecipe) {
            currentRecipe.MaxBatchCount = newCount;
        }
        document.getElementById('maxBatchCountPopup').style.display = 'none';
    });
    document.getElementById('btn-cancel').addEventListener('click', () => {
        document.getElementById('maxBatchCountPopup').style.display = 'none';
    });

    const batchCountEl = document.getElementById('batch-count');
    const arrowUp = document.getElementById('arrow-up');
    const arrowDown = document.getElementById('arrow-down');

    function updateBatchCount(newCount) {
        if (newCount < 0)
            newCount = 0;
        if (newCount > 20)
            newCount = 20;
        batchCountEl.textContent = newCount.toString().padStart(2, '0');
    }

    arrowUp.addEventListener('click', () => {
        let currentCount = parseInt(batchCountEl.textContent, 10);
        updateBatchCount(currentCount + 1);
    });
    arrowDown.addEventListener('click', () => {
        let currentCount = parseInt(batchCountEl.textContent, 10);
        updateBatchCount(currentCount - 1);
    });
    /* -------------------- Max Batch Count Modal END------------------ */

    /* -------------------- Build Info Modal START-------------------- */
    document.getElementById('buildInfoBtn').addEventListener('click', () => {
        document.getElementById('buildInfoModal').style.display = 'flex';

    });
    document.getElementById('closeBuildInfoModal').addEventListener('click', () => {
        document.getElementById('buildInfoModal').style.display = 'none';
    });
    document.getElementById('cancelbuildInfo').addEventListener('click', () => {
        document.getElementById('buildInfoModal').style.display = 'none';
    });

    document.getElementById('savebuildInfo').addEventListener('click', () => {
        document.getElementById('buildInfoModal').style.display = 'none';
        proimageselectedImageFile = proimageselectedImageFilePreview;
    });
 // ✅ Automatically trigger existing logout form after transfer completes
    const logoutForm = document.querySelector('#deviceOptionDropdown form');
	
    document.getElementById('closeAlertModal').addEventListener('click', () => {
        document.getElementById('alertModal').style.display = 'none';
        document.getElementById('uploadButton').disabled = false;
        document.getElementById('transferButton').disabled = false;
		if(TransferSuccessful) {
			logoutForm.submit(); // same as clicking Disconnect
		}

        const stationElem = document.getElementById('stationname').innerText
            .trim()
            .replace(/\s+/g, "_");

        var xhr = new XMLHttpRequest();
        //xhr.open('GET', `/external-files/${stationElem}/TcpTTProductExportPC/fonts/RecipeDatabase1.json`, true); // Path to your JSON file

        var url = `/external-files/${stationElem}/TcpTTProductExportPC/fonts/RecipeDatabase1.json`;

        // Append a timestamp (unique each request)
        url += "?t=" + new Date().getTime();

        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var content = JSON.parse(xhr.responseText);
                    if (Array.isArray(content)) {
                        allRecipes.length = 0; // clear array

                        allRecipesVegetable.length = 0; // clear array
                        allRecipesPoultry.length = 0; // clear array
                        allRecipesMeat.length = 0; // clear array
                        allRecipesSeafood.length = 0; // clear array

                        allRecipesBreakFast.length = 0; // clear array
                        allRecipesLunch.length = 0; // clear array
                        allRecipesDinner.length = 0; // clear array
                        allRecipesLateNight.length = 0; // clear array

                        allRecipes.push(...content);
                        totalPages = Math.ceil(allRecipes.length / recipesPerPage);
                        currentPage = 1;

                        //renderRecipeTiles(currentPage, allRecipes, true);
						setDropdownSelection(foodDropdown, "all", FilterRecipes);
                        for (let i = 0; i < allRecipes.length; i++) {

                            if (allRecipes[i].ProductType === 0) {
                                allRecipesVegetable.push(allRecipes[i]); // push instead of index assignment
                            } else if (allRecipes[i].ProductType === 1) {
                                allRecipesPoultry.push(allRecipes[i]);
                            } else if (allRecipes[i].ProductType === 2) {
                                allRecipesMeat.push(allRecipes[i]);
                            } else if (allRecipes[i].ProductType === 3) {
                                allRecipesSeafood.push(allRecipes[i]);
                            }
                            if (allRecipes[i].ProductGroup & 1)
                                allRecipesBreakFast.push(allRecipes[i]);
                            if (allRecipes[i].ProductGroup & 2)
                                allRecipesLunch.push(allRecipes[i]);
                            if (allRecipes[i].ProductGroup & 4)
                                allRecipesDinner.push(allRecipes[i]);
                            if (allRecipes[i].ProductGroup & 8)
                                allRecipesLateNight.push(allRecipes[i]);

                        }
                    }
                } catch (e) {
                    alert('Error parsing JSON:', e);
                }
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                alert('Error loading JSON:', xhr.status, xhr.statusText);
            }
        };
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.send();

        currentPageScreen = "settings";

    });
    /* -------------------- Build Info Modal END-------------------- */

    /* -------------------- Content Table Handlers START-------------------- */
    document.getElementById('content1').addEventListener('click', (e) => {

         document.querySelectorAll(".time-input").forEach(input => {
    // Typing logic
    input.addEventListener("input", function () {
        // Remove non-digits, allow max 6 digits
        let digits = this.value.replace(/\D/g, "").slice(0, 6);

        if (digits.length === 0) {
            this.value = "";
            return;
        }

        // Add colons based on length
        if (digits.length <= 2) {
            this.value = digits; // HH
        } else if (digits.length <= 4) {
            this.value = digits.slice(0, 2) + ":" + digits.slice(2); // HH:MM
        } else {
            this.value = digits.slice(0, 2) + ":" + digits.slice(2, 4) + ":" + digits.slice(4); // HH:MM:SS
        }
    });

    // Blur (when focus leaves)
    input.addEventListener("blur", function () {
        let digits = this.value.replace(/\D/g, "").slice(0, 6);

        let hh = "00", mm = "00", ss = "00";

        if (digits.length >= 5) {
            hh = digits.slice(0, -4).padStart(2, "0");
            mm = digits.slice(-4, -2);
            ss = digits.slice(-2);
        } else if (digits.length >= 3) {
            hh = "00";
            mm = digits.slice(0, -2).padStart(2, "0");
            ss = digits.slice(-2);
        } else if (digits.length >= 1) {
            hh = digits.padStart(2, "0");
        }

        // Cap values
        if (parseInt(mm, 10) > 59) mm = "59";
        if (parseInt(ss, 10) > 59) ss = "59";

        this.value = `${hh}:${mm}:${ss}`;
    });
});

        const toggleBtn = e.target.closest('.toggle-btn');
        if (toggleBtn) {
            const type = toggleBtn.dataset.type;
            const img = toggleBtn.querySelector('img');
            const textSpan = toggleBtn.querySelector('.toggle-text');
            const currentState = toggleBtn.dataset.state;
            let newState;

            switch (type) {
            case 'delta':
                newState = currentState === '1' ? '0' : '1';
                toggleBtn.dataset.state = newState;
                img.src = newState === '1'
                     ? '/external-files/ApplicationFiles/IMAGES/KB_icons/no-delta-sum-01-02.png'
                     : '/external-files/ApplicationFiles/IMAGES/KB_icons/no-delta-sum-01.png';
                if (textSpan)
                    textSpan.textContent = newState === '1' ? "ON" : "OFF";
                break;
            case 'autocancel':
                newState = currentState === 'true' ? 'false' : 'true';
                toggleBtn.dataset.state = newState;
                img.src = newState === 'true'
                     ? '/external-files/ApplicationFiles/IMAGES/KB_icons/touch-01-01.png'
                     : '/external-files/ApplicationFiles/IMAGES/KB_icons/touch-02.png';
                if (textSpan)
                    textSpan.textContent = newState === 'true' ? "ON" : "OFF";
                break;
            }
            return;
        }

        const picBtn = e.target.closest('.green-pic-btn');

        if (picBtn) {
            const stageIndex = picBtn.dataset.stageIndex;
            const fileInput = document.querySelector(`.stage-image-input[data-stage-index="${stageIndex}"]`);
            if (fileInput) {
                fileInput.click();
            }
            return;
        }
    });

    // Single button color toggle
    document.getElementById('content1').addEventListener('click', (e) => {
        const button = e.target.closest('#groupTypeButton');
        if (button) {
            let currentId = Number(button.dataset.groupId);
            let newId = currentId >= 4 ? 1 : currentId + 1;
            button.dataset.groupId = newId;
            button.style.backgroundColor = getGroupColor(newId);
        }
    });

    // Handle stage image upload
    document.getElementById('content1').addEventListener('change', (e) => {
        const fileInput = e.target.closest('.stage-image-input');

        if (fileInput) {
            const file = fileInput.files[0];
            if (!file)
                return;

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file");
                return;
            }

            const stageIndex = fileInput.dataset.stageIndex;
            const picBtn = document.querySelector(`.green-pic-btn[data-stage-index="${stageIndex}"]`);

            // Save both file and file name
            stageImageFiles[stageIndex] = file;
            stageImageFileNames[stageIndex] = file.name;

            // Show preview instantly
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataURL = event.target.result;
                picBtn.style.backgroundImage = `url('${dataURL}')`;
                picBtn.classList.add('has-image');
                picBtn.textContent = ""; // clear text
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle count, alarm, pattern, volume button toggles with images
    document.getElementById('content2').addEventListener('click', (e) => {

       document.querySelectorAll(".time-input").forEach(input => {
    // Typing logic
    input.addEventListener("input", function () {
        // Remove non-digits, allow max 6 digits
        let digits = this.value.replace(/\D/g, "").slice(0, 6);

        if (digits.length === 0) {
            this.value = "";
            return;
        }

        // Add colons based on length
        if (digits.length <= 2) {
            this.value = digits; // HH
        } else if (digits.length <= 4) {
            this.value = digits.slice(0, 2) + ":" + digits.slice(2); // HH:MM
        } else {
            this.value = digits.slice(0, 2) + ":" + digits.slice(2, 4) + ":" + digits.slice(4); // HH:MM:SS
        }
    });

    // Blur (when focus leaves)
    input.addEventListener("blur", function () {
        let digits = this.value.replace(/\D/g, "").slice(0, 6);

        let hh = "00", mm = "00", ss = "00";

        if (digits.length >= 5) {
            hh = digits.slice(0, -4).padStart(2, "0");
            mm = digits.slice(-4, -2);
            ss = digits.slice(-2);
        } else if (digits.length >= 3) {
            hh = "00";
            mm = digits.slice(0, -2).padStart(2, "0");
            ss = digits.slice(-2);
        } else if (digits.length >= 1) {
            hh = digits.padStart(2, "0");
        }

        // Cap values
        if (parseInt(mm, 10) > 59) mm = "59";
        if (parseInt(ss, 10) > 59) ss = "59";

        this.value = `${hh}:${mm}:${ss}`;
    });
});


        const toggleBtn = e.target.closest('.toggle-btn');
        if (toggleBtn) {
            const type = toggleBtn.dataset.type;
            const img = toggleBtn.querySelector('img');
            const textSpan = toggleBtn.querySelector('.toggle-text'); // ✅ FIX: define span
            let currentState = Number(toggleBtn.dataset.state);
            let newState;

            switch (type) {
            case 'timeDecrementincrement':
                newState = currentState === 1 ? 0 : 1;
                toggleBtn.dataset.state = newState;
                img.src = newState === 1 ? '/external-files/ApplicationFiles/IMAGES/KB_icons/down-arrow.png' : '/external-files/ApplicationFiles/IMAGES/KB_icons/up-arrow.png';
                break;
            case 'alarm':
                newState = currentState === 1 ? 0 : 1;
                toggleBtn.dataset.state = newState;
                img.src = newState === 1 ? '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-01.png' : '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-02-01.png';
                if (textSpan)
                    textSpan.textContent = newState === 1 ? "ON" : "OFF";
                break;
            case 'pattern':
                // Cycle through 5 states (1 to 5)
                newState = currentState >= 5 ? 1 : currentState + 1;
                toggleBtn.dataset.state = newState;
                switch (newState) {
                case 1:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L1-01.png';
                    break;
                case 2:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L2-01.png';
                    break;
                case 3:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L3-01.png';
                    break;
                case 4:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L4-01.png';
                    break;
                case 5:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L5-01.png';
                    break;
                }
                if (textSpan)
                    textSpan.textContent = `${newState}`;
                break;
            case 'volume':
                // Cycle through 3 states (1 to 5)
                newState = currentState >= 5 ? 1 : currentState + 1;
                toggleBtn.dataset.state = newState;
                switch (newState) {
                case 1:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-01-01.png';
                    break;
                case 2:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-02-01.png';
                    break;
                case 3:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-03-01.png';
                    break;
                case 4:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-04-01.png';
                    break;
                case 5:
                    img.src = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-05-01.png';
                    break;
                }
                if (textSpan)
                    textSpan.textContent = `${newState}`; // e.g. L1, L2...
                break;
            }
            return;
        }
    });

});
/* -------------------- SLIDER FUNCTION -------------------- */

function toggleStage() {
    const toggle = document.getElementById("pageToggle");
    const content1 = document.getElementById('content1');
    const content2 = document.getElementById('content2');

    if (toggle.checked) {
        content1.style.display = 'flex';
        content2.style.display = 'none';
    } else {
        content1.style.display = 'none';
        content2.style.display = 'flex';
    }
}

/*
function nextStageBtn() {
const content1 = document.getElementById('content1');
const content2 = document.getElementById('content2');
if (content1.style.display === 'none') {
content1.style.display = 'flex'; // Use flex to match the wrapper's display
content2.style.display = 'none';
} else {
content1.style.display = 'none';
content2.style.display = 'flex'; // Use flex to match the wrapper's display
}
}
 */

document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('uploadButton').disabled = true;
    document.getElementById('transferButton').disabled = true;
    const modal = document.getElementById('modalfilecopy');
    const modalMessage = document.getElementById('modalMessage');
    // Show modal with spinner
    modal.style.display = 'flex';
    // Reset animation
    fileIcon.style.animation = 'none';
    fileIcon.offsetHeight; // Trigger reflow
    fileIcon.style.animation = 'moveFile 2s linear infinite';

    //const dataToSend =`/external-files/${stationElem}/TcpTTProductExportPC/`;
    const folderName = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");
    const IpAddress = document.getElementById('ipaddress').innerText
        .trim();
    const appName = document.getElementById('appName').innerText.trim();
    const fetchUrl = '/' + appName + '/api/handleTransferRequest';
    //fetch('/UserApp/api/handleTransferRequest', {
    fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        //body: JSON.stringify(dataToSend) //send data as JSON
        body: JSON.stringify({
            folderName,
            IpAddress
        })
    })
    .then(response => {
        if (!response.ok) {
            showErrorAlert('Network Response was not ok');
        }
        return response.text();
    })
    .then(message => {
        modal.style.display = 'none';
        showSuccessAlert(message);
		TransferSuccessful = true;
		
    })
    .catch(error => {
        console.error('Error', error);
        showErrorAlert('An error occured:' + error.message);
    });

});

// Function to handle image upload to backend and update preview
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file)
        return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
    }

    selectedImageFile = file; // keep for Save

    // Show preview instantly
    const reader = new FileReader();
    reader.onload = function (e) {
        const imgButton = document.getElementById("imageButton");
        imgButton.style.backgroundImage = `url('${e.target.result}')`;
        imgButton.style.backgroundSize = "cover";
        imgButton.style.backgroundPosition = "center";
        imgButton.textContent = ""; // clear text
        productImageChanged = true;
    };
    reader.readAsDataURL(file);
}

function handleBuildImageUpload(event) {
    const file = event.target.files[0];
    if (!file)
        return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
    }

    proimageselectedImageFilePreview = file; // keep for Save for preview pro image
    //proimageselectedImageFile = file; // keep for Save

    // Show preview instantly
    const reader = new FileReader();
    reader.onload = function (e) {
        const imgButton = document.getElementById("BuildimageButton");
        imgButton.style.backgroundImage = `url('${e.target.result}')`;
        imgButton.style.backgroundSize = "cover";
        imgButton.style.backgroundPosition = "center";
        imgButton.textContent = ""; // clear text
    };
    reader.readAsDataURL(file);
}

// --- Detect Product Name change ---
document.getElementById("recipeNameButton").addEventListener("input", (e) => {
    const newName = document.getElementById("recipeNameButton").textContent;
    productNameChanged = (newName !== "" && newName !== "New Recipe");
});

function saveRecipe() {

    if (addNewRecipe.ProductSerialNo === currentRecipe.ProductSerialNo) {
        if (!productNameChanged || !productImageChanged) {
            alert("⚠️ Please change BOTH the Product Name and Recipe Image before saving!");
            return; // Stop saving
        }
    }

    const updatedRecipe = collectRecipeData();
    const stationame = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");
    const formData = new FormData();
    //const file = document.getElementById('imageInput').file[0];
    formData.append("file", selectedImageFile);
    formData.append("buildfile", proimageselectedImageFile);
    for (let index in stageImageFiles) {
        formData.append(`stageImageFile${index}`, stageImageFiles[index]);
    }
    formData.append("stationame", stationame); // <-- add station name here
    formData.append("updatedRecipe", JSON.stringify(updatedRecipe));
    const appName = document.getElementById('appName').innerText.trim();
    const fetchUrl = '/' + appName + '/api/saveRecipesData';

    //fetch("/UserApp/api/saveRecipesData",
    fetch(fetchUrl, {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            showErrorAlert('Network Response was not ok');
        }
        return response.text();
    })
    .then(message => {
        // Optionally reset flags
        productNameChanged = false;
        productImageChanged = false;
        showSuccessAlert(message);
    })
    .catch(error => {
        console.error('Error', error);
        showErrorAlert('An error occured:' + error.message);
    });
    document.getElementById('recipeEditorModal').style.display = 'none';
}

function showConfirm(message, callback) {
    const modal = document.getElementById("confirmModal");
    const msg = document.getElementById("confirmMessage");
    msg.textContent = message;

    modal.style.display = "flex"; // Show modal

    document.getElementById("confirmYes").onclick = () => {
        modal.style.display = "none";
        callback(true);
    };
    document.getElementById("confirmNo").onclick = () => {
        modal.style.display = "none";
        callback(false);
    };
}

function deleteCurrentRecipe() {
    const stationame = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");
    const deletedRecipe = currentRecipe.ProductSerialNo;
    const productName = currentRecipe.ProductName;
    showConfirm(`Are you sure you want to delete Recipe: "${productName}"?`, function (confirmed) {
        if (!confirmed)
            return;

        const formData = new FormData();
        //const file = document.getElementById('imageInput').file[0];
        formData.append("stationame", stationame); // <-- add station name here
        formData.append("deletedRecipe", JSON.stringify(deletedRecipe));
        const appName = document.getElementById('appName').innerText.trim();
        const fetchUrl = '/' + appName + '/api/deleteRecipeData';

        //fetch("/UserApp/api/deleteRecipeData",
        fetch(fetchUrl, {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                showErrorAlert('Network Response was not ok');
            }
            return response.text();
        })
        .then(message => {
            showSuccessAlert(message);
        })
        .catch(error => {
            console.error('Error', error);
            showErrorAlert('An error occured:' + error.message);
        });
        document.getElementById('recipeEditorModal').style.display = 'none';
    });
}

/* -------------------- Alert Modal START-------------------- */
function showErrorAlert(message) {
    document.getElementById("alertSuccess").innerText = message;
    var alertModal = document.getElementById("alertModal");
    alertModal.style.display = "block";
}

function showSuccessAlert(message) {
    document.getElementById("alertSuccess").innerText = message;
    var alertModal = document.getElementById("alertModal");
    alertModal.style.display = "block";
}

/* -------------------- Alert Modal END-------------------- */

// =================== RENDER ALERT LIST ===================
function renderAlertList() {
    const container = document.getElementById("alertListContainer");
    container.innerHTML = "";

    alerts.forEach((alert, index) => {
        const item = document.createElement("div");

        let downloadedfilename = document.getElementById('stationname').innerText
            .trim()
            .replace(/\s+/g, "_"); // replace spaces with "_"
selectedAlertImageFileName = alert.ImageName;
        let alertimagePath = `${alert.ImageName}`.replace(
                "./",
`/${downloadedfilename}/TcpTTProductExportPC/`);
        let alertimagePath1 = `/external-files/${alertimagePath}`;

        alertimagePath1 = alertimagePath1.replace(/ /g, '%20'); // handle spaces
        if (index === editingIndex && selectedAlertImageFileUrl)
            alertimagePath1 = selectedAlertImageFileUrl;

        item.className = "alert-item";
        item.innerHTML = `
        <div class="alert-info">
          <img src="${alertimagePath1}" alt="icon" class="alert-icon">
          <span>${alert.AlertMessageText}</span>
        </div>
        <div class="alert-controls">
          <label class="switch">
            <input type="checkbox" ${alert.WarningEnabled == 1? "checked" : ""}
			onclick="onToggleChange(this, ${index})">
            <span class="alertsliderOnOff"></span>
          </label>
          <button class="edit-btn" ${alert.WarningEnabled == 1 ? "" : "disabled"} onclick="openEditModal(${index})">
		  <img src = '/external-files/ApplicationFiles/IMAGES/KB_icons/edit.png'></button>
          <button class="delete-btn" onclick="deleteAlert(${index})">
		  <img src = '/external-files/ApplicationFiles/IMAGES/KB_icons/delete.png'></button>
        </div>
      `;
        container.appendChild(item);
        // Add event listener to enable/disable Edit button dynamically

    });
}
function onToggleChange(checkbox, index) {
    // Find the corresponding Edit button
    const container = document.getElementById("alertListContainer");
    const alertItem = container.children[index];
    const editBtn = alertItem.querySelector(".edit-btn");

    // Enable/disable edit button based on checkbox
    if (editBtn) {
        editBtn.disabled = !checkbox.checked;
    }

    // Optionally, update your alerts array
    if (checkbox.checked) {
        alerts[index].WarningEnabled = 1;
    } else {
        alerts[index].WarningEnabled = 0;
    }
}

// =================== OPEN EDIT MODAL ===================
function openEditModal(index) {
    editingIndex = index;
    const alert = alerts[index];

    let downloadedfilename = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_"); // replace spaces with "_"
    selectedAlertImageFileName = alert.ImageName;
    let alertimagePath = `${alert.ImageName}`.replace(
            "./",
`/${downloadedfilename}/TcpTTProductExportPC/`);
    let alertimagePath1 = `/external-files/${alertimagePath}`;

    const alertfileName = alertimagePath1.split(/[/\\]/).pop();
    fetch(alertimagePath1)
    .then(function (response) {
        return response.blob();
    })
    .then(function (blob) {
        selectedAlertImageFile = new File([blob], alertfileName, {
            type: blob.type
        });

        // Example: Show image preview
        const preview = document.getElementById("preview");
    })
    .catch(function (error) {
        console.error("Error loading image:",  error);
            
    });

    alertimagePath1 = alertimagePath1.replace(/ /g, '%20'); // for remove spaces
    if (index === editingIndex && selectedAlertImageFileUrl)
        alertimagePath1 = selectedAlertImageFileUrl;

    const start = minutesToTime(alert.StartTime);
    const end = minutesToTime(alert.EndTime);
    const interval = minutesToTime(alert.AlertInterval);

    document.getElementById("alertName").value = alert.AlertMessageText;
    document.getElementById("alertImage").src = alertimagePath1;
    // Update Pattern toggle
    const patternGroup = document.getElementById("patternToggle");
    patternGroup.querySelectorAll(".toggle-option").forEach(opt => {
        if (parseInt(opt.dataset.value) === parseInt(alert.BeepPattern)) {
            opt.classList.add("active");
        } else {
            opt.classList.remove("active");
        }
    });

    // Update Volume toggle
    const volumeGroup = document.getElementById("volumeToggle");
    volumeGroup.querySelectorAll(".toggle-option").forEach(opt => {
        if (parseInt(opt.dataset.value) === parseInt(alert.VolumeLevel)) {
            opt.classList.add("active");
        } else {
            opt.classList.remove("active");
        }
    });

    document.getElementById("startHH").textContent = start.hh;
    document.getElementById("startMM").textContent = start.mm;
    document.getElementById("startAP").textContent = start.ap;

    document.getElementById("endHH").textContent = end.hh;
    document.getElementById("endMM").textContent = end.mm;
    document.getElementById("endAP").textContent = end.ap;

    document.getElementById("repeatHH").textContent = String(interval.hh > 11 ? 0 : interval.hh).padStart(2, '0');
    document.getElementById("repeatMM").textContent = interval.mm;

    document.getElementById("alertListModal").style.display = "none";
    document.getElementById("editAlertModal").style.display = "flex";
}

// =================== SAVE ALERT ===================
document.getElementById("saveAlertBtn").addEventListener("click", () => {
    if (editingIndex !== null) {

        const startMinutes = timeToMinutes(
                document.getElementById("startHH").textContent,
                document.getElementById("startMM").textContent,
                document.getElementById("startAP").textContent);
        const endMinutes = timeToMinutes(
                document.getElementById("endHH").textContent,
                document.getElementById("endMM").textContent,
                document.getElementById("endAP").textContent);
        const alertInterval = timeToMinutes(
                document.getElementById("repeatHH").textContent,
                document.getElementById("repeatMM").textContent,
                "AM");

        alerts[editingIndex].AlertMessageText = document.getElementById("alertName").value;
        alerts[editingIndex].ImageName = selectedAlertImageFileName;
        alerts[editingIndex].BeepPattern = parseInt(document.querySelector("#patternToggle .toggle-option.active").dataset.value);
        alerts[editingIndex].VolumeLevel = parseInt(document.querySelector("#volumeToggle .toggle-option.active").dataset.value);

        alerts[editingIndex].StartTime = startMinutes;
        alerts[editingIndex].EndTime = endMinutes;
        alerts[editingIndex].AlertInterval = alertInterval;
        alerts[editingIndex].nextTriggerTime = startMinutes + alertInterval;

    }
    document.getElementById("editAlertModal").style.display = "none";
    document.getElementById("alertListModal").style.display = "flex";
    renderAlertList();

});

// =================== DELETE ALERT ===================
function deleteAlert(index) {
    alerts.splice(index, 1);
    renderAlertList();
}
function minutesToTime(totalMinutes) {
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    return {
        hh: hours12.toString().padStart(2, "0"),
        mm: minutes.toString().padStart(2, "0"),
        ap: period
    };
}
function timeToMinutes(hh, mm, ap) {
    let hours = parseInt(hh);
    const minutes = parseInt(mm);
    if (ap === "PM" && hours < 12)
        hours += 12;
    if (ap === "AM" && hours === 12)
        hours = 0;
    return hours * 60 + minutes;
}

// =================== ADD NEW ALERT ===================
document.getElementById("addNewAlertBtn").addEventListener("click", () => {
    const newAlert = {
        AlertMessageText: "New Alert",
        ImageName: "./food/NoInfo-R.png",
        StartTime: 0,
        EndTime: 0,
        AlertInterval: 0,
        BeepPattern: 1,
        VolumeLevel: 4,
        MessageAlerted: 0,
        WarningEnabled: 0,
        nextTriggerTime: 0
    };
    alerts.push(newAlert);
    renderAlertList();
});

// =================== BACK BUTTON edit alert ===================
document.getElementById("closeEditModalBtn").addEventListener("click", () => {
    document.getElementById("editAlertModal").style.display = "none";
    document.getElementById("alertListModal").style.display = "flex";
});

const dimmodal = document.getElementById('dimTimerModal');
const timerEl = document.getElementById('dimTimerValue');
const brightnessEl = document.getElementById('dimBrightnessValue');

document.querySelectorAll('.arrow').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        let timerVal = parseInt(timerEl.textContent);
        let brightnessVal = parseInt(brightnessEl.textContent);

        switch (type) {
        case 'timer-up':
            if (timerVal < 180)
                timerVal += 15;
            break;
        case 'timer-down':
            if (timerVal >= 15)
                timerVal -= 15;
            break;
        case 'brightness-up':
            if (brightnessVal < 6)
                brightnessVal++;
            break;
        case 'brightness-down':
            if (brightnessVal > 1)
                brightnessVal--;
            break;
        }

        timerEl.textContent = timerVal;
        brightnessEl.textContent = brightnessVal;
    });
});

// Save modal values
document.getElementById('saveDimTimerBtn').addEventListener('click', () => {
    const timerVal = timerEl.textContent;
    const brightnessVal = brightnessEl.textContent;
    // Prepare updated device settings
    deviceSettings["Dim Timer"] = timerVal;
    deviceSettings["DimBrightness"] = 7 - brightnessVal;
    saveDeviceSettingsInToFile();
    dimmodal.style.display = 'none';
});

let currentbrightness = 10; // initial value
const brightnessprogressBar = document.getElementById("brightnessprogressBar");
const bprogressLabel = document.getElementById("brightnessValue");

function updateProgressbrightnessprogressBar() {
    currentbrightness = Math.max(0, Math.min(100, currentbrightness));
    brightnessprogressBar.style.width = currentbrightness + "%";
    bprogressLabel.textContent = currentbrightness + "%";
}

const displayModal = document.getElementById("displayModal");
const closedisplayModalBtn = document.getElementById("closeDisplayModalBtn");
// Close modal
closedisplayModalBtn.addEventListener("click", () => {
    document.getElementById("displayModal").style.display = "none";
    document.getElementById("settingsModal").style.display = "flex";
});

document.getElementById("saveDisplayModalBtn").addEventListener("click", () => {
    deviceSettings["Brightness"] = currentbrightness / 10;
    saveDeviceSettingsInToFile();
    document.getElementById("displayModal").style.display = "none";
});
// Increase / Decrease buttons
document.getElementById("brightnessincreaseBtn").addEventListener("click", () => {
    currentbrightness += 10;
    updateProgressbrightnessprogressBar();
});

document.getElementById("brightnessdecreaseBtn").addEventListener("click", () => {
    currentbrightness -= 10;
    updateProgressbrightnessprogressBar();
});

let currentvolume = 10; // initial value
const progressBar = document.getElementById("progressBar");
const progressLabelval = document.getElementById("SettingVolumeValue");

function updateProgress() {
    currentvolume = Math.max(0, Math.min(100, currentvolume));
    progressBar.style.width = currentvolume + "%";
    progressLabelval.textContent = currentvolume + "%";
}
document.getElementById("saveVolumeSoundsModalBtn").addEventListener("click", () => {
    deviceSettings["Master Volume"] = currentvolume / 10;
    saveDeviceSettingsInToFile();
    document.getElementById("volumeSoundsModal").style.display = "none";
});
document.getElementById("closeVolumeSoundsModalBtn").addEventListener("click", () => {
    document.getElementById("volumeSoundsModal").style.display = "none";
    document.getElementById("settingsModal").style.display = "flex";
});
// Increase / Decrease buttons
document.getElementById("volumeincreaseBtn").addEventListener("click", () => {
    currentvolume += 10;
    updateProgress();
});

document.getElementById("volumedecreaseBtn").addEventListener("click", () => {
    currentvolume -= 10;
    updateProgress();
});

// Responsive Navigation Toggle
function toggleNav() {
    const nav = document.getElementById("navLinks");
    nav.classList.toggle("show");
}

// Optional: Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById("navLinks").classList.remove("show");
    });
});

let dropdownTimeout12;

function toggleDeviceOptions() {
    const dropdown = document.getElementById("deviceOptionDropdown");

    // Toggle visibility
    const isVisible = dropdown.style.display === "block";
    dropdown.style.display = isVisible ? "none" : "block";

    // Reset auto-close timer if reopened
    if (!isVisible) {
        clearTimeout(dropdownTimeout12);
        dropdownTimeout12 = setTimeout(() => {
            dropdown.style.display = "none";
        }, 5000); // Auto close after 5s
    } else {
        clearTimeout(dropdownTimeout12);
    }
}

// Close dropdown when clicking outside
window.addEventListener("click", function (event) {
    const dropdown = document.getElementById("deviceOptionDropdown");
    const button = document.querySelector(".device-option-button");

    if (!button.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = "none";
        clearTimeout(dropdownTimeout12);
    }
});

function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert to 12-hour format
    document.getElementById('timeLabel').textContent = `${hours}:${minutes} ${ampm}`;
}

/* -------------------- Load Alerts TXT START -------------------- */
const allAlerts = [];
const alerts = [];
function loadAlertsFile() {
    const stationElem = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");

    let url = `/external-files/${stationElem}/TcpTTProductExportPC/Config/AlertMessageInfo.txt`;
    url += "?t=" + new Date().getTime(); // prevent caching

    fetch(url, {
        cache: "no-store"
    })
    .then(response => {
        if (!response.ok)
            throw new Error(`HTTP error ${response.status}`);
        return response.text();
    })
    .then(text => {
        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const keys = [
            "AlertMessageText",
            "ImageName",
            "StartTime",
            "EndTime",
            "AlertInterval",
            "BeepPattern",
            "VolumeLevel",
            "MessageAlerted",
            "WarningEnabled",
            "nextTriggerTime"
        ];

        allAlerts.length = 0; // clear existing alerts
		alerts.length = 0; // clear existing alerts
        for (const line of lines) {
            const values = line.split('*').filter(v => v !== '');
            const alert = {};
            keys.forEach((key, i) => {
                alert[key] = values[i] !== undefined ? values[i] : "";
            });
            allAlerts.push(alert);
        }

        //console.log(" Alerts loaded successfully:", allAlerts);
        alerts.push(...allAlerts);
        //renderAlerts(allAlerts); // optional — call your UI update function
    })
    .catch(error => {
        console.error("❌ Error loading alerts.txt:", error);
    });
}

/* -------------------- Load Alerts TXT END -------------------- */

document.getElementById("saveListBtn").addEventListener("click", () => {

    if (editingIndex && selectedAlertImageFileUrl) {
        editingIndex = null;
        selectedAlertImageFileUrl = null;
    }
    saveAlertsFile();
	selectedAlertImageFile = null;
    document.getElementById("alertListModal").style.display = "none";
});

// =================== BACK BUTTON list alert ===================
document.getElementById("closeListModalBtn").addEventListener("click", () => {
    document.getElementById("alertListModal").style.display = "none";
    document.getElementById("settingsModal").style.display = "flex";
});

document.querySelectorAll('.alertarrow').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        let startHh = parseInt(document.getElementById('startHH').textContent);
        let startMm = parseInt(document.getElementById('startMM').textContent);
        let startAp = document.getElementById('startAP').textContent;

        let endHh = parseInt(document.getElementById('endHH').textContent);
        let endMm = parseInt(document.getElementById('endMM').textContent);
        let endAp = document.getElementById('endAP').textContent;

        let repeatHh = parseInt(document.getElementById('repeatHH').textContent);
        let repeatMm = parseInt(document.getElementById('repeatMM').textContent);

        switch (type) {
        case 'startHH-up':
            if (startHh < 12)
                startHh++;
            break;
        case 'startHH-down':
            if (startHh > 0)
                startHh--;
            break;
        case 'startMM-up':
            if (startMm < 59)
                startMm++;
            break;
        case 'startMM-down':
            if (startMm > 0)
                startMm--;
            break;
        case 'startAP-up':
            if (startAp === "AM") {
                startAp = "PM";
            } else {
                startAp = "AM";
            }
            break;
        case 'startAP-down':
            if (startAp === "AM") {
                startAp = "PM";
            } else {
                startAp = "AM";
            }
            break;
        case 'endHH-up':
            if (endHh < 12)
                endHh++;
            break;
        case 'endHH-down':
            if (endHh > 1)
                endHh--;
            break;
        case 'endMM-up':
            if (endMm < 59)
                endMm++;
            break;
        case 'endMM-down':
            if (endMm > 0)
                endMm--;
            break;
        case 'endAP-up':
            if (endAp === "AM") {
                endAp = "PM";
            } else {
                endAp = "AM";
            }
            break;
        case 'endAP-down':
            if (endAp === "AM") {
                endAp = "PM";
            } else {
                endAp = "AM";
            }
            break;
        case 'repeatHH-up':
            if (repeatHh < 12)
                repeatHh++;
            break;
        case 'repeatHH-down':
            if (repeatHh > 1)
                repeatHh--;
            break;
        case 'repeatMM-up':
            if (repeatMm < 59)
                repeatMm++;
            break;
        case 'repeatMM-down':
            if (repeatMm > 0)
                repeatMm--;
            break;
        }

        document.getElementById('startHH').textContent = String(startHh).padStart(2, '0');
        document.getElementById('startMM').textContent = String(startMm).padStart(2, '0');
        document.getElementById('startAP').textContent = startAp;

        document.getElementById('endHH').textContent = String(endHh).padStart(2, '0');
        document.getElementById('endMM').textContent = String(endMm).padStart(2, '0');
        document.getElementById('endAP').textContent = endAp;

        document.getElementById('repeatHH').textContent = String(repeatHh).padStart(2, '0');
        document.getElementById('repeatMM').textContent = String(repeatMm).padStart(2, '0');

    });
});

function updatePatternImage(pattern) {
    let patternImageSrc;
    switch (pattern) {
    case 1:
        patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L1-01.png';
        break;
    case 2:
        patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L2-01.png';
        break;
    case 3:
        patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L3-01.png';
        break;
    case 4:
        patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L4-01.png';
        break;
    case 5:
        patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L5-01.png';
        break;
    default:
        patternImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/alarm-L1-01.png';
    }
    document.getElementById("patternImage").src = patternImageSrc;
}

function updateVolumeImage(volume) {
    let volumeImageSrc;
    switch (volume) {
    case 1:
        volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-01-01.png';
        break;
    case 2:
        volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-02-01.png';
        break;
    case 3:
        volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-03-01.png';
        break;
    case 4:
        volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-04-01.png';
        break;
    case 5:
        volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-05-01.png';
        break;
    default:
        volumeImageSrc = '/external-files/ApplicationFiles/IMAGES/KB_icons/volume-01-01.png';
    }
    document.getElementById("volumeImage").src = volumeImageSrc;
}

document.querySelectorAll(".toggle-group").forEach(group => {
    group.addEventListener("click", event => {
        if (!event.target.classList.contains("toggle-option"))
            return;

        // Activate only the clicked one
        group.querySelectorAll(".toggle-option").forEach(opt => opt.classList.remove("active"));
        event.target.classList.add("active");

        const selectedValue = parseInt(event.target.dataset.value);
        if (group.id === "patternToggle") {
            updatePatternImage(selectedValue);
        } else if (group.id === "volumeToggle") {
            updateVolumeImage(selectedValue);
        }
    });
});

// Handle "Change Image" button click
document.getElementById("changeAlertImageBtn").addEventListener("click", () => {
    document.getElementById("AlertimageUpload").click();
});

// Handle file selection
document.getElementById("AlertimageUpload").addEventListener("change", function () {
    const file = this.files[0];
    if (!file)
        return;

    selectedAlertImageFile = file; // keep for Save

    const reader = new FileReader();
    reader.onload = function (e) {
        const alertImage = document.getElementById("alertImage");
        alertImage.src = e.target.result; // preview selected image
        selectedAlertImageFileUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    // Optionally save the filename or data to your alert object
    if (typeof editingIndex !== "undefined" && alerts[editingIndex]) {
        selectedAlertImageFileName = "./food/" + file.name;
    }
});

function saveAlertsFile() {
    const stationElem = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");

    if (!alerts || alerts.length === 0) {
        console.warn("No alerts to save.");
        return;
    }

    const keys = [
        "AlertMessageText",
        "ImageName",
        "StartTime",
        "EndTime",
        "AlertInterval",
        "BeepPattern",
        "VolumeLevel",
        "MessageAlerted",
        "WarningEnabled",
        "nextTriggerTime"
    ];

    let fileContent = "";
    for (const alert of alerts) {
        const line = keys.map(k => alert[k] !== undefined ? alert[k] : "").join("*") + "*\n";
        fileContent += line;
    }

    const formData = new FormData();
    formData.append("stationame", stationElem);
    formData.append("alertsText", fileContent);

    const appName = document.getElementById('appName').innerText.trim();
    const fetchUrl = `/${appName}/api/saveAlerts`;

    // helper to actually send data
    function sendFormData() {
        fetch(fetchUrl, {
            method: "POST",
            body: formData
        })
        .then(response => response.text())
        .then(message => {
            showSuccessAlert(message);
        })
        .catch(error => {
            console.error("❌ Error saving alerts:", error);
            showErrorAlert("Failed to save alerts: " + error.message);
        });
    }

    // Case 1: User uploaded a new image
    if (selectedAlertImageFile != null) {
        formData.append("alertfile", selectedAlertImageFile);
        sendFormData();
        return;
    }

    // Case 2: No new image → fetch existing one
    const alertImagePath = `${alerts[0].ImageName}`.replace(
        "./",
        `/${stationElem}/TcpTTProductExportPC/`
    );
    const alertImagePathFull = `/external-files/${alertImagePath}`;
    const alertFileName = alertImagePathFull.split(/[/\\]/).pop();

    fetch(alertImagePathFull)
        .then(function (response) {
            if (!response.ok) throw new Error("Image not found: " + alertImagePathFull);
            return response.blob();
        })
        .then(function (blob) {
            const fetchedFile = new File([blob], alertFileName, { type: blob.type });
            formData.append("alertfile", fetchedFile);
            sendFormData(); // ✅ now send after file is ready
        })
        .catch(function (error) {
            console.error("⚠️ Error loading image:", error);
            showErrorAlert("Failed to fetch image: " + error.message);
        });
}


/* -------------------- Load Device Settings TXT START -------------------- */
const deviceSettings = {};

function loadDeviceSettingsFile() {
    const stationElem = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");

    let url = `/external-files/${stationElem}/TcpTTProductExportPC/Config/ConfigParameter.txt`;
    url += "?t=" + new Date().getTime(); // prevent caching

    fetch(url, {
        cache: "no-store"
    })
    .then(response => {
        if (!response.ok)
            throw new Error(`HTTP error ${response.status}`);
        return response.text();
    })
    .then(text => {
        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const keys = [
            "Brightness",
            "Master Volume",
            "DimBrightness",
            "Dim Timer",
            "Auto DayPart Enabled",
            "Device Mode",
            "Transfer Mode",
            "Tcp File Import Status"
        ];

        // 🔹 Clear existing data
        for (const key in deviceSettings) {
            if (Object.prototype.hasOwnProperty.call(deviceSettings, key)) {
                delete deviceSettings[key];
            }
        }

        // 🔹 Assign values line-by-line in the same order as keys
        for (let i = 0; i < keys.length && i < lines.length; i++) {
            const [keyFromFile, valueFromFile] = lines[i].split(',').map(s => s.trim());
            const key = keys[i];
            deviceSettings[key] = valueFromFile !== undefined ? valueFromFile : "";
        }

        //console.log("✅ Device settings loaded successfully:", deviceSettings);
       
    })
    .catch(error => {
        console.error("❌ Error loading deviceSettings.txt:", error);
    });
}
/* -------------------- Load Device Settings TXT END -------------------- */


// After deviceSettings is populated, handle dropdown
function renderDeviceSettings() {
    const dayPartsButton = document.getElementById("dayPartsButton");

    if (deviceSettings && deviceSettings["Auto DayPart Enabled"] !== undefined) {
        const isAutoEnabled = Number(deviceSettings["Auto DayPart Enabled"]) === 1;

        // Disable or enable dropdown button
        dayPartsButton.disabled = isAutoEnabled;

        // Optional: visual feedback
        dayPartsButton.classList.toggle("disabled", isAutoEnabled);
    }
}
/* -------------------------------------------------
Function: SaveDeviceSettingsInToFile
Description: Writes all device settings (including updated ones)
back into deviceSettings.txt on the Tomcat server
-------------------------------------------------- */
function saveDeviceSettingsInToFile() {
    const stationame = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");

    const appName = document.getElementById('appName').innerText.trim();

    // ✅ Prepare updated settings JSON
    const updatedSettings = JSON.stringify(deviceSettings);

    const formData = new FormData();
    formData.append("stationame", stationame);
    formData.append("updatedSettings", updatedSettings); // <-- REQUIRED for backend

    const fetchUrl = `/${appName}/api/saveDeviceSettings`;

    fetch(fetchUrl, {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok)
            throw new Error('Network response was not ok');
        return response.text();
    })
    .then(message => {
        console.log("✅ Device settings saved:", message);
        showSuccessAlert(message);
    })
    .catch(error => {
        console.error("❌ Error saving device settings:", error);
        showErrorAlert("An error occurred: " + error.message);
    });
}

function loadUserGroupFile() {
    const stationElem = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");

    let url = `/external-files/${stationElem}/TcpTTProductExportPC/Config/UserGroupConfigInfo.txt`;
    url += "?t=" + new Date().getTime(); // prevent caching

    fetch(url, {
        cache: "no-store"
    })
    .then(response => {
        if (!response.ok)
            throw new Error(`HTTP error ${response.status}`);
        return response.text();
    })
    .then(text => {
        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const keys = [
            "UserGroupName",
            "UserGroupColor",
            "UserGroupImage"
        ];

        allUserGroups.length = 0; // clear any previous groups

        for (const line of lines) {
            const values = line.split('*').filter(v => v !== '');
            const group = {};
            keys.forEach((key, i) => {
                group[key] = values[i] !== undefined ? values[i] : "";
            });
            allUserGroups.push(group);
        }

        // console.log(" User groups loaded successfully:", allUserGroups);
        // You can call your UI renderer here:
        // renderUserGroups(allUserGroups);
    })
    .catch(error => {
        console.error("❌ Error loading UserGroupDetails.txt:", error);
    });
}

function saveUserGroupFile() {
    const stationElem = document.getElementById('stationname').innerText
        .trim()
        .replace(/\s+/g, "_");

    const appName = document.getElementById('appName').innerText.trim();
    const fetchUrl = `/${appName}/api/saveUserGroupDetails`;

    // Prepare text content to save
    const textData = allUserGroups.map(group =>
`${group.UserGroupName}*${group.UserGroupColor}*${group.UserGroupImage}`).join("\n");

    const formData = new FormData();
    formData.append("updatedUserGroups", textData);
    formData.append("stationName", stationElem);

    // Send data to backend
    fetch(fetchUrl, {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok)
            throw new Error("Network response was not ok");
        return response.text();
    })
    .then(message => {
        showSuccessAlert(message);
        console.log("✅ UserGroupDetails.txt saved successfully!");
    })
    .catch(error => {
        console.error("❌ Error saving UserGroupDetails.txt:", error);
        showErrorAlert("Error saving user group file: " + error.message);
    });
}

document.querySelectorAll('.Dparrow').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        let dstartHh = parseInt(document.getElementById('DstartHH').textContent);
        let dstartMm = parseInt(document.getElementById('DstartMM').textContent);
        let dstartAp = document.getElementById('DstartAp').textContent;

        let dendHh = parseInt(document.getElementById('DpendHH').textContent);
        let dendMm = parseInt(document.getElementById('DpendMM').textContent);
        let dendAp = document.getElementById('DpendAp').textContent;

        switch (type) {
        case 'DpstartHH-up':
            if (dstartHh < 12)
                dstartHh++;
            break;
        case 'DpstartHH-down':
            if (dstartHh > 0)
                dstartHh--;
            break;
        case 'DpstartMM-up':
            if (dstartMm < 59)
                dstartMm++;
            break;
        case 'DpstartMM-down':
            if (dstartMm > 0)
                dstartMm--;
            break;
        case 'DpstartAP-up':
            if (dstartAp === "AM") {
                dstartAp = "PM";
            } else {
                dstartAp = "AM";
            }
            break;
        case 'DpstartAP-down':
            if (dstartAp === "AM") {
                dstartAp = "PM";
            } else {
                dstartAp = "AM";
            }
            break;
        case 'DpendHH-up':
            if (dendHh < 12)
                dendHh++;
            break;
        case 'DpendHH-down':
            if (dendHh > 1)
                dendHh--;
            break;
        case 'DpendMM-up':
            if (dendMm < 59)
                dendMm++;
            break;
        case 'DpendMM-down':
            if (dendMm > 00)
                dendMm--;
            break;
        case 'DpendAP-up':
            if (dendAp === "AM") {
                dendAp = "PM";
            } else {
                dendAp = "AM";
            }
            break;
        case 'DpendAP-down':
            if (dendAp === "AM") {
                dendAp = "PM";
            } else {
                dendAp = "AM";
            }
            break;
        }

        document.getElementById('DstartHH').textContent = String(dstartHh).padStart(2, '0');
        document.getElementById('DstartMM').textContent = String(dstartMm).padStart(2, '0');
        document.getElementById('DstartAp').textContent = dstartAp;

        document.getElementById('DpendHH').textContent = String(dendHh).padStart(2, '0');
        document.getElementById('DpendMM').textContent = String(dendMm).padStart(2, '0');
        document.getElementById('DpendAp').textContent = dendAp;

    });
});

// Render selected DayPart

function renderDayParts(daypart) {
    const dpstart = minutesToTime(daypart.StartTime);
    const dpend = minutesToTime(daypart.EndTime);

    document.getElementById("DstartHH").textContent = dpstart.hh;
    document.getElementById("DstartMM").textContent = dpstart.mm;
    document.getElementById("DstartAp").textContent = dpstart.ap;

    document.getElementById("DpendHH").textContent = dpend.hh;
    document.getElementById("DpendMM").textContent = dpend.mm;
    document.getElementById("DpendAp").textContent = dpend.ap; // ✅ fix here
}

let allDayParts = {}; // use keys like BREAKFAST, LUNCH etc.


// 🔹 Load from file
function loadDayPartsFile() {
    const stationElem = document.getElementById("stationname").innerText
        .trim()
        .replace(/\s+/g, "_");

    let url = `/external-files/${stationElem}/TcpTTProductExportPC/Config/DayPartsConfigInfo.txt`;
    url += "?t=" + new Date().getTime(); // prevent cache

    fetch(url, {
        cache: "no-store"
    })
    .then(response => {
        if (!response.ok)
            throw new Error(`HTTP error ${response.status}`);
        return response.text();
    })
    .then(text => {
        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // ✅ Properly clear as object
        for (const key in allDayParts)
            delete allDayParts[key];

        // ✅ Parse and load each day part
        for (const line of lines) {
            const [DayPartName, StartTime, EndTime] = line.split(",").map(v => v.trim());
            if (DayPartName) {
                allDayParts[DayPartName] = {
                    StartTime: parseInt(StartTime) || 0,
                    EndTime: parseInt(EndTime) || 0
                };
            }
        }

        //console.log("✅ Loaded DayParts:", allDayParts);
    })
    .catch(error => {
        console.error("❌ Error loading DayPartsConfigInfo.txt:", error);
    });
}

function isOverlap(newStart, newEnd, dayPartName) {
    for (const [dpName, dp] of Object.entries(allDayParts)) {
        if (dpName === dayPartName) continue; // skip the one we are editing

        const start = dp.StartTime;
        const end = dp.EndTime;

        // Overlap condition: new interval intersects existing interval
        if ((newStart < end) && (newEnd > start)) {
            return dpName; // return conflicting DayPart
        }
    }
    return null; // no overlap
}


/**
 * Save the currently editing DayPart to allDayParts.
 * @returns {boolean|string} - true if saved successfully, or error message string if failed
 */
function saveCurrentDayPartToArray() {
    if (!currentlyEditingDayPart) return "No DayPart selected.";

    const startHH = document.getElementById("DstartHH")?.textContent || "";
    const startMM = document.getElementById("DstartMM")?.textContent || "";
    const startAP = document.getElementById("DstartAp")?.textContent || "";

    const endHH = document.getElementById("DpendHH")?.textContent || "";
    const endMM = document.getElementById("DpendMM")?.textContent || "";
    const endAP = document.getElementById("DpendAp")?.textContent || "";

    // Convert to minutes for comparison
    const DPstartMinutes = timeToMinutes(startHH, startMM, startAP);
    const DPendMinutes = timeToMinutes(endHH, endMM, endAP);

    if (isNaN(DPstartMinutes) || isNaN(DPendMinutes)) {
        return "Invalid time values.";
    }

    if (DPendMinutes < DPstartMinutes) {
        return "End time cannot be less than Start time.";
    }

    const conflict = isOverlap(DPstartMinutes, DPendMinutes, currentlyEditingDayPart);
    if (conflict) {
        return `Time period overlaps with ${conflict}.`;
    }

    // ✅ Save **minutes only** (format: DayPart,StartMinutes,EndMinutes)
    allDayParts[currentlyEditingDayPart].StartTime = DPstartMinutes;
    allDayParts[currentlyEditingDayPart].EndTime = DPendMinutes;

    console.log(`${currentlyEditingDayPart},${DPstartMinutes},${DPendMinutes}`);

    return true;
}


document.getElementById("saveDayPartsBtn").addEventListener("click", () => {
    const result = saveCurrentDayPartToArray();

		if (result === true) {
			console.log("DayPart saved successfully!");
		} else {
			alert(result); // show the returned error message
			return;
		}

    // Apply toggle change only if modified
    if (autoDayPartChanged) {
        deviceSettings["Auto DayPart Enabled"] = checkboxstatus.checked ? 1 : 0;
        console.log("Updated Device Setting: Auto DayPart Enabled =", deviceSettings["Auto DayPart Enabled"]);
		 renderDeviceSettings();//for dropdown dayparts
        saveDeviceSettingsInToFile();
        autoDayPartChanged = false; // reset flag
    }

    saveDayPartsToFile();
    document.getElementById("dayPartsModal").style.display = "none";

});

//  Save to file (key-based)
function saveDayPartsToFile() {
    const stationElem = document.getElementById("stationname").innerText
        .trim()
        .replace(/\s+/g, "_");

    const appName = document.getElementById("appName").innerText.trim();
    const fetchUrl = `/${appName}/api/saveDayPartsData`;

    // Convert keyed data back into text format
    const textData = Object.entries(allDayParts)
        .map(([name, val]) => `${name},${val.StartTime},${val.EndTime}`)
        .join("\n");

    const formData = new FormData();
    formData.append("updatedDayParts", textData);
    formData.append("stationame", stationElem);

    fetch(fetchUrl, {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(msg => {
        console.log("✅ DayParts saved:", msg);
        showSuccessAlert(msg);
    })
    .catch(error => {
        console.error("❌ Error saving DayParts:", error);
        showErrorAlert("Error saving DayParts: " + error.message);
    });
}
