function addTime(time, minutes) {
  if (!time) return "";
  const [hours, mins] = time.split(":").map(Number);
  let total = hours * 60 + mins + minutes;
  if (total < 0) total += 24 * 60;
  total %= 24 * 60;
  const newHours = Math.floor(total / 60);
  const newMins = total % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

function renderSchedule(schedule) {
  const output = document.getElementById("output");
  output.innerHTML = "";

  schedule.forEach((item) => {
    const card = document.createElement("div");
    card.className = "task-card";

    const title = document.createElement("strong");
    title.textContent = item.task;

    const time = document.createElement("p");
    time.textContent = `${item.start} - ${item.end}`;

    card.appendChild(title);
    card.appendChild(time);
    output.appendChild(card);
  });
}

function updateSchoolLabels(userType) {
  const startLabel = document.getElementById("schoolStartLabel");
  const endLabel = document.getElementById("schoolEndLabel");
  const labelText = userType === "school" ? "School" : "College";
  startLabel.textContent = `${labelText} Start:`;
  endLabel.textContent = `${labelText} End:`;
}

function updateFieldVisibility(dayType) {
  const schoolFields = document.getElementById("schoolFields");
  const collegeStart = document.getElementById("collegeStart");
  const collegeEnd = document.getElementById("collegeEnd");

  if (dayType === "leave") {
    schoolFields.classList.add("hidden");
    collegeStart.required = false;
    collegeEnd.required = false;
  } else {
    schoolFields.classList.remove("hidden");
    collegeStart.required = true;
    collegeEnd.required = true;
  }
}

function updateActivityVisibility(value) {
  const activityFields = document.getElementById("activityFields");
  const activityInput = document.getElementById("activity");

  if (value === "no") {
    activityFields.classList.add("hidden");
    activityInput.required = false;
    activityInput.value = "";
  } else {
    activityFields.classList.remove("hidden");
    activityInput.required = true;
  }
}

function displayAIChat(dayType, userType, dinner) {
  const aiChat = document.getElementById("aiChat");
  aiChat.innerHTML = "";

  const userMessage = document.createElement("div");
  userMessage.className = "chat-message user";
  userMessage.innerHTML = `<strong>You:</strong> Today is ${dayType === "working" ? "a working day" : "a leave day"}, and I am a ${userType === "school" ? "school" : "college"} student.`;

  const aiMessage = document.createElement("div");
  aiMessage.className = "chat-message ai";
  aiMessage.innerHTML = `<strong>AI:</strong> Since it is ${dayType === "working" ? "a working day" : "a leave day"}, ${userType === "school" ? "school" : "college"} tasks can be balanced with study time. Try to finish your main tasks before dinner at ${dinner}, then revise lightly during evening study.`;

  aiChat.appendChild(userMessage);
  aiChat.appendChild(aiMessage);
}

function generatePlan(event) {
  event.preventDefault();

  const dayType = document.querySelector('input[name="dayType"]:checked').value;
  const userType = document.querySelector('input[name="userType"]:checked').value;
  const hasActivity = document.querySelector('input[name="hasActivity"]:checked').value;
  const wakeUp = document.getElementById("wakeUp").value;
  const breakfast = document.getElementById("breakfast").value;
  const collegeStart = document.getElementById("collegeStart").value;
  const collegeEnd = document.getElementById("collegeEnd").value;
  const activity = document.getElementById("activity").value;
  const dinner = document.getElementById("dinner").value;

  if (!wakeUp || !breakfast || !dinner || (dayType === "working" && (!collegeStart || !collegeEnd)) || (hasActivity === "yes" && !activity)) {
    alert("Please fill in all required fields before generating your plan.");
    return;
  }

  const schedule = [
    { task: "Wake Up", start: wakeUp, end: addTime(wakeUp, 10) },
    { task: "Morning Study", start: addTime(wakeUp, 10), end: addTime(wakeUp, 100) },
    { task: "Breakfast", start: breakfast, end: addTime(breakfast, 30) }
  ];

  let eveningBase = wakeUp;

  if (dayType === "working") {
    schedule.push({ task: userType === "school" ? "School" : "College", start: collegeStart, end: collegeEnd });
    eveningBase = collegeEnd;
  } else {
    const leaveStart = addTime(wakeUp, 30);
    const leaveEnd = addTime(wakeUp, 150);
    schedule.push({ task: "Leave Day Study", start: leaveStart, end: leaveEnd });
    eveningBase = leaveEnd;
  }

  if (hasActivity === "yes") {
    schedule.push({ task: "Extracurricular Activity", start: activity, end: addTime(activity, 60) });
  }

  const eveningStudyStart = addTime(eveningBase, 60);
  schedule.push({ task: "Evening Study", start: eveningStudyStart, end: addTime(eveningStudyStart, 120) });
  schedule.push({ task: "Dinner", start: dinner, end: addTime(dinner, 30) });

  const sleepStart = addTime(wakeUp, -480);
  schedule.push({ task: "Sleep", start: sleepStart, end: wakeUp });

  renderSchedule(schedule);
  displayAIChat(dayType, userType, dinner);
}

const plannerForm = document.getElementById("plannerForm");
const dayTypeInputs = document.querySelectorAll('input[name="dayType"]');
const userTypeInputs = document.querySelectorAll('input[name="userType"]');
const hasActivityInputs = document.querySelectorAll('input[name="hasActivity"]');

function initPlanner() {
  const currentDayType = document.querySelector('input[name="dayType"]:checked');
  const currentUserType = document.querySelector('input[name="userType"]:checked');
  const currentActivity = document.querySelector('input[name="hasActivity"]:checked');

  if (currentDayType) updateFieldVisibility(currentDayType.value);
  if (currentUserType) updateSchoolLabels(currentUserType.value);
  if (currentActivity) updateActivityVisibility(currentActivity.value);
}

if (dayTypeInputs.length) {
  dayTypeInputs.forEach((item) => {
    item.addEventListener("change", () => updateFieldVisibility(item.value));
  });
}

if (userTypeInputs.length) {
  userTypeInputs.forEach((item) => {
    item.addEventListener("change", () => updateSchoolLabels(item.value));
  });
}

if (hasActivityInputs.length) {
  hasActivityInputs.forEach((item) => {
    item.addEventListener("change", () => updateActivityVisibility(item.value));
  });
}

if (plannerForm) {
  plannerForm.addEventListener("submit", generatePlan);
}

initPlanner();
