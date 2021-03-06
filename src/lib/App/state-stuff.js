import _                 from 'underscore'
import store             from 'store'
import { findSquare }    from '../utils/pixel-processing'
import { findHoriVerti } from '../utils/pixel-processing'

export function saveState(state) {
  store.set('app-state', state)
}
const debouncedSaveState = _.debounce(saveState, 1000)

export function clearAll() {
  if(window.confirm('Clear all fields?')) {
    this.setState({
      fields: []
    }, () => {
      debouncedSaveState(this.state)
    })
  }
}

function isExisting(fields, x, y) {
  return fields.find((f) => {
    const margin = 5
    const isWithinX = ( x - margin ) <= f.x && ( x + margin ) >= f.x
    const isWithinY = ( y - margin ) <= f.y && ( y + margin ) >= f.y
    return isWithinX && isWithinY
  })
}

export function placeField(canvasX, canvasY, cb) {
  if(!canvasX || !canvasY) return
  const square = findSquare(this.ctx, canvasX, canvasY)
  if (!square) return

  const x    = square.topLeftX
  const y    = square.topLeftY
  const size = square.size
  const key  = `${x}:${y}`

  const existingField = isExisting(this.state.fields, x, y)

  if(existingField) {
    this.setFocusByKey(existingField.key)
    return
  }
  const field = {
    key:      key,
    x:        x,
    y:        y,
    size:     size,
    char:     '',
    hasFocus: true
  }
  this.setState((prevState) => {
    return {
      fields: prevState.fields.concat(field)
    }
  }, () => {
    debouncedSaveState(this.state)
    if(cb) return cb()
  })
}

export function setCharByKey(key, char, cb) {
  this.setState((prevState) => {
    return {
      fields: prevState.fields.map((f) => {
        if(f.key === key) {
          f.char = char
        }
        return f
      })
    }
  }, () => {
    debouncedSaveState(this.state)
  })
}

export function setFocusByKey(key, cb) {
  this.setState((prevState) => {
    return {
      fields: prevState.fields.map((f) => {
        if(f.key === key) {
          f.hasFocus = true
        } else {
          f.hasFocus = false
        }
        return f
      })
    }
  }, () => {
    debouncedSaveState(this.state)
    if(cb) return cb()
  })
}

export function setWritingDirection(canvasX, canvasY, cb) {
  const square = findSquare(this.ctx, canvasX, canvasY)
  if (!square) return
  const x      = square.topLeftX
  const y      = square.topLeftY
  const size   = square.size
  const { onHori } = findHoriVerti(this.ctx, x, y, size)
  this.setState((prevState) => {
    return { writingDirection: onHori }
  }, () => {
    this.placeField(canvasX, canvasY, cb)
  })
}
