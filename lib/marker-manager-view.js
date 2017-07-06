// /** @babel */
// /** @jsx etch.dom */
//
// import fs from "fs-plus";
// import {Emitter, CompositeDisposable, Disposable} from "atom";
//
// import etch from "etch";
// // View that renders the image of an {ImageEditor}.
// export default class MarkerManagerView {
//   constructor(editor) {
//     this.editor = editor;
//     this.emitter = new Emitter();
//
//     this.disposables = new CompositeDisposable();
//     this.markers = [];
//     etch.initialize(this);
//
//
//     this.disposables.add(this.editor.onDidChange(() => this.updateImageURI()));
//     this.disposables.add(
//       atom.commands.add(this.element, {
//         "wiki-wiki-wall:setMarker": () => this.setMarker(),
//         "wiki-wiki-wall:removeMarker": () => this.removeMarker(),
//         "wiki-wiki-wall:clearAllMarkers": () => this.clearAllMarkers()
//
//       })
//     );
//
//    this.disposables.add(
//       atom.tooltips.add(this.refs.clearAllMarkersButton, {
//         title: "Generate will display all the SVGs generated"
//       })
//     );
//
//
//     const clearAllMarkersClickHandler = event => {
//       event.preventDefault();
//       event.stopPropagation();
//       this.clearAllMarkers();
//     };
//
//     this.refs.clearAllMarkersButton.addEventListener(
//       "click",
//       clearAllMarkersClickHandler
//     );
//     this.disposables.add(
//       new Disposable(() => {
//         this.refs.clearAllMarkersButton.removeEventListener(
//           "click",
//           clearAllMarkersClickHandler
//         );
//       })
//     );
//
//   }
//   clearAllMarkers() {
//       console.log("You wanted to remove all markers")
//   }
//   removeMarker() {
//     console.log("You wanted to remove a marker")
//   }
//   setMarker() {
//     console.log("You wanted to add a marker")
//   }
//   onDidLoad(callback) {
//     return this.emitter.on("did-load", callback);
//   }
//
//   update() {
//   }
//
//   destroy() {
//     this.disposables.dispose();
//     this.emitter.dispose();
//     return etch.destroy(this);
//   }
//
//   render() {
//     return (
//       <div className="image-view" tabIndex="-1">
//         <div className="image-controls" ref="imageControls">
//           <div className="image-controls-group">
//             <a
//               ref="whiteTransparentBackgroundButton"
//               className="image-controls-color-white"
//               value="white"
//             >
//               white
//             </a>
//             <a
//               ref="blackTransparentBackgroundButton"
//               className="image-controls-color-black"
//               value="black"
//             >
//               black
//             </a>
//             <a
//               ref="transparentTransparentBackgroundButton"
//               className="image-controls-color-transparent"
//               value="transparent"
//             >
//               transparent
//             </a>
//           </div>
//           <div className="image-controls-group btn-group">
//             <button className="btn" ref="zoomOutButton">-</button>
//             <button className="btn reset-zoom-button" ref="resetZoomButton">
//               Auto
//             </button>
//             <button className="btn" ref="zoomInButton">+</button>
//           </div>
//           <div className="image-controls-group btn-group">
//             <button
//               className="btn zoom-to-fit-button selected"
//               ref="zoomToFitButton"
//             >
//               Zoom to fit
//             </button>
//           </div>
//         </div>
//
//         <div className="image-container zoom-to-fit" ref="imageContainer">
//           <img ref="image"/>
//         </div>
//       </div>
//     );
//   }
//
//
//
//   // Adjust the size of the image by the given multiplying factor.
//   //
//   // factor - A {Number} to multiply against the current size.
//   adjustSize(factor) {
//     if (!this.loaded || this.element.offsetHeight === 0) {
//       return;
//     }
//
//     if (this.mode === "zoom-to-fit") {
//       this.mode = "zoom-manual";
//       this.refs.imageContainer.classList.remove("zoom-to-fit");
//       this.refs.zoomToFitButton.classList.remove("selected");
//     } else if (this.mode === "reset-zoom") {
//       this.mode = "zoom-manual";
//     }
//
//     const newWidth = this.refs.image.offsetWidth * factor;
//     const newHeight = this.refs.image.offsetHeight * factor;
//     const percent = Math.max(
//       1,
//       Math.round(newWidth / this.originalWidth * 100)
//     );
//
//     // Switch to pixelated rendering when image is bigger than 200%
//     if (newWidth > this.originalWidth * 2) {
//       this.refs.image.style.imageRendering = "pixelated";
//     } else {
//       this.refs.image.style.imageRendering = "";
//     }
//
//     this.refs.image.style.width = newWidth + "px";
//     this.refs.image.style.height = newHeight + "px";
//     this.refs.resetZoomButton.textContent = percent + "%";
//   }
//
//   // Changes the background color of the image view.
//   //
//   // color - A {String} that gets used as class name.
//   changeBackground(color) {
//     if (this.loaded && color) {
//       this.refs.imageContainer.setAttribute("background", color);
//     }
//   }
//
//   scrollUp() {
//     this.refs.imageContainer.scrollTop -= document.body.offsetHeight / 20;
//   }
//
//   scrollDown() {
//     this.refs.imageContainer.scrollTop += document.body.offsetHeight / 20;
//   }
//
//   pageUp() {
//     this.refs.imageContainer.scrollTop -= this.element.offsetHeight;
//   }
//
//   pageDown() {
//     this.refs.imageContainer.scrollTop += this.element.offsetHeight;
//   }
//
//   scrollToTop() {
//     this.refs.imageContainer.scrollTop = 0;
//   }
//
//   scrollToBottom() {
//     this.refs.imageContainer.scrollTop = this.refs.imageContainer.scrollHeight;
//   }
// }
