"use babel";
import { CompositeDisposable, BufferedProcess } from "atom";

export default class WikiCompleter {
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
  }
  getAutoCompleteProviders() {
    var completer = this;

    return {
      selector: "source wikiwikiwall",
      // disableForSelector: ".source.wikiwikiwall .comment",
      // filterSuggestions: true,
      inclusionPriority: 10,
      excludeLowerPriority: true,
      suggestionPriority: 100,
      getSuggestions: function(request) {
        console.log("Calling", request);
        return completer.getSuggesstions(request);
      },
      onDidInsertSuggestion: function(result) {
        return completer.onDidInsertSuggestion(result);
      }
    };
  }

  getSuggestions(request) {
    console.log("Sugged", request);
    //{editor, bufferPosition, scopeDescriptor, prefix, activatedManually}
    //variable, constant, property, value, method, function, class, type, keyword, tag, snippet, import, require.
    //    "Layout \"Name\" As ALIAS Is [3 Qty] X Xval Y Yval Z Zval"
    return [
      {
        snippet:
          'Layout "${1:arg1}"  As ${2:arg2} Is 1 Qty ${3:arg3} XVal ${4:arg4} Yval ${5:arg5} Zval',
        type: "keyword",
        displayText: "Layout"
      },
      {
        snippet: 'Variable "${1:arg1}"  As ${2:arg2} Is (${3:arg3})',
        type: "keyword",
        displayText: "Variable"
      }
    ];
  }
  onDidInsertSuggestion(result) {
    //{ editor, suggestion }
    // if (suggestion.type === "attribute") {
    //   return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
    // }
    return result;
  }
}
