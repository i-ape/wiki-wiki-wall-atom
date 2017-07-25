/** @babel */
/** @jsx etch.dom */

import fs from "fs-plus";
import { Emitter, CompositeDisposable, Disposable } from "atom";

import etch from "etch";
// View that renders the image of an {ImageEditor}.
export default class MarkerManagerView {
  constructor(editor) {
    console.log("Going to setup mark with", editor);
    this.editor = editor;
    this.emitter = new Emitter();

    this.disposables = new CompositeDisposable();
    this.markers = [];
    etch.initialize(this);

    // this.disposables.add(this.editor.onDidChange(() => this.updateImageURI()));
    this.disposables.add(
      atom.commands.add("atom-workspace", {

        "wiki-wiki-wall:setMarker": () => this.setMarker(),
        "wiki-wiki-wall:removeMarker": () => this.removeMarker(),
        "wiki-wiki-wall:clearAllMarkers": () => this.clearAllMarkers()
      })
    );

  

    const clearAllMarkersClickHandler = event => {
      event.preventDefault();
      event.stopPropagation();
      this.clearAllMarkers();
    };

    this.refs.clearAllMarkersButton.addEventListener(
      "click",
      clearAllMarkersClickHandler
    );
    this.disposables.add(
      new Disposable(() => {
        this.refs.clearAllMarkersButton.removeEventListener(
          "click",
          clearAllMarkersClickHandler
        );
      })
    );
  }
  clearAllMarkers() {
    console.log("You wanted to remove all markers");
  }
  removeMarker() {
    console.log("You wanted to remove a marker");
  }
  setMarker() {
    console.log("You wanted to add a marker");
  }
  onDidLoad(callback) {
    return this.emitter.on("did-load", callback);
  }

  update() {}

  destroy() {
    this.disposables.dispose();
    this.emitter.dispose();
    return etch.destroy(this);
  }

  render() {
    return (
      <div>
        <p>Number of Markers: XXXX</p>
        <button className="btn" ref="clearAllMarkersButton">
          Clear All Makers
        </button>
        <button className="btn" >
          Hide the All SVG
        </button>
      </div>
    );
  }
  attach () {
  //  this.statusBarTile = this.statusBar.addLeftTile("Marker Manager")
    
  }
}
