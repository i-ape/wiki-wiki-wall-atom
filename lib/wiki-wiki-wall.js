"use babel";
import SVGsManager from "./svgs/svgs-manager";
import MarkersManager from "./markers/markers-manager";

import SVGsStatus from "./svgs/svgs-manager";
import MarkersStatus from "./markers/markers-status";
import WikiCompleter from "./autocompleters/wiki_completer";

/* responsibilties
Needs to setup the ability to generate svgs
View the svgs
Control which svgs get generated
Highlight the syntax
Autocomplete options
show lines with problems

 */

export default {
  managers: new Map(),
  config: {
    command: {
      type: "string",
      default: "/usr/bin/wiki_wiki_wall",
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
      description: "This is the default background for the SVG display - white, black, or transparent"
    },
    autoGenerateOnSave: {
      type: "boolean",
      default: true,
      description: "When you are in a file and save - it will automatically trigger generation of SVGs"
    },
    rubyBinary: {
      type: "string",
      default: "~/.rvm/wrappers/wiki_wiki_wall_ruby/ruby",
      description: "The script requires RVM - which doesn't load properly in some environments. You need to run" +
        "the following command 'rvm alias create wiki_wiki_wall_ruby ruby-2.3.3@wikiwikiwalls-2.3' to create the " +
        " the wrapper needed to make the system work correctly"
    }
  },
  activate(state) {
    this.managers.set("svgs", new SVGsManager(this, state));
    this.managers.set("markers", new MarkersManager(this, state));
    this.managers.set("autocompleter", new WikiCompleter(this, state));
  },

  deactivate() {
    if (this.managers) {
      for (let manager of this.managers.values()) {
        manager.destroy();
      }
    }
  },

  consumeStatusBar(statusBar) {
    if (this.managers) {
      for (let manager of this.managers.values()) {
        if (manager.consumeStatusBar) {
          manager.consumeStatusBar(statusBar);
        }
      }
    }
  },
  getAutoCompleteProviders() {
    let providers = [];
    if (this.managers) {
      for (let manager of this.managers.values()) {
        if (manager.getAutoCompleteProviders) {
          providers = providers.concat(manager.getAutoCompleteProviders());
        }
      }
    }
    return providers;
  },

  deserialize(state) {
    if (this.managers) {
      for (let manager of this.managers.values()) {
        if (manager.deserialize) {
          manager.deserialize(state);
        }
      }
    }
  }
};
