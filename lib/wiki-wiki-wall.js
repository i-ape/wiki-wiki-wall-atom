'use babel';
import WikiWikiWallView from './wiki-wiki-wall-view';
import { CompositeDisposable } from 'atom';

export default {

  wikiWikiWallView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.wikiWikiWallView = new WikiWikiWallView(state.wikiWikiWallViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.wikiWikiWallView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'wiki-wiki-wall:toggle': () => this.toggle()
    }));
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

  toggle() {
    console.log('WikiWikiWall was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
