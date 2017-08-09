"use babel";
require("events").EventEmitter.defaultMaxListeners = 100;

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
    commands = atomEnv.commands,
    notifications = atomEnv.notifications
  ) {
    this.master = master;
    this.state = state;
    this.statusBar = null;
    this.atomEnv = atomEnv;
    this.config = config;
    this.workspace = workspace;
    this.commands = commands;
    this.notifications = notifications;
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
  configLabels() {
    return [
      "SVGBackground",
      "command",
      "outputPath",
      "autoGenerateOnSave",
      "rubyBinary"
    ];
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
    this.subscriptions.add(
      this.workspace.observeTextEditors(editor => {
        this.subscriptions.add(
          editor.onDidSave(event => {
            if (this.isWWWF(editor) && this.settings.autoGenerateOnSave) {
              //          console.log("Gonna auto genrate on save",editor)
              this.generateSVGs();
            }
          })
        );
      })
    );
    for (let label of this.configLabels()) {
      this.subscriptions.add(
        this.config.onDidChange(`wiki-wiki-wall.${label}`, ({
          oldValue,
          newValue
        }) => {
          this.setConfig(label);
        })
      );
    }
  }
  setConfig(label) {
    this.settings[label] = this.config.get(`wiki-wiki-wall.${label}`);
    if (this.settings[label] === null) {
      let default_value = this.master.config[label].default;
      atom.config.set("wiki-wiki-wall." + label, default_value);

      this.settings[label] = default_value;
    }
    // / console.log("Config", label, this.settings[label])
  }

  setConfigs() {
    for (let label of this.configLabels()) {
      this.setConfig(label);
    }
  }
  isWWWF(item) {
    // atom.workspace.getActiveEditor().getGrammar().scopeName
    let pane = item || this.workspace.getActivePaneItem();
    if (!pane || !pane.getGrammar) {
      return false;
    }
    let grammar = pane.getGrammar();

    let pane_grammar = grammar ? grammar.scopeName : null;
    return pane_grammar == "source.wikiwikiwall";
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
  closeAllSVGs() {
    // console.log("Panels?", this.workspace.getBottomPanels())
    for (let pane of this.workspace.getPanes()) {
      if (pane.items && pane.items[0] && pane.items[0] instanceof ImageEditor) {
        pane.destroy();
      }
    }
    //console.log("Panels?", this.workspace.getBottomPanels())
    // for (let panel of this.workspace.getBottomPanels()) {
    //   console.log("Gonna destgrouy", panel);
    //   panel.hide();
    //   panel.destroy();
    // }
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
    let command = this.settings.rubyBinary;

    let outputPath = this.settings.outputPath;
    let editor = this.workspace.getActivePaneItem();

    if (editor && editor.buffer && editor.buffer.previousModifiedStatus) {
      //   console.log("********** Disk and Buffer don't match")
      if (this.settings.autoGenerateOnSave) {
        //     console.log("Triggering save and letting auto generate handle")
        editor.save();
        return;
      } else {
        //console.log("Save and continue?")
        editor.save();
      }
    }
    if (editor && editor.getPath) {
      let filePath = editor.getPath();
      let args = [];
      args.push(this.settings.command);
      args.push("--json");
      let marker_manager = this.master.managers.get("markers");
      if (marker_manager) {
        let filter_list = marker_manager.getListOfMarkedItems();
        if (filter_list.length > 0) {
          args.push("--filter");
          args.push(filter_list.join(","));
        }
        if (marker_manager.getGenerateAllSVG()) {
          args.push("--all");
        } else {
          args.push("--no-all");
        }
      }

      args.push("--output");
      args.push(outputPath);
      args.push(filePath);
      //   this.debug("Executing", command, args);
      this.notifications.addInfo("Generating SVGs", { timeOut: 1000 });
      //   this.notifications.addInfo("Args", {description: command +  " " + args.join(" "), dimssiable: true,timeOut: 1000 });
      let stdout = output => {
        //this.debug(output);
        try {
          let data = JSON.parse(output);
          // this.debug(data);
          this.closeAllSVGs();
          this.displaySVGs(data);
          this.notifications.addInfo("SVG Generation Complete!", {
            timeOut: 1000
          });
        } catch (e) {
          console.log(e);
          let notification = this.notifications.addError(
            "Problem with Generation",
            {
              detail: output,
              description: "Unable to parse the JSON " + e,
              dismissable: true
            }
          );
        }
      };
      let stderr = output => {
        let notification = this.notifications.addError(
          "Problem with Generation in Generator",
          {
            detail: output,
            description: "Unable to parse the current file",
            dismissable: true
          }
        );
        // console.log("Notification?:", notification);
        // notification.dismiss = function() {
        //   console.log("Nope!");
        // };

        // this.debug("Huh", output);
      };
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
