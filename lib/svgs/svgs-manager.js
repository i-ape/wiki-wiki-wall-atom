"use babel";
import { CompositeDisposable, BufferedProcess } from "atom";
import path from "path";
import _ from "lodash";
import ImageEditor from "./image-editor";
import SVGStatus from "./svg-status";

export default class SVGsManager {
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
    this.attached_status_bar = null;
    this.settings = {};

    this.setConfigs();
    this.addCommands();
    this.addOpeners();
    this.observeEvents();
  }
  addCommands() {
    if (!this.subscriptions) {
      this.subscriptions = new CompositeDisposable();
    }
    this.subscriptions.add(
      this.commands.add("atom-workspace", {
        "wiki-wiki-wall:generateSVGs": () => this.generateSVGs()
      })
    );
  }
  consumeStatusBar(statusBar) {
    this.statusBar = statusBar;
    return this.attachStatusBar();
  }
  addOpeners() {
    if (!this.subscriptions) {
      this.subscriptions = new CompositeDisposable();
    }
    this.subscriptions.add(this.workspace.addOpener(this.openSVGURI));
  }
  observeEvents() {
    if (!this.subscriptions) {
      this.subscriptions = new CompositeDisposable();
    }
    this.subscriptions.add(
      this.workspace.onDidChangeActivePaneItem(() => {
        this.attachStatusBar();
      })
    );
  }
  setConfig(label) {
    this.settings[label] = this.config.get("wiki-wiki-wall." + label);
    if (!this.settings[label]) {
      let default_value = this.master.config[label].default;
      atom.config.set("wiki-wiki-wall." + label, default_value);

      this.settings[label] = default_value;
    }
  }
  setConfigs() {
    this.setConfig("SVGBackground");
    this.setConfig("command");
    this.setConfig("outputPath");
  }
  destroy() {
    this.subscriptions.dispose();
    if (this.attached_status_bar) {
      this.attached_status_bar.destroy();
    }
  }
  deserialize(state) {
    return ImageEditor.deserialize(state);
  }

  displaySVGs(data) {
    if (data && data.files) {
      _.map(data.files, value => {
        this.workspace.open(value.filename, {
          split: "left",
          location: "bottom",
          searchAllPanes: true
        });
      });
    }
  }
  generateSVGs() {
    let command = this.settings.command;

    let outputPath = this.settings.outputPath;
    let editor = this.workspace.getActivePaneItem();
    if (editor && editor.getPath) {
      let filePath = editor.getPath();
      let args = [];
      args.push("--json");
      args.push("--output");
      args.push(outputPath);
      args.push(filePath);
      this.debug("Executing", command, args);

      let stdout = output => {
        this.debug(output)
        let data = JSON.parse(output);
        this.debug(data);
        this.displaySVGs(data);
      };
      let stderr = output => this.debug(output);
      let exit = exit_code => this.debug(command + " exited " + exit_code);
      let process = new BufferedProcess({
        command,
        args,
        stdout,
        stderr,
        exit
      });
    }
  }
  attachStatusBar() {
    if (this.attached_status_bar) {
      return;
    }
    if (this.statusBar == null) {
      return;
    }
    if (!(this.workspace.getActivePaneItem() instanceof ImageEditor)) {
      return;
    }

    this.attached_status_bar = new SVGStatus(this.master, this.statusBar);
    return true;
  }
  debug() {
    if (this.atomEnv.inDevMode()) {
      console.log(arguments);
    }
  }
  openSVGURI(uriToOpen) {
    let uriExtension = path.extname(uriToOpen).toLowerCase();
    if (_.includes([".svg"], uriExtension)) {
      return new ImageEditor(uriToOpen);
    }
  }
}
