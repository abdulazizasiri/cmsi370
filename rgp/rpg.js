$(function() {
    $.getJSON(
        "http://lmu-diabolical.appspot.com/characters",
        function (characters) {
            $("tbody").append(characters.map(function (character) {
    /*
                return $("<tr></tr>")
                    .append($("<td></td>")
                        .append($("<img/>")
                            .attr({ src: "http://icons.iconarchive.com/icons/hopstarter/superhero-avatar/256/Avengers-Black-Widow-icon.png" })
                            .height(24)))
                    .append($("<td></td>").text(character.name))
                    .append($("<td></td>").text(character.classType))
                    .append($("<td></td>").text(character.gender))
                    .append($("<td></td>").text(character.level));
    */
                var tr = $(".character-template").clone();
                tr.find(".name").text(character.name);
                tr.find(".class").text(character.classType);
                tr.find(".gender").text(character.gender);
                tr.find(".level").text(character.level);
                return tr;
            }));
        }
    );
})

