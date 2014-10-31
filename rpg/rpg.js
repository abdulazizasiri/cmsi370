$(function() {

    window.onload = $.getJSON(
        "http://lmu-diabolical.appspot.com/characters",
        function (characters) {
            console.log("initial GET of characters " + JSON.stringify(characters));
            $("tbody").append(characters.map(function (character) {

                var filledInTemplate = fillInCharacterInfo('.character-template', character);

                filledInTemplate.find(".edit").bind("click", function(){
                    showEditCharacterModal(character);
                });

                filledInTemplate.find(".delete").bind("click", function(){
                    showDeleteCharacterModal(character);
                });
                return filledInTemplate;
            }));
        }
    );

    var showDeleteCharacterModal = function(character) {
        BootstrapDialog.show({
            message: 'Are you sure you want to delete this character?',
            buttons: [{
                type: BootstrapDialog.TYPE_DANGER,
                icon: 'glyphicon glyphicon-remove',
                label: 'Delete',
                cssClass: 'btn-danger',
                autospin: true,
                action: function(dialogRef){
                    dialogRef.getModalBody().html('Deleting...');
                    $.ajax({
                        type: 'DELETE',
                        url: "http://lmu-diabolical.appspot.com/characters/" + character.id,
                        success: function (data, textStatus, jqXHR) {
                            dialogRef.close();
                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_SUCCESS,
                                title: "Success!",
                                message: "Successfully deleted the character."
                            })
                        }
                    })

                    setTimeout(function(){
                        dialogRef.close();
                    }, 3000);
                }
                },
                {
                    label: 'Close',
                    action: function(dialogRef){
                    dialogRef.close();
                }
            }]
        });
    }

    var showEditCharacterModal = function(character) {
        var template = configureTemplateForGender(character);
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DEFAULT,
            title: 'Edit Character: ' + character.name,
            message: template,
            buttons: [
            {
                label: 'Change Character',
                cssClass: 'btn-warning',
                action: function(dialogueItself){
                    changeCharacter({
                        character: character,
                        nameInput: $(template).find("#name-change").val(),
                        classInput: $(template).find("#class-change").val(),
                        genderInput: $(template).find("#gender-change").val(),
                        levelInput: $(template).find("#level-change").val()
                    }, dialogueItself);
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

    var changeCharacter = function(opts, editCharacterModal){
        var updatedCharacterFields = {
            id: opts.character.id,
            name: opts.nameInput || opts.character.name,
            classType: opts.classInput || opts.character.classType,
            gender: opts.genderInput || opts.character.gender,
            level: opts.levelInput || opts.character.level
        }

        editCharacterModal.close();
        BootstrapDialog.show({
            message: 'Are you sure you want to edit this character?',
            buttons: [{
                type: BootstrapDialog.TYPE_SUCCESS,
                icon: 'glyphicon glyphicon-pencil',
                label: 'Edit',
                cssClass: 'btn-success',
                autospin: true,
                action: function(dialogRef){
                    dialogRef.getModalBody().html('Sending...');
                    setTimeout(function(){
                        dialogRef.close();
                    }, 5000);
                    $.ajax({
                        type: 'PUT',
                        url: "http://lmu-diabolical.appspot.com/characters/" + opts.character.id,
                        data: JSON.stringify(updatedCharacterFields),
                        contentType: "application/json",
                        dataType: "json",
                        accept: "application/json",
                        success: function (data, textStatus, jqXHR) {
                            dialogRef.close();
                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_SUCCESS,
                                title: "Success!",
                                message: "Successfully edited the character."
                            })
                        }
                    });
                }
                },
                {
                    label: 'Close',
                    action: function(dialogRef){
                    dialogRef.close();
                }
            }]
        });
    };


    var configureTemplateForGender = function(character){
        var nameOfSelector = "." + character.gender.toLowerCase() + "-character-template";
        var entireCharacterModal = $(nameOfSelector).clone();
        return fillInCharacterInfo(entireCharacterModal, character);
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