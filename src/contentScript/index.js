function getMeetingId() {
  // Extract meeting ID from URL
  const meetingId = window.location.pathname.split('/')[1]
  return meetingId
}

function getParticipants() {
  const participants = []
  const participantElements = document.querySelectorAll('[role="listitem"][data-participant-id]')

  participantElements.forEach((element) => {
    const name =
      element.getAttribute('aria-label') || element.querySelector('[role="button"]')?.textContent

    // Filter out system entries and ensure we have a valid name
    if (
      name &&
      !name.includes('spaces/') &&
      !name.includes('visual_effects') &&
      !name.includes('devices/')
    ) {
      // Get profile picture
      const imgElement = element.querySelector('img[src^="https://"]')
      const avatar = element.querySelector('[data-self-name]')
      const profilePic = imgElement ? imgElement.src : null
      const initials = avatar ? avatar.textContent.trim() : name.charAt(0)

      participants.push({
        name: name.replace(' (Meeting host)', '').trim(),
        profilePic,
        initials,
      })
    }
  })

  return participants
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMeetingInfo') {
    sendResponse({
      meetingId: getMeetingId(),
      participants: getParticipants(),
    })
  }
})
