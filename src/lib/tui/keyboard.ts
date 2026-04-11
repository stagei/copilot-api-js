/** Terminal keyboard handler — Esc cancels all active requests */

import consola from "consola"

import { getRequestContextManager } from "~/lib/context/manager"

let active = false

function onKeypress(key: string): void {
  if (key === "\x1b") {
    // Escape — cancel all active requests
    const manager = getRequestContextManager()
    const requests = manager.getAll()
    if (requests.length === 0) return

    const count = requests.length
    consola.info(`[tui] Cancelling ${count} active request${count > 1 ? "s" : ""}`)
    manager.abortAll()
  } else if (key === "\x03") {
    // Ctrl+C — raw mode intercepts it, re-emit as SIGINT
    process.emit("SIGINT")
  }
}

/** Start listening for Esc key to cancel active requests. No-op if stdin is not a TTY. */
export function initKeyboardHandler(): void {
  if (!process.stdin.isTTY) return
  if (active) return
  active = true

  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding("utf8")
  process.stdin.on("data", onKeypress)
}

/** Stop keyboard handler and restore stdin to normal mode. */
export function cleanupKeyboardHandler(): void {
  if (!active) return
  active = false

  process.stdin.removeListener("data", onKeypress)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
  }
  process.stdin.pause()
}
