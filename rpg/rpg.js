$(function() {

    $.getJSON(
        "http://lmu-diabolical.appspot.com/characters",
        function (characters) {
            console.log("initial GET with characters " + JSON.stringify(characters));
            $("tbody").append(characters.map(function (character) {
                var filledInTemplate = fillInTemplate(template, character);
                filledInTemplate.find(".edit").bind("click", function(){
                    showEditCharacterModal(character);
                });
                filledInTemplate.find(".delete").bind("click", function(){
                    showDeleteCharacterModal(character);
                })
                return tr;
            }));
        }
    );

    var fillInTemplate = function(template, character) {
        var filledInTemplate = $(template).clone();
        filledInTemplate.find(".name").text(character.name);
        filledInTemplate.find(".class").text(character.classType);
        filledInTemplate.find(".gender").text(character.gender);
        filledInTemplate.find(".level").text(character.level);
        return filledInTemplate;
    }

    var showEditCharacterModal = function(character) {
        genderSpecificTemplate = ".edit-character-template-male"
        // genderSpecificTemplate = ".edit-character-template-" + character.gender.toLowerCase();
        var filledOutTemplate = fillInTemplate(genderSpecificTemplate, character);
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_INFO,
            title: 'Edit Character ' + character.name,
            message: $(filledOutTemplate),
            buttons: [
                {
                label: 'Save All Changes',
                cssClass: 'btn-success',
                // action: saveNewInfo()
                },
                {
                label: 'Cancel',
                cssClass: 'btn-danger',
                action: function(dialogueItself){
                    dialogueItself.close();
                }
            }]
        })
    }

    $("#change-name").click
});
