import './index.css'

document.addEventListener('DOMContentLoaded', () => {
  console.log('popup.js loaded')
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log('tabs', tabs)
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getParticipants' }, (response) => {
      console.log('response', response)
      if (response && response.participants) {
        const participantsList = document.getElementById('participantsList')

        response.participants.forEach((participant) => {
          const div = document.createElement('div')
          div.className = 'participant'

          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          checkbox.id = participant.id

          const label = document.createElement('label')
          label.htmlFor = participant.id
          label.textContent = participant.name

          div.appendChild(checkbox)
          div.appendChild(label)
          participantsList.appendChild(div)
        })
      }
    })
  })
})
