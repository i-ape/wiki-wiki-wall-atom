"use babel";
import { CompositeDisposable, BufferedProcess } from "atom";
import path from "path";
import _ from "lodash";
import ImageEditor from "./image-editor";
//import MarkerManagerView from "./marker-manager-view"

export default {
  modalPanel: null,
  statusViewAttached: null,
  markerManagerViewAttached: null,
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
        "wiki-wiki-wall:generate": () => this.generate()

      })
    );
    this.subscriptions.add(atom.workspace.addOpener(this.openSVGURI));
    this.subscriptions.add(
      atom.workspace.onDidChangeActivePaneItem(() => {
        this.attachImageEditorStatusView();
      })
    );
    // this.subscriptions.add(
    //   atom.workspace.onDidChangeActivePaneItem(() => {
    //     this.attachMarkerManagerView();
    //   })
    // );
  },

  deactivate() {
    this.subscriptions.dispose();
    if (this.statusViewAttached) {
      this.statusViewAttached.destroy();
    }
    if (this.markerManagerViewAttached) {
      this.markerManagerViewAttached.destroy();
    }
  },
  debug(message) {
    if (atom.inDevMode()) {
      console.log(message);
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
      this.debug("Executing", command, args);
      let stdout = output => {
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
  },

  openSVGURI(uriToOpen) {
    let uriExtension = path.extname(uriToOpen).toLowerCase();
    if (_.includes([".svg"], uriExtension)) {
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
  // attachMarkerManagerView: () => {
  //    if (this.markerManagerViewAttached) {
  //      return;
  //    }
  //    if ((atom.workspace.getActivePaneItem() instanceof ImageEditor)) {
  //      return;
  //    }
  //
  //
  //    this.markerManagerViewAttached = new MarkerManagerView(this);
  //    return this.markerManagerViewAttached.attach();
  //  },
  deserialize: state => {
    return ImageEditor.deserialize(state) && MarkerManagerView.deserialize(state);
  },
  displaySVGs: data => {
    if (data && data.files) {
      _.map(data.files, value => {
        atom.workspace.open(value.filename, {
          split: "left",
          location: "bottom",
          searchAllPanes: true
        });
      });
    }
  }
};
