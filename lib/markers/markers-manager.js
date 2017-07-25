"use babel";
import { CompositeDisposable, BufferedProcess } from "atom";
import path from "path";
import _ from "lodash";
import MarkersStatus from "./markers-status";

export default class MarkersManager {
  constructor(
    master,
    state,
    atomEnv = global.atom,
    config = atomEnv.config,
    workspace = atomEnv.workspace,
    commands = atomEnv.commands
  ) {
    this.master = master;
    this.state = state;
    this.statusBar = null;
    this.atomEnv = atomEnv;
    this.config = config;
    this.workspace = workspace;
    this.commands = commands;
    this.editor = master.editor;
    this.editorDisposables = null;
    this.subscriptions = new CompositeDisposable();
    this.statusView = null;
    this.attached_status_bar = null;
    this.settings = {};

    this.addCommands();

    this.observeEvents();
  }
  addCommands() {
    if (!this.subscriptions) {
      this.subscriptions = new CompositeDisposable();
    }
  }
  consumeStatusBar(statusBar) {
    this.statusBar = statusBar;

    return this.attachStatusBar();
  }
  attachStatusBar() {
    if (this.attached_status_bar) {
      return;
    }
    if (this.statusBar == null) {
      return;
    }

    this.attached_status_bar = new MarkersStatus(this.master, this.statusBar);
    return true;
    //  return this.attached_status_bar.attach();
  }
  observeEvents() {
    if (!this.subscriptions) {
      this.subscriptions = new CompositeDisposable();
    }
  }

  destroy() {
    this.subscriptions.dispose();
    if (this.attached_status_bar) {
      this.attached_status_bar.destroy();
    }
  }
  deserialize(state) {}

  debug(message) {
    if (this.atomEnv.inDevMode()) {
      console.log(message);
    }
  }
}
