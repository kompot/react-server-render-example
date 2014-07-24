var bem = {
  className: function(block, element, modifierKey, modifierValue) {
    return block
        + (element ?     '__' + element : '')
        + (modifierKey ? '_' + modifierKey + '_' + modifierValue : '');
  }
};

module.exports = bem;
