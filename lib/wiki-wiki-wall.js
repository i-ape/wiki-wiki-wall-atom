"use babel";
import SVGsManager from "./svgs/svgs-manager";
import MarkersManager from "./markers/markers-manager";

import SVGsStatus from "./svgs/svgs-manager";
import MarkersStatus from "./markers/markers-status";

/* responsibilties
Needs to setup the ability to generate svgs
View the svgs
Control which svgs get generated
Highlight the syntax
Autocomplete options
show lines with problems

 */

export default {
  managers: [],
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
      description:
        "This is the default background for the SVG display - white, black, or transparent"
    }
  },
  activate(state) {
    this.managers.push({
      name: "svgs",
      obj: new SVGsManager(this, state)
    });
    this.managers.push({
      name: "markers",
      obj: new MarkersManager(this, state)
    });
  },

  deactivate() {
    if (this.managers) {
      for (let manager of this.managers) {
        if (manager.obj) {
          manager.obj.destroy();
        }
      }
    }
  },

  consumeStatusBar(statusBar)  {
    if (this.managers) {
      for (var manager of this.managers) {
        if (manager.obj && manager.obj.consumeStatusBar) {
          manager.obj.consumeStatusBar(statusBar);
        }
      }
    }
  },

  deserialize(state)  {
    if (this.managers) {
      for (var manager of this.managers) {
        if (manager.obj && manager.obj.deserialize) {
          manager.obj.deserialize(state);
        }
      }
    }
  }
};
