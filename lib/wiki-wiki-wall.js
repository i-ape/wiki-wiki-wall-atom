"use babel";
import WikiWikiWallView from "./wiki-wiki-wall-view";
import { CompositeDisposable, BufferedProcess } from "atom";

export default {
  wikiWikiWallView: null,
  modalPanel: null,
  subscriptions: null,
  config: {
      command: {
        type: "string",
        default: "wiki_wiki_wall",
        description: "the `wiki_wiki_wall` executable to use"
      }
    
  },
  activate(state) {


    this.wikiWikiWallView = new WikiWikiWallView(state.wikiWikiWallViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.wikiWikiWallView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "wiki-wiki-wall:toggle": () => this.toggle(),
        "wiki-wiki-wall:generate": () => this.generate()
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.wikiWikiWallView.destroy();
  },

  serialize() {
    return {
      wikiWikiWallViewState: this.wikiWikiWallView.serialize()
    };
  },
  generate() {
    let command;
    atom.config.observe(
      "wiki-wiki-wall.executablePath",
      () => (command = atom.config.get("wiki-wiki-wall.command"))
    );
    let editor = atom.workspace.getActivePaneItem();
    if (editor && editor.getPath) {
      let filePath = editor.getPath();
      let args = [];

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
  toggle() {
    console.log("WikiWikiWall was toggled!");
    return this.modalPanel.isVisible()
      ? this.modalPanel.hide()
      : this.modalPanel.show();
  }
};
