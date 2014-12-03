var BoxesTouch = {
    /**
     * Sets up the given jQuery collection as the drawing area(s).
     */
    setDrawingArea: function(jQueryElements) {
        // Set up any pre-existing box elements for touch behavior.
        jQueryElements
            .addClass("drawing-area")

        // Event handler setup must be low-level because jQuery
        // doesn't relay touch-specific event properties.
        .each(function(index, element) {
            element.addEventListener("touchmove", BoxesTouch.trackDrag, false);
            element.addEventListener("touchend", BoxesTouch.endDrag, false);
        })

        .find("div.box").each(function(index, element) {
            element.addEventListener("touchstart", BoxesTouch.startMove, false);
            element.addEventListener("touchend", BoxesTouch.unhighlight, false);
        });

        $('#create-box').bind('click', function() {
            var newBox = $('#box-template').clone();
            newBox.removeClass('hidden');

            // Give the new box random dimensions as well as
            // a random place the in drawing area
            BoxesTouch.setRandomDimensions(newBox);
            BoxesTouch.randomlyPlace(newBox);

            // Border color, originally green to indicate that it is a new box,
            // goes back to black
            setTimeout(function() {
                newBox.css('border-color', 'black');
            }, 1000);
            $("#drawing-area").append(newBox);
            jQueryElements.find("#box-template").each(function(index, element) {
                element.addEventListener("touchstart", BoxesTouch.startMove, false);
                element.addEventListener("touchend", BoxesTouch.unhighlight, false);
            });
        });

    },

    /**
     * Give random dimensions to the box.
     */
    setRandomDimensions: function(box) {
        // always ensure that the box is at least 25px by 25px so
        // it is never too small
        box.css("width", (Math.random() * 100 + 25) + "px");
        box.css("height", (Math.random() * 100 + 25) + "px");
    },

    /**
     * Randomly place the box in the drawing area
     */
    randomlyPlace: function(box) {
        box.css("left", (Math.random() * 400) + "px");
        box.css("top", (Math.random() * 400) + "px");
    },

    /**
     * Tracks a box as it is rubberbanded or moved across the drawing area.
     */
    trackDrag: function(event) {
        $.each(event.changedTouches, function(index, touch) {
            // Don't bother if we aren't tracking anything.
            if (touch.target.movingBox) {
                // Reposition the object.
                touch.target.movingBox.offset({
                    left: touch.pageX - touch.target.deltaX,
                    top: touch.pageY - touch.target.deltaY
                });
            }
        });

        // Don't do any touch scrolling.
        event.preventDefault();
    },


    /**
     * Concludes a drawing or moving sequence.
     */
    endDrag: function(event) {
        $.each(event.changedTouches, function(index, touch) {
            console.log(touch.target.movingBox);
            if (touch.target.movingBox) {
                if (BoxesTouch.isInTrash(touch)) {
                    BoxesTouch.removeBox(touch.target.movingBox);
                }

                // Change state to "not-moving-anything" by clearing out
                // touch.target.movingBox.
                touch.target.movingBox = null;
            }
        });
    },

    /**
     * Indicates that the box has been dragged to the trash glyphicon.
     */
    isInTrash: function(touch) {
        //Check to see if the touch is roughly overlaying the trash glyphicon.
        return (touch.pageX < 100 && touch.pageY > 50 && touch.pageY < 150);
    },

    /**
    * Delete the box from the page.
    */
    removeBox: function(box) {
        //Add an animation and color when deleting the box
        box.css('border-color', 'red');
        box.addClass('animated zoomOut');

        //Give the animation time to complete before
        //permanently deleting the box
        setTimeout(function() {
            box.remove();
        }, 1000);
    },

    /**
     * Indicates that an element is unhighlighted.
     */
    unhighlight: function() {
        $(this).removeClass("box-highlight");
    },

    /**
     * Begins a box move sequence.
     */
    startMove: function(event) {
        $.each(event.changedTouches, function(index, touch) {
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
