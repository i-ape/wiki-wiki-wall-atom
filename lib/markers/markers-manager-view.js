"use babel";
/** @jsx etch.dom */

import etch from "etch";

export default class MarkersManagerView {
  constructor(marker_manager, svgs_manager) {
    this.marker_manager = marker_manager;
    this.svgs_manager = svgs_manager;
    etch.initialize(this);
  }

  render() {
    let marker_count = this.marker_manager.getMarkerCount();
    let generate_all_svg = this.marker_manager.getGenerateAllSVG();

    if (!this.marker_manager.isWWWF()) {
      return <div className="wiki-wiki-wall-markers-manager-view" />;
    }
    return (
      <div className="wiki-wiki-wall-markers-manager-view">
        {marker_count > 0
          ? marker_count == 1
            ? <span>1 Marked</span>
            : <span>
                {" "}{marker_count} Marked
              </span>
          : <span>None Marked</span>}&nbsp;
        <button className="btn" onClick={() => this.marker_manager.setMarker()}>
          Mark Current Selection
        </button>
        <button className="btn" disabled={marker_count == 0} onClick={() => this.marker_manager.removeMarker()}>
          Unmark Current Cursor
        </button>

        <button className="btn" disabled={marker_count == 0} onClick={() => this.marker_manager.clearAllMarkers()}>
          Clear All Markers
        </button>

        <button className="btn" onClick={() => this.svgs_manager.closeAllSVGs()}>
          Close All SVGs
        </button>
        <button className="btn" onClick={() => this.svgs_manager.generateSVGs()}>
          Generate SVGs
        </button>
        <span>
          Generate SVG with All Items:{" "}
          {generate_all_svg
            ? <button className="btn"
                onClick={() => this.marker_manager.turnOffGenerateAllSVG()}
              >
                On
              </button>
            : <button className="btn"
                onClick={() => this.marker_manager.turnOnGenerateAllSVG()}
              >
                Off
              </button>}
        </span>
      </div>
    );
  }

  update() {
    return etch.update(this);
  }

  destroy() {
    return etch.destroy(this);
  }
}
