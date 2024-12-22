function getParticipants() {
  const participants = []
  const participantElements = document.querySelectorAll('[role="listitem"][data-participant-id]')

  participantElements.forEach((element) => {
    const name =
      element.getAttribute('aria-label') || element.querySelector('[role="button"]')?.textContent
    if (name) {
      participants.push({
        name: name.replace(' (Meeting host)', '').trim(),
        id: element.getAttribute('data-participant-id'),
      })
    }
  })

  return participants
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('participants:', getParticipants())

  if (request.action === 'getParticipants') {
    sendResponse({ participants: getParticipants() })
  }
})
