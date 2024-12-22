import { storageService } from './storage'

export const uiService = {
  createParticipantElement(participant, meetingId) {
    const div = document.createElement('div')
    div.className = 'participant'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = `participant-${participant.name}`

    // Load saved state
    const savedStatuses = storageService.getParticipantStatus(meetingId)
    checkbox.checked = savedStatuses[participant.name] || false

    // Add change listener
    checkbox.addEventListener('change', (e) => {
      storageService.updateParticipantStatus(meetingId, participant.name, e.target.checked)
    })

    const label = document.createElement('label')
    label.htmlFor = checkbox.id
    label.textContent = participant.name

    div.appendChild(checkbox)
    div.appendChild(label)
    return div
  },

  createResetButton(meetingId) {
    const button = document.createElement('button')
    button.textContent = 'Reset All'
    button.className = 'reset-button'
    button.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all checked participants?')) {
        storageService.resetAllStatuses(meetingId)
        // Refresh all checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
          checkbox.checked = false
        })
      }
    })
    return button
  },
}
