"use babel";

import { CompositeDisposable, BufferedProcess } from "atom";

import MarkersStatus from "./markers-status";
import MarkersManagerView from "./markers-manager-view";

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

    this.attached_status_bar = null;
    this.settings = {
      generateAllSVG: true
    };
    let svgs_manager = this.master.managers.get("svgs");
    this.view = null;
    this.attached_panel = null;
    this.marks = [];
    this.addCommands();
    this.view = new MarkersManagerView(this, svgs_manager);
    this.observeEvents();
    this.displayView();
  }
  addCommands() {
    if (!this.subscriptions) {
      this.subscriptions = new CompositeDisposable();
    }
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "wiki-wiki-wall:setMarker": () => this.setMarker(),
        "wiki-wiki-wall:removeMarker": () => this.removeMarker(),
        "wiki-wiki-wall:clearAllMarkers": () => this.clearAllMarkers()
      })
    );
  }
  clearAllMarkers() {
    for (var mark of this.marks) {
      mark.decoration.destroy();
    }
    this.marks = [];
    this.turnOnGenerateAllSVG();
    this.view.update();
  }
  removeMarker() {
  //  console.log("You wanted to remove a marker");
    let editor = this.getEditor();
    let original_pt = editor.getCursorBufferPosition();


    editor.moveToBeginningOfLine();
       let start_pt = editor.getCursorBufferPosition();
       editor.moveRight(original_pt.column)

    this.marks.some((mark, idx) => {
      if (mark.range.start.isEqual(start_pt)) {
               // console.log("I found a thing to clear" , idx)
                this.marks[idx].decoration.destroy();
               this.marks.splice(idx,1);
               return true;
              }
              return false;
    })
    this.view.update();

  }
  setMarker() {
    /*
    They want to set a marker - possiblities:
    nthing selected
    a single layout selected
    multiple layouts selected
    a mix of stuff - no layout
    a mix of stuff including a layout
     */

    // ::scanInBufferRange(regex, range, iterator)
    let editor = this.getEditor();

    editor.selectLinesContainingCursors();
    let range = editor.getSelectedBufferRange();
   // console.log("Searching", editor.getTextInBufferRange(range));
    editor.scanInBufferRange(/^Layout.*|^Shape.*/g, range, result => {
      //console.log("Result", result);

      if (result.match) {
        if (!this.isMarked(result.range)) {
          let marker = editor.markBufferRange(result.range, {
            invalidate: "never"
          });
          let decoration = editor.decorateMarker(marker, {
            type: "line-number",
            class: `line-number-generate-svg`
          });
          this.marks.push({
            decoration,
            marker,
            range: result.range
          });

          this.turnOffGenerateAllSVG(); //Doesn't make sense to generate all and filter
          this.view.update();
        }
      }
    });

    //console.log("You wanted to add a marker", content);
  }
 
  isMarked(mark_range) {
    for (var mark of this.marks) {

      if (mark.range.isEqual(mark_range)) {

        return(true)
      }
    }
    return(false)
  }
  getMarkerCount() {
    this.getListOfMarkedItems()
    return (this.marks.length)
  }
  getGenerateAllSVG() {
    return(this.settings.generateAllSVG)
  }
  turnOffGenerateAllSVG() {
    this.settings.generateAllSVG = false;
    this.view.update();
  }
  turnOnGenerateAllSVG() {
    this.settings.generateAllSVG = true;
    this.view.update();
  }
  getListOfMarkedItems() {
    const regex = /As\s+([A-Z_][A-Z_0-9]*)\s/;
    let list = [];
    let editor = this.getEditor();
    for (var mark of this.marks) {
      let content = editor.getTextInBufferRange(mark.range);
   //   console.log("Gettting list",content)
      if (content) {
        let match = regex.exec(content);
        if (match && match[1]) {

          let value = match[1].trim()
       //   console.log(value)
          list.push(value)
        }
      }
    }
   // console.log(list)
    return(list);

  }
  getEditor() {
    return this.workspace.getActiveTextEditor();
  }
  isWWWF() {
    // atom.workspace.getActiveEditor().getGrammar().scopeName
    let pane = this.workspace.getActivePaneItem();
    if (!pane || !pane.getGrammar) {
      return false;
    }
    let grammar = pane.getGrammar();

    let pane_grammar = grammar ? grammar.scopeName : null;
    return pane_grammar == "source.wikiwikiwall";
  }

  displayView() {
    this.view.update();
    this.attached_panel = this.workspace.addBottomPanel({
      item: this.view.element
    });
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
    this.subscriptions.add(
      this.workspace.onDidChangeActivePaneItem(() => {
        this.displayView();
      })
    );
  }

  destroy() {
    this.subscriptions.dispose();
    if (this.attached_status_bar) {
      this.attached_status_bar.destroy();
    }
    if (this.view) {
      this.view.destroy();
    }
    if (this.attached_panel) {
      this.attached_panel.destroy();
    }
  }
  deserialize(state) {
    return {
      markerViewState: this.view.serialize()
    };
  }

  debug(message) {
    if (this.atomEnv.inDevMode()) {
      console.log(message);
    }
  }
}
