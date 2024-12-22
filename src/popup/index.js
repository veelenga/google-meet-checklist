import './index.css'
import { uiService } from '../services/ui'

function initializePopup() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getMeetingInfo' }, (response) => {
      if (response && response.participants) {
        const { meetingId, participants } = response

        // Add reset button
        const headerActions = document.createElement('div')
        headerActions.className = 'header-actions'
        headerActions.appendChild(uiService.createResetButton(meetingId))
        document.querySelector('.header').appendChild(headerActions)

        // Add participants
        const participantsList = document.getElementById('participantsList')
        participantsList.innerHTML = '' // Clear existing list

        participants.forEach((participant) => {
          const participantElement = uiService.createParticipantElement(participant, meetingId)
          participantsList.appendChild(participantElement)
        })
      }
    })
  })
}

document.addEventListener('DOMContentLoaded', initializePopup)
