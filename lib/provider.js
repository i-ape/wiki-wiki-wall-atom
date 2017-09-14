/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const COMPLETIONS = require("../completions.json");

const attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;
const tagPattern = /<([a-zA-Z][-a-zA-Z]*)(?:\s|$)/;

module.exports = {
  selector: ".text.html",
  disableForSelector: ".text.html .comment",
  filterSuggestions: true,
  completions: COMPLETIONS,

  getSuggestions(request) {
    if (this.isAttributeValueStart(request)) {
      return this.getAttributeValueCompletions(request);
    } else if (this.isAttributeStart(request)) {
      return this.getAttributeNameCompletions(request);
    } else if (this.isTagStart(request)) {
      return this.getTagNameCompletions(request);
    } else {
      return [];
    }
  },

  onDidInsertSuggestion({ editor, suggestion }) {
    if (suggestion.type === "attribute") {
      return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
    }
  },

  triggerAutocomplete(editor) {
    return atom.commands.dispatch(
      atom.views.getView(editor),
      "autocomplete-plus:activate",
      { activatedManually: false }
    );
  },

  isTagStart({ prefix, scopeDescriptor, bufferPosition, editor }) {
    if (prefix.trim() && prefix.indexOf("<") === -1) {
      return this.hasTagScope(scopeDescriptor.getScopesArray());
    }

    // autocomplete-plus's default prefix setting does not capture <. Manually check for it.
    prefix = editor.getTextInRange([
      [bufferPosition.row, bufferPosition.column - 1],
      bufferPosition
    ]);

    const scopes = scopeDescriptor.getScopesArray();

    // Don't autocomplete in embedded languages
    return prefix === "<" &&
      scopes[0] === "text.html.basic" &&
      scopes.length === 1;
  },

  isAttributeStart({ prefix, scopeDescriptor, bufferPosition, editor }) {
    const scopes = scopeDescriptor.getScopesArray();
    if (
      !this.getPreviousAttribute(editor, bufferPosition) &&
      prefix &&
      !prefix.trim()
    ) {
      return this.hasTagScope(scopes);
    }

    const previousBufferPosition = [
      bufferPosition.row,
      Math.max(0, bufferPosition.column - 1)
    ];
    const previousScopes = editor.scopeDescriptorForBufferPosition(
      previousBufferPosition
    );
    const previousScopesArray = previousScopes.getScopesArray();

    if (
      previousScopesArray.indexOf("entity.other.attribute-name.html") !== -1
    ) {
      return true;
    }
    if (!this.hasTagScope(scopes)) {
      return false;
    }

    // autocomplete here: <tag |>
    // not here: <tag >|
    return scopes.indexOf("punctuation.definition.tag.end.html") !== -1 &&
      previousScopesArray.indexOf("punctuation.definition.tag.end.html") === -1;
  },

  isAttributeValueStart({ scopeDescriptor, bufferPosition, editor }) {
    const scopes = scopeDescriptor.getScopesArray();

    const previousBufferPosition = [
      bufferPosition.row,
      Math.max(0, bufferPosition.column - 1)
    ];
    const previousScopes = editor.scopeDescriptorForBufferPosition(
      previousBufferPosition
    );
    const previousScopesArray = previousScopes.getScopesArray();

    // autocomplete here: attribute="|"
    // not here: attribute=|""
    // or here: attribute=""|
    // or here: attribute="""|
    return this.hasStringScope(scopes) &&
      this.hasStringScope(previousScopesArray) &&
      previousScopesArray.indexOf("punctuation.definition.string.end.html") ===
        -1 &&
      this.hasTagScope(scopes) &&
      this.getPreviousAttribute(editor, bufferPosition) != null;
  },

  hasTagScope(scopes) {
    return scopes.indexOf("meta.tag.any.html") !== -1 ||
      scopes.indexOf("meta.tag.other.html") !== -1 ||
      scopes.indexOf("meta.tag.block.any.html") !== -1 ||
      scopes.indexOf("meta.tag.inline.any.html") !== -1 ||
      scopes.indexOf("meta.tag.structure.any.html") !== -1;
  },

  hasStringScope(scopes) {
    return scopes.indexOf("string.quoted.double.html") !== -1 ||
      scopes.indexOf("string.quoted.single.html") !== -1;
  },

  getTagNameCompletions({ prefix, editor, bufferPosition }) {
    // autocomplete-plus's default prefix setting does not capture <. Manually check for it.
    const ignorePrefix = editor.getTextInRange([
      [bufferPosition.row, bufferPosition.column - 1],
      bufferPosition
    ]) === "<";

    const completions = [];
    for (let tag in this.completions.tags) {
      const options = this.completions.tags[tag];
      if (ignorePrefix || firstCharsEqual(tag, prefix)) {
        completions.push(this.buildTagCompletion(tag, options));
      }
    }
    return completions;
  },

  buildTagCompletion(tag, { description }) {
    return {
      text: tag,
      type: "tag",
      description: description != null ? description : `HTML <${tag}> tag`,
      descriptionMoreURL: description ? this.getTagDocsURL(tag) : null
    };
  },

  getAttributeNameCompletions({ prefix, editor, bufferPosition }) {
    const completions = [];
    const tag = this.getPreviousTag(editor, bufferPosition);
    const tagAttributes = this.getTagAttributes(tag);

    for (var attribute of Array.from(tagAttributes)) {
      if (!prefix.trim() || firstCharsEqual(attribute, prefix)) {
        completions.push(
          this.buildLocalAttributeCompletion(
            attribute,
            tag,
            this.completions.attributes[attribute]
          )
        );
      }
    }

    for (attribute in this.completions.attributes) {
      const options = this.completions.attributes[attribute];
      if (!prefix.trim() || firstCharsEqual(attribute, prefix)) {
        if (options.global) {
          completions.push(
            this.buildGlobalAttributeCompletion(attribute, options)
          );
        }
      }
    }

    return completions;
  },

  buildLocalAttributeCompletion(attribute, tag, options) {
    return {
      snippet: (options != null ? options.type : undefined) === "flag"
        ? attribute
        : `${attribute}=\"$1\"$0`,
      displayText: attribute,
      type: "attribute",
      rightLabel: `<${tag}>`,
      description: `${attribute} attribute local to <${tag}> tags`,
      descriptionMoreURL: this.getLocalAttributeDocsURL(attribute, tag)
    };
  },

  buildGlobalAttributeCompletion(attribute, { description, type }) {
    return {
      snippet: type === "flag" ? attribute : `${attribute}=\"$1\"$0`,
      displayText: attribute,
      type: "attribute",
      description: description != null
        ? description
        : `Global ${attribute} attribute`,
      descriptionMoreURL: description
        ? this.getGlobalAttributeDocsURL(attribute)
        : null
    };
  },

  getAttributeValueCompletions({ prefix, editor, bufferPosition }) {
    const completions = [];
    const tag = this.getPreviousTag(editor, bufferPosition);
    const attribute = this.getPreviousAttribute(editor, bufferPosition);
    const values = this.getAttributeValues(tag, attribute);
    for (let value of Array.from(values)) {
      if (!prefix || firstCharsEqual(value, prefix)) {
        completions.push(
          this.buildAttributeValueCompletion(tag, attribute, value)
        );
      }
    }

    if (
      completions.length === 0 &&
      (this.completions.attributes[attribute] != null
        ? this.completions.attributes[attribute].type
        : undefined) === "boolean"
    ) {
      completions.push(
        this.buildAttributeValueCompletion(tag, attribute, "true")
      );
      completions.push(
        this.buildAttributeValueCompletion(tag, attribute, "false")
      );
    }

    return completions;
  },

  buildAttributeValueCompletion(tag, attribute, value) {
    if (this.completions.attributes[attribute].global) {
      return {
        text: value,
        type: "value",
        description: `${value} value for global ${attribute} attribute`,
        descriptionMoreURL: this.getGlobalAttributeDocsURL(attribute)
      };
    } else {
      return {
        text: value,
        type: "value",
        rightLabel: `<${tag}>`,
        description: `${value} value for ${attribute} attribute local to <${tag}>`,
        descriptionMoreURL: this.getLocalAttributeDocsURL(attribute, tag)
      };
    }
  },

  getPreviousTag(editor, bufferPosition) {
    let { row } = bufferPosition;
    while (row >= 0) {
      const tag = __guard__(
        tagPattern.exec(editor.lineTextForBufferRow(row)),
        x => x[1]
      );
      if (tag) {
        return tag;
      }
      row--;
    }
  },

  getPreviousAttribute(editor, bufferPosition) {
    // Remove everything until the opening quote (if we're in a string)
    let quoteIndex = bufferPosition.column - 1; // Don't start at the end of the line
    while (quoteIndex) {
      const scopes = editor.scopeDescriptorForBufferPosition([
        bufferPosition.row,
        quoteIndex
      ]);
      const scopesArray = scopes.getScopesArray();
      if (
        !this.hasStringScope(scopesArray) ||
        scopesArray.indexOf("punctuation.definition.string.begin.html") !== -1
      ) {
        break;
      }
      quoteIndex--;
    }

    return __guard__(
      attributePattern.exec(
        editor.getTextInRange([
          [bufferPosition.row, 0],
          [bufferPosition.row, quoteIndex]
        ])
      ),
      x => x[1]
    );
  },

  getAttributeValues(tag, attribute) {
    // Some local attributes are valid for multiple tags but have different attribute values
    // To differentiate them, they are identified in the completions file as tag/attribute
    let left;
    return (left = (this.completions.attributes[attribute] != null
      ? this.completions.attributes[attribute].attribOption
      : undefined) != null
      ? this.completions.attributes[attribute] != null
          ? this.completions.attributes[attribute].attribOption
          : undefined
      : this.completions.attributes[`${tag}/${attribute}`] != null
          ? this.completions.attributes[`${tag}/${attribute}`].attribOption
          : undefined) != null
      ? left
      : [];
  },

  getTagAttributes(tag) {
    return (this.completions.tags[tag] != null
      ? this.completions.tags[tag].attributes
      : undefined) != null
      ? this.completions.tags[tag] != null
          ? this.completions.tags[tag].attributes
          : undefined
      : [];
  },

  getTagDocsURL(tag) {
    return `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${tag}`;
  },

  getLocalAttributeDocsURL(attribute, tag) {
    return `${this.getTagDocsURL(tag)}#attr-${attribute}`;
  },

  getGlobalAttributeDocsURL(attribute) {
    return `https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/${attribute}`;
  }
};

var firstCharsEqual = (str1, str2) =>
  str1[0].toLowerCase() === str2[0].toLowerCase();
function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}
