interface ModalInfo {
  id: string
  open: () => void
  close: () => void
}

class ModalMutex {
  private modalStack: ModalInfo[] = []
  private currentModal: ModalInfo | null = null
  private history: string[] = []

  register(id: string, open: () => void, close: () => void) {
    const modalInfo: ModalInfo = { id, open, close }
    this.modalStack.push(modalInfo)
    return () => this.unregister(id)
  }

  unregister(id: string) {
    const index = this.modalStack.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.modalStack.splice(index, 1)
    }
    this.history = this.history.filter((h) => h !== id)
  }

  open(id: string) {
    const modal = this.modalStack.find((m) => m.id === id)
    if (!modal) return

    if (this.currentModal && this.currentModal.id !== id) {
      this.currentModal.close()
      this.history.push(this.currentModal.id)
      this.currentModal = modal
      modal.open()
    } else if (!this.currentModal) {
      this.currentModal = modal
      modal.open()
    }
  }

  close(id: string) {
    const modal = this.modalStack.find((m) => m.id === id)
    if (!modal) return

    modal.close()

    if (this.currentModal?.id === id) {
      this.currentModal = null
      const previousModalId = this.history.pop()
      if (previousModalId) {
        const previousModal = this.modalStack.find(
          (m) => m.id === previousModalId,
        )
        if (previousModal) {
          this.currentModal = previousModal
          previousModal.open()
        }
      }
    }
  }

  getCurrentModalId(): string | null {
    return this.currentModal?.id || null
  }

  clear() {
    this.modalStack = []
    this.currentModal = null
    this.history = []
  }
}

const modalMutex = new ModalMutex()

export function useModalMutex() {
  return {
    register: (id: string, open: () => void, close: () => void) =>
      modalMutex.register(id, open, close),
    open: (id: string) => modalMutex.open(id),
    close: (id: string) => modalMutex.close(id),
    getCurrentModalId: () => modalMutex.getCurrentModalId(),
    clear: () => modalMutex.clear(),
  }
}

export default modalMutex
