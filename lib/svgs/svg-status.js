/** @babel */

import { CompositeDisposable } from "atom";
import ImageEditor from "./image-editor";
import bytes from "bytes";
import SVGStatusView from "./svg-status-view";

export default class SVGStatus {
  constructor(
    master,
    statusBar,
    atomEnv = global.atom,
    config = atomEnv.config,
    workspace = atomEnv.workspace
  ) {
    this.master = master;
    this.statusBar = statusBar;
    this.subscriptions = null;
    this.atomEnv = atomEnv;
    this.config = config;
    this.workspace = workspace;
    this.statusBar = statusBar;
    this.editor = null;
    this.editorDisposables = null;

    this.observeEvents();
    this.displayTile();
  }

  destroy() {
    this.subscriptions.dispose();
    this.destroyTile();
  }

  observeEvents() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      this.workspace.onDidChangeActivePaneItem(() => {
        this.destroyTile();
        this.displayTile();
      })
    );
  }
  formatImageSize({ originalHeight, originalWidth, imageSize }) {
    return `${originalWidth}x${originalHeight} ${bytes(imageSize)}`;
  }

  getImageSizeDetails() {
    if (this.editorDisposables) {
      this.editorDisposables.dispose();
      this.editorDisposables = null;
    }
    let editor = this.workspace.getActivePaneItem();

    if (editor instanceof ImageEditor) {
      if (editor.view.loaded) {
        return this.formatImageSize(editor.view);
      } else {
        this.editorDisposables = editor.view.onDidLoad(() => {
          this.destroyTile();
          this.displayTile();
         // console.log("Laoding compelete!");
        });
      }
    }
    return "";
  }
  destroyTile() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }

    if (this.tile) {
      this.tile.destroy();
      this.tile = null;
    }
  }
  displayTile() {
    const priority = 100;
    this.view = new SVGStatusView(this);
    this.tile = this.statusBar.addLeftTile({
      item: this.view.element,
      priority: priority
    });
  }
  async updateView() {
    await this.view.update();
  }
}
