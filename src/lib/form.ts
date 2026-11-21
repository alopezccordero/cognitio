/** Inert form handler: keeps the GUI from reloading the page until real handlers exist. */
export const noSubmit = (e: { preventDefault: () => void }) => e.preventDefault()
