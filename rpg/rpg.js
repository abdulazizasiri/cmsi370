$(function() {

    $.getJSON(
        "http://lmu-diabolical.appspot.com/characters",
        function (characters) {
            console.log("initial GET with characters " + JSON.stringify(characters));
            $("tbody").append(characters.map(function (character) {
                var filledInTemplate = fillInCharacterInfo(".character-template", character);
                filledInTemplate.find(".edit").bind("click", function(){
                    showEditCharacterModal(character);
                });
                filledInTemplate.find(".delete").bind("click", function(){
                    showDeleteCharacterModal(character);
                })
                return filledInTemplate;
            }));
        }
    );

    var showEditCharacterModal = function(character) {
        var genderIcon = ".character-icon-" + character.gender.toLowerCase();
        console.log("gender icon " + genderIcon);
        var filledInTemplate = fillInCharacterInfo(genderIcon, character)
        templateWithIcon = $(".character-icon").add($(filledInTemplate));
        $(".edit-character-template").find(".character-icon").replaceWith( $(templateWithIcon) );
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_INFO,
            title: 'Edit Character ' + character.name,
            message: $(".edit-character-template"),
            buttons: [{
                label: 'Cancel',
                cssClass: 'btn-danger',
                action: function(dialogueItself){
                    dialogueItself.close();
                }
            }]
        })
    }

    var fillInCharacterInfo = function(template, character) {
        var filledInTemplate = $(template).clone();
        filledInTemplate.find(".name").text(character.name);
        filledInTemplate.find(".class").text(character.classType);
        filledInTemplate.find(".gender").text(character.gender.toLowerCase());
        filledInTemplate.find(".level").text(character.level);
        return filledInTemplate;
    }

});
