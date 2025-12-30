document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section inside the activity card
        const participantsDiv = document.createElement('div');
        participantsDiv.className = 'participants';
        if (details.participants && details.participants.length > 0) {
          const title = document.createElement('strong');
          title.textContent = 'Participants:';
          participantsDiv.appendChild(title);

          const ul = document.createElement('ul');
          details.participants.forEach((p) => {
            const li = document.createElement('li');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = p;

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-participant';
            delBtn.title = 'Unregister participant';
            // Use an inline SVG for a crisp small icon
            delBtn.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            `;

            delBtn.addEventListener('click', async () => {
              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`,
                  { method: 'POST' }
                );
                const resJson = await res.json();
                if (res.ok) {
                  messageDiv.textContent = resJson.message;
                  messageDiv.className = 'success';
                  messageDiv.classList.remove('hidden');
                  // Refresh activities so participants and availability update
                  fetchActivities();
                } else {
                  messageDiv.textContent = resJson.detail || 'An error occurred';
                  messageDiv.className = 'error';
                  messageDiv.classList.remove('hidden');
                }
                // Hide message after 5 seconds
                setTimeout(() => {
                  messageDiv.classList.add('hidden');
                }, 5000);
              } catch (error) {
                messageDiv.textContent = 'Failed to unregister. Please try again.';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
                console.error('Error unregistering:', error);
              }
            });

            li.appendChild(nameSpan);
            li.appendChild(delBtn);
            ul.appendChild(li);
          });
          participantsDiv.appendChild(ul);
        } else {
          const none = document.createElement('p');
          none.textContent = 'No participants yet.';
          participantsDiv.appendChild(none);
        }

        activityCard.appendChild(participantsDiv);

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
        // Refresh activities so participants and availability update
        fetchActivities();
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
