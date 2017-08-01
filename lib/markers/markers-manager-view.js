"use babel";
/** @jsx etch.dom */

import etch from "etch";

export default class MarkersManagerView {
  constructor(model) {
    this.model = model;

    etch.initialize(this);
  }

  render() {
    let marker_count = this.model.getMarkerCount();
    if (!this.model.isWWWF()) {
      return <div className="wiki-wiki-wall-markers-manager-view" />;
    }
    return (
      <div className="wiki-wiki-wall-markers-manager-view">
        <center>
          <h2>Chosen For Generation</h2>
        </center>
        {marker_count > 0
          ? marker_count == 1
            ? <span>1 Marked</span>
            : <span>
                {" "}{marker_count} Marked
              </span>
          : <span> Non Marked</span>}
        <button onClick={() => this.model.setMarker()}>Mark This</button>

        <button onClick={() => this.model.clearAllMarkers()}>
          Clear All Markers
        </button>
      </div>
    );
    //     <button onClick={() => this.model.removeMarker()}>Unmark This</button>
  }

  update() {
    return etch.update(this);
  }

  destroy() {
    return etch.destroy(this);
  }
}
