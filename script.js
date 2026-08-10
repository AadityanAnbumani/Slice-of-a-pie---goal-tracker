function overlayOpen(id) {
    document.getElementById(id).style.display= "flex"
}

function overlayClose(id) {
    document.getElementById(id).style.display= "none"
}

const customMilestoneRadio = document.querySelector('input[name="short-milestones"][value="custom"]');

const recommendedMilestoneRadio = document.querySelector('input[name="short-milestones"][value="recommended"]');

const customMilestones = document.getElementById("custom-milestones")

customMilestoneRadio.addEventListener("change", function() {
    if (this.checked) {
        customMilestones.style.display = "flex";
    }
});

recommendedMilestoneRadio.addEventListener("change", function() {
    if (this.checked) {
        customMilestones.style.display = "none"
    }
});

const dateOptionRadios = document.querySelectorAll('input[name="milestone-dates"]');

function updateDateVisibility() {
    const customDatesSelected = document.querySelector('input[name="milestone-dates"][value="custom-dates"]').checked;

    const dateInputs = document.querySelectorAll(".milestone-date")

    dateInputs.forEach(function (dateInput) {
        if (customDatesSelected) {
            dateInput.style.display = "block";
        } else {
            dateInput.style.display = "none";
        }
    });
}

dateOptionRadios.forEach(function (radio) {
    radio.addEventListener("change", updateDateVisibility);
});

const addMilestoneButton = document.getElementById("add-milestone");

const milestoneList = document.getElementById("milestone-list");

addMilestoneButton.addEventListener("click", function () {

    const newMilestone = document.createElement("div");

    newMilestone.classList.add("milestone-row");
    newMilestone.setAttribute("draggable", "true");

    newMilestone.innerHTML = `
        <span class="drag-handle">☰</span>

        <input 
            type="text" 
            class="milestone-input" 
            placeholder="Milestone"
        >

        <input 
            type="date" 
            class="milestone-date"
        >

        <button class="delete-milestone">×</button>
    `;

    milestoneList.appendChild(newMilestone);

    updateDateVisibility();

});

milestoneList.addEventListener("click", function (event) {

    if (event.target.classList.contains("delete-milestone")) {
        event.target.closest(".milestone-row").remove();
    }
});

let draggedMilestone = null;

milestoneList.addEventListener("dragstart", function (event) {

    if (event.target.classList.contains("milestone-row")) {
        draggedMilestone = event.target;
    }

});

milestoneList.addEventListener("dragover", function (event) {

    event.preventDefault();

    const target = event.target.closest(".milestone-row");

    if (!target || target === draggedMilestone) {
        return;
    }

    const rect = target.getBoundingClientRect();

    const mousePosition = event.clientY - rect.top;

    if (mousePosition > rect.height / 2) {
        target.after(draggedMilestone);
    } else {
        target.before(draggedMilestone);
    }
});

const addGoalButton = document.getElementById("add-goal");

const goals = [];

addGoalButton.addEventListener("click", function () {
    const title = document.querySelector(".goal-title").value;

    const description = document.querySelector(".goal-description").value;

    const completionDate = document.querySelector(".goal-length").value;

    const category = document.querySelector('input[name="short-category"]:checked').value;

    const frequency = document.querySelector('input[name="short-freq"]:checked').value;

    const milestoneType = document.querySelector('input[name="short-milestones"]:checked').value;

    let milestones = [];

    if (milestoneType === "custom") {
        const milestoneInputs = document.querySelectorAll(".milestone-input");

        milestoneInputs.forEach(function (input) {
            if (input.value.trim() !== ""){

                const milestone = {
                    title: input.value.trim(),
                    completed: false,
                    date: null
                };

                milestones.push(milestone);
            }
        });
    } else {
        milestones = generateMilestones(completionDate);
    }


    const goal = {
        id: crypto.randomUUID(),
        title: title,
        description: description,
        completionDate: completionDate,
        category: category,
        frequency: frequency,
        milestones: milestones
    };

    goals.push(goal);

    displayGoal(goal);

    console.log(goals);

})

