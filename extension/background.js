const API_URL = "http://localhost:8000/api";

let activeTab = {
  domain: null,
  startedAt: null,
};


async function getEnrollment() {
  return chrome.storage.local.get([
    "enrollment_id",
    "extension_token",
  ]);
}


async function sendUsageEvent(
  domain,
  durationSeconds
) {
  const enrollment =
    await getEnrollment();

  if (
    !enrollment.enrollment_id ||
    !enrollment.extension_token
  ) {
    return;
  }

  try {
    await fetch(
      `${API_URL}/usage/events/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${enrollment.extension_token}`,
        },

        body: JSON.stringify({
          domain,
          occurred_at:
            new Date().toISOString(),
          duration_seconds:
            Math.max(0, durationSeconds),
        }),
      }
    );
  } catch (error) {
    console.error(
      "ShadowAudit usage error:",
      error
    );
  }
}


async function recordCurrentTab(tabId) {
  try {
    const tab =
      await chrome.tabs.get(tabId);

    if (!tab.url) {
      return;
    }

    const url = new URL(tab.url);

    if (
      !["http:", "https:"].includes(
        url.protocol
      )
    ) {
      return;
    }

    const domain = url.hostname;

    if (!domain) {
      return;
    }

    // Finish previous session.
    if (
      activeTab.domain &&
      activeTab.startedAt
    ) {
      const duration =
        Math.floor(
          (Date.now() -
            activeTab.startedAt) /
            1000
        );

      await sendUsageEvent(
        activeTab.domain,
        duration
      );
    }

    // Start new session.
    activeTab = {
      domain,
      startedAt: Date.now(),
    };

  } catch (error) {
    console.error(
      "Unable to process tab:",
      error
    );
  }
}


chrome.tabs.onActivated.addListener(
  async ({ tabId }) => {
    await recordCurrentTab(tabId);
  }
);


chrome.tabs.onUpdated.addListener(
  async (tabId, changeInfo) => {
    if (
      changeInfo.status === "complete"
    ) {
      const tabs =
        await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

      const active = tabs[0];

      if (
        active &&
        active.id === tabId
      ) {
        await recordCurrentTab(tabId);
      }
    }
  }
);