// Storage functionality
const STORAGE_PREFIX = 'google-meet-participants'

const storageService = {
  getStorageKey(meetingId) {
    return `${STORAGE_PREFIX}-${meetingId}`
  },

  getParticipantStatus(meetingId) {
    const storageKey = this.getStorageKey(meetingId)
    const stored = localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) : {}
  },

  updateParticipantStatus(meetingId, participantName, status) {
    const storageKey = this.getStorageKey(meetingId)
    const current = this.getParticipantStatus(meetingId)
    current[participantName] = status
    localStorage.setItem(storageKey, JSON.stringify(current))
  },
}

const style = document.createElement('style')
style.textContent = `
  .participant-checkbox {
    margin: 0 8px !important;
    width: 18px !important;
    height: 18px !important;
    border: 1px solid #dadce0 !important;
    border-radius: 3px !important;
    cursor: pointer !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    transition: all 0.15s ease-out !important;
    position: relative !important;
    background-color: white !important;
    flex-shrink: 0 !important;
    order: -1 !important;
  }

  .participant-checkbox:hover {
    border-color: #5f6368 !important;
    background-color: rgba(26, 115, 232, 0.04) !important;
  }

  .participant-checkbox:checked {
    background-color: #1a73e8 !important;
    border-color: #1a73e8 !important;
  }

  .participant-checkbox:checked::after {
    content: "" !important;
    display: block !important;
    width: 5px !important;
    height: 9px !important;
    border: 1.5px solid white !important;
    border-width: 0 2px 2px 0 !important;
    transform: rotate(45deg) !important;
    position: absolute !important;
    top: 1px !important;
    left: 5px !important;
  }

  .participant-checkbox:focus {
    outline: none !important;
    border-color: #1a73e8 !important;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
  }
`
document.head.appendChild(style)

function getMeetingId() {
  const meetingId = window.location.pathname.split('/')[1]
  return meetingId
}

function createCheckbox(participant, meetingId) {
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.className = 'participant-checkbox'

  const savedStatuses = storageService.getParticipantStatus(meetingId)
  checkbox.checked = savedStatuses[participant.name] || false

  checkbox.addEventListener('change', (e) => {
    storageService.updateParticipantStatus(meetingId, participant.name, e.target.checked)
  })

  return checkbox
}

async function addCheckboxToParticipant(element, meetingId) {
  try {
    // Check if checkbox is already added to this exact element
    if (element.querySelector('.participant-checkbox')) return

    // Try different methods to find the container where we want to add the checkbox
    const firstDiv = element.querySelector('div:first-child')
    if (!firstDiv) return

    const name = element.getAttribute('aria-label').trim()

    if (!name) {
      return
    }

    const checkbox = createCheckbox({ name }, meetingId)

    if (firstDiv.parentElement) {
      firstDiv.style.display = 'flex'
      firstDiv.style.alignItems = 'center'

      if (!firstDiv.querySelector('.participant-checkbox')) {
        firstDiv.insertBefore(checkbox, firstDiv.firstChild)
      }
    }
  } catch (error) {
    console.error('Error adding checkbox to participant:', error)
  }
}

function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    function checkElement() {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`))
        return
      }

      requestAnimationFrame(checkElement)
    }

    checkElement()
  })
}

async function initializeObserver() {
  const meetingId = getMeetingId()

  try {
    // Wait for the participants panel to be opened
    await waitForElement('[role="list"]')

    function processAllParticipants() {
      const allParticipants = document.querySelectorAll('[role="listitem"][data-participant-id]')
      allParticipants.forEach((element) => {
        addCheckboxToParticipant(element, meetingId)
      })
    }

    // Process existing participants
    processAllParticipants()

    // Set up observer for participant list changes
    const observer = new MutationObserver((mutations) => {
      // Check if any mutation involves our target elements
      const relevantMutation = mutations.some(
        (mutation) =>
          mutation.target.matches?.('[role="list"], [role="region"], [role="listitem"]') ||
          Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === 1 &&
              (node.matches?.('[role="listitem"]') || node.querySelector?.('[role="listitem"]')),
          ),
      )

      if (relevantMutation) {
        processAllParticipants()
      }
    })

    // Observe both the list container and the parent region
    const participantsRegion = document.querySelector('[role="region"][id]')
    const participantsList = document.querySelector('[role="list"]')

    if (participantsRegion) {
      observer.observe(participantsRegion, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    if (participantsList) {
      observer.observe(participantsList, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    // Additional observer for the body to catch major structural changes
    const bodyObserver = new MutationObserver((mutations) => {
      if (document.querySelector('[role="list"]')) {
        processAllParticipants()
      }
    })

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    })
  } catch (error) {
    console.error('Error initializing observer:', error)
  }
}

// Initialize when participant list becomes visible
const participantListObserver = new MutationObserver(() => {
  if (document.querySelector('[role="list"]')) {
    participantListObserver.disconnect()
    initializeObserver()
  }
})

participantListObserver.observe(document.body, { childList: true, subtree: true })

// Re-initialize when URL changes (Meet is a SPA)
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    initializeObserver()
  }
}).observe(document, { subtree: true, childList: true })