function displayGoal(goal) {
    const goalList = document.getElementById("short-goal-list");

    const goalElement = document.createElement("div");

    goalElement.classList.add("goal-item");

    const completedMilestones = goal.milestones.filter(milestone => milestone.completed).length;

    const totalMilestones = goal.milestones.length;

    let progress = 0;

    if (totalMilestones > 0) {
        progress = (completedMilestones / totalMilestones) * 100;
    }

    goalElement.innerHTML = `
        <h3>${goal.title}</h3>

        <div class="goal-info">

            <div class="progress-section">
                <p>Progress</p>

                <div class="progress-bar">
                    <div 
                        class="progress-fill"
                        style="width: ${progress}%"
                    ></div>
                </div>

                <span>${progress}%</span>
            </div>

            <div class="time-section">
                <p>Time Remaining</p>
                <strong>5 days</strong>
            </div>

        </div>
    `;

    goalElement.setAttribute("data-goal-id", goal.id);

    goalElement.addEventListener("click", function () {
        openGoalDetails(goal)
    });

    goalList.appendChild(goalElement);
}

let currentGoal = null;

function openGoalDetails(goal) {
    currentGoal = goal;

    document.getElementById("details-title").textContent = goal.title;
    document.getElementById("details-description").textContent = goal.description;
    document.getElementById("details-date").textContent = goal.completionDate;
    const milestoneList = document.getElementById("details-milestones");
    milestoneList.innerHTML = "";
    goal.milestones.forEach(function (milestone) {
        const milestoneElement = document.createElement("label");
        milestoneElement.innerHTML = `
            <input type="checkbox" ${milestone.completed ? "checked" : ""}>
            ${milestone.title}
        `;
        const checkbox = milestoneElement.querySelector("input");
        checkbox.addEventListener("change", function () {
            milestone.completed = checkbox.checked;
        })
        milestoneList.appendChild(milestoneElement);
    })
    document.getElementById("goal-details-overlay").style.display = "flex";
}

const goalDetailsOverlay = document.getElementById("goal-details-overlay");

goalDetailsOverlay.addEventListener("click", function (event) {
    if (event.target === goalDetailsOverlay) {
        goalDetailsOverlay.style.display = "none"
    }
});

const saveDetailsButton = document.getElementById("save-details");

saveDetailsButton.addEventListener("click", function () {
    updateGoalProgress(currentGoal);
    goalDetailsOverlay.style.display = "none";
})

function updateGoalProgress(goal) {
    let completedMilestones = 0
    goal.milestones.forEach(function (milestone) {
        if (milestone.completed) {
            completedMilestones++;
        }
    });
    const totalMilestones = goal.milestones.length;
    let progress = 0;
    if (totalMilestones > 0) {
        progress = (completedMilestones / totalMilestones) * 100;
    }

    const goalElement = document.querySelector(
        `[data-goal-id="${goal.id}"]`
    );
    const progressFill = goalElement.querySelector(".progress-fill");
    const progressText = goalElement.querySelector(".progress-section span");
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
}

function generateMilestones(completionDate) {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(completionDate);

    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    let numberOfMilestones;
    if(totalDays <= 7) {
        numberOfMilestones = 2;
    } else if (totalDays <= 30) {
        numberOfMilestones = 4;
    } else {
        numberOfMilestones = 6;
    }

    const milestones = [];

    for (let i = 1; i <= numberOfMilestones; i++) {
        const milestoneDate = new Date(startDate);
        const daysToAdd = (totalDays / numberOfMilestones) * i;

        milestoneDate.setDate(milestoneDate.getDate() + daysToAdd);

        const percentage = Math.round(( i / numberOfMilestones) * 100);
        milestones.push({
            title: `${percentage}% Complete`,
            completed: false,
            date: milestoneDate
        });
    }
    return milestones;
}