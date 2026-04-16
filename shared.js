const CHAT_ENDPOINT = "backend-production-3849.up.railway.app";

function initSidebar() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const hideSidebarBtn = document.getElementById("hideSidebarBtn");
  const sidebarPeek = document.getElementById("sidebarPeek");
  const root = document.body;

  if (!sidebarToggle || !hideSidebarBtn || !sidebarPeek) return;

  sidebarToggle.addEventListener("click", () => {
    const isCollapsed = root.classList.toggle("sidebar-collapsed");
    sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
    sidebarToggle.setAttribute(
      "aria-label",
      isCollapsed ? "Expand sidebar" : "Collapse sidebar"
    );
  });

  const updateHideButtonState = () => {
    const isHidden = root.classList.contains("sidebar-hidden");
    hideSidebarBtn.classList.toggle("is-flipped", isHidden);
    hideSidebarBtn.setAttribute(
      "aria-label",
      isHidden ? "Show sidebar" : "Hide sidebar"
    );
  };

  const showSidebar = () => {
    root.classList.remove("sidebar-hidden");
    updateHideButtonState();
  };

  const hideSidebar = () => {
    root.classList.remove("sidebar-collapsed");
    sidebarToggle.setAttribute("aria-expanded", "true");
    sidebarToggle.setAttribute("aria-label", "Collapse sidebar");
    root.classList.add("sidebar-hidden");
    updateHideButtonState();
  };

  hideSidebarBtn.addEventListener("click", () => {
    if (root.classList.contains("sidebar-hidden")) {
      showSidebar();
    } else {
      hideSidebar();
    }
  });

  sidebarPeek.addEventListener("click", showSidebar);

  let dragStartX = 0;
  let isDraggingPeek = false;

  sidebarPeek.addEventListener("pointerdown", (event) => {
    isDraggingPeek = true;
    dragStartX = event.clientX;
    sidebarPeek.setPointerCapture(event.pointerId);
  });

  sidebarPeek.addEventListener("pointermove", (event) => {
    if (!isDraggingPeek) return;
    if (event.clientX - dragStartX > 60) {
      showSidebar();
      isDraggingPeek = false;
    }
  });

  const endPeekDrag = () => {
    isDraggingPeek = false;
  };
  sidebarPeek.addEventListener("pointerup", endPeekDrag);
  sidebarPeek.addEventListener("pointercancel", endPeekDrag);

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 980) {
      root.classList.remove("sidebar-hidden");
      updateHideButtonState();
    }
  });

  updateHideButtonState();
}

async function sendChatMessage(message) {
  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error("Chatbot request failed");
  return response.json();
}

function appendMessage(thread, role, text) {
  const bubble = document.createElement("div");
  bubble.className = role === "user" ? "bubble bubble-user" : "bubble bubble-ai";
  bubble.textContent = text;
  thread.appendChild(bubble);
  thread.scrollTop = thread.scrollHeight;
}

function appendBubbleMessage(thread, role, text) {
  const message = document.createElement("p");
  message.className =
    role === "user" ? "ai-bubble-message user" : "ai-bubble-message ai";
  message.textContent = text;
  thread.appendChild(message);
  thread.scrollTop = thread.scrollHeight;
}

function initGenericChatBars() {
  const bars = document.querySelectorAll("[data-chat-bar]");
  bars.forEach((bar) => {
    const input = bar.querySelector("[data-chat-input]");
    const send = bar.querySelector("[data-chat-send]");
    const thread = bar.querySelector("[data-chat-thread]");
    const mode = bar.getAttribute("data-chat-mode") || "home";

    if (!input || !send || !thread) return;

    const append = (role, text) => {
      if (mode === "bubble") {
        appendBubbleMessage(thread, role, text);
      } else {
        appendMessage(thread, role, text);
      }
    };

    const submit = async () => {
      const msg = input.value.trim();
      if (!msg) return;
      append("user", msg);
      input.value = "";
      try {
        const data = await sendChatMessage(msg);
        append("ai", data.reply || "I am here to help.");
      } catch {
        append("ai", "Backend unavailable. Start backend/app.py to chat.");
      }
    };

    send.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initGenericChatBars();
});
