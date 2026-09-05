const API_URL = "http://localhost:8000/api";

const enrollmentView = document.getElementById("enrollment");
const activeView = document.getElementById("active");
const codeInput = document.getElementById("code");
const enrollButton = document.getElementById("enroll");
const errorElement = document.getElementById("error");

async function checkEnrollment() {
  const result = await chrome.storage.local.get([
    "enrollment_id",
    "organization_id",
    "extension_token"
  ]);

  if (
    result.enrollment_id &&
    result.organization_id &&
    result.extension_token
  ) {
    enrollmentView.classList.add("hidden");
    activeView.classList.remove("hidden");
  }
}

async function enroll() {
  const code = codeInput.value.trim();

  if (!code) {
    errorElement.textContent = "Enter an enrollment code.";
    return;
  }

  enrollButton.disabled = true;
  enrollButton.textContent = "Connecting...";
  errorElement.textContent = "";

  try {
    const response = await fetch(`${API_URL}/extensions/enroll/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ enrollment_code: code })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Enrollment failed.");
    }

    await chrome.storage.local.set({
      enrollment_id: data.enrollment_id,
      organization_id: data.organization_id,
      extension_token: data.extension_token
    });

    enrollmentView.classList.add("hidden");
    activeView.classList.remove("hidden");
  } catch (error) {
    errorElement.textContent = error.message;
  } finally {
    enrollButton.disabled = false;
    enrollButton.textContent = "Connect extension";
  }
}

enrollButton.addEventListener("click", enroll);
checkEnrollment();
