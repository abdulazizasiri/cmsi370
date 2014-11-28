(function(root, factory) {
  if (typeof exports === 'object') {
     module.exports = factory(require('jquery'));
  } else if (typeof root.define === 'function' && root.define.amd) {
    define(['jquery'], factory);
  } else {
    factory(root.jQuery || root.Zepto);
  }
}(this,
function($) {
  var CellFactory = {
    createFrom: function($cell) {
      var position = $cell.position();

      return {
        leftPosition: $cell.position().left,
        topPosition: $cell.position().top,
        $cell: $cell
      };
    }
  };


  var CellTable = function($nodes) {
    this.table = this.buildTable($nodes);
    this.rows = this.buildRows();
    this.columns = this.buildColumns();
  };

  CellTable.prototype = {
    buildTable: function($nodes) {
      return $nodes.map(function() {
        return CellFactory.createFrom($(this));
      });
    },

    buildColumns: function() {
      var columns = {},
          self = this;

      $.each(this.table, function(index, cell) {
        columns[cell.leftPosition] = self.getColumnElements(cell);
      });

      return columns;
    },

    buildRows: function() {
      var rows = {},
          self = this;

      $.each(this.table, function(i, cell) {
        rows[cell.topPosition] = self.getRowElements(cell);
      });

      return rows;
    },

    getRowElements: function(compareCell) {
      var self = this;

      return $.map(this.table, function(cell) {
        if (self.isSameRow(cell, compareCell)) {
          return cell;
        }

        return null;
      });
    },

    getColumnElements: function(compareCell) {
      var self = this;

      return $.map(this.table, function(cell) {
        if (self.isSameColumn(cell, compareCell)) {
          return cell;
        }

        return null;
      });
    },

    getCurrent: function($cell) {
      var cell = CellFactory.createFrom($cell);

      return this.findPosition(
        this.getCell(cell)
      );
    },

    isSameColumn: function(cell, compareCell) {
      if (!compareCell) {
        throw 'cell';
      }

      return cell.leftPosition === compareCell.leftPosition;
    },

    isSameRow: function(cell, compareCell) {
      return cell.topPosition === compareCell.topPosition;
    },

    isSame: function(cell, compareCell) {
      return this.isSameColumn(cell, compareCell) && this.isSameRow(cell, compareCell);
    },

    getCell: function(cell) {
      var self = this;
      return $.map(this.table, function(compareCell) {
        if (self.isSame(cell, compareCell)) {
          return compareCell;
        }

        return null;
      })[0];
    },

    findIndex: function(array, callback) {
      var index = 0,
          len = array.length;

      for (; index < len; index++) {
        if (callback(array[index])) {
          return index;
        }
      }

      return index;
    },

    findPosition: function(cell) {
      var colCells = this.getColumnElements(cell),
          rowCells = this.getRowElements(cell),

          rowIndex = this.findIndex(colCells, function(colCell) {
            return colCell.topPosition == cell.topPosition;
          }),

          colIndex = this.findIndex(rowCells, function(rowCell) {
            return rowCell.leftPosition == cell.leftPosition;
          });

      return {
        colIndex: colIndex,
        rowIndex: rowIndex
      };
    }
  };

 var keyMappings = {
    37: 'left_arrow',
    38: 'up_arrow',
    39: 'right_arrow',
    40: 'down_arrow',
  };

  var DirectionalPad = function($nodes)  {
    this.options = this.defaults;

    this.$nodes = $nodes;
    this.$parent = $nodes.parent()

    if (this.defaults.removeOutline) {
      this.$parent.css({ outline: 'none' });
    }

    if (!this.$parent.attr('tabindex')) {
      this.$parent.attr({ tabindex: this.defaults.tabindex || -1 });
    }
  };

  DirectionalPad.keys = keyMappings;

  DirectionalPad.prototype = {
    defaults: {
      cycle: true,
      activateOn: 'click',
      parentFocusOn: 'click',
      activeClass: 'active',
      removeOutline: true,
      keys: {
        up_arrow: 'up',
        down_arrow: 'down',
        left_arrow: 'left',
        right_arrow: 'right'
      },
      onBeforeActive: $.noop,
      onAfterActive: $.noop
    },

    move: function(info) {
      var cells = info.cells[info.cellPosition],
          next = cells[info.index];

      // Enable cycling when at beginning or end of row/column
      if (!next){
        next = cells[info.firstIndex ? 0 : cells.length - 1];
      }

      this.setActive(next.$cell);
    },

    down: function($cell, cellIndex) {
      this.move({
        cellPosition: ($cell).position().left,
        index: cellIndex.rowIndex + 1,
        cells: this.cellTable.columns,
        firstIndex: true
      });
    },

    up: function($cell, cellIndex) {
      this.move({
        cellPosition: ($cell).position().left,
        index: cellIndex.rowIndex - 1,
        cells: this.cellTable.columns
      });
    },

    left: function($cell, cellIndex) {
      this.move({
        cellPosition: ($cell).position().top,
        index: cellIndex.colIndex - 1,
        cells: this.cellTable.rows
      });
    },

    right: function($cell, cellIndex) {
      this.move({
        cellPosition: ($cell).position().top,
        index: cellIndex.colIndex + 1,
        cells: this.cellTable.rows,
        firstIndex: true
      });
    },

    handleKeyDown: function(event) {
      var fn = this.options.keys[DirectionalPad.keys[event.which]];

      // return when key pressed is not an arrow key
      if (!fn) { return; }

      // prevent default scrolling
      event.preventDefault();

      // find the current selected cell
      var $selected = this.$parent.find('.' + this.options.activeClass);
      var cell = this.cellTable.getCurrent($selected);

      // apply the function that corresponds to the arrow key pressed
      return this[fn].apply(this, [$selected, cell, event]);
    },

    onBeforeActive: function($cell) {
      return this.options.onBeforeActive.apply(this, [$cell]);
    },

    onAfterActive: function($cell) {
      return this.options.onAfterActive.apply(this, [$cell]);
    },

    setActive: function($cell) {
      var result = this.onBeforeActive($cell);
      if (result !== false) {
        this.$nodes.removeClass(this.options.activeClass);
        $cell.addClass(this.options.activeClass);
      }

      this.onAfterActive($cell);
    },

    reBuild: function() {

      var $parent = this.$parent,
          self = this;

      $parent
          .off('keydown')
          .off(this.options.parentFocusOn)
          .on('keydown', $.proxy(this.handleKeyDown, this))
          .on(this.options.parentFocusOn, function() {
            $parent.focus();
          });


      var $noneWatchedNodes = this.$nodes.filter(function() {
        return !$(this).attr('dpad-watched');
      });

      $noneWatchedNodes
          .attr('dpad-watched', true)
          .on(this.options.activateOn, function() {
            self.setActive($(this));
          });


      this.cellTable = new CellTable(this.$nodes);
    }
  };

  $.fn.dpad = function(options) {
    var dpad = new DirectionalPad(this);

    dpad.reBuild();

    return $.extend(this, {
      dpad: dpad
    });
  };
  return $;

}));