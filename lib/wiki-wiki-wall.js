"use babel";
import { CompositeDisposable, BufferedProcess } from "atom";
import path from "path";
import _ from "underscore-plus";
import ImageEditor from "./image-editor";

export default {
  modalPanel: null,
  statusViewAttached: null,
  subscriptions: null,
  config: {
    command: {
      type: "string",
      default: "wiki_wiki_wall",
      description: "The `wiki_wiki_wall` executable to use"
    },
    outputPath: {
      type: "string",
      default: "/tmp",
      description: "The path to where the SVGs will be written to disk."
    },
    SVGBackground: {
      type: "string",
      default: "white",
      description:
        "This is the default background for the SVG display - white, black, or transparent"
    }
  },
  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.SVGBackground = atom.config.get("wiki-wiki-wall.SVGBackground");
    if (!this.SVGBackground) {
      atom.config.set("wiki-wiki-wall.SVGBackground", "white");
    }
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "wiki-wiki-wall:generate": () => this.generate(),
        "wiki-wiki-wall:displaySVG": () => this.displaySVG()
      })
    );
    this.subscriptions.add(atom.workspace.addOpener(this.openSVGURI));
    this.subscriptions.add(
      atom.workspace.onDidChangeActivePaneItem(() => {
        this.attachImageEditorStatusView();
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
    if (this.statusViewAttached) {
      this.statusViewAttached.destroy();
    }
  },

  generate() {
    let command = atom.config.get("wiki-wiki-wall.command");
    let outputPath = atom.config.get("wiki-wiki-wall.outputPath") || "/tmp";
    let editor = atom.workspace.getActivePaneItem();
    if (editor && editor.getPath) {
      let filePath = editor.getPath();
      let args = [];
      args.push("--json");
      args.push("--output");
      args.push(outputPath);
      args.push(filePath);
      console.log("Executing", command, args);
      let stdout = output => console.log(output);
      let stderr = output => console.error(output);
      let exit = exit_code => console.log(command + " exited " + exit_code);
      let process = new BufferedProcess({
        command,
        args,
        stdout,
        stderr,
        exit
      });
    }
  },

  openSVGURI(uriToOpen) {
    let uriExtension = path.extname(uriToOpen).toLowerCase();
    if (_.include([".svg"], uriExtension)) {
      return new ImageEditor(uriToOpen);
    }
  },
  consumeStatusBar: statusBar => {
    this.statusBar = statusBar;
    return this.attachImageEditorStatusView();
  },
  attachImageEditorStatusView: () => {
    if (this.statusViewAttached) {
      return;
    }
    if (this.statusBar == null) {
      return;
    }
    if (!(atom.workspace.getActivePaneItem() instanceof ImageEditor)) {
      return;
    }

    let ImageEditorStatusView = require("./image-editor-status-view");
    this.statusViewAttached = new ImageEditorStatusView(this.statusBar);
    return this.statusViewAttached.attach();
  },
  deserialize: state => {
    return ImageEditor.deserialize(state);
  },
  displaySVG: filename => {
    var real_filename =
      filename || "/home/delmendo/Desktop/git/WikiWallDSL/output/H_BV.svg";
    atom.workspace.open(real_filename, {
      split: "left",
      location: "bottom"
    });
    atom.workspace.open(
      "/home/delmendo/Desktop/git/WikiWallDSL/output/DC_RIB.svg",
      {
        split: "right",
        location: "bottom"
      }
    );
  }
};
