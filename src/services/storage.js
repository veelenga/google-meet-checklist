const STORAGE_PREFIX = 'google-meet-participants'

export const storageService = {
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

  resetAllStatuses(meetingId) {
    const storageKey = this.getStorageKey(meetingId)
    localStorage.removeItem(storageKey)
  },
}
