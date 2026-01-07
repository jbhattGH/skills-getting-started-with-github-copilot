document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Helper to avoid HTML injection when rendering names
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants markup (bulleted list) or a friendly placeholder
        const participantsMarkup =
          Array.isArray(details.participants) && details.participants.length
            ? `<ul class="participants-list" style="margin:8px 0 0 1.1em; padding-left:0; color:#333;">` +
              details.participants
                .map((p) => `<li style="margin:4px 0; list-style: disc; margin-left: 1em;">${escapeHtml(p)}</li>`)
                .join("") +
              `</ul>`
            : `<p class="no-participants" style="color:#666; font-style:italic; margin-top:8px;">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4 style="margin:0 0 6px 0;">${escapeHtml(name)}</h4>
          <p style="margin:0 0 8px 0; color:#444;">${escapeHtml(details.description)}</p>
          <p style="margin:0 0 6px 0; color:#555;"><strong>Schedule:</strong> ${escapeHtml(details.schedule)}</p>
          <p style="margin:0 0 8px 0; color:#555;"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants" style="margin-top:6px;">
            <strong style="display:block; margin-bottom:4px; color:#333;">Participants:</strong>
            ${participantsMarkup}
          </div>
        `;

        // Subtle card styling to make it look pretty
        activityCard.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
        activityCard.style.background = "#fff";
        activityCard.style.marginBottom = "12px";
        activityCard.style.padding = "12px";
        activityCard.style.borderRadius = "8px";
        activityCard.style.border = "1px solid #eee";

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
