'use babel'
/** @jsx etch.dom */

import etch from 'etch'

export default class SVGStatusView {
  constructor (model) {
    this.model = model

    etch.initialize(this)
  }

  render () {
   
    return (
      <div className="status-image inline-block">
      <span className="image-size">
        {this.model.getImageSizeDetails()}
      </span>
      </div>
    )
  }

  update () {
    return etch.update(this)
  }

  destroy () {
    return etch.destroy(this)
  }
}