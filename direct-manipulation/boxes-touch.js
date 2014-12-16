var BoxesTouch = {
    /**
     * Sets up the given jQuery collection as the drawing area(s).
     */
    setDrawingArea: function (jQueryElements) {
        jQueryElements
            .addClass("drawing-area")

            // Event handler setup must be low-level because jQuery
            // doesn't relay touch-specific event properties.
            .each(function (index, element) {
                element.drawingBoxes = [];
                element.addEventListener("touchstart", BoxesTouch.startDraw, false);
                element.addEventListener("touchmove", BoxesTouch.trackDrag, false);
                element.addEventListener("touchend", BoxesTouch.endDrag, false);
            })

            .find("div.box").each(function (index, element) {
                element.addEventListener("touchstart", BoxesTouch.startMove, false);
                element.addEventListener("touchend", BoxesTouch.unhighlight, false);
            });
    },

    /**
     * Tracks a box as it is rubberbanded or moved across the drawing area.
     */
    trackDrag: function (event) {
        $.each(event.changedTouches, function (index, touch) {
            if (touch.target.movingBox) {
                touch.target.movingBox.offset({
                    left: touch.pageX - touch.target.deltaX,
                    top: touch.pageY - touch.target.deltaY
                });
                if (BoxesTouch.isOutOfDrawingArea(touch)) {
                    touch.target.movingBox.css("border-color", "red");
                } else {
                    touch.target.movingBox.css("border-color", "black");
                }
            } else {
                touch.target.drawingBoxes[touch.identifier]
                    .offset({
                        left: (touch.target.drawingBoxes[touch.identifier].anchorX < touch.pageX) ?
                            touch.target.drawingBoxes[touch.identifier].anchorX : touch.pageX,
                        top: (touch.target.drawingBoxes[touch.identifier].anchorY < touch.pageY) ?
                            touch.target.drawingBoxes[touch.identifier].anchorY : touch.pageY
                    })
                    .width(Math.abs(touch.pageX - touch.target.drawingBoxes[touch.identifier].anchorX))
                    .height(Math.abs(touch.pageY - touch.target.drawingBoxes[touch.identifier].anchorY));
            }
        });

        event.preventDefault();
    },

    /**
     * Indicates that the box has been dragged outside of drawing area.
     */
    isOutOfDrawingArea: function (touch) {
        return (touch.pageX > 512 || touch.pageY > 512);
    },

    /**
     * Concludes a drawing or moving sequence.
     */
    endDrag: function (event) {
        $.each(event.changedTouches, function (index, touch) {
            if (touch.target.movingBox) {
                if (BoxesTouch.isOutOfDrawingArea(touch)){
                    BoxesTouch.removeBox(touch.target.movingBox);
                }
            } else {
                touch.target.drawingBoxes[touch.identifier].each(function (index, element) {
                    element.addEventListener("touchstart", BoxesTouch.startMove, false);
                    element.addEventListener("touchend", BoxesTouch.unhighlight, false);
                });

                touch.target.drawingBoxes[touch.identifier] = null;
            }
        });
    },

    removeBox: function (box) {
        //Add an animation when deleting the box
        box.addClass('animated zoomOut');

        //Give the animation time to complete before
        //permanently deleting the box
        setTimeout(function () {
            box.remove();
        }, 1000);
    },

    /**
     * Indicates that an element is unhighlighted.
     */
    unhighlight: function () {
        $(this).removeClass("box-highlight");
    },

    /**
     * Indicates the start of the creation of a new box
     */
    startDraw: function (event) {
        $.each(event.changedTouches, function (index, touch) {
            touch.target.drawingBoxes[touch.identifier] = $("<div></div>")
                .appendTo(touch.target)
                .addClass("box")
                .offset({
                    left: touch.pageX,
                    top: touch.pageY
                });
            touch.target.drawingBoxes[touch.identifier].anchorX = touch.pageX;
            touch.target.drawingBoxes[touch.identifier].anchorY = touch.pageY;
        });
        event.stopPropagation();
    },

    /**
     * Begins a box move sequence.
     */
    startMove: function (event) {
        $.each(event.changedTouches, function (index, touch) {

            // Highlight the element.
            $(touch.target).addClass("box-highlight");

            // Take note of the box's current (global) location.
            var jThis = $(touch.target),
                startOffset = jThis.offset();

            // Set the drawing area's state to indicate that it is
            // in the middle of a move.
            touch.target.movingBox = jThis;
            touch.target.deltaX = touch.pageX - startOffset.left;
            touch.target.deltaY = touch.pageY - startOffset.top;
        });

        // Eat up the event so that the drawing area does not
        // deal with it.
        event.stopPropagation();
    }

};
