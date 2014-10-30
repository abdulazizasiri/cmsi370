$(function() {

    window.onload = $.getJSON(
        "http://lmu-diabolical.appspot.com/characters",
        function (characters) {
            console.log("initial GET of characters " + JSON.stringify(characters));
            $("tbody").append(characters.map(function (character) {
                var filledInTemplate = fillInCharacterInfo(".character-template", character);

                filledInTemplate.find(".edit").bind("click", function(){
                    showCharacterModal(character);
                });

                filledInTemplate.find(".delete").bind("click", function(){
                    showDeleteCharacterModal(character);
                });
                return filledInTemplate;
            }));
        }
    );

    var showCharacterModal = function(character) {
        var filledInTemplate = ".character-template-" + character.gender.toLowerCase();
        filledInTemplate = $(filledInTemplate).clone();
        filledInTemplate.find(".name").text(character.name);
        filledInTemplate.find(".class").text(character.classType);
        filledInTemplate.find(".gender").text(character.gender.toLowerCase());
        filledInTemplate.find(".level").text(character.level);
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DEFAULT,
            title: 'Edit Character: ' + character.name,
            message: $(filledInTemplate),
            buttons: [
            {
                label: 'Change Character',
                cssClass: 'btn-warning',
                action: function(){
                    var answer = confirm("Are you sure you want to change character " + character.name + "?");
                    if (answer){
                        var nameInput = $("#name-change").val();
                        var classInput = $("#class-change").val();
                        var genderInput = $("#gender-change").val();
                        var levelInput = $("#level-change").val();
                        console.log(nameInput + classInput + genderInput + levelInput);
                        changeCharacter({
                            character: character,
                            nameInput: nameInput,
                            classInput: classInput,
                            genderInput: genderInput,
                            levelInput: levelInput
                        });
                    }
                }
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

    var changeCharacter = function(opts){
        var updatedCharacterFields = {
            id: opts.character.id,
            name: opts.nameInput || opts.character.name,
            classType: opts.classInput || opts.character.classType,
            gender: opts.genderInput || opts.character.gender,
            level: opts.levelInput || opts.character.level
        }
        $.ajax({
            type: 'PUT',
            url: "http://lmu-diabolical.appspot.com/characters/" + opts.character.id,
            data: JSON.stringify(updatedCharacterFields),
            contentType: "application/json",
            dataType: "json",
            accept: "application/json",
            success: function (data, textStatus, jqXHR) {
                console.log("Done: no news is good news.");
            }
        });
    }


    // var configureTemplateForGender = function(character){
    //     var genderSpecificTemplate = ".character-template-" + character.gender.toLowerCase();
    //     genderSpecificTemplate = fillInCharacterInfo(genderSpecificTemplate, character);
    //     var generalGenderTemplate = $(".edit-character-template").find(".general-gender-template");
    //     return $(generalGenderTemplate).replaceWith( $(genderSpecificTemplate) );
    // }


    var fillInCharacterInfo = function(template, character) {
        var filledInTemplate = $(template).clone();
        filledInTemplate.find(".name").text(character.name);
        filledInTemplate.find(".class").text(character.classType);
        filledInTemplate.find(".gender").text(character.gender.toLowerCase());
        filledInTemplate.find(".level").text(character.level);
        return filledInTemplate;
    }

});
