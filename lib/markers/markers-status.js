'use babel'

import {CompositeDisposable} from 'atom'

import MarkersStatusView from './markers-status-view'

export default class MarkersStatus {
  constructor (master, statusBar, atomEnv = global.atom, config = atomEnv.config, workspace = atomEnv.workspace) {
    this.master = master
    this.atomEnv = atomEnv
    this.config = config
    this.workspace = workspace
    this.statusBar = statusBar
    this.editor = null
    this.editorDisposables = null

    this.observeEvents()
    this.displayTile()
  }

  destroy () {
    this.subscriptions.dispose()
    this.destroyTile()
  }

  getText () {
    if (this.editor && this.editor.buffer && this.editor.buffer.file && this.editor.buffer.file.path.match(/\.wwwf$/) ) {
      return('WWWF')

    //  return `${this.softTabsSettingToText(softTabs)}${separator}${length}`
    } else {
      return ''
    }
  }

  destroyTile () {
    if (this.tooltipDisposable) {
      this.tooltipDisposable.dispose()
      this.tooltipDisposable = null
    }

    if (this.view) {
      this.view.destroy()
      this.view = null
    }

    if (this.tile) {
      this.tile.destroy()
      this.tile = null
    }
  }

  displayTile () {
    const priority = 100
    this.view = new MarkersStatusView(this)
    this.tile = this.statusBar.addLeftTile({item: this.view.element, priority: priority})
    this.updateTooltip()

  }

  observeEvents () {
    this.subscriptions = new CompositeDisposable()

    // this.subscriptions.add(this.config.onDidChange('wiki-wiki-wall.indicatorPosition', () => {
    //   this.destroyTile()
    //   this.displayTile()
    // }))



    this.subscriptions.add(this.workspace.observeActiveTextEditor((editor) => {
      if (this.editorDisposables) {
        this.editorDisposables.dispose()
        this.editorDisposables = null
      }

      this.editor = editor

      if (this.view) {
        this.updateView()
      }

      if (this.editor) {
        this.editorDisposables = this.editor.onDidChangeGrammar(() => {
          if (this.view) {
            this.updateView()
          }
        })
      }
    }))
  }


  updateTooltip () {
    if (this.tooltipDisposable) {
      this.tooltipDisposable.dispose()
      this.tooltipDisposable = null
    }

    if (this.editor) {
      const tooltipText = `Active editor is on a wwwf file ${this.editor.buffer.file.path}`

      this.tooltipDisposable = this.atomEnv.tooltips.add(this.view.element,
                                                         {title: tooltipText, trigger: 'hover'})
    }
  }

  async updateView () {
    await this.view.update()

    this.updateTooltip()
  }
}